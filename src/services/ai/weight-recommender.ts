// weight-recommender.ts
// 1RM estimation + goal-based weight recommendations + progressive overload.
// Pure module: all data arrives as parameters, time is always injected.
// Ports logic from the iOS ProgressionEngine.swift / OverloadEngine.swift.

import type {
  Difficulty,
  ExerciseDefinition,
  ExerciseHistoryEntry,
  TrainingGoal,
  UserProfileInput,
} from "@/lib/types";

/** Epley formula: weight x (1 + reps / 30). 1 rep returns the weight itself. */
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Round to the nearest increment (usually 5 lbs). */
export function roundToIncrement(weight: number, increment: number): number {
  if (increment <= 0) return weight;
  return Math.round(weight / increment) * increment;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Best estimated 1RM across all sets logged within `windowDays` of `now`.
 * Considers both the stored per-session estimated1RM and a fresh Epley
 * calculation over each set, taking the max. Returns null with no data.
 */
export function best1RMFromHistory(
  entries: ExerciseHistoryEntry[],
  windowDays: number,
  now: Date,
): number | null {
  const cutoff = now.getTime() - windowDays * DAY_MS;
  let best = 0;
  for (const entry of entries) {
    const t = Date.parse(entry.date);
    if (Number.isNaN(t) || t < cutoff || t > now.getTime() + DAY_MS) continue;
    if (entry.estimated1RM != null && entry.estimated1RM > best) {
      best = entry.estimated1RM;
    }
    for (const set of entry.sets) {
      const e = epley1RM(set.weight, set.reps);
      if (e > best) best = e;
    }
  }
  return best > 0 ? best : null;
}

export interface WeightRecommendation {
  weight: number;
  repRange: [number, number];
  /** Fraction of 1RM actually used for the recommendation (midpoint of goal band). */
  pctOf1RM: number;
}

interface IntensityBand {
  pctRange: [number, number];
  repRange: [number, number];
}

/** PRD Step 4 goal → intensity table. */
export const GOAL_INTENSITY: Record<TrainingGoal, IntensityBand> = {
  build_muscle: { pctRange: [0.65, 0.75], repRange: [8, 12] },
  increase_strength: { pctRange: [0.8, 0.9], repRange: [3, 6] },
  get_lean: { pctRange: [0.55, 0.65], repRange: [12, 15] },
  general_fitness: { pctRange: [0.65, 0.8], repRange: [6, 10] },
  longevity: { pctRange: [0.65, 0.8], repRange: [6, 10] },
};

/**
 * Recommend a working weight from an estimated 1RM given the training goal.
 * Uses the midpoint of the PRD intensity band, rounded to the increment.
 */
export function recommendWeight(params: {
  goal: TrainingGoal;
  estimated1RM: number;
  roundingIncrement?: number;
}): WeightRecommendation {
  const { goal, estimated1RM } = params;
  const increment = params.roundingIncrement ?? 5;
  const band = GOAL_INTENSITY[goal];
  const pct = (band.pctRange[0] + band.pctRange[1]) / 2;
  const weight = Math.max(0, roundToIncrement(estimated1RM * pct, increment));
  return { weight, repRange: [...band.repRange] as [number, number], pctOf1RM: pct };
}

export type ProgressionAction = "deload" | "increase" | "hold";

export interface ProgressionResult {
  weight: number;
  action: ProgressionAction;
  reason: string;
}

function sortByDateAsc(entries: ExerciseHistoryEntry[]): ExerciseHistoryEntry[] {
  return [...entries].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

/**
 * Fatigue detection per PRD: declining reps at the same weight within the
 * most recent session (e.g. 8, 7, 5 at 185).
 */
export function detectFatigue(lastSession: ExerciseHistoryEntry | undefined): boolean {
  if (!lastSession || lastSession.sets.length < 2) return false;
  const sets = [...lastSession.sets].sort((a, b) => a.setNumber - b.setNumber);
  let declines = 0;
  let comparisons = 0;
  for (let i = 1; i < sets.length; i++) {
    if (sets[i].weight === sets[i - 1].weight) {
      comparisons++;
      if (sets[i].reps < sets[i - 1].reps) declines++;
    }
  }
  // Declining on every same-weight comparison = fatigued session.
  return comparisons > 0 && declines === comparisons && declines >= 1;
}

/** Did the session hit the top of the target rep range on every working set? */
function hitAllTargetReps(entry: ExerciseHistoryEntry, targetRepRange: [number, number]): boolean {
  if (entry.sets.length === 0) return false;
  return entry.sets.every((s) => s.reps >= targetRepRange[1]);
}

/**
 * PRD progression rules:
 * - Fatigue (declining reps at same weight in last session) → reduce 5%.
 * - Last 2 sessions hit all target reps → increase 2.5-5%
 *   (5% for lighter loads where 2.5% would round away, 2.5% for heavy loads).
 * - Otherwise hold.
 */
export function applyProgression(params: {
  history: ExerciseHistoryEntry[];
  targetRepRange: [number, number];
  currentWeight: number;
  roundingIncrement?: number;
}): ProgressionResult {
  const { history, targetRepRange, currentWeight } = params;
  const increment = params.roundingIncrement ?? 5;
  const sorted = sortByDateAsc(history);
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  if (detectFatigue(last)) {
    const weight = roundToIncrement(currentWeight * 0.95, increment);
    return {
      weight: Math.min(weight, currentWeight),
      action: "deload",
      reason: "Reps declined at the same weight last session — backing off 5% to recover.",
    };
  }

  if (
    last &&
    prev &&
    hitAllTargetReps(last, targetRepRange) &&
    hitAllTargetReps(prev, targetRepRange)
  ) {
    // 2.5% on heavier loads, 5% on lighter loads; always at least one increment.
    const pct = currentWeight >= 200 ? 0.025 : 0.05;
    const raw = currentWeight * (1 + pct);
    const weight = Math.max(roundToIncrement(raw, increment), currentWeight + increment);
    return {
      weight,
      action: "increase",
      reason: `Hit ${targetRepRange[1]}+ reps on every set two sessions in a row — time to add weight.`,
    };
  }

  return {
    weight: roundToIncrement(currentWeight, increment),
    action: "hold",
    reason: "Keep building at this weight until you own the full rep range.",
  };
}

/**
 * Optional injected demographic lookup: returns an absolute 1RM estimate (lbs)
 * for the given exercise/profile at roughly the 40th percentile, or null.
 */
export type DemographicLookup = (
  exercise: ExerciseDefinition,
  profile: UserProfileInput,
) => number | null;

// Conservative 40th-percentile relative-strength baselines (1RM / bodyweight)
// by movement pattern, for an intermediate 30-year-old male. Derived from the
// StrengthStandards tables in the iOS app (interpolated between p25 and p50).
const BASE_RELATIVE_STRENGTH: Record<ExerciseDefinition["movementPattern"], number> = {
  squat: 0.95,
  hinge: 1.1,
  push: 0.7,
  pull: 0.65,
  carry: 0.5,
  core: 0.3,
  isolation: 0.25,
};

const EXPERIENCE_MULTIPLIER: Record<Difficulty, number> = {
  beginner: 0.65,
  intermediate: 1.0,
  advanced: 1.3,
};

/**
 * Conservative starting 1RM when a user has no history for an exercise.
 * Uses an injected percentile lookup when provided, otherwise falls back to
 * hardcoded 40th-percentile baselines adjusted for sex, age, and experience
 * (PRD Decision 4: start too light rather than too heavy).
 */
export function demographicEstimate1RM(params: {
  profile: UserProfileInput;
  exercise: ExerciseDefinition;
  percentileLookup?: DemographicLookup;
}): number {
  const { profile, exercise, percentileLookup } = params;

  if (percentileLookup) {
    const looked = percentileLookup(exercise, profile);
    if (looked != null && looked > 0) return roundToIncrement(looked, 5);
  }

  const bodyweight = profile.weight ?? 170;
  const base = BASE_RELATIVE_STRENGTH[exercise.movementPattern];
  const sexMult = profile.sex === "female" ? 0.6 : 1.0;
  const age = profile.age ?? 30;
  const ageMult = age > 40 ? Math.max(0.7, 1 - (age - 40) * 0.01) : 1.0;
  const expMult = EXPERIENCE_MULTIPLIER[profile.experienceLevel ?? "beginner"];

  const estimate = bodyweight * base * sexMult * ageMult * expMult;
  return Math.max(5, roundToIncrement(estimate, 5));
}
