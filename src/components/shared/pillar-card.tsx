"use client";

import { PILLARS, type PillarKey } from "@/lib/constants";
import { getTierLabel } from "@/lib/scoring";

interface PillarCardProps {
  pillar: PillarKey;
  score: number;
  metrics: string[];
  isWeakest?: boolean;
  onClick?: () => void;
}

export function PillarCard({ pillar, score, metrics, isWeakest, onClick }: PillarCardProps) {
  const p = PILLARS[pillar];
  const Icon = p.icon;
  const label = getTierLabel(score, pillar);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-all duration-150 hover:shadow-sm"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E5E8",
        borderRadius: 14,
        padding: "14px 16px",
        borderLeft: `3px solid ${p.color}`,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Icon size={14} color={p.color} />
          <span
            className="font-semibold uppercase"
            style={{ fontSize: 13, color: "#1A1A1E", letterSpacing: 0.3 }}
          >
            {p.label}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="font-mono font-semibold" style={{ fontSize: 17, color: "#1A1A1E" }}>
            {score}
          </span>
          <span style={{ fontSize: 12, color: "#6B6B73" }}>{label}</span>
        </div>
      </div>
      <div className="flex flex-col" style={{ gap: 3 }}>
        {metrics.map((m, i) => (
          <span key={i} style={{ fontSize: 13, color: "#6B6B73" }}>
            {m}
          </span>
        ))}
      </div>
      {isWeakest && (
        <div
          className="inline-block"
          style={{ marginTop: 8, padding: "4px 8px", background: "#FFF3E0", borderRadius: 6 }}
        >
          <span style={{ fontSize: 11, fontWeight: 500, color: "#C47A1A" }}>↑ Weakest pillar</span>
        </div>
      )}
    </div>
  );
}
