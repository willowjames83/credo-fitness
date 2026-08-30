// warmup-generator.ts
// Adaptive pre-workout mobility/activation routine (PRD 4.1): a short set of
// bodyweight/band movements targeting today's primary muscles. Pure and
// deterministic.

import type {
  ExerciseDefinition,
  MuscleGroup,
  PlannedExerciseSpec,
} from "@/lib/types";

export interface WarmupMovement {
  exerciseId: string;
  name: string;
  /** Reps per set (rep-based movements) — time-based ones use durationSeconds. */
  reps?: number;
  durationSeconds?: number;
  targetMuscles: MuscleGroup[];
  cue?: string;
}

export interface WarmupRoutine {
  movements: WarmupMovement[];
  estimatedDuration: number; // minutes
  targetMuscles: MuscleGroup[];
}

const TIME_BASED_PATTERNS = new Set(["core", "carry"]);

/**
 * Build a 5-8 movement warmup routine from the library's bodyweight/band
 * exercises, prioritizing movements that activate the primary muscles of
 * today's working sets (core/activation work first, then pattern rehearsal).
 */
export function generateWarmup(
  plannedExercises: PlannedExerciseSpec[],
  library: ExerciseDefinition[],
): WarmupRoutine {
  const byId = new Map(library.map((ex) => [ex.id, ex]));

  // Today's primary muscles, in workout order (compounds come first).
  const targetMuscles: MuscleGroup[] = [];
  for (const spec of plannedExercises) {
    if (spec.isWarmup) continue;
    const ex = byId.get(spec.exerciseId);
    if (!ex) continue;
    for (const m of ex.primaryMuscles) {
      if (!targetMuscles.includes(m)) targetMuscles.push(m);
    }
  }
  const targetSet = new Set(targetMuscles);
  const workingIds = new Set(
    plannedExercises.filter((s) => !s.isWarmup).map((s) => s.exerciseId),
  );

  // Candidates: bodyweight/band-only movements not already in the workout.
  const candidates = library.filter(
    (ex) =>
      !workingIds.has(ex.id) &&
      ex.equipment.every((e) => e === "bodyweight" || e === "bands") &&
      (ex.primaryMuscles.some((m) => targetSet.has(m)) ||
        ex.secondaryMuscles.some((m) => targetSet.has(m)) ||
        ex.movementPattern === "core"),
  );

  const relevance = (ex: ExerciseDefinition): number => {
    let score = 0;
    for (const m of ex.primaryMuscles) if (targetSet.has(m)) score += 2;
    for (const m of ex.secondaryMuscles) if (targetSet.has(m)) score += 1;
    if (ex.movementPattern === "core") score += 1; // spine prep for everything
    if (ex.difficulty === "beginner") score += 1; // keep warmups low-skill
    return score;
  };

  const picked: ExerciseDefinition[] = [...candidates]
    .sort((a, b) => {
      const diff = relevance(b) - relevance(a);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    })
    // Avoid stacking several warmups on the same single muscle.
    .reduce<ExerciseDefinition[]>((acc, ex) => {
      if (acc.length >= 8) return acc;
      const key = ex.primaryMuscles[0];
      const sameMuscle = acc.filter((p) => p.primaryMuscles[0] === key).length;
      if (sameMuscle < 2) acc.push(ex);
      return acc;
    }, [])
    .slice(0, 8);

  const movements: WarmupMovement[] = picked.map((ex) => {
    const timeBased = TIME_BASED_PATTERNS.has(ex.movementPattern);
    return {
      exerciseId: ex.id,
      name: ex.name,
      ...(timeBased ? { durationSeconds: 30 } : { reps: 10 }),
      targetMuscles: ex.primaryMuscles,
      cue: ex.formCues[0],
    };
  });

  return {
    movements,
    // ~45s per movement including transitions.
    estimatedDuration: Math.max(3, Math.round((movements.length * 45) / 60)),
    targetMuscles,
  };
}
