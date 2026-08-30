import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateWorkoutSchema } from '@/lib/validation';
import {
  findTodayPlan,
  generateTodayWorkout,
  toPlanDTO,
} from '@/services/training-context';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = generateWorkoutSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }
    const force = parsed.data.force ?? false;

    const now = new Date();
    let existing = await findTodayPlan(userId, now);

    if (existing && force && existing.status === 'planned') {
      // Only an un-started plan may be discarded and regenerated.
      await prisma.workoutPlan.delete({ where: { id: existing.id } });
      existing = null;
    }

    const plan = existing ?? (await generateTodayWorkout(userId, now));
    if (!plan) {
      return NextResponse.json(
        { error: 'Complete onboarding before generating workouts' },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: { plan: await toPlanDTO(plan, userId) } });
  } catch (error) {
    console.error('Generate workout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
