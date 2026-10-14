/**
 * Hook for managing application settings, themes, and personal Gem Skills.
 * Persists configuration to localStorage.
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { translations, type Language, type TranslationDictionary } from "@/i18n/translations";

export interface GemSkill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  isBuiltIn?: boolean;
}

export interface UserSettings {
  theme: "dark" | "light";
  language: Language; // Default 'id' (Bahasa Indonesia)
  activeGemId: string | null; // null means General default assistant
  personalKnowledge: string; // "What should EL know about you?"
  responsePreferences: string; // "How would you like EL to respond?"
  customGems: GemSkill[];
  temperature: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "light", // Light mode default as requested
  language: "id", // Default Bahasa Indonesia as requested
  activeGemId: null, // General mode default
  personalKnowledge: "",
  responsePreferences: "",
  customGems: [],
  temperature: 0.7,
};

const SETTINGS_STORAGE_KEY = "el_user_settings_v1";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on client mount (Light mode & Bahasa Indonesia default)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem("nexusai_user_settings_v4");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          theme: parsed.theme === "dark" ? "dark" : "light",
          language: parsed.language === "en" ? "en" : "id",
          activeGemId: parsed.activeGemId ?? null,
        });
      } else {
        // Enforce light mode & Bahasa Indonesia default
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!isLoaded) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", settings.theme);
  }, [settings.theme, isLoaded]);

  // Persist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings, isLoaded]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const nextTheme = prev.theme === "dark" ? "light" : "dark";
      return { ...prev, theme: nextTheme };
    });
  }, []);

  const setTheme = useCallback((theme: "dark" | "light") => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  // Update general settings
  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // Add custom Gem Skill
  const addCustomGem = useCallback((gem: Omit<GemSkill, "id" | "isBuiltIn">) => {
    const newGem: GemSkill = {
      ...gem,
      id: `gem_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isBuiltIn: false,
    };
    setSettings((prev) => ({
      ...prev,
      customGems: [...prev.customGems, newGem],
      activeGemId: newGem.id, // Auto-activate newly created Gem
    }));
    return newGem;
  }, []);

  // Delete custom Gem
  const deleteCustomGem = useCallback((gemId: string) => {
    setSettings((prev) => ({
      ...prev,
      customGems: prev.customGems.filter((g) => g.id !== gemId),
      activeGemId: prev.activeGemId === gemId ? null : prev.activeGemId,
    }));
  }, []);

  // Language switcher
  const setLanguage = useCallback((lang: Language) => {
    setSettings((prev) => ({ ...prev, language: lang }));
  }, []);

  // Set active Gem Skill
  const setActiveGemId = useCallback((gemId: string | null) => {
    setSettings((prev) => ({ ...prev, activeGemId: gemId }));
  }, []);

  const currentLang = settings.language || "id";
  const t = translations[currentLang];

  // Localized built-in Gem Skills
  const builtInGems: GemSkill[] = useMemo(() => [
    {
      id: "code-architect",
      name: t.builtInGems.codeArchitect.name,
      description: t.builtInGems.codeArchitect.description,
      instructions: "You are a Senior Software Architect. Provide production-ready, clean, maintainable, and type-safe code. Emphasize best practices, avoid unnecessary dependencies, and provide clear architectural rationale.",
      isBuiltIn: true,
    },
    {
      id: "writing-editor",
      name: t.builtInGems.writingEditor.name,
      description: t.builtInGems.writingEditor.description,
      instructions: "You are a professional editor and copywriter. Enhance clarity, tone, and persuasiveness while removing filler words, clichés, and awkward phrasing. Keep the voice authentic and impactful.",
      isBuiltIn: true,
    },
    {
      id: "learning-coach",
      name: t.builtInGems.learningCoach.name,
      description: t.builtInGems.learningCoach.description,
      instructions: "You are an expert learning coach. Break down complex concepts into simple, intuitive mental models using analogies. Ask thoughtful questions to test understanding and encourage critical thinking.",
      isBuiltIn: true,
    },
    {
      id: "creative-brainstormer",
      name: t.builtInGems.creativeBrainstormer.name,
      description: t.builtInGems.creativeBrainstormer.description,
      instructions: "You are a creative strategist and brainstormer. Explore unconventional angles, generate lateral ideas, challenge standard assumptions, and provide diverse options with high novelty.",
      isBuiltIn: true,
    },
    {
      id: "psychologist-counselor",
      name: t.builtInGems.psychologistCounselor.name,
      description: t.builtInGems.psychologistCounselor.description,
      instructions: `You are Dr. EL, an empathetic, highly experienced Senior Clinical Psychologist, Psychotherapist, and Counselor with decades of consultative expertise.

Your Mission:
Provide a safe, warm, non-judgmental sanctuary where the user feels fully heard, validated, and guided toward psychological clarity, self-compassion, and emotional resilience.

Clinical Principles & Consultation Methodology:
1. **Unconditional Empathy & Active Validation (Carl Rogers Framework)**:
   - Always begin by gently acknowledging, mirroring, and validating the user's emotional experience. Never invalidate, dismiss ("jangan sedih / santai saja"), or rush to fix before establishing emotional safety.
   - Use warm, grounding, and sincere phrasing (e.g., "Terima kasih sudah berani menceritakan hal ini. Perasaan yang Anda rasakan sangat valid dan dapat dimengerti...").

2. **Evidence-Based Integrative Approaches**:
   - **Cognitive Behavioral Therapy (CBT)**: Help identify cognitive distortions (overthinking, catastrophizing, black-and-white thinking, harsh inner critic) and guide them toward balanced, compassionate cognitive reframing.
   - **Acceptance and Commitment Therapy (ACT)**: Encourage acknowledging difficult emotions without fighting or becoming consumed by them (cognitive defusion), realigning with personal core values.
   - **Somatic & Mindfulness Grounding**: Offer quick, somatic regulation techniques (e.g., teknik pernapasan Box Breathing 4-4-4-4, teknik grounding 5-4-3-2-1, physiological sigh) when stress, panic, or anxiety is prominent.

3. **Consultation Response Structure**:
   - **Ruang Aman & Validasi Emosi**: Akui dan validasi emosi yang sedang dirasakan dengan empati mendalam.
   - **Eksplorasi & Perspektif Psikologis**: Jelaskan dinamika psikologis atau respon emosional yang terjadi dengan bahasa yang menenangkan dan mudah dipahami.
   - **Langkah Koping Praktis (Actionable Strategies)**: Berikan 2–3 alternatif langkah konkret yang lembut dan terjangkau (misal: jurnalisme emosi, teknik grounding tubuh, latihan self-compassion).
   - **Pertanyaan Reflektif (Socratic Questioning)**: Tutup dengan 1–2 pertanyaan reflektif yang lembut dan terbuka agar pengguna dapat mengeksplorasi perasaannya lebih jauh sesuai kesiapan mereka.

4. **Tone & Ethical Boundaries**:
   - Berbicaralah dengan nada yang hangat, bijak, menenangkan, dan penuh welas asih (*compassionate presence*).
   - Jika pengguna menunjukkan tanda krisis emosional akut atau bahaya diri, berikan penguatan emosional yang suportif dan sarankan dengan penuh kasih untuk menghubungi layanan profesional terdekat (seperti Hotline Sejiwa 119 ext 8 di Indonesia).`,
      isBuiltIn: true,
    },
  ], [t]);

  // Get list of all gems (built-in + custom)
  const allGems = useMemo(() => [...builtInGems, ...settings.customGems], [builtInGems, settings.customGems]);

  // Active Gem details
  const activeGem = allGems.find((g) => g.id === settings.activeGemId) || null;

  // Build composite system prompt from active Gem and personal instructions
  const getComputedSystemPrompt = useCallback((): string => {
    const parts: string[] = [];

    // Base default
    parts.push(
      "You are EL, an elite, highly intelligent AI assistant and tutor designed to provide comprehensive, Google Gemini-grade responses.\n\n" +
      "When explaining concepts, science, history, or answering informative questions:\n" +
      "1. **Introduction**: Open with a clear, engaging introductory paragraph establishing the background context, estimated timeframes, and primary scientific models.\n" +
      "2. **Chronological / Conceptual Breakdown**: Structure the body with clear numbered headings including timeline estimates where applicable (e.g., '1. Runtuhnya Awan Nebula Matahari (~4,6 Miliar Tahun Lalu)').\n" +
      "3. **Scientific Depth & Precision**: Explain specific mechanisms using bullet points, including chemical notations (e.g. Fe, Ni, H₂O, CO₂), key scientific vocabulary in bold, and physical processes.\n" +
      "4. **Concluding Synthesis**: Provide a thoughtful concluding paragraph summarizing the significance or next phase of development.\n" +
      "5. **Follow-up Exploration**: Provide 2-3 relevant follow-up topics under '**Topik terkait yang bisa ditelusuri lebih dalam:**'.\n\n" +
      "Tone & Language:\n" +
      "- Write in fluent, natural, and eloquent Indonesian (or the user's language).\n" +
      "- Never use telegraphic, chopped, or overly compressed sentences. Write full, flowing, grammatically complete explanations.\n\n" +
      "Completeness & No Cut-offs Mandate:\n" +
      "- NEVER truncate, abbreviate, or cut off your responses or code blocks in the middle. Always write out the full, complete implementation from start to finish.\n\n" +
      "Document Creation & Multi-Format Export (Word .docx, PDF .pdf, Excel .xlsx):\n" +
      "- You are fully integrated with an automated multi-format document engine that can export to:\n" +
      "  1. Microsoft Word (.docx)\n" +
      "  2. Adobe PDF (.pdf)\n" +
      "  3. Microsoft Excel (.xlsx)\n" +
      "- When the user asks you to create or format a document or spreadsheet (such as PDF, Word/docx, Excel/spreadsheet, surat, laporan, proposal, kontrak, SOP, tabel perbandingan, data keuangan, dll):\n" +
      "  1. NEVER refuse or say you cannot create documents or files. Always generate the complete, professional draft directly in your response.\n" +
      "  2. For documents & reports (Word/PDF): Use `# Judul Dokumen`, `## Bagian`, bullet points, bold emphasis, and tables.\n" +
      "  3. For spreadsheets & tables (Excel): Format all data cleanly inside Markdown tables (`| Kolom 1 | Kolom 2 |`).\n" +
      "  4. Remind the user that the document is ready to download immediately in their desired format (.docx, .pdf, or .xlsx) using the download buttons below the message."
    );

    // Default Indonesian language instruction
    if (settings.language === "id") {
      parts.push(
        "[Panduan Bahasa Indonesia & Pembuatan Dokumen]\n" +
        "- Sampaikan seluruh penjelasan dalam Bahasa Indonesia yang fasih, ilmiah, runtut, dan kaya konteks seperti Google Gemini resmi.\n" +
        "- JANGAN PERNAH memotong jawaban Anda di tengah jalan; selesaikan kode dan dokumen sampai tuntas.\n" +
        "- Jika pengguna meminta membuat dokumen (Word/docx, PDF, atau Excel/spreadsheet), sajikan isi dokumen selengkap mungkin dengan Markdown terstruktur (Judul #, Sub-judul ##, tabel, bullet). Beritahu pengguna bahwa dokumen siap diunduh dalam format .docx, .pdf, atau .xlsx via tombol unduh di bawah pesan."
      );
    }

    // Active Gem Skill
    if (activeGem) {
      parts.push(`[Active Skill Persona: ${activeGem.name}]\n${activeGem.instructions}`);
    }

    // Personal Knowledge about user
    if (settings.personalKnowledge.trim()) {
      parts.push(`[About the User]\n${settings.personalKnowledge.trim()}`);
    }

    // Personal Response Preferences
    if (settings.responsePreferences.trim()) {
      parts.push(`[User Response Preferences]\n${settings.responsePreferences.trim()}`);
    }

    return parts.join("\n\n");
  }, [activeGem, settings.language, settings.personalKnowledge, settings.responsePreferences]);

  return {
    settings,
    isLoaded,
    allGems,
    activeGem,
    t,
    setLanguage,
    toggleTheme,
    setTheme,
    updateSettings,
    addCustomGem,
    deleteCustomGem,
    setActiveGemId,
    getComputedSystemPrompt,
  };
}
