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
