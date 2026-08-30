import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import type {
  MealType,
  NutritionTodayDTO,
  ProteinEntryDTO,
} from "@/components/pillars/dto";
import { addDaysUtc, utcDayStart } from "@/components/pillars/week";

/** Roughly one protein-forward meal. */
const MEAL_GRAMS = 32;

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five"];

function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/**
 * Adaptive pacing line: remaining grams weighed against how much of the day is
 * left (UTC hours), phrased as meals rather than a bare number.
 */
function pacingLine(params: {
  targetG: number | null;
  totalG: number;
  remainingG: number;
  hour: number;
}): string {
  const { targetG, totalG, remainingG, hour } = params;

  if (targetG == null || targetG <= 0) {
    return "Finish onboarding to set a protein target and get daily pacing.";
  }

  if (remainingG <= 0) {
    const over = totalG - targetG;
    return over > 0
      ? `Target cleared — ${totalG} of ${targetG}g, ${over}g past the line. Anything else today is a bonus.`
      : `Target hit — ${totalG} of ${targetG}g. Anything else today is a bonus.`;
  }

  const meals = remainingG <= 20 ? 1 : Math.min(4, Math.round(remainingG / MEAL_GRAMS));
  const mealCount = Math.max(1, meals);
  const mealWord = mealCount === 1 ? "meal" : "meals";

  if (hour >= 20) {
    return `${remainingG}g to go with the day nearly done — a shake plus a high-protein snack closes the gap.`;
  }

  // Behind or ahead of an even spread across the eating window (08:00-22:00).
  const elapsed = Math.min(1, Math.max(0, (hour - 8) / 14));
  const expected = Math.round(targetG * elapsed);
  const behind = totalG < expected - 15;

  const core = `${remainingG}g to go — that's roughly ${numberWord(mealCount)} protein-forward ${mealWord}`;
  if (hour >= 15) return `${core} before bed.`;
  if (behind) return `Behind pace. ${core} across the rest of the day.`;
  return `${core} across the rest of the day.`;
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const dayStart = utcDayStart(now);
    const dayEnd = addDaysUtc(dayStart, 1);

    const [user, rows] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { proteinTargetG: true },
      }),
      prisma.proteinEntry.findMany({
        where: { userId, date: { gte: dayStart, lt: dayEnd } },
        orderBy: { date: "asc" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetG = user.proteinTargetG ?? null;
    const totalG = rows.reduce((sum, r) => sum + r.grams, 0);
    const remainingG = targetG != null ? Math.max(0, targetG - totalG) : null;

    const entries: ProteinEntryDTO[] = rows.map((row) => ({
      id: row.id,
      date: row.date.toISOString(),
      grams: row.grams,
      calories: row.calories,
      label: row.label,
      mealType: (row.mealType as MealType | null) ?? null,
    }));

    const data: NutritionTodayDTO = {
      targetG,
      totalG,
      remainingG,
      entries,
      pacing: pacingLine({
        targetG,
        totalG,
        remainingG: remainingG ?? 0,
        hour: now.getUTCHours(),
      }),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Nutrition today error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
