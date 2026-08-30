import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { FOOD_DATABASE } from "@/services/data/food-database";
import {
  MEAL_TYPES,
  type MealType,
  type ProteinEntryDTO,
} from "@/components/pillars/dto";

const logSchema = z
  .object({
    // Optional when a foodId is given — the food's protein is used instead.
    grams: z
      .number()
      .int("Protein must be a whole number of grams")
      .min(1, "Protein must be at least 1 g")
      .max(300, "Protein must be 300 g or less")
      .optional(),
    calories: z.number().int().min(0).max(5000).nullish(),
    label: z.string().trim().min(1).max(80).nullish(),
    mealType: z
      .enum(MEAL_TYPES, {
        errorMap: () => ({ message: "Unknown meal type" }),
      })
      .nullish(),
    foodId: z.string().trim().min(1).max(80).nullish(),
  })
  .refine((v) => v.grams != null || (v.foodId != null && v.foodId !== ""), {
    message: "Protein in grams is required",
    path: ["grams"],
  });

interface EntryRow {
  id: string;
  date: Date;
  grams: number;
  calories: number | null;
  label: string | null;
  mealType: string | null;
}

function toDTO(row: EntryRow): ProteinEntryDTO {
  return {
    id: row.id,
    date: row.date.toISOString(),
    grams: row.grams,
    calories: row.calories,
    label: row.label,
    mealType: (row.mealType as MealType | null) ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = logSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { foodId, mealType } = parsed.data;
    let { grams, calories, label } = parsed.data;

    // A foodId resolves protein / calories / label server-side, so the client
    // never has to be trusted with the food database's numbers.
    if (foodId) {
      const food = FOOD_DATABASE.find((f) => f.id === foodId);
      if (!food) {
        return NextResponse.json({ error: "Unknown food" }, { status: 400 });
      }
      grams = grams ?? Math.round(food.proteinG);
      calories = calories ?? food.calories;
      label = label ?? food.name;
    }

    if (grams == null || grams < 1) {
      return NextResponse.json(
        { error: "Protein in grams is required" },
        { status: 400 },
      );
    }
    if (grams > 300) {
      return NextResponse.json(
        { error: "Protein must be 300 g or less" },
        { status: 400 },
      );
    }

    const entry = await prisma.proteinEntry.create({
      data: {
        userId,
        grams,
        calories: calories ?? null,
        label: label && label.length > 0 ? label : null,
        mealType: mealType ?? null,
        date: new Date(),
      },
    });

    return NextResponse.json({ data: { entry: toDTO(entry) } });
  } catch (error) {
    console.error("Log protein error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
