"use client";

// Small multi-select chip row, used for per-day muscle group selection in
// the custom split editor.

export function ChipMultiSelect<T extends string>({
  options,
  selected,
  onToggle,
  ariaLabel,
  disabled = false,
}: {
  options: readonly { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onToggle(option.value)}
            className={`h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? "border-[var(--shell-accent)] bg-[var(--shell-accent-light)] text-[var(--shell-accent)]"
                : "border-[var(--shell-border)] bg-white text-[var(--shell-text-secondary)] hover:border-[var(--shell-text-tertiary)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
