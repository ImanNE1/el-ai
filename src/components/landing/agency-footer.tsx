"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyFooterProps {
  t: AgencyTranslations;
  isDark: boolean;
  onOpenBrief: () => void;
}

export default function AgencyFooter({ t, isDark, onOpenBrief }: AgencyFooterProps) {
  const [times, setTimes] = useState<Record<string, string>>({
    Zurich: "--:--",
    Singapore: "--:--",
    "San Francisco": "--:--",
  });

  useEffect(() => {
    const updateTimes = () => {
      const getCityTime = (tz: string) => {
        try {
          return new Intl.DateTimeFormat("en-GB", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date());
        } catch {
          return "12:00:00";
        }
      };

      setTimes({
        Zurich: getCityTime("Europe/Zurich"),
        Singapore: getCityTime("Asia/Singapore"),
        "San Francisco": getCityTime("America/Los_Angeles"),
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full border-t border-[#E5E5E0] dark:border-[#27272A] bg-black/[0.015] dark:bg-white/[0.015] text-[#111111] dark:text-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        {/* Upper Footer Strip: Locations & Time Zones */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E0] dark:divide-[#27272A] border-b border-[#E5E5E0] dark:border-[#27272A]">
          {t.footer.locations.map((loc) => (
            <div key={loc.city} className="p-6 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] block mb-1">
                  [LOCATION / ZONE]
                </span>
                <span className="font-medium text-sm">{loc.city} Studio</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-medium tabular-nums text-[#111111] dark:text-[#FAFAFA]">
                  {times[loc.city] || "--:--"}
                </span>
                <span className="block font-mono text-[9px] text-[#666666] dark:text-[#A1A1AA] uppercase">
                  LOCAL TIME
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lower Footer Main Grid */}
        <div className="p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-baseline gap-2.5">
              <span className="font-semibold text-xl tracking-tighter">
                {t.meta.brandName}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-[#666666] dark:text-[#A1A1AA] uppercase">
                [SWISS EDITORIAL]
              </span>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-[#666666] dark:text-[#A1A1AA] font-normal">
              {t.footer.tagline}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenBrief}
                type="button"
                className="group inline-flex items-center gap-2 text-xs font-mono font-medium underline underline-offset-4 decoration-[#E5E5E0] dark:decoration-[#27272A] hover:decoration-current transition-colors"
              >
                <span>Initiate strategic partnership</span>
                <span className="arrow-shift">→</span>
              </button>
            </div>
          </div>

          {/* Nav Links Col 1 */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs">
            <span className="block text-[10px] uppercase tracking-widest text-[#666666] dark:text-[#A1A1AA] mb-4">
              [INDEX]
            </span>
            <div>
              <a
                href="#value-props"
                className="text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                01 // Capabilities
              </a>
            </div>
            <div>
              <a
                href="#case-studies"
                className="text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                02 // Case Studies
              </a>
            </div>
            <div>
              <a
                href="#system-matrix"
                className="text-[#666666] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                03 // Live Telemetry
              </a>
            </div>
          </div>

          {/* Nav Links Col 2 */}
          <div className="lg:col-span-4 space-y-3 font-mono text-xs">
            <span className="block text-[10px] uppercase tracking-widest text-[#666666] dark:text-[#A1A1AA] mb-4">
              [SYSTEM & PLATFORMS]
            </span>
            <div>
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-[#111111] dark:text-[#FAFAFA] hover:text-[#10B981] transition-colors"
              >
                <span>EL Intelligent AI Studio & Document Engine</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-[11px] text-[#666666] dark:text-[#A1A1AA] leading-relaxed">
              Proprietary AI workspace supporting multi-format document extraction and generation (.docx, .pdf, .xlsx).
            </p>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="px-8 py-6 border-t border-[#E5E5E0] dark:border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#666666] dark:text-[#A1A1AA]">
          <div>
            © {new Date().getFullYear()} {t.meta.brandName}. {t.footer.rights}
          </div>
          <div className="flex items-center gap-6">
            <span>GRID: 1PX SOLID</span>
            <span>TYPE: GEIST / MONO</span>
            <span>STATUS: 200 OK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
