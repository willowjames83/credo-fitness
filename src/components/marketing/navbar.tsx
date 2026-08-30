"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: "#pillars" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      setPastHero(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = !pastHero;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        pastHero
          ? "bg-canvas/90 backdrop-blur-md"
          : scrolled
          ? "bg-[#0D0D0F]/80 backdrop-blur-md"
          : "bg-transparent"
      } ${pastHero && scrolled ? "shadow-sm" : ""}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="focus-ring rounded-sm text-xs font-bold tracking-[2.5px] uppercase text-credo hover:opacity-80 transition-opacity"
        >
          CREDO
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`focus-ring rounded-sm text-sm transition-colors ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <span
            className={`rounded-full ${
              isDark ? "bg-white/10" : "bg-surface-elevated/70"
            }`}
          >
            <ThemeToggle
              className={
                isDark ? "text-white/70! hover:bg-white/10! hover:text-white!" : undefined
              }
            />
          </span>
          <Link
            href="/login"
            className={`focus-ring rounded-sm text-sm transition-colors ${
              isDark
                ? "text-white/60 hover:text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="focus-ring rounded-full bg-credo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D3480F]"
          >
            Start free
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <span
            className={`rounded-full ${
              isDark ? "bg-white/10" : "bg-surface-elevated/70"
            }`}
          >
            <ThemeToggle
              className={
                isDark ? "text-white/70! hover:bg-white/10! hover:text-white!" : undefined
              }
            />
          </span>
          <Sheet>
            <SheetTrigger
              render={
                <button className="focus-ring rounded-md p-2 -mr-2" aria-label="Open menu">
                  <Menu className={`w-5 h-5 ${isDark ? "text-white" : "text-text-primary"}`} />
                </button>
              }
            />
            <SheetContent side="right" className="w-72 bg-canvas pt-12">
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <a
                        href={link.href}
                        className="focus-ring rounded-sm text-lg text-text-primary font-medium"
                      >
                        {link.label}
                      </a>
                    }
                  />
                ))}
                <div className="flex flex-col gap-4 pt-2">
                  <SheetClose
                    render={
                      <Link
                        href="/register"
                        className="focus-ring rounded-full bg-credo px-5 py-2.5 text-center text-sm font-semibold text-white"
                      >
                        Start free
                      </Link>
                    }
                  />
                  <SheetClose
                    render={
                      <Link
                        href="/login"
                        className="focus-ring rounded-sm text-center text-sm font-medium text-text-secondary"
                      >
                        Log in
                      </Link>
                    }
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
