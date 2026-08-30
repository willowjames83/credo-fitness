"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  CoachApiError,
  CoachUnauthorizedError,
  errorMessage,
  getThread,
  sendMessage,
  type CoachMessageDTO,
} from "./api";
import {
  CoachBubble,
  ErrorBubble,
  LimitNotice,
  TypingBubble,
  UserBubble,
} from "./message-bubble";
import { Composer } from "./composer";
import { CoachEmptyState } from "./empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const LIMIT_COPY =
  "You've sent 50 messages to your coach today. The counter resets at midnight UTC — your conversation is saved.";

export function ChatView({
  threadId: initialThreadId,
  title,
  onBack,
  onThreadsChanged,
  onUnauthorized,
}: {
  threadId: string | null;
  title: string;
  /** Provided only when the athlete has more than one conversation. */
  onBack?: () => void;
  onThreadsChanged: () => void;
  onUnauthorized: () => void;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<CoachMessageDTO[]>([]);
  const [loading, setLoading] = useState(initialThreadId !== null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load the thread's history ────────────────────────────────
  const load = useCallback(
    async (id: string) => {
      setLoading(true);
      setLoadError(null);
      try {
        const { messages: loaded } = await getThread(id);
        setMessages(loaded);
      } catch (e) {
        if (e instanceof CoachUnauthorizedError) {
          onUnauthorized();
          return;
        }
        setLoadError(errorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [onUnauthorized],
  );

  useEffect(() => {
    setThreadId(initialThreadId);
    setMessages([]);
    setPending(null);
    setSendError(null);
    setDraft("");
    if (initialThreadId) void load(initialThreadId);
    else setLoading(false);
  }, [initialThreadId, load]);

  // ── Keep the newest message in view ──────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, pending, sending]);

  // ── Send ─────────────────────────────────────────────────────
  const submit = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending) return;

      setPending(trimmed);
      setSendError(null);
      setSending(true);
      try {
        const result = await sendMessage({
          threadId: threadId ?? undefined,
          content: trimmed,
        });
        setMessages((prev) => [...prev, result.message, result.reply]);
        setPending(null);
        setDraft("");
        if (result.threadId !== threadId) setThreadId(result.threadId);
        onThreadsChanged();
      } catch (e) {
        if (e instanceof CoachUnauthorizedError) {
          onUnauthorized();
          return;
        }
        if (e instanceof CoachApiError && e.status === 429) {
          // Nothing was persisted — hand the text back to the composer.
          setLimitReached(true);
          setPending(null);
          setDraft(trimmed);
          return;
        }
        setSendError(errorMessage(e));
      } finally {
        setSending(false);
      }
    },
    [onThreadsChanged, onUnauthorized, sending, threadId],
  );

  const onSend = useCallback(() => {
    void submit(draft);
  }, [draft, submit]);

  // Retries the message already showing as a pending bubble — never a second copy.
  const onRetry = useCallback(() => {
    if (pending) void submit(pending);
  }, [pending, submit]);

  const showEmptyState =
    !loading && !loadError && messages.length === 0 && pending === null;

  return (
    <div className="flex flex-1 flex-col px-5 pb-2">
      {onBack ? (
        <div className="flex items-center gap-1.5 pt-1 pb-3">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring -ml-1.5 flex items-center gap-0.5 rounded-[10px] px-1.5 py-1 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
            All conversations
          </button>
          <span className="truncate text-[13px] font-semibold text-text-primary">
            {title}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        {loading ? (
          <ChatSkeleton />
        ) : loadError ? (
          <div className="rounded-[14px] border border-app bg-card-surface p-6 text-center">
            <div className="text-[14px] font-semibold text-text-primary">
              Couldn&apos;t load this conversation
            </div>
            <div className="mt-1 text-[13px] text-text-secondary">{loadError}</div>
            <button
              type="button"
              onClick={() => threadId && void load(threadId)}
              className="focus-ring mt-4 rounded-[10px] bg-credo px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-credo/90"
            >
              Try again
            </button>
          </div>
        ) : showEmptyState ? (
          <CoachEmptyState
            disabled={sending || limitReached}
            onPick={(prompt) => void submit(prompt)}
          />
        ) : (
          <div className="flex flex-col gap-3.5 pt-1">
            {messages.map((message) =>
              message.senderType === "coach" ? (
                <CoachBubble
                  key={message.id}
                  content={message.content}
                  createdAt={message.createdAt}
                />
              ) : (
                <UserBubble
                  key={message.id}
                  content={message.content}
                  createdAt={message.createdAt}
                />
              ),
            )}
            {pending ? <UserBubble content={pending} pending /> : null}
            {sending ? <TypingBubble /> : null}
            {sendError && !sending ? (
              <ErrorBubble
                message={sendError}
                onRetry={onRetry}
                retrying={sending}
              />
            ) : null}
          </div>
        )}

        {limitReached ? (
          <div className="mt-4">
            <LimitNotice message={LIMIT_COPY} />
          </div>
        ) : null}

        <div ref={bottomRef} className="h-2 shrink-0" />
      </div>

      <Composer
        value={draft}
        onChange={setDraft}
        onSend={onSend}
        disabled={limitReached || loading || loadError !== null}
        sending={sending}
        placeholder={
          limitReached ? "Daily limit reached" : "Ask your coach anything"
        }
      />
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 pt-1">
      <div className="flex justify-end">
        <Skeleton className="h-11 w-2/3 rounded-[14px]" />
      </div>
      <Skeleton className="h-24 w-11/12 rounded-[14px]" />
      <div className="flex justify-end">
        <Skeleton className="h-9 w-1/2 rounded-[14px]" />
      </div>
      <Skeleton className="h-20 w-10/12 rounded-[14px]" />
    </div>
  );
}
