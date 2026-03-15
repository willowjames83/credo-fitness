"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { PercentileBar } from "@/components/shared/percentile-bar";
import { mockBenchmarks, mockCompositePercentile } from "@/data/mock-benchmarks";
import { COLORS, PILLARS } from "@/lib/constants";

const pillarColorMap: Record<string, string> = {
  strength: COLORS.accent,
  stability: COLORS.teal,
  cardio: COLORS.cardio,
};

function formatRowTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CredoTenPage() {
  const { value: compositeValue, context } = mockCompositePercentile;
  const suffix =
    compositeValue % 10 === 1 && compositeValue !== 11
      ? "st"
      : compositeValue % 10 === 2 && compositeValue !== 12
      ? "nd"
      : compositeValue % 10 === 3 && compositeValue !== 13
      ? "rd"
      : "th";

  return (
    <div style={{ padding: "0 20px 20px", flex: 1 }}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          The Credo Ten
        </div>
        <div
          style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}
        >
          Your functional fitness benchmarks
        </div>
      </div>

      {/* Composite card */}
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 14,
          padding: 16,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.textTertiary,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Credo Ten Composite
        </div>
        <div
          style={{
            fontFamily: "'SF Mono', ui-monospace, monospace",
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.textPrimary,
          }}
        >
          {compositeValue}
          <span
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: COLORS.textTertiary,
            }}
          >
            {suffix}
          </span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
          percentile for {context}
        </div>
      </div>

      {/* Benchmark cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mockBenchmarks.map((b, i) => {
          const displayValue = b.isInversed ? formatRowTime(b.value) : b.value;
          const deltaColor = b.isInversed ? COLORS.success : COLORS.success;
          const barColor = pillarColorMap[b.pillar] ?? COLORS.accent;

          return (
            <div
              key={i}
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {b.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.textTertiary,
                      marginTop: 2,
                    }}
                  >
                    Last tested: {b.lastTested}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'SF Mono', ui-monospace, monospace",
                      fontSize: 20,
                      fontWeight: 600,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {displayValue}{" "}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {b.unit}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: deltaColor,
                      marginTop: 1,
                    }}
                  >
                    {b.delta}
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ flex: 1 }}>
                  <PercentileBar value={b.percentile} color={barColor} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: COLORS.textSecondary,
                    minWidth: 30,
                  }}
                >
                  {b.percentile}th
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log button */}
      <div
        style={{
          marginTop: 16,
          padding: "14px 0",
          background: COLORS.teal,
          borderRadius: 12,
          textAlign: "center",
          color: "#fff",
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.15s ease",
        }}
      >
        Log Benchmark Test
      </div>
    </div>
  );
}
