import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { gymProfileUpdateSchema } from '@/lib/validation';

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
    const parsed = gymProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const existing = await prisma.gymProfile.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Gym profile not found' }, { status: 404 });
    }

    const { name, location, equipment, isDefault } = parsed.data;
    const profile = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.gymProfile.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.gymProfile.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(equipment !== undefined ? { equipment } : {}),
          ...(isDefault !== undefined ? { isDefault } : {}),
        },
      });
    });

    return NextResponse.json({ data: { profile } });
  } catch (error) {
    console.error('Update gym profile error:', error);
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
    const existing = await prisma.gymProfile.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Gym profile not found' }, { status: 404 });
    }

    await prisma.gymProfile.delete({ where: { id } });

    // If the default was deleted, promote the oldest remaining profile.
    if (existing.isDefault) {
      const next = await prisma.gymProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await prisma.gymProfile.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error('Delete gym profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
