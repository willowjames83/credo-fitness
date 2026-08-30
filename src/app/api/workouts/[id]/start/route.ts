import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { toPlanDTO } from '@/services/training-context';

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
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: { exercises: true },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }
    if (plan.status === 'completed') {
      return NextResponse.json(
        { error: 'Workout is already completed' },
        { status: 400 },
      );
    }

    const updated = await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: {
        status: 'in_progress',
        startedAt: plan.startedAt ?? new Date(),
      },
      include: { exercises: true },
    });

    return NextResponse.json({ data: { plan: await toPlanDTO(updated, userId) } });
  } catch (error) {
    console.error('Start workout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
