// training-context.ts
// The DB ↔ engine bridge. The pure engines in src/services/ai take all data
// as parameters; this module is the single place that loads Prisma rows,
// maps them to engine input types, persists engine output, and builds the
// API DTOs defined in src/lib/types.ts. Route handlers stay thin.

import { prisma } from "@/lib/prisma";
import type { Prisma, User as UserRow } from "@prisma/client";
import type {
  BenchmarkDTO,
  Difficulty,
  Equipment,
  ExerciseHistoryEntry,
  FatigueLevel,
  GeneratedWorkoutPlan,
  MuscleGroup,
  MuscleRecoveryState,
  PillarScoresDTO,
  PlannedExerciseDTO,
  PlannedExerciseSpec,
  Sex,
  StrengthScoreResult,
  TrainingPreferencesInput,
  UserProfileInput,
  WarmupMoveDTO,
  WorkoutPlanDTO,
} from "@/lib/types";
import { ALL_EQUIPMENT, ALL_MUSCLE_GROUPS } from "@/lib/types";
import {
  calculateCardioScore,
  calculateCredoScore,
  calculateNutritionScore,
  calculateStabilityScore,
  calculateStrengthScore,
  fatigueLevelFor,
  generateWarmup,
  generateWeek,
  generateWorkout,
  suggestAlternatives,
  updateRecoveryAfterWorkout,
  type StandardsLookup,
  type BenchmarkResultInput,
  type DemographicLookup,
  type TrainedGroupVolume,
} from "@/services/ai";
import {
  EXERCISE_LIBRARY,
  EXERCISES_BY_ID,
} from "@/services/data/exercise-library";
import { findStandard } from "@/services/data/strength-standards";
import { CREDO_TEN } from "@/services/data/benchmarks";

// ── Date helpers (UTC day granularity) ──────────────────────────────────────

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight UTC of the given instant's calendar day. */
export function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

/** 1-based week number since account creation (UTC day granularity). */
export function weekNumberFor(createdAt: Date, now: Date): number {
  const diff = utcDayStart(now).getTime() - utcDayStart(createdAt).getTime();
  return Math.max(1, Math.floor(diff / (7 * DAY_MS)) + 1);
}

/** UTC start of the user's current training week. */
export function currentWeekStart(createdAt: Date, now: Date): Date {
  const week = weekNumberFor(createdAt, now);
  return addDays(utcDayStart(createdAt), (week - 1) * 7);
}

// ── Row → engine input mapping ──────────────────────────────────────────────

export type PlanWithExercises = Prisma.WorkoutPlanGetPayload<{
  include: { exercises: true };
}>;

type LogWithSets = Prisma.ExerciseLogGetPayload<{ include: { sets: true } }>;

export function profileFromUser(user: UserRow): UserProfileInput {
  return {
    age: user.age,
    sex: (user.sex as Sex | null) ?? null,
    weight: user.weight,
    heightIn: user.heightIn,
    experienceLevel: (user.experienceLevel as Difficulty | null) ?? null,
  };
}

type PreferencesRow = Prisma.TrainingPreferencesGetPayload<object>;

export function preferencesInputFromRow(row: PreferencesRow): TrainingPreferencesInput {
  return {
    goal: row.goal as TrainingPreferencesInput["goal"],
    daysPerWeek: row.daysPerWeek,
    sessionDuration: row.sessionDuration,
    preferredSplit: row.preferredSplit as TrainingPreferencesInput["preferredSplit"],
    availableEquipment: row.availableEquipment as Equipment[],
    trainingLocation: row.trainingLocation as TrainingPreferencesInput["trainingLocation"],
    muscleGroupFocus: row.muscleGroupFocus as MuscleGroup[],
    muscleGroupExclude: row.muscleGroupExclude as MuscleGroup[],
    enableSupersets: row.enableSupersets,
    varietyLevel: row.varietyLevel as TrainingPreferencesInput["varietyLevel"],
  };
}

function historyFromLogs(logs: LogWithSets[]): ExerciseHistoryEntry[] {
  return logs.map((log) => ({
    exerciseId: log.exerciseId,
    date: log.date.toISOString(),
    sets: [...log.sets]
      .sort((a, b) => a.setNumber - b.setNumber)
      .map((s) => ({
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        ...(s.rpe != null ? { rpe: s.rpe } : {}),
        ...(s.restDuration != null ? { restDuration: s.restDuration } : {}),
      })),
    estimated1RM: log.estimated1RM,
    ...(log.exertionRating != null ? { exertionRating: log.exertionRating } : {}),
  }));
}

type RecoveryRow = Prisma.MuscleRecoveryGetPayload<object>;

function stateFromRecoveryRow(row: RecoveryRow, now: Date): MuscleRecoveryState {
  const state: MuscleRecoveryState = {
    muscleGroup: row.muscleGroup as MuscleGroup,
    lastTrainedDate: row.lastTrainedDate.toISOString(),
    volumeLastSession: row.volumeLastSession,
    estimatedRecoveryDate: row.estimatedRecoveryDate.toISOString(),
    fatigueLevel: row.fatigueLevel as FatigueLevel,
  };
  // Refresh the stored fatigue level against the current time.
  state.fatigueLevel = fatigueLevelFor(state, now);
  return state;
}

function planRowToGenerated(row: PlanWithExercises): GeneratedWorkoutPlan {
  return {
    weekNumber: row.weekNumber,
    dayNumber: row.dayNumber,
    totalDays: row.totalDays,
    splitType: row.splitType,
    focus: row.focus,
    estimatedDuration: row.estimatedDuration,
    includesWarmup: row.includesWarmup,
    exercises: [...row.exercises]
      .sort((a, b) => a.order - b.order)
      .map(
        (e): PlannedExerciseSpec => ({
          exerciseId: e.exerciseId,
          order: e.order,
          targetSets: e.targetSets,
          targetReps: [e.targetRepMin, e.targetRepMax],
          recommendedWeight: e.recommendedWeight,
          restPeriod: e.restPeriod,
          isSuperset: e.isSuperset,
          ...(e.supersetWith != null ? { supersetWith: e.supersetWith } : {}),
          ...(e.rationale != null ? { rationale: e.rationale } : {}),
          isWarmup: e.isWarmup,
        }),
      ),
  };
}

// ── Standards wiring ────────────────────────────────────────────────────────

// The score-calculator keys its lift categories on canonical ids
// (bench_press, ohp, rdl, ...). The exercise library — the source of truth for
// logged exercise ids — uses kebab-case slugs. Map library slugs to the
// scoring ids before handing history to calculateStrengthScore.
const LIBRARY_TO_SCORING_ID: Record<string, string> = {
  "bench-press": "bench_press",
  "overhead-press": "ohp",
  "barbell-row": "barbell_row",
  "weighted-pull-up": "weighted_pullup",
  "back-squat": "back_squat",
  "front-squat": "front_squat",
  deadlift: "deadlift",
  "romanian-deadlift": "rdl",
  "trap-bar-deadlift": "trap_bar_deadlift",
  "farmer-carry": "farmer_carry",
  "hanging-knee-raise": "hanging_knee_raise",
  "pull-up": "pullup",
  "push-up": "pushup",
};

const SCORING_ID_TO_STANDARD_NAME: Record<string, string> = {
  bench_press: "Bench Press",
  ohp: "Overhead Press",
  barbell_row: "Barbell Row",
  weighted_pullup: "Weighted Pull-Up",
  back_squat: "Back Squat",
  front_squat: "Front Squat",
  deadlift: "Deadlift",
  rdl: "Romanian Deadlift",
  trap_bar_deadlift: "Trap Bar Deadlift",
  farmer_carry: "Farmer Carry",
};

function scoringHistory(history: ExerciseHistoryEntry[]): ExerciseHistoryEntry[] {
  return history.map((h) => {
    const mapped = LIBRARY_TO_SCORING_ID[h.exerciseId];
    return mapped ? { ...h, exerciseId: mapped } : h;
  });
}

/** StandardsLookup for calculateStrengthScore, wired to strength-standards. */
export function standardsLookupFor(experienceLevel: Difficulty | null): StandardsLookup {
  return (exerciseId, sex, age) => {
    const name = SCORING_ID_TO_STANDARD_NAME[exerciseId] ?? exerciseId;
    const entry = findStandard(name, sex, age, experienceLevel ?? "intermediate");
    return entry ? entry.percentiles : null;
  };
}

/**
 * DemographicLookup for the workout generator: an absolute conservative
 * starting 1RM (~40th percentile) from the relative-strength standards.
 */
export const demographicLookup: DemographicLookup = (exercise, profile) => {
  if (!profile.sex || !profile.weight) return null;
  const entry = findStandard(
    exercise.name,
    profile.sex,
    profile.age ?? 30,
    profile.experienceLevel ?? "intermediate",
  );
  if (!entry || entry.unit !== "bw_ratio") return null;
  const ratio = (entry.percentiles.p25 + entry.percentiles.p50) / 2; // ≈ p40
  return ratio > 0 ? ratio * profile.weight : null;
};

// ── loadTrainingContext ─────────────────────────────────────────────────────

export interface TrainingContext {
  user: UserRow;
  profile: UserProfileInput;
  /** null until the user completes onboarding / saves preferences. */
  preferences: TrainingPreferencesInput | null;
  /** Default gym profile equipment, falling back to preferences equipment. */
  equipment: Equipment[];
  history: ExerciseHistoryEntry[];
  recoveryStates: MuscleRecoveryState[];
  recentPlans: GeneratedWorkoutPlan[];
  weekNumber: number;
}

export async function loadTrainingContext(
  userId: string,
  now: Date = new Date(),
): Promise<TrainingContext> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const [prefsRow, gymProfiles, logs, recoveryRows, recentPlanRows] =
    await Promise.all([
      prisma.trainingPreferences.findUnique({ where: { userId } }),
      prisma.gymProfile.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
      prisma.exerciseLog.findMany({
        where: { userId, date: { gte: addDays(now, -90) } },
        include: { sets: true },
        orderBy: { date: "desc" },
        take: 500,
      }),
      prisma.muscleRecovery.findMany({ where: { userId } }),
      prisma.workoutPlan.findMany({
        where: { userId, createdAt: { gte: addDays(now, -14) } },
        include: { exercises: true },
        orderBy: { createdAt: "desc" },
        take: 14,
      }),
    ]);

  const preferences = prefsRow ? preferencesInputFromRow(prefsRow) : null;
  const defaultProfile = gymProfiles.find((g) => g.isDefault) ?? gymProfiles[0];
  const equipment: Equipment[] =
    defaultProfile && defaultProfile.equipment.length > 0
      ? (defaultProfile.equipment as Equipment[])
      : preferences?.availableEquipment ?? [...ALL_EQUIPMENT];

  return {
    user,
    profile: profileFromUser(user),
    preferences,
    equipment,
    history: historyFromLogs(logs),
    recoveryStates: recoveryRows.map((r) => stateFromRecoveryRow(r, now)),
    recentPlans: recentPlanRows.map(planRowToGenerated),
    weekNumber: weekNumberFor(user.createdAt, now),
  };
}

/** Preferences with the default gym profile's equipment substituted in. */
export function generationPreferences(ctx: TrainingContext): TrainingPreferencesInput | null {
  if (!ctx.preferences) return null;
  return { ...ctx.preferences, availableEquipment: ctx.equipment };
}

// ── Exercise row upserts (library is the source of truth) ───────────────────

/**
 * Lazily upsert Exercise rows from EXERCISE_LIBRARY so rows that FK to
 * Exercise never dangle, even on an unseeded database. Unknown ids are
 * ignored (they would fail the FK anyway and should never occur).
 */
export async function ensureExerciseRows(exerciseIds: string[]): Promise<void> {
  const unique = [...new Set(exerciseIds)];
  const defs = unique
    .map((id) => EXERCISES_BY_ID.get(id))
    .filter((d): d is NonNullable<typeof d> => d != null);
  if (defs.length === 0) return;

  await prisma.$transaction(
    defs.map((def) => {
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
      return prisma.exercise.upsert({
        where: { id: def.id },
        create: { id: def.id, ...data },
        update: data,
      });
    }),
  );
}

// ── persistGeneratedPlan ────────────────────────────────────────────────────

export async function persistGeneratedPlan(
  userId: string,
  plan: GeneratedWorkoutPlan,
  scheduledDate: Date,
): Promise<PlanWithExercises> {
  await ensureExerciseRows(plan.exercises.map((e) => e.exerciseId));

  return prisma.workoutPlan.create({
    data: {
      userId,
      weekNumber: plan.weekNumber,
      dayNumber: plan.dayNumber,
      totalDays: plan.totalDays,
      splitType: plan.splitType,
      focus: plan.focus,
      estimatedDuration: plan.estimatedDuration,
      includesWarmup: plan.includesWarmup,
      status: "planned",
      scheduledDate,
      exercises: {
        create: plan.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          order: e.order,
          targetSets: e.targetSets,
          targetRepMin: e.targetReps[0],
          targetRepMax: e.targetReps[1],
          recommendedWeight: e.recommendedWeight,
          restPeriod: e.restPeriod,
          isSuperset: e.isSuperset ?? false,
          supersetWith: e.supersetWith ?? null,
          rationale: e.rationale ?? null,
          isWarmup: e.isWarmup ?? false,
        })),
      },
    },
    include: { exercises: true },
  });
}

// ── Plan DTOs ───────────────────────────────────────────────────────────────

/** "3x8 @ 185 lb" from the latest logged session (or "3x12" for bodyweight). */
function previousSessionString(log: LogWithSets | undefined): string | null {
  if (!log || log.sets.length === 0) return null;
  const best = [...log.sets].sort(
    (a, b) => b.weight - a.weight || b.reps - a.reps,
  )[0];
  const count = log.sets.length;
  return best.weight > 0
    ? `${count}x${best.reps} @ ${best.weight} lb`
    : `${count}x${best.reps}`;
}

async function latestLogsByExercise(
  userId: string,
  exerciseIds: string[],
): Promise<Map<string, LogWithSets>> {
  if (exerciseIds.length === 0) return new Map();
  const logs = await prisma.exerciseLog.findMany({
    where: { userId, exerciseId: { in: exerciseIds } },
    include: { sets: true },
    orderBy: { date: "desc" },
    take: 300,
  });
  const map = new Map<string, LogWithSets>();
  for (const log of logs) {
    if (!map.has(log.exerciseId)) map.set(log.exerciseId, log);
  }
  return map;
}

async function equipmentForUser(userId: string): Promise<Equipment[]> {
  const [defaultProfile, prefs] = await Promise.all([
    prisma.gymProfile.findFirst({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.trainingPreferences.findUnique({ where: { userId } }),
  ]);
  if (defaultProfile && defaultProfile.equipment.length > 0) {
    return defaultProfile.equipment as Equipment[];
  }
  if (prefs && prefs.availableEquipment.length > 0) {
    return prefs.availableEquipment as Equipment[];
  }
  return [...ALL_EQUIPMENT];
}

function buildWarmupDTO(plan: PlanWithExercises): WarmupMoveDTO[] {
  const specs = planRowToGenerated(plan).exercises;
  const routine = generateWarmup(specs, EXERCISE_LIBRARY);
  return routine.movements.map((m) => ({
    exerciseId: m.exerciseId,
    name: m.name,
    prescription: m.durationSeconds != null ? `${m.durationSeconds} sec` : `${m.reps ?? 10} reps`,
  }));
}

function buildPlanDTO(
  plan: PlanWithExercises,
  equipment: Equipment[],
  latestLogs: Map<string, LogWithSets>,
): WorkoutPlanDTO {
  const exercises: PlannedExerciseDTO[] = [...plan.exercises]
    .sort((a, b) => a.order - b.order)
    .flatMap((row): PlannedExerciseDTO[] => {
      const def = EXERCISES_BY_ID.get(row.exerciseId);
      if (!def) return []; // rows always originate from the library
      return [
        {
          id: row.id,
          exerciseId: row.exerciseId,
          name: def.name,
          muscleGroup: def.primaryMuscles[0],
          movementPattern: def.movementPattern,
          order: row.order,
          targetSets: row.targetSets,
          targetRepMin: row.targetRepMin,
          targetRepMax: row.targetRepMax,
          recommendedWeight: row.recommendedWeight,
          restPeriod: row.restPeriod,
          rationale: row.rationale,
          isWarmup: row.isWarmup,
          isSuperset: row.isSuperset,
          supersetWith: row.supersetWith,
          formCues: def.formCues,
          previousSession: previousSessionString(latestLogs.get(row.exerciseId)),
          alternatives: suggestAlternatives(def, EXERCISE_LIBRARY, equipment, 4).map(
            (alt) => ({ exerciseId: alt.id, name: alt.name }),
          ),
        },
      ];
    });

  return {
    id: plan.id,
    weekNumber: plan.weekNumber,
    dayNumber: plan.dayNumber,
    totalDays: plan.totalDays,
    splitType: plan.splitType,
    focus: plan.focus,
    estimatedDuration: plan.estimatedDuration,
    status: plan.status as WorkoutPlanDTO["status"],
    scheduledDate: plan.scheduledDate ? plan.scheduledDate.toISOString() : null,
    startedAt: plan.startedAt ? plan.startedAt.toISOString() : null,
    warmup: plan.includesWarmup ? buildWarmupDTO(plan) : [],
    exercises,
  };
}

/** Build DTOs for several plans with batched log/equipment lookups. */
export async function toPlanDTOs(
  plans: PlanWithExercises[],
  userId: string,
): Promise<WorkoutPlanDTO[]> {
  if (plans.length === 0) return [];
  const exerciseIds = [
    ...new Set(plans.flatMap((p) => p.exercises.map((e) => e.exerciseId))),
  ];
  const [equipment, latestLogs] = await Promise.all([
    equipmentForUser(userId),
    latestLogsByExercise(userId, exerciseIds),
  ]);
  return plans.map((p) => buildPlanDTO(p, equipment, latestLogs));
}

export async function toPlanDTO(
  plan: PlanWithExercises,
  userId: string,
): Promise<WorkoutPlanDTO> {
  const [dto] = await toPlanDTOs([plan], userId);
  return dto;
}

/** Fetch a plan by id (scoped to the user) and build its DTO. */
export async function planDTOById(
  userId: string,
  planId: string,
): Promise<WorkoutPlanDTO | null> {
  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId },
    include: { exercises: true },
  });
  if (!plan) return null;
  return toPlanDTO(plan, userId);
}

// ── Plan orchestration (today / week) ───────────────────────────────────────

const STATUS_PRIORITY: Record<string, number> = {
  in_progress: 0,
  planned: 1,
  completed: 2,
  skipped: 3,
};

/** The plan scheduled for today (UTC), preferring active over finished ones. */
export async function findTodayPlan(
  userId: string,
  now: Date = new Date(),
): Promise<PlanWithExercises | null> {
  const dayStart = utcDayStart(now);
  const plans = await prisma.workoutPlan.findMany({
    where: { userId, scheduledDate: { gte: dayStart, lt: addDays(dayStart, 1) } },
    include: { exercises: true },
    orderBy: { createdAt: "desc" },
  });
  if (plans.length === 0) return null;
  return [...plans].sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9),
  )[0];
}

/** The next not-yet-started plan scheduled after today (UTC). */
export async function findNextPlannedPlan(
  userId: string,
  now: Date = new Date(),
): Promise<PlanWithExercises | null> {
  const dayEnd = addDays(utcDayStart(now), 1);
  return prisma.workoutPlan.findFirst({
    where: { userId, status: "planned", scheduledDate: { gte: dayEnd } },
    include: { exercises: true },
    orderBy: { scheduledDate: "asc" },
  });
}

/**
 * Generate + persist a workout for today. Returns null when the user has no
 * training preferences yet (onboarding incomplete).
 */
export async function generateTodayWorkout(
  userId: string,
  now: Date = new Date(),
): Promise<PlanWithExercises | null> {
  const ctx = await loadTrainingContext(userId, now);
  const preferences = generationPreferences(ctx);
  if (!preferences) return null;

  const totalDays = Math.min(6, Math.max(2, Math.round(preferences.daysPerWeek)));
  const plansThisWeek = await prisma.workoutPlan.count({
    where: { userId, weekNumber: ctx.weekNumber },
  });
  const dayNumber = (plansThisWeek % totalDays) + 1;

  const plan = generateWorkout({
    profile: ctx.profile,
    preferences,
    history: ctx.history,
    recoveryStates: ctx.recoveryStates,
    library: EXERCISE_LIBRARY,
    weekNumber: ctx.weekNumber,
    dayNumber,
    recentPlans: ctx.recentPlans,
    standardsLookup: demographicLookup,
    now,
  });
  return persistGeneratedPlan(userId, plan, utcDayStart(now));
}

/**
 * All plans for the current training week, generating any missing training
 * days. Returns [] when the user has no preferences yet.
 */
export async function ensureWeekPlans(
  userId: string,
  now: Date = new Date(),
): Promise<PlanWithExercises[]> {
  const ctx = await loadTrainingContext(userId, now);
  const preferences = generationPreferences(ctx);
  if (!preferences) return [];

  const existing = await prisma.workoutPlan.findMany({
    where: { userId, weekNumber: ctx.weekNumber },
    include: { exercises: true },
    orderBy: [{ dayNumber: "asc" }, { createdAt: "asc" }],
  });
  const existingDays = new Set(existing.map((p) => p.dayNumber));
  const totalDays = Math.min(6, Math.max(2, Math.round(preferences.daysPerWeek)));
  if (existingDays.size >= totalDays) return existing;

  const week = generateWeek({
    profile: ctx.profile,
    preferences,
    history: ctx.history,
    recoveryStates: ctx.recoveryStates,
    library: EXERCISE_LIBRARY,
    weekNumber: ctx.weekNumber,
    recentPlans: ctx.recentPlans,
    standardsLookup: demographicLookup,
    now,
  });

  const weekStart = currentWeekStart(ctx.user.createdAt, now);
  const spacingMs = (7 / totalDays) * DAY_MS;
  const created: PlanWithExercises[] = [];
  for (const plan of week) {
    if (existingDays.has(plan.dayNumber)) continue;
    const ideal = utcDayStart(
      new Date(weekStart.getTime() + (plan.dayNumber - 1) * spacingMs),
    );
    // Never schedule newly generated days in the past.
    const scheduledDate = ideal < utcDayStart(now) ? utcDayStart(now) : ideal;
    created.push(await persistGeneratedPlan(userId, plan, scheduledDate));
  }

  return [...existing, ...created].sort(
    (a, b) => a.dayNumber - b.dayNumber || a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

// ── Recovery ────────────────────────────────────────────────────────────────

function freshState(group: MuscleGroup): MuscleRecoveryState {
  const epoch = new Date(0).toISOString();
  return {
    muscleGroup: group,
    lastTrainedDate: epoch,
    volumeLastSession: 0,
    estimatedRecoveryDate: epoch,
    fatigueLevel: "fresh",
  };
}

/** All 12 muscle groups; groups without a DB row are fresh. */
export async function recoveryStatesForUser(
  userId: string,
  now: Date = new Date(),
): Promise<MuscleRecoveryState[]> {
  const rows = await prisma.muscleRecovery.findMany({ where: { userId } });
  const byGroup = new Map(rows.map((r) => [r.muscleGroup, r]));
  return ALL_MUSCLE_GROUPS.map((group) => {
    const row = byGroup.get(group);
    return row ? stateFromRecoveryRow(row, now) : freshState(group);
  });
}

/** Run the recovery engine after a completed workout and persist the states. */
export async function applyRecoveryUpdate(
  userId: string,
  trainedVolumes: TrainedGroupVolume[],
  profile: UserProfileInput,
  now: Date,
): Promise<void> {
  const rows = await prisma.muscleRecovery.findMany({ where: { userId } });
  const states = rows.map((r) => stateFromRecoveryRow(r, now));
  const next = updateRecoveryAfterWorkout(states, trainedVolumes, profile, now);

  await prisma.$transaction(
    next.map((state) =>
      prisma.muscleRecovery.upsert({
        where: { userId_muscleGroup: { userId, muscleGroup: state.muscleGroup } },
        create: {
          userId,
          muscleGroup: state.muscleGroup,
          lastTrainedDate: new Date(state.lastTrainedDate),
          volumeLastSession: state.volumeLastSession,
          estimatedRecoveryDate: new Date(state.estimatedRecoveryDate),
          fatigueLevel: state.fatigueLevel,
        },
        update: {
          lastTrainedDate: new Date(state.lastTrainedDate),
          volumeLastSession: state.volumeLastSession,
          estimatedRecoveryDate: new Date(state.estimatedRecoveryDate),
          fatigueLevel: state.fatigueLevel,
        },
      }),
    ),
  );
}

// ── Pillar scores ───────────────────────────────────────────────────────────

const UNILATERAL_KEYWORDS = [
  "single",
  "one-arm",
  "one arm",
  "one-leg",
  "split squat",
  "bulgarian",
  "lunge",
  "pistol",
  "step-up",
  "step up",
  "hip airplane",
];

function isUnilateral(exerciseId: string): boolean {
  const def = EXERCISES_BY_ID.get(exerciseId);
  if (!def) return false;
  const name = def.name.toLowerCase();
  return UNILATERAL_KEYWORDS.some((k) => name.includes(k));
}

function latestBenchmarkInputs(
  rows: Prisma.BenchmarkResultGetPayload<object>[],
): BenchmarkResultInput[] {
  const seen = new Set<string>();
  const out: BenchmarkResultInput[] = [];
  // rows arrive newest-first
  for (const row of rows) {
    if (seen.has(row.benchmarkName)) continue;
    seen.add(row.benchmarkName);
    out.push({
      name: row.benchmarkName,
      value: row.value,
      unit: row.unit,
      testedAt: row.testedAt.toISOString(),
    });
  }
  return out;
}

export async function computePillarScores(
  userId: string,
  now: Date = new Date(),
): Promise<PillarScoresDTO> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const profile = profileFromUser(user);
  const weekNumber = weekNumberFor(user.createdAt, now);
  const weekAgo = addDays(now, -7);

  const [logs120, benchmarkRows, snapshots, proteinRows, cardioRows, stabilityRows, recoveryRows] =
    await Promise.all([
      prisma.exerciseLog.findMany({
        where: { userId, date: { gte: addDays(now, -120) } },
        include: { sets: true },
        orderBy: { date: "desc" },
        take: 800,
      }),
      prisma.benchmarkResult.findMany({
        where: { userId },
        orderBy: { testedAt: "desc" },
      }),
      prisma.scoreSnapshot.findMany({
        where: { userId },
        orderBy: { weekNumber: "desc" },
      }),
      prisma.proteinEntry.findMany({
        where: { userId, date: { gte: addDays(utcDayStart(now), -6) } },
      }),
      prisma.cardioSession.findMany({
        where: { userId, date: { gte: addDays(now, -28) } },
      }),
      prisma.stabilitySession.findMany({
        where: { userId, date: { gte: weekAgo } },
      }),
      prisma.muscleRecovery.findMany({ where: { userId } }),
    ]);

  const history = historyFromLogs(logs120);

  // Strength
  const strengthResult = calculateStrengthScore({
    profile,
    exerciseHistory: scoringHistory(history),
    benchmarkResults: latestBenchmarkInputs(benchmarkRows),
    standardsLookup: standardsLookupFor(profile.experienceLevel),
    priorScores: snapshots.map((s) => ({
      date: s.date.toISOString(),
      overall: s.strengthScore,
    })),
    now,
  });
  const strength = strengthResult.overall;

  // Cardio — zone-2 minutes this week vs the user's target, plus frequency
  // and 4-week consistency. (No VO2max estimate is stored, so the 40/30/30
  // weighting applies.)
  const thisWeek = cardioRows.filter((c) => c.date >= weekAgo);
  const weeklyZone2Minutes = thisWeek
    .filter((c) => c.type === "zone2")
    .reduce((sum, c) => sum + c.minutes, 0);
  let weeksActiveOfLast4 = 0;
  for (let k = 0; k < 4; k++) {
    const start = addDays(now, -(k + 1) * 7);
    const end = addDays(now, -k * 7);
    if (cardioRows.some((c) => c.date >= start && c.date < end)) weeksActiveOfLast4++;
  }
  const cardio = calculateCardioScore({
    weeklyZone2Minutes,
    zone2TargetMinutes: user.zone2TargetMin ?? 150,
    sessionsThisWeek: thisWeek.length,
    weeksActiveOfLast4,
  });

  // Stability — logged mobility sessions + core/unilateral lifting volume +
  // recovery compliance.
  const weeklyStabilityMinutes = stabilityRows.reduce((sum, s) => sum + s.minutes, 0);
  const logsThisWeek = logs120.filter((l) => l.date >= weekAgo);
  let weeklyCoreSets = 0;
  let weeklyUnilateralSets = 0;
  for (const log of logsThisWeek) {
    const def = EXERCISES_BY_ID.get(log.exerciseId);
    if (def?.movementPattern === "core") weeklyCoreSets += log.sets.length;
    if (isUnilateral(log.exerciseId)) weeklyUnilateralSets += log.sets.length;
  }
  const recoveryStates = recoveryRows.map((r) => stateFromRecoveryRow(r, now));
  const fatiguedCount = recoveryStates.filter((s) => s.fatigueLevel === "fatigued").length;
  const recoveredGroupRatio =
    (ALL_MUSCLE_GROUPS.length - fatiguedCount) / ALL_MUSCLE_GROUPS.length;
  const stability = calculateStabilityScore({
    weeklyStabilityMinutes,
    weeklyCoreSets,
    weeklyUnilateralSets,
    recoveredGroupRatio,
  });

  // Nutrition — last 7 UTC days of protein logging vs the user's target.
  const proteinTargetG =
    user.proteinTargetG ?? (user.weight ? Math.round(user.weight * 0.8) : 0);
  const dailyProteinG: (number | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = addDays(utcDayStart(now), -i);
    const dayEnd = addDays(dayStart, 1);
    const entries = proteinRows.filter((p) => p.date >= dayStart && p.date < dayEnd);
    dailyProteinG.push(
      entries.length > 0 ? entries.reduce((sum, p) => sum + p.grams, 0) : null,
    );
  }
  const nutrition = calculateNutritionScore({ dailyProteinG, proteinTargetG });

  const credo = calculateCredoScore({ strength, cardio, stability, nutrition });

  // Deltas vs the latest snapshot before this week.
  const prev = snapshots.find((s) => s.weekNumber < weekNumber) ?? null;
  const withDelta = (score: number, prevScore: number | null) => ({
    score,
    delta: prevScore != null ? score - prevScore : 0,
  });

  return {
    weekNumber,
    credo: withDelta(credo, prev ? prev.credoScore : null),
    strength: withDelta(strength, prev ? prev.strengthScore : null),
    stability: withDelta(stability, prev ? prev.stabilityScore : null),
    cardio: withDelta(cardio, prev ? prev.cardioScore : null),
    nutrition: withDelta(nutrition, prev ? prev.nutritionScore : null),
  };
}

/** Compute pillar scores and upsert the ScoreSnapshot for the current week. */
export async function snapshotScores(
  userId: string,
  now: Date = new Date(),
): Promise<PillarScoresDTO> {
  const dto = await computePillarScores(userId, now);
  await prisma.scoreSnapshot.upsert({
    where: { userId_weekNumber: { userId, weekNumber: dto.weekNumber } },
    create: {
      userId,
      weekNumber: dto.weekNumber,
      credoScore: dto.credo.score,
      strengthScore: dto.strength.score,
      stabilityScore: dto.stability.score,
      cardioScore: dto.cardio.score,
      nutritionScore: dto.nutrition.score,
    },
    update: {
      credoScore: dto.credo.score,
      strengthScore: dto.strength.score,
      stabilityScore: dto.stability.score,
      cardioScore: dto.cardio.score,
      nutritionScore: dto.nutrition.score,
    },
  });
  return dto;
}

/** Detailed Strength Score for GET /api/scores/strength. */
export async function computeStrengthScoreResult(
  userId: string,
  now: Date = new Date(),
): Promise<StrengthScoreResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  const profile = profileFromUser(user);

  const [logs, benchmarkRows, snapshots] = await Promise.all([
    prisma.exerciseLog.findMany({
      where: { userId, date: { gte: addDays(now, -120) } },
      include: { sets: true },
      orderBy: { date: "desc" },
      take: 800,
    }),
    prisma.benchmarkResult.findMany({
      where: { userId },
      orderBy: { testedAt: "desc" },
    }),
    prisma.scoreSnapshot.findMany({
      where: { userId },
      orderBy: { weekNumber: "desc" },
    }),
  ]);

  return calculateStrengthScore({
    profile,
    exerciseHistory: scoringHistory(historyFromLogs(logs)),
    benchmarkResults: latestBenchmarkInputs(benchmarkRows),
    standardsLookup: standardsLookupFor(profile.experienceLevel),
    priorScores: snapshots.map((s) => ({
      date: s.date.toISOString(),
      overall: s.strengthScore,
    })),
    now,
  });
}

// ── Benchmarks ──────────────────────────────────────────────────────────────

function normalizeBenchmarkName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Library exercise id for a Credo Ten strength benchmark, by name match
 * ("Hex Bar Deadlift" ≙ the library's "Trap Bar Deadlift").
 */
export function libraryLiftIdForBenchmark(benchmarkName: string): string | null {
  const wanted = normalizeBenchmarkName(
    benchmarkName.toLowerCase().replace(/hex\s*bar/, "trap bar"),
  );
  const match = EXERCISE_LIBRARY.find(
    (ex) => normalizeBenchmarkName(ex.name) === wanted,
  );
  return match ? match.id : null;
}

/** BenchmarkDTO list: CREDO_TEN definitions + user's latest/previous results. */
export async function benchmarkDTOsForUser(userId: string): Promise<BenchmarkDTO[]> {
  const rows = await prisma.benchmarkResult.findMany({
    where: { userId },
    orderBy: { testedAt: "desc" },
  });
  const byName = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = normalizeBenchmarkName(row.benchmarkName);
    const list = byName.get(key);
    if (list) list.push(row);
    else byName.set(key, [row]);
  }

  return CREDO_TEN.map((def) => {
    const results = byName.get(normalizeBenchmarkName(def.name)) ?? [];
    const latest = results[0];
    const previous = results[1];
    return {
      name: def.name,
      unit: def.unit,
      pillar: def.pillar,
      isInversed: def.isInversed ?? false,
      description: def.description,
      instructions: def.instructions,
      latest: latest
        ? {
            value: latest.value,
            percentile: latest.percentile,
            testedAt: latest.testedAt.toISOString(),
          }
        : null,
      previous: previous ? { value: previous.value } : null,
    };
  });
}
