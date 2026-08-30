import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { getPresetSplit } from '@/services/data/program-templates';
import { activatePresetSchema, setPreferredSplit } from '../_schemas';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = activatePresetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const preset = getPresetSplit(parsed.data.presetId);
    if (!preset) {
      return NextResponse.json({ error: 'Unknown preset' }, { status: 404 });
    }

    // A preset is not tied to a saved WorkoutSplit row — clear any active
    // custom split so the two "current split" concepts don't disagree.
    await prisma.workoutSplit.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    await setPreferredSplit(userId, preset.type);

    return NextResponse.json({ data: { preferredSplit: preset.type, preset } });
  } catch (error) {
    console.error('Activate preset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
