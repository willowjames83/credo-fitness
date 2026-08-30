"use client";

// Page chrome shared by the three pillar pages: header, card shell,
// labelled progress bar, skeleton, and the inline error + retry block.

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const CARD_CLASS = "rounded-[14px] border border-app bg-card-surface";

interface PillarHeaderProps {
  title: string;
  subtitle: string;
  color: string;
}

export function PillarHeader({ title, subtitle, color }: PillarHeaderProps) {
  return (
    <div className="pb-5">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <h1 className="text-[18px] font-semibold text-text-primary">{title}</h1>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
        {subtitle}
      </p>
    </div>
  );
}

interface PillarCardProps {
  children: ReactNode;
  className?: string;
}

export function PillarCard({ children, className }: PillarCardProps) {
  return (
    <div className={`${CARD_CLASS} p-4${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
      {children}
    </span>
  );
}

interface ProgressBarProps {
  /** 0-1. Values above 1 are clamped; the bar never overflows. */
  fraction: number;
  color: string;
  height?: number;
  /** Animate from empty on mount by passing false until after first paint. */
  active?: boolean;
}

export function ProgressBar({
  fraction,
  color,
  height = 8,
  active = true,
}: ProgressBarProps) {
  const pct = active ? Math.max(0, Math.min(1, fraction)) * 100 : 0;
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-surface-elevated"
      style={{ height }}
      role="presentation"
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

interface ErrorRetryProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorRetry({ title, message, onRetry }: ErrorRetryProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-5 pb-10">
      <div className={`${CARD_CLASS} w-full p-6 text-center`}>
        <div className="text-[14px] font-semibold text-text-primary">{title}</div>
        <div className="mt-1 text-[13px] text-text-secondary">{message}</div>
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-4 rounded-[10px] bg-credo px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-credo/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] border border-danger/25 bg-danger-light px-3 py-2.5">
      <span className="text-[12px] font-medium text-danger">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring shrink-0 rounded-sm text-[12px] font-semibold text-danger underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}

interface PillarSkeletonProps {
  /** Heights of the placeholder blocks under the header, in px. */
  blocks?: number[];
}

export function PillarSkeleton({
  blocks = [180, 96, 148, 220],
}: PillarSkeletonProps) {
  return (
    <div className="flex-1 px-5 pb-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
      <div className="mt-6 flex flex-col gap-3">
        {blocks.map((h, i) => (
          <Skeleton key={i} className="rounded-[14px]" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  children: ReactNode;
}

export function EmptyState({ children }: EmptyStateProps) {
  return (
    <div className={`${CARD_CLASS} px-4 py-7 text-center`}>
      <p className="text-[13px] leading-relaxed text-text-tertiary">{children}</p>
    </div>
  );
}
