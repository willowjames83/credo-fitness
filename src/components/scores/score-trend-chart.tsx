"use client";

// Inline SVG trend chart for weekly score snapshots. No chart libraries —
// a single responsive viewBox with the Credo line/area plus togglable,
// pillar-colored overlay lines.

import { useMemo, useState } from "react";
import { PILLARS, type PillarKey } from "@/lib/constants";

export interface ScoreSnapshot {
  weekNumber: number;
  credoScore: number;
  strengthScore: number;
  stabilityScore: number;
  cardioScore: number;
  nutritionScore: number;
  date: string;
}

const PILLAR_FIELDS = {
  strength: "strengthScore",
  stability: "stabilityScore",
  cardio: "cardioScore",
  nutrition: "nutritionScore",
} as const satisfies Record<PillarKey, keyof ScoreSnapshot>;

type PillarField = (typeof PILLAR_FIELDS)[PillarKey];

// Themed (light/dark-aware) CSS var equivalents of PILLARS[key].color/.bg,
// which are fixed light-mode hex and unsafe to paint dark surfaces with.
const PILLAR_VAR: Record<PillarKey, { color: string; light: string }> = {
  strength: { color: "var(--color-credo)", light: "var(--color-credo-light)" },
  stability: { color: "var(--color-teal)", light: "var(--color-teal-light)" },
  cardio: { color: "var(--color-cardio)", light: "var(--color-cardio-light)" },
  nutrition: { color: "var(--color-nutrition)", light: "var(--color-nutrition-light)" },
};

const W = 640;
const H = 224;
const PAD = { top: 14, right: 16, bottom: 28, left: 34 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

interface ScoreTrendChartProps {
  snapshots: ScoreSnapshot[];
}

export function ScoreTrendChart({ snapshots }: ScoreTrendChartProps) {
  const [overlays, setOverlays] = useState<PillarKey[]>([]);

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => a.weekNumber - b.weekNumber),
    [snapshots],
  );

  if (sorted.length < 2) {
    return (
      <div className="rounded-[14px] border border-app bg-card-surface px-5 py-10 text-center">
        <div className="text-[14px] font-semibold text-text-primary">
          Not enough history yet
        </div>
        <div className="mt-1 text-[13px] text-text-secondary">
          Keep training — trends appear after week 2.
        </div>
      </div>
    );
  }

  const minWeek = sorted[0].weekNumber;
  const maxWeek = sorted[sorted.length - 1].weekNumber;
  const span = Math.max(1, maxWeek - minWeek);
  const x = (week: number) => PAD.left + ((week - minWeek) / span) * PLOT_W;
  const y = (v: number) => PAD.top + (1 - clamp(v, 0, 100) / 100) * PLOT_H;

  const linePath = (field: "credoScore" | PillarField) =>
    sorted
      .map(
        (s, i) =>
          `${i === 0 ? "M" : "L"}${x(s.weekNumber).toFixed(1)},${y(s[field]).toFixed(1)}`,
      )
      .join(" ");

  const credoLine = linePath("credoScore");
  const baseline = PAD.top + PLOT_H;
  const areaPath = `${credoLine} L${x(maxWeek).toFixed(1)},${baseline} L${x(minWeek).toFixed(1)},${baseline} Z`;
  const last = sorted[sorted.length - 1];
  const labelStep = Math.max(1, Math.ceil(sorted.length / 6));

  function toggle(key: PillarKey) {
    setOverlays((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  return (
    <div className="rounded-[14px] border border-app bg-card-surface p-4">
      {/* Series toggles */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-credo-light px-2.5 py-1 text-[11px] font-semibold text-credo">
          <span className="h-1.5 w-1.5 rounded-full bg-credo" />
          Credo
        </span>
        {(Object.keys(PILLARS) as PillarKey[]).map((key) => {
          const pillar = PILLARS[key];
          const vars = PILLAR_VAR[key];
          const active = overlays.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={active}
              className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                active
                  ? "border-transparent"
                  : "border-app bg-card-surface text-text-tertiary"
              }`}
              style={
                active ? { background: vars.light, color: vars.color } : undefined
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: active ? vars.color : "var(--text-tertiary)" }}
              />
              {pillar.label}
            </button>
          );
        })}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label="Credo Score trend by week"
      >
        <defs>
          <linearGradient id="credo-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-credo)" stopOpacity={0.13} />
            <stop offset="100%" stopColor="var(--color-credo)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Light horizontal grid */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(g)}
              y2={y(g)}
              stroke="var(--surface-elevated)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(g) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="var(--text-tertiary)"
            >
              {g}
            </text>
          </g>
        ))}

        {/* Credo area fill */}
        <path d={areaPath} fill="url(#credo-trend-fill)" />

        {/* Pillar overlays (dashed to stay subordinate to the Credo line) */}
        {overlays.map((key) => (
          <path
            key={key}
            d={linePath(PILLAR_FIELDS[key])}
            fill="none"
            stroke={PILLAR_VAR[key].color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
            opacity={0.9}
          />
        ))}

        {/* Credo line + endpoint */}
        <path
          d={credoLine}
          fill="none"
          stroke="var(--color-credo)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={x(last.weekNumber)}
          cy={y(last.credoScore)}
          r={4}
          fill="var(--color-credo)"
          stroke="var(--card-bg)"
          strokeWidth={1.5}
        />

        {/* Sparse week labels */}
        {sorted.map((s, i) => {
          const isLast = i === sorted.length - 1;
          if (!isLast && (i % labelStep !== 0 || sorted.length - 1 - i < labelStep / 2)) {
            return null;
          }
          return (
            <text
              key={s.weekNumber}
              x={x(s.weekNumber)}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text-tertiary)"
            >
              W{s.weekNumber}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
