// Demo-account seed script for Credo.
//
// Creates a realistic ~8-week-old demo account (demo@credo.app / Alex Morgan)
// with training history, benchmarks, scores, and pillar data so the app has
// something worth looking at out of the box.
//
// Idempotent: re-running deletes the existing demo@credo.app user (which
// cascades to every child row via the schema's onDelete: Cascade relations)
// and recreates it from scratch.
//
// Prerequisite: `npm run prisma:seed` (prisma/seed.ts) should have already
// seeded the Exercise + StrengthStandard reference tables — but this script
// also upserts the specific Exercise rows it references, so it is safe to
// run standalone against a fresh, empty database too.
//
// Run with: npx tsx prisma/seed-demo.ts   (aliased as `npm run seed:demo`)
// NOT executed in this environment — there is no live Postgres here. This
// script is written to typecheck cleanly and run correctly against a real
// DATABASE_URL later.

import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import {
  EXERCISES_BY_ID,
} from "../src/services/data/exercise-library";
import { CREDO_TEN, lookupBenchmarkPercentile } from "../src/services/data/benchmarks";
import {
  calculateCredoScore,
  calculateStrengthScore,
  epley1RM,
  fatigueLevelFor,
  recoveryWindowHours,
} from "../src/services/ai";
import type {
  Difficulty,
  ExerciseDefinition,
  ExerciseHistoryEntry,
  MuscleGroup,
  Sex,
  SplitDay,
  UserProfileInput,
} from "../src/lib/types";

const prisma = new PrismaClient();

// ── Demo account identity ────────────────────────────────────────────────

const DEMO_EMAIL = "demo@credo.app";
const DEMO_PASSWORD = "CredoDemo2026!";
const DEMO_NAME = "Alex Morgan";

const PROFILE: UserProfileInput = {
  age: 38,
  sex: "male",
  weight: 185,
  heightIn: 71,
  experienceLevel: "intermediate",
};
const PROFILE_SEX: Sex = "male";
const PROFILE_AGE = 38;
const PROFILE_EXPERIENCE: Difficulty = "intermediate";

// Fixed "now" for this run — every relative date is computed from it so the
// seeded history always lands correctly relative to whenever this is run.
const NOW = new Date();

// ── Date helpers ─────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function daysAgo(n: number, base: Date = NOW): Date {
  return new Date(base.getTime() - n * DAY_MS);
}

// ── Exercise lookup helper — fails loudly on an unknown id ─────────────────

function assertExercise(id: string): ExerciseDefinition {
  const def = EXERCISES_BY_ID.get(id);
  if (!def) {
    throw new Error(`seed-demo: exercise id "${id}" not found in EXERCISE_LIBRARY`);
  }
  return def;
}

// ── Training-day templates ──────────────────────────────────────────────
// A 3-day Push/Pull/Legs rotation. `startWeight`/`weightPerWeekBlock` model
// gradual progressive overload: the working weight bumps up once every two
// weeks (a "block"). Bodyweight moves use weight 0 (no load) throughout.

interface ExercisePlan {
  exerciseId: string;
  sets: number;
  repRange: [number, number];
  startWeight: number;
  weightPerWeekBlock: number;
  /** Flags the session's key barbell lift — drives 1RM / PR tracking. */
  isMain?: boolean;
}

interface DayTemplate {
  label: string;
  focus: string;
  exercises: ExercisePlan[];
}

const PUSH_DAY: ExercisePlan[] = [
  { exerciseId: "bench-press", sets: 4, repRange: [6, 8], startWeight: 155, weightPerWeekBlock: 5, isMain: true },
  { exerciseId: "overhead-press", sets: 3, repRange: [6, 8], startWeight: 90, weightPerWeekBlock: 2.5 },
  { exerciseId: "incline-db-press", sets: 3, repRange: [8, 10], startWeight: 55, weightPerWeekBlock: 2.5 },
  { exerciseId: "lateral-raise", sets: 3, repRange: [12, 15], startWeight: 15, weightPerWeekBlock: 0 },
  { exerciseId: "chest-dip", sets: 3, repRange: [8, 12], startWeight: 0, weightPerWeekBlock: 0 },
];

const PULL_DAY: ExercisePlan[] = [
  { exerciseId: "barbell-row", sets: 4, repRange: [6, 8], startWeight: 135, weightPerWeekBlock: 5, isMain: true },
  { exerciseId: "weighted-pull-up", sets: 3, repRange: [5, 8], startWeight: 10, weightPerWeekBlock: 2.5 },
  { exerciseId: "lat-pulldown", sets: 3, repRange: [8, 10], startWeight: 120, weightPerWeekBlock: 5 },
  { exerciseId: "face-pull", sets: 3, repRange: [12, 15], startWeight: 40, weightPerWeekBlock: 0 },
  { exerciseId: "hanging-knee-raise", sets: 3, repRange: [10, 15], startWeight: 0, weightPerWeekBlock: 0 },
];

const LEGS_DAY: ExercisePlan[] = [
  { exerciseId: "back-squat", sets: 4, repRange: [5, 8], startWeight: 205, weightPerWeekBlock: 5, isMain: true },
  { exerciseId: "romanian-deadlift", sets: 3, repRange: [8, 10], startWeight: 155, weightPerWeekBlock: 5 },
  { exerciseId: "leg-press", sets: 3, repRange: [10, 12], startWeight: 270, weightPerWeekBlock: 10 },
  { exerciseId: "walking-lunge", sets: 3, repRange: [10, 12], startWeight: 30, weightPerWeekBlock: 2.5 },
  { exerciseId: "calf-raise", sets: 3, repRange: [12, 15], startWeight: 90, weightPerWeekBlock: 5 },
];

const DAY_ROTATION: DayTemplate[] = [
  { label: "Push", focus: "Upper Push", exercises: PUSH_DAY },
  { label: "Pull", focus: "Upper Pull", exercises: PULL_DAY },
  { label: "Legs", focus: "Lower Body", exercises: LEGS_DAY },
];

const REQUIRED_EXERCISE_IDS = [
  ...new Set(DAY_ROTATION.flatMap((day) => day.exercises.map((e) => e.exerciseId))),
];

const WEEKS = 8;
const SESSIONS_PER_WEEK = 3;
const TOTAL_SESSIONS = WEEKS * SESSIONS_PER_WEEK; // 24

// ── Reset + Exercise upsert ─────────────────────────────────────────────

async function resetDemoUser(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    // Every child model FKs to User with onDelete: Cascade, so this clears
    // the full tree (workouts, logs, scores, benchmarks, splits, ...).
    await prisma.user.delete({ where: { id: existing.id } });
  }
}

/** Lazily upsert the Exercise rows this script's plans reference. */
async function ensureExerciseRows(ids: string[]): Promise<void> {
  for (const id of ids) {
    const def = assertExercise(id);
    const data = {
      name: def.name,
      primaryMuscles: def.primaryMuscles as string[],
      secondaryMuscles: def.secondaryMuscles as string[],
      equipment: def.equipment as string[],
      movementPattern: def.movementPattern,
      difficulty: def.difficulty,
      videoUrl: def.videoUrl ?? null,
      thumbnailUrl: def.thumbnailUrl ?? null,
      formCues: def.formCues,
      commonMistakes: def.commonMistakes,
      alternatives: def.alternatives,
    };
    await prisma.exercise.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
}

// ── User + preferences + gym profile ────────────────────────────────────

async function createDemoUser(): Promise<{ id: string }> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  return prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: DEMO_NAME,
      age: PROFILE.age,
      sex: PROFILE.sex,
      weight: PROFILE.weight,
      heightIn: PROFILE.heightIn,
      experienceLevel: PROFILE.experienceLevel,
      trainingGoal: "longevity",
      onboardingCompleted: true,
      proteinTargetG: 148,
      zone2TargetMin: 150,
      createdAt: daysAgo(60),
    },
  });
}

async function createTrainingPreferences(userId: string): Promise<void> {
  await prisma.trainingPreferences.create({
    data: {
      userId,
      goal: "longevity",
      daysPerWeek: 3,
      sessionDuration: 60,
      preferredSplit: "ai_optimized",
      trainingLocation: "commercial_gym",
      availableEquipment: [
        "barbell",
        "dumbbell",
        "cable",
        "machine",
        "bodyweight",
        "bench",
        "rack",
        "pull_up_bar",
      ],
      muscleGroupFocus: [],
      muscleGroupExclude: [],
      enableSupersets: true,
      varietyLevel: "medium",
    },
  });
}

async function createGymProfile(userId: string): Promise<void> {
  await prisma.gymProfile.create({
    data: {
      userId,
      name: "Commercial Gym",
      location: "Downtown Fitness Club",
      equipment: [
        "barbell",
        "dumbbell",
        "kettlebell",
        "cable",
        "machine",
        "bodyweight",
        "bands",
        "pull_up_bar",
        "bench",
        "rack",
      ],
      isDefault: true,
    },
  });
}

// ── Training history (WorkoutPlan + PlannedExercise + ExerciseLog + sets) ──

function buildSessionOffsets(): number[] {
  // Roughly a Mon/Wed/Fri cadence (gaps of 2, 2, 3 days), most recent
  // session landing "yesterday" so today's muscle-recovery state is mixed
  // rather than uniformly fresh.
  const gaps = [2, 2, 3];
  const offsets: number[] = [];
  let cursor = 54;
  for (let i = 0; i < TOTAL_SESSIONS; i++) {
    offsets.push(cursor);
    cursor -= gaps[i % gaps.length];
  }
  return offsets;
}

function weightForWeek(plan: ExercisePlan, weekIndex: number): number {
  const block = Math.floor(weekIndex / 2); // a new block every 2 weeks
  return plan.startWeight + plan.weightPerWeekBlock * block;
}

function repsForSet(setIndex: number, totalSets: number, repRange: [number, number]): number {
  const [min, max] = repRange;
  // Mild fatigue on the final set of a straight-sets session.
  if (setIndex === totalSets && totalSets > 1) return Math.max(min, max - 1);
  return max;
}

function rpeForSet(setIndex: number): number {
  return Math.min(9, 6 + setIndex);
}

interface CompletedSetSeed {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  restDuration: number;
}

interface GeneratedHistory {
  historyEntries: ExerciseHistoryEntry[];
  /** Most recent training touch per primary muscle group. */
  lastTrainedMap: Map<MuscleGroup, { date: Date; sets: number }>;
  /** Best estimated 1RM (+ date achieved) per main lift. */
  mainLift1RM: Map<string, { value: number; date: Date }>;
  personalRecordCount: number;
}

async function generateTrainingHistory(userId: string): Promise<GeneratedHistory> {
  const offsets = buildSessionOffsets();
  const historyEntries: ExerciseHistoryEntry[] = [];
  const lastTrainedMap = new Map<MuscleGroup, { date: Date; sets: number }>();
  const bestByExercise = new Map<string, { value: number; date: Date }>();
  let personalRecordCount = 0;

  for (let i = 0; i < TOTAL_SESSIONS; i++) {
    const dayType = DAY_ROTATION[i % DAY_ROTATION.length];
    const weekIndex = Math.floor(i / SESSIONS_PER_WEEK); // 0..7
    const sessionDate = daysAgo(offsets[i]);

    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        weekNumber: weekIndex + 1,
        dayNumber: (i % SESSIONS_PER_WEEK) + 1,
        totalDays: SESSIONS_PER_WEEK,
        splitType: "push_pull_legs",
        focus: dayType.focus,
        estimatedDuration: 60,
        includesWarmup: true,
        status: "completed",
        scheduledDate: sessionDate,
        createdAt: sessionDate,
        startedAt: sessionDate,
        completedAt: new Date(sessionDate.getTime() + 55 * 60 * 1000),
        exercises: {
          create: dayType.exercises.map((ex, order) => ({
            exerciseId: ex.exerciseId,
            order,
            targetSets: ex.sets,
            targetRepMin: ex.repRange[0],
            targetRepMax: ex.repRange[1],
            recommendedWeight: weightForWeek(ex, weekIndex),
            restPeriod: ex.isMain ? 120 : 75,
            isSuperset: false,
            rationale: ex.isMain
              ? `Primary lift — progressive overload, week ${weekIndex + 1} of ${WEEKS}.`
              : "Accessory volume to support the main lift.",
            isWarmup: false,
          })),
        },
      },
    });

    const muscleTally = new Map<MuscleGroup, number>();

    for (const ex of dayType.exercises) {
      const def = assertExercise(ex.exerciseId);
      const weight = weightForWeek(ex, weekIndex);
      const sets: CompletedSetSeed[] = Array.from({ length: ex.sets }, (_, idx) => {
        const setNumber = idx + 1;
        return {
          setNumber,
          weight,
          reps: repsForSet(setNumber, ex.sets, ex.repRange),
          rpe: rpeForSet(setNumber),
          restDuration: ex.isMain ? 120 : 75,
        };
      });
      const topSet = sets[0];
      const estimated1RM = weight > 0 ? epley1RM(topSet.weight, topSet.reps) : null;
      const avgRpe = sets.reduce((sum, s) => sum + s.rpe, 0) / sets.length;
      const exertionRating = Math.min(5, Math.max(1, Math.round(avgRpe / 2)));

      let isPR = false;
      if (ex.isMain && estimated1RM != null) {
        const prevBest = bestByExercise.get(ex.exerciseId);
        if (prevBest && estimated1RM > prevBest.value) {
          isPR = true;
          personalRecordCount++;
          await prisma.personalRecord.create({
            data: {
              userId,
              exerciseId: ex.exerciseId,
              previous1RM: prevBest.value,
              new1RM: estimated1RM,
              setWeight: weight,
              setReps: topSet.reps,
              date: sessionDate,
            },
          });
        }
        if (!prevBest || estimated1RM > prevBest.value) {
          bestByExercise.set(ex.exerciseId, { value: estimated1RM, date: sessionDate });
        }
      }

      await prisma.exerciseLog.create({
        data: {
          userId,
          exerciseId: ex.exerciseId,
          workoutPlanId: plan.id,
          date: sessionDate,
          estimated1RM,
          exertionRating,
          notes: isPR ? "New PR!" : null,
          sets: { create: sets },
        },
      });

      historyEntries.push({
        exerciseId: ex.exerciseId,
        date: sessionDate.toISOString(),
        sets: sets.map((s) => ({
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          restDuration: s.restDuration,
        })),
        estimated1RM,
      });

      for (const group of def.primaryMuscles) {
        muscleTally.set(group, (muscleTally.get(group) ?? 0) + ex.sets);
      }
    }

    for (const [group, sets] of muscleTally) {
      lastTrainedMap.set(group, { date: sessionDate, sets });
    }
  }

  return { historyEntries, lastTrainedMap, mainLift1RM: bestByExercise, personalRecordCount };
}

// ── Exercise1RM (key lifts) ─────────────────────────────────────────────

async function createExercise1RMRows(
  userId: string,
  mainLift1RM: Map<string, { value: number; date: Date }>,
  hexBarDeadlift: { value: number; date: Date },
): Promise<number> {
  const rows: { exerciseId: string; weight: number; date: Date }[] = [];
  for (const id of ["bench-press", "back-squat", "barbell-row"]) {
    const entry = mainLift1RM.get(id);
    if (entry) rows.push({ exerciseId: id, weight: Math.round(entry.value * 10) / 10, date: entry.date });
  }
  rows.push({ exerciseId: "trap-bar-deadlift", weight: hexBarDeadlift.value, date: hexBarDeadlift.date });

  for (const row of rows) {
    await prisma.exercise1RM.upsert({
      where: { userId_exerciseId: { userId, exerciseId: row.exerciseId } },
      create: { userId, exerciseId: row.exerciseId, weight: row.weight, date: row.date },
      update: { weight: row.weight, date: row.date },
    });
  }
  return rows.length;
}

// ── Credo Ten benchmarks ────────────────────────────────────────────────

interface BenchmarkSeed {
  name: string;
  value: number;
  testedAt: Date;
}

const BENCHMARK_SEEDS: BenchmarkSeed[] = [
  { name: "Hex Bar Deadlift", value: 315, testedAt: daysAgo(45) },
  { name: "Bench Press", value: 185, testedAt: daysAgo(38) },
  { name: "Back Squat", value: 225, testedAt: daysAgo(50) },
  { name: "Back Squat", value: 245, testedAt: daysAgo(8) }, // retest — +20 lb delta
  { name: "Pull-Ups", value: 8, testedAt: daysAgo(47) },
  { name: "Pull-Ups", value: 11, testedAt: daysAgo(6) }, // retest — +3 rep delta
  { name: "Plank Hold", value: 95, testedAt: daysAgo(30) },
  { name: "Dead Hang", value: 55, testedAt: daysAgo(25) },
  { name: "Farmer Carry", value: 180, testedAt: daysAgo(20) },
];

async function createBenchmarkResults(userId: string): Promise<BenchmarkSeed[]> {
  for (const b of BENCHMARK_SEEDS) {
    const def = CREDO_TEN.find((d) => d.name === b.name);
    if (!def) throw new Error(`seed-demo: unknown Credo Ten benchmark "${b.name}"`);
    const percentile = lookupBenchmarkPercentile(b.name, PROFILE_SEX, PROFILE_AGE, b.value);
    await prisma.benchmarkResult.create({
      data: {
        userId,
        benchmarkName: b.name,
        value: b.value,
        unit: def.unit,
        percentile,
        pillar: def.pillar,
        testedAt: b.testedAt,
      },
    });
  }
  return BENCHMARK_SEEDS;
}

// ── Muscle recovery ─────────────────────────────────────────────────────

async function createMuscleRecoveryRows(
  userId: string,
  lastTrainedMap: Map<MuscleGroup, { date: Date; sets: number }>,
): Promise<number> {
  let count = 0;
  for (const [group, info] of lastTrainedMap) {
    const hours = recoveryWindowHours(info.sets, PROFILE_EXPERIENCE);
    const estimatedRecoveryDate = new Date(info.date.getTime() + hours * HOUR_MS);
    const fatigueLevel = fatigueLevelFor(
      {
        muscleGroup: group,
        lastTrainedDate: info.date.toISOString(),
        volumeLastSession: info.sets,
        estimatedRecoveryDate: estimatedRecoveryDate.toISOString(),
        fatigueLevel: "fresh",
      },
      NOW,
    );
    await prisma.muscleRecovery.upsert({
      where: { userId_muscleGroup: { userId, muscleGroup: group } },
      create: {
        userId,
        muscleGroup: group,
        lastTrainedDate: info.date,
        volumeLastSession: info.sets,
        estimatedRecoveryDate,
        fatigueLevel,
      },
      update: {
        lastTrainedDate: info.date,
        volumeLastSession: info.sets,
        estimatedRecoveryDate,
        fatigueLevel,
      },
    });
    count++;
  }
  return count;
}

// ── Weekly score snapshots ──────────────────────────────────────────────
// Strength is computed from the real strength-score engine against the
// actual seeded history/benchmarks as of each week's cutoff (so it trends up
// organically with progressive overload). Cardio/stability/nutrition are
// hand-picked gently-improving numbers — this account only carries a
// handful of recent cardio/stability/protein rows (see below), not 8 weeks
// of them, so deriving those three from history would be mostly zeros early
// on rather than a believable trend.

// Library exercise ids -> the score-calculator's canonical scoring ids.
const LIBRARY_TO_SCORING_ID: Record<string, string> = {
  "bench-press": "bench_press",
  "overhead-press": "ohp",
  "barbell-row": "barbell_row",
  "weighted-pull-up": "weighted_pullup",
  "back-squat": "back_squat",
  "romanian-deadlift": "rdl",
  "trap-bar-deadlift": "trap_bar_deadlift",
  "farmer-carry": "farmer_carry",
};

function toScoringHistory(entries: ExerciseHistoryEntry[]): ExerciseHistoryEntry[] {
  return entries.map((e) => {
    const mapped = LIBRARY_TO_SCORING_ID[e.exerciseId];
    return mapped ? { ...e, exerciseId: mapped } : e;
  });
}

const WEEKLY_CARDIO_SCORE = [40, 44, 48, 52, 56, 60, 64, 68];
const WEEKLY_STABILITY_SCORE = [50, 53, 56, 59, 62, 65, 68, 70];
const WEEKLY_NUTRITION_SCORE = [58, 60, 62, 65, 68, 70, 73, 76];

async function createScoreSnapshots(
  userId: string,
  historyEntries: ExerciseHistoryEntry[],
  benchmarks: BenchmarkSeed[],
): Promise<number> {
  for (let week = 1; week <= WEEKS; week++) {
    const cutoff = daysAgo((WEEKS - week) * 7 + 2);
    const historyToDate = historyEntries.filter((h) => new Date(h.date) <= cutoff);
    const benchmarksToDate = benchmarks.filter((b) => b.testedAt <= cutoff);

    const strengthResult = calculateStrengthScore({
      profile: PROFILE,
      exerciseHistory: toScoringHistory(historyToDate),
      benchmarkResults: benchmarksToDate.map((b) => ({
        name: b.name,
        value: b.value,
        testedAt: b.testedAt.toISOString(),
      })),
      now: cutoff,
    });

    const strength = strengthResult.overall;
    const cardio = WEEKLY_CARDIO_SCORE[week - 1];
    const stability = WEEKLY_STABILITY_SCORE[week - 1];
    const nutrition = WEEKLY_NUTRITION_SCORE[week - 1];
    const credo = calculateCredoScore({ strength, cardio, stability, nutrition });

    await prisma.scoreSnapshot.upsert({
      where: { userId_weekNumber: { userId, weekNumber: week } },
      create: {
        userId,
        weekNumber: week,
        credoScore: credo,
        strengthScore: strength,
        stabilityScore: stability,
        cardioScore: cardio,
        nutritionScore: nutrition,
        date: cutoff,
      },
      update: {
        credoScore: credo,
        strengthScore: strength,
        stabilityScore: stability,
        cardioScore: cardio,
        nutritionScore: nutrition,
        date: cutoff,
      },
    });
  }
  return WEEKS;
}

// ── Nutrition / cardio / stability pillar rows ──────────────────────────

async function createProteinEntries(userId: string): Promise<number> {
  const days: { daysAgo: number; entries: { grams: number; calories: number; label: string; mealType: string }[] }[] = [
    {
      daysAgo: 1,
      entries: [
        { grams: 62, calories: 480, label: "Grilled chicken salad", mealType: "lunch" },
        { grams: 88, calories: 620, label: "Salmon, rice, broccoli", mealType: "dinner" },
      ],
    },
    {
      daysAgo: 2,
      entries: [
        { grams: 58, calories: 460, label: "Turkey wrap", mealType: "lunch" },
        { grams: 85, calories: 590, label: "Steak and sweet potato", mealType: "dinner" },
      ],
    },
    {
      daysAgo: 3,
      entries: [
        { grams: 65, calories: 500, label: "Chicken burrito bowl", mealType: "lunch" },
        { grams: 92, calories: 640, label: "Ground beef stir fry", mealType: "dinner" },
      ],
    },
    {
      daysAgo: 4,
      entries: [
        { grams: 55, calories: 440, label: "Protein shake + eggs", mealType: "breakfast" },
        { grams: 80, calories: 560, label: "Baked chicken thighs", mealType: "dinner" },
      ],
    },
    {
      daysAgo: 5,
      entries: [
        { grams: 60, calories: 470, label: "Greek yogurt bowl + tuna", mealType: "lunch" },
        { grams: 90, calories: 610, label: "Pork tenderloin, quinoa", mealType: "dinner" },
      ],
    },
  ];

  let count = 0;
  for (const day of days) {
    for (const entry of day.entries) {
      await prisma.proteinEntry.create({
        data: {
          userId,
          date: daysAgo(day.daysAgo),
          grams: entry.grams,
          calories: entry.calories,
          label: entry.label,
          mealType: entry.mealType,
        },
      });
      count++;
    }
  }
  return count;
}

async function createCardioSessions(userId: string): Promise<number> {
  const sessions = [
    {
      daysAgo: 9,
      type: "intervals",
      minutes: 34,
      avgHr: 152,
      maxHr: 181,
      notes: "Norwegian 4x4 on the Concept2 — 4x4min @ ~185W avg, 3min easy recoveries.",
    },
    {
      daysAgo: 6,
      type: "zone2",
      minutes: 40,
      avgHr: 128,
      maxHr: 145,
      notes: "Easy incline treadmill walk.",
    },
    {
      daysAgo: 3,
      type: "zone2",
      minutes: 45,
      avgHr: 132,
      maxHr: 150,
      notes: "Zone 2 ride on the Airdyne.",
    },
  ];

  for (const s of sessions) {
    await prisma.cardioSession.create({
      data: {
        userId,
        date: daysAgo(s.daysAgo),
        type: s.type,
        minutes: s.minutes,
        avgHr: s.avgHr,
        maxHr: s.maxHr,
        source: "manual",
        notes: s.notes,
      },
    });
  }
  return sessions.length;
}

async function createStabilitySessions(userId: string): Promise<number> {
  const sessions = [
    { daysAgo: 1, type: "warmup", minutes: 10, notes: "Dynamic warmup before legs." },
    { daysAgo: 4, type: "mobility", minutes: 20, notes: "Hip and t-spine mobility flow." },
    { daysAgo: 5, type: "warmup", minutes: 8, notes: "Band pull-aparts and shoulder prep before push day." },
    { daysAgo: 12, type: "balance", minutes: 12, notes: "Single-leg balance work + hip airplanes." },
  ];

  for (const s of sessions) {
    await prisma.stabilitySession.create({
      data: {
        userId,
        date: daysAgo(s.daysAgo),
        type: s.type,
        minutes: s.minutes,
        notes: s.notes,
      },
    });
  }
  return sessions.length;
}

// ── Custom split + shared workout (nice-to-have) ────────────────────────

async function createWorkoutSplitAndShare(userId: string): Promise<void> {
  const days: SplitDay[] = [
    { dayNumber: 1, label: "Push", muscleGroups: ["chest", "shoulders", "triceps"], isRestDay: false },
    { dayNumber: 2, label: "Rest", muscleGroups: [], isRestDay: true },
    { dayNumber: 3, label: "Pull", muscleGroups: ["back", "biceps", "forearms"], isRestDay: false },
    { dayNumber: 4, label: "Rest", muscleGroups: [], isRestDay: true },
    {
      dayNumber: 5,
      label: "Legs",
      muscleGroups: ["quads", "hamstrings", "glutes", "calves", "core"],
      isRestDay: false,
    },
    { dayNumber: 6, label: "Rest", muscleGroups: [], isRestDay: true },
    { dayNumber: 7, label: "Rest", muscleGroups: [], isRestDay: true },
  ];

  const split = await prisma.workoutSplit.create({
    data: {
      userId,
      name: "Alex's PPL",
      type: "custom",
      days: days as unknown as Prisma.InputJsonValue,
      isShareable: true,
      isActive: true,
    },
  });

  await prisma.sharedWorkout.create({
    data: {
      shareCode: "ALEX-PPL-DEMO",
      createdBy: userId,
      type: "split",
      data: {
        splitId: split.id,
        name: split.name,
        daysPerWeek: 3,
        days,
      } as unknown as Prisma.InputJsonValue,
      viewCount: 4,
    },
  });
}

// ── main ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`Seeding demo account ${DEMO_EMAIL}...`);

  await resetDemoUser();
  await ensureExerciseRows(REQUIRED_EXERCISE_IDS);

  const user = await createDemoUser();
  await createTrainingPreferences(user.id);
  await createGymProfile(user.id);

  const { historyEntries, lastTrainedMap, mainLift1RM, personalRecordCount } =
    await generateTrainingHistory(user.id);

  const benchmarks = await createBenchmarkResults(user.id);
  const hexBarDeadlift = BENCHMARK_SEEDS.find((b) => b.name === "Hex Bar Deadlift");
  if (!hexBarDeadlift) throw new Error("seed-demo: Hex Bar Deadlift benchmark seed missing");
  const exercise1RMCount = await createExercise1RMRows(user.id, mainLift1RM, {
    value: hexBarDeadlift.value,
    date: hexBarDeadlift.testedAt,
  });

  const muscleRecoveryCount = await createMuscleRecoveryRows(user.id, lastTrainedMap);
  const snapshotCount = await createScoreSnapshots(user.id, historyEntries, benchmarks);
  const proteinCount = await createProteinEntries(user.id);
  const cardioCount = await createCardioSessions(user.id);
  const stabilityCount = await createStabilitySessions(user.id);
  await createWorkoutSplitAndShare(user.id);

  console.log(`  Workout sessions: ${TOTAL_SESSIONS} (${historyEntries.length} exercise logs)`);
  console.log(`  Personal records: ${personalRecordCount}`);
  console.log(`  Exercise 1RMs: ${exercise1RMCount}`);
  console.log(`  Benchmark results: ${benchmarks.length}`);
  console.log(`  Muscle recovery rows: ${muscleRecoveryCount}`);
  console.log(`  Score snapshots: ${snapshotCount}`);
  console.log(`  Protein entries: ${proteinCount}`);
  console.log(`  Cardio sessions: ${cardioCount}`);
  console.log(`  Stability sessions: ${stabilityCount}`);
  console.log("Demo seed complete.");
  console.log(`  Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
