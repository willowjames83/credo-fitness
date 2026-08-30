"use client";

// Eight-week bar chart, inline SVG, no charting library.
//
// Bars are positioned with percentage x/width against a fixed pixel height, so
// the chart fills its container at any width while the axis labels stay at
// their true type size (a viewBox would scale them).

import { shortDate } from "./utils";

export interface WeekBarSegment {
  value: number;
  color: string;
  label: string;
}

export interface WeekBarDatum {
  weekStart: string; // ISO
  segments: WeekBarSegment[];
}

interface WeekBarChartProps {
  weeks: WeekBarDatum[];
  /** Dashed reference line, in the same unit as the values. */
  target?: number;
  /** Unit suffix for the peak-value axis label, e.g. "min". */
  unit?: string;
  height?: number;
  /** Pass false until after first paint so bars grow from the baseline. */
  active?: boolean;
}

export function WeekBarChart({
  weeks,
  target,
  unit = "min",
  height = 132,
  active = true,
}: WeekBarChartProps) {
  const labelBand = 18;
  const plot = height - labelBand;

  const totals = weeks.map((w) =>
    w.segments.reduce((sum, s) => sum + s.value, 0),
  );
  const peak = Math.max(...totals, target ?? 0, 1);
  // Headroom so the tallest bar never touches the top of the plot.
  const scaleMax = peak * 1.15;
  const n = Math.max(weeks.length, 1);
  const slot = 100 / n;
  const barWidth = slot * 0.56;
  const gutter = (slot - barWidth) / 2;

  const targetY =
    target != null && target > 0 ? plot - (target / scaleMax) * plot : null;

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={height}
        role="img"
        aria-label={`Weekly total by week, peak ${Math.round(peak)} ${unit}`}
      >
        {/* Baseline */}
        <line
          x1="0"
          y1={plot}
          x2="100%"
          y2={plot}
          stroke="var(--app-border)"
          strokeWidth={1}
        />

        {targetY != null && (
          <line
            x1="0"
            y1={targetY}
            x2="100%"
            y2={targetY}
            stroke="var(--text-tertiary)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {weeks.map((week, i) => {
          const x = i * slot + gutter;
          const total = totals[i];
          let cursor = plot;

          return (
            <g key={week.weekStart}>
              {total === 0 && (
                <rect
                  x={`${x}%`}
                  y={plot - 3}
                  width={`${barWidth}%`}
                  height={3}
                  rx={1.5}
                  fill="var(--surface-elevated)"
                />
              )}
              {week.segments.map((segment, si) => {
                if (segment.value <= 0) return null;
                const h = active ? (segment.value / scaleMax) * plot : 0;
                cursor -= h;
                const isTop = si === week.segments.length - 1 || total === segment.value;
                return (
                  <rect
                    key={segment.label}
                    x={`${x}%`}
                    y={cursor}
                    width={`${barWidth}%`}
                    height={Math.max(h, h > 0 ? 2 : 0)}
                    rx={isTop ? 3 : 0}
                    fill={segment.color}
                    style={{
                      transition:
                        "y 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <title>{`${shortDate(week.weekStart)} · ${segment.label} ${Math.round(segment.value)} ${unit}`}</title>
                  </rect>
                );
              })}
              <text
                x={`${x + barWidth / 2}%`}
                y={height - 5}
                textAnchor="middle"
                fontSize={9}
                fill={i === weeks.length - 1 ? "var(--text-secondary)" : "var(--text-tertiary)"}
                fontWeight={i === weeks.length - 1 ? 600 : 400}
              >
                {shortDate(week.weekStart)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface ChartLegendProps {
  items: { label: string; color: string }[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-[2px]"
            style={{ background: item.color }}
          />
          <span className="text-[11px] text-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
