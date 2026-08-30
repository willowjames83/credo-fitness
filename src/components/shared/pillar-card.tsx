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
      className="cursor-pointer rounded-[14px] border border-app bg-card-surface px-4 py-[14px] transition-all duration-150 hover:shadow-sm"
      style={{ borderLeft: `3px solid ${p.color}` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} color={p.color} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.3px] text-text-primary">
            {p.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[17px] font-semibold text-text-primary">
            {score}
          </span>
          <span className="text-[12px] text-text-secondary">{label}</span>
        </div>
      </div>
      <div className="flex flex-col gap-[3px]">
        {metrics.map((m, i) => (
          <span key={i} className="text-[13px] text-text-secondary">
            {m}
          </span>
        ))}
      </div>
      {isWeakest && (
        <div className="mt-2 inline-block rounded-md bg-warning-light px-2 py-1">
          <span className="text-[11px] font-medium text-warning">↑ Weakest pillar</span>
        </div>
      )}
    </div>
  );
}
