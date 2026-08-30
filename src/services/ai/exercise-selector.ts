// exercise-selector.ts
// Exercise selection + substitution logic (PRD 3.1 Step 3).
// Pure and deterministic: rotation is keyed on an injected seed, never random.

import type {
  Difficulty,
  Equipment,
  ExerciseDefinition,
  MovementPattern,
  MuscleGroup,
  VarietyLevel,
} from "@/lib/types";

const COMPOUND_PATTERNS: MovementPattern[] = ["push", "pull", "hinge", "squat"];

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

// Larger muscle groups first within compounds (PRD Step 7).
const MUSCLE_SIZE_RANK: Record<MuscleGroup, number> = {
  quads: 0,
  glutes: 1,
  hamstrings: 2,
  back: 3,
  chest: 4,
  shoulders: 5,
  traps: 6,
  triceps: 7,
  biceps: 8,
  calves: 9,
  forearms: 10,
  core: 11,
};

export function isCompound(exercise: ExerciseDefinition): boolean {
  return COMPOUND_PATTERNS.includes(exercise.movementPattern);
}

/** Can this exercise be performed with the available equipment? */
export function equipmentSatisfied(
  exercise: ExerciseDefinition,
  available: Equipment[],
): boolean {
  if (exercise.equipment.length === 0) return true;
  const set = new Set(available);
  set.add("bodyweight"); // bodyweight is always available
  return exercise.equipment.every((e) => set.has(e));
}

function primarySizeRank(exercise: ExerciseDefinition): number {
  return Math.min(...exercise.primaryMuscles.map((m) => MUSCLE_SIZE_RANK[m] ?? 99));
}

export interface SelectExercisesParams {
  targetGroups: MuscleGroup[];
  library: ExerciseDefinition[];
  equipment: Equipment[];
  experienceLevel: Difficulty | null;
  sessionDuration: number; // minutes
  varietyLevel: VarietyLevel;
  recentExerciseIds: string[]; // most recent first
  focus?: MuscleGroup[]; // adds extra volume for these groups
  exclude?: MuscleGroup[];
  /** Deterministic tie-break/rotation seed (e.g. weekNumber * 7 + dayNumber). */
  rotationSeed?: number;
}

/**
 * PRD Step 3: pick ~sessionDuration/8 exercises for the target muscle groups.
 * Compounds first, filtered by equipment + difficulty, honoring exclusions,
 * with variety-driven rotation against recently used exercises and extra
 * coverage for focus groups.
 */
export function selectExercises(params: SelectExercisesParams): ExerciseDefinition[] {
  const {
    targetGroups,
    library,
    equipment,
    experienceLevel,
    sessionDuration,
    varietyLevel,
    recentExerciseIds,
    focus = [],
    exclude = [],
    rotationSeed = 0,
  } = params;

  const excludeSet = new Set(exclude);
  const targetSet = new Set(targetGroups.filter((g) => !excludeSet.has(g)));
  const focusSet = new Set(focus.filter((g) => targetSet.has(g)));
  const expRank = DIFFICULTY_RANK[experienceLevel ?? "beginner"];
  const recentIndex = new Map(recentExerciseIds.map((id, i) => [id, i]));

  const count = Math.max(2, Math.round(sessionDuration / 8));

  const candidates = library.filter(
    (ex) =>
      DIFFICULTY_RANK[ex.difficulty] <= expRank &&
      equipmentSatisfied(ex, equipment) &&
      ex.primaryMuscles.some((m) => targetSet.has(m)) &&
      !ex.primaryMuscles.some((m) => excludeSet.has(m)),
  );

  // Variety scoring: low variety prefers recently used exercises (stability),
  // high variety pushes recently used exercises to the back of the queue.
  const varietyScore = (ex: ExerciseDefinition): number => {
    const idx = recentIndex.get(ex.id);
    const wasRecent = idx !== undefined;
    switch (varietyLevel) {
      case "low":
        return wasRecent ? -1 : 1;
      case "medium":
        return 0;
      case "high":
        return wasRecent ? 1 : -1;
    }
  };

  const stableHash = (id: string): number => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
    return h;
  };

  const sortCandidates = (list: ExerciseDefinition[]): ExerciseDefinition[] =>
    [...list].sort((a, b) => {
      const focusA = a.primaryMuscles.some((m) => focusSet.has(m)) ? 0 : 1;
      const focusB = b.primaryMuscles.some((m) => focusSet.has(m)) ? 0 : 1;
      if (focusA !== focusB) return focusA - focusB;
      const varA = varietyScore(a);
      const varB = varietyScore(b);
      if (varA !== varB) return varA - varB;
      const sizeA = primarySizeRank(a);
      const sizeB = primarySizeRank(b);
      if (sizeA !== sizeB) return sizeA - sizeB;
      // Deterministic rotation: seed shifts the tie-break ordering.
      const rotA = (stableHash(a.id) + rotationSeed * 17) % 9973;
      const rotB = (stableHash(b.id) + rotationSeed * 17) % 9973;
      if (rotA !== rotB) return rotA - rotB;
      return a.id.localeCompare(b.id);
    });

  const compounds = sortCandidates(candidates.filter(isCompound));
  const accessories = sortCandidates(candidates.filter((ex) => !isCompound(ex)));

  // Roughly half the slots (rounded up) go to compounds, rest to accessories.
  const selected: ExerciseDefinition[] = [];
  const covered = new Set<MuscleGroup>();
  const take = (ex: ExerciseDefinition) => {
    selected.push(ex);
    for (const m of ex.primaryMuscles) covered.add(m);
  };

  // First pass: ensure each target group is covered, compounds first.
  for (const pool of [compounds, accessories]) {
    for (const ex of pool) {
      if (selected.length >= count) break;
      if (selected.includes(ex)) continue;
      const addsCoverage = ex.primaryMuscles.some(
        (m) => targetSet.has(m) && !covered.has(m),
      );
      if (addsCoverage) take(ex);
    }
  }

  // Second pass: fill remaining slots, prioritizing focus groups then compounds.
  const remaining = [...compounds, ...accessories].filter((ex) => !selected.includes(ex));
  const focusFill = remaining.filter((ex) => ex.primaryMuscles.some((m) => focusSet.has(m)));
  const otherFill = remaining.filter((ex) => !focusFill.includes(ex));
  for (const ex of [...focusFill, ...otherFill]) {
    if (selected.length >= count) break;
    take(ex);
  }

  // Final order: compounds (largest muscles first) → isolation → core/carry.
  return orderForSession(selected);
}

/** PRD Step 7 ordering: Compound → Isolation → Core/Carry; larger muscles first. */
export function orderForSession(exercises: ExerciseDefinition[]): ExerciseDefinition[] {
  const bucket = (ex: ExerciseDefinition): number => {
    if (isCompound(ex)) return 0;
    if (ex.movementPattern === "isolation") return 1;
    return 2; // core, carry
  };
  return [...exercises].sort((a, b) => {
    const bA = bucket(a);
    const bB = bucket(b);
    if (bA !== bB) return bA - bB;
    const sA = primarySizeRank(a);
    const sB = primarySizeRank(b);
    if (sA !== sB) return sA - sB;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Substitutes sharing the exercise's movement pattern and at least one primary
 * muscle, doable with the available equipment. Deterministic ordering by
 * muscle overlap, then id.
 */
export function suggestAlternatives(
  exercise: ExerciseDefinition,
  library: ExerciseDefinition[],
  equipment: Equipment[],
  count: number,
): ExerciseDefinition[] {
  const primarySet = new Set(exercise.primaryMuscles);
  const overlap = (ex: ExerciseDefinition): number =>
    ex.primaryMuscles.filter((m) => primarySet.has(m)).length;

  return library
    .filter(
      (ex) =>
        ex.id !== exercise.id &&
        ex.movementPattern === exercise.movementPattern &&
        overlap(ex) > 0 &&
        equipmentSatisfied(ex, equipment),
    )
    .sort((a, b) => {
      const diff = overlap(b) - overlap(a);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, count);
}
