import { describe, expect, it } from "vitest";
import { generateWarmup } from "../warmup-generator";
import { generateWorkout } from "../workout-generator";
import { LIBRARY, NOW, PREFERENCES, PROFILE } from "./fixtures";
import type { PlannedExerciseSpec } from "@/lib/types";

const byId = new Map(LIBRARY.map((e) => [e.id, e]));

function spec(exerciseId: string, order: number): PlannedExerciseSpec {
  return {
    exerciseId,
    order,
    targetSets: 3,
    targetReps: [8, 12],
    recommendedWeight: 100,
    restPeriod: 120,
  };
}

describe("generateWarmup (PRD 4.1)", () => {
  it("builds a short routine of bodyweight/band movements only", () => {
    const routine = generateWarmup(
      [spec("back_squat", 1), spec("bench_press", 2), spec("barbell_row", 3)],
      LIBRARY,
    );
    expect(routine.movements.length).toBeGreaterThanOrEqual(5);
    expect(routine.movements.length).toBeLessThanOrEqual(8);
    for (const m of routine.movements) {
      const ex = byId.get(m.exerciseId)!;
      expect(ex.equipment.every((e) => e === "bodyweight" || e === "bands")).toBe(true);
    }
    expect(routine.estimatedDuration).toBeGreaterThanOrEqual(3);
  });

  it("targets today's primary muscles", () => {
    const routine = generateWarmup([spec("back_squat", 1)], LIBRARY);
    expect(routine.targetMuscles).toEqual(["quads", "glutes"]);
    // At least one movement should hit a target muscle directly.
    const hits = routine.movements.filter((m) =>
      m.targetMuscles.some((muscle) => routine.targetMuscles.includes(muscle)),
    );
    expect(hits.length).toBeGreaterThan(0);
  });

  it("does not repeat the workout's own working exercises", () => {
    const specs = [spec("pushup", 1), spec("air_squat", 2)];
    const routine = generateWarmup(specs, LIBRARY);
    const workingIds = specs.map((s) => s.exerciseId);
    for (const m of routine.movements) {
      expect(workingIds).not.toContain(m.exerciseId);
    }
  });

  it("uses time for core holds and reps for dynamic movements", () => {
    const routine = generateWarmup([spec("back_squat", 1), spec("deadlift", 2)], LIBRARY);
    const core = routine.movements.find((m) => byId.get(m.exerciseId)!.movementPattern === "core");
    const dynamic = routine.movements.find(
      (m) => byId.get(m.exerciseId)!.movementPattern !== "core",
    );
    if (core) expect(core.durationSeconds).toBe(30);
    if (dynamic) expect(dynamic.reps).toBe(10);
  });

  it("composes with the generator's plan output", () => {
    const plan = generateWorkout({
      profile: PROFILE,
      preferences: PREFERENCES,
      history: [],
      recoveryStates: [],
      library: LIBRARY,
      weekNumber: 1,
      dayNumber: 1,
      now: NOW,
    });
    const routine = generateWarmup(plan.exercises, LIBRARY);
    expect(routine.movements.length).toBeGreaterThan(0);
  });
});
