import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { onboardingCompleteSchema } from '@/lib/validation';
import { generateWeek } from '@/services/ai';
import { EXERCISE_LIBRARY } from '@/services/data/exercise-library';
import {
  getBenchmarkDefinition,
  lookupBenchmarkPercentile,
} from '@/services/data/benchmarks';
import {
  DAY_MS,
  demographicLookup,
  generationPreferences,
  libraryLiftIdForBenchmark,
  loadTrainingContext,
  persistGeneratedPlan,
  toPlanDTOs,
  utcDayStart,
} from '@/services/training-context';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { profile, preferences, benchmarks = [] } = parsed.data;
    const now = new Date();

    // Protein target (PRD 4.3): 1 g/lb for build_muscle / get_lean, 0.8 otherwise.
    const proteinFactor =
      preferences.goal === 'build_muscle' || preferences.goal === 'get_lean' ? 1.0 : 0.8;
    const proteinTargetG = Math.round(profile.weight * proteinFactor);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        age: profile.age,
        sex: profile.sex,
        weight: Math.round(profile.weight),
        heightIn: profile.heightIn != null ? Math.round(profile.heightIn) : null,
        experienceLevel: profile.experienceLevel,
        trainingGoal: preferences.goal,
        onboardingCompleted: true,
        proteinTargetG,
        zone2TargetMin: 150,
      },
    });

    const prefsData = {
      goal: preferences.goal,
      daysPerWeek: preferences.daysPerWeek,
      sessionDuration: preferences.sessionDuration,
      preferredSplit: preferences.preferredSplit,
      trainingLocation: preferences.trainingLocation,
      availableEquipment: preferences.availableEquipment,
      muscleGroupFocus: preferences.muscleGroupFocus ?? [],
      muscleGroupExclude: preferences.muscleGroupExclude ?? [],
      enableSupersets: preferences.enableSupersets,
      varietyLevel: preferences.varietyLevel,
    };
    await prisma.trainingPreferences.upsert({
      where: { userId },
      create: { userId, ...prefsData },
      update: prefsData,
    });

    // Default gym profile from the onboarding equipment/location.
    const existingDefault = await prisma.gymProfile.findFirst({
      where: { userId, isDefault: true },
    });
    if (!existingDefault) {
      await prisma.gymProfile.create({
        data: {
          userId,
          name: preferences.trainingLocation === 'home' ? 'Home Gym' : 'My Gym',
          location: preferences.trainingLocation,
          equipment: preferences.availableEquipment,
          isDefault: true,
        },
      });
    }

    // Optional baseline benchmarks (Credo Ten).
    for (const bench of benchmarks) {
      const def = getBenchmarkDefinition(bench.name);
      if (!def) continue;
      const percentile = lookupBenchmarkPercentile(
        def.name,
        profile.sex,
        profile.age,
        bench.value,
      );
      await prisma.benchmarkResult.create({
        data: {
          userId,
          benchmarkName: def.name,
          value: bench.value,
          unit: def.unit,
          percentile,
          pillar: def.pillar,
          testedAt: now,
        },
      });

      // Strength lift benchmarks seed the 1RM table so the first generated
      // week starts at realistic weights.
      if (def.pillar === 'strength' && def.unit === 'lbs') {
        const exerciseId = libraryLiftIdForBenchmark(def.name);
        if (exerciseId && EXERCISE_LIBRARY.some((ex) => ex.id === exerciseId)) {
          await prisma.exercise1RM.upsert({
            where: { userId_exerciseId: { userId, exerciseId } },
            create: { userId, exerciseId, weight: bench.value, date: now },
            update: { weight: bench.value, date: now },
          });
        }
      }
    }

    // Generate + persist the first training week.
    const ctx = await loadTrainingContext(userId, now);
    const genPrefs = generationPreferences(ctx);
    if (!genPrefs) throw new Error('Preferences missing after onboarding');

    const week = generateWeek({
      profile: ctx.profile,
      preferences: genPrefs,
      history: ctx.history,
      recoveryStates: ctx.recoveryStates,
      library: EXERCISE_LIBRARY,
      weekNumber: ctx.weekNumber,
      recentPlans: ctx.recentPlans,
      standardsLookup: demographicLookup,
      now,
    });

    // Spread training days evenly across the 7-day week (same spacing the
    // generator simulated), snapped to UTC day starts.
    const spacingMs = (7 / week.length) * DAY_MS;
    const planRows = [];
    for (const plan of week) {
      const scheduledDate = utcDayStart(
        new Date(now.getTime() + (plan.dayNumber - 1) * spacingMs),
      );
      planRows.push(await persistGeneratedPlan(userId, plan, scheduledDate));
    }

    const plans = await toPlanDTOs(planRows, userId);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    void _passwordHash;

    return NextResponse.json({ data: { user: safeUser, plans } }, { status: 201 });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
