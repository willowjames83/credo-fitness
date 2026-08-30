import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { isConcreteSplitType, setPreferredSplit } from '../../_schemas';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const split = await prisma.workoutSplit.findFirst({ where: { id, userId } });
    if (!split) {
      return NextResponse.json({ error: 'Split not found' }, { status: 404 });
    }

    const preferredSplit = isConcreteSplitType(split.type) ? split.type : 'custom';

    await prisma.$transaction([
      prisma.workoutSplit.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      }),
      prisma.workoutSplit.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);
    await setPreferredSplit(userId, preferredSplit);

    const updated = await prisma.workoutSplit.findUnique({ where: { id } });
    return NextResponse.json({ data: { split: updated, preferredSplit } });
  } catch (error) {
    console.error('Activate split error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
