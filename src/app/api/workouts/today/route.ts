import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  findNextPlannedPlan,
  findTodayPlan,
  generateTodayWorkout,
  toPlanDTO,
} from '@/services/training-context';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const plan =
      (await findTodayPlan(userId, now)) ??
      (await findNextPlannedPlan(userId, now)) ??
      (await generateTodayWorkout(userId, now));

    if (!plan) {
      // Only possible when the user has no training preferences yet.
      return NextResponse.json({ data: { plan: null } });
    }

    return NextResponse.json({ data: { plan: await toPlanDTO(plan, userId) } });
  } catch (error) {
    console.error("Today's workout error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
