import { Skeleton } from "@/components/ui/skeleton";

// Loading state scoped to the authenticated /app segment. Renders inside the
// app shell content column, approximating a dashboard's shape while it loads.
export default function AppLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex flex-1 flex-col gap-4 px-5 py-4"
    >
      <span className="sr-only">Loading</span>
      <Skeleton className="h-8 w-40 rounded-lg" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
