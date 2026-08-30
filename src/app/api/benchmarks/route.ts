import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { benchmarkDTOsForUser } from '@/services/training-context';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const benchmarks = await benchmarkDTOsForUser(userId);
    return NextResponse.json({ data: { benchmarks } });
  } catch (error) {
    console.error('List benchmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
