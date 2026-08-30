"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "./api";

const MAX_HEIGHT = 132; // ~5 lines before the textarea starts scrolling

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
  sending,
  placeholder = "Ask your coach anything",
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  disabled: boolean;
  sending: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const canSend = !disabled && !sending && value.trim().length > 0;
  const remaining = MAX_MESSAGE_LENGTH - value.length;

  return (
    <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 -mx-5 border-t border-app bg-card-surface px-5 pb-3 pt-3 lg:bottom-0">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={placeholder}
          aria-label="Message Credo Coach"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          className="max-h-[132px] flex-1 resize-none rounded-[14px] border border-app bg-surface px-3.5 py-2.5 text-[14px] leading-[1.45] text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-text-tertiary focus:bg-card-surface disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          className="focus-ring flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-credo text-white transition-colors hover:bg-credo/90 disabled:bg-surface-elevated disabled:text-text-tertiary"
        >
          <ArrowUp size={20} strokeWidth={2.4} />
        </button>
      </div>
      {remaining <= 120 ? (
        <div className="mt-1.5 text-right text-[11px] text-text-tertiary">
          {remaining} characters left
        </div>
      ) : null}
    </div>
  );
}
