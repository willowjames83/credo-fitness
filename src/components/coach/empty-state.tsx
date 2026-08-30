"use client";

import { SUGGESTED_PROMPTS } from "./api";

export function CoachEmptyState({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <div className="rounded-[14px] border border-[#E5E5E8] bg-white p-5">
        <div className="text-[15px] font-semibold text-[#1A1A1E]">
          Your coach knows your training
        </div>
        <div className="mt-1.5 text-[13px] leading-[1.55] text-[#6B6B73]">
          Credo Coach sees your goal, your last four weeks of sessions, your
          scores, benchmarks, and how recovered each muscle group is. Ask about
          form, why today&apos;s session looks the way it does, a stalled lift, or
          what to eat.
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onPick(prompt)}
            className="rounded-[14px] border border-[#E5E5E8] bg-white px-4 py-3 text-left text-[14px] font-medium text-[#1A1A1E] transition-colors hover:border-[#E8501A] hover:text-[#E8501A] disabled:opacity-50 disabled:hover:border-[#E5E5E8] disabled:hover:text-[#1A1A1E]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
