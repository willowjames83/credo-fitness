import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { exercises, findExercise } from "./data/exercise-library.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveUserId(userEmailParam?: string): Promise<string> {
  const email = userEmailParam || process.env.CREDO_USER_EMAIL;
  if (!email) {
    throw new Error(
      "No user email provided. Set CREDO_USER_EMAIL env var or pass user_email parameter."
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`No user found with email: ${email}`);
  }
  return user.id;
}

function epley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "credo-fitness",
  version: "1.0.0",
});

// 1. get_user_profile
server.tool(
  "get_user_profile",
  "Get the user's fitness profile including name, age, sex, weight, experience level, and training goal.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
  },
  async ({ user_email }) => {
    try {
      const userId = await resolveUserId(user_email);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          sex: true,
          weight: true,
          experienceLevel: true,
          trainingGoal: true,
          createdAt: true,
        },
      });
      return jsonResult(user);
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 2. update_user_profile
server.tool(
  "update_user_profile",
  "Update the user's fitness profile. You can update any combination of fields: name, age, sex, weight (lbs), experienceLevel (beginner/intermediate/advanced), and trainingGoal.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    name: z.string().optional().describe("User's display name"),
    age: z.number().optional().describe("User's age in years"),
    sex: z.string().optional().describe("User's sex (male/female)"),
    weight: z.number().optional().describe("User's body weight in lbs"),
    experienceLevel: z.string().optional().describe("Training experience: beginner, intermediate, or advanced"),
    trainingGoal: z.string().optional().describe("Primary training goal (e.g., strength, hypertrophy, general_fitness)"),
  },
  async ({ user_email, name, age, sex, weight, experienceLevel, trainingGoal }) => {
    try {
      const userId = await resolveUserId(user_email);
      const data: Record<string, unknown> = {};
      if (name !== undefined) data.name = name;
      if (age !== undefined) data.age = age;
      if (sex !== undefined) data.sex = sex;
      if (weight !== undefined) data.weight = weight;
      if (experienceLevel !== undefined) data.experienceLevel = experienceLevel;
      if (trainingGoal !== undefined) data.trainingGoal = trainingGoal;

      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          sex: true,
          weight: true,
          experienceLevel: true,
          trainingGoal: true,
        },
      });
      return jsonResult(user);
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 3. get_workout_history
server.tool(
  "get_workout_history",
  "Get the user's completed workout history, ordered by most recent first. Each workout includes date, day label (e.g., 'Push A'), program template, duration, exercises performed with sets/reps/weight, and total volume.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    limit: z.number().optional().describe("Number of workouts to return (default 10)"),
    offset: z.number().optional().describe("Number of workouts to skip (default 0)"),
  },
  async ({ user_email, limit, offset }) => {
    try {
      const userId = await resolveUserId(user_email);
      const workouts = await prisma.workout.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: limit ?? 10,
        skip: offset ?? 0,
      });

      const total = await prisma.workout.count({ where: { userId } });

      return jsonResult({
        workouts: workouts.map((w) => ({
          id: w.id,
          date: w.date,
          dayLabel: w.dayLabel,
          programTemplate: w.programTemplate,
          durationSeconds: w.durationSeconds,
          exercises: w.exercises,
          totalVolume: w.totalVolume,
        })),
        total,
        limit: limit ?? 10,
        offset: offset ?? 0,
      });
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 4. log_workout
server.tool(
  "log_workout",
  "Log a completed workout session. Provide the date, day label (e.g., 'Push A'), exercises performed as a JSON array (each with exerciseId, sets with weight/reps), and optionally total volume and duration. If exercises include an estimated1RM, those will be saved automatically.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    date: z.string().describe("Workout date in ISO format (e.g., 2024-01-15)"),
    dayLabel: z.string().describe("Day label such as 'Push A', 'Pull B', 'Legs'"),
    programTemplate: z.string().optional().describe("Program template name (e.g., 'PPL', 'Upper_Lower')"),
    durationSeconds: z.number().optional().describe("Workout duration in seconds"),
    exercises: z.string().describe("JSON array of exercises performed. Each should have exerciseId, sets (array of {weight, reps}), and optionally estimated1RM."),
    totalVolume: z.number().optional().describe("Total workout volume in lbs (sum of weight x reps across all sets)"),
  },
  async ({ user_email, date, dayLabel, programTemplate, durationSeconds, exercises: exercisesJson, totalVolume }) => {
    try {
      const userId = await resolveUserId(user_email);
      let exercisesData: unknown;
      try {
        exercisesData = JSON.parse(exercisesJson);
      } catch {
        return errorResult("Invalid JSON in exercises parameter");
      }

      const workout = await prisma.workout.create({
        data: {
          userId,
          date: new Date(date),
          dayLabel,
          programTemplate,
          durationSeconds,
          exercises: exercisesData as object,
          totalVolume,
        },
      });

      // Upsert 1RMs from exercise data
      if (Array.isArray(exercisesData)) {
        for (const ex of exercisesData) {
          if (ex.estimated1RM && ex.exerciseId) {
            await prisma.exercise1RM.upsert({
              where: {
                userId_exerciseId: { userId, exerciseId: ex.exerciseId },
              },
              update: { weight: ex.estimated1RM, date: new Date() },
              create: { userId, exerciseId: ex.exerciseId, weight: ex.estimated1RM },
            });
          }
        }
      }

      return jsonResult({ success: true, workout });
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 5. get_exercise_1rms
server.tool(
  "get_exercise_1rms",
  "Get estimated one-rep max (1RM) values for exercises. 1RM is the maximum weight a person can lift for one repetition, estimated from working sets using the Epley formula. Returns all exercises with stored 1RMs, or a specific exercise if exerciseId is provided.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    exerciseId: z.string().optional().describe("Specific exercise ID to look up (e.g., 'bench_press'). Omit to get all."),
  },
  async ({ user_email, exerciseId }) => {
    try {
      const userId = await resolveUserId(user_email);
      const where: { userId: string; exerciseId?: string } = { userId };
      if (exerciseId) where.exerciseId = exerciseId;

      const records = await prisma.exercise1RM.findMany({ where });

      const result = records.map((r) => {
        const exercise = findExercise(r.exerciseId);
        return {
          exerciseId: r.exerciseId,
          exerciseName: exercise?.name ?? r.exerciseId,
          estimated1RM: r.weight,
          date: r.date,
        };
      });

      return jsonResult(result);
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 6. log_benchmark
server.tool(
  "log_benchmark",
  "Log a benchmark test result for an exercise. Provide the exerciseId, weight in lbs, and number of reps completed. The 1RM will be automatically calculated using the Epley formula (weight x (1 + reps/30)). This updates the stored 1RM for that exercise.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    exerciseId: z.string().describe("Exercise ID (e.g., 'bench_press', 'back_squat')"),
    weight: z.number().describe("Weight lifted in lbs"),
    reps: z.number().describe("Number of reps completed at that weight"),
  },
  async ({ user_email, exerciseId, weight, reps }) => {
    try {
      const userId = await resolveUserId(user_email);
      const estimated1RM = epley(weight, reps);

      const record = await prisma.exercise1RM.upsert({
        where: {
          userId_exerciseId: { userId, exerciseId },
        },
        update: { weight: estimated1RM, date: new Date() },
        create: { userId, exerciseId, weight: estimated1RM },
      });

      const exercise = findExercise(exerciseId);
      return jsonResult({
        exerciseId,
        exerciseName: exercise?.name ?? exerciseId,
        weight,
        reps,
        estimated1RM,
        formula: `${weight} x (1 + ${reps}/30) = ${estimated1RM}`,
        record,
      });
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 7. get_personal_records
server.tool(
  "get_personal_records",
  "Get the user's personal record (PR) history. Each PR shows the exercise, previous 1RM, new 1RM, the set that triggered it (weight and reps), and the date. Optionally filter by exerciseId.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    exerciseId: z.string().optional().describe("Filter PRs for a specific exercise ID"),
  },
  async ({ user_email, exerciseId }) => {
    try {
      const userId = await resolveUserId(user_email);
      const where: { userId: string; exerciseId?: string } = { userId };
      if (exerciseId) where.exerciseId = exerciseId;

      const records = await prisma.personalRecord.findMany({
        where,
        orderBy: { date: "desc" },
      });

      const result = records.map((r) => {
        const exercise = findExercise(r.exerciseId);
        return {
          id: r.id,
          exerciseId: r.exerciseId,
          exerciseName: exercise?.name ?? r.exerciseId,
          previous1RM: r.previous1RM,
          new1RM: r.new1RM,
          setWeight: r.setWeight,
          setReps: r.setReps,
          date: r.date,
        };
      });

      return jsonResult(result);
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 8. get_score_history
server.tool(
  "get_score_history",
  "Get weekly Credo score snapshots over time. Each snapshot includes the overall credoScore plus sub-scores: strength, stability, cardio, and nutrition. Useful for tracking fitness progress week over week.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    weeks: z.number().optional().describe("Number of recent weeks to return (default 12)"),
  },
  async ({ user_email, weeks }) => {
    try {
      const userId = await resolveUserId(user_email);
      const snapshots = await prisma.scoreSnapshot.findMany({
        where: { userId },
        orderBy: { weekNumber: "desc" },
        take: weeks ?? 12,
      });

      return jsonResult(snapshots.reverse());
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 9. get_current_scores
server.tool(
  "get_current_scores",
  "Get the user's current (most recent) Credo scores. Returns the latest weekly snapshot with credoScore, strengthScore, stabilityScore, cardioScore, and nutritionScore.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
  },
  async ({ user_email }) => {
    try {
      const userId = await resolveUserId(user_email);
      const latest = await prisma.scoreSnapshot.findFirst({
        where: { userId },
        orderBy: { weekNumber: "desc" },
      });

      if (!latest) {
        return jsonResult({ message: "No score snapshots found for this user." });
      }
      return jsonResult(latest);
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 10. get_program
server.tool(
  "get_program",
  "Get the user's current training program configuration including the program template (e.g., PPL, Upper_Lower), days per week, current week number, and current day index.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
  },
  async ({ user_email }) => {
    try {
      const userId = await resolveUserId(user_email);
      const program = await prisma.userProgram.findUnique({
        where: { userId },
      });

      if (!program) {
        return jsonResult({ message: "No program configured for this user." });
      }
      return jsonResult(program);
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 11. update_program
server.tool(
  "update_program",
  "Update the user's training program. You can change the program template, days per week, current week, or current day index. Creates a program if none exists.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    programTemplate: z.string().optional().describe("Program template name (e.g., 'PPL', 'Upper_Lower')"),
    daysPerWeek: z.number().optional().describe("Training days per week (e.g., 3, 4, 5, 6)"),
    currentWeek: z.number().optional().describe("Current week number in the program"),
    currentDayIndex: z.number().optional().describe("Current day index within the week (0-based)"),
  },
  async ({ user_email, programTemplate, daysPerWeek, currentWeek, currentDayIndex }) => {
    try {
      const userId = await resolveUserId(user_email);

      const existing = await prisma.userProgram.findUnique({ where: { userId } });

      if (existing) {
        const data: Record<string, unknown> = {};
        if (programTemplate !== undefined) data.programTemplate = programTemplate;
        if (daysPerWeek !== undefined) data.daysPerWeek = daysPerWeek;
        if (currentWeek !== undefined) data.currentWeek = currentWeek;
        if (currentDayIndex !== undefined) data.currentDayIndex = currentDayIndex;

        const program = await prisma.userProgram.update({
          where: { userId },
          data,
        });
        return jsonResult(program);
      } else {
        if (!programTemplate || !daysPerWeek) {
          return errorResult(
            "No existing program found. Please provide both programTemplate and daysPerWeek to create one."
          );
        }
        const program = await prisma.userProgram.create({
          data: {
            userId,
            programTemplate,
            daysPerWeek,
            currentWeek: currentWeek ?? 1,
            currentDayIndex: currentDayIndex ?? 0,
          },
        });
        return jsonResult(program);
      }
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 12. sync_data
server.tool(
  "sync_data",
  "Bidirectional data sync for the Credo app. Receives workouts, exercise1RMs, personalRecords, scoreSnapshots, and userProgram from the client, upserts everything into the database, and returns the complete server state. This is the same sync logic used by the iOS app.",
  {
    user_email: z.string().optional().describe("User email. Defaults to CREDO_USER_EMAIL env var."),
    workouts: z
      .string()
      .optional()
      .describe("JSON array of workouts to sync. Each: {date, dayLabel, programTemplate?, durationSeconds?, exercises, totalVolume?}"),
    exercise1RMs: z
      .string()
      .optional()
      .describe('JSON object mapping exerciseId to 1RM weight (e.g., {"bench_press": 225})'),
    personalRecords: z
      .string()
      .optional()
      .describe("JSON array of personal records. Each: {exerciseId, previous1RM?, new1RM, setWeight, setReps, date?}"),
    scoreSnapshots: z
      .string()
      .optional()
      .describe("JSON array of score snapshots. Each: {weekNumber, credoScore, strengthScore, stabilityScore, cardioScore, nutritionScore}"),
    userProgram: z
      .string()
      .optional()
      .describe("JSON object for program config: {programTemplate, daysPerWeek, currentWeek?, currentDayIndex?}"),
  },
  async ({ user_email, workouts, exercise1RMs, personalRecords, scoreSnapshots, userProgram }) => {
    try {
      const userId = await resolveUserId(user_email);

      // Parse inputs
      const parsedWorkouts = workouts ? JSON.parse(workouts) : [];
      const parsedExercise1RMs = exercise1RMs ? JSON.parse(exercise1RMs) : null;
      const parsedPersonalRecords = personalRecords ? JSON.parse(personalRecords) : [];
      const parsedScoreSnapshots = scoreSnapshots ? JSON.parse(scoreSnapshots) : [];
      const parsedUserProgram = userProgram ? JSON.parse(userProgram) : null;

      // Sync workouts (upsert by userId + date + dayLabel)
      if (Array.isArray(parsedWorkouts) && parsedWorkouts.length > 0) {
        for (const w of parsedWorkouts) {
          const workoutDate = new Date(w.date);
          const existing = await prisma.workout.findFirst({
            where: { userId, date: workoutDate, dayLabel: w.dayLabel },
          });

          if (existing) {
            await prisma.workout.update({
              where: { id: existing.id },
              data: {
                programTemplate: w.programTemplate,
                durationSeconds: w.durationSeconds,
                exercises: w.exercises,
                totalVolume: w.totalVolume,
              },
            });
          } else {
            await prisma.workout.create({
              data: {
                userId,
                date: workoutDate,
                dayLabel: w.dayLabel,
                programTemplate: w.programTemplate,
                durationSeconds: w.durationSeconds,
                exercises: w.exercises,
                totalVolume: w.totalVolume,
              },
            });
          }
        }
      }

      // Sync exercise 1RMs (upsert by userId + exerciseId)
      if (parsedExercise1RMs && typeof parsedExercise1RMs === "object") {
        for (const [exerciseId, weight] of Object.entries(parsedExercise1RMs)) {
          await prisma.exercise1RM.upsert({
            where: { userId_exerciseId: { userId, exerciseId } },
            update: { weight: weight as number, date: new Date() },
            create: { userId, exerciseId, weight: weight as number },
          });
        }
      }

      // Sync personal records (append new, deduplicate)
      if (Array.isArray(parsedPersonalRecords) && parsedPersonalRecords.length > 0) {
        for (const pr of parsedPersonalRecords) {
          const existing = await prisma.personalRecord.findFirst({
            where: { userId, exerciseId: pr.exerciseId, new1RM: pr.new1RM },
          });

          if (!existing) {
            await prisma.personalRecord.create({
              data: {
                userId,
                exerciseId: pr.exerciseId,
                previous1RM: pr.previous1RM,
                new1RM: pr.new1RM,
                setWeight: pr.setWeight,
                setReps: pr.setReps,
                date: pr.date ? new Date(pr.date) : new Date(),
              },
            });
          }
        }
      }

      // Sync score snapshots (upsert by userId + weekNumber)
      if (Array.isArray(parsedScoreSnapshots) && parsedScoreSnapshots.length > 0) {
        for (const ss of parsedScoreSnapshots) {
          await prisma.scoreSnapshot.upsert({
            where: { userId_weekNumber: { userId, weekNumber: ss.weekNumber } },
            update: {
              credoScore: ss.credoScore,
              strengthScore: ss.strengthScore,
              stabilityScore: ss.stabilityScore,
              cardioScore: ss.cardioScore,
              nutritionScore: ss.nutritionScore,
            },
            create: {
              userId,
              weekNumber: ss.weekNumber,
              credoScore: ss.credoScore,
              strengthScore: ss.strengthScore,
              stabilityScore: ss.stabilityScore,
              cardioScore: ss.cardioScore,
              nutritionScore: ss.nutritionScore,
            },
          });
        }
      }

      // Sync user program (upsert)
      if (parsedUserProgram) {
        await prisma.userProgram.upsert({
          where: { userId },
          update: {
            programTemplate: parsedUserProgram.programTemplate,
            daysPerWeek: parsedUserProgram.daysPerWeek,
            currentWeek: parsedUserProgram.currentWeek ?? 1,
            currentDayIndex: parsedUserProgram.currentDayIndex ?? 0,
          },
          create: {
            userId,
            programTemplate: parsedUserProgram.programTemplate,
            daysPerWeek: parsedUserProgram.daysPerWeek,
            currentWeek: parsedUserProgram.currentWeek ?? 1,
            currentDayIndex: parsedUserProgram.currentDayIndex ?? 0,
          },
        });
      }

      // Return complete server state
      const [
        serverWorkouts,
        serverExercise1RMs,
        serverPersonalRecords,
        serverScoreSnapshots,
        serverUserProgram,
      ] = await Promise.all([
        prisma.workout.findMany({ where: { userId }, orderBy: { date: "desc" } }),
        prisma.exercise1RM.findMany({ where: { userId } }),
        prisma.personalRecord.findMany({ where: { userId }, orderBy: { date: "desc" } }),
        prisma.scoreSnapshot.findMany({ where: { userId }, orderBy: { weekNumber: "asc" } }),
        prisma.userProgram.findUnique({ where: { userId } }),
      ]);

      const exercise1RMsMap: Record<string, number> = {};
      for (const rm of serverExercise1RMs) {
        exercise1RMsMap[rm.exerciseId] = rm.weight;
      }

      return jsonResult({
        workouts: serverWorkouts,
        exercise1RMs: exercise1RMsMap,
        personalRecords: serverPersonalRecords,
        scoreSnapshots: serverScoreSnapshots,
        userProgram: serverUserProgram,
      });
    } catch (e: unknown) {
      return errorResult((e as Error).message);
    }
  }
);

// 13. search_exercises
server.tool(
  "search_exercises",
  "Search the Credo exercise library. Filter by name (fuzzy text search), muscle group (e.g., chest, back, quads), movement pattern (push, pull, squat, hinge, isolation, core, carry), or equipment (barbell, dumbbell, cable, machine, pull_up_bar, bench, rack). Returns full exercise metadata including form cues, default sets/reps, and difficulty.",
  {
    query: z.string().optional().describe("Text search on exercise name (case-insensitive, partial match)"),
    muscleGroup: z.string().optional().describe("Filter by muscle group (e.g., chest, back, quads, hamstrings, shoulders, biceps, triceps, core, glutes, calves, forearms, traps)"),
    movementPattern: z.string().optional().describe("Filter by movement pattern: push, pull, squat, hinge, isolation, core, carry"),
    equipment: z.string().optional().describe("Filter by equipment: barbell, dumbbell, cable, machine, pull_up_bar, bench, rack"),
  },
  async ({ query, muscleGroup, movementPattern, equipment }) => {
    let results = [...exercises];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter((e) => e.name.toLowerCase().includes(q));
    }

    if (muscleGroup) {
      const mg = muscleGroup.toLowerCase();
      results = results.filter(
        (e) =>
          e.primaryMuscles.some((m) => m.toLowerCase() === mg) ||
          e.secondaryMuscles.some((m) => m.toLowerCase() === mg)
      );
    }

    if (movementPattern) {
      const mp = movementPattern.toLowerCase();
      results = results.filter((e) => e.movementPattern.toLowerCase() === mp);
    }

    if (equipment) {
      const eq = equipment.toLowerCase();
      results = results.filter((e) =>
        e.equipment.some((item) => item.toLowerCase() === eq)
      );
    }

    return jsonResult({
      count: results.length,
      exercises: results,
    });
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
