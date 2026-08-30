import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const thread = await prisma.coachThread.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 200 } },
    });
    if (!thread) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = thread.messages;
    const last = messages[messages.length - 1];

    return NextResponse.json({
      data: {
        thread: {
          id: thread.id,
          title: thread.title,
          updatedAt: thread.updatedAt.toISOString(),
          lastMessage: last
            ? {
                content: last.content.slice(0, 120),
                senderType: last.senderType,
                createdAt: last.createdAt.toISOString(),
              }
            : null,
        },
        messages: messages.map((message) => ({
          id: message.id,
          senderType: message.senderType,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Get coach thread error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
