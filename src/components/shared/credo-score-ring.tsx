"use client";

import { useEffect, useState, useRef } from "react";
import { getTierLabel } from "@/lib/scoring";
import type { ScoreDomain } from "@/lib/constants";

interface CredoScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  animate?: boolean;
  domain?: ScoreDomain;
  showLabel?: boolean;
  dark?: boolean;
}

export function CredoScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
  color = "#E8501A",
  animate = true,
  domain = "credo",
  showLabel = true,
  dark = false,
}: CredoScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Raw animated value (0..score). Only used while animating; when
  // animate is false the displayed value is derived directly from props,
  // so no synchronous setState in the effect is needed.
  const [animatedValue, setAnimatedValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!animate) return;

    const duration = 1500; // ms
    const start = performance.now();
    const from = 0;
    const to = score;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedValue(from + (to - from) * eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score, animate]);

  const current = animate ? animatedValue : score;
  const displayed = Math.round(current);
  const offset = circumference - (current / 100) * circumference;
  const label = getTierLabel(displayed, domain);

  return (
    <div className="relative flex flex-col items-center" style={{ gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          style={{ stroke: dark ? "rgba(255,255,255,0.1)" : "var(--surface-elevated)" }}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: animate ? "none" : "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-mono font-bold leading-none"
          style={{ fontSize: size * 0.275, color: dark ? "#FFFFFF" : "var(--text-primary)" }}
        >
          {displayed}
        </span>
        {showLabel && (
          <span
            className="font-medium"
            style={{ fontSize: 13, color: dark ? "#9E9EA3" : "var(--text-secondary)", letterSpacing: 0.5, marginTop: 2 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
