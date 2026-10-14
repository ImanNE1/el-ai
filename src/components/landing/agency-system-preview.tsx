"use client";

import React, { useState } from "react";
import { Terminal, RefreshCw, BarChart2, Check, Pause, AlertTriangle } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencySystemPreviewProps {
  t: AgencyTranslations;
  isDark: boolean;
}

export default function AgencySystemPreview({ t, isDark }: AgencySystemPreviewProps) {
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const telemetryData = [
    {
      id: "vec-01",
      cluster: "Meta Programmatic Matrix",
      category: "social",
      status: "scale" as const,
      spend: "$428,950",
      roas: "8.42×",
      sentiment: "84.2% Positive",
      vector: "AUTONOMOUS BIDDING",
      latency: "12ms",
    },
    {
      id: "vec-02",
      cluster: "Google Search & Intent Graph",
      category: "search",
      status: "scale" as const,
      spend: "$310,200",
      roas: "6.91×",
      sentiment: "91.8% Enterprise Match",
      vector: "REVENUE RECONCILIATION",
      latency: "8ms",
    },
    {
      id: "vec-03",
      cluster: "TikTok Neural Creative Sprint",
      category: "social",
      status: "scale" as const,
      spend: "$184,500",
      roas: "5.45×",
      sentiment: "79.6% Engagement",
      vector: "DYNAMIC VARIANT MUTATION",
      latency: "21ms",
    },
    {
      id: "vec-04",
      cluster: "LinkedIn Executive Syndication",
      category: "b2b",
      status: "hold" as const,
      spend: "$95,000",
      roas: "4.12×",
      sentiment: "88.0% C-Level Reach",
      vector: "AUDIENCE FREQUENCY CAP",
      latency: "19ms",
    },
    {
      id: "vec-05",
      cluster: "Synthetics & Programmatic DOOH",
      category: "experimental",
      status: "hold" as const,
      spend: "$62,300",
      roas: "3.80×",
      sentiment: "Pending Audit",
      vector: "GEO-SPATIAL ARBITRATION",
      latency: "34ms",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filteredData =
    selectedCluster === "all"
      ? telemetryData
      : telemetryData.filter((d) => d.category === selectedCluster);

  return (
    <section id="system-matrix" className="w-full border-b border-[#E5E5E0] dark:border-[#27272A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-b border-[#E5E5E0] dark:border-[#27272A]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] mb-2 block">
                {t.liveMatrix.sectionIndex}
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA]">
                {t.liveMatrix.sectionTitle}
              </h2>
              <p className="max-w-lg mt-2 text-sm text-[#666666] dark:text-[#A1A1AA] font-normal tracking-tight">
                {t.liveMatrix.sectionSubtitle}
              </p>
            </div>

            {/* Live Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-[#E5E5E0] dark:border-[#27272A] rounded p-1 text-xs font-mono">
                <button
                  onClick={() => setSelectedCluster("all")}
                  type="button"
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedCluster === "all"
                      ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                      : "text-[#666666] dark:text-[#A1A1AA]"
                  }`}
                >
                  All Channels
                </button>
                <button
                  onClick={() => setSelectedCluster("social")}
                  type="button"
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedCluster === "social"
                      ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                      : "text-[#666666] dark:text-[#A1A1AA]"
                  }`}
                >
                  Social Matrix
                </button>
                <button
                  onClick={() => setSelectedCluster("search")}
                  type="button"
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedCluster === "search"
                      ? "bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B]"
                      : "text-[#666666] dark:text-[#A1A1AA]"
                  }`}
                >
                  Search & CRM
                </button>
              </div>

              <button
                onClick={handleRefresh}
                type="button"
                className="p-2 border border-[#E5E5E0] dark:border-[#27272A] rounded hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                title="Re-sync Telemetry Cluster"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#111111] dark:text-[#FAFAFA] ${
                    isRefreshing ? "animate-spin text-[#10B981]" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* High-Density Telemetry Table (Linear / Vercel style) */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E0] dark:border-[#27272A] bg-black/[0.02] dark:bg-white/[0.02] text-[#666666] dark:text-[#A1A1AA]">
                <th className="py-3.5 px-6 font-medium uppercase tracking-wider">
                  {t.liveMatrix.colChannel}
                </th>
                <th className="py-3.5 px-6 font-medium uppercase tracking-wider">
                  {t.liveMatrix.colStatus}
                </th>
                <th className="py-3.5 px-6 font-medium uppercase tracking-wider tabular-nums">
                  {t.liveMatrix.colSpend}
                </th>
                <th className="py-3.5 px-6 font-medium uppercase tracking-wider tabular-nums">
                  {t.liveMatrix.colRoas}
                </th>
                <th className="py-3.5 px-6 font-medium uppercase tracking-wider">
                  {t.liveMatrix.colSentiment}
                </th>
                <th className="py-3.5 px-6 font-medium uppercase tracking-wider text-right">
                  {t.liveMatrix.colAction}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0] dark:divide-[#27272A]">
              {filteredData.map((row) => {
                const isScale = row.status === "scale";

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-[#141416]/50" : "hover:bg-[#F2F2F0]"
                    }`}
                  >
                    <td className="py-4 px-6 font-sans text-sm font-medium text-[#111111] dark:text-[#FAFAFA]">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] text-[#666666] dark:text-[#A1A1AA]">
                          [{row.id}]
                        </span>
                        <span>{row.cluster}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${
                          isScale
                            ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isScale ? "bg-[#10B981]" : "bg-[#F59E0B]"
                          }`}
                        />
                        <span>{isScale ? "SCALE" : "HOLD"}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 tabular-nums font-medium text-[#111111] dark:text-[#FAFAFA]">
                      {row.spend}
                    </td>

                    <td className="py-4 px-6 tabular-nums font-semibold text-[#10B981]">
                      {row.roas}
                    </td>

                    <td className="py-4 px-6 text-[#666666] dark:text-[#A1A1AA]">
                      {row.sentiment}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2 py-0.5 text-[9px] uppercase border border-[#E5E5E0] dark:border-[#27272A] rounded bg-black/[0.03] dark:bg-white/[0.03] text-[#111111] dark:text-[#FAFAFA]">
                        {row.vector}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
