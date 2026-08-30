// Shared domain types for the Credo adaptive training engine.
// These mirror the PRD (PRD-adaptive-training-engine.md) and the Prisma schema.
// String-literal unions are stored as plain strings in Postgres.

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "forearms"
  | "traps";

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps", "quads",
  "hamstrings", "glutes", "calves", "core", "forearms", "traps",
];

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "bands"
  | "pull_up_bar"
  | "bench"
  | "rack";

export const ALL_EQUIPMENT: Equipment[] = [
  "barbell", "dumbbell", "kettlebell", "cable", "machine",
  "bodyweight", "bands", "pull_up_bar", "bench", "rack",
];

export type MovementPattern =
  | "push"
  | "pull"
  | "hinge"
  | "squat"
  | "carry"
  | "core"
  | "isolation";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type TrainingGoal =
  | "build_muscle"
  | "increase_strength"
  | "get_lean"
  | "general_fitness"
  | "longevity";

export type TrainingLocation = "home" | "commercial_gym" | "outdoor" | "mixed";

export type VarietyLevel = "low" | "medium" | "high";

export type FatigueLevel = "fresh" | "recovering" | "fatigued";

export type Sex = "male" | "female";

export type SplitType =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "bro_split"
  | "custom";

export interface ExerciseDefinition {
  id: string; // stable slug
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  movementPattern: MovementPattern;
  difficulty: Difficulty;
  videoUrl?: string;
  thumbnailUrl?: string;
  formCues: string[];
  commonMistakes: string[];
  alternatives: string[]; // exercise ids
}

export interface CompletedSetInput {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  restDuration?: number;
}

export interface ExerciseHistoryEntry {
  exerciseId: string;
  date: string; // ISO
  sets: CompletedSetInput[];
  estimated1RM: number | null;
  exertionRating?: number; // 1-5
}

export interface MuscleRecoveryState {
  muscleGroup: MuscleGroup;
  lastTrainedDate: string; // ISO
  volumeLastSession: number; // total sets
  estimatedRecoveryDate: string; // ISO
  fatigueLevel: FatigueLevel;
}

export interface TrainingPreferencesInput {
  goal: TrainingGoal;
  daysPerWeek: number; // 2-6
  sessionDuration: number; // minutes 30-90
  preferredSplit: SplitType | "ai_optimized" | "ai_recovery";
  availableEquipment: Equipment[];
  trainingLocation: TrainingLocation;
  muscleGroupFocus?: MuscleGroup[];
  muscleGroupExclude?: MuscleGroup[];
  enableSupersets: boolean;
  varietyLevel: VarietyLevel;
}

export interface UserProfileInput {
  age: number | null;
  sex: Sex | null;
  weight: number | null; // lbs
  heightIn?: number | null;
  experienceLevel: Difficulty | null;
}

export interface PlannedExerciseSpec {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: [number, number];
  recommendedWeight: number;
  restPeriod: number; // seconds
  isSuperset?: boolean;
  supersetWith?: string;
  rationale?: string;
  isWarmup?: boolean;
}

export interface GeneratedWorkoutPlan {
  weekNumber: number;
  dayNumber: number;
  totalDays: number;
  splitType: string;
  focus: string;
  exercises: PlannedExerciseSpec[];
  estimatedDuration: number; // minutes
  includesWarmup: boolean;
}

export interface StrengthSubscore {
  category: StrengthCategory;
  score: number;
  keyLift: string;
  estimated1RM: number;
  relativeStrength: number;
  percentile: number;
}

export type StrengthCategory =
  | "Upper Push"
  | "Upper Pull"
  | "Lower Push"
  | "Lower Pull"
  | "Core"
  | "Grip"
  | "Carry"
  | "Muscular Endurance";

export interface StrengthScoreResult {
  overall: number;
  subscores: StrengthSubscore[];
  percentile: number;
  demographicContext: string;
  trend: "improving" | "stable" | "declining";
  trendDelta: number;
}

export interface StandardPercentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export interface SplitDay {
  dayNumber: number; // 1-7
  label: string;
  muscleGroups: MuscleGroup[];
  isRestDay: boolean;
}

export interface WorkoutSummaryShare {
  workoutName: string;
  date: string;
  duration: number; // minutes
  exercises: { name: string; bestSet: string; totalVolume: number }[];
  totalVolume: number;
  muscleGroups: MuscleGroup[];
}

// Autoregulation
export interface SetAdjustment {
  action: "reduce_weight" | "flag_increase" | "reduce_volume" | "none";
  nextSetWeight?: number;
  dropSets?: number;
  reason: string;
}

// API envelope used by all route handlers
export interface ApiSuccess<T> {
  data: T;
}
export interface ApiError {
  error: string;
}
