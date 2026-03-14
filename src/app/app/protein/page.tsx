"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import {
  mockProteinToday,
  mockProteinWeek,
  mockSavedMeals,
} from "@/data/mock-protein";
import { COLORS } from "@/lib/constants";

export default function ProteinPage() {
  const [current, setCurrent] = useState(mockProteinToday.current);
  const target = mockProteinToday.target;
  const pct = current / target;

  const ringSize = 140;
  const ringStroke = 8;
  const radius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = pct >= 1 ? COLORS.success : "#7C3AED";

  const quickAddAmounts = [20, 30, 40, 50];

  return (
    <div style={{ padding: "0 20px 20px", flex: 1 }}>
      {/* Protein ring */}
      <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.textTertiary,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Today&apos;s Protein
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg
            width={ringSize}
            height={ringSize}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={COLORS.surfaceElevated}
              strokeWidth={ringStroke}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={ringStroke}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - Math.min(pct, 1))}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: ringSize,
              height: ringSize,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', ui-monospace, monospace",
                fontSize: 32,
                fontWeight: 700,
                color: COLORS.textPrimary,
              }}
            >
              {current}
            </span>
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
              of {target}g
            </span>
          </div>
        </div>
      </div>

      {/* Quick-add buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {quickAddAmounts.map((amount) => (
          <div
            key={amount}
            onClick={() => setCurrent((prev) => prev + amount)}
            style={{
              flex: 1,
              padding: "10px 0",
              background: COLORS.surface,
              borderRadius: 10,
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.textPrimary,
              cursor: "pointer",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            +{amount}g
          </div>
        ))}
      </div>

      {/* This Week */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeader>This Week</SectionHeader>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {mockProteinWeek.map((d, i) => {
          const barBg =
            d.amount === 0
              ? COLORS.surfaceElevated
              : d.hit
              ? COLORS.successLight
              : COLORS.warningLight;
          const textColor = d.hit ? COLORS.success : COLORS.warning;

          return (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  height: 60,
                  background: barBg,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 4,
                  marginBottom: 4,
                }}
              >
                {d.amount > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: textColor,
                    }}
                  >
                    {d.amount}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: d.isToday ? COLORS.accent : COLORS.textTertiary,
                  fontWeight: d.isToday ? 600 : 400,
                }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Saved Meals */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeader>Saved Meals</SectionHeader>
      </div>
      {mockSavedMeals.map((m, i) => (
        <div
          key={i}
          onClick={() => setCurrent((prev) => prev + m.grams)}
          style={{
            padding: "12px 16px",
            background: COLORS.surface,
            borderRadius: 10,
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14, color: COLORS.textPrimary }}>
            {m.name}
          </span>
          <span
            style={{
              fontFamily: "'SF Mono', ui-monospace, monospace",
              fontSize: 14,
              fontWeight: 600,
              color: "#7C3AED",
            }}
          >
            {m.grams}g
          </span>
        </div>
      ))}
    </div>
  );
}
