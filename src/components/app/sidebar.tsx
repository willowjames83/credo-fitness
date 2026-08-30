"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NAV_MAIN,
  NAV_PILLARS,
  isNavActive,
  type AppNavItem,
} from "./nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
      className={`focus-ring flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-credo-light text-credo"
          : "text-text-secondary hover:bg-surface hover:text-text-primary"
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-app bg-canvas lg:flex">
      <div className="px-6 pb-3 pt-6">
        <Link
          href="/app/dashboard"
          className="focus-ring rounded-md font-display text-[26px] leading-none text-text-primary"
        >
          Credo<span className="text-credo">.</span>
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

        <p className="mb-1.5 mt-7 px-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
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

      <div className="border-t border-app p-3">
        <div className="flex items-center gap-2">
          <Link
            href="/app/profile"
            className={`focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors ${
              isNavActive(pathname, "/app/profile")
                ? "bg-credo-light"
                : "hover:bg-surface"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[12px] font-semibold text-text-secondary">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-text-primary">
                {name}
              </span>
              <span className="block truncate text-[11px] text-text-tertiary">
                {email || "View profile"}
              </span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
