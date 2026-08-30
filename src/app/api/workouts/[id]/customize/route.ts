import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { customizeWorkoutSchema } from '@/lib/validation';
import {
  best1RMFromHistory,
  demographicEstimate1RM,
  recommendWeight,
} from '@/services/ai';
import { EXERCISES_BY_ID } from '@/services/data/exercise-library';
import {
  demographicLookup,
  ensureExerciseRows,
  loadTrainingContext,
  planDTOById,
} from '@/services/training-context';

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
    const parsed = customizeWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: { exercises: true },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }
    if (plan.status === 'completed') {
      return NextResponse.json(
        { error: 'Completed workouts cannot be customized' },
        { status: 400 },
      );
    }

    const { swaps = [], removeIds = [], setChanges = [] } = parsed.data;
    const rowIds = new Set(plan.exercises.map((e) => e.id));

    // Validate all referenced rows belong to this plan and swap targets exist.
    for (const rowId of [
      ...removeIds,
      ...swaps.map((s) => s.plannedExerciseId),
      ...setChanges.map((s) => s.plannedExerciseId),
    ]) {
      if (!rowIds.has(rowId)) {
        return NextResponse.json(
          { error: `Planned exercise ${rowId} is not part of this workout` },
          { status: 400 },
        );
      }
    }
    for (const swap of swaps) {
      if (!EXERCISES_BY_ID.has(swap.newExerciseId)) {
        return NextResponse.json(
          { error: `Unknown exercise: ${swap.newExerciseId}` },
          { status: 400 },
        );
      }
    }

    const now = new Date();
    const ctx = swaps.length > 0 ? await loadTrainingContext(userId, now) : null;

    if (removeIds.length > 0) {
      await prisma.plannedExercise.deleteMany({
        where: { id: { in: removeIds }, workoutPlanId: plan.id },
      });
    }

    for (const change of setChanges) {
      if (removeIds.includes(change.plannedExerciseId)) continue;
      await prisma.plannedExercise.update({
        where: { id: change.plannedExerciseId },
        data: { targetSets: change.targetSets },
      });
    }

    for (const swap of swaps) {
      if (removeIds.includes(swap.plannedExerciseId)) continue;
      const def = EXERCISES_BY_ID.get(swap.newExerciseId);
      if (!def || !ctx) continue;

      await ensureExerciseRows([swap.newExerciseId]);

      // Recompute the recommended weight for the incoming exercise from the
      // user's history (or a conservative demographic estimate).
      const goal = ctx.preferences?.goal ?? 'general_fitness';
      const exHistory = ctx.history.filter((h) => h.exerciseId === swap.newExerciseId);
      const estimated1RM =
        best1RMFromHistory(exHistory, 90, now) ??
        demographicEstimate1RM({
          profile: ctx.profile,
          exercise: def,
          percentileLookup: demographicLookup,
        });
      const rec = recommendWeight({ goal, estimated1RM });

      await prisma.plannedExercise.update({
        where: { id: swap.plannedExerciseId },
        data: {
          exerciseId: swap.newExerciseId,
          recommendedWeight: rec.weight,
          targetRepMin: rec.repRange[0],
          targetRepMax: rec.repRange[1],
          rationale: `Swapped in — starting at ${rec.weight} lb (~${Math.round(rec.pctOf1RM * 100)}% of your estimated max).`,
        },
      });
    }

    const dto = await planDTOById(userId, plan.id);
    return NextResponse.json({ data: { plan: dto } });
  } catch (error) {
    console.error('Customize workout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
