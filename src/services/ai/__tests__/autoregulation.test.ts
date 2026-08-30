import { describe, expect, it } from "vitest";
import { adjustAfterSet } from "../autoregulation";
import type { CompletedSetInput, PlannedExerciseSpec } from "@/lib/types";

const planned: PlannedExerciseSpec = {
  exerciseId: "bench_press",
  order: 1,
  targetSets: 4,
  targetReps: [8, 12],
  recommendedWeight: 200,
  restPeriod: 120,
};

function set(overrides: Partial<CompletedSetInput>): CompletedSetInput {
  return { setNumber: 1, weight: 200, reps: 10, ...overrides };
}

describe("adjustAfterSet (PRD real-time adjustment rules)", () => {
  it("reduces weight 5% when reps fall 2-3 short of the floor", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 6 })],
      justCompleted: set({ reps: 6 }),
    });
    expect(adj.action).toBe("reduce_weight");
    expect(adj.nextSetWeight).toBe(190); // 200 * 0.95
  });

  it("reduces weight 10% when reps fall 4+ short", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 4 })],
      justCompleted: set({ reps: 4 }),
    });
    expect(adj.action).toBe("reduce_weight");
    expect(adj.nextSetWeight).toBe(180); // 200 * 0.90
  });

  it("cuts one set of remaining volume at RPE >= 9", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 9, rpe: 9 })],
      justCompleted: set({ reps: 9, rpe: 9 }),
    });
    expect(adj.action).toBe("reduce_volume");
    expect(adj.dropSets).toBe(1);
  });

  it("flags a weight increase when reps beat the ceiling by 2+", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 14 })],
      justCompleted: set({ reps: 14 }),
    });
    expect(adj.action).toBe("flag_increase");
  });

  it("does not flag when only 1 rep over the ceiling", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 13 })],
      justCompleted: set({ reps: 13 }),
    });
    expect(adj.action).toBe("none");
  });

  it("notes fatigue when rest exceeds 2x the recommendation", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 10, restDuration: 300 })],
      justCompleted: set({ reps: 10, restDuration: 300 }),
    });
    expect(adj.action).toBe("none");
    expect(adj.reason.toLowerCase()).toContain("fatigue");
  });

  it("weight reduction outranks the RPE rule when both trigger", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 5, rpe: 10 })],
      justCompleted: set({ reps: 5, rpe: 10 }),
    });
    expect(adj.action).toBe("reduce_weight");
  });

  it("returns none when the set is on target", () => {
    const adj = adjustAfterSet({
      plannedExercise: planned,
      completedSets: [set({ reps: 10, rpe: 7, restDuration: 130 })],
      justCompleted: set({ reps: 10, rpe: 7, restDuration: 130 }),
    });
    expect(adj.action).toBe("none");
  });
});
