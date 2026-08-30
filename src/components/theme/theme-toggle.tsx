"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Accessible light/dark toggle. Flips between the two resolved themes
 * (respecting the initial `system` preference). Guards against a
 * hydration flash by rendering a neutral, non-interactive placeholder
 * until mounted, so the icon never mismatches server output.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const base = cn(
    "focus-ring inline-flex h-8 w-8 items-center justify-center rounded-[10px]",
    "text-text-secondary transition-colors hover:bg-surface hover:text-text-primary",
    "[&_svg]:size-[18px] [&_svg]:shrink-0",
    className,
  );

  // Pre-hydration placeholder: reserves layout, no icon mismatch.
  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={cn(base, "pointer-events-none opacity-0")}
      >
        <Sun />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={base}
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}
