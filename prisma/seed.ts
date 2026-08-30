// Prisma seed script for Credo.
// Run with: npx tsx prisma/seed.ts
//
// Idempotent: exercises are upserted by their stable slug id; strength
// standards are upserted by the (exercise, sex, ageBracket, experienceLevel)
// compound unique key.

import { PrismaClient } from "@prisma/client";
import { EXERCISE_LIBRARY } from "../src/services/data/exercise-library";
import { STRENGTH_STANDARDS } from "../src/services/data/strength-standards";

const prisma = new PrismaClient();

async function seedExercises(): Promise<number> {
  let count = 0;
  for (const exercise of EXERCISE_LIBRARY) {
    const data = {
      name: exercise.name,
      primaryMuscles: exercise.primaryMuscles as string[],
      secondaryMuscles: exercise.secondaryMuscles as string[],
      equipment: exercise.equipment as string[],
      movementPattern: exercise.movementPattern,
      difficulty: exercise.difficulty,
      videoUrl: exercise.videoUrl ?? null,
      thumbnailUrl: exercise.thumbnailUrl ?? null,
      formCues: exercise.formCues,
      commonMistakes: exercise.commonMistakes,
      alternatives: exercise.alternatives,
    };
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      create: { id: exercise.id, ...data },
      update: data,
    });
    count++;
  }
  return count;
}

async function seedStrengthStandards(): Promise<number> {
  let count = 0;
  for (const standard of STRENGTH_STANDARDS) {
    const key = {
      exercise: standard.exercise,
      sex: standard.sex,
      ageBracket: standard.ageBracket,
      experienceLevel: standard.experienceLevel,
    };
    const percentiles = {
      p10: standard.percentiles.p10,
      p25: standard.percentiles.p25,
      p50: standard.percentiles.p50,
      p75: standard.percentiles.p75,
      p90: standard.percentiles.p90,
      p95: standard.percentiles.p95,
    };
    await prisma.strengthStandard.upsert({
      where: {
        exercise_sex_ageBracket_experienceLevel: key,
      },
      create: { ...key, ...percentiles },
      update: percentiles,
    });
    count++;
  }
  return count;
}

async function main(): Promise<void> {
  const exerciseCount = await seedExercises();
  console.log(`Seeded ${exerciseCount} exercises.`);

  const standardCount = await seedStrengthStandards();
  console.log(`Seeded ${standardCount} strength standard rows.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
