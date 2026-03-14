# PRD: Adaptive Training Engine for Credo

**Version:** 1.0
**Date:** March 14, 2026
**Author:** James (Willow Education / Credo)
**Audience:** Claude Code (implementation spec)

---

## 1. Context and Goal

Credo is a longevity-focused fitness app built around four pillars (strength, stability, cardio, nutrition) unified by a composite Credo Score. The app currently runs on mock data with no backend, AI, or user accounts.

Gravl.ai is a $440K/month AI personal trainer that has nailed adaptive strength training. Their core advantages: an algorithm that generates and adjusts workouts in real time based on performance history, a gamified Strength Score with demographic percentile comparisons, 300+ exercise videos, custom gym profiles, coach messaging, and Apple Watch integration.

**The goal:** Build a strength training experience as good as Gravl's inside Credo, then extend the adaptive AI pattern across all four pillars. This PRD covers the full scope. Phase 1 focuses on strength.

---

## 2. Current Credo Architecture

### Tech Stack
- **Web:** Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4, Framer Motion, Shadcn UI
- **iOS:** SwiftUI (iOS 17.0+), Swift 6.0, XcodeGen
- **Deployment:** Vercel (web)
- **Backend:** None (all mock data in `/src/data/`)

### Existing Data Models

```typescript
// User
{ name, initials, age, sex, weight, experienceLevel, proteinTarget, zone2Target, currentWeek }

// Scores
{ credo: { score, delta }, strength: { score, metrics[] }, stability, cardio, nutrition }
// Weights: strength 0.3, cardio 0.3, stability 0.2, nutrition 0.2

// Workout
interface WorkoutSet { set: number; weight: number; reps: number | null; completed: boolean }
interface Exercise { name: string; muscleGroup: string; sets: WorkoutSet[]; previousSession?: string }
// Active workout: name, week, day, totalDays, elapsedTime, restTimer, activeExercise, upcomingExercises

// Benchmarks (The Credo Ten)
interface Benchmark { name, value, unit, percentile, delta, pillar, lastTested, isInversed? }
// 10 tests: Hex Bar Deadlift, Back Squat, Bench Press, Pull-Ups, Push-Ups, Dead Hang, Farmer Carry, Plank, 1000m Row, Norwegian 4x4

// Nutrition
{ today: { current, target }, weekly: DayProtein[], savedMeals: Meal[] }

// Cardio
{ zone2: { current, target }, vo2max: number }
```

### Existing Pages
1. **Dashboard** — Credo Score ring, 4 pillar cards, today's workout card
2. **Workout** — Active exercise with set/rep/weight logging, rest timer, upcoming queue
3. **Credo Ten** — 10 benchmark tests with percentile bars
4. **Protein** — Daily tracking with quick-add and saved meals
5. **Profile** — Settings, integrations (Apple Health, Peloton, Strava, MCP Server)

### Design Tokens (preserve these)
- Accent: `#E8501A`, Teal: `#1A7A6D`, Cardio: `#2563EB`, Nutrition: `#7C3AED`
- Score tiers: Starting (0-20), Building (21-40), Progressing (41-60), Thriving (61-80), Credo-proof (81+)

---

## 3. Features to Build

### 3.1 Adaptive AI Workout Engine (Gravl Parity)

**What it does:** Generates personalized workout plans and adjusts weight, reps, volume, and exercise selection each session based on the user's performance history, recovery status, goals, and available equipment.

**Gravl's approach (replicate this logic):**
- Takes user attributes (age, sex, weight, experience level) as baseline inputs
- Every logged set feeds the progression algorithm
- Tracks estimated 1RM per exercise using logged weight x reps
- Adjusts recommended weights based on: performance trend, exertion rating, exercise position in workout
- Detects fatigue (declining reps at same weight) and auto-reduces load
- Implements progressive overload (incrementally increases weight/volume when user is progressing)
- If user skips muscle groups mid-workout, compensates in subsequent sessions
- Targets each muscle group ~2x per week based on recovery science

**Data model additions:**

```typescript
// New: Exercise Library
interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  movementPattern: "push" | "pull" | "hinge" | "squat" | "carry" | "core" | "isolation";
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string;
  thumbnailUrl?: string;
  formCues: string[];
}

type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "quads" | "hamstrings" | "glutes" | "calves" | "core" | "forearms" | "traps";
type Equipment = "barbell" | "dumbbell" | "kettlebell" | "cable" | "machine" | "bodyweight" | "bands" | "pull_up_bar" | "bench" | "rack";

// New: User Exercise History (feeds the AI)
interface ExerciseLog {
  id: string;
  exerciseId: string;
  date: string; // ISO
  sets: CompletedSet[];
  estimated1RM: number; // calculated after each session
  exertionRating?: 1 | 2 | 3 | 4 | 5; // RPE-style, post-exercise
  notes?: string;
}

interface CompletedSet {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number; // rate of perceived exertion, 1-10
  restDuration?: number; // seconds
}

// New: Muscle Recovery Tracker
interface MuscleRecoveryState {
  muscleGroup: MuscleGroup;
  lastTrainedDate: string;
  volumeLastSession: number; // total sets
  estimatedRecoveryDate: string; // based on volume + experience level
  fatigueLevel: "fresh" | "recovering" | "fatigued";
}

// New: Workout Plan (AI-generated)
interface WorkoutPlan {
  id: string;
  userId: string;
  createdAt: string;
  weekNumber: number;
  dayNumber: number;
  totalDays: number;
  splitType: string; // e.g., "Upper/Lower", "Push/Pull/Legs", custom
  focus: string; // e.g., "Lower Body + Hinge"
  exercises: PlannedExercise[];
  estimatedDuration: number; // minutes
  includesWarmup: boolean;
}

interface PlannedExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: [number, number]; // [min, max] e.g., [6, 8]
  recommendedWeight: number; // AI-calculated from history
  restPeriod: number; // seconds
  isSuperset?: boolean;
  supersetWith?: string; // exerciseId
  rationale?: string; // why AI chose this weight/rep scheme
}

// New: User Training Preferences
interface TrainingPreferences {
  goal: "build_muscle" | "increase_strength" | "get_lean" | "general_fitness" | "longevity";
  daysPerWeek: number; // 2-6
  sessionDuration: number; // minutes, 30-90
  preferredSplit: string | "ai_optimized";
  availableEquipment: Equipment[];
  trainingLocation: "home" | "commercial_gym" | "outdoor" | "mixed";
  muscleGroupFocus?: MuscleGroup[]; // up to 2
  muscleGroupExclude?: MuscleGroup[];
  enableSupersets: boolean;
  varietyLevel: "low" | "medium" | "high"; // how much exercise rotation
}
```

**Algorithm spec (for implementation):**

```
WORKOUT GENERATION ALGORITHM
=============================

Input: UserProfile, TrainingPreferences, ExerciseHistory[], MuscleRecoveryState[], ExerciseLibrary

Step 1: DETERMINE SPLIT
- Use preferredSplit if set, otherwise calculate optimal split from daysPerWeek
- 2 days → Full Body
- 3 days → Push/Pull/Legs or Full Body
- 4 days → Upper/Lower
- 5-6 days → Push/Pull/Legs or custom

Step 2: SELECT MUSCLE GROUPS FOR TODAY
- Query MuscleRecoveryState for all muscle groups
- Filter to groups where fatigueLevel != "fatigued"
- Prioritize groups not trained in last 48-72 hours
- If user skipped groups in recent sessions, boost their priority
- Target each group ~2x per week

Step 3: SELECT EXERCISES
- For each target muscle group, pull from ExerciseLibrary
- Filter by: availableEquipment, difficulty <= experienceLevel
- Prioritize compound movements first, then isolation
- Apply varietyLevel: low = same exercises weekly, high = rotate frequently
- Respect muscleGroupFocus (add extra volume) and muscleGroupExclude
- Total exercises = sessionDuration / 8 (rough estimate: 8 min per exercise)

Step 4: CALCULATE RECOMMENDED WEIGHTS
- For each exercise, look up user's ExerciseLog history
- If history exists:
  - Calculate estimated 1RM from best recent set: weight × (1 + reps/30) [Epley formula]
  - If goal = build_muscle: target 65-75% 1RM for 8-12 reps
  - If goal = increase_strength: target 80-90% 1RM for 3-6 reps
  - If goal = get_lean: target 55-65% 1RM for 12-15 reps
  - If goal = longevity: target 65-80% 1RM for 6-10 reps
  - Apply fatigue adjustment: if last session showed declining reps, reduce by 5%
  - Apply progression: if last 2 sessions hit all target reps, increase by 2.5-5%
- If no history: estimate from demographic data (age, sex, weight, experience)

Step 5: SET VOLUME
- Base sets per muscle group per session: 3-4 (beginner), 4-5 (intermediate), 5-6 (advanced)
- Adjust for: weekly frequency (more sessions = less volume per session), recovery state
- Compound exercises: 3-5 sets
- Isolation exercises: 2-4 sets

Step 6: REST PERIODS
- Compound heavy (>80% 1RM): 180-300 sec
- Compound moderate: 120-180 sec
- Isolation: 60-90 sec
- Supersets: 60 sec between pairs, 120 sec between rounds

Step 7: ASSEMBLE AND ORDER
- Order: Compound → Isolation → Core/Carry (if included)
- Within compounds: larger muscle groups first
- Add warmup sets for first 2 compound exercises (50%, 70% of working weight)
- Calculate estimatedDuration
```

**Autoregulation rules (apply during workout):**

```
REAL-TIME ADJUSTMENT RULES
===========================

After each completed set:
1. If reps < targetReps[0] by 2+: reduce next set weight by 5-10%
2. If reps > targetReps[1] by 2+: flag for weight increase next session
3. If user rates exertion >= 9/10 on RPE: reduce remaining volume by 1 set
4. If rest timer exceeds recommended by 2x: note fatigue, adjust expectations

After workout completion:
1. Update estimated 1RM for each exercise performed
2. Update MuscleRecoveryState for all trained groups
3. Recalculate Strength Score subscores
4. Feed data back into next workout generation
```

### 3.2 Strength Score System (Gravl Parity)

**What it does:** A single number (0-100) representing overall strength, calculated from 8 subscores, compared against demographic percentiles.

**Gravl's approach:**
- Uses estimated 1RM projections for key lifts
- Balances absolute strength (total weight) vs. relative strength (weight / bodyweight)
- Age-adjusted standards
- Body weight normalized
- Focuses on barbell/dumbbell lifts (not machines, too variable)
- Best lift from last 3 months keeps score current
- Compared against millions of data points by age, sex, bodyweight, experience

**Data model:**

```typescript
interface StrengthScore {
  overall: number; // 0-100
  subscores: StrengthSubscore[];
  percentile: number; // vs demographic cohort
  demographicContext: string; // e.g., "M, 40-44, 185 lb, Intermediate"
  lastUpdated: string;
  trend: "improving" | "stable" | "declining";
  trendDelta: number; // change over last 4 weeks
}

interface StrengthSubscore {
  category: string; // e.g., "Upper Push", "Upper Pull", "Lower Push", "Lower Pull", "Core", "Grip", "Carry", "Endurance"
  score: number;
  keyLift: string; // e.g., "Bench Press"
  estimated1RM: number;
  relativeStrength: number; // 1RM / bodyweight
  percentile: number;
}
```

**Calculation logic:**

```
STRENGTH SCORE CALCULATION
===========================

8 Subscores (each 0-100):
1. Upper Push: Best of (Bench Press, OHP) 1RM vs demographic standards
2. Upper Pull: Best of (Pull-Up weighted, Barbell Row) 1RM vs demographic standards
3. Lower Push: Best of (Back Squat, Front Squat) 1RM vs demographic standards
4. Lower Pull: Best of (Deadlift, Romanian Deadlift) 1RM vs demographic standards
5. Core: Best of (Plank hold, Hanging Leg Raise reps) vs standards
6. Grip: Best of (Dead Hang time, Farmer Carry distance) vs standards
7. Carry: Farmer Carry or Suitcase Carry weight × distance vs standards
8. Muscular Endurance: Push-Up reps, Pull-Up reps vs standards

Weighting:
- Upper Push: 15%
- Upper Pull: 15%
- Lower Push: 15%
- Lower Pull: 15%
- Core: 10%
- Grip: 10%
- Carry: 10%
- Muscular Endurance: 10%

For each subscore:
1. Take user's estimated 1RM (or test result)
2. Divide by bodyweight to get relative strength
3. Look up percentile in demographic table (age bracket, sex, experience)
4. Scale percentile to 0-100 score
5. Use best result from last 90 days

Overall = weighted sum of 8 subscores
Percentile = compare overall to demographic cohort distribution
```

**Demographic standards data:** Seed initial standards from published strength standards (e.g., Symmetric Strength, ExRx, Strength Level databases). Store as a lookup table:

```typescript
interface StrengthStandard {
  exercise: string;
  sex: "male" | "female";
  ageBracket: string; // e.g., "40-44"
  bodyweightBracket: string; // e.g., "180-190"
  experienceLevel: string;
  percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number; p95: number };
}
```

### 3.3 Onboarding Flow

**What it does:** Collects user attributes and preferences to seed the AI engine.

**Screens (in order):**

1. **Welcome** — "Train for the body you want today, and need at 80"
2. **Basic Info** — Name, age, sex, weight, height
3. **Experience Level** — Beginner / Intermediate / Advanced (with descriptions)
4. **Training Goal** — Build muscle / Increase strength / Get lean / General fitness / Longevity
5. **Schedule** — How many days per week? (2-6 selector) / Preferred session length? (30, 45, 60, 75, 90 min)
6. **Equipment** — Multi-select: barbell, dumbbell, kettlebell, cable machine, pull-up bar, bench, rack, bands, bodyweight only
7. **Training Location** — Home / Commercial gym / Outdoor / Mixed
8. **Split Preference** — Let Credo decide (recommended) / Choose your split (PPL, Upper/Lower, Full Body, Custom)
9. **Benchmark Tests (optional)** — "Want to test your starting strength? We'll use The Credo Ten to set your baseline." Skip or begin testing.
10. **Ready** — Show generated first week plan preview. "Your first workout is ready."

**Implementation notes:**
- Store all inputs in user profile and TrainingPreferences
- If benchmarks are completed, use them to seed Strength Score and exercise recommendations
- If skipped, use demographic estimates for initial weights (conservative: 40th percentile for experience level)

### 3.4 Exercise Video Library

**What it does:** 300+ exercises with form demonstration videos and cues.

**Data model:**

```typescript
interface ExerciseVideo {
  exerciseId: string;
  videoUrl: string; // CDN-hosted MP4 or HLS
  thumbnailUrl: string;
  duration: number; // seconds
  formCues: string[]; // e.g., ["Keep chest up", "Drive through heels"]
  commonMistakes: string[];
  alternatives: string[]; // exerciseIds for substitutions
}
```

**Implementation plan:**
- Phase 1: Text-based form cues for all exercises (no video)
- Phase 2: Source or create video content for top 50 exercises (the most commonly programmed)
- Phase 3: Expand to full 300+ library
- Videos accessible from workout screen (tap exercise name to view)
- Offline caching for downloaded videos

### 3.5 Custom Gym Profiles

**What it does:** Users define what equipment they have access to per location. The AI only programs exercises they can actually do.

```typescript
interface GymProfile {
  id: string;
  name: string; // e.g., "Home Gym", "24 Hour Fitness"
  location: "home" | "commercial_gym" | "outdoor";
  equipment: Equipment[];
  isDefault: boolean;
}
```

- Users can create multiple profiles
- Select active profile before starting workout
- AI filters exercise selection to available equipment
- Show in Profile > Program settings

### 3.6 Coach Messaging

**What it does:** In-app messaging with coaches for form checks, program questions, and motivation.

```typescript
interface CoachMessage {
  id: string;
  threadId: string;
  senderId: string; // "user" or coach ID
  content: string;
  attachments?: { type: "image" | "video"; url: string }[];
  createdAt: string;
  readAt?: string;
}
```

**Implementation (AI-only):**
- LLM-powered coach with full Credo context: user profile, recent workouts, scores, goals, benchmarks
- No human coach infrastructure. AI handles all interactions.
- Accessible from Profile and from workout screen (floating button)
- Context window includes: user profile, last 4 weeks of workouts, current scores, all benchmarks, training preferences
- Use cases: form questions ("how wide should my grip be on bench?"), program questions ("why am I doing Romanian deadlifts today?"), plateau troubleshooting, nutrition guidance
- Rate-limited to prevent abuse (e.g., 50 messages/day)
- Responses should reference user's actual data when relevant ("Your bench 1RM is up 10 lbs this month...")

### 3.7 Apple Watch / Wearable Integration

**What it does:** Sync workout data bidirectionally with Apple Health and wearables.

**Scope:**
- Read from Apple Health: resting heart rate, HRV, sleep data, step count, active calories
- Write to Apple Health: completed workouts (exercises, duration, calories estimate)
- Apple Watch companion: rest timer, current set display, set completion tap, heart rate during workout
- Strava integration (Phase 2): import outdoor runs, rides, swims with GPS, pace, HR, and distance data
- Peloton integration (Phase 2): import indoor cycling and running sessions with output, cadence, and HR data

**Data flow:**
```
Apple Health → Credo: sleep, HRV, resting HR (used for recovery estimation)
Credo → Apple Health: workout logs, active calories
Apple Watch ↔ Credo: real-time workout tracking (rest timer, set logging)
Strava → Credo: outdoor cardio sessions (runs, rides, swims) with GPS/pace/HR
Peloton → Credo: indoor cardio sessions (cycling, running) with output/cadence/HR
```

**Integration API routes (Phase 2):**
```
POST   /api/integrations/apple-health/sync
GET    /api/integrations/apple-health/status
POST   /api/integrations/strava/connect    → OAuth flow
GET    /api/integrations/strava/callback
POST   /api/integrations/strava/sync
POST   /api/integrations/peloton/connect   → OAuth flow
GET    /api/integrations/peloton/callback
POST   /api/integrations/peloton/sync
```

### 3.8 Workout Customization and Splits

**What it does:** Users can let the AI run fully or customize their split, exercise selection, and volume.

**Split options:**
- **AI Recovery Split**: AI determines daily muscle group based on recovery state (~2x/week per group)
- **AI Optimized Split**: Fixed schedule but AI optimizes volume and exercise selection
- **Preset Splits**: Push/Pull/Legs, Upper/Lower, Full Body, Bro Split
- **Custom Split**: User defines which muscle groups on which days

**Per-workout customization:**
- Swap exercises (AI suggests alternatives with same movement pattern)
- Add/remove exercises
- Adjust sets and rep ranges
- Reorder exercises
- Skip muscle groups (AI compensates next session)

**Implementation:**

```typescript
interface WorkoutSplit {
  id: string;
  name: string;
  type: "ai_recovery" | "ai_optimized" | "preset" | "custom";
  days: SplitDay[];
  isShareable: boolean;
}

interface SplitDay {
  dayNumber: number; // 1-7
  label: string; // e.g., "Push", "Upper Body", "Rest"
  muscleGroups: MuscleGroup[];
  isRestDay: boolean;
}
```

---

## 4. Extending to All Four Pillars

Once strength is built (Phase 1), extend the adaptive AI pattern to the other three pillars:

### 4.1 Stability Pillar (Phase 2)

Apply the same adaptive logic to mobility/stability work:
- Generate daily warmup routines based on upcoming workout
- Track mobility benchmarks (Dead Hang, Farmer Carry, Plank from Credo Ten)
- Adapt stretch/mobility prescriptions based on which muscles are tight or recovering
- Integration with workout: pre-workout warmup auto-generated based on today's exercises

### 4.2 Cardio Pillar (Phase 2)

Adaptive cardio programming:
- Zone 2 session planning (targeting weekly minute goal)
- VO2 max improvement protocols (Norwegian 4x4, interval training)
- Heart rate data from Apple Watch/Health to validate zone accuracy
- Progressive overload for cardio: gradually increase duration/intensity
- Integration with strength: auto-schedule cardio on non-lifting days or as finishers

### 4.3 Nutrition Pillar (Phase 2)

Adaptive nutrition guidance:
- Protein target auto-calculated from bodyweight and goal (1g/lb for muscle building, 0.8g/lb for maintenance)
- Daily protein pacing recommendations
- Meal timing relative to workouts
- Caloric needs estimation based on activity level (TDEE from workout data + steps)
- Weekly adjustment: if weight trending up/down, adjust targets

---

## 5. Backend Architecture

### Database Schema (PostgreSQL recommended)

```
users
  id, email, name, age, sex, weight_lbs, height_in, experience_level, created_at, updated_at

training_preferences
  id, user_id, goal, days_per_week, session_duration, preferred_split, training_location, enable_supersets, variety_level

user_equipment
  id, user_id, gym_profile_id, equipment_type

gym_profiles
  id, user_id, name, location_type, is_default

exercises
  id, name, primary_muscles[], secondary_muscles[], equipment[], movement_pattern, difficulty, video_url, thumbnail_url, form_cues[]

exercise_logs
  id, user_id, exercise_id, workout_plan_id, date, estimated_1rm, exertion_rating, notes

completed_sets
  id, exercise_log_id, set_number, weight, reps, rpe, rest_duration

workout_plans
  id, user_id, week_number, day_number, split_type, focus, estimated_duration, created_at, completed_at

planned_exercises
  id, workout_plan_id, exercise_id, order, target_sets, target_rep_min, target_rep_max, recommended_weight, rest_period

muscle_recovery
  user_id, muscle_group, last_trained_date, volume_last_session, estimated_recovery_date, fatigue_level

strength_scores
  id, user_id, overall_score, percentile, demographic_context, calculated_at

strength_subscores
  id, strength_score_id, category, score, key_lift, estimated_1rm, relative_strength, percentile

strength_standards
  exercise, sex, age_bracket, bodyweight_bracket, experience_level, p10, p25, p50, p75, p90, p95

benchmarks
  id, user_id, benchmark_name, value, unit, percentile, pillar, tested_at

score_history
  id, user_id, week_number, credo_score, strength_score, stability_score, cardio_score, nutrition_score, recorded_at

coach_messages
  id, thread_id, user_id, sender_type, content, attachments_json, created_at, read_at
```

### API Routes (Next.js App Router)

```
Auth:
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/refresh

User:
  GET    /api/user/profile
  PUT    /api/user/profile
  GET    /api/user/preferences
  PUT    /api/user/preferences
  GET    /api/user/gym-profiles
  POST   /api/user/gym-profiles
  PUT    /api/user/gym-profiles/:id

Workouts:
  GET    /api/workouts/today          → returns AI-generated workout for today
  GET    /api/workouts/week           → returns full week plan
  POST   /api/workouts/generate       → force regenerate workout
  POST   /api/workouts/:id/complete   → log completed workout
  PUT    /api/workouts/:id/customize  → swap exercises, adjust sets
  GET    /api/workouts/history        → past workout logs

Exercises:
  GET    /api/exercises               → full library (paginated, filterable)
  GET    /api/exercises/:id           → single exercise with video + cues
  GET    /api/exercises/:id/history   → user's history with this exercise

Scores:
  GET    /api/scores/current          → current Credo Score + all subscores
  GET    /api/scores/history          → weekly score history
  GET    /api/scores/strength         → detailed Strength Score breakdown
  POST   /api/scores/recalculate      → trigger recalculation

Benchmarks:
  GET    /api/benchmarks              → user's Credo Ten results
  POST   /api/benchmarks/:name/log   → log a new benchmark test result

Coach:
  GET    /api/coach/threads
  GET    /api/coach/threads/:id
  POST   /api/coach/messages

Nutrition:
  GET    /api/nutrition/today
  POST   /api/nutrition/log
  GET    /api/nutrition/history

Integrations:
  POST   /api/integrations/apple-health/sync
  GET    /api/integrations/apple-health/status
```

### AI Service Architecture

The workout generation algorithm should be implemented as a standalone service module (not inline in API routes) so it can be:
1. Unit tested with mock user profiles
2. Iterated on independently
3. Eventually replaced with an ML model if needed

```
/src/services/
  /ai/
    workout-generator.ts    → main algorithm (Steps 1-7 above)
    weight-recommender.ts   → 1RM calculation + weight recommendations
    recovery-tracker.ts     → muscle fatigue/recovery estimation
    score-calculator.ts     → Strength Score + Credo Score calculation
    exercise-selector.ts    → exercise selection + substitution logic
  /data/
    strength-standards.ts   → demographic percentile lookup tables
    exercise-library.ts     → seeded exercise definitions
```

---

## 6. Implementation Phases

### Phase 1: Strength Engine (8-10 weeks)

**Week 1-2: Backend Foundation**
- Set up PostgreSQL database with schema above
- Implement auth (email/password, Apple Sign-In)
- Create user profile and preferences API routes
- Migrate mock data to database-backed endpoints
- Connect Next.js frontend to real API

**Week 3-4: Exercise Library + Workout Data Model**
- Fork wger.io open source exercise database. Seed 200+ exercises with muscles, equipment, movement patterns. Add Credo-specific stability/longevity exercises.
- Build exercise log and completed sets tables
- Implement workout plan data model
- Build workout history API
- Replace mock workout data on frontend

**Week 5-6: AI Workout Engine**
- Implement workout generation algorithm (Steps 1-7)
- Implement weight recommendation engine (1RM + progressive overload)
- Implement muscle recovery tracker
- Build `/api/workouts/today` endpoint
- Wire up workout screen to generated workouts
- Implement real-time autoregulation (set-by-set adjustments)

**Week 7-8: Strength Score**
- Compile and seed strength standards data from published sources (Symmetric Strength, ExRx, NSCA tables)
- Implement Strength Score calculation (8 subscores)
- Build percentile comparison engine
- Update dashboard to show real Strength Score
- Update Credo Ten page to pull from benchmarks API
- Implement score history tracking

**Week 9-10: Customization + Polish**
- Build workout split selector (AI, preset, custom)
- Implement exercise swapping during workout
- Build gym profile management
- Add exercise form cues (text-based Phase 1)
- Onboarding flow (10 screens)
- Workout sharing (shareable links for splits and workout summaries)
- End-to-end testing

### Phase 2: Full Pillar Integration (6-8 weeks)
- Stability: adaptive warmup generation, mobility tracking
- Cardio: Zone 2 planning, VO2 max protocols, HR integration
- Nutrition: adaptive protein targets, meal timing, TDEE estimation
- Apple Health read/write integration
- Coach messaging (AI-powered)

### Phase 3: Native + Wearable (6-8 weeks)
- Apple Watch companion app
- iOS app connected to shared backend
- Offline workout support (sync when connected)
- Exercise video library (top 50 exercises)
- Push notifications (workout reminders, rest day suggestions)

---

## 7. Success Metrics

- **Workout completion rate**: >70% of generated workouts completed
- **Progressive overload**: users increasing estimated 1RM over 8-week rolling window
- **Strength Score improvement**: average user improves score by 5+ points in first 12 weeks
- **Retention**: 60% weekly active rate at week 8
- **Credo Score engagement**: users checking score 3+ times per week

---

## 8. Key Decisions and Tradeoffs

**Decision 1: Algorithm-first, not ML-first.** The workout generation engine should be rule-based (deterministic algorithm) for Phase 1. This is what Gravl does. ML models require training data we don't have yet. The rule-based engine can be validated, debugged, and iterated on quickly. Once we have 10K+ users logging workouts, we can train models to improve recommendations.

**Decision 2: PostgreSQL, not Firebase/Supabase.** The scoring system requires complex aggregations (percentile calculations across demographics, rolling 90-day windows). PostgreSQL handles this natively. Use Prisma as ORM for type safety with the existing TypeScript stack.

**Decision 3: Shared backend for web and iOS.** Both apps hit the same Next.js API routes. iOS app uses URLSession/Alamofire to call the API. This avoids duplicating business logic. The AI engine runs server-side, not on-device.

**Decision 4: Conservative initial weight recommendations.** When a user has no history for an exercise, recommend weights at the 40th percentile for their demographic. It's better to start too light (user adjusts up) than too heavy (injury risk, bad experience).

**Decision 5: Exercise form cues before video.** Video production is expensive and slow. Text-based form cues for all exercises in Phase 1, video for top 50 in Phase 3. This unblocks the full workout experience without waiting for video content.

---

## 9. Resolved Decisions

1. **Exercise database source**: Fork wger.io (open source, 300+ exercises with muscle/equipment tagging). Customize for Credo's needs, especially stability and longevity-specific movements.
2. **Strength standards data**: Compile from published sources (Symmetric Strength, ExRx, NSCA tables). We own the data, can update independently, no external API dependency.
3. **Coach messaging scope**: AI-only. LLM-powered coach with full Credo context (user profile, recent workouts, scores, goals). No human coach infrastructure needed.
4. **Pricing**: Already decided separately. Do not include payment infrastructure in this PRD scope.
5. **Social features**: Workout sharing only. Users can share custom splits and workout summaries via link. No leaderboards, feeds, or follow mechanics.
6. **Cardio device integrations**: Full suite in Phase 2. Apple Health (primary) + Strava (outdoor runs/rides with GPS/pace/HR) + Peloton (indoor cycling/running data).

---

## 10. Workout Sharing (Lightweight Social)

**What it does:** Users can share custom workout splits and completed workout summaries via shareable links. No accounts required to view.

**Data model:**

```typescript
interface SharedWorkout {
  id: string;
  shareCode: string; // short URL-friendly code
  createdBy: string; // userId
  type: "split" | "workout_summary";
  data: WorkoutSplit | WorkoutSummary;
  createdAt: string;
  viewCount: number;
}

interface WorkoutSummary {
  workoutName: string;
  date: string;
  duration: number; // minutes
  exercises: { name: string; bestSet: string; totalVolume: number }[];
  totalVolume: number;
  muscleGroups: MuscleGroup[];
}
```

**Implementation:**
- Share button on completed workout screen and split manager
- Generates a short link (e.g., `credo.app/s/abc123`)
- Public page renders workout details without requiring login
- "Import this split" button for logged-in users viewing a shared split
- No comments, likes, or follow mechanics

**API routes:**
```
POST   /api/share              → create shareable link
GET    /api/share/:code        → public endpoint, returns shared data
POST   /api/share/:code/import → import shared split into user's account
```

**Phase:** Include in Phase 1, Week 9-10 (Customization + Polish)
