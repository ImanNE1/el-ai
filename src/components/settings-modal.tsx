/**
 * SettingsModal component — Theme controls (Dark default / Light)
 * and Google Gemini-style Gem Skills (Personal Skills & Custom Instructions).
 */
"use client";

import React, { useState } from "react";
import type { GemSkill, UserSettings } from "@/hooks/use-settings";
import type { Language, TranslationDictionary } from "@/i18n/translations";
import styles from "./settings-modal.module.css";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  allGems: GemSkill[];
  activeGem: GemSkill | null;
  onSetTheme: (theme: "dark" | "light") => void;
  onSetLanguage: (lang: Language) => void;
  onSetActiveGemId: (id: string | null) => void;
  onUpdateSettings: (partial: Partial<UserSettings>) => void;
  onAddCustomGem: (gem: Omit<GemSkill, "id" | "isBuiltIn">) => void;
  onDeleteCustomGem: (id: string) => void;
  t?: TranslationDictionary["settings"];
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  allGems,
  activeGem,
  onSetTheme,
  onSetLanguage,
  onSetActiveGemId,
  onUpdateSettings,
  onAddCustomGem,
  onDeleteCustomGem,
  t,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"appearance" | "gems" | "preferences">("appearance");

  // New Gem Creator State
  const [showCreateGem, setShowCreateGem] = useState(false);
  const [newGemName, setNewGemName] = useState("");
  const [newGemDesc, setNewGemDesc] = useState("");
  const [newGemInstructions, setNewGemInstructions] = useState("");

  if (!isOpen) return null;

  const handleCreateGem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGemName.trim() || !newGemInstructions.trim()) return;

    onAddCustomGem({
      name: newGemName.trim(),
      description: newGemDesc.trim() || "Custom Personal Gem",
      instructions: newGemInstructions.trim(),
    });

    setNewGemName("");
    setNewGemDesc("");
    setNewGemInstructions("");
    setShowCreateGem(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span>{t?.title || "Pengaturan & Preferensi"}</span>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "appearance" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            <span>{t?.tabAppearance || "Tampilan"}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "gems" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("gems")}
          >
            <span>{t?.tabGems || "Gem Skill"}</span>
            {activeGem && <span style={{ fontSize: "11px", opacity: 0.9 }}>• Active</span>}
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "preferences" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <span>{t?.tabPersonal || "Instruksi Pribadi"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.body}>
          {/* TAB 1: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{t?.themeTitle || "Mode Tema"}</h3>
                <p className={styles.sectionDesc}>{t?.themeDesc || "Pilih preferensi tema visual untuk antarmuka asisten."}</p>
              </div>

              <div className={styles.themeGrid}>
                <div
                  className={`${styles.themeCard} ${settings.theme === "dark" ? styles.themeCardActive : ""}`}
                  onClick={() => onSetTheme("dark")}
                >
                  <div className={styles.themeCardInfo}>
                    <span className={styles.themeCardTitle}>{t?.themeDark || "Mode Gelap"}</span>
                    <span className={styles.themeCardSub}>{t?.themeDarkSub || "Glassmorphism elegan dengan kontras tinggi"}</span>
                  </div>
                </div>

                <div
                  className={`${styles.themeCard} ${settings.theme === "light" ? styles.themeCardActive : ""}`}
                  onClick={() => onSetTheme("light")}
                >
                  <div className={styles.themeCardInfo}>
                    <span className={styles.themeCardTitle}>{t?.themeLight || "Mode Terang (Bawaan)"}</span>
                    <span className={styles.themeCardSub}>{t?.themeLightSub || "Palet cerah yang jernih dan nyaman"}</span>
                  </div>
                </div>
              </div>

              {/* Language Selector */}
              <div style={{ marginTop: "14px" }}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{t?.languageTitle || "Bahasa Antarmuka"}</h3>
                  <p className={styles.sectionDesc}>{t?.languageDesc || "Pilih bahasa tampilan untuk aplikasi."}</p>
                </div>

                <div className={styles.themeGrid}>
                  <div
                    className={`${styles.themeCard} ${settings.language === "id" ? styles.themeCardActive : ""}`}
                    onClick={() => onSetLanguage("id")}
                  >
                    <div className={styles.themeCardInfo}>
                      <span className={styles.themeCardTitle}>{t?.langId || "Bahasa Indonesia (Bawaan)"}</span>
                      <span className={styles.themeCardSub}>Bahasa utama sistem & AI</span>
                    </div>
                  </div>

                  <div
                    className={`${styles.themeCard} ${settings.language === "en" ? styles.themeCardActive : ""}`}
                    onClick={() => onSetLanguage("en")}
                  >
                    <div className={styles.themeCardInfo}>
                      <span className={styles.themeCardTitle}>{t?.langEn || "English"}</span>
                      <span className={styles.themeCardSub}>English interface & AI preference</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEM SKILLS */}
          {activeTab === "gems" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{t?.gemsTitle || "Gem Skill"}</h3>
                <p className={styles.sectionDesc}>
                  {t?.gemsDesc || "Peran khusus yang disesuaikan untuk tugas, alur kerja, dan keahlian spesifik."}
                </p>
              </div>

              {/* Gem Cards List */}
              <div className={styles.gemsList}>
                {/* General Option (Default) */}
                <div
                  className={`${styles.gemCard} ${settings.activeGemId === null ? styles.gemCardActive : ""}`}
                  onClick={() => onSetActiveGemId(null)}
                >
                  <div className={styles.gemLeft}>
                    <div className={styles.gemInfo}>
                      <div className={styles.gemNameRow}>
                        <span className={styles.gemName}>{t?.gemGeneralName || "Umum (Bawaan)"}</span>
                        {settings.activeGemId === null && <span className={styles.gemBadge}>{settings.language === "en" ? "Active" : "Aktif"}</span>}
                      </div>
                      <span className={styles.gemDesc}>
                        {t?.gemGeneralDesc || "Asisten serba guna yang bijak untuk semua tugas tanpa batasan peran."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Built-in & Custom Gems */}
                {allGems.map((gem) => {
                  const isActive = settings.activeGemId === gem.id;
                  return (
                    <div
                      key={gem.id}
                      className={`${styles.gemCard} ${isActive ? styles.gemCardActive : ""}`}
                      onClick={() => onSetActiveGemId(gem.id)}
                    >
                      <div className={styles.gemLeft}>
                        <div className={styles.gemInfo}>
                          <div className={styles.gemNameRow}>
                            <span className={styles.gemName}>{gem.name}</span>
                            {isActive && <span className={styles.gemBadge}>{settings.language === "en" ? "Active" : "Aktif"}</span>}
                          </div>
                          <span className={styles.gemDesc}>{gem.description}</span>
                        </div>
                      </div>

                      {!gem.isBuiltIn && (
                        <button
                          type="button"
                          className={styles.gemDeleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomGem(gem.id);
                          }}
                          title={t?.deleteGemTitle || "Hapus Gem kustom"}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Create Custom Gem Box */}
              <div className={styles.createGemBox}>
                <div
                  className={styles.createGemHeader}
                  onClick={() => setShowCreateGem(!showCreateGem)}
                >
                  <span className={styles.createGemHeaderTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>{showCreateGem ? (t?.cancelCreateGem || "Batal Buat Gem") : (t?.createGemTitle || "+ Buat Gem Skill Anda Sendiri")}</span>
                  </span>
                </div>

                {showCreateGem && (
                  <form onSubmit={handleCreateGem} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>{t?.gemNameLabel || "Nama Gem"}</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder={t?.gemNamePlaceholder || "cth. Mentor Next.js, Pengoptimal SQL, Asisten Pribadi"}
                        value={newGemName}
                        onChange={(e) => setNewGemName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.formLabel}>{t?.gemDescLabel || "Deskripsi Singkat"}</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder={t?.gemDescPlaceholder || "Ringkasan singkat fungsi Gem ini"}
                        value={newGemDesc}
                        onChange={(e) => setNewGemDesc(e.target.value)}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label className={styles.formLabel}>{t?.gemInstructionsLabel || "Instruksi Khusus Gem"}</label>
                      <textarea
                        className={styles.formTextarea}
                        placeholder={t?.gemInstructionsPlaceholder || "Tentukan bagaimana Gem ini harus berpikir, bertindak, dan menjawab..."}
                        value={newGemInstructions}
                        onChange={(e) => setNewGemInstructions(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className={styles.createSubmitBtn}>
                      {t?.saveGemBtn || "Simpan & Aktifkan Gem"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL INSTRUCTIONS */}
          {activeTab === "preferences" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{t?.personalTitle || "Konteks & Preferensi Pribadi"}</h3>
                <p className={styles.sectionDesc}>
                  {t?.personalDesc || "Berikan informasi agar EL mengenali Anda dan selalu menyesuaikan jawaban dengan preferensi Anda."}
                </p>
              </div>

              <div className={styles.instructionsBox}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t?.personalKnowledgeLabel || "Apa yang ingin Anda beritahukan kepada EL tentang diri Anda?"}</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder={t?.personalKnowledgePlaceholder || "cth. Saya seorang pengembang perangkat lunak..."}
                    value={settings.personalKnowledge}
                    onChange={(e) => onUpdateSettings({ personalKnowledge: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>{t?.responsePreferencesLabel || "Bagaimana Anda ingin EL memberikan tanggapan?"}</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder={t?.responsePreferencesPlaceholder || "cth. Berikan penjelasan lugas, ringkas..."}
                    value={settings.responsePreferences}
                    onChange={(e) => onUpdateSettings({ responsePreferences: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            {t?.doneBtn || "Selesai"}
          </button>
        </div>
      </div>
    </div>
  );
}
