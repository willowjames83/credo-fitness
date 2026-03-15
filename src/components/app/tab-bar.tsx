"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Dumbbell, Hexagon, Activity, User } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, href: "/app/dashboard" },
  { id: "workout", label: "Workout", icon: Dumbbell, href: "/app/workout" },
  { id: "credo-ten", label: "Credo Ten", icon: Hexagon, href: "/app/credo-ten" },
  { id: "protein", label: "Scores", icon: Activity, href: "/app/protein" },
  { id: "profile", label: "Profile", icon: User, href: "/app/profile" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div
      className="pb-[env(safe-area-inset-bottom,0px)]"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
        paddingTop: 4,
        paddingBottom: 8,
        background: "#FFFFFF",
        borderTop: "1px solid #E5E5E8",
      }}
    >
      {tabs.map((t) => {
        const isActive = pathname === t.href;
        const Icon = t.icon;
        return (
          <Link
            key={t.id}
            href={t.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              textDecoration: "none",
              opacity: isActive ? 1 : 0.5,
              transition: "opacity 0.15s",
              minWidth: 48,
              minHeight: 48,
              padding: "6px 8px",
            }}
          >
            <Icon size={22} color={isActive ? "#E8501A" : "#6B6B73"} strokeWidth={isActive ? 2.2 : 1.8} />
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#E8501A" : "#6B6B73",
              }}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
