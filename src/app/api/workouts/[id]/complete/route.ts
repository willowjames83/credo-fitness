import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { completeWorkoutSchema } from '@/lib/validation';
import type { CompleteWorkoutResponse, MuscleGroup } from '@/lib/types';
import { epley1RM, type TrainedGroupVolume } from '@/services/ai';
import { EXERCISES_BY_ID } from '@/services/data/exercise-library';
import {
  applyRecoveryUpdate,
  ensureExerciseRows,
  profileFromUser,
  snapshotScores,
} from '@/services/training-context';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = completeWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const [plan, user] = await Promise.all([
      prisma.workoutPlan.findFirst({ where: { id, userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);
    if (!plan || !user) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }
    if (plan.status === 'completed') {
      return NextResponse.json(
        { error: 'Workout is already completed' },
        { status: 400 },
      );
    }

    const { durationSeconds, exercises } = parsed.data;
    const completedAt = new Date();

    // Exercise rows must exist before ExerciseLog FKs reference them.
    await ensureExerciseRows(exercises.map((e) => e.exerciseId));

    const personalRecords: CompleteWorkoutResponse['personalRecords'] = [];
    const trainedVolumes: TrainedGroupVolume[] = [];
    let totalVolume = 0;
    let setCount = 0;

    for (const exercise of exercises) {
      const sets = [...exercise.sets].sort((a, b) => a.setNumber - b.setNumber);
      setCount += sets.length;
      totalVolume += sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

      // Best-set Epley estimate for this session.
      let best1RM = 0;
      let bestSet = sets[0];
      for (const s of sets) {
        const e = epley1RM(s.weight, s.reps);
        if (e > best1RM) {
          best1RM = e;
          bestSet = s;
        }
      }
      const estimated1RM = best1RM > 0 ? Math.round(best1RM * 10) / 10 : null;

      await prisma.exerciseLog.create({
        data: {
          userId,
          exerciseId: exercise.exerciseId,
          workoutPlanId: plan.id,
          date: completedAt,
          estimated1RM,
          exertionRating: exercise.exertionRating ?? null,
          sets: {
            create: sets.map((s) => ({
              setNumber: s.setNumber,
              weight: s.weight,
              reps: s.reps,
              rpe: s.rpe ?? null,
              restDuration: s.restDuration ?? null,
            })),
          },
        },
      });

      // PR detection against the Exercise1RM table.
      if (estimated1RM != null && estimated1RM > 0) {
        const existing = await prisma.exercise1RM.findUnique({
          where: { userId_exerciseId: { userId, exerciseId: exercise.exerciseId } },
        });
        if (!existing || estimated1RM > existing.weight) {
          await prisma.exercise1RM.upsert({
            where: { userId_exerciseId: { userId, exerciseId: exercise.exerciseId } },
            create: {
              userId,
              exerciseId: exercise.exerciseId,
              weight: estimated1RM,
              date: completedAt,
            },
            update: { weight: estimated1RM, date: completedAt },
          });
          await prisma.personalRecord.create({
            data: {
              userId,
              exerciseId: exercise.exerciseId,
              previous1RM: existing ? existing.weight : null,
              new1RM: estimated1RM,
              setWeight: bestSet.weight,
              setReps: bestSet.reps,
              date: completedAt,
            },
          });
          personalRecords.push({
            exerciseId: exercise.exerciseId,
            name: EXERCISES_BY_ID.get(exercise.exerciseId)?.name ?? exercise.exerciseId,
            previous1RM: existing ? existing.weight : null,
            new1RM: estimated1RM,
          });
        }
      }

      // Recovery volume: every primary muscle of the exercise gets the sets.
      const def = EXERCISES_BY_ID.get(exercise.exerciseId);
      if (def) {
        for (const group of def.primaryMuscles) {
          trainedVolumes.push({ group: group as MuscleGroup, sets: sets.length });
        }
      }
    }

    await applyRecoveryUpdate(userId, trainedVolumes, profileFromUser(user), completedAt);

    await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: { status: 'completed', completedAt },
    });

    const scores = await snapshotScores(userId, completedAt);

    const response: CompleteWorkoutResponse = {
      personalRecords,
      scores,
      summary: {
        totalVolume: Math.round(totalVolume),
        durationSeconds,
        exerciseCount: exercises.length,
        setCount,
      },
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Complete workout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
