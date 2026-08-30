// Credo preset split templates.
// Ported from the iOS app's ProgramLibrary.swift day structures and mapped to
// the SplitDay shape used by WorkoutSplit records. Each template lays out a
// full 7-day week (dayNumber 1-7) with explicit rest days; `daysPerWeek`
// counts training days only.

import type { MuscleGroup, SplitDay, SplitType } from "../../lib/types";

export interface PresetSplit {
  id: string;
  name: string;
  type: SplitType;
  daysPerWeek: number;
  description: string;
  days: SplitDay[];
}

function day(
  dayNumber: number,
  label: string,
  muscleGroups: MuscleGroup[],
): SplitDay {
  return { dayNumber, label, muscleGroups, isRestDay: false };
}

function rest(dayNumber: number): SplitDay {
  return { dayNumber, label: "Rest", muscleGroups: [], isRestDay: true };
}

const FULL_BODY: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "quads",
  "hamstrings",
  "glutes",
  "core",
];

export const PRESET_SPLITS: PresetSplit[] = [
  {
    id: "full-body-2day",
    name: "Full Body (2 Day)",
    type: "full_body",
    daysPerWeek: 2,
    description:
      "Two full-body sessions with maximal recovery between them. The minimum effective dose for strength and longevity.",
    days: [
      day(1, "Full Body A", FULL_BODY),
      rest(2),
      rest(3),
      day(4, "Full Body B", FULL_BODY),
      rest(5),
      rest(6),
      rest(7),
    ],
  },
  {
    id: "full-body-3day",
    name: "Full Body (3 Day)",
    type: "full_body",
    daysPerWeek: 3,
    description:
      "Three alternating full-body sessions built on the five essential patterns: push, pull, hinge, squat, and carry.",
    days: [
      day(1, "Squat & Push", ["quads", "glutes", "chest", "triceps", "core"]),
      rest(2),
      day(3, "Hinge & Pull", ["hamstrings", "glutes", "back", "biceps", "core"]),
      rest(4),
      day(5, "Full Body & Power", FULL_BODY),
      rest(6),
      rest(7),
    ],
  },
  {
    id: "upper-lower-4day",
    name: "Upper / Lower (4 Day)",
    type: "upper_lower",
    daysPerWeek: 4,
    description:
      "The classic four-day split: every muscle trained twice a week with a built-in midweek recovery day.",
    days: [
      day(1, "Upper A", ["chest", "back", "shoulders", "biceps", "triceps"]),
      day(2, "Lower A", ["quads", "hamstrings", "glutes", "calves", "core"]),
      rest(3),
      day(4, "Upper B", ["chest", "back", "shoulders", "biceps", "triceps", "traps"]),
      day(5, "Lower B", ["quads", "hamstrings", "glutes", "calves", "core"]),
      rest(6),
      rest(7),
    ],
  },
  {
    id: "push-pull-legs-3day",
    name: "Push / Pull / Legs (3 Day)",
    type: "push_pull_legs",
    daysPerWeek: 3,
    description:
      "One push, one pull, and one leg day per week — a manageable PPL rotation for busy schedules.",
    days: [
      day(1, "Push", ["chest", "shoulders", "triceps"]),
      rest(2),
      day(3, "Pull", ["back", "biceps", "forearms", "traps"]),
      rest(4),
      day(5, "Legs", ["quads", "hamstrings", "glutes", "calves", "core"]),
      rest(6),
      rest(7),
    ],
  },
  {
    id: "push-pull-legs-6day",
    name: "Push / Pull / Legs (6 Day)",
    type: "push_pull_legs",
    daysPerWeek: 6,
    description:
      "The high-frequency PPL: each movement family trained twice per week, one full rest day.",
    days: [
      day(1, "Push A", ["chest", "shoulders", "triceps"]),
      day(2, "Pull A", ["back", "biceps", "forearms", "traps"]),
      day(3, "Legs A", ["quads", "hamstrings", "glutes", "calves", "core"]),
      day(4, "Push B", ["chest", "shoulders", "triceps"]),
      day(5, "Pull B", ["back", "biceps", "forearms", "traps"]),
      day(6, "Legs B", ["quads", "hamstrings", "glutes", "calves", "core"]),
      rest(7),
    ],
  },
  {
    id: "bro-split-5day",
    name: "Bro Split (5 Day)",
    type: "bro_split",
    daysPerWeek: 5,
    description:
      "One body part per day with high per-session volume: chest, back, shoulders, legs, and arms.",
    days: [
      day(1, "Chest", ["chest", "triceps"]),
      day(2, "Back", ["back", "biceps", "forearms"]),
      day(3, "Shoulders", ["shoulders", "traps"]),
      day(4, "Legs", ["quads", "hamstrings", "glutes", "calves"]),
      day(5, "Arms & Core", ["biceps", "triceps", "forearms", "core"]),
      rest(6),
      rest(7),
    ],
  },
];

export function getPresetSplit(id: string): PresetSplit | undefined {
  return PRESET_SPLITS.find((s) => s.id === id);
}
