// Display copy for splits/sharing pages, complementing
// src/components/onboarding/draft.ts (which covers goal/equipment/location).

import type { MuscleGroup } from "@/lib/types";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
  forearms: "Forearms",
  traps: "Traps",
};

export const SPLIT_TYPE_LABELS: Record<string, string> = {
  ai_optimized: "AI Optimized",
  ai_recovery: "AI Recovery",
  full_body: "Full Body",
  upper_lower: "Upper / Lower",
  push_pull_legs: "Push / Pull / Legs",
  bro_split: "Bro Split",
  custom: "Custom",
};

const DAY_NAMES = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

/** dayNumber (1-7) → short weekday label, matching SplitDay's Mon-first convention. */
export function dayShortName(dayNumber: number): string {
  return DAY_NAMES[(dayNumber - 1) % 7] ?? `Day ${dayNumber}`;
}
