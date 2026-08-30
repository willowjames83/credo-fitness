"use client";

import { formatTime } from "./api";

const COACH_LABEL = "Credo Coach";

export function CoachLabel() {
  return (
    <div className="mb-1 pl-0.5 text-[11px] font-semibold uppercase tracking-[1.2px] text-text-tertiary">
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
          className={`rounded-[14px] border border-credo/30 bg-credo-light px-3.5 py-2.5 text-text-primary ${
            pending ? "opacity-70" : ""
          }`}
        >
          <Body content={content} />
        </div>
        {createdAt ? (
          <div className="mt-1 pr-1 text-right text-[11px] text-text-tertiary">
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
        <div className="rounded-[14px] border border-app bg-card-surface px-3.5 py-2.5 text-text-primary">
          <Body content={content} />
        </div>
        {createdAt ? (
          <div className="mt-1 pl-1 text-[11px] text-text-tertiary">
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
          className="flex items-center gap-1.5 rounded-[14px] border border-app bg-card-surface px-4 py-3.5"
          role="status"
          aria-label="Credo Coach is typing"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary"
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
        <div className="rounded-[14px] border border-danger/25 bg-danger-light px-3.5 py-3">
          <div className="text-[14px] leading-[1.5] text-danger">{message}</div>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="focus-ring mt-2.5 rounded-[10px] border border-app bg-card-surface px-3 py-1.5 text-[13px] font-semibold text-text-primary transition-colors hover:border-text-tertiary disabled:opacity-50"
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
    <div className="rounded-[14px] border border-app bg-surface px-4 py-3 text-center">
      <div className="text-[13px] font-semibold text-text-primary">
        Daily coach limit reached
      </div>
      <div className="mt-1 text-[13px] leading-[1.5] text-text-secondary">{message}</div>
    </div>
  );
}
