import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { findTodayPlan, toPlanDTO } from "@/services/training-context";
import {
  STABILITY_WEEKLY_TARGET_MIN,
  type StabilitySummaryDTO,
  type StabilityWeekPoint,
} from "@/components/pillars/dto";
import {
  addDaysUtc,
  recentWeekStarts,
  weekStartUtc,
} from "@/components/pillars/week";

const CHART_WEEKS = 8;

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

    const [sessions, todayPlan] = await Promise.all([
      prisma.stabilitySession.findMany({
        where: { userId, date: { gte: chartStart } },
        select: { date: true, minutes: true },
      }),
      findTodayPlan(userId, now),
    ]);

    const weeklyMinutes: StabilityWeekPoint[] = weekStarts.map((start) => {
      const end = addDaysUtc(start, 7);
      return {
        weekStart: start.toISOString(),
        minutes: sessions
          .filter((s) => s.date >= start && s.date < end)
          .reduce((sum, s) => sum + s.minutes, 0),
      };
    });

    const thisWeek = sessions.filter(
      (s) => s.date >= thisWeekStart && s.date < thisWeekEnd,
    );

    // The adaptive pre-lift routine already built for today's plan.
    let todaysWarmup: StabilitySummaryDTO["todaysWarmup"] = null;
    let todaysFocus: string | null = null;
    if (todayPlan) {
      const dto = await toPlanDTO(todayPlan, userId);
      todaysWarmup = dto.warmup.length > 0 ? dto.warmup : null;
      todaysFocus = dto.focus;
    }

    const data: StabilitySummaryDTO = {
      thisWeekMin: thisWeek.reduce((sum, s) => sum + s.minutes, 0),
      weeklyTargetMin: STABILITY_WEEKLY_TARGET_MIN,
      sessionsThisWeek: thisWeek.length,
      weeklyMinutes,
      todaysWarmup,
      todaysFocus,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Stability summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
