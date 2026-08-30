import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public, unauthenticated liveness/readiness probe. Added to the middleware
// public list so it is reachable without a token. Always returns 200 — a
// down database is reported in the payload, not by failing the endpoint, so
// load balancers can distinguish "process up" from "dependencies healthy".
export const dynamic = 'force-dynamic';

const DB_TIMEOUT_MS = 1000;

async function checkDb(): Promise<'up' | 'down'> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('db timeout')), DB_TIMEOUT_MS),
      ),
    ]);
    return 'up';
  } catch {
    return 'down';
  }
}

export async function GET() {
  const db = await checkDb();

  return NextResponse.json(
    {
      data: {
        status: 'ok',
        time: new Date().toISOString(),
        uptime: process.uptime(),
        db,
      },
    },
    { status: 200 },
  );
}
