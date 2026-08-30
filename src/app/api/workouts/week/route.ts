import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { ensureWeekPlans, toPlanDTOs } from '@/services/training-context';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await ensureWeekPlans(userId, new Date());
    return NextResponse.json({ data: { plans: await toPlanDTOs(plans, userId) } });
  } catch (error) {
    console.error('Week plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
