import { describe, expect, it } from "vitest";
import {
  determineSplit,
  generateWeek,
  generateWorkout,
  splitTypeName,
} from "../workout-generator";
import { LIBRARY, NOW, PREFERENCES, PROFILE } from "./fixtures";
import type { SplitDay, TrainingPreferencesInput } from "@/lib/types";

const byId = new Map(LIBRARY.map((e) => [e.id, e]));

function prefs(overrides: Partial<TrainingPreferencesInput>): TrainingPreferencesInput {
  return { ...PREFERENCES, ...overrides };
}

const baseParams = {
  profile: PROFILE,
  preferences: PREFERENCES,
  history: [],
  recoveryStates: [],
  library: LIBRARY,
  weekNumber: 1,
  dayNumber: 1,
  now: NOW,
};

// A user-authored custom split: three training days around one rest day.
const CUSTOM_SPLIT: SplitDay[] = [
  { dayNumber: 1, label: "Chest Day", muscleGroups: ["chest"], isRestDay: false },
  { dayNumber: 2, label: "Rest", muscleGroups: [], isRestDay: true },
  { dayNumber: 3, label: "Back Day", muscleGroups: ["back"], isRestDay: false },
  { dayNumber: 4, label: "Leg Day", muscleGroups: ["quads", "glutes"], isRestDay: false },
];

const workingSpecs = (plan: ReturnType<typeof generateWorkout>) =>
  plan.exercises.filter((e) => !e.isWarmup);

describe("determineSplit with a custom split (Task 1)", () => {
  it("drops rest days, preserves order + labels, renumbers 1..N", () => {
    const split = determineSplit(prefs({ preferredSplit: "custom" }), CUSTOM_SPLIT);
    expect(split.map((d) => d.label)).toEqual(["Chest Day", "Back Day", "Leg Day"]);
    expect(split.map((d) => d.dayNumber)).toEqual([1, 2, 3]);
    expect(split.every((d) => !d.isRestDay)).toBe(true);
    expect(split[2].muscleGroups).toEqual(["quads", "glutes"]);
  });

  it("falls back to the daysPerWeek split when custom is preferred but none is supplied", () => {
    // daysPerWeek 4 → Upper/Lower fallback, no crash.
    const split = determineSplit(prefs({ preferredSplit: "custom", daysPerWeek: 4 }));
    expect(split.map((d) => d.label)).toEqual([
      "Upper Body", "Lower Body", "Upper Body", "Lower Body",
    ]);
  });

  it("falls back when the custom split has only rest days", () => {
    const restOnly: SplitDay[] = [
      { dayNumber: 1, label: "Rest", muscleGroups: [], isRestDay: true },
    ];
    const split = determineSplit(prefs({ preferredSplit: "custom", daysPerWeek: 2 }), restOnly);
    expect(split.every((d) => d.label === "Full Body")).toBe(true);
  });
});

describe("splitTypeName with a custom split (Task 1)", () => {
  it("returns the split name when custom + provided", () => {
    expect(
      splitTypeName(prefs({ preferredSplit: "custom" }), CUSTOM_SPLIT, "PPL-ish"),
    ).toBe("PPL-ish");
  });

  it('returns "Custom" when custom + provided but unnamed', () => {
    expect(splitTypeName(prefs({ preferredSplit: "custom" }), CUSTOM_SPLIT)).toBe("Custom");
  });

  it("returns the safe fallback name when custom + no split", () => {
    expect(splitTypeName(prefs({ preferredSplit: "custom", daysPerWeek: 4 }))).toBe("Upper/Lower");
  });
});

describe("generateWorkout with a custom split (Task 1)", () => {
  const customParams = {
    ...baseParams,
    preferences: prefs({ preferredSplit: "custom" }),
    customSplit: CUSTOM_SPLIT,
    customSplitName: "My Split",
  };

  it("day 1 drives the first custom day's muscle groups", () => {
    const plan = generateWorkout({ ...customParams, dayNumber: 1 });
    expect(plan.focus.startsWith("Chest Day")).toBe(true);
    expect(plan.splitType).toBe("My Split");
    const working = workingSpecs(plan);
    expect(working.length).toBeGreaterThan(0);
    for (const spec of working) {
      const primaries = byId.get(spec.exerciseId)!.primaryMuscles;
      expect(primaries).toContain("chest");
    }
  });

  it("day 3 drives the third custom day's muscle groups (legs)", () => {
    const plan = generateWorkout({ ...customParams, dayNumber: 3 });
    expect(plan.focus.startsWith("Leg Day")).toBe(true);
    for (const spec of workingSpecs(plan)) {
      const primaries = byId.get(spec.exerciseId)!.primaryMuscles;
      expect(primaries.some((m) => m === "quads" || m === "glutes")).toBe(true);
    }
  });

  it("rotation cycles through the custom days as dayNumber advances", () => {
    const labelFor = (day: number) =>
      generateWorkout({ ...customParams, dayNumber: day }).focus.split(" —")[0];
    expect(labelFor(1)).toBe("Chest Day");
    expect(labelFor(2)).toBe("Back Day");
    expect(labelFor(3)).toBe("Leg Day");
    // dayNumber 4 wraps back to the first custom day.
    expect(labelFor(4)).toBe("Chest Day");
  });

  it("generateWeek honors the custom split across the week", () => {
    const week = generateWeek({
      ...baseParams,
      preferences: prefs({ preferredSplit: "custom", daysPerWeek: 3 }),
      customSplit: CUSTOM_SPLIT,
      customSplitName: "My Split",
    });
    expect(week).toHaveLength(3);
    expect(week[0].focus.startsWith("Chest Day")).toBe(true);
    expect(week[1].focus.startsWith("Back Day")).toBe(true);
    expect(week[2].focus.startsWith("Leg Day")).toBe(true);
    expect(week.every((p) => p.splitType === "My Split")).toBe(true);
  });

  it("custom preferred with no customSplit still produces a valid plan", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ preferredSplit: "custom", daysPerWeek: 4 }),
    });
    expect(plan.splitType).toBe("Upper/Lower");
    expect(workingSpecs(plan).length).toBeGreaterThan(0);
  });
});

describe("superset programming (Task 2)", () => {
  it("pairs accessory work into valid, mutual supersets when enabled", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ enableSupersets: true }),
    });
    const specById = new Map(plan.exercises.filter((e) => !e.isWarmup).map((e) => [e.exerciseId, e]));
    const supersetted = plan.exercises.filter((e) => !e.isWarmup && e.isSuperset);

    // At least one mutual pair (two specs).
    expect(supersetted.length).toBeGreaterThanOrEqual(2);
    expect(supersetted.length % 2).toBe(0);

    for (const spec of supersetted) {
      // Rest between pairs is 60s per the PRD.
      expect(spec.restPeriod).toBe(60);
      // Reference is present and points to a real, mutually-linked partner.
      expect(spec.supersetWith).toBeTruthy();
      const partner = specById.get(spec.supersetWith!);
      expect(partner).toBeDefined();
      expect(partner!.isSuperset).toBe(true);
      expect(partner!.supersetWith).toBe(spec.exerciseId);
      // Partners target different primary muscle groups.
      const groupA = byId.get(spec.exerciseId)!.primaryMuscles[0];
      const groupB = byId.get(partner!.exerciseId)!.primaryMuscles[0];
      expect(groupA).not.toBe(groupB);
    }
  });

  it("never marks warmup entries as supersets", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ enableSupersets: true }),
    });
    for (const warmup of plan.exercises.filter((e) => e.isWarmup)) {
      expect(warmup.isSuperset).toBeFalsy();
      expect(warmup.supersetWith).toBeUndefined();
    }
  });

  it("caps the number of supersetted pairs", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ enableSupersets: true, sessionDuration: 90 }),
    });
    const pairs = plan.exercises.filter((e) => !e.isWarmup && e.isSuperset).length / 2;
    expect(pairs).toBeLessThanOrEqual(2);
  });

  it("produces no supersets when disabled", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ enableSupersets: false }),
    });
    expect(plan.exercises.some((e) => e.isSuperset)).toBe(false);
  });

  it("supersetWith references stay valid after warmup insertion + renumber", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ enableSupersets: true }),
    });
    const ids = new Set(plan.exercises.map((e) => e.exerciseId));
    // order is contiguous 1..N after renumbering.
    plan.exercises.forEach((e, i) => expect(e.order).toBe(i + 1));
    for (const spec of plan.exercises.filter((e) => e.isSuperset)) {
      expect(ids.has(spec.supersetWith!)).toBe(true);
    }
  });

  it("is deterministic with supersets enabled", () => {
    const params = { ...baseParams, preferences: prefs({ enableSupersets: true }) };
    expect(generateWorkout(params)).toEqual(generateWorkout(params));
  });
});
