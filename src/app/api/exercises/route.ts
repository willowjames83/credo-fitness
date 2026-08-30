import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import type { Equipment } from '@/lib/types';
import { ALL_EQUIPMENT } from '@/lib/types';
import { equipmentSatisfied } from '@/services/ai';
import { EXERCISE_LIBRARY } from '@/services/data/exercise-library';

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim().toLowerCase() ?? '';
    const muscle = searchParams.get('muscle')?.trim().toLowerCase() ?? '';
    const equipmentParam = searchParams.get('equipment')?.trim() ?? '';

    // equipment= accepts a comma-separated list of available equipment;
    // exercises doable with only that equipment are returned.
    const available = equipmentParam
      ? (equipmentParam
          .split(',')
          .map((e) => e.trim())
          .filter((e): e is Equipment =>
            (ALL_EQUIPMENT as string[]).includes(e),
          ) as Equipment[])
      : null;

    const exercises = EXERCISE_LIBRARY.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (
        muscle &&
        !ex.primaryMuscles.some((m) => m === muscle) &&
        !ex.secondaryMuscles.some((m) => m === muscle)
      ) {
        return false;
      }
      if (available && !equipmentSatisfied(ex, available)) return false;
      return true;
    });

    return NextResponse.json({ data: { exercises } });
  } catch (error) {
    console.error('List exercises error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
