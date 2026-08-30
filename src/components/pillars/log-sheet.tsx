"use client";

// Bottom-sheet scaffold + form primitives shared by the three pillar log
// flows. Mount <BottomSheet> inside an <AnimatePresence> so exits animate.

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  title: string;
  color: string;
  onClose: () => void;
  children: ReactNode;
  subtitle?: string;
}

export function BottomSheet({
  title,
  color,
  onClose,
  children,
  subtitle,
}: BottomSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        className="relative max-h-[92dvh] w-full max-w-[640px] overflow-y-auto rounded-t-[20px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#E5E5E8]" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[16px] font-semibold text-[#1A1A1E]">
                {title}
              </span>
            </div>
            {subtitle && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B6B73]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[#9E9EA3] transition-colors hover:bg-[#F7F7F8] hover:text-[#1A1A1E]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

interface FieldLabelProps {
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
}

export function FieldLabel({ children, htmlFor, optional }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#9E9EA3]"
    >
      {children}
      {optional && (
        <span className="ml-1.5 font-normal normal-case tracking-normal text-[#C0C0C6]">
          optional
        </span>
      )}
    </label>
  );
}

interface NumberFieldProps {
  id: string;
  value: string;
  onChange: (next: string) => void;
  suffix?: string;
  placeholder?: string;
  color: string;
  autoFocus?: boolean;
  ariaLabel: string;
  /** Allow a decimal point (distances); integers only by default. */
  allowDecimal?: boolean;
}

export function NumberField({
  id,
  value,
  onChange,
  suffix,
  placeholder,
  color,
  autoFocus,
  ariaLabel,
  allowDecimal = false,
}: NumberFieldProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-[10px] border border-[#E5E5E8] bg-white px-3 transition-colors focus-within:border-[var(--field-accent)]"
      style={{ ["--field-accent" as string]: color }}
    >
      <input
        id={id}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, ""),
          )
        }
        aria-label={ariaLabel}
        className="w-full bg-transparent py-2.5 font-mono text-[18px] font-semibold text-[#1A1A1E] outline-none placeholder:text-[#C0C0C6]"
      />
      {suffix && (
        <span className="shrink-0 text-[13px] font-medium text-[#9E9EA3]">
          {suffix}
        </span>
      )}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  color: string;
  maxLength?: number;
  ariaLabel: string;
}

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  color,
  maxLength = 80,
  ariaLabel,
}: TextFieldProps) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      style={{ ["--field-accent" as string]: color }}
      className="w-full rounded-[10px] border border-[#E5E5E8] bg-white px-3 py-2.5 text-[14px] text-[#1A1A1E] outline-none transition-colors placeholder:text-[#C0C0C6] focus:border-[var(--field-accent)]"
    />
  );
}

interface ChipGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (next: T) => void;
  color: string;
  ariaLabel: string;
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  color,
  ariaLabel,
}: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className="rounded-[10px] border px-3 py-2 text-[13px] font-medium transition-colors"
            style={
              selected
                ? { borderColor: color, background: color, color: "#FFFFFF" }
                : {
                    borderColor: "#E5E5E8",
                    background: "#FFFFFF",
                    color: "#1A1A1E",
                  }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface SubmitButtonProps {
  disabled: boolean;
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
}

/** Primary CTA — always Credo orange, per the design system. */
export function SubmitButton({
  disabled,
  pending,
  children,
  pendingLabel = "Saving…",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="mt-5 w-full rounded-[12px] bg-[#E8501A] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

interface SheetErrorProps {
  message: string;
}

export function SheetError({ message }: SheetErrorProps) {
  return (
    <div className="mt-3 text-[12px] font-medium text-[#C43B3B]">{message}</div>
  );
}
