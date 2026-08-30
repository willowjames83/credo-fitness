// Handcrafted fixtures for the AI engine tests. Deliberately small and
// independent of src/services/data/** (built concurrently by another agent).

import type {
  Difficulty,
  Equipment,
  ExerciseDefinition,
  ExerciseHistoryEntry,
  MovementPattern,
  MuscleGroup,
  TrainingPreferencesInput,
  UserProfileInput,
} from "@/lib/types";

export function makeExercise(
  id: string,
  name: string,
  pattern: MovementPattern,
  primary: MuscleGroup[],
  equipment: Equipment[],
  difficulty: Difficulty = "beginner",
  secondary: MuscleGroup[] = [],
): ExerciseDefinition {
  return {
    id,
    name,
    primaryMuscles: primary,
    secondaryMuscles: secondary,
    equipment,
    movementPattern: pattern,
    difficulty,
    formCues: [`Cue for ${name}`],
    commonMistakes: [],
    alternatives: [],
  };
}

export const LIBRARY: ExerciseDefinition[] = [
  makeExercise("back_squat", "Back Squat", "squat", ["quads", "glutes"], ["barbell", "rack"], "intermediate", ["hamstrings", "core"]),
  makeExercise("goblet_squat", "Goblet Squat", "squat", ["quads", "glutes"], ["dumbbell"], "beginner", ["core"]),
  makeExercise("air_squat", "Air Squat", "squat", ["quads", "glutes"], ["bodyweight"], "beginner"),
  makeExercise("bench_press", "Bench Press", "push", ["chest"], ["barbell", "bench"], "intermediate", ["triceps", "shoulders"]),
  makeExercise("pushup", "Push-Up", "push", ["chest"], ["bodyweight"], "beginner", ["triceps", "core"]),
  makeExercise("ohp", "Overhead Press", "push", ["shoulders"], ["barbell"], "intermediate", ["triceps"]),
  makeExercise("deadlift", "Deadlift", "hinge", ["hamstrings", "glutes", "back"], ["barbell"], "intermediate", ["traps", "forearms"]),
  makeExercise("glute_bridge", "Glute Bridge", "hinge", ["glutes"], ["bodyweight"], "beginner", ["hamstrings"]),
  makeExercise("barbell_row", "Barbell Row", "pull", ["back"], ["barbell"], "intermediate", ["biceps"]),
  makeExercise("pullup", "Pull-Up", "pull", ["back", "biceps"], ["pull_up_bar", "bodyweight"], "intermediate", ["forearms"]),
  makeExercise("dumbbell_curl", "Dumbbell Curl", "isolation", ["biceps"], ["dumbbell"], "beginner"),
  makeExercise("lateral_raise", "Lateral Raise", "isolation", ["shoulders"], ["dumbbell"], "beginner"),
  makeExercise("leg_curl", "Leg Curl", "isolation", ["hamstrings"], ["machine"], "beginner"),
  makeExercise("band_pull_apart", "Band Pull-Apart", "isolation", ["shoulders"], ["bands"], "beginner", ["back"]),
  makeExercise("plank", "Plank", "core", ["core"], ["bodyweight"], "beginner"),
  makeExercise("bird_dog", "Bird Dog", "core", ["core"], ["bodyweight"], "beginner", ["glutes"]),
  makeExercise("dead_bug", "Dead Bug", "core", ["core"], ["bodyweight"], "beginner"),
  makeExercise("farmer_carry", "Farmer Carry", "carry", ["forearms", "traps"], ["dumbbell"], "beginner", ["core"]),
  makeExercise("nordic_curl", "Nordic Curl", "isolation", ["hamstrings"], ["bodyweight"], "advanced"),
];

export const PROFILE: UserProfileInput = {
  age: 40,
  sex: "male",
  weight: 185,
  experienceLevel: "intermediate",
};

export const PREFERENCES: TrainingPreferencesInput = {
  goal: "build_muscle",
  daysPerWeek: 4,
  sessionDuration: 60,
  preferredSplit: "ai_optimized",
  availableEquipment: [
    "barbell", "dumbbell", "bench", "rack", "pull_up_bar", "bodyweight", "bands", "machine",
  ],
  trainingLocation: "commercial_gym",
  enableSupersets: false,
  varietyLevel: "medium",
};

export const NOW = new Date("2026-08-30T12:00:00.000Z");

export function daysAgo(days: number, from: Date = NOW): string {
  return new Date(from.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function historyEntry(
  exerciseId: string,
  date: string,
  sets: [weight: number, reps: number][],
  extras: Partial<ExerciseHistoryEntry> = {},
): ExerciseHistoryEntry {
  return {
    exerciseId,
    date,
    sets: sets.map(([weight, reps], i) => ({ setNumber: i + 1, weight, reps })),
    estimated1RM: null,
    ...extras,
  };
}
