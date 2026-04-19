import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { workoutSchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.workout.count({ where: { userId } });

    return NextResponse.json({ data: { workouts, total, limit, offset } });
  } catch (error) {
    console.error('List workouts error:', error);
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
    const parsed = workoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { date, dayLabel, programTemplate, durationSeconds, exercises, totalVolume } = parsed.data;

    const workout = await prisma.workout.create({
      data: {
        userId,
        date: new Date(date),
        dayLabel,
        programTemplate,
        durationSeconds,
        exercises,
        totalVolume,
      },
    });

    return NextResponse.json({ data: workout }, { status: 201 });
  } catch (error) {
    console.error('Create workout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
