"use client";

import { CredoScoreRing } from "@/components/shared/credo-score-ring";
import { PillarCard } from "@/components/shared/pillar-card";
import { SectionHeader } from "@/components/shared/section-header";
import { mockScores } from "@/data/mock-scores";
import { COLORS } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <div style={{ padding: "0 20px 20px", flex: 1 }}>
      {/* Week label + score ring */}
      <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: COLORS.textTertiary,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Week 12
        </div>
        <div style={{ position: "relative", display: "inline-block" }}>
          <CredoScoreRing score={mockScores.credo.score} />
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLORS.success,
            fontWeight: 500,
            marginTop: 8,
          }}
        >
          +{mockScores.credo.delta} from last week
        </div>
      </div>

      {/* This Week section */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeader>This Week</SectionHeader>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PillarCard
          pillar="strength"
          score={mockScores.strength.score}
          metrics={mockScores.strength.metrics}
        />
        <PillarCard
          pillar="stability"
          score={mockScores.stability.score}
          metrics={mockScores.stability.metrics}
          isWeakest={mockScores.stability.isWeakest}
        />
        <PillarCard
          pillar="cardio"
          score={mockScores.cardio.score}
          metrics={mockScores.cardio.metrics}
        />
        <PillarCard
          pillar="nutrition"
          score={mockScores.nutrition.score}
          metrics={mockScores.nutrition.metrics}
        />
      </div>

      {/* Today's Workout card */}
      <div
        style={{
          marginTop: 20,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.textPrimary,
            marginBottom: 8,
          }}
        >
          Today&apos;s Workout
        </div>
        <div
          style={{ fontSize: 14, fontWeight: 500, color: COLORS.textPrimary }}
        >
          Lower Body + Hinge
        </div>
        <div
          style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}
        >
          6 exercises &middot; ~60 min
        </div>
        <div
          style={{ fontSize: 12, color: COLORS.teal, marginTop: 2 }}
        >
          Stability warmup included
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "14px 0",
            background: COLORS.accent,
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
          Start Workout
        </div>
      </div>
    </div>
  );
}
