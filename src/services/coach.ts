// coach.ts
// Server-side AI coach: assembles a compact, bounded snapshot of the user's
// real training data and asks Claude to answer as Credo's coach.
//
// Everything here is server-only — it reads Prisma rows and holds the
// ANTHROPIC_API_KEY. Route handlers stay thin: auth, validate, persist, call.

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import type { BenchmarkDTO, MuscleRecoveryState } from "@/lib/types";
import {
  addDays,
  benchmarkDTOsForUser,
  computePillarScores,
  computeStrengthScoreResult,
  loadTrainingContext,
  recoveryStatesForUser,
  utcDayStart,
  weekNumberFor,
} from "@/services/training-context";
import { EXERCISES_BY_ID } from "@/services/data/exercise-library";

// ── Configuration ───────────────────────────────────────────────────────────

/**
 * Claude Opus 5 — the recommended default for a quality-sensitive consumer
 * chat feature. Thinking is on (adaptive) by default on this model, so the
 * `thinking` parameter is deliberately omitted rather than configured.
 */
const COACH_MODEL = "claude-opus-5";
const MAX_TOKENS = 1024;

/** User messages allowed per UTC calendar day (PRD §3.6). */
export const DAILY_MESSAGE_LIMIT = 50;

/** Thread turns replayed to the model (a turn is one message). */
const MAX_HISTORY_MESSAGES = 20;

export function isCoachConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ── Typed failure the routes turn into a friendly 503 ───────────────────────

export type CoachFailureKind = "not_configured" | "upstream";

export class CoachUnavailableError extends Error {
  readonly kind: CoachFailureKind;
  constructor(kind: CoachFailureKind, message: string) {
    super(message);
    this.name = "CoachUnavailableError";
    this.kind = kind;
  }
}

// ── Persona (static across every user and every request) ─────────────────────
//
// Kept byte-stable so it forms a cacheable prefix shared by all users: it is
// the first system block and carries its own cache breakpoint. Never
// interpolate anything per-user or per-request into this string.

const COACH_PERSONA = `You are Credo Coach, the in-app strength and longevity coach for Credo, a training app that generates adaptive workouts and tracks five pillars: Credo Score (overall), Strength, Stability, Cardio, and Nutrition.

WHO YOU COACH
The person you are talking to is a Credo athlete. A structured snapshot of their real training data follows in the next block. It is the only thing you know about them.

WHAT YOU HELP WITH
- Form and technique questions ("how wide should my grip be on bench?").
- Program rationale — why the app prescribed a given exercise, rep range, weight, or rest today.
- Plateau troubleshooting: stalled lifts, recovery debt, volume and frequency, deload timing.
- Nutrition basics: protein targets, energy balance, meal timing, hydration, and how those interact with training.
- Motivation and adherence, without hype.

HOW YOU ANSWER
- Be concise. Two to four short paragraphs at most; often one is enough. No headers, no bulleted lists unless the user asks for steps.
- Be evidence-based and practical. Give the recommendation and the one reason it holds, not a literature review.
- Be encouraging and direct, never breathless. Talk like a good coach on the gym floor.
- Reference the athlete's actual numbers whenever they make the answer more useful — their estimated 1RMs, recent sessions, pillar scores, benchmark results, recovery state, or the focus of today's session. Quote them exactly as given.
- Use plain text. No emoji, no markdown headers.

HARD RULES
- Never invent data. If the snapshot does not contain something (a lift, a body-composition number, a past session), say you do not have it and ask, or answer generally without pretending to know. Do not estimate a number and present it as theirs.
- No medical diagnosis or treatment. If the athlete describes pain, injury, numbness, dizziness, chest symptoms, or anything that sounds clinical, tell them plainly to stop training that pattern and see a physician or physical therapist. You may explain general soreness vs. pain, but you do not diagnose.
- No performance-enhancing drug advice of any kind, including dosing, sourcing, "natural" analogues framed as PED substitutes, or harm-reduction protocols. Decline briefly and redirect to training, recovery, and nutrition.
- No extreme dieting prescriptions, no advice aimed at minors, and no body-shaming. Keep nutrition guidance to general, sustainable ranges — you are not a registered dietitian and should say so when the question calls for one.
- If a question falls outside training, recovery, and nutrition, say so in one line and steer back.`;

// ── Context assembly ────────────────────────────────────────────────────────

function exerciseName(id: string): string {
  return EXERCISES_BY_ID.get(id)?.name ?? id;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function line(label: string, value: string | number | null | undefined): string {
  return `${label}: ${value === null || value === undefined || value === "" ? "unknown" : value}`;
}

interface SessionSummary {
  date: string;
  focus: string;
  entries: string[];
}

/**
 * Group the last 4 weeks of exercise logs into per-day sessions with a
 * top-set + estimated-1RM line per exercise. Bounded to 14 sessions and 8
 * exercises per session so the block stays a few KB.
 */
async function recentSessions(userId: string, now: Date): Promise<SessionSummary[]> {
  const logs = await prisma.exerciseLog.findMany({
    where: { userId, date: { gte: addDays(now, -28) } },
    include: { sets: true, workoutPlan: { select: { focus: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });

  const byDay = new Map<string, SessionSummary>();
  for (const log of logs) {
    const day = isoDay(log.date);
    let session = byDay.get(day);
    if (!session) {
      if (byDay.size >= 14) continue;
      session = { date: day, focus: log.workoutPlan?.focus ?? "logged session", entries: [] };
      byDay.set(day, session);
    }
    if (session.entries.length >= 8) continue;

    const best = [...log.sets].sort(
      (a, b) => b.weight - a.weight || b.reps - a.reps,
    )[0];
    const top = best
      ? best.weight > 0
        ? `${fmt(best.weight)} lb x ${best.reps}`
        : `${best.reps} reps`
      : "no sets";
    const oneRM = log.estimated1RM ? `, e1RM ${Math.round(log.estimated1RM)} lb` : "";
    const rpe = best?.rpe ? `, RPE ${best.rpe}` : "";
    session.entries.push(
      `${exerciseName(log.exerciseId)} — ${log.sets.length} sets, top ${top}${oneRM}${rpe}`,
    );
  }

  return [...byDay.values()];
}

function recoveryLine(state: MuscleRecoveryState, now: Date): string {
  const readyIn = Math.ceil(
    (new Date(state.estimatedRecoveryDate).getTime() - now.getTime()) / 3_600_000 / 24,
  );
  const when =
    readyIn <= 0 ? "ready" : `ready in ~${readyIn} day${readyIn === 1 ? "" : "s"}`;
  return `${state.muscleGroup}: ${state.fatigueLevel} (${when})`;
}

function benchmarkLine(b: BenchmarkDTO): string {
  if (!b.latest) return `${b.name}: not tested`;
  const pct = b.latest.percentile !== null ? `, ${Math.round(b.latest.percentile)}th pct` : "";
  const prev =
    b.previous !== null ? ` (previous ${fmt(b.previous.value)} ${b.unit})` : "";
  return `${b.name}: ${fmt(b.latest.value)} ${b.unit}${pct}, tested ${b.latest.testedAt.slice(0, 10)}${prev}`;
}

/**
 * A compact, structured snapshot of everything the coach is allowed to know.
 * Deliberately summarized (never raw rows) and bounded to a few KB.
 */
export async function buildCoachContext(
  userId: string,
  now: Date = new Date(),
): Promise<string> {
  const ctx = await loadTrainingContext(userId, now);
  const weekNumber = weekNumberFor(ctx.user.createdAt, now);

  const [scores, strength, benchmarks, recovery, sessions, prs, weekPlans] =
    await Promise.all([
      computePillarScores(userId, now).catch(() => null),
      computeStrengthScoreResult(userId, now).catch(() => null),
      benchmarkDTOsForUser(userId).catch((): BenchmarkDTO[] => []),
      recoveryStatesForUser(userId, now).catch((): MuscleRecoveryState[] => []),
      recentSessions(userId, now),
      prisma.personalRecord.findMany({
        where: { userId, date: { gte: addDays(now, -28) } },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.workoutPlan.findMany({
        where: { userId, weekNumber },
        orderBy: { dayNumber: "asc" },
        take: 7,
      }),
    ]);

  const p = ctx.profile;
  const prefs = ctx.preferences;
  const sections: string[] = [];

  sections.push(
    [
      "ATHLETE",
      line("Name", ctx.user.name),
      line("Age", p.age),
      line("Sex", p.sex),
      line("Bodyweight (lb)", p.weight),
      line("Height (in)", p.heightIn),
      line("Experience", p.experienceLevel),
      line("Program week", weekNumber),
      line("Today (UTC)", isoDay(now)),
    ].join("\n"),
  );

  sections.push(
    [
      "GOAL AND PREFERENCES",
      line("Primary goal", prefs?.goal ?? ctx.user.trainingGoal),
      line("Days per week", prefs?.daysPerWeek),
      line("Session length (min)", prefs?.sessionDuration),
      line("Preferred split", prefs?.preferredSplit),
      line("Training location", prefs?.trainingLocation),
      line("Available equipment", ctx.equipment.join(", ")),
      line("Focus muscles", prefs?.muscleGroupFocus?.join(", ") || "none set"),
      line("Excluded muscles", prefs?.muscleGroupExclude?.join(", ") || "none"),
      line("Supersets", prefs ? (prefs.enableSupersets ? "enabled" : "disabled") : null),
      line("Variety level", prefs?.varietyLevel),
      line("Daily protein target (g)", ctx.user.proteinTargetG),
      line("Weekly zone 2 target (min)", ctx.user.zone2TargetMin),
    ].join("\n"),
  );

  if (scores) {
    sections.push(
      [
        `PILLAR SCORES (week ${scores.weekNumber}, 0-100, delta vs last week)`,
        `Credo ${Math.round(scores.credo.score)} (${fmt(scores.credo.delta)})`,
        `Strength ${Math.round(scores.strength.score)} (${fmt(scores.strength.delta)})`,
        `Stability ${Math.round(scores.stability.score)} (${fmt(scores.stability.delta)})`,
        `Cardio ${Math.round(scores.cardio.score)} (${fmt(scores.cardio.delta)})`,
        `Nutrition ${Math.round(scores.nutrition.score)} (${fmt(scores.nutrition.delta)})`,
      ].join("\n"),
    );
  }

  if (strength) {
    sections.push(
      [
        `STRENGTH SCORE ${Math.round(strength.overall)} — ${Math.round(strength.percentile)}th percentile vs ${strength.demographicContext}; trend ${strength.trend} (${fmt(strength.trendDelta)})`,
        ...strength.subscores.map(
          (s) =>
            `${s.category}: ${Math.round(s.score)} — ${s.keyLift} ${Math.round(s.estimated1RM)} (${fmt(s.relativeStrength)}x bw, ${Math.round(s.percentile)}th pct)`,
        ),
      ].join("\n"),
    );
  }

  sections.push(
    sessions.length > 0
      ? [
          "LAST 4 WEEKS OF TRAINING (most recent first)",
          ...sessions.map(
            (s) => `${s.date} — ${s.focus}\n  ${s.entries.join("\n  ")}`,
          ),
        ].join("\n")
      : "LAST 4 WEEKS OF TRAINING\nNo logged sessions in the last 28 days.",
  );

  sections.push(
    prs.length > 0
      ? [
          "PERSONAL RECORDS (last 28 days)",
          ...prs.map(
            (r) =>
              `${isoDay(r.date)} — ${exerciseName(r.exerciseId)}: e1RM ${Math.round(r.new1RM)} lb${
                r.previous1RM ? ` (was ${Math.round(r.previous1RM)})` : ""
              }, from ${fmt(r.setWeight)} lb x ${r.setReps}`,
          ),
        ].join("\n")
      : "PERSONAL RECORDS (last 28 days)\nNone.",
  );

  sections.push(
    [
      "CREDO TEN BENCHMARKS",
      ...benchmarks.map(benchmarkLine),
    ].join("\n"),
  );

  sections.push(
    weekPlans.length > 0
      ? [
          `THIS WEEK'S PLAN (week ${weekNumber})`,
          ...weekPlans.map(
            (plan) =>
              `Day ${plan.dayNumber}/${plan.totalDays} — ${plan.focus} (${plan.splitType}, ~${plan.estimatedDuration} min, ${plan.status}${
                plan.scheduledDate ? `, scheduled ${isoDay(plan.scheduledDate)}` : ""
              })`,
          ),
        ].join("\n")
      : `THIS WEEK'S PLAN (week ${weekNumber})\nNo sessions generated yet.`,
  );

  sections.push(
    recovery.length > 0
      ? [
          "MUSCLE RECOVERY SNAPSHOT",
          recovery.map((s) => recoveryLine(s, now)).join("; "),
        ].join("\n")
      : "MUSCLE RECOVERY SNAPSHOT\nNo recovery data yet.",
  );

  return `ATHLETE SNAPSHOT — the only data you have about this person. Do not use any number that is not here.\n\n${sections.join(
    "\n\n",
  )}`;
}

// ── Rate limiting ───────────────────────────────────────────────────────────

export interface RateLimitStatus {
  allowed: boolean;
  used: number;
  limit: number;
}

/** 50 user messages per UTC calendar day, counted across all of their threads. */
export async function checkRateLimit(
  userId: string,
  now: Date = new Date(),
): Promise<RateLimitStatus> {
  const used = await prisma.coachMessage.count({
    where: {
      senderType: "user",
      createdAt: { gte: utcDayStart(now) },
      thread: { userId },
    },
  });
  return { allowed: used < DAILY_MESSAGE_LIMIT, used, limit: DAILY_MESSAGE_LIMIT };
}

// ── Reply generation ────────────────────────────────────────────────────────

export interface CoachThreadMessage {
  senderType: string; // "user" | "coach"
  content: string;
}

export interface GenerateCoachReplyArgs {
  userId: string;
  /** Prior messages in the thread, oldest first, excluding `userMessage`. */
  threadMessages: CoachThreadMessage[];
  userMessage: string;
  now?: Date;
}

function toMessageParams(
  history: CoachThreadMessage[],
  userMessage: string,
): Anthropic.MessageParam[] {
  const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
  const messages: Anthropic.MessageParam[] = [];
  for (const m of trimmed) {
    const role: "user" | "assistant" = m.senderType === "coach" ? "assistant" : "user";
    const content = m.content.trim();
    if (!content) continue;
    // The API requires the first turn to be from the user.
    if (messages.length === 0 && role === "assistant") continue;
    messages.push({ role, content });
  }
  messages.push({ role: "user", content: userMessage });
  return messages;
}

/**
 * Ask Claude for the coach's reply.
 *
 * Prompt caching: the request renders as system → messages, and caching is a
 * prefix match, so the two stable pieces go in `system` with their own
 * breakpoints — block 0 is the frozen persona (identical for every user and
 * every request, so it is the widest-reuse prefix), block 1 is this user's
 * data snapshot (stable across the turns of a conversation and across
 * conversations until their data changes). Volatile content — the thread
 * history and the new question — goes in `messages`, after the last
 * breakpoint, so a new turn never invalidates the cached prefix.
 *
 * @throws {CoachUnavailableError} when the key is missing or the API fails.
 */
export async function generateCoachReply({
  userId,
  threadMessages,
  userMessage,
  now = new Date(),
}: GenerateCoachReplyArgs): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new CoachUnavailableError("not_configured", "Coach is not configured");
  }

  let context: string;
  try {
    context = await buildCoachContext(userId, now);
  } catch (error) {
    console.error("Coach context error:", error);
    throw new CoachUnavailableError(
      "upstream",
      "Coach could not read your training data",
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: COACH_PERSONA,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: context,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: toMessageParams(threadMessages, userMessage),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) {
      throw new CoachUnavailableError(
        "upstream",
        "Coach could not answer that right now",
      );
    }
    return text;
  } catch (error) {
    if (error instanceof CoachUnavailableError) throw error;
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Coach auth error:", error.message);
      throw new CoachUnavailableError("not_configured", "Coach is not configured");
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Coach API error ${error.status}:`, error.message);
    } else {
      console.error("Coach error:", error);
    }
    throw new CoachUnavailableError(
      "upstream",
      "Coach is unavailable right now. Try again in a moment.",
    );
  }
}

/** First ~40 characters of the opening message, used as a thread title. */
export function titleFromMessage(content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  if (clean.length <= 40) return clean || "New conversation";
  return `${clean.slice(0, 40).trimEnd()}…`;
}
