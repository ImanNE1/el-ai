"use client";

import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyValuePropsProps {
  t: AgencyTranslations;
  isDark: boolean;
}

export default function AgencyValueProps({ t, isDark }: AgencyValuePropsProps) {
  return (
    <section id="value-props" className="w-full border-b border-[#E5E5E0] dark:border-[#27272A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Exposed Border */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b border-[#E5E5E0] dark:border-[#27272A]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-2 block">
                {t.valueProps.sectionIndex}
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA]">
                {t.valueProps.sectionTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#666666] dark:text-[#A1A1AA] font-normal tracking-tight">
              {t.valueProps.sectionSubtitle}
            </p>
          </div>
        </div>

        {/* 4-Column Architectural Grid with Exposed Hairline Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0] dark:divide-[#27272A]">
          {t.valueProps.items.map((item, idx) => (
            <div
              key={item.index}
              className={`p-6 lg:p-8 flex flex-col justify-between group transition-colors duration-150 ${
                isDark ? "hover:bg-[#141416]/50" : "hover:bg-[#F2F2F0]"
              }`}
            >
              <div>
                {/* Monospace Index + Status Pill */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E5E0]/60 dark:border-[#27272A]/60">
                  <span className="font-mono text-2xl font-light tracking-tighter text-[#111111] dark:text-[#FAFAFA]">
                    {item.index}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]">
                    <span className="w-1 h-1 rounded-full bg-[#10B981]" />
                    {item.statusLabel}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA] mb-3">
                  {item.title}
                </h3>

                {/* Sharp Description */}
                <p className="text-[13px] leading-relaxed text-[#666666] dark:text-[#A1A1AA] font-normal mb-8">
                  {item.description}
                </p>
              </div>

              {/* Bottom Telemetry Metric & Directional Micro-link */}
              <div className="pt-4 border-t border-[#E5E5E0]/60 dark:border-[#27272A]/60">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-mono text-xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA] tabular-nums">
                    {item.metric}
                  </span>
                  <span className="font-mono text-[10px] text-[#666666] dark:text-[#A1A1AA] uppercase">
                    {item.metricLabel}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#111111] dark:text-[#FAFAFA] group-hover:text-[#10B981] transition-colors cursor-pointer">
                  <span>Inspect protocol</span>
                  <span className="arrow-shift">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
