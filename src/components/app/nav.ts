import {
  LayoutGrid,
  Dumbbell,
  History,
  Gauge,
  Hexagon,
  MessageCircle,
  HeartPulse,
  Utensils,
  Target,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Desktop sidebar — primary navigation.
export const NAV_MAIN: AppNavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutGrid },
  { label: "Train", href: "/app/workout", icon: Dumbbell },
  { label: "History", href: "/app/history", icon: History },
  { label: "Scores", href: "/app/scores", icon: Gauge },
  { label: "Credo Ten", href: "/app/credo-ten", icon: Hexagon },
  { label: "Coach", href: "/app/coach", icon: MessageCircle },
];

// Desktop sidebar — pillar-specific sections.
export const NAV_PILLARS: AppNavItem[] = [
  { label: "Cardio", href: "/app/cardio", icon: HeartPulse },
  { label: "Nutrition", href: "/app/protein", icon: Utensils },
  { label: "Stability", href: "/app/stability", icon: Target },
];

export const NAV_PROFILE: AppNavItem = {
  label: "Profile",
  href: "/app/profile",
  icon: User,
};

// Mobile bottom tab bar (5 items).
export const MOBILE_TABS: AppNavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutGrid },
  { label: "Train", href: "/app/workout", icon: Dumbbell },
  { label: "Scores", href: "/app/scores", icon: Gauge },
  { label: "Coach", href: "/app/coach", icon: MessageCircle },
  { label: "Profile", href: "/app/profile", icon: User },
];

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Best-matching nav label for the current pathname (used by the mobile header).
export function pageTitle(pathname: string): string {
  const all = [...NAV_MAIN, ...NAV_PILLARS, NAV_PROFILE];
  const match = all
    .filter((item) => isNavActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Credo";
}
