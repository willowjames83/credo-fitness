import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { computePillarScores } from '@/services/training-context';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scores = await computePillarScores(userId, new Date());
    return NextResponse.json({ data: scores });
  } catch (error) {
    console.error('Current scores error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
