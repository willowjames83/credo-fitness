// Shared zod schemas + helpers for the /api/splits route family.
// (Not a route itself — the leading underscore keeps Next.js from treating
// it as one.)

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ALL_MUSCLE_GROUPS } from "@/lib/types";
import type { SplitType } from "@/lib/types";

const muscleGroupEnum = z.enum(
  ALL_MUSCLE_GROUPS as [string, ...string[]],
);

export const splitDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  label: z.string().min(1).max(30),
  muscleGroups: z.array(muscleGroupEnum),
  isRestDay: z.boolean(),
});

export const splitDaysSchema = z
  .array(splitDaySchema)
  .length(7, "days must have exactly 7 entries (dayNumber 1-7)")
  .refine(
    (days) => {
      const nums = [...days.map((d) => d.dayNumber)].sort((a, b) => a - b);
      return nums.every((n, i) => n === i + 1);
    },
    { message: "days must cover dayNumber 1 through 7 exactly once" },
  );

export const splitCreateSchema = z.object({
  name: z.string().min(1).max(60),
  days: splitDaysSchema,
});

export const splitUpdateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  days: splitDaysSchema.optional(),
  isShareable: z.boolean().optional(),
});

export const activatePresetSchema = z.object({
  presetId: z.string().min(1),
});

// Concrete split types a WorkoutSplit.type or preset id can map onto for
// TrainingPreferences.preferredSplit ("custom" is handled separately by callers).
const CONCRETE_SPLIT_TYPES: ReadonlySet<string> = new Set([
  "full_body",
  "upper_lower",
  "push_pull_legs",
  "bro_split",
]);

export function isConcreteSplitType(value: string): value is SplitType {
  return CONCRETE_SPLIT_TYPES.has(value);
}

/** Upsert TrainingPreferences.preferredSplit, seeding defaults on first write. */
export async function setPreferredSplit(userId: string, preferredSplit: string): Promise<void> {
  await prisma.trainingPreferences.upsert({
    where: { userId },
    create: {
      userId,
      goal: "longevity",
      daysPerWeek: 3,
      sessionDuration: 60,
      preferredSplit,
      trainingLocation: "commercial_gym",
      availableEquipment: [],
      muscleGroupFocus: [],
      muscleGroupExclude: [],
      enableSupersets: true,
      varietyLevel: "medium",
    },
    update: { preferredSplit },
  });
}
