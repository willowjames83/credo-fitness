"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

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
          ? "bg-white/90 backdrop-blur-md"
          : scrolled
          ? "bg-[#0D0D0F]/80 backdrop-blur-md"
          : "bg-transparent"
      } ${pastHero && scrolled ? "shadow-sm" : ""}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link
          href="/"
          className="text-xs font-bold tracking-[2.5px] uppercase text-[#E8501A] hover:opacity-80 transition-opacity"
        >
          CREDO
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-[#6B6B73] hover:text-[#1A1A1E]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/login"
            className={`text-sm transition-colors ${
              isDark
                ? "text-white/60 hover:text-white"
                : "text-[#6B6B73] hover:text-[#1A1A1E]"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#E8501A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D3480F]"
          >
            Start free
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <button className="md:hidden p-2 -mr-2" aria-label="Open menu">
                <Menu className={`w-5 h-5 ${isDark ? "text-white" : "text-[#1A1A1E]"}`} />
              </button>
            }
          />
          <SheetContent side="right" className="w-72 bg-white pt-12">
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <a
                      href={link.href}
                      className="text-lg text-[#1A1A1E] font-medium"
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
                      className="rounded-full bg-[#E8501A] px-5 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Start free
                    </Link>
                  }
                />
                <SheetClose
                  render={
                    <Link
                      href="/login"
                      className="text-center text-sm font-medium text-[#6B6B73]"
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
    </nav>
  );
}
