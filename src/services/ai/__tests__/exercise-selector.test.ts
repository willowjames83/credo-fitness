import { describe, expect, it } from "vitest";
import {
  isCompound,
  orderForSession,
  selectExercises,
  suggestAlternatives,
} from "../exercise-selector";
import { LIBRARY } from "./fixtures";
import type { MuscleGroup } from "@/lib/types";

const baseParams = {
  targetGroups: ["chest", "back", "shoulders", "quads", "glutes", "core"] as MuscleGroup[],
  library: LIBRARY,
  equipment: LIBRARY.flatMap((e) => e.equipment),
  experienceLevel: "intermediate" as const,
  sessionDuration: 60,
  varietyLevel: "medium" as const,
  recentExerciseIds: [] as string[],
};

describe("selectExercises", () => {
  it("selects ~sessionDuration/8 exercises", () => {
    const selected = selectExercises(baseParams);
    expect(selected.length).toBeGreaterThanOrEqual(6);
    expect(selected.length).toBeLessThanOrEqual(8);
  });

  it("puts compound movements before isolation and core", () => {
    const selected = selectExercises(baseParams);
    const firstNonCompound = selected.findIndex((e) => !isCompound(e));
    if (firstNonCompound >= 0) {
      for (const ex of selected.slice(firstNonCompound)) {
        expect(isCompound(ex)).toBe(false);
      }
    }
    expect(isCompound(selected[0])).toBe(true);
  });

  it("only picks exercises doable with the available equipment", () => {
    const selected = selectExercises({
      ...baseParams,
      equipment: ["bodyweight"],
    });
    expect(selected.length).toBeGreaterThan(0);
    for (const ex of selected) {
      expect(ex.equipment.every((e) => e === "bodyweight")).toBe(true);
    }
  });

  it("respects muscle group exclusions", () => {
    const selected = selectExercises({
      ...baseParams,
      exclude: ["quads", "glutes"] as MuscleGroup[],
    });
    for (const ex of selected) {
      expect(ex.primaryMuscles).not.toContain("quads");
      expect(ex.primaryMuscles).not.toContain("glutes");
    }
  });

  it("filters out exercises above the user's experience level", () => {
    const selected = selectExercises({
      ...baseParams,
      targetGroups: ["hamstrings"] as MuscleGroup[],
      experienceLevel: "beginner",
    });
    expect(selected.map((e) => e.id)).not.toContain("nordic_curl");
  });

  it("high variety rotates away from recently used exercises", () => {
    const recent = ["bench_press", "back_squat"];
    const high = selectExercises({
      ...baseParams,
      sessionDuration: 24, // 3 slots — forces choices
      targetGroups: ["chest", "quads"] as MuscleGroup[],
      varietyLevel: "high",
      recentExerciseIds: recent,
    });
    const low = selectExercises({
      ...baseParams,
      sessionDuration: 24,
      targetGroups: ["chest", "quads"] as MuscleGroup[],
      varietyLevel: "low",
      recentExerciseIds: recent,
    });
    const highRecentCount = high.filter((e) => recent.includes(e.id)).length;
    const lowRecentCount = low.filter((e) => recent.includes(e.id)).length;
    expect(lowRecentCount).toBeGreaterThan(highRecentCount);
  });

  it("focus groups get extra coverage", () => {
    const focused = selectExercises({
      ...baseParams,
      focus: ["shoulders"] as MuscleGroup[],
    });
    const shoulderCount = focused.filter((e) =>
      e.primaryMuscles.includes("shoulders"),
    ).length;
    const unfocused = selectExercises(baseParams);
    const unfocusedShoulderCount = unfocused.filter((e) =>
      e.primaryMuscles.includes("shoulders"),
    ).length;
    expect(shoulderCount).toBeGreaterThanOrEqual(unfocusedShoulderCount);
    expect(shoulderCount).toBeGreaterThanOrEqual(1);
  });

  it("is deterministic for identical inputs", () => {
    const a = selectExercises({ ...baseParams, rotationSeed: 12 });
    const b = selectExercises({ ...baseParams, rotationSeed: 12 });
    expect(a.map((e) => e.id)).toEqual(b.map((e) => e.id));
  });
});

describe("orderForSession", () => {
  it("orders compound → isolation → core/carry", () => {
    const plank = LIBRARY.find((e) => e.id === "plank")!;
    const curl = LIBRARY.find((e) => e.id === "dumbbell_curl")!;
    const squat = LIBRARY.find((e) => e.id === "back_squat")!;
    const carry = LIBRARY.find((e) => e.id === "farmer_carry")!;
    const ordered = orderForSession([plank, curl, carry, squat]);
    expect(ordered.map((e) => e.id)).toEqual([
      "back_squat", "dumbbell_curl", "farmer_carry", "plank",
    ]);
  });
});

describe("suggestAlternatives", () => {
  it("suggests same-pattern, same-muscle substitutes", () => {
    const bench = LIBRARY.find((e) => e.id === "bench_press")!;
    const alts = suggestAlternatives(bench, LIBRARY, ["bodyweight"], 3);
    expect(alts.map((a) => a.id)).toContain("pushup");
    for (const alt of alts) {
      expect(alt.movementPattern).toBe("push");
      expect(alt.primaryMuscles.some((m) => bench.primaryMuscles.includes(m))).toBe(true);
    }
  });

  it("excludes substitutes needing unavailable equipment", () => {
    const squat = LIBRARY.find((e) => e.id === "back_squat")!;
    const alts = suggestAlternatives(squat, LIBRARY, ["bodyweight"], 5);
    expect(alts.map((a) => a.id)).toContain("air_squat");
    expect(alts.map((a) => a.id)).not.toContain("goblet_squat"); // needs dumbbell
  });
});
