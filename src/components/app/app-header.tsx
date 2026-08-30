"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageTitle } from "./nav";

interface AppHeaderProps {
  initials: string;
}

// Mobile-only top header: page context + avatar link to profile.
export function AppHeader({ initials }: AppHeaderProps) {
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--shell-border)] bg-[var(--shell-bg)]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase leading-none tracking-[2.5px] text-[var(--shell-accent)]">
            Credo
          </span>
          <span className="mt-0.5 text-[15px] font-semibold leading-tight text-[var(--shell-text-primary)]">
            {title}
          </span>
        </div>
        <Link
          href="/app/profile"
          aria-label="Profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--shell-surface-elevated)] text-[13px] font-semibold text-[var(--shell-text-secondary)] transition-colors hover:bg-[var(--shell-accent-light)] hover:text-[var(--shell-accent)]"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
