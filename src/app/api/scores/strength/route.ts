import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { computeStrengthScoreResult } from '@/services/training-context';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await computeStrengthScoreResult(userId, new Date());
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Strength score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
