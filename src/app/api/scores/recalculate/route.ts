import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { snapshotScores } from '@/services/training-context';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scores = await snapshotScores(userId, new Date());
    return NextResponse.json({ data: scores });
  } catch (error) {
    console.error('Recalculate scores error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
