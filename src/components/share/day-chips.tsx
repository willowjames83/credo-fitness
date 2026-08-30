// Pure presentational row of day chips for a split's week — used by both the
// splits management page and the public share page. No client directive
// needed; safe to render from a server component.

import type { SplitDay } from "@/lib/types";
import { dayShortName } from "./labels";

export function DayChips({ days }: { days: SplitDay[] }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {days.map((d) => (
        <span
          key={d.dayNumber}
          title={d.isRestDay ? "Rest" : d.label}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            d.isRestDay
              ? "border-[var(--shell-border)] text-[var(--shell-text-tertiary)]"
              : "border-[var(--shell-accent)]/30 bg-[var(--shell-accent-light)] text-[var(--shell-accent)]"
          }`}
        >
          {dayShortName(d.dayNumber)}
        </span>
      ))}
    </div>
  );
}
