// Shared DTOs for the cardio / nutrition / stability pillar APIs.
// Pure types + label maps: imported by both route handlers (server) and pages
// (client), so this file must stay free of React and Node/Prisma imports.

import type { WarmupMoveDTO } from "@/lib/types";

// ── Cardio ──────────────────────────────────────────────────────────────────

export const CARDIO_TYPES = [
  "zone2",
  "vo2max",
  "intervals",
  "outdoor_run",
  "ride",
  "row",
  "other",
] as const;

export type CardioType = (typeof CARDIO_TYPES)[number];

export const CARDIO_TYPE_LABELS: Record<CardioType, string> = {
  zone2: "Zone 2",
  vo2max: "VO2 max",
  intervals: "Intervals",
  outdoor_run: "Outdoor run",
  ride: "Ride",
  row: "Row",
  other: "Other",
};

/** Sessions that count as high-intensity ceiling work. */
export const VO2_TYPES: CardioType[] = ["vo2max", "intervals"];

export interface CardioSessionDTO {
  id: string;
  date: string; // ISO
  type: CardioType;
  minutes: number;
  avgHr: number | null;
  maxHr: number | null;
  distanceM: number | null;
  notes: string | null;
}

export interface CardioWeekPoint {
  weekStart: string; // ISO, Monday 00:00 UTC
  zone2Min: number;
  vo2Min: number;
}

export type CardioSuggestionKind = "start" | "behind" | "vo2" | "on_track";

export interface CardioSuggestion {
  kind: CardioSuggestionKind;
  /** The nudge itself, e.g. "You're 65 min short of your Zone 2 target — …". */
  message: string;
  /** Weekday names left this week with no lifting session scheduled. */
  freeDays: string[];
}

export interface CardioSummaryDTO {
  zone2ThisWeekMin: number;
  zone2TargetMin: number;
  vo2SessionsThisWeek: number;
  weeklyMinutes: CardioWeekPoint[]; // oldest → newest, 8 entries
  suggestion: CardioSuggestion;
}

// ── Nutrition ───────────────────────────────────────────────────────────────

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export interface ProteinEntryDTO {
  id: string;
  date: string; // ISO
  grams: number;
  calories: number | null;
  label: string | null;
  mealType: MealType | null;
}

export interface NutritionTodayDTO {
  /** null until onboarding sets a target. */
  targetG: number | null;
  totalG: number;
  remainingG: number | null;
  entries: ProteinEntryDTO[];
  pacing: string;
}

export interface NutritionDayDTO {
  date: string; // ISO, midnight UTC
  totalG: number;
  targetG: number;
  hit: boolean;
}

export interface NutritionWeekDTO {
  days: NutritionDayDTO[]; // oldest → newest, 7 entries ending today
  streak: number;
}

// ── Stability ───────────────────────────────────────────────────────────────

export const STABILITY_TYPES = ["warmup", "mobility", "balance", "core"] as const;

export type StabilityType = (typeof STABILITY_TYPES)[number];

export const STABILITY_TYPE_LABELS: Record<StabilityType, string> = {
  warmup: "Warmup",
  mobility: "Mobility",
  balance: "Balance",
  core: "Core",
};

export interface StabilitySessionDTO {
  id: string;
  date: string; // ISO
  type: StabilityType;
  minutes: number;
  notes: string | null;
}

export interface StabilityWeekPoint {
  weekStart: string; // ISO, Monday 00:00 UTC
  minutes: number;
}

export interface StabilitySummaryDTO {
  thisWeekMin: number;
  weeklyTargetMin: number;
  sessionsThisWeek: number;
  weeklyMinutes: StabilityWeekPoint[]; // oldest → newest, 8 entries
  /** Pre-lift routine from today's WorkoutPlan, or null when nothing is planned. */
  todaysWarmup: WarmupMoveDTO[] | null;
  /** Focus of the plan the warmup was matched to, e.g. "Upper Body". */
  todaysFocus: string | null;
}

export const STABILITY_WEEKLY_TARGET_MIN = 60;
export const WARMUP_SESSION_MINUTES = 8;
