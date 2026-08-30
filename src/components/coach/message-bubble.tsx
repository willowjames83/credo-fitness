"use client";

import { formatTime } from "./api";

const COACH_LABEL = "Credo Coach";

export function CoachLabel() {
  return (
    <div className="mb-1 pl-0.5 text-[11px] font-semibold uppercase tracking-[1.2px] text-[#9E9EA3]">
      {COACH_LABEL}
    </div>
  );
}

/** Preserves the author's line breaks without allowing any markup through. */
function Body({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap text-[14px] leading-[1.55]">
      {content}
    </div>
  );
}

export function UserBubble({
  content,
  createdAt,
  pending = false,
}: {
  content: string;
  createdAt?: string;
  pending?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%]">
        <div
          className={`rounded-[14px] border border-[#F3C9B6] bg-[#FFF0E9] px-3.5 py-2.5 text-[#1A1A1E] ${
            pending ? "opacity-70" : ""
          }`}
        >
          <Body content={content} />
        </div>
        {createdAt ? (
          <div className="mt-1 pr-1 text-right text-[11px] text-[#9E9EA3]">
            {formatTime(createdAt)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CoachBubble({
  content,
  createdAt,
}: {
  content: string;
  createdAt?: string;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%]">
        <CoachLabel />
        <div className="rounded-[14px] border border-[#E5E5E8] bg-white px-3.5 py-2.5 text-[#1A1A1E]">
          <Body content={content} />
        </div>
        {createdAt ? (
          <div className="mt-1 pl-1 text-[11px] text-[#9E9EA3]">
            {formatTime(createdAt)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div>
        <CoachLabel />
        <div
          className="flex items-center gap-1.5 rounded-[14px] border border-[#E5E5E8] bg-white px-4 py-3.5"
          role="status"
          aria-label="Credo Coach is typing"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9E9EA3]"
              style={{ animationDelay: `${i * 160}ms`, animationDuration: "1s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorBubble({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%]">
        <CoachLabel />
        <div className="rounded-[14px] border border-[#EBC2C2] bg-[#FDF4F4] px-3.5 py-3">
          <div className="text-[14px] leading-[1.5] text-[#8C3232]">{message}</div>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="mt-2.5 rounded-[10px] border border-[#E5E5E8] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1A1A1E] transition-colors hover:border-[#C9C9CE] disabled:opacity-50"
          >
            {retrying ? "Retrying…" : "Retry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LimitNotice({ message }: { message: string }) {
  return (
    <div className="rounded-[14px] border border-[#E5E5E8] bg-[#F7F7F8] px-4 py-3 text-center">
      <div className="text-[13px] font-semibold text-[#1A1A1E]">
        Daily coach limit reached
      </div>
      <div className="mt-1 text-[13px] leading-[1.5] text-[#6B6B73]">{message}</div>
    </div>
  );
}
