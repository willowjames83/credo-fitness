import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, verifyToken } from '@/lib/auth';

// Server-component helper: resolve the logged-in user from the session cookie.
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function getSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      age: true,
      sex: true,
      weight: true,
      heightIn: true,
      experienceLevel: true,
      trainingGoal: true,
      onboardingCompleted: true,
      proteinTargetG: true,
      zone2TargetMin: true,
      createdAt: true,
    },
  });
}
