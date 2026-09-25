"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getStoredFitlogState, STATE_EVENT, type FitlogState } from "@/lib/fitlog";

export default function SiteHeader() {
  const pathname = usePathname();
  const [state, setState] = useState<FitlogState>({ plan: [], saved: [], completed: [] });

  useEffect(() => {
    const syncState = () => setState(getStoredFitlogState());

    window.addEventListener(STATE_EVENT, syncState);
    const syncTimer = window.setTimeout(syncState, 0);
    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener(STATE_EVENT, syncState);
    };
  }, []);

  const navItems = useMemo(
    () => [
      { href: "/", label: "Workout", exact: true },
      { href: "/my-plan", label: "My Plan" },
    ],
    [],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="FitLog home">
          <Image src="/logo.png" alt="FitLog logo" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" priority />
          <span className="hidden text-2xl font-black uppercase tracking-[0.14em] text-white sm:inline">FitLog</span>
        </Link>

        <nav className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#d4d4d4] sm:gap-2 sm:text-xs sm:tracking-[0.14em] md:gap-4 md:text-sm md:tracking-[0.18em]">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-2 py-2 transition sm:px-3 sm:py-2.5 md:px-4",
                  isActive ? "bg-[#ccff00]/10 text-[#ccff00] ring-1 ring-[#ccff00]/20" : "hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/my-plan"
            className="inline-flex items-center gap-1 rounded-full bg-[#ccff00] px-2 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#0a0a0a] sm:gap-2 sm:px-3"
          >
            <span className="hidden sm:inline">Plan</span>
            <span className="rounded-full border border-[#0a0a0a]/20 bg-[#0a0a0a] px-1.5 py-0.5 text-[#ccff00] sm:px-2">
              {state.plan.length}
            </span>
          </Link>

          <Link
            href="/my-plan"
            className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-transparent px-2 py-2 text-xs font-black uppercase tracking-[0.15em] text-white sm:gap-2 sm:px-3"
          >
            <span className="hidden sm:inline">Saved</span>
            <span className="rounded-full border border-white/20 bg-transparent px-1.5 py-0.5 text-white sm:px-2">
              {state.saved.length}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
