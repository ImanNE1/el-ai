"use client";

import React from "react";
import { X, ArrowRight, CheckCircle2, TrendingUp, Layers, Cpu } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyCaseModalProps {
  caseStudyId: string | null;
  onClose: () => void;
  t: AgencyTranslations;
  isDark: boolean;
  onOpenBrief: () => void;
}

export default function AgencyCaseModal({
  caseStudyId,
  onClose,
  t,
  isDark,
  onOpenBrief,
}: AgencyCaseModalProps) {
  React.useEffect(() => {
    if (!caseStudyId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [caseStudyId, onClose]);

  if (!caseStudyId) return null;

  const study = t.caseStudies.items.find((item) => item.id === caseStudyId);
  if (!study) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl border border-[#E5E5E0] dark:border-[#27272A] p-6 sm:p-10 transition-colors ${
          isDark ? "bg-[#09090B] text-[#FAFAFA]" : "bg-[#F9F9F8] text-[#111111]"
        } shadow-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
          title="Close Teardown"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="mb-8 pb-6 border-b border-[#E5E5E0] dark:border-[#27272A]">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#10B981]">
              [VERIFIED TEARDOWN]
            </span>
            <span className="font-mono text-xs text-[#666666] dark:text-[#A1A1AA]">
              · {study.category} · {study.year}
            </span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight mb-2">
            {study.brand}
          </h2>
          <p className="text-lg text-[#666666] dark:text-[#A1A1AA] font-normal tracking-tight">
            {study.title}
          </p>
        </div>

        {/* Massive Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E0] dark:divide-[#27272A] border border-[#E5E5E0] dark:border-[#27272A] mb-8 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="p-4 sm:p-6">
            <span className="block font-mono text-[10px] text-[#666666] dark:text-[#A1A1AA] uppercase mb-1">
              PRIMARY METRIC
            </span>
            <div className="font-mono text-3xl font-semibold tracking-tight text-[#10B981] tabular-nums">
              {study.metric}
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              {study.metricLabel}
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <span className="block font-mono text-[10px] text-[#666666] dark:text-[#A1A1AA] uppercase mb-1">
              STATUS CLUSTER
            </span>
            <div className="font-mono text-2xl font-medium text-[#111111] dark:text-[#FAFAFA]">
              {study.statusText}
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              Autonomous Deployment
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <span className="block font-mono text-[10px] text-[#666666] dark:text-[#A1A1AA] uppercase mb-1">
              ATTRIBUTION MODEL
            </span>
            <div className="font-mono text-2xl font-medium text-[#111111] dark:text-[#FAFAFA]">
              Multi-Touch
            </div>
            <span className="text-xs text-[#666666] dark:text-[#A1A1AA]">
              Deterministic CRM Match
            </span>
          </div>
        </div>

        {/* Strategic Breakdown */}
        <div className="space-y-6 mb-8 text-sm leading-relaxed text-[#666666] dark:text-[#A1A1AA]">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#111111] dark:text-[#FAFAFA] mb-1">
              01 // The Strategic Problem
            </h4>
            <p>
              Legacy ad platforms and conventional agencies relied on broad contextual targeting and manual creative refreshes, causing customer acquisition costs (CAC) to inflate rapidly while conversion fidelity plummeted.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#111111] dark:text-[#FAFAFA] mb-1">
              02 // The Engineering Solution
            </h4>
            <p>
              EL Studio deployed an autonomous creative engine mutating 400+ modular visual assets per cycle, coupled with neural audience intent graphs that triggered tailored landing page variations in real time.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#111111] dark:text-[#FAFAFA] mb-1">
              03 // Deliverables & Architecture
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {study.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono border border-[#E5E5E0] dark:border-[#27272A] rounded bg-black/[0.03] dark:bg-white/[0.03] text-[#111111] dark:text-[#FAFAFA]"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[#E5E5E0] dark:border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
          >
            ← Close Teardown
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenBrief();
            }}
            type="button"
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-mono font-medium bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B] hover:opacity-90 transition-all"
          >
            <span>Deploy similar architecture</span>
            <span className="arrow-shift">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
