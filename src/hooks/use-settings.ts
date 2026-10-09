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
      "- Never use telegraphic, chopped, or overly compressed sentences. Write full, flowing, grammatically complete explanations."
    );

    // Default Indonesian language instruction
    if (settings.language === "id") {
      parts.push(
        "[Panduan Bahasa Indonesia]\nSampaikan seluruh penjelasan dalam Bahasa Indonesia yang fasih, ilmiah, runtut, dan kaya konteks seperti Google Gemini resmi. Gunakan struktur paragraf yang utuh dan mengalir."
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
