"use client";

// Stability pillar: weekly mobility volume against a 60-min target, the
// adaptive warmup generated for today's lifting session, and the session log
// that feeds the stability score.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Plus } from "lucide-react";
import {
  STABILITY_TYPE_LABELS,
  WARMUP_SESSION_MINUTES,
  type StabilitySessionDTO,
  type StabilitySummaryDTO,
} from "@/components/pillars/dto";
import {
  CARD_CLASS,
  EmptyState,
  ErrorRetry,
  InlineError,
  PillarCard,
  PillarHeader,
  PillarSkeleton,
  ProgressBar,
  SectionLabel,
} from "@/components/pillars/pillar-chrome";
import { WeekBarChart } from "@/components/pillars/week-bar-chart";
import { StabilityLogSheet } from "@/components/pillars/stability-log-sheet";
import { LogRow } from "@/components/pillars/log-row";
import {
  apiDelete,
  apiGet,
  apiPost,
  dayLabel,
  redirectToLogin,
  UnauthorizedError,
} from "@/components/pillars/utils";

const TEAL = "var(--color-teal)";
const TEAL_LIGHT = "var(--color-teal-light)";

const STABILITY_BENCHMARKS = [
  { name: "Dead Hang", detail: "Grip and shoulder endurance" },
  { name: "Plank", detail: "Anti-extension core capacity" },
  { name: "Farmer Carry", detail: "Loaded trunk stability" },
];

interface SessionsPayload {
  sessions: StabilitySessionDTO[];
  total: number;
}

export default function StabilityPage() {
  const [summary, setSummary] = useState<StabilitySummaryDTO | null>(null);
  const [sessions, setSessions] = useState<StabilitySessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [warmupPending, setWarmupPending] = useState(false);
  const [warmupDone, setWarmupDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      const [summaryData, sessionData] = await Promise.all([
        apiGet<StabilitySummaryDTO>("/api/stability/summary"),
        apiGet<SessionsPayload>("/api/stability/sessions?limit=20"),
      ]);
      setSummary(summaryData);
      setSessions(sessionData.sessions);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markWarmupDone = useCallback(async () => {
    if (warmupPending) return;
    setWarmupPending(true);
    setActionError(null);
    try {
      await apiPost<{ session: StabilitySessionDTO }>(
        "/api/stability/sessions",
        { type: "warmup", minutes: WARMUP_SESSION_MINUTES },
      );
      setWarmupDone(true);
      await load(false);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setActionError(
        e instanceof Error ? e.message : "Couldn't log the warmup",
      );
    } finally {
      setWarmupPending(false);
    }
  }, [warmupPending, load]);

  const handleDelete = useCallback(
    async (id: string) => {
      setActionError(null);
      const previous = sessions;
      setSessions((rows) => rows.filter((r) => r.id !== id));
      try {
        await apiDelete<{ deleted: boolean }>(`/api/stability/sessions/${id}`);
        await load(false);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        setSessions(previous);
        setActionError(
          e instanceof Error ? e.message : "Couldn't delete that session",
        );
      }
    },
    [sessions, load],
  );

  if (loading) return <PillarSkeleton blocks={[148, 220, 52, 176, 132]} />;

  if (error || !summary) {
    return (
      <ErrorRetry
        title="Couldn't load your stability week"
        message={error ?? "Something went wrong"}
        onRetry={() => void load()}
      />
    );
  }

  const { thisWeekMin, weeklyTargetMin, sessionsThisWeek, todaysWarmup } =
    summary;
  const fraction = weeklyTargetMin > 0 ? thisWeekMin / weeklyTargetMin : 0;
  const remaining = Math.max(0, weeklyTargetMin - thisWeekMin);

  return (
    <div className="flex-1 px-5 pb-6">
      <PillarHeader
        title="Stability"
        subtitle="Mobility, balance, and core work — the quiet pillar that keeps the other three training."
        color={TEAL}
      />

      {/* ── Weekly minutes ───────────────────────────────── */}
      <PillarCard>
        <div className="flex items-end justify-between gap-3">
          <div>
            <SectionLabel>Minutes this week</SectionLabel>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span
                className="font-mono text-[40px] font-bold leading-none"
                style={{ color: TEAL }}
              >
                {thisWeekMin}
              </span>
              <span className="font-mono text-[18px] font-semibold text-text-tertiary">
                / {weeklyTargetMin}
              </span>
              <span className="ml-0.5 text-[13px] text-text-secondary">min</span>
            </div>
          </div>
          <div className="pb-1 text-right">
            <div className="font-mono text-[20px] font-semibold text-text-primary">
              {sessionsThisWeek}
            </div>
            <div className="text-[11px] text-text-tertiary">
              {sessionsThisWeek === 1 ? "session" : "sessions"}
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <ProgressBar fraction={fraction} color={TEAL} active={mounted} />
        </div>
        <div className="mt-2 text-[12px] text-text-secondary">
          {remaining > 0
            ? `${remaining} min to the weekly target`
            : "Weekly target cleared"}
        </div>
      </PillarCard>

      {/* ── Today's warmup ───────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Today&apos;s warmup</SectionLabel>
        <div className="mt-2.5">
          {todaysWarmup && todaysWarmup.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={CARD_CLASS}
            >
              <div className="border-b border-app px-4 py-3">
                <div className="text-[14px] font-semibold text-text-primary">
                  Pre-lift routine
                </div>
                <div className="mt-0.5 text-[12px] text-text-secondary">
                  Matched to today&apos;s session
                  {summary.todaysFocus ? ` · ${summary.todaysFocus}` : ""}
                </div>
              </div>
              <ul className="flex flex-col">
                {todaysWarmup.map((move, i) => (
                  <li
                    key={`${move.exerciseId}-${i}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--app-border)",
                    }}
                  >
                    <span className="min-w-0 truncate text-[13px] text-text-primary">
                      {move.name}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[12px] font-semibold"
                      style={{ color: TEAL }}
                    >
                      {move.prescription}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="px-4 pb-4 pt-3">
                <button
                  type="button"
                  onClick={() => void markWarmupDone()}
                  disabled={warmupPending || warmupDone}
                  className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-[10px] py-2.5 text-[13px] font-semibold transition-colors disabled:cursor-default"
                  style={
                    warmupDone
                      ? { background: TEAL_LIGHT, color: TEAL }
                      : { background: TEAL, color: "white" }
                  }
                >
                  {warmupDone ? (
                    <>
                      <Check size={15} />
                      Logged {WARMUP_SESSION_MINUTES} min
                    </>
                  ) : warmupPending ? (
                    "Logging…"
                  ) : (
                    `Mark done (~${WARMUP_SESSION_MINUTES} min)`
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className={`${CARD_CLASS} px-4 py-5 text-center`}>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                No lifting session scheduled today, so there&apos;s no matched
                warmup. A standalone mobility block still counts.
              </p>
              <Link
                href="/app/workout"
                className="focus-ring mt-3 inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold"
                style={{ color: TEAL }}
              >
                Go to today&apos;s workout
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="focus-ring mt-4 flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-credo py-3 text-[15px] font-semibold text-white transition-colors hover:bg-credo/90"
      >
        <Plus size={17} />
        Log session
      </button>

      {actionError && (
        <InlineError message={actionError} onRetry={() => void load(false)} />
      )}

      {/* ── 8-week chart ─────────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Last 8 weeks</SectionLabel>
        <div className={`${CARD_CLASS} mt-2.5 p-4`}>
          <WeekBarChart
            weeks={summary.weeklyMinutes.map((w) => ({
              weekStart: w.weekStart,
              segments: [
                { value: w.minutes, color: TEAL, label: "Stability" },
              ],
            }))}
            target={weeklyTargetMin}
            unit="min"
            active={mounted}
          />
          <div className="mt-3 border-t border-app pt-3 text-[11px] text-text-secondary">
            Dashed line marks the {weeklyTargetMin}-min weekly target.
          </div>
        </div>
      </div>

      {/* ── Benchmarks link ──────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Benchmarks</SectionLabel>
        <Link
          href="/app/credo-ten"
          className={`${CARD_CLASS} focus-ring mt-2.5 block p-4 transition-colors hover:bg-surface`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-text-primary">
                Test your stability
              </div>
              <div className="mt-0.5 text-[12px] text-text-secondary">
                Three of the Credo Ten score this pillar
              </div>
            </div>
            <ArrowRight size={16} className="shrink-0 text-text-tertiary" />
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {STABILITY_BENCHMARKS.map((b) => (
              <div key={b.name} className="flex items-baseline gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: TEAL }}
                />
                <span className="text-[13px] font-medium text-text-primary">
                  {b.name}
                </span>
                <span className="text-[11px] text-text-tertiary">{b.detail}</span>
              </div>
            ))}
          </div>
        </Link>
      </div>

      {/* ── Session log ──────────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Recent sessions</SectionLabel>
        <div className="mt-2.5 flex flex-col gap-2">
          {sessions.length === 0 ? (
            <EmptyState>
              Nothing logged yet. Ten minutes of mobility after a lift is enough
              to start.
            </EmptyState>
          ) : (
            sessions.map((session) => (
              <LogRow
                key={session.id}
                title={STABILITY_TYPE_LABELS[session.type] ?? session.type}
                meta={
                  session.notes
                    ? `${dayLabel(session.date)} · ${session.notes}`
                    : dayLabel(session.date)
                }
                value={String(session.minutes)}
                unit="min"
                color={TEAL}
                onDelete={() => handleDelete(session.id)}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <StabilityLogSheet
            onClose={() => setSheetOpen(false)}
            onLogged={() => void load(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
