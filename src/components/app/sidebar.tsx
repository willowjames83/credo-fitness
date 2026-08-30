"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NAV_MAIN,
  NAV_PILLARS,
  isNavActive,
  type AppNavItem,
} from "./nav";

interface SidebarProps {
  name: string;
  email: string;
  initials: string;
}

function NavLink({ item, active }: { item: AppNavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--shell-accent-light)] text-[var(--shell-accent)]"
          : "text-[var(--shell-text-secondary)] hover:bg-[var(--shell-surface)] hover:text-[var(--shell-text-primary)]"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ name, email, initials }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--shell-border)] bg-[var(--shell-bg)] lg:flex">
      <div className="px-6 pb-3 pt-6">
        <Link
          href="/app/dashboard"
          className="font-display text-[26px] leading-none text-[var(--shell-text-primary)]"
        >
          Credo<span className="text-[var(--shell-accent)]">.</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV_MAIN.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isNavActive(pathname, item.href)} />
            </li>
          ))}
        </ul>

        <p className="mb-1.5 mt-7 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--shell-text-tertiary)]">
          Pillars
        </p>
        <ul className="space-y-0.5">
          {NAV_PILLARS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isNavActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[var(--shell-border)] p-3">
        <Link
          href="/app/profile"
          className={`flex items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors ${
            isNavActive(pathname, "/app/profile")
              ? "bg-[var(--shell-accent-light)]"
              : "hover:bg-[var(--shell-surface)]"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--shell-surface-elevated)] text-[12px] font-semibold text-[var(--shell-text-secondary)]">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-[var(--shell-text-primary)]">
              {name}
            </span>
            <span className="block truncate text-[11px] text-[var(--shell-text-tertiary)]">
              {email || "View profile"}
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
