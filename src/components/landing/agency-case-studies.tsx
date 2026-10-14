"use client";

import React, { useState } from "react";
import { ArrowRight, TrendingUp, Layers, CheckCircle } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyCaseStudiesProps {
  t: AgencyTranslations;
  isDark: boolean;
  onSelectCaseStudy: (caseStudyId: string) => void;
}

export default function AgencyCaseStudies({
  t,
  isDark,
  onSelectCaseStudy,
}: AgencyCaseStudiesProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredItems = t.caseStudies.items.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "enterprise") return item.category === "Enterprise SaaS";
    if (activeFilter === "fintech") return item.category === "Fintech";
    if (activeFilter === "ai") return item.category === "AI & DeepTech";
    return true;
  });

  return (
    <section id="case-studies" className="w-full border-b border-[#E5E5E0] dark:border-[#27272A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Exposed Hairline Border & Category Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b border-[#E5E5E0] dark:border-[#27272A]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-2 block">
                {t.caseStudies.sectionIndex}
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA]">
                {t.caseStudies.sectionTitle}
              </h2>
              <p className="max-w-lg mt-2 text-sm text-[#666666] dark:text-[#A1A1AA] font-normal tracking-tight">
                {t.caseStudies.sectionSubtitle}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 border border-[#E5E5E0] dark:border-[#27272A] rounded bg-black/[0.015] dark:bg-white/[0.015]">
              <button
                onClick={() => setActiveFilter("all")}
                type="button"
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  activeFilter === "all"
                    ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                    : "text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-[#FAFAFA]"
                }`}
              >
                {t.caseStudies.filterAll}
              </button>
              <button
                onClick={() => setActiveFilter("enterprise")}
                type="button"
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  activeFilter === "enterprise"
                    ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                    : "text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-[#FAFAFA]"
                }`}
              >
                {t.caseStudies.filterEnterprise}
              </button>
              <button
                onClick={() => setActiveFilter("fintech")}
                type="button"
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  activeFilter === "fintech"
                    ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                    : "text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-[#FAFAFA]"
                }`}
              >
                {t.caseStudies.filterFintech}
              </button>
              <button
                onClick={() => setActiveFilter("ai")}
                type="button"
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  activeFilter === "ai"
                    ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                    : "text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-[#FAFAFA]"
                }`}
              >
                {t.caseStudies.filterAi}
              </button>
            </div>
          </div>
        </div>

        {/* High-Impact Portfolio Grid (2x2 Exposed Architectural Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E0] dark:divide-[#27272A]">
          {filteredItems.map((study, idx) => {
            const isScale = study.status === "scale";
            const isHold = study.status === "hold";

            return (
              <div
                key={study.id}
                onClick={() => onSelectCaseStudy(study.id)}
                className={`p-8 lg:p-12 flex flex-col justify-between group cursor-pointer transition-colors duration-150 border-b border-[#E5E5E0] dark:border-[#27272A] ${
                  isDark ? "hover:bg-[#141416]/60" : "hover:bg-[#F2F2F0]"
                }`}
              >
                <div>
                  {/* Top Header: Brand Name + Status Badge + Year */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E5E0]/60 dark:border-[#27272A]/60">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm tracking-widest font-semibold uppercase text-[#111111] dark:text-[#FAFAFA]">
                        {study.brand}
                      </span>
                      <span className="font-mono text-[10px] text-[#666666] dark:text-[#A1A1AA]">
                        · {study.year}
                      </span>
                    </div>

                    {/* Semantic Status Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border ${
                        isScale
                          ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                          : isHold
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                          : "bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isScale
                            ? "bg-[#10B981]"
                            : isHold
                            ? "bg-[#F59E0B]"
                            : "bg-[#F43F5E]"
                        }`}
                      />
                      <span>{study.statusText}</span>
                    </div>
                  </div>

                  {/* Campaign Title */}
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA] mb-4 group-hover:text-[#111111] dark:group-hover:text-white transition-colors">
                    {study.title}
                  </h3>

                  {/* Narrative Description */}
                  <p className="text-sm leading-relaxed text-[#666666] dark:text-[#A1A1AA] mb-8 font-normal">
                    {study.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-10">
                    {study.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 text-[10px] font-mono text-[#666666] dark:text-[#A1A1AA] border border-[#E5E5E0] dark:border-[#27272A] rounded bg-black/[0.02] dark:bg-white/[0.02]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Massive Monospace Metric Badge & Directional Link */}
                <div className="pt-6 border-t border-[#E5E5E0]/60 dark:border-[#27272A]/60 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="block font-mono text-[10px] tracking-wider uppercase text-[#666666] dark:text-[#A1A1AA] mb-1">
                      {study.metricLabel}
                    </span>
                    <div className="font-mono text-3xl sm:text-4xl font-medium tracking-tighter text-[#111111] dark:text-[#FAFAFA] tabular-nums">
                      {study.metric}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#111111] dark:text-[#FAFAFA] group-hover:text-[#10B981] transition-colors self-start sm:self-end">
                    <span>Read teardown</span>
                    <span className="arrow-shift">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
