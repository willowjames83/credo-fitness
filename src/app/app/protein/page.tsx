"use client";

// Nutrition pillar: today's protein against the onboarding-set target, an
// adaptive pacing line, quick-add from the food database, and the 7-day
// consistency row that the nutrition score reads.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { FoodItem } from "@/services/data/food-database";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  type MealType,
  type NutritionTodayDTO,
  type NutritionWeekDTO,
  type ProteinEntryDTO,
} from "@/components/pillars/dto";
import {
  CARD_CLASS,
  EmptyState,
  ErrorRetry,
  InlineError,
  PillarHeader,
  PillarSkeleton,
  SectionLabel,
} from "@/components/pillars/pillar-chrome";
import { ProgressRing } from "@/components/pillars/progress-ring";
import { ProteinQuickAdd } from "@/components/pillars/protein-quick-add";
import { ProteinLogSheet } from "@/components/pillars/protein-log-sheet";
import { LogRow } from "@/components/pillars/log-row";
import {
  apiDelete,
  apiGet,
  redirectToLogin,
  timeLabel,
  UnauthorizedError,
  weekdayInitial,
} from "@/components/pillars/utils";

const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#F3EEFF";

type SheetState =
  | { mode: "closed" }
  | { mode: "manual" }
  | { mode: "food"; food: FoodItem };

export default function ProteinPage() {
  const [today, setToday] = useState<NutritionTodayDTO | null>(null);
  const [week, setWeek] = useState<NutritionWeekDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      const [todayData, weekData] = await Promise.all([
        apiGet<NutritionTodayDTO>("/api/nutrition/today"),
        apiGet<NutritionWeekDTO>("/api/nutrition/week"),
      ]);
      setToday(todayData);
      setWeek(weekData);
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
      const previous = today;
      setToday((prev) =>
        prev
          ? {
              ...prev,
              entries: prev.entries.filter((e) => e.id !== id),
            }
          : prev,
      );
      try {
        await apiDelete<{ deleted: boolean }>(`/api/nutrition/log/${id}`);
        await load(false);
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          redirectToLogin();
          return;
        }
        setToday(previous);
        setActionError(
          e instanceof Error ? e.message : "Couldn't delete that entry",
        );
      }
    },
    [today, load],
  );

  const grouped = useMemo(() => {
    const entries = today?.entries ?? [];
    const groups: { key: string; label: string; items: ProteinEntryDTO[] }[] =
      MEAL_TYPES.map((meal) => ({
        key: meal,
        label: MEAL_TYPE_LABELS[meal],
        items: entries.filter((e) => e.mealType === meal),
      }));
    const unlabelled = entries.filter(
      (e) => e.mealType == null || !MEAL_TYPES.includes(e.mealType as MealType),
    );
    if (unlabelled.length > 0) {
      groups.push({ key: "other", label: "Other", items: unlabelled });
    }
    return groups.filter((g) => g.items.length > 0);
  }, [today]);

  if (loading) return <PillarSkeleton blocks={[220, 96, 210, 148, 120]} />;

  if (error || !today || !week) {
    return (
      <ErrorRetry
        title="Couldn't load today's protein"
        message={error ?? "Something went wrong"}
        onRetry={() => void load()}
      />
    );
  }

  const { targetG, totalG, remainingG } = today;
  const hasTarget = targetG != null && targetG > 0;
  const fraction = hasTarget ? totalG / targetG : 0;
  const hit = hasTarget && totalG >= targetG;

  return (
    <div className="flex-1 px-5 pb-6">
      <PillarHeader
        title="Nutrition"
        subtitle="Protein is the lever. Hit the number most days and the rest of the plan works."
        color={PURPLE}
      />

      {/* ── Today's ring ─────────────────────────────────── */}
      <div className={`${CARD_CLASS} p-5`}>
        <div className="flex flex-col items-center">
          <ProgressRing
            fraction={fraction}
            color={hit ? "#2D8A4E" : PURPLE}
            active={mounted}
            label={
              hasTarget
                ? `${totalG} of ${targetG} grams of protein today`
                : `${totalG} grams of protein today`
            }
          >
            <span className="font-mono text-[36px] font-bold leading-none text-[#1A1A1E]">
              {totalG}
            </span>
            <span className="mt-1 text-[12px] text-[#6B6B73]">
              {hasTarget ? `of ${targetG}g` : "grams today"}
            </span>
          </ProgressRing>
        </div>

        {hasTarget ? (
          <>
            <motion.p
              key={today.pacing}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-[10px] px-3.5 py-3 text-center text-[13px] leading-relaxed text-[#1A1A1E]"
              style={{ background: PURPLE_LIGHT }}
            >
              {today.pacing}
            </motion.p>
            {remainingG != null && remainingG > 0 && (
              <p className="mt-2 text-center text-[12px] text-[#9E9EA3]">
                <span className="font-mono font-semibold text-[#6B6B73]">
                  {remainingG}g
                </span>{" "}
                remaining
              </p>
            )}
          </>
        ) : (
          <div className="mt-4 rounded-[10px] border border-[#E5E5E8] bg-[#F7F7F8] px-4 py-3.5 text-center">
            <p className="text-[13px] leading-relaxed text-[#6B6B73]">
              No protein target yet. Onboarding sets it from your bodyweight and
              goal.
            </p>
            <Link
              href="/onboarding"
              className="mt-3 inline-block rounded-[10px] bg-[#E8501A] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
            >
              Complete onboarding
            </Link>
          </div>
        )}
      </div>

      {actionError && (
        <InlineError message={actionError} onRetry={() => void load(false)} />
      )}

      {/* ── Quick add ────────────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Quick add</SectionLabel>
        <div className="mt-2.5">
          <ProteinQuickAdd
            onSelect={(food) => setSheet({ mode: "food", food })}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSheet({ mode: "manual" })}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#E8501A] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
      >
        <Plus size={17} />
        Enter manually
      </button>

      {/* ── Today's entries ──────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Today</SectionLabel>
        <div className="mt-2.5">
          {grouped.length === 0 ? (
            <EmptyState>
              Nothing logged today. Quick-add a food above or enter grams
              manually.
            </EmptyState>
          ) : (
            grouped.map((group, gi) => (
              <div key={group.key} className={gi === 0 ? "" : "mt-4"}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold text-[#6B6B73]">
                    {group.label}
                  </span>
                  <span className="font-mono text-[12px] font-semibold text-[#9E9EA3]">
                    {group.items.reduce((sum, e) => sum + e.grams, 0)}g
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.items.map((entry) => (
                    <LogRow
                      key={entry.id}
                      title={entry.label ?? "Protein"}
                      meta={entryMeta(entry)}
                      value={String(entry.grams)}
                      unit="g"
                      color={PURPLE}
                      onDelete={() => handleDelete(entry.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Week row ─────────────────────────────────────── */}
      <div className="mt-6">
        <SectionLabel>Last 7 days</SectionLabel>
        <div className={`${CARD_CLASS} mt-2.5 p-4`}>
          <div className="flex items-end gap-1.5">
            {week.days.map((day, i) => {
              const isToday = i === week.days.length - 1;
              const ratio =
                day.targetG > 0 ? Math.min(1, day.totalG / day.targetG) : 0;
              const height = Math.max(6, Math.round(ratio * 64));
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center">
                  <span className="mb-1 font-mono text-[10px] text-[#9E9EA3]">
                    {day.totalG > 0 ? day.totalG : "—"}
                  </span>
                  <div
                    className="flex w-full items-end justify-center rounded-[6px] bg-[#EEEFF1]"
                    style={{ height: 64 }}
                  >
                    <div
                      className="w-full rounded-[6px]"
                      style={{
                        height: mounted ? height : 6,
                        background: day.hit ? PURPLE : "#D8CFF2",
                        transition:
                          "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />
                  </div>
                  <span
                    className="mt-1.5 text-[11px]"
                    style={{
                      color: isToday ? "#1A1A1E" : "#9E9EA3",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {weekdayInitial(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t border-[#F0F0F2] pt-3 text-[12px] text-[#6B6B73]">
            {streakLine(week.streak, hasTarget)}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sheet.mode !== "closed" && (
          <ProteinLogSheet
            key={sheet.mode === "food" ? sheet.food.id : "manual"}
            food={sheet.mode === "food" ? sheet.food : null}
            onClose={() => setSheet({ mode: "closed" })}
            onLogged={() => void load(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function entryMeta(entry: ProteinEntryDTO): string {
  const parts = [timeLabel(entry.date)];
  if (entry.calories != null) parts.push(`${entry.calories} cal`);
  return parts.join(" · ");
}

function streakLine(streak: number, hasTarget: boolean): string {
  if (!hasTarget) return "Set a target to start tracking your streak.";
  if (streak === 0) {
    return "No streak going. Hit today's target to start one.";
  }
  if (streak === 1) return "1 day at target — keep it going.";
  return `${streak} days in a row at target.`;
}
