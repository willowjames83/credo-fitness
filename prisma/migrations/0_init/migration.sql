-- Baseline migration for the Credo schema, generated offline (no live DB in
-- this environment) via:
--   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
-- This is the initial migration: applying it to a fresh Postgres database
-- via `prisma migrate deploy` creates every table, index, and foreign key
-- matching prisma/schema.prisma as of the commit that added this file.
-- Regenerate/append future migrations with `prisma migrate dev` once a real
-- DATABASE_URL is available — do not hand-edit this file afterward.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "sex" TEXT,
    "weight" INTEGER,
    "heightIn" INTEGER,
    "experienceLevel" TEXT,
    "trainingGoal" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "proteinTargetG" INTEGER,
    "zone2TargetMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "programTemplate" TEXT,
    "durationSeconds" INTEGER,
    "exercises" JSONB NOT NULL,
    "totalVolume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise1RM" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise1RM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "previous1RM" DOUBLE PRECISION,
    "new1RM" DOUBLE PRECISION NOT NULL,
    "setWeight" DOUBLE PRECISION NOT NULL,
    "setReps" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "credoScore" INTEGER NOT NULL,
    "strengthScore" INTEGER NOT NULL,
    "stabilityScore" INTEGER NOT NULL,
    "cardioScore" INTEGER NOT NULL,
    "nutritionScore" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programTemplate" TEXT NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "currentDayIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT 'longevity',
    "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
    "sessionDuration" INTEGER NOT NULL DEFAULT 60,
    "preferredSplit" TEXT NOT NULL DEFAULT 'ai_optimized',
    "trainingLocation" TEXT NOT NULL DEFAULT 'commercial_gym',
    "availableEquipment" TEXT[],
    "muscleGroupFocus" TEXT[],
    "muscleGroupExclude" TEXT[],
    "enableSupersets" BOOLEAN NOT NULL DEFAULT true,
    "varietyLevel" TEXT NOT NULL DEFAULT 'medium',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "equipment" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GymProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryMuscles" TEXT[],
    "secondaryMuscles" TEXT[],
    "equipment" TEXT[],
    "movementPattern" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "formCues" TEXT[],
    "commonMistakes" TEXT[],
    "alternatives" TEXT[],

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "workoutPlanId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimated1RM" DOUBLE PRECISION,
    "exertionRating" INTEGER,
    "notes" TEXT,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedSet" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "rpe" INTEGER,
    "restDuration" INTEGER,

    CONSTRAINT "CompletedSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "splitType" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "includesWarmup" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "scheduledDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedExercise" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetRepMin" INTEGER NOT NULL,
    "targetRepMax" INTEGER NOT NULL,
    "recommendedWeight" DOUBLE PRECISION NOT NULL,
    "restPeriod" INTEGER NOT NULL,
    "isSuperset" BOOLEAN NOT NULL DEFAULT false,
    "supersetWith" TEXT,
    "rationale" TEXT,
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlannedExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscleRecovery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "lastTrainedDate" TIMESTAMP(3) NOT NULL,
    "volumeLastSession" INTEGER NOT NULL,
    "estimatedRecoveryDate" TIMESTAMP(3) NOT NULL,
    "fatigueLevel" TEXT NOT NULL DEFAULT 'fresh',

    CONSTRAINT "MuscleRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthScoreRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "percentile" INTEGER NOT NULL,
    "demographicContext" TEXT NOT NULL,
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "trendDelta" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrengthScoreRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthSubscoreRecord" (
    "id" TEXT NOT NULL,
    "scoreRecordId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "keyLift" TEXT NOT NULL,
    "estimated1RM" DOUBLE PRECISION NOT NULL,
    "relativeStrength" DOUBLE PRECISION NOT NULL,
    "percentile" INTEGER NOT NULL,

    CONSTRAINT "StrengthSubscoreRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthStandard" (
    "id" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "ageBracket" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "p10" DOUBLE PRECISION NOT NULL,
    "p25" DOUBLE PRECISION NOT NULL,
    "p50" DOUBLE PRECISION NOT NULL,
    "p75" DOUBLE PRECISION NOT NULL,
    "p90" DOUBLE PRECISION NOT NULL,
    "p95" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StrengthStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "benchmarkName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "percentile" INTEGER,
    "pillar" TEXT NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenchmarkResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Coach',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "CoachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSplit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "days" JSONB NOT NULL,
    "isShareable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedWorkout" (
    "id" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProteinEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grams" INTEGER NOT NULL,
    "calories" INTEGER,
    "label" TEXT,
    "mealType" TEXT,

    CONSTRAINT "ProteinEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardioSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "avgHr" INTEGER,
    "maxHr" INTEGER,
    "distanceM" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,

    CONSTRAINT "CardioSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StabilitySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "StabilitySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workout_userId_date_idx" ON "Workout"("userId", "date");

-- CreateIndex
CREATE INDEX "Exercise1RM_userId_idx" ON "Exercise1RM"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise1RM_userId_exerciseId_key" ON "Exercise1RM"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_exerciseId_idx" ON "PersonalRecord"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_userId_idx" ON "ScoreSnapshot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreSnapshot_userId_weekNumber_key" ON "ScoreSnapshot"("userId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgram_userId_key" ON "UserProgram"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPreferences_userId_key" ON "TrainingPreferences"("userId");

-- CreateIndex
CREATE INDEX "GymProfile_userId_idx" ON "GymProfile"("userId");

-- CreateIndex
CREATE INDEX "ExerciseLog_userId_exerciseId_date_idx" ON "ExerciseLog"("userId", "exerciseId", "date");

-- CreateIndex
CREATE INDEX "ExerciseLog_userId_date_idx" ON "ExerciseLog"("userId", "date");

-- CreateIndex
CREATE INDEX "CompletedSet_exerciseLogId_idx" ON "CompletedSet"("exerciseLogId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_status_idx" ON "WorkoutPlan"("userId", "status");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_scheduledDate_idx" ON "WorkoutPlan"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "PlannedExercise_workoutPlanId_idx" ON "PlannedExercise"("workoutPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleRecovery_userId_muscleGroup_key" ON "MuscleRecovery"("userId", "muscleGroup");

-- CreateIndex
CREATE INDEX "StrengthScoreRecord_userId_calculatedAt_idx" ON "StrengthScoreRecord"("userId", "calculatedAt");

-- CreateIndex
CREATE INDEX "StrengthSubscoreRecord_scoreRecordId_idx" ON "StrengthSubscoreRecord"("scoreRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "StrengthStandard_exercise_sex_ageBracket_experienceLevel_key" ON "StrengthStandard"("exercise", "sex", "ageBracket", "experienceLevel");

-- CreateIndex
CREATE INDEX "BenchmarkResult_userId_benchmarkName_testedAt_idx" ON "BenchmarkResult"("userId", "benchmarkName", "testedAt");

-- CreateIndex
CREATE INDEX "CoachThread_userId_updatedAt_idx" ON "CoachThread"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "CoachMessage_threadId_createdAt_idx" ON "CoachMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkoutSplit_userId_idx" ON "WorkoutSplit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedWorkout_shareCode_key" ON "SharedWorkout"("shareCode");

-- CreateIndex
CREATE INDEX "ProteinEntry_userId_date_idx" ON "ProteinEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "CardioSession_userId_date_idx" ON "CardioSession"("userId", "date");

-- CreateIndex
CREATE INDEX "StabilitySession_userId_date_idx" ON "StabilitySession"("userId", "date");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise1RM" ADD CONSTRAINT "Exercise1RM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPreferences" ADD CONSTRAINT "TrainingPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymProfile" ADD CONSTRAINT "GymProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedSet" ADD CONSTRAINT "CompletedSet_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedExercise" ADD CONSTRAINT "PlannedExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedExercise" ADD CONSTRAINT "PlannedExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscleRecovery" ADD CONSTRAINT "MuscleRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrengthScoreRecord" ADD CONSTRAINT "StrengthScoreRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrengthSubscoreRecord" ADD CONSTRAINT "StrengthSubscoreRecord_scoreRecordId_fkey" FOREIGN KEY ("scoreRecordId") REFERENCES "StrengthScoreRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkResult" ADD CONSTRAINT "BenchmarkResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachThread" ADD CONSTRAINT "CoachThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachMessage" ADD CONSTRAINT "CoachMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CoachThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSplit" ADD CONSTRAINT "WorkoutSplit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWorkout" ADD CONSTRAINT "SharedWorkout_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProteinEntry" ADD CONSTRAINT "ProteinEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardioSession" ADD CONSTRAINT "CardioSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StabilitySession" ADD CONSTRAINT "StabilitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

