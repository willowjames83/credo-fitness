"use client";

// Small shared form primitives for the onboarding wizard, styled to match
// the login/register auth pages.

import { Check } from "lucide-react";

export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-[26px] leading-tight text-[var(--shell-text-primary)] sm:text-[28px]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--shell-text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[13px] font-medium text-[var(--shell-text-primary)]"
    >
      {children}
    </label>
  );
}

export function NumberInput({
  id,
  value,
  onChange,
  placeholder,
  suffix,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[10px] border border-[var(--shell-border)] bg-card-surface px-3.5 text-[15px] text-[var(--shell-text-primary)] outline-none transition-colors placeholder:text-[var(--shell-text-tertiary)] focus:border-[var(--shell-accent)] focus:ring-2 focus:ring-[var(--shell-accent-light)]"
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] text-[var(--shell-text-tertiary)]">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** A selectable card row with title, description, and selected state. */
export function OptionCard({
  label,
  description,
  selected,
  onSelect,
  badge,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`focus-ring w-full rounded-[12px] border p-4 text-left transition-colors ${
        selected
          ? "border-[var(--shell-accent)] bg-[var(--shell-accent-light)]"
          : "border-[var(--shell-border)] bg-card-surface hover:border-[var(--shell-text-tertiary)]"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-[var(--shell-text-primary)]">
              {label}
            </span>
            {badge && (
              <span className="rounded-full bg-[var(--shell-accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {badge}
              </span>
            )}
          </span>
          {description && (
            <span className="mt-1 block text-[13px] leading-snug text-[var(--shell-text-secondary)]">
              {description}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected
              ? "border-[var(--shell-accent)] bg-[var(--shell-accent)] text-white"
              : "border-[var(--shell-border)] bg-card-surface text-transparent"
          }`}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      </span>
    </button>
  );
}

/** Compact pill selector (session length, days per week). */
export function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
  format,
  ariaLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={`focus-ring h-11 min-w-[52px] rounded-full border px-4 text-[14px] font-semibold transition-colors ${
              selected
                ? "border-[var(--shell-accent)] bg-[var(--shell-accent)] text-white"
                : "border-[var(--shell-border)] bg-card-surface text-[var(--shell-text-primary)] hover:border-[var(--shell-text-tertiary)]"
            }`}
          >
            {format ? format(option) : String(option)}
          </button>
        );
      })}
    </div>
  );
}

/** Two-or-more option segmented control (sex, variety). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1 rounded-[10px] border border-[var(--shell-border)] bg-[var(--shell-surface)] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`focus-ring h-9 rounded-[8px] text-[14px] font-medium transition-colors ${
              selected
                ? "bg-card-surface text-[var(--shell-text-primary)] shadow-[0_1px_2px_rgba(26,26,30,0.08)]"
                : "text-[var(--shell-text-secondary)] hover:text-[var(--shell-text-primary)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label
          htmlFor={id}
          className="text-[14px] font-medium text-[var(--shell-text-primary)]"
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-[12px] text-[var(--shell-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--shell-accent)]" : "bg-[var(--shell-border)]"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card-surface shadow-[0_1px_2px_rgba(26,26,30,0.2)] transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-[10px] border border-[var(--shell-danger)]/25 bg-danger-light px-3.5 py-2.5 text-[13px] text-[var(--shell-danger)]"
    >
      {message}
    </p>
  );
}
