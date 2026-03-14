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

  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const [offset, setOffset] = useState(animate ? circumference : circumference - (score / 100) * circumference);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!animate) {
      setDisplayed(score);
      setOffset(circumference - (score / 100) * circumference);
      return;
    }

    const duration = 1500; // ms
    const start = performance.now();
    const from = 0;
    const to = score;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplayed(Math.round(current));
      setOffset(circumference - (current / 100) * circumference);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score, animate, circumference]);

  const label = getTierLabel(displayed, domain);

  return (
    <div className="relative flex flex-col items-center" style={{ gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.1)" : "#EEEFF1"}
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
          style={{ fontSize: size * 0.275, color: dark ? "#FFFFFF" : "#1A1A1E" }}
        >
          {displayed}
        </span>
        {showLabel && (
          <span
            className="font-medium"
            style={{ fontSize: 13, color: dark ? "#9E9EA3" : "#6B6B73", letterSpacing: 0.5, marginTop: 2 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
