import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { PRESET_SPLITS } from '@/services/data/program-templates';
import { splitCreateSchema } from './_schemas';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const splits = await prisma.workoutSplit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: { splits, presets: PRESET_SPLITS } });
  } catch (error) {
    console.error('List splits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = splitCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, days } = parsed.data;
    const split = await prisma.workoutSplit.create({
      data: {
        userId,
        name,
        type: 'custom',
        days,
        isShareable: false,
        isActive: false,
      },
    });

    return NextResponse.json({ data: { split } }, { status: 201 });
  } catch (error) {
    console.error('Create split error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
