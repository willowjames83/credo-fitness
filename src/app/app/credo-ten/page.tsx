"use client";

// The Credo Ten — functional fitness benchmarks, grouped by pillar,
// fetched from /api/benchmarks with a bottom-sheet flow to log results.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/shared/section-header";
import { PercentileBar } from "@/components/shared/percentile-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendIndicator } from "@/components/shared/trend-indicator";
import { PILLARS } from "@/lib/constants";
import type { BenchmarkDTO } from "@/lib/types";
import {
  LogBenchmarkSheet,
  type LoggedBenchmarkResult,
} from "@/components/scores/log-benchmark-sheet";
import {
  fetchData,
  formatMmss,
  ordinal,
  relativeDate,
  UnauthorizedError,
} from "@/components/scores/utils";

function pillarColor(pillar: string): string {
  if (pillar in PILLARS) return PILLARS[pillar as keyof typeof PILLARS].color;
  return "var(--color-credo)";
}

// The 1000m Row is the only inversed seconds test — display as m:ss.
function isRowTime(b: BenchmarkDTO): boolean {
  return b.isInversed && b.unit === "sec";
}

function displayValue(b: BenchmarkDTO, value: number): string {
  if (isRowTime(b)) return formatMmss(value);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function displayUnit(b: BenchmarkDTO): string {
  if (isRowTime(b)) return ""; // "3:18" needs no unit
  if (b.unit === "lbs") return "lb";
  return b.unit;
}

function deltaLabel(b: BenchmarkDTO, diff: number): string {
  const abs = Math.abs(diff);
  const absStr = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  if (b.unit === "sec") return `${absStr} sec`;
  if (b.unit.startsWith("lbs")) return `${absStr} lb`;
  if (b.unit === "reps") return `${absStr} reps`;
  if (b.unit.includes("watt")) return `${absStr} W`;
  return `${absStr} ${b.unit}`;
}

interface PillarGroup {
  key: string;
  label: string;
  color: string;
  items: BenchmarkDTO[];
}

export default function CredoTenPage() {
  const router = useRouter();
  const [benchmarks, setBenchmarks] = useState<BenchmarkDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Flip after first paint so percentile bars animate from 0 on mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchData<{ benchmarks: BenchmarkDTO[] }>(
        "/api/benchmarks",
      );
      setBenchmarks(data.benchmarks ?? []);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        router.replace("/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  // Optimistic card update from the log sheet.
  const handleLogged = useCallback((result: LoggedBenchmarkResult) => {
    setBenchmarks((prev) =>
      prev
        ? prev.map((b) =>
            b.name === result.name
              ? {
                  ...b,
                  previous: b.latest ? { value: b.latest.value } : b.previous,
                  latest: {
                    value: result.value,
                    percentile: result.percentile,
                    testedAt: result.testedAt,
                  },
                }
              : b,
          )
        : prev,
    );
  }, []);

  const groups = useMemo<PillarGroup[]>(() => {
    if (!benchmarks) return [];
    const known: PillarGroup[] = Object.values(PILLARS)
      .map((p) => ({
        key: p.key as string,
        label: p.label,
        color: p.color,
        items: benchmarks.filter((b) => b.pillar === p.key),
      }))
      .filter((g) => g.items.length > 0);
    const other = benchmarks.filter((b) => !(b.pillar in PILLARS));
    if (other.length > 0) {
      known.push({ key: "other", label: "Other", color: "var(--color-credo)", items: other });
    }
    return known;
  }, [benchmarks]);

  const activeBenchmark =
    benchmarks?.find((b) => b.name === activeName) ?? null;

  if (loading) return <CredoTenSkeleton />;

  if (error || !benchmarks) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 pb-10">
        <div className="w-full rounded-[14px] border border-app bg-card-surface p-6 text-center">
          <div className="text-[14px] font-semibold text-text-primary">
            Couldn&apos;t load the Credo Ten
          </div>
          <div className="mt-1 text-[13px] text-text-secondary">
            {error ?? "Something went wrong"}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="focus-ring mt-4 rounded-[10px] bg-credo px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-credo/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const testedCount = benchmarks.filter((b) => b.latest !== null).length;
  const total = benchmarks.length;

  return (
    <div className="flex-1 px-5 pb-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="pb-5">
        <h1 className="text-[18px] font-semibold text-text-primary">
          The Credo Ten
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Ten functional benchmarks that anchor your scores to real-world
          strength, stability, and engine.
        </p>
        {total > 0 && (
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex-1">
              <PercentileBar
                value={mounted ? (testedCount / total) * 100 : 0}
                color="var(--color-credo)"
              />
            </div>
            <span className="shrink-0 font-mono text-[12px] font-semibold text-text-secondary">
              {testedCount} of {total} tested
            </span>
          </div>
        )}
      </div>

      {/* ── Pillar groups ────────────────────────────────── */}
      {groups.map((group, gi) => (
        <div key={group.key} className={gi === 0 ? "" : "mt-6"}>
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: group.color }}
            />
            <SectionHeader>{group.label}</SectionHeader>
          </div>
          <div className="flex flex-col gap-2.5">
            {group.items.map((b) => (
              <BenchmarkCard
                key={b.name}
                benchmark={b}
                color={group.color}
                mounted={mounted}
                onLog={() => setActiveName(b.name)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── Log sheet ────────────────────────────────────── */}
      <AnimatePresence>
        {activeBenchmark && (
          <LogBenchmarkSheet
            key={activeBenchmark.name}
            benchmark={activeBenchmark}
            color={pillarColor(activeBenchmark.pillar)}
            onClose={() => setActiveName(null)}
            onLogged={handleLogged}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface BenchmarkCardProps {
  benchmark: BenchmarkDTO;
  color: string;
  mounted: boolean;
  onLog: () => void;
}

function BenchmarkCard({ benchmark: b, color, mounted, onLog }: BenchmarkCardProps) {
  const latest = b.latest;
  const diff =
    latest && b.previous !== null ? latest.value - b.previous.value : null;
  const unit = displayUnit(b);

  return (
    <div className="rounded-[14px] border border-app bg-card-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-text-primary">
            {b.name}
          </div>
          <div className="mt-0.5 text-[11px] text-text-tertiary">
            {latest ? `Tested ${relativeDate(latest.testedAt)}` : "Never tested"}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {latest ? (
            <>
              <div className="font-mono text-[20px] font-semibold leading-tight text-text-primary">
                {displayValue(b, latest.value)}
                {unit && (
                  <span className="ml-1 text-[12px] font-normal text-text-secondary">
                    {unit}
                  </span>
                )}
              </div>
              {diff !== null && diff !== 0 && (
                <TrendIndicator
                  delta={deltaLabel(b, diff)}
                  direction={diff > 0 ? "up" : "down"}
                  // For inversed tests (1000m Row) a decrease is the win.
                  positive={b.isInversed ? diff < 0 : diff > 0}
                />
              )}
            </>
          ) : (
            <span className="font-mono text-[20px] font-semibold text-text-tertiary">
              —
            </span>
          )}
        </div>
      </div>

      {latest && latest.percentile !== null && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1">
            <PercentileBar
              value={mounted ? latest.percentile : 0}
              color={color}
            />
          </div>
          <span className="w-9 shrink-0 text-right text-[11px] font-medium text-text-secondary">
            {ordinal(latest.percentile)}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onLog}
        className="focus-ring mt-3 w-full rounded-[10px] border border-app bg-card-surface py-2 text-[13px] font-semibold text-text-primary transition-colors hover:bg-surface"
      >
        Log result
      </button>
    </div>
  );
}

function CredoTenSkeleton() {
  return (
    <div className="flex-1 px-5 pb-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-3/4" />
      <div className="mt-6 flex flex-col gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
