// workout-generator.ts
// The core adaptive engine: PRD 3.1 WORKOUT GENERATION ALGORITHM Steps 1-7.
// Pure and deterministic: all data and time are injected; tie-breaking
// rotation is keyed on weekNumber/dayNumber (no randomness).

import type {
  ExerciseDefinition,
  ExerciseHistoryEntry,
  GeneratedWorkoutPlan,
  MuscleGroup,
  MuscleRecoveryState,
  PlannedExerciseSpec,
  SplitDay,
  TrainingPreferencesInput,
  UserProfileInput,
} from "@/lib/types";
import {
  applyProgression,
  best1RMFromHistory,
  demographicEstimate1RM,
  recommendWeight,
  type DemographicLookup,
} from "./weight-recommender";
import {
  fatigueLevelFor,
  hoursSinceTrained,
  updateRecoveryAfterWorkout,
} from "./recovery-tracker";
import { isCompound, selectExercises } from "./exercise-selector";

// ── Step 1: Split determination ─────────────────────────────────────────────

const PUSH: MuscleGroup[] = ["chest", "shoulders", "triceps"];
const PULL: MuscleGroup[] = ["back", "biceps", "traps", "forearms"];
const LEGS: MuscleGroup[] = ["quads", "hamstrings", "glutes", "calves", "core"];
const UPPER: MuscleGroup[] = ["chest", "back", "shoulders", "biceps", "triceps"];
const LOWER: MuscleGroup[] = ["quads", "hamstrings", "glutes", "calves", "core"];
const FULL: MuscleGroup[] = [
  "chest", "back", "shoulders", "quads", "hamstrings", "glutes", "core",
];

interface SplitTemplate {
  name: string;
  days: { label: string; muscleGroups: MuscleGroup[] }[];
}

function cycle<T>(items: T[], length: number): T[] {
  return Array.from({ length }, (_, i) => items[i % items.length]);
}

/**
 * PRD Step 1: use preferredSplit when it names a concrete split, otherwise
 * calculate the optimal split from daysPerWeek:
 * 2d → Full Body, 3d → Push/Pull/Legs (or Full Body), 4d → Upper/Lower,
 * 5-6d → Push/Pull/Legs cycled.
 */
export function determineSplit(preferences: TrainingPreferencesInput): SplitDay[] {
  const days = Math.min(6, Math.max(2, Math.round(preferences.daysPerWeek)));
  const preferred = preferences.preferredSplit;

  const fullBody: SplitTemplate = {
    name: "Full Body",
    days: cycle([{ label: "Full Body", muscleGroups: FULL }], days),
  };
  const upperLower: SplitTemplate = {
    name: "Upper/Lower",
    days: cycle(
      [
        { label: "Upper Body", muscleGroups: UPPER },
        { label: "Lower Body", muscleGroups: LOWER },
      ],
      days,
    ),
  };
  const ppl: SplitTemplate = {
    name: "Push/Pull/Legs",
    days: cycle(
      [
        { label: "Push", muscleGroups: PUSH },
        { label: "Pull", muscleGroups: PULL },
        { label: "Legs", muscleGroups: LEGS },
      ],
      days,
    ),
  };
  const broSplit: SplitTemplate = {
    name: "Bro Split",
    days: cycle(
      [
        { label: "Chest", muscleGroups: ["chest", "triceps"] },
        { label: "Back", muscleGroups: ["back", "biceps", "traps"] },
        { label: "Legs", muscleGroups: LEGS },
        { label: "Shoulders", muscleGroups: ["shoulders", "traps", "core"] },
        { label: "Arms", muscleGroups: ["biceps", "triceps", "forearms", "core"] },
      ],
      days,
    ),
  };

  let template: SplitTemplate;
  switch (preferred) {
    case "full_body":
      template = fullBody;
      break;
    case "upper_lower":
      template = upperLower;
      break;
    case "push_pull_legs":
      template = ppl;
      break;
    case "bro_split":
      template = broSplit;
      break;
    default: {
      // ai_optimized / ai_recovery / custom → calculate from daysPerWeek.
      if (days === 2) template = fullBody;
      else if (days === 3) template = ppl;
      else if (days === 4) template = upperLower;
      else template = ppl; // 5-6 days
    }
  }

  return template.days.map((d, i) => ({
    dayNumber: i + 1,
    label: d.label,
    muscleGroups: d.muscleGroups,
    isRestDay: false,
  }));
}

/** Human-readable split name for a preferences object. */
export function splitTypeName(preferences: TrainingPreferencesInput): string {
  const days = Math.min(6, Math.max(2, Math.round(preferences.daysPerWeek)));
  switch (preferences.preferredSplit) {
    case "full_body": return "Full Body";
    case "upper_lower": return "Upper/Lower";
    case "push_pull_legs": return "Push/Pull/Legs";
    case "bro_split": return "Bro Split";
    case "custom": return days === 2 ? "Full Body" : days === 4 ? "Upper/Lower" : days === 3 ? "Push/Pull/Legs" : "Push/Pull/Legs";
    default:
      if (days === 2) return "Full Body";
      if (days === 3) return "Push/Pull/Legs";
      if (days === 4) return "Upper/Lower";
      return "Push/Pull/Legs";
  }
}

// ── Step 2: Muscle group selection helpers ──────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Groups planned in recent sessions but never actually logged in the last
 * 7 days — the user skipped them, so their priority is boosted (PRD Step 2).
 */
export function detectSkippedGroups(
  recentPlans: GeneratedWorkoutPlan[],
  history: ExerciseHistoryEntry[],
  library: ExerciseDefinition[],
  now: Date,
): MuscleGroup[] {
  const byId = new Map(library.map((ex) => [ex.id, ex]));
  const weekAgo = now.getTime() - 7 * DAY_MS;

  const trainedGroups = new Set<MuscleGroup>();
  for (const entry of history) {
    const t = Date.parse(entry.date);
    if (Number.isNaN(t) || t < weekAgo) continue;
    const ex = byId.get(entry.exerciseId);
    if (!ex) continue;
    for (const m of ex.primaryMuscles) trainedGroups.add(m);
  }

  const plannedGroups = new Set<MuscleGroup>();
  for (const plan of recentPlans) {
    for (const planned of plan.exercises) {
      if (planned.isWarmup) continue;
      const ex = byId.get(planned.exerciseId);
      if (!ex) continue;
      for (const m of ex.primaryMuscles) plannedGroups.add(m);
    }
  }

  return [...plannedGroups].filter((g) => !trainedGroups.has(g));
}

// ── Steps 5-6: volume + rest tables ─────────────────────────────────────────

function compoundSets(experience: UserProfileInput["experienceLevel"], daysPerWeek: number): number {
  const base = experience === "advanced" ? 5 : experience === "intermediate" ? 4 : 3;
  // More sessions per week = less volume per session (PRD Step 5).
  return Math.max(3, base - (daysPerWeek >= 5 ? 1 : 0));
}

function isolationSets(experience: UserProfileInput["experienceLevel"], daysPerWeek: number): number {
  const base = experience === "advanced" ? 4 : experience === "intermediate" ? 3 : 2;
  return Math.max(2, base - (daysPerWeek >= 5 ? 1 : 0));
}

function restPeriodFor(exercise: ExerciseDefinition, pctOf1RM: number): number {
  if (isCompound(exercise)) {
    return pctOf1RM >= 0.8 ? 240 : 150; // heavy 180-300s, moderate 120-180s
  }
  return 75; // isolation / core / carry: 60-90s
}

// ── Main generator ──────────────────────────────────────────────────────────

export interface GenerateWorkoutParams {
  profile: UserProfileInput;
  preferences: TrainingPreferencesInput;
  history: ExerciseHistoryEntry[];
  recoveryStates: MuscleRecoveryState[];
  library: ExerciseDefinition[];
  weekNumber: number;
  dayNumber: number; // 1-based training day within the split
  recentPlans?: GeneratedWorkoutPlan[];
  standardsLookup?: DemographicLookup;
  now: Date;
}

/** PRD 3.1 Steps 1-7: generate a single adaptive workout for one training day. */
export function generateWorkout(params: GenerateWorkoutParams): GeneratedWorkoutPlan {
  const {
    profile, preferences, history, recoveryStates, library,
    weekNumber, dayNumber, recentPlans = [], standardsLookup, now,
  } = params;

  const byId = new Map(library.map((ex) => [ex.id, ex]));
  const stateByGroup = new Map(recoveryStates.map((s) => [s.muscleGroup, s]));

  // Step 1: split.
  const split = determineSplit(preferences);
  const splitDay = split[(dayNumber - 1) % split.length];

  // Step 2: today's muscle groups = split day's groups, minus fatigued ones,
  // plus skipped groups boosted to the front, ordered by time since trained.
  const exclude = new Set(preferences.muscleGroupExclude ?? []);
  const skipped = detectSkippedGroups(recentPlans, history, library, now).filter(
    (g) => !exclude.has(g),
  );

  const notFatigued = (g: MuscleGroup): boolean => {
    const state = stateByGroup.get(g);
    return !state || fatigueLevelFor(state, now) !== "fatigued";
  };

  let targetGroups = splitDay.muscleGroups.filter(
    (g) => !exclude.has(g) && notFatigued(g),
  );
  // Never generate an empty session: if recovery filtered everything out,
  // fall back to the split day's non-excluded groups.
  if (targetGroups.length === 0) {
    targetGroups = splitDay.muscleGroups.filter((g) => !exclude.has(g));
  }
  // Skipped-group boost: prepend recoverable skipped groups not already present.
  for (const g of [...skipped].reverse()) {
    if (notFatigued(g) && !targetGroups.includes(g)) targetGroups.unshift(g);
  }
  // Prioritize groups longest since trained (deterministic).
  targetGroups = [...targetGroups].sort((a, b) => {
    const skippedA = skipped.includes(a) ? 0 : 1;
    const skippedB = skipped.includes(b) ? 0 : 1;
    if (skippedA !== skippedB) return skippedA - skippedB;
    const hA = hoursSinceTrained(stateByGroup.get(a), now);
    const hB = hoursSinceTrained(stateByGroup.get(b), now);
    if (hA !== hB) return hB - hA;
    return a.localeCompare(b);
  });

  // Step 3: exercise selection (variety rotation seeded on week/day).
  const recentExerciseIds = [
    ...[...history]
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .map((h) => h.exerciseId),
    ...recentPlans.flatMap((p) => p.exercises.filter((e) => !e.isWarmup).map((e) => e.exerciseId)),
  ];
  const focus = (preferences.muscleGroupFocus ?? []).filter((g) => !exclude.has(g));

  const chosen = selectExercises({
    targetGroups,
    library,
    equipment: preferences.availableEquipment,
    experienceLevel: profile.experienceLevel,
    sessionDuration: preferences.sessionDuration,
    varietyLevel: preferences.varietyLevel,
    recentExerciseIds,
    focus,
    exclude: [...exclude],
    rotationSeed: weekNumber * 7 + dayNumber,
  });

  // Steps 4-6: weights, volume, rest — one planned spec per working exercise.
  const working: PlannedExerciseSpec[] = chosen.map((exercise, index) => {
    const exHistory = history.filter((h) => h.exerciseId === exercise.id);
    const hasHistory = exHistory.length > 0;

    const estimated1RM =
      best1RMFromHistory(exHistory, 90, now) ??
      demographicEstimate1RM({ profile, exercise, percentileLookup: standardsLookup });

    const rec = recommendWeight({ goal: preferences.goal, estimated1RM });

    let weight = rec.weight;
    let rationale: string;
    if (hasHistory) {
      const lastSession = [...exHistory].sort(
        (a, b) => Date.parse(a.date) - Date.parse(b.date),
      )[exHistory.length - 1];
      const lastWeight = Math.max(...lastSession.sets.map((s) => s.weight), 0);
      const base = lastWeight > 0 ? lastWeight : rec.weight;
      const prog = applyProgression({
        history: exHistory,
        targetRepRange: rec.repRange,
        currentWeight: base,
      });
      weight = prog.weight;
      const delta = Math.abs(weight - base);
      if (prog.action === "increase") {
        const setCount = lastSession.sets.length;
        rationale = `Up ${delta} lb — you hit ${setCount}×${rec.repRange[1]}+ at ${base} twice in a row.`;
      } else if (prog.action === "deload") {
        rationale = `Down ${delta} lb — reps slipped at ${base} last session. Recover, then rebuild.`;
      } else {
        rationale = `Holding at ${weight} lb — own ${rec.repRange[0]}-${rec.repRange[1]} reps on every set before moving up.`;
      }
    } else {
      rationale = `Starting at ${weight} lb (~${Math.round(rec.pctOf1RM * 100)}% of your estimated max) — a conservative first prescription. Bump it up if it feels easy.`;
    }

    const isComp = isCompound(exercise);
    let sets = isComp
      ? compoundSets(profile.experienceLevel, preferences.daysPerWeek)
      : isolationSets(profile.experienceLevel, preferences.daysPerWeek);
    // Recovery-state adjustment: still-recovering primary group → one set less.
    const primaryState = stateByGroup.get(exercise.primaryMuscles[0]);
    if (primaryState && fatigueLevelFor(primaryState, now) === "recovering") {
      sets = Math.max(2, sets - 1);
    }

    return {
      exerciseId: exercise.id,
      order: index,
      targetSets: sets,
      targetReps: rec.repRange,
      recommendedWeight: weight,
      restPeriod: restPeriodFor(exercise, rec.pctOf1RM),
      rationale,
    };
  });

  // Step 7: warmup sets (50% / 70% of working weight) for first 2 compounds.
  const finalExercises: PlannedExerciseSpec[] = [];
  let warmupCount = 0;
  for (const spec of working) {
    const exercise = byId.get(spec.exerciseId);
    if (exercise && isCompound(exercise) && warmupCount < 2 && spec.recommendedWeight > 0) {
      for (const pct of [0.5, 0.7]) {
        finalExercises.push({
          exerciseId: spec.exerciseId,
          order: 0, // re-numbered below
          targetSets: 1,
          targetReps: pct === 0.5 ? [5, 8] : [3, 5],
          recommendedWeight: Math.max(0, Math.round((spec.recommendedWeight * pct) / 5) * 5),
          restPeriod: 60,
          isWarmup: true,
          rationale: `Warmup at ${Math.round(pct * 100)}% of your working weight.`,
        });
      }
      warmupCount++;
    }
    finalExercises.push(spec);
  }
  finalExercises.forEach((spec, i) => { spec.order = i + 1; });

  const estimatedDuration = Math.round(working.length * 8 + warmupCount * 2 * 2);

  return {
    weekNumber,
    dayNumber,
    totalDays: preferences.daysPerWeek,
    splitType: splitTypeName(preferences),
    focus: `${splitDay.label} — ${targetGroups.slice(0, 3).join(", ")}`,
    exercises: finalExercises,
    estimatedDuration,
    includesWarmup: warmupCount > 0,
  };
}

/**
 * Generate the full training week honoring the split. Recovery is simulated
 * forward between days (assuming each generated session is completed), with
 * training days spread evenly across the 7-day week. Deterministic.
 */
export function generateWeek(
  params: Omit<GenerateWorkoutParams, "dayNumber">,
): GeneratedWorkoutPlan[] {
  const { preferences, library, now } = params;
  const days = Math.min(6, Math.max(2, Math.round(preferences.daysPerWeek)));
  const byId = new Map(library.map((ex) => [ex.id, ex]));
  const spacingMs = (7 / days) * DAY_MS;

  let recoveryStates = params.recoveryStates;
  const recentPlans = [...(params.recentPlans ?? [])];
  const plans: GeneratedWorkoutPlan[] = [];

  for (let day = 1; day <= days; day++) {
    const dayDate = new Date(now.getTime() + (day - 1) * spacingMs);
    const plan = generateWorkout({
      ...params,
      recoveryStates,
      recentPlans,
      dayNumber: day,
      now: dayDate,
    });
    plans.push(plan);
    recentPlans.push(plan);

    // Simulate recovery: assume the session is completed as planned.
    const volume = new Map<MuscleGroup, number>();
    for (const spec of plan.exercises) {
      if (spec.isWarmup) continue;
      const ex = byId.get(spec.exerciseId);
      if (!ex) continue;
      for (const m of ex.primaryMuscles) {
        volume.set(m, (volume.get(m) ?? 0) + spec.targetSets);
      }
    }
    recoveryStates = updateRecoveryAfterWorkout(
      recoveryStates,
      [...volume.entries()].map(([group, sets]) => ({ group, sets })),
      params.profile,
      dayDate,
    );
  }

  return plans;
}
