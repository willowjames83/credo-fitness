import { Skeleton } from "@/components/ui/skeleton";

// Lightweight top-level loading state shown during route transitions/suspense.
export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6"
    >
      <span className="sr-only">Loading</span>
      <span
        aria-hidden
        className="text-[11px] font-bold uppercase tracking-[3px] text-credo"
      >
        Credo
      </span>
      <div className="flex w-full max-w-sm flex-col items-center gap-3" aria-hidden>
        <Skeleton className="h-2 w-40 rounded-full" />
        <Skeleton className="h-2 w-24 rounded-full" />
      </div>
    </div>
  );
}
