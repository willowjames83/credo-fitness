"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageTitle } from "./nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AppHeaderProps {
  initials: string;
}

// Mobile-only top header: page context + theme toggle + avatar link to profile.
export function AppHeader({ initials }: AppHeaderProps) {
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-app bg-canvas/90 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase leading-none tracking-[2.5px] text-credo">
            Credo
          </span>
          <span className="mt-0.5 text-[15px] font-semibold leading-tight text-text-primary">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/app/profile"
            aria-label="Profile"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-[13px] font-semibold text-text-secondary transition-colors hover:bg-credo-light hover:text-credo"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
