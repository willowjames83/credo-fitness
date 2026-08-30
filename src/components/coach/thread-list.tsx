"use client";

import { ChevronRight, Plus } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { formatDay, type CoachThreadDTO } from "./api";

export function ThreadList({
  threads,
  onOpen,
  onNew,
}: {
  threads: CoachThreadDTO[];
  onOpen: (threadId: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex-1 px-5 pb-6">
      <div className="flex items-center justify-between pt-1 pb-2.5">
        <SectionHeader>Conversations</SectionHeader>
        <button
          type="button"
          onClick={onNew}
          className="focus-ring flex items-center gap-1 rounded-[10px] bg-credo px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-credo/90"
        >
          <Plus size={14} strokeWidth={2.4} />
          New conversation
        </button>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-app bg-card-surface">
        {threads.map((thread, i) => (
          <button
            key={thread.id}
            type="button"
            onClick={() => onOpen(thread.id)}
            className={`focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface ${
              i > 0 ? "border-t border-app" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <div className="truncate text-[14px] font-semibold text-text-primary">
                  {thread.title}
                </div>
                <div className="shrink-0 text-[11px] text-text-tertiary">
                  {formatDay(thread.updatedAt)}
                </div>
              </div>
              <div className="mt-0.5 truncate text-[13px] text-text-secondary">
                {thread.lastMessage
                  ? `${thread.lastMessage.senderType === "coach" ? "Coach: " : ""}${thread.lastMessage.content}`
                  : "No messages yet"}
              </div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-text-tertiary" />
          </button>
        ))}
      </div>
    </div>
  );
}
