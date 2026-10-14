"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Activity, Terminal, ShieldCheck, Zap } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyHeroProps {
  t: AgencyTranslations;
  onOpenBrief: () => void;
  isDark: boolean;
}

export default function AgencyHero({ t, onOpenBrief, isDark }: AgencyHeroProps) {
  return (
    <section className="relative w-full border-b border-[#E5E5E0] dark:border-[#27272A] overflow-hidden">
      {/* Background Architectural Grid Lines subtle texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
        {/* Editorial Eyebrow & Status Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase border border-[#E5E5E0] dark:border-[#27272A] bg-black/[0.02] dark:bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#111111] dark:text-[#FAFAFA] font-medium">
              {t.hero.badge}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#666666] dark:text-[#A1A1AA]">
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="tabular-nums">Autonomous Media Telemetry: Online</span>
          </div>
        </div>

        {/* Massive Editorial Headline */}
        <div className="max-w-5xl mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-medium tracking-tighter leading-[1.08] text-[#111111] dark:text-[#FAFAFA]">
            <span>{t.hero.headlinePart1} </span>
            <span className="text-[#666666] dark:text-[#A1A1AA] font-normal">
              {t.hero.headlinePart2}
            </span>
          </h1>
        </div>

        {/* Narrative Subheadline */}
        <div className="max-w-2xl mb-12">
          <p className="text-base sm:text-lg text-[#666666] dark:text-[#A1A1AA] leading-relaxed font-normal tracking-tight">
            {t.hero.subheadline}
          </p>
        </div>

        {/* Action Button Cluster */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Primary CTA */}
          <button
            onClick={onOpenBrief}
            type="button"
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B] hover:opacity-90 transition-all rounded"
          >
            <span>{t.hero.primaryCta.replace(" →", "")}</span>
            <span className="arrow-shift font-mono">→</span>
          </button>

          {/* Secondary Case Studies anchor */}
          <a
            href="#case-studies"
            className="group inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
          >
            <span>{t.hero.secondaryCta.replace(" ↓", "")}</span>
            <span className="font-mono text-xs opacity-60 group-hover:translate-y-0.5 transition-transform">
              ↓
            </span>
          </a>

          {/* AI Gateway / Chatbot direct launch */}
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 px-4 py-3.5 text-sm font-mono text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-[#FAFAFA] transition-colors"
          >
            <Terminal className="w-4 h-4 text-[#10B981]" />
            <span>{t.hero.aiCta.replace(" ↗", "")}</span>
            <span className="text-xs opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>
        </div>
      </div>

      {/* Exposed Architectural Grid Bar (4-Cell High-Density Metrics Strip) */}
      <div className="w-full border-t border-[#E5E5E0] dark:border-[#27272A] bg-black/[0.015] dark:bg-white/[0.015]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E0] dark:divide-[#27272A]">
          {/* Cell 1 */}
          <div className="p-5 sm:p-6">
            <span className="block font-mono text-[10px] tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-1">
              [METRIC:01] · CAPITAL POOL
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA] tabular-nums">
              $142M+
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              Autonomous Media Deployed
            </span>
          </div>

          {/* Cell 2 */}
          <div className="p-5 sm:p-6">
            <span className="block font-mono text-[10px] tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-1">
              [METRIC:02] · ATTRIBUTION
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-medium tracking-tight text-[#10B981] tabular-nums">
              99.4%
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              Deterministic CRM Reconciliation
            </span>
          </div>

          {/* Cell 3 */}
          <div className="p-5 sm:p-6">
            <span className="block font-mono text-[10px] tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-1">
              [METRIC:03] · BLENDED YIELD
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA] tabular-nums">
              7.4×
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              Median Enterprise LTV / CAC
            </span>
          </div>

          {/* Cell 4 */}
          <div className="p-5 sm:p-6">
            <span className="block font-mono text-[10px] tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-1">
              [METRIC:04] · PIPELINE LATENCY
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA] tabular-nums">
                14ms
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                SCALE
              </span>
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              Real-time Bid Arbitration
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
