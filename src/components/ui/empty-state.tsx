import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Optional lucide icon rendered in a themed circle. */
  icon?: LucideIcon;
  /** Short headline, e.g. "No workouts yet". */
  title: string;
  /** Optional supporting sentence. */
  description?: string;
  /** Optional call-to-action (button, link, etc.). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Themed empty / zero-data state: centered icon, title, description, action.
 *
 *   <EmptyState
 *     icon={Dumbbell}
 *     title="No workouts logged"
 *     description="Start training to see your history here."
 *     action={<Button>Start a workout</Button>}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[14px] border border-app bg-card-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description ? (
          <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
