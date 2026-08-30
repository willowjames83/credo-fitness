import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, setSessionCookie, signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Brute-force protection: 10 attempts per 15 minutes, keyed on client IP +
// email. Per-instance only (see rate-limit.ts). Applied after we know the
// email so distinct accounts from a shared IP don't collide.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const limit = rateLimit(`login:${clientIp(request)}:${email.toLowerCase()}`, {
      limit: LOGIN_LIMIT,
      windowMs: LOGIN_WINDOW_MS,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken(user.id);

    const response = NextResponse.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          sex: user.sex,
          weight: user.weight,
          experienceLevel: user.experienceLevel,
          trainingGoal: user.trainingGoal,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
        },
      },
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
