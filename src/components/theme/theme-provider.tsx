"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App-wide theme provider (wraps next-themes).
 *
 * Defaults: class strategy, `system` theme, transitions disabled on change
 * to avoid a color flash while toggling. Consumers read/set the theme with
 * `useTheme()` from `next-themes`; the <ThemeToggle /> is the primary UI.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
