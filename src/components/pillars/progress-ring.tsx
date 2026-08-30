"use client";

// Donut progress ring (inline SVG) with a centred mono value.

import type { ReactNode } from "react";

interface ProgressRingProps {
  /** 0-1; drawn clamped, so overshoot fills the ring without wrapping. */
  fraction: number;
  color: string;
  size?: number;
  stroke?: number;
  /** Pass false until after first paint so the arc sweeps in on mount. */
  active?: boolean;
  children: ReactNode;
  label?: string;
}

export function ProgressRing({
  fraction,
  color,
  size = 168,
  stroke = 10,
  active = true,
  children,
  label,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = active ? Math.max(0, Math.min(1, fraction)) : 0;

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EEEFF1"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{
            transition: "stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
