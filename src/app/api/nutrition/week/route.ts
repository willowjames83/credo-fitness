import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import type { NutritionDayDTO, NutritionWeekDTO } from "@/components/pillars/dto";
import { addDaysUtc, utcDayStart } from "@/components/pillars/week";

/** Days of history loaded so the streak can run past the visible week. */
const STREAK_WINDOW_DAYS = 60;

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = utcDayStart(now);
    const windowStart = addDaysUtc(today, -(STREAK_WINDOW_DAYS - 1));

    const [user, rows] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { proteinTargetG: true },
      }),
      prisma.proteinEntry.findMany({
        where: { userId, date: { gte: windowStart } },
        select: { date: true, grams: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetG = user.proteinTargetG ?? 0;

    // Totals per UTC day, keyed by day-start epoch.
    const totals = new Map<number, number>();
    for (const row of rows) {
      const key = utcDayStart(row.date).getTime();
      totals.set(key, (totals.get(key) ?? 0) + row.grams);
    }

    const hitOn = (dayOffset: number): boolean => {
      const total = totals.get(addDaysUtc(today, dayOffset).getTime()) ?? 0;
      return targetG > 0 && total >= targetG;
    };

    // Last 7 days, oldest → newest, ending today.
    const days: NutritionDayDTO[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = addDaysUtc(today, -i);
      const totalG = totals.get(day.getTime()) ?? 0;
      days.push({
        date: day.toISOString(),
        totalG,
        targetG,
        hit: targetG > 0 && totalG >= targetG,
      });
    }

    // Today is still in progress, so a miss so far doesn't break the streak.
    let streak = 0;
    let cursor = hitOn(0) ? 0 : -1;
    while (cursor > -STREAK_WINDOW_DAYS && hitOn(cursor)) {
      streak++;
      cursor--;
    }

    const data: NutritionWeekDTO = { days, streak };
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Nutrition week error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
