/**
 * ModelSelector — dropdown to pick the AI model.
 * Clean, minimalistic design without cluttering emoji/icons.
 */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { ModelInfo } from "@/hooks/use-chat";
import type { TranslationDictionary } from "@/i18n/translations";
import styles from "./model-selector.module.css";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  t?: TranslationDictionary["modelSelector"];
}

const PROVIDER_COLORS: Record<string, string> = {
  ag: "#38bdf8",
  gh: "#8b5cf6",
  cx: "#10b981",
  gcli: "#f97316",
  kc: "#06b6d4",
};

const PROVIDER_LABELS: Record<string, string> = {
  ag: "Antigravity (Verified)",
  gh: "GitHub (Free/Fast)",
  cx: "Codex / GPT-5",
  gcli: "xAI Grok",
  kc: "KiloCode (Credits Req)",
};

export default function ModelSelector({ selectedModel, onModelChange, t }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"verified" | "all" | "reasoning">("verified");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setModels(data.models || []);
      } catch {
        // Fallback models if API fails
        setModels([
          { id: "ag/gemini-3.8-flash-medium", name: "Gemini 3.8 Flash (Medium)", provider: "ag", vision: true, reasoning: true, contextWindow: 1048576, status: "verified", isRecommended: true },
          { id: "ag/gemini-3.8-flash-high", name: "Gemini 3.8 Flash (High)", provider: "ag", vision: true, reasoning: true, contextWindow: 1048576, status: "verified", isRecommended: true },
          { id: "ag/claude-sonnet-4-6", name: "Claude Sonnet 4.6 (Thinking)", provider: "ag", vision: true, reasoning: true, contextWindow: 200000, status: "verified", isRecommended: true },
          { id: "ag/claude-opus-4-6-thinking", name: "Claude Opus 4.6 (Thinking)", provider: "ag", vision: true, reasoning: true, contextWindow: 200000, status: "verified", isRecommended: true },
          { id: "gh/gpt-4o-mini", name: "GPT-4o Mini (Default)", provider: "gh", vision: true, reasoning: false, contextWindow: 128000, status: "verified", isRecommended: true },
          { id: "gh/gpt-4o", name: "GPT-4o Omnimodal", provider: "gh", vision: true, reasoning: false, contextWindow: 128000, status: "verified", isRecommended: true },
          { id: "cx/gpt-5.5", name: "GPT-5.5 Flagship", provider: "cx", vision: true, reasoning: true, contextWindow: 1050000, status: "verified", isRecommended: true },
          { id: "gcli/grok-4.7", name: "Grok 4.7 Reasoning", provider: "gcli", vision: true, reasoning: true, contextWindow: 256000, status: "verified", isRecommended: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = models.find((m) => m.id === selectedModel);
  const displayName = selected?.name || selectedModel.split("/").pop() || "Select Model";

  // Filtered models
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      // Tab filter
      if (tab === "verified" && m.status !== "verified") return false;
      if (tab === "reasoning" && !m.reasoning) return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [models, tab, search]);

  // Group models by provider
  const grouped = useMemo(() => {
    return filteredModels.reduce<Record<string, ModelInfo[]>>((acc, m) => {
      const key = m.provider;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {});
  }, [filteredModels]);

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        id="model-selector"
        aria-label="Select AI model"
        aria-expanded={isOpen}
      >
        <span className={styles.modelName}>{isLoading ? (t?.selectModel || "Pilih Model") : displayName}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Search box */}
          <div className={styles.searchWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t?.searchPlaceholder || "Cari model..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Filter tabs */}
          <div className={styles.tabsRow}>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === "verified" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("verified")}
            >
              {t?.tabVerified || "Terverifikasi Aktif"}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === "reasoning" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("reasoning")}
            >
              {t?.tabReasoning || "Penalaran"}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === "all" ? styles.tabBtnActive : ""}`}
              onClick={() => setTab("all")}
            >
              {t ? t.tabAll.replace("{count}", String(models.length)) : `Semua (${models.length})`}
            </button>
          </div>

          {/* Grouped list */}
          {Object.keys(grouped).length === 0 ? (
            <div className={styles.noModels}>{t?.noModelsFound || "Model tidak ditemukan."}</div>
          ) : (
            Object.entries(grouped).map(([provider, providerModels]) => (
              <div key={provider} className={styles.group}>
                <div className={styles.groupLabel}>
                  <div className={styles.groupLeft}>
                    <span
                      className={styles.providerDot}
                      style={{ background: PROVIDER_COLORS[provider] || "#64748b" }}
                    />
                    <span>{PROVIDER_LABELS[provider] || provider}</span>
                  </div>
                  <span>{providerModels.length}</span>
                </div>

                {providerModels.map((m) => (
                  <button
                    key={m.id}
                    className={`${styles.option} ${m.id === selectedModel ? styles.optionActive : ""}`}
                    onClick={() => {
                      onModelChange(m.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className={styles.optionInfo}>
                      <span className={styles.optionName}>{m.name}</span>
                      <span className={styles.optionSub}>{m.id}</span>
                    </div>

                    <div className={styles.optionBadges}>
                      {m.status === "verified" && (
                        <span className={`${styles.badge} ${styles.badgeVerified}`}>{t?.activeBadge || "Aktif"}</span>
                      )}
                      {m.status === "credits_required" && (
                        <span className={`${styles.badge} ${styles.badgeCredits}`}>{t?.creditsBadge || "Kredit"}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
