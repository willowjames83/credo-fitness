import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { syncSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { workouts, exercise1RMs, personalRecords, scoreSnapshots, userProgram } = parsed.data;

    // Sync workouts (upsert by userId + date + dayLabel)
    if (workouts && workouts.length > 0) {
      for (const w of workouts) {
        const workoutDate = new Date(w.date);

        // Check for existing workout on same date with same dayLabel
        const existing = await prisma.workout.findFirst({
          where: {
            userId,
            date: workoutDate,
            dayLabel: w.dayLabel,
          },
        });

        if (existing) {
          await prisma.workout.update({
            where: { id: existing.id },
            data: {
              programTemplate: w.programTemplate,
              durationSeconds: w.durationSeconds,
              exercises: w.exercises,
              totalVolume: w.totalVolume,
            },
          });
        } else {
          await prisma.workout.create({
            data: {
              userId,
              date: workoutDate,
              dayLabel: w.dayLabel,
              programTemplate: w.programTemplate,
              durationSeconds: w.durationSeconds,
              exercises: w.exercises,
              totalVolume: w.totalVolume,
            },
          });
        }
      }
    }

    // Sync exercise 1RMs (upsert by userId + exerciseId)
    if (exercise1RMs) {
      for (const [exerciseId, weight] of Object.entries(exercise1RMs)) {
        await prisma.exercise1RM.upsert({
          where: {
            userId_exerciseId: { userId, exerciseId },
          },
          update: { weight, date: new Date() },
          create: { userId, exerciseId, weight },
        });
      }
    }

    // Sync personal records (append new records)
    if (personalRecords && personalRecords.length > 0) {
      for (const pr of personalRecords) {
        // Check if a record with same exerciseId and new1RM already exists (dedup)
        const existing = await prisma.personalRecord.findFirst({
          where: {
            userId,
            exerciseId: pr.exerciseId,
            new1RM: pr.new1RM,
          },
        });

        if (!existing) {
          await prisma.personalRecord.create({
            data: {
              userId,
              exerciseId: pr.exerciseId,
              previous1RM: pr.previous1RM,
              new1RM: pr.new1RM,
              setWeight: pr.setWeight,
              setReps: pr.setReps,
              date: pr.date ? new Date(pr.date) : new Date(),
            },
          });
        }
      }
    }

    // Sync score snapshots (upsert by userId + weekNumber)
    if (scoreSnapshots && scoreSnapshots.length > 0) {
      for (const ss of scoreSnapshots) {
        await prisma.scoreSnapshot.upsert({
          where: {
            userId_weekNumber: { userId, weekNumber: ss.weekNumber },
          },
          update: {
            credoScore: ss.credoScore,
            strengthScore: ss.strengthScore,
            stabilityScore: ss.stabilityScore,
            cardioScore: ss.cardioScore,
            nutritionScore: ss.nutritionScore,
          },
          create: {
            userId,
            weekNumber: ss.weekNumber,
            credoScore: ss.credoScore,
            strengthScore: ss.strengthScore,
            stabilityScore: ss.stabilityScore,
            cardioScore: ss.cardioScore,
            nutritionScore: ss.nutritionScore,
          },
        });
      }
    }

    // Sync user program (upsert)
    if (userProgram) {
      await prisma.userProgram.upsert({
        where: { userId },
        update: {
          programTemplate: userProgram.programTemplate,
          daysPerWeek: userProgram.daysPerWeek,
          currentWeek: userProgram.currentWeek ?? 1,
          currentDayIndex: userProgram.currentDayIndex ?? 0,
        },
        create: {
          userId,
          programTemplate: userProgram.programTemplate,
          daysPerWeek: userProgram.daysPerWeek,
          currentWeek: userProgram.currentWeek ?? 1,
          currentDayIndex: userProgram.currentDayIndex ?? 0,
        },
      });
    }

    // Return complete server state
    const [
      serverWorkouts,
      serverExercise1RMs,
      serverPersonalRecords,
      serverScoreSnapshots,
      serverUserProgram,
    ] = await Promise.all([
      prisma.workout.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.exercise1RM.findMany({
        where: { userId },
      }),
      prisma.personalRecord.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.scoreSnapshot.findMany({
        where: { userId },
        orderBy: { weekNumber: 'asc' },
      }),
      prisma.userProgram.findUnique({
        where: { userId },
      }),
    ]);

    // Convert exercise1RMs to a map for convenience
    const exercise1RMsMap: Record<string, number> = {};
    for (const rm of serverExercise1RMs) {
      exercise1RMsMap[rm.exerciseId] = rm.weight;
    }

    return NextResponse.json({
      data: {
        workouts: serverWorkouts,
        exercise1RMs: exercise1RMsMap,
        personalRecords: serverPersonalRecords,
        scoreSnapshots: serverScoreSnapshots,
        userProgram: serverUserProgram,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
