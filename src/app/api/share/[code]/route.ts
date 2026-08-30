import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint — no auth. The middleware exempts /api/share from its
// JWT-shape check for this reason.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const shared = await prisma.sharedWorkout.update({
      where: { shareCode: code },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      data: {
        type: shared.type,
        data: shared.data,
        createdAt: shared.createdAt,
        viewCount: shared.viewCount,
      },
    });
  } catch {
    // update() throws (P2025) when the shareCode doesn't exist.
    return NextResponse.json({ error: 'Shared workout not found' }, { status: 404 });
  }
}
