import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  VO2_TYPES,
  type CardioSuggestion,
  type CardioSummaryDTO,
  type CardioWeekPoint,
} from "@/components/pillars/dto";
import {
  addDaysUtc,
  daysBetween,
  daysLeftInWeek,
  recentWeekStarts,
  utcDayStart,
  weekStartUtc,
  weekdayIndex,
  weekdayNameUtc,
} from "@/components/pillars/week";

const DEFAULT_ZONE2_TARGET_MIN = 150;
const CHART_WEEKS = 8;
/** Days without hard intervals before the Norwegian 4x4 nudge fires. */
const VO2_STALE_DAYS = 10;
/** Longest single Zone 2 block the nudge will prescribe. */
const MAX_SESSION_MIN = 45;

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
];

function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/**
 * The adaptive nudge. Priority: get started → catch up on Zone 2 volume once
 * the week is half gone → restore VO2 max work when intervals have gone stale
 * → otherwise affirm where the week stands.
 */
function buildSuggestion(params: {
  zone2ThisWeekMin: number;
  targetMin: number;
  sessionsThisWeek: number;
  hasAnyHistory: boolean;
  daysSinceVo2: number | null;
  now: Date;
  freeDays: string[];
}): CardioSuggestion {
  const {
    zone2ThisWeekMin,
    targetMin,
    sessionsThisWeek,
    hasAnyHistory,
    daysSinceVo2,
    now,
    freeDays,
  } = params;

  const remaining = Math.max(0, targetMin - zone2ThisWeekMin);
  const daysLeft = daysLeftInWeek(now); // 7 on Monday … 1 on Sunday
  const deadline = daysLeft === 1 ? "before the week closes" : "before Sunday";

  if (!hasAnyHistory && sessionsThisWeek === 0) {
    return {
      kind: "start",
      message:
        "No cardio logged yet. Start with a 30-min Zone 2 block — easy enough to hold a conversation the whole way through.",
      freeDays,
    };
  }

  // Behind on Zone 2 with the week already half spent (Wednesday onward).
  if (remaining > 0 && daysLeft <= 5) {
    const sessions = Math.max(
      1,
      Math.min(daysLeft, Math.ceil(remaining / MAX_SESSION_MIN)),
    );
    const per = Math.ceil(remaining / sessions / 5) * 5;
    const plural = sessions === 1 ? "session" : "sessions";
    return {
      kind: "behind",
      message: `You're ${remaining} min short of your Zone 2 target — ${numberWord(sessions)} ${per}-min ${plural} ${deadline}.`,
      freeDays,
    };
  }

  // Nothing hard in over a week and a half: bring back the ceiling work.
  if (daysSinceVo2 === null || daysSinceVo2 >= VO2_STALE_DAYS) {
    const lead =
      daysSinceVo2 === null
        ? "No VO2 max work on record"
        : `No VO2 max work in ${daysSinceVo2} days`;
    return {
      kind: "vo2",
      message: `${lead} — run a Norwegian 4x4: four 4-min efforts at 85-95% of max heart rate, 3 min easy between.`,
      freeDays,
    };
  }

  if (remaining > 0) {
    return {
      kind: "on_track",
      message: `${zone2ThisWeekMin} of ${targetMin} Zone 2 min with ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left — you're on pace. Keep the easy days easy.`,
      freeDays,
    };
  }

  const over = zone2ThisWeekMin - targetMin;
  return {
    kind: "on_track",
    message:
      over > 0
        ? `${zone2ThisWeekMin} of ${targetMin} Zone 2 min — target cleared by ${over} min with ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to spare.`
        : `${zone2ThisWeekMin} of ${targetMin} Zone 2 min — target hit with ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to spare.`,
    freeDays,
  };
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const weekStarts = recentWeekStarts(now, CHART_WEEKS);
    const chartStart = weekStarts[0];
    const thisWeekStart = weekStartUtc(now);
    const thisWeekEnd = addDaysUtc(thisWeekStart, 7);

    const [user, sessions, lastVo2, plans] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { zone2TargetMin: true },
      }),
      prisma.cardioSession.findMany({
        where: { userId, date: { gte: chartStart } },
        select: { date: true, type: true, minutes: true },
      }),
      prisma.cardioSession.findFirst({
        where: { userId, type: { in: VO2_TYPES } },
        orderBy: { date: "desc" },
        select: { date: true },
      }),
      prisma.workoutPlan.findMany({
        where: {
          userId,
          scheduledDate: { gte: thisWeekStart, lt: thisWeekEnd },
          status: { not: "skipped" },
        },
        select: { scheduledDate: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetMin = user.zone2TargetMin ?? DEFAULT_ZONE2_TARGET_MIN;

    // Bucket the last 8 weeks.
    const weeklyMinutes: CardioWeekPoint[] = weekStarts.map((start) => {
      const end = addDaysUtc(start, 7);
      const inWeek = sessions.filter((s) => s.date >= start && s.date < end);
      return {
        weekStart: start.toISOString(),
        zone2Min: inWeek
          .filter((s) => s.type === "zone2")
          .reduce((sum, s) => sum + s.minutes, 0),
        vo2Min: inWeek
          .filter((s) => (VO2_TYPES as string[]).includes(s.type))
          .reduce((sum, s) => sum + s.minutes, 0),
      };
    });

    const thisWeek = sessions.filter(
      (s) => s.date >= thisWeekStart && s.date < thisWeekEnd,
    );
    const zone2ThisWeekMin = thisWeek
      .filter((s) => s.type === "zone2")
      .reduce((sum, s) => sum + s.minutes, 0);
    const vo2SessionsThisWeek = thisWeek.filter((s) =>
      (VO2_TYPES as string[]).includes(s.type),
    ).length;

    // Days left this week (today included) with no lifting session scheduled —
    // the natural slots for cardio.
    const scheduled = new Set(
      plans
        .filter((p) => p.scheduledDate != null)
        .map((p) => utcDayStart(p.scheduledDate as Date).getTime()),
    );
    const freeDays: string[] = [];
    for (let offset = weekdayIndex(now); offset < 7; offset++) {
      const day = addDaysUtc(thisWeekStart, offset);
      if (!scheduled.has(day.getTime())) freeDays.push(weekdayNameUtc(day));
    }

    const suggestion = buildSuggestion({
      zone2ThisWeekMin,
      targetMin,
      sessionsThisWeek: thisWeek.length,
      hasAnyHistory: sessions.length > 0 || lastVo2 !== null,
      daysSinceVo2: lastVo2 ? daysBetween(lastVo2.date, now) : null,
      now,
      freeDays,
    });

    const data: CardioSummaryDTO = {
      zone2ThisWeekMin,
      zone2TargetMin: targetMin,
      vo2SessionsThisWeek,
      weeklyMinutes,
      suggestion,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Cardio summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
