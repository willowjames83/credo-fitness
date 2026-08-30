// recovery-tracker.ts
// Muscle fatigue / recovery estimation (PRD 3.1 Step 2 inputs).
// Pure module: `now` is always injected, never read from the clock.

import type {
  Difficulty,
  FatigueLevel,
  MuscleGroup,
  MuscleRecoveryState,
  UserProfileInput,
} from "@/lib/types";

const HOUR_MS = 60 * 60 * 1000;

const EXPERIENCE_RECOVERY_MULTIPLIER: Record<Difficulty, number> = {
  // Beginners recover slower per session per the PRD science notes.
  beginner: 1.25,
  intermediate: 1.0,
  advanced: 0.9,
};

/**
 * Recovery window in hours for a muscle group after a session.
 * Base 48h, scaled up with per-session volume (sets), scaled by experience.
 * Clamped to a 24-96h range (~48-72h for typical volumes).
 */
export function recoveryWindowHours(
  sets: number,
  experienceLevel: Difficulty | null,
): number {
  const base = 48;
  const volumeBonus = Math.min(24, Math.max(0, (sets - 3) * 6));
  const mult = EXPERIENCE_RECOVERY_MULTIPLIER[experienceLevel ?? "beginner"];
  return Math.min(96, Math.max(24, Math.round((base + volumeBonus) * mult)));
}

/**
 * Fatigue level for a state at a given time:
 * - past the estimated recovery date → "fresh"
 * - past the halfway point of the window → "recovering"
 * - otherwise → "fatigued"
 */
export function fatigueLevelFor(state: MuscleRecoveryState, now: Date): FatigueLevel {
  const trained = Date.parse(state.lastTrainedDate);
  const recovered = Date.parse(state.estimatedRecoveryDate);
  if (Number.isNaN(trained) || Number.isNaN(recovered) || now.getTime() >= recovered) {
    return "fresh";
  }
  const elapsed = now.getTime() - trained;
  const window = recovered - trained;
  if (window <= 0) return "fresh";
  return elapsed / window >= 0.5 ? "recovering" : "fatigued";
}

export interface TrainedGroupVolume {
  group: MuscleGroup;
  sets: number;
}

/**
 * Update recovery states after a workout. Trained groups get a new window
 * scaled by volume + experience; untouched groups have their fatigue level
 * refreshed against `now`. Groups trained for the first time get new states.
 */
export function updateRecoveryAfterWorkout(
  states: MuscleRecoveryState[],
  trainedGroups: TrainedGroupVolume[],
  profile: UserProfileInput,
  now: Date,
): MuscleRecoveryState[] {
  const trainedMap = new Map<MuscleGroup, number>();
  for (const t of trainedGroups) {
    trainedMap.set(t.group, (trainedMap.get(t.group) ?? 0) + t.sets);
  }

  const makeTrainedState = (group: MuscleGroup, sets: number): MuscleRecoveryState => {
    const hours = recoveryWindowHours(sets, profile.experienceLevel);
    const state: MuscleRecoveryState = {
      muscleGroup: group,
      lastTrainedDate: now.toISOString(),
      volumeLastSession: sets,
      estimatedRecoveryDate: new Date(now.getTime() + hours * HOUR_MS).toISOString(),
      fatigueLevel: "fatigued",
    };
    state.fatigueLevel = fatigueLevelFor(state, now);
    return state;
  };

  const seen = new Set<MuscleGroup>();
  const next: MuscleRecoveryState[] = states.map((state) => {
    seen.add(state.muscleGroup);
    const sets = trainedMap.get(state.muscleGroup);
    if (sets != null) {
      return makeTrainedState(state.muscleGroup, sets);
    }
    return { ...state, fatigueLevel: fatigueLevelFor(state, now) };
  });

  for (const [group, sets] of trainedMap) {
    if (!seen.has(group)) next.push(makeTrainedState(group, sets));
  }

  return next;
}

/** Muscle groups whose current fatigue level (relative to `now`) is not "fatigued". */
export function groupsAvailableForTraining(
  states: MuscleRecoveryState[],
  now: Date,
): MuscleGroup[] {
  return states
    .filter((s) => fatigueLevelFor(s, now) !== "fatigued")
    .map((s) => s.muscleGroup);
}

/** Hours since a muscle group was last trained; Infinity if never / unknown. */
export function hoursSinceTrained(state: MuscleRecoveryState | undefined, now: Date): number {
  if (!state) return Infinity;
  const trained = Date.parse(state.lastTrainedDate);
  if (Number.isNaN(trained)) return Infinity;
  return (now.getTime() - trained) / HOUR_MS;
}
