import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { preferencesUpdateSchema } from '@/lib/validation';
import { preferencesInputFromRow } from '@/services/training-context';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await prisma.trainingPreferences.findUnique({ where: { userId } });
    return NextResponse.json({
      data: { preferences: row ? preferencesInputFromRow(row) : null },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = preferencesUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const p = parsed.data;
    const update = {
      ...(p.goal !== undefined ? { goal: p.goal } : {}),
      ...(p.daysPerWeek !== undefined ? { daysPerWeek: p.daysPerWeek } : {}),
      ...(p.sessionDuration !== undefined ? { sessionDuration: p.sessionDuration } : {}),
      ...(p.preferredSplit !== undefined ? { preferredSplit: p.preferredSplit } : {}),
      ...(p.trainingLocation !== undefined ? { trainingLocation: p.trainingLocation } : {}),
      ...(p.availableEquipment !== undefined
        ? { availableEquipment: p.availableEquipment }
        : {}),
      ...(p.muscleGroupFocus !== undefined ? { muscleGroupFocus: p.muscleGroupFocus } : {}),
      ...(p.muscleGroupExclude !== undefined
        ? { muscleGroupExclude: p.muscleGroupExclude }
        : {}),
      ...(p.enableSupersets !== undefined ? { enableSupersets: p.enableSupersets } : {}),
      ...(p.varietyLevel !== undefined ? { varietyLevel: p.varietyLevel } : {}),
    };

    const row = await prisma.trainingPreferences.upsert({
      where: { userId },
      create: {
        userId,
        goal: p.goal ?? 'longevity',
        daysPerWeek: p.daysPerWeek ?? 3,
        sessionDuration: p.sessionDuration ?? 60,
        preferredSplit: p.preferredSplit ?? 'ai_optimized',
        trainingLocation: p.trainingLocation ?? 'commercial_gym',
        availableEquipment: p.availableEquipment ?? [],
        muscleGroupFocus: p.muscleGroupFocus ?? [],
        muscleGroupExclude: p.muscleGroupExclude ?? [],
        enableSupersets: p.enableSupersets ?? true,
        varietyLevel: p.varietyLevel ?? 'medium',
      },
      update,
    });

    // Keep the user's headline goal in sync for score/protein logic.
    if (p.goal !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { trainingGoal: p.goal },
      });
    }

    return NextResponse.json({ data: { preferences: preferencesInputFromRow(row) } });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
