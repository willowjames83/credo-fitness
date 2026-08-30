// Shared helpers for the /api/share route family: share-code generation and
// the server-side payload builders for each SharedWorkout.type.
// (Not a route itself — the leading underscore keeps Next.js from treating
// it as one.)

import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { MuscleGroup, WorkoutSummaryShare } from '@/lib/types';
import { EXERCISES_BY_ID } from '@/services/data/exercise-library';

export const shareCreateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('split'), splitId: z.string().min(1) }),
  z.object({ type: z.literal('workout_summary'), workoutPlanId: z.string().min(1) }),
]);

/** 8-char alphanumeric (hex) code derived from a UUID. */
function randomShareCode(): string {
  return randomUUID().replace(/-/g, '').slice(0, 8);
}

/** Generate a shareCode with no existing SharedWorkout row, retrying on collision. */
export async function uniqueShareCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomShareCode();
    const existing = await prisma.sharedWorkout.findUnique({ where: { shareCode: code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique share code');
}

type PlanWithLogs = Prisma.WorkoutPlanGetPayload<{
  include: { exerciseLogs: { include: { sets: true } } };
}>;

/** "185 lb × 8" (or "12 reps" for a bodyweight best set). */
function bestSetLabel(sets: { weight: number; reps: number }[]): string {
  const best = [...sets].sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0];
  return best.weight > 0 ? `${best.weight} lb × ${best.reps}` : `${best.reps} reps`;
}

/** Builds the WorkoutSummaryShare payload from a completed plan's ExerciseLogs. */
export function buildWorkoutSummaryShare(plan: PlanWithLogs): WorkoutSummaryShare {
  const muscleGroups = new Set<MuscleGroup>();
  const exercises = plan.exerciseLogs
    .filter((log) => log.sets.length > 0)
    .map((log) => {
      const def = EXERCISES_BY_ID.get(log.exerciseId);
      if (def) for (const m of def.primaryMuscles) muscleGroups.add(m);
      const totalVolume = log.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      return {
        name: def?.name ?? log.exerciseId,
        bestSet: bestSetLabel(log.sets),
        totalVolume: Math.round(totalVolume),
      };
    });

  const totalVolume = exercises.reduce((sum, e) => sum + e.totalVolume, 0);
  const duration =
    plan.startedAt && plan.completedAt
      ? Math.max(0, Math.round((plan.completedAt.getTime() - plan.startedAt.getTime()) / 60000))
      : 0;

  return {
    workoutName: plan.focus,
    date: (plan.completedAt ?? plan.createdAt).toISOString(),
    duration,
    exercises,
    totalVolume: Math.round(totalVolume),
    muscleGroups: [...muscleGroups],
  };
}
