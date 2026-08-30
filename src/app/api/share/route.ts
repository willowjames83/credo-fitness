import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Prisma } from '@prisma/client';
import { buildWorkoutSummaryShare, shareCreateSchema, uniqueShareCode } from './_lib';

// POST is auth-only even though /api/share is exempted from the middleware's
// JWT-shape check (that exemption exists for the public GET /api/share/:code).
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = shareCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    let data: Prisma.InputJsonValue;
    if (parsed.data.type === 'split') {
      const split = await prisma.workoutSplit.findFirst({
        where: { id: parsed.data.splitId, userId },
      });
      if (!split) {
        return NextResponse.json({ error: 'Split not found' }, { status: 404 });
      }
      data = { name: split.name, days: split.days };
    } else {
      const plan = await prisma.workoutPlan.findFirst({
        where: { id: parsed.data.workoutPlanId, userId },
        include: { exerciseLogs: { include: { sets: true } } },
      });
      if (!plan) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }
      if (plan.exerciseLogs.length === 0) {
        return NextResponse.json(
          { error: 'This workout has no logged sets to share' },
          { status: 400 },
        );
      }
      data = buildWorkoutSummaryShare(plan) as unknown as Prisma.InputJsonValue;
    }

    const shareCode = await uniqueShareCode();
    await prisma.sharedWorkout.create({
      data: {
        shareCode,
        createdBy: userId,
        type: parsed.data.type,
        data,
      },
    });

    return NextResponse.json(
      { data: { shareCode, url: `/s/${shareCode}` } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
