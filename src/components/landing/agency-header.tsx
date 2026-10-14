"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Globe, Sun, Moon } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyHeaderProps {
  t: AgencyTranslations;
  lang: "en" | "id";
  onToggleLang: () => void;
  onOpenBrief: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function AgencyHeader({
  t,
  lang,
  onToggleLang,
  onOpenBrief,
  isDark,
  onToggleTheme,
}: AgencyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [timeUtc, setTimeUtc] = useState("07:15:00 UTC");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Update real UTC clock
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toTimeString().split(" ")[0] + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b ${
        isDark
          ? "bg-[#09090B]/90 border-[#27272A] text-[#FAFAFA]"
          : "bg-[#F9F9F8]/90 border-[#E5E5E0] text-[#111111]"
      } backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-baseline gap-2.5 tracking-tight group focus:outline-none"
            >
              <span className="font-semibold text-lg tracking-tighter">
                {t.meta.brandName}
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-muted-light dark:text-muted-dark opacity-70">
                [TECH:CREATIVE]
              </span>
            </Link>

            {/* Live Operational Beacon */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#E5E5E0] dark:border-[#27272A]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="font-mono text-[11px] tracking-tight uppercase opacity-80">
                {t.meta.systemStatus}
              </span>
              <span className="font-mono text-[11px] text-[#666666] dark:text-[#A1A1AA] tabular-nums pl-1">
                · {timeUtc}
              </span>
            </div>
          </div>

          {/* Clean Horizontal Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-normal tracking-tight">
            <a
              href="#value-props"
              className="text-[#666666] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition-colors"
            >
              {t.nav.capabilities}
            </a>
            <a
              href="#case-studies"
              className="text-[#666666] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition-colors"
            >
              {t.nav.caseStudies}
            </a>
            <a
              href="#system-matrix"
              className="text-[#666666] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#FAFAFA] transition-colors"
            >
              {t.nav.systemData}
            </a>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E5E5E0] dark:border-[#27272A] bg-black/[0.02] dark:bg-white/[0.04] text-[#111111] dark:text-[#FAFAFA] hover:border-[#10B981]/50 transition-colors"
              title="Launch EL Interactive AI Studio & Document Engine"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-mono text-[11px]">{t.nav.aiStudio}</span>
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors rounded"
              title="Switch language between Indonesian and English"
            >
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-1.5 border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
              title={isDark ? "Switch to Light Mode" : "Switch to Deep Zinc Dark"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Primary CTA with 4px Arrow Micro-interaction */}
            <button
              onClick={onOpenBrief}
              type="button"
              className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B] hover:opacity-90 transition-all rounded"
            >
              <span>{t.nav.sendBrief.replace(" →", "")}</span>
              <span className="arrow-shift">→</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
