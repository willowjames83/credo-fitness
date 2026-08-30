import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { EXERCISES_BY_ID } from '@/services/data/exercise-library';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const exercise = EXERCISES_BY_ID.get(id);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const logs = await prisma.exerciseLog.findMany({
      where: { userId, exerciseId: id },
      include: { sets: true },
      orderBy: { date: 'desc' },
      take: 50,
    });

    const history = logs.map((log) => {
      const best = [...log.sets].sort(
        (a, b) => b.weight - a.weight || b.reps - a.reps,
      )[0];
      const bestSet = best
        ? best.weight > 0
          ? `${best.weight} lb x ${best.reps}`
          : `${best.reps} reps`
        : '—';
      return {
        date: log.date.toISOString(),
        bestSet,
        estimated1RM: log.estimated1RM,
      };
    });

    return NextResponse.json({ data: { exercise, history } });
  } catch (error) {
    console.error('Exercise detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
