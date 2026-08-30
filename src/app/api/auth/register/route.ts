import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie, signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Abuse protection: 10 attempts per 15 minutes, keyed on client IP + email.
// Per-instance only (see rate-limit.ts).
const REGISTER_LIMIT = 10;
const REGISTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, age, sex, weight, experienceLevel, trainingGoal } = parsed.data;

    const limit = rateLimit(`register:${clientIp(request)}:${email.toLowerCase()}`, {
      limit: REGISTER_LIMIT,
      windowMs: REGISTER_WINDOW_MS,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        age,
        sex,
        weight,
        experienceLevel,
        trainingGoal,
      },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        sex: true,
        weight: true,
        experienceLevel: true,
        trainingGoal: true,
        createdAt: true,
      },
    });

    const token = signToken(user.id);

    const response = NextResponse.json({ data: { token, user } }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
