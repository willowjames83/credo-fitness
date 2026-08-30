import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { benchmarkLogSchema } from '@/lib/validation';
import type { Sex } from '@/lib/types';
import {
  getBenchmarkDefinition,
  lookupBenchmarkPercentile,
} from '@/services/data/benchmarks';

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = benchmarkLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const def = getBenchmarkDefinition(parsed.data.name);
    if (!def) {
      return NextResponse.json(
        { error: `Unknown benchmark: ${parsed.data.name}` },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Percentile needs demographics; null when sex/age are missing.
    const percentile =
      user.sex && user.age != null
        ? lookupBenchmarkPercentile(def.name, user.sex as Sex, user.age, parsed.data.value)
        : null;

    const result = await prisma.benchmarkResult.create({
      data: {
        userId,
        benchmarkName: def.name,
        value: parsed.data.value,
        unit: def.unit,
        percentile,
        pillar: def.pillar,
      },
    });

    return NextResponse.json({ data: { result } }, { status: 201 });
  } catch (error) {
    console.error('Log benchmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
