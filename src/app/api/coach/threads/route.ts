import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

const PREVIEW_LENGTH = 120;

function truncate(content: string): string {
  const clean = content.replace(/\s+/g, ' ').trim();
  return clean.length <= PREVIEW_LENGTH
    ? clean
    : `${clean.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
}

// Validated inline (this route owns its schema; src/lib/validation.ts is shared).
const createThreadSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
});

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threads = await prisma.coachThread.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return NextResponse.json({
      data: {
        threads: threads.map((thread) => {
          const last = thread.messages[0];
          return {
            id: thread.id,
            title: thread.title,
            updatedAt: thread.updatedAt.toISOString(),
            lastMessage: last
              ? {
                  content: truncate(last.content),
                  senderType: last.senderType,
                  createdAt: last.createdAt.toISOString(),
                }
              : null,
          };
        }),
      },
    });
  } catch (error) {
    console.error('List coach threads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = createThreadSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const thread = await prisma.coachThread.create({
      data: { userId, title: parsed.data.title ?? 'New conversation' },
    });

    return NextResponse.json(
      {
        data: {
          thread: {
            id: thread.id,
            title: thread.title,
            updatedAt: thread.updatedAt.toISOString(),
            lastMessage: null,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create coach thread error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
