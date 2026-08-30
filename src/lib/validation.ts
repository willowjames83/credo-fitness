import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().positive().optional(),
  sex: z.string().optional(),
  weight: z.number().int().positive().optional(),
  experienceLevel: z.string().optional(),
  trainingGoal: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().positive().nullable().optional(),
  sex: z.string().nullable().optional(),
  weight: z.number().int().positive().nullable().optional(),
  experienceLevel: z.string().nullable().optional(),
  trainingGoal: z.string().nullable().optional(),
});

export const workoutSchema = z.object({
  date: z.string().datetime({ offset: true }).or(z.string().datetime()),
  dayLabel: z.string().min(1),
  programTemplate: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  exercises: z.any(),
  totalVolume: z.number().optional(),
});

export const scoreSnapshotSchema = z.object({
  weekNumber: z.number().int().positive(),
  credoScore: z.number().int(),
  strengthScore: z.number().int(),
  stabilityScore: z.number().int(),
  cardioScore: z.number().int(),
  nutritionScore: z.number().int(),
});

export const syncSchema = z.object({
  workouts: z.array(z.object({
    id: z.string().optional(),
    date: z.string(),
    dayLabel: z.string(),
    programTemplate: z.string().optional(),
    durationSeconds: z.number().int().optional(),
    exercises: z.any(),
    totalVolume: z.number().optional(),
  })).optional(),
  exercise1RMs: z.record(z.string(), z.number()).optional(),
  personalRecords: z.array(z.object({
    exerciseId: z.string(),
    previous1RM: z.number().optional(),
    new1RM: z.number(),
    setWeight: z.number(),
    setReps: z.number().int(),
    date: z.string().optional(),
  })).optional(),
  scoreSnapshots: z.array(z.object({
    weekNumber: z.number().int(),
    credoScore: z.number().int(),
    strengthScore: z.number().int(),
    stabilityScore: z.number().int(),
    cardioScore: z.number().int(),
    nutritionScore: z.number().int(),
    date: z.string().optional(),
  })).optional(),
  userProgram: z.object({
    programTemplate: z.string(),
    daysPerWeek: z.number().int(),
    currentWeek: z.number().int().optional(),
    currentDayIndex: z.number().int().optional(),
  }).optional(),
});

// ── Adaptive training engine schemas (append-only below this line) ──────────

const muscleGroupEnum = z.enum([
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads',
  'hamstrings', 'glutes', 'calves', 'core', 'forearms', 'traps',
]);

const equipmentEnum = z.enum([
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine',
  'bodyweight', 'bands', 'pull_up_bar', 'bench', 'rack',
]);

const trainingGoalEnum = z.enum([
  'build_muscle', 'increase_strength', 'get_lean', 'general_fitness', 'longevity',
]);

const splitEnum = z.enum([
  'full_body', 'upper_lower', 'push_pull_legs', 'bro_split', 'custom',
  'ai_optimized', 'ai_recovery',
]);

const trainingLocationEnum = z.enum(['home', 'commercial_gym', 'outdoor', 'mixed']);
const varietyLevelEnum = z.enum(['low', 'medium', 'high']);
const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);
const sexEnum = z.enum(['male', 'female']);

export const trainingPreferencesSchema = z.object({
  goal: trainingGoalEnum,
  daysPerWeek: z.number().int().min(2).max(6),
  sessionDuration: z.number().int().min(30).max(90),
  preferredSplit: splitEnum,
  availableEquipment: z.array(equipmentEnum),
  trainingLocation: trainingLocationEnum,
  muscleGroupFocus: z.array(muscleGroupEnum).optional(),
  muscleGroupExclude: z.array(muscleGroupEnum).optional(),
  enableSupersets: z.boolean(),
  varietyLevel: varietyLevelEnum,
});

export const preferencesUpdateSchema = trainingPreferencesSchema.partial();

export const onboardingCompleteSchema = z.object({
  profile: z.object({
    age: z.number().int().min(13).max(120),
    sex: sexEnum,
    weight: z.number().positive(),
    heightIn: z.number().positive().optional(),
    experienceLevel: difficultyEnum,
  }),
  preferences: trainingPreferencesSchema,
  benchmarks: z
    .array(z.object({ name: z.string().min(1), value: z.number().positive() }))
    .optional(),
});

export const generateWorkoutSchema = z.object({
  force: z.boolean().optional(),
});

export const completeWorkoutSchema = z.object({
  durationSeconds: z.number().int().min(0),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().min(1),
        exertionRating: z.number().int().min(1).max(5).optional(),
        sets: z
          .array(
            z.object({
              setNumber: z.number().int().min(1),
              weight: z.number().min(0),
              reps: z.number().int().min(0),
              rpe: z.number().int().min(1).max(10).optional(),
              restDuration: z.number().int().min(0).optional(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export const customizeWorkoutSchema = z.object({
  swaps: z
    .array(
      z.object({
        plannedExerciseId: z.string().min(1),
        newExerciseId: z.string().min(1),
      }),
    )
    .optional(),
  removeIds: z.array(z.string().min(1)).optional(),
  setChanges: z
    .array(
      z.object({
        plannedExerciseId: z.string().min(1),
        targetSets: z.number().int().min(1).max(10),
      }),
    )
    .optional(),
});

export const benchmarkLogSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
});

export const gymProfileCreateSchema = z.object({
  name: z.string().min(1).max(100),
  location: trainingLocationEnum,
  equipment: z.array(equipmentEnum),
  isDefault: z.boolean().optional(),
});

export const gymProfileUpdateSchema = gymProfileCreateSchema.partial();
