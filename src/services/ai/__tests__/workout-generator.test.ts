import { describe, expect, it } from "vitest";
import {
  determineSplit,
  generateWeek,
  generateWorkout,
} from "../workout-generator";
import { updateRecoveryAfterWorkout } from "../recovery-tracker";
import { LIBRARY, NOW, PREFERENCES, PROFILE, daysAgo, historyEntry } from "./fixtures";
import type { TrainingPreferencesInput } from "@/lib/types";

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

describe("determineSplit (PRD Step 1)", () => {
  it("2 days → Full Body", () => {
    const split = determineSplit(prefs({ daysPerWeek: 2 }));
    expect(split).toHaveLength(2);
    expect(split.every((d) => d.label === "Full Body")).toBe(true);
  });

  it("3 days → Push/Pull/Legs by default", () => {
    const split = determineSplit(prefs({ daysPerWeek: 3 }));
    expect(split.map((d) => d.label)).toEqual(["Push", "Pull", "Legs"]);
  });

  it("3 days honors a Full Body preference", () => {
    const split = determineSplit(prefs({ daysPerWeek: 3, preferredSplit: "full_body" }));
    expect(split.every((d) => d.label === "Full Body")).toBe(true);
  });

  it("4 days → Upper/Lower alternating", () => {
    const split = determineSplit(prefs({ daysPerWeek: 4 }));
    expect(split.map((d) => d.label)).toEqual([
      "Upper Body", "Lower Body", "Upper Body", "Lower Body",
    ]);
  });

  it("5 and 6 days → Push/Pull/Legs cycled", () => {
    expect(determineSplit(prefs({ daysPerWeek: 5 })).map((d) => d.label)).toEqual([
      "Push", "Pull", "Legs", "Push", "Pull",
    ]);
    expect(determineSplit(prefs({ daysPerWeek: 6 })).map((d) => d.label)).toEqual([
      "Push", "Pull", "Legs", "Push", "Pull", "Legs",
    ]);
    const six = determineSplit(prefs({ daysPerWeek: 6 }));
    expect(six[5].dayNumber).toBe(6);
  });
});

describe("generateWorkout (Steps 2-7)", () => {
  it("produces a plan with warmup sets for the first two compounds", () => {
    const plan = generateWorkout(baseParams);
    const warmups = plan.exercises.filter((e) => e.isWarmup);
    expect(plan.includesWarmup).toBe(true);
    expect(warmups).toHaveLength(4); // 2 compounds × (50% + 70%)

    const firstWorking = plan.exercises.find(
      (e) => !e.isWarmup && e.exerciseId === warmups[0].exerciseId,
    )!;
    expect(warmups[0].recommendedWeight).toBeLessThan(firstWorking.recommendedWeight);
    // 50% then 70% of the working weight (rounded to 5)
    expect(warmups[0].recommendedWeight).toBe(
      Math.round((firstWorking.recommendedWeight * 0.5) / 5) * 5,
    );
    expect(warmups[1].recommendedWeight).toBe(
      Math.round((firstWorking.recommendedWeight * 0.7) / 5) * 5,
    );
  });

  it("orders compounds before isolation/core work", () => {
    const plan = generateWorkout(baseParams);
    const working = plan.exercises.filter((e) => !e.isWarmup);
    const patterns = working.map((e) => byId.get(e.exerciseId)!.movementPattern);
    const firstAccessory = patterns.findIndex(
      (p) => p === "isolation" || p === "core" || p === "carry",
    );
    if (firstAccessory >= 0) {
      for (const p of patterns.slice(firstAccessory)) {
        expect(["isolation", "core", "carry"]).toContain(p);
      }
    }
  });

  it("respects equipment restrictions end to end", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ availableEquipment: ["bodyweight"] }),
    });
    for (const spec of plan.exercises) {
      const ex = byId.get(spec.exerciseId)!;
      expect(ex.equipment.every((e) => e === "bodyweight")).toBe(true);
    }
  });

  it("respects muscle group exclusions", () => {
    const plan = generateWorkout({
      ...baseParams,
      dayNumber: 2, // lower day on upper/lower
      preferences: prefs({ muscleGroupExclude: ["quads"] }),
    });
    for (const spec of plan.exercises) {
      expect(byId.get(spec.exerciseId)!.primaryMuscles).not.toContain("quads");
    }
  });

  it("scales exercise count with session duration", () => {
    const short = generateWorkout({
      ...baseParams,
      preferences: prefs({ sessionDuration: 30 }),
    });
    const long = generateWorkout({
      ...baseParams,
      preferences: prefs({ sessionDuration: 90 }),
    });
    const count = (p: typeof short) => p.exercises.filter((e) => !e.isWarmup).length;
    expect(count(short)).toBeLessThan(count(long));
    expect(long.estimatedDuration).toBeGreaterThan(short.estimatedDuration);
  });

  it("applies progression from history in the recommended weight and rationale", () => {
    const history = [
      historyEntry("bench_press", daysAgo(9), [[100, 12], [100, 12], [100, 12]]),
      historyEntry("bench_press", daysAgo(2), [[100, 12], [100, 12], [100, 12]]),
    ];
    const plan = generateWorkout({ ...baseParams, history });
    const benchSpec = plan.exercises.find(
      (e) => e.exerciseId === "bench_press" && !e.isWarmup,
    )!;
    expect(benchSpec.recommendedWeight).toBeGreaterThan(100);
    expect(benchSpec.rationale).toMatch(/Up \d+ lb/);
  });

  it("avoids fatigued muscle groups (Step 2)", () => {
    // Fatigue chest right now; generate an upper day.
    const recoveryStates = updateRecoveryAfterWorkout(
      [],
      [{ group: "chest", sets: 5 }],
      PROFILE,
      NOW,
    );
    const plan = generateWorkout({ ...baseParams, recoveryStates });
    for (const spec of plan.exercises) {
      expect(byId.get(spec.exerciseId)!.primaryMuscles).not.toContain("chest");
    }
  });

  it("boosts skipped groups from recent plans (Step 2)", () => {
    // A recent plan included shoulders (ohp) but no shoulder work was logged.
    const recentPlans = [
      generateWorkout({
        ...baseParams,
        preferences: prefs({ muscleGroupFocus: ["shoulders"] }),
      }),
    ];
    const plan = generateWorkout({
      ...baseParams,
      dayNumber: 2, // lower day — skipped shoulders should still be pulled in
      recentPlans,
    });
    const groups = plan.exercises.flatMap((e) => byId.get(e.exerciseId)!.primaryMuscles);
    expect(groups).toContain("shoulders");
  });

  it("sets rest periods by intensity bucket (Step 6)", () => {
    const plan = generateWorkout({
      ...baseParams,
      preferences: prefs({ goal: "increase_strength" }), // 85% 1RM → heavy
    });
    for (const spec of plan.exercises.filter((e) => !e.isWarmup)) {
      const ex = byId.get(spec.exerciseId)!;
      const compound = ["push", "pull", "hinge", "squat"].includes(ex.movementPattern);
      if (compound) {
        expect(spec.restPeriod).toBeGreaterThanOrEqual(180);
        expect(spec.restPeriod).toBeLessThanOrEqual(300);
      } else {
        expect(spec.restPeriod).toBeGreaterThanOrEqual(60);
        expect(spec.restPeriod).toBeLessThanOrEqual(90);
      }
    }
  });

  it("volume scales with experience level (Step 5)", () => {
    const beginner = generateWorkout({
      ...baseParams,
      profile: { ...PROFILE, experienceLevel: "beginner" },
    });
    const advanced = generateWorkout({
      ...baseParams,
      profile: { ...PROFILE, experienceLevel: "advanced" },
    });
    const maxSets = (p: typeof beginner) =>
      Math.max(...p.exercises.filter((e) => !e.isWarmup).map((e) => e.targetSets));
    expect(maxSets(beginner)).toBeLessThan(maxSets(advanced));
  });

  it("is fully deterministic for identical inputs", () => {
    const a = generateWorkout(baseParams);
    const b = generateWorkout(baseParams);
    expect(a).toEqual(b);
  });
});

describe("generateWeek", () => {
  it("returns one plan per training day, honoring the split", () => {
    const week = generateWeek({
      ...baseParams,
      preferences: prefs({ daysPerWeek: 3, preferredSplit: "push_pull_legs" }),
    });
    expect(week).toHaveLength(3);
    expect(week.map((p) => p.dayNumber)).toEqual([1, 2, 3]);
    expect(week[0].focus).toMatch(/^Push/);
    expect(week[1].focus).toMatch(/^Pull/);
    expect(week[2].focus).toMatch(/^Legs/);
    expect(week.every((p) => p.totalDays === 3)).toBe(true);
  });

  it("every day has exercises and a duration", () => {
    const week = generateWeek(baseParams);
    for (const plan of week) {
      expect(plan.exercises.filter((e) => !e.isWarmup).length).toBeGreaterThan(0);
      expect(plan.estimatedDuration).toBeGreaterThan(0);
      expect(plan.splitType).toBe("Upper/Lower");
    }
  });
});
