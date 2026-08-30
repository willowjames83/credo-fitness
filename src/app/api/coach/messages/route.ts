import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  checkRateLimit,
  CoachUnavailableError,
  generateCoachReply,
  isCoachConfigured,
  titleFromMessage,
} from '@/services/coach';

// Validated inline (this route owns its schema; src/lib/validation.ts is shared).
const sendMessageSchema = z.object({
  threadId: z.string().min(1).optional(),
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2000 characters or fewer'),
});

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }
    const { threadId, content } = parsed.data;

    // Fail before touching the database so a misconfigured deploy never
    // persists a message the coach can't answer.
    if (!isCoachConfigured()) {
      return NextResponse.json(
        { error: 'Coach is not configured' },
        { status: 503 },
      );
    }

    const limit = await checkRateLimit(userId);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Daily coach limit reached' },
        { status: 429 },
      );
    }

    // Resolve (ownership-checked) or create the thread.
    let createdThread = false;
    let thread = threadId
      ? await prisma.coachThread.findFirst({ where: { id: threadId, userId } })
      : null;
    if (threadId && !thread) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    if (!thread) {
      thread = await prisma.coachThread.create({
        data: { userId, title: titleFromMessage(content) },
      });
      createdThread = true;
    }

    const history = await prisma.coachMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: 'asc' },
      take: 40,
    });

    const userMessage = await prisma.coachMessage.create({
      data: { threadId: thread.id, senderType: 'user', content },
    });

    let replyText: string;
    try {
      replyText = await generateCoachReply({
        userId,
        threadMessages: history.map((m) => ({
          senderType: m.senderType,
          content: m.content,
        })),
        userMessage: content,
      });
    } catch (error) {
      // Roll back so the client can retry without duplicating the message.
      await prisma.coachMessage.delete({ where: { id: userMessage.id } }).catch(() => {});
      if (createdThread) {
        await prisma.coachThread.delete({ where: { id: thread.id } }).catch(() => {});
      }
      if (error instanceof CoachUnavailableError) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
      console.error('Coach reply error:', error);
      return NextResponse.json(
        { error: 'Coach is unavailable right now. Try again in a moment.' },
        { status: 503 },
      );
    }

    const replyMessage = await prisma.coachMessage.create({
      data: { threadId: thread.id, senderType: 'coach', content: replyText },
    });

    // Touch the thread so it sorts to the top of the list.
    await prisma.coachThread.update({
      where: { id: thread.id },
      data: { title: thread.title },
    });

    return NextResponse.json(
      {
        data: {
          threadId: thread.id,
          message: {
            id: userMessage.id,
            senderType: userMessage.senderType,
            content: userMessage.content,
            createdAt: userMessage.createdAt.toISOString(),
          },
          reply: {
            id: replyMessage.id,
            senderType: replyMessage.senderType,
            content: replyMessage.content,
            createdAt: replyMessage.createdAt.toISOString(),
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Coach message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
