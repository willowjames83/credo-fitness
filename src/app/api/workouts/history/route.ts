import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { WorkoutHistoryItemDTO } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 1),
      100,
    );
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0);

    const [plans, total] = await Promise.all([
      prisma.workoutPlan.findMany({
        where: { userId, status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: limit,
        skip: offset,
        include: { exerciseLogs: { include: { sets: true } } },
      }),
      prisma.workoutPlan.count({ where: { userId, status: 'completed' } }),
    ]);

    const prCounts = await Promise.all(
      plans.map((plan) =>
        plan.completedAt
          ? prisma.personalRecord.count({
              where: { userId, date: plan.completedAt },
            })
          : Promise.resolve(0),
      ),
    );

    const items: WorkoutHistoryItemDTO[] = plans.map((plan, i) => {
      let totalVolume = 0;
      let setCount = 0;
      for (const log of plan.exerciseLogs) {
        setCount += log.sets.length;
        totalVolume += log.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      }
      const durationSeconds =
        plan.startedAt && plan.completedAt
          ? Math.max(
              0,
              Math.round((plan.completedAt.getTime() - plan.startedAt.getTime()) / 1000),
            )
          : null;
      return {
        id: plan.id,
        date: (plan.completedAt ?? plan.createdAt).toISOString(),
        focus: plan.focus,
        durationSeconds,
        totalVolume: Math.round(totalVolume),
        exerciseCount: plan.exerciseLogs.length,
        setCount,
        prCount: prCounts[i],
      };
    });

    return NextResponse.json({ data: { workouts: items, total, limit, offset } });
  } catch (error) {
    console.error('Workout history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
