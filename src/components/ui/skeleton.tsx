import { cn } from "@/lib/utils";

/**
 * Themed loading placeholder with a subtle shimmer.
 *
 * Shimmer + colors are theme-aware (see `.credo-skeleton` in globals.css)
 * and collapse to a static surface under `prefers-reduced-motion`.
 *
 * Size it with utility classes:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-24 w-full rounded-xl" />
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("credo-skeleton rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
