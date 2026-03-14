import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { scoreSnapshotSchema } from '@/lib/validation';

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

    return NextResponse.json({ data: snapshots });
  } catch (error) {
    console.error('List scores error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = scoreSnapshotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { weekNumber, credoScore, strengthScore, stabilityScore, cardioScore, nutritionScore } = parsed.data;

    const snapshot = await prisma.scoreSnapshot.upsert({
      where: {
        userId_weekNumber: { userId, weekNumber },
      },
      update: {
        credoScore,
        strengthScore,
        stabilityScore,
        cardioScore,
        nutritionScore,
      },
      create: {
        userId,
        weekNumber,
        credoScore,
        strengthScore,
        stabilityScore,
        cardioScore,
        nutritionScore,
      },
    });

    return NextResponse.json({ data: snapshot }, { status: 201 });
  } catch (error) {
    console.error('Save score error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
