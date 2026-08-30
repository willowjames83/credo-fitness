import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { splitUpdateSchema } from '../_schemas';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = splitUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const existing = await prisma.workoutSplit.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Split not found' }, { status: 404 });
    }
    if (existing.type !== 'custom') {
      return NextResponse.json({ error: 'Only custom splits can be edited' }, { status: 400 });
    }

    const { name, days, isShareable } = parsed.data;
    const split = await prisma.workoutSplit.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(days !== undefined ? { days } : {}),
        ...(isShareable !== undefined ? { isShareable } : {}),
      },
    });

    return NextResponse.json({ data: { split } });
  } catch (error) {
    console.error('Update split error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.workoutSplit.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Split not found' }, { status: 404 });
    }

    await prisma.workoutSplit.delete({ where: { id } });

    // Deleting the active custom split leaves preferredSplit pointing at
    // nothing concrete — fall back to AI Optimized rather than orphan it.
    if (existing.isActive) {
      await prisma.trainingPreferences.updateMany({
        where: { userId, preferredSplit: 'custom' },
        data: { preferredSplit: 'ai_optimized' },
      });
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Delete split error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
