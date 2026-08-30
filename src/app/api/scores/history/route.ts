import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// Weekly score snapshots, ascending by week — consumed by the scores page's
// trend chart. (The legacy GET /api/scores returns the same rows as a bare
// array for the sync contract; this is the product-facing shape.)
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshots = await prisma.scoreSnapshot.findMany({
      where: { userId },
      orderBy: { weekNumber: 'asc' },
    });

    return NextResponse.json({ data: { snapshots } });
  } catch (error) {
    console.error('Score history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
