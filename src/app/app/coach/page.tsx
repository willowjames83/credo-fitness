"use client";

// Credo Coach — AI chat with full training context (PRD §3.6).
// Athletes with a single conversation land straight in the chat; once there
// is more than one, the list becomes the entry point.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CoachUnauthorizedError,
  errorMessage,
  listThreads,
  type CoachThreadDTO,
} from "@/components/coach/api";
import { ChatView } from "@/components/coach/chat-view";
import { ThreadList } from "@/components/coach/thread-list";

type View = { kind: "list" } | { kind: "chat"; threadId: string | null };

export default function CoachPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<CoachThreadDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [chatNonce, setChatNonce] = useState(0);

  const goToLogin = useCallback(() => {
    router.replace("/login");
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { threads: loaded } = await listThreads();
      setThreads(loaded);
      // Only decide the landing view once; later refreshes must not yank the
      // athlete out of a conversation they are reading.
      setView((current) =>
        current ??
        (loaded.length > 1
          ? { kind: "list" }
          : { kind: "chat", threadId: loaded[0]?.id ?? null }),
      );
    } catch (e) {
      if (e instanceof CoachUnauthorizedError) {
        goToLogin();
        return;
      }
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [goToLogin]);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresh the list in the background after a reply lands.
  const refreshThreads = useCallback(() => {
    void listThreads()
      .then(({ threads: loaded }) => setThreads(loaded))
      .catch(() => {
        /* the list is non-critical; the open conversation is unaffected */
      });
  }, []);

  if (loading && threads === null) return <CoachSkeleton />;

  if (error && threads === null) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 pb-10">
        <div className="w-full rounded-[14px] border border-[#E5E5E8] bg-white p-6 text-center">
          <div className="text-[14px] font-semibold text-[#1A1A1E]">
            Couldn&apos;t load your coach
          </div>
          <div className="mt-1 text-[13px] text-[#6B6B73]">{error}</div>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-[10px] bg-[#E8501A] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const all = threads ?? [];
  const current = view ?? { kind: "chat" as const, threadId: all[0]?.id ?? null };

  if (current.kind === "list") {
    return (
      <ThreadList
        threads={all}
        onOpen={(threadId) => setView({ kind: "chat", threadId })}
        onNew={() => {
          setChatNonce((n) => n + 1);
          setView({ kind: "chat", threadId: null });
        }}
      />
    );
  }

  const active = all.find((t) => t.id === current.threadId);

  return (
    <ChatView
      key={`${current.threadId ?? "new"}-${chatNonce}`}
      threadId={current.threadId}
      title={active?.title ?? "New conversation"}
      onBack={all.length > 1 ? () => setView({ kind: "list" }) : undefined}
      onThreadsChanged={refreshThreads}
      onUnauthorized={goToLogin}
    />
  );
}

function CoachSkeleton() {
  return (
    <div className="flex flex-1 flex-col px-5 pb-6">
      <div className="h-3 w-32 animate-pulse rounded bg-[#EEEFF1]" />
      <div className="mt-4 h-28 w-full animate-pulse rounded-[14px] bg-[#EEEFF1]" />
      <div className="mt-4 flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-[14px] bg-[#EEEFF1]"
          />
        ))}
      </div>
      <div className="mt-auto h-[66px] w-full animate-pulse rounded-[14px] bg-[#EEEFF1]" />
    </div>
  );
}
