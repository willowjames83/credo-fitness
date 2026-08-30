"use client";

// Cardio pillar: weekly Zone 2 volume against the user's target, an adaptive
// nudge from /api/cardio/summary, the Norwegian 4x4 protocol, and the session
// log. Everything is fed by CardioSession rows, which the pillar scores read.

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import {
  CARDIO_TYPE_LABELS,
  VO2_TYPES,
  type CardioSessionDTO,
  type CardioSummaryDTO,
  type CardioType,
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
import {
  ChartLegend,
  WeekBarChart,
} from "@/components/pillars/week-bar-chart";
import { CardioLogSheet } from "@/components/pillars/cardio-log-sheet";
import { LogRow } from "@/components/pillars/log-row";
import {
  apiDelete,
  apiGet,
  dayLabel,
  distanceLabel,
  joinList,
  redirectToLogin,
  UnauthorizedError,
} from "@/components/pillars/utils";

const BLUE = "var(--color-cardio)";
const BLUE_LIGHT = "var(--color-cardio-light)";
const VO2_BLUE = "#93B4F8";

interface SessionsPayload {
  sessions: CardioSessionDTO[];
  total: number;
}

export default function CardioPage() {
  const [summary, setSummary] = useState<CardioSummaryDTO | null>(null);
  const [sessions, setSessions] = useState<CardioSessionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sheetType, setSheetType] = useState<CardioType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      const [summaryData, sessionData] = await Promise.all([
        apiGet<CardioSummaryDTO>("/api/cardio/summary"),
        apiGet<SessionsPayload>("/api/cardio/sessions?limit=20"),
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

  const handleDelete = useCallback(
    async (id: string) => {
      setActionError(null);
      const previous = sessions;
      setSessions((rows) => rows.filter((r) => r.id !== id));
      try {
        await apiDelete<{ deleted: boolean }>(`/api/cardio/sessions/${id}`);
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

  if (loading) return <PillarSkeleton blocks={[168, 112, 52, 196, 132]} />;

  if (error || !summary) {
    return (
      <ErrorRetry
        title="Couldn't load your cardio week"
        message={error ?? "Something went wrong"}
        onRetry={() => void load()}
      />
    );
  }

  const { zone2ThisWeekMin, zone2TargetMin, vo2SessionsThisWeek, suggestion } =
    summary;
  const fraction = zone2TargetMin > 0 ? zone2ThisWeekMin / zone2TargetMin : 0;
  const remaining = Math.max(0, zone2TargetMin - zone2ThisWeekMin);

  return (
    <div className="flex-1 px-5 pb-6">
      <PillarHeader
        title="Cardio"
        subtitle="Zone 2 volume builds the base; a weekly hard session raises the ceiling."
        color={BLUE}
      />

      {/* ── Weekly Zone 2 progress ───────────────────────── */}
      <PillarCard>
        <div className="flex items-end justify-between gap-3">
          <div>
            <SectionLabel>Zone 2 this week</SectionLabel>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span
                className="font-mono text-[40px] font-bold leading-none"
                style={{ color: BLUE }}
              >
                {zone2ThisWeekMin}
              </span>
              <span className="font-mono text-[18px] font-semibold text-text-tertiary">
                / {zone2TargetMin}
              </span>
              <span className="ml-0.5 text-[13px] text-text-secondary">min</span>
            </div>
          </div>
          <div className="pb-1 text-right">
            <div className="font-mono text-[20px] font-semibold text-text-primary">
              {vo2SessionsThisWeek}
            </div>
            <div className="text-[11px] text-text-tertiary">
              hard {vo2SessionsThisWeek === 1 ? "session" : "sessions"}
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <ProgressBar fraction={fraction} color={BLUE} active={mounted} />
        </div>
        <div className="mt-2 text-[12px] text-text-secondary">
          {remaining > 0
            ? `${remaining} min to target`
            : "Weekly target cleared"}
        </div>
      </PillarCard>

      {/* ── Adaptive suggestion ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-3 rounded-[14px] p-4"
        style={{ background: BLUE_LIGHT }}
      >
        <SectionLabel>
          {suggestion.kind === "vo2" ? "Raise your ceiling" : "This week"}
        </SectionLabel>
        <p className="mt-1.5 text-[14px] leading-relaxed text-text-primary">
          {suggestion.message}
        </p>
        {suggestion.freeDays.length > 0 && (
          <p className="mt-2 text-[12px] leading-relaxed text-cardio/70">
            {joinList(suggestion.freeDays)}{" "}
            {suggestion.freeDays.length === 1 ? "is" : "are"} free of lifting —
            good {suggestion.freeDays.length === 1 ? "slot" : "slots"} for it.
          </p>
        )}
      </motion.div>

      <button
        type="button"
        onClick={() => setSheetType("zone2")}
        className="focus-ring mt-3 flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-credo py-3 text-[15px] font-semibold text-white transition-colors hover:bg-credo/90"
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
                { value: w.zone2Min, color: BLUE, label: "Zone 2" },
                { value: w.vo2Min, color: VO2_BLUE, label: "Hard" },
              ],
            }))}
            target={zone2TargetMin}
            unit="min"
            active={mounted}
          />
          <div className="mt-3 border-t border-app pt-3">
            <ChartLegend
              items={[
                { label: "Zone 2", color: BLUE },
                { label: "VO2 max / intervals", color: VO2_BLUE },
                { label: `Target ${zone2TargetMin} min`, color: "var(--text-tertiary)" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Norwegian 4x4 ────────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Protocol</SectionLabel>
        <div className="mt-2.5">
          <NorwegianProtocolCard onLog={() => setSheetType("vo2max")} />
        </div>
      </div>

      {/* ── Session log ──────────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Recent sessions</SectionLabel>
        <div className="mt-2.5 flex flex-col gap-2">
          {sessions.length === 0 ? (
            <EmptyState>
              No sessions logged yet. A 30-min easy walk or ride counts — start
              the base.
            </EmptyState>
          ) : (
            sessions.map((session) => (
              <LogRow
                key={session.id}
                title={CARDIO_TYPE_LABELS[session.type] ?? session.type}
                meta={sessionMeta(session)}
                value={String(session.minutes)}
                unit="min"
                color={
                  (VO2_TYPES as string[]).includes(session.type)
                    ? VO2_BLUE
                    : BLUE
                }
                onDelete={() => handleDelete(session.id)}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheetType && (
          <CardioLogSheet
            key={sheetType}
            initialType={sheetType}
            onClose={() => setSheetType(null)}
            onLogged={() => void load(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function sessionMeta(session: CardioSessionDTO): string {
  const parts = [dayLabel(session.date)];
  if (session.avgHr != null) parts.push(`${session.avgHr} bpm avg`);
  if (session.maxHr != null) parts.push(`${session.maxHr} bpm max`);
  if (session.distanceM != null && session.distanceM > 0) {
    parts.push(distanceLabel(session.distanceM));
  }
  if (session.notes) parts.push(session.notes);
  return parts.join(" · ");
}

const PROTOCOL_STEPS: { label: string; detail: string }[] = [
  { label: "Warm up", detail: "10 min easy, building to a light sweat" },
  {
    label: "4 x 4 min",
    detail: "Hard effort at 85-95% of max heart rate — the last minute should hurt",
  },
  { label: "3 min between", detail: "Active recovery, around 70% of max HR" },
  { label: "Cool down", detail: "5 min easy spin or walk" },
];

function NorwegianProtocolCard({ onLog }: { onLog: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={CARD_CLASS}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between gap-3 rounded-[14px] p-4 text-left"
      >
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-text-primary">
            Norwegian 4x4
          </div>
          <div className="mt-0.5 text-[12px] text-text-secondary">
            The most reliable VO2 max protocol — once a week, about 40 min
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-text-tertiary"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-app px-4 pb-4 pt-3">
              <ol className="flex flex-col gap-2.5">
                {PROTOCOL_STEPS.map((step, i) => (
                  <li key={step.label} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold"
                      style={{ background: BLUE_LIGHT, color: BLUE }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-text-primary">
                        {step.label}
                      </div>
                      <div className="text-[12px] leading-relaxed text-text-secondary">
                        {step.detail}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={onLog}
                className="focus-ring mt-4 w-full rounded-[10px] border border-app bg-card-surface py-2 text-[13px] font-semibold text-text-primary transition-colors hover:bg-surface"
              >
                Log a 4x4 session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
