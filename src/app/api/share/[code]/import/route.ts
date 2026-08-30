import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Prisma } from '@prisma/client';
import type { SplitDay } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const shared = await prisma.sharedWorkout.findUnique({ where: { shareCode: code } });
    if (!shared) {
      return NextResponse.json({ error: 'Shared workout not found' }, { status: 404 });
    }
    if (shared.type !== 'split') {
      return NextResponse.json(
        { error: 'Only shared splits can be imported' },
        { status: 400 },
      );
    }

    const payload = shared.data as unknown as { name: string; days: SplitDay[] };
    const split = await prisma.workoutSplit.create({
      data: {
        userId,
        name: `${payload.name} (imported)`,
        type: 'custom',
        days: payload.days as unknown as Prisma.InputJsonValue,
        isShareable: false,
        isActive: false,
      },
    });

    return NextResponse.json({ data: { split } }, { status: 201 });
  } catch (error) {
    console.error('Import shared split error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
