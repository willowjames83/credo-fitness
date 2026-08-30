import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { gymProfileCreateSchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await prisma.gymProfile.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json({ data: { profiles } });
  } catch (error) {
    console.error('List gym profiles error:', error);
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
    const parsed = gymProfileCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, location, equipment, isDefault } = parsed.data;
    const existingCount = await prisma.gymProfile.count({ where: { userId } });
    // The first profile is always the default.
    const makeDefault = isDefault === true || existingCount === 0;

    const profile = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.gymProfile.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.gymProfile.create({
        data: { userId, name, location, equipment, isDefault: makeDefault },
      });
    });

    return NextResponse.json({ data: { profile } }, { status: 201 });
  } catch (error) {
    console.error('Create gym profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
