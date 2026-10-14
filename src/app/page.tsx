/**
 * Main Chat Application — EL
 * Redesigned with Swiss Editorial Design & Linear/Vercel Aesthetics:
 * - High-Contrast Minimalist (Warm Off-White #F9F9F8 / Deep Zinc #09090B)
 * - Exposed Architectural Grid (Crisp 1px hairline borders, no heavy shadows)
 * - Geist Sans & Geist Mono typography with tabular figures
 * - Semantic Accents: Emerald (Active/Scale), Amber (Notice/Thinking), Rose (Stop/Error)
 * - Directional micro-links (arrow shifts 4px on hover)
 */
"use client";

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useChat, type AttachedDoc } from "@/hooks/use-chat";
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { useSettings } from "@/hooks/use-settings";
import ChatMessage from "@/components/chat-message";
import ChatInput from "@/components/chat-input";
import ModelSelector from "@/components/model-selector";
import ChatSidebar from "@/components/chat-sidebar";
import SettingsModal from "@/components/settings-modal";
import {
  Sparkles,
  Heart,
  Code2,
  PenTool,
  GraduationCap,
  Lightbulb,
  Scale,
  Handshake,
  Clock,
  ShieldAlert,
  Compass,
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  CheckSquare,
  Plus,
  Globe,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Activity,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("ag/gemini-3.8-flash-high");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Gem Skill selection state for new/initial chats
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);
  const [gemWarning, setGemWarning] = useState<boolean>(false);
  const [inputDraft, setInputDraft] = useState<string>("");

  // Settings & Gem Skills Hook
  const {
    settings,
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
  } = useSettings();

  // Multi-session history hook
  const {
    sessions,
    activeSession,
    activeSessionId,
    isLoaded,
    createNewSession,
    switchSession,
    deleteSession,
    renameSession,
    clearAllSessions,
    saveSessionMessages,
    updateSessionGem,
    updateSessionModel,
  } = useChatSessions(selectedModel);

  // Chat hook
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    regenerateLast,
    loadMessages,
  } = useChat({
    model: selectedModel,
    systemPrompt: getComputedSystemPrompt(),
    onMessagesUpdate: (updatedMessages) => {
      if (activeSessionId) {
        const currentGem = selectedGemId === "general" ? null : selectedGemId;
        saveSessionMessages(activeSessionId, updatedMessages, selectedModel, currentGem);
      }
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const currentSessionIdRef = useRef<string>("");
  const shouldAutoScrollRef = useRef(true);


  // Sync active session messages and restore session's gem
  useEffect(() => {
    if (!isLoaded || !activeSession) return;
    if (currentSessionIdRef.current !== activeSession.id) {
      currentSessionIdRef.current = activeSession.id;
      loadMessages(activeSession.messages || []);
      if (activeSession.model) {
        setSelectedModel(activeSession.model);
      }
      if (activeSession.gemId !== undefined && activeSession.gemId !== null) {
        setSelectedGemId(activeSession.gemId);
        setActiveGemId(activeSession.gemId);
      } else if (activeSession.messages && activeSession.messages.length > 0) {
        setSelectedGemId("general");
        setActiveGemId(null);
      } else {
        setSelectedGemId(null);
        setActiveGemId(null);
      }
      setGemWarning(false);
    }
  }, [activeSession, isLoaded, loadMessages, setActiveGemId]);

  // Auto-scroll to bottom safely
  useEffect(() => {
    const container = messagesAreaRef.current;
    if (!container || !shouldAutoScrollRef.current) return;

    if (isStreaming) {
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const handleScroll = useCallback(() => {
    const container = messagesAreaRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceToBottom < 100;
  }, []);

  // Auto collapse sidebar on small screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      setSidebarOpen(false);
    }
  }, []);

  const hasMessages = messages.length > 0;

  // Select Gem for this chat session
  const handleSelectGem = useCallback(
    (gemId: string) => {
      setSelectedGemId(gemId);
      setGemWarning(false);
      const actualGemId = gemId === "general" ? null : gemId;
      setActiveGemId(actualGemId);
      if (activeSessionId) {
        updateSessionGem(activeSessionId, actualGemId);
      }
    },
    [activeSessionId, setActiveGemId, updateSessionGem]
  );

  // Handle send message with Gem Skill requirement validation
  const handleSend = useCallback(
    (text: string, images?: string[], documents?: AttachedDoc[]) => {
      if (!hasMessages && !selectedGemId) {
        setGemWarning(true);
        if (messagesAreaRef.current) {
          messagesAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      setGemWarning(false);
      shouldAutoScrollRef.current = true;
      setInputDraft("");
      const actualGemId = selectedGemId === "general" ? null : selectedGemId;
      if (actualGemId !== activeGem?.id) {
        setActiveGemId(actualGemId);
      }
      sendMessage(text, selectedModel, getComputedSystemPrompt(), images, documents);
    },
    [hasMessages, selectedGemId, activeGem, setActiveGemId, sendMessage, selectedModel, getComputedSystemPrompt]
  );

  // Start new conversation
  const handleNewChat = useCallback(() => {
    const fresh = createNewSession(selectedModel, null);
    currentSessionIdRef.current = fresh.id;
    clearMessages();
    setSelectedGemId(null);
    setActiveGemId(null);
    setInputDraft("");
    setGemWarning(false);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [createNewSession, selectedModel, clearMessages, setActiveGemId]);

  // Switch session from history
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return;

      switchSession(sessionId);
      currentSessionIdRef.current = sessionId;
      loadMessages(target.messages || []);
      if (target.model) {
        setSelectedModel(target.model);
      }
      if (target.gemId !== undefined && target.gemId !== null) {
        setActiveGemId(target.gemId);
        setSelectedGemId(target.gemId);
      } else if (target.messages && target.messages.length > 0) {
        setSelectedGemId("general");
        setActiveGemId(null);
      } else {
        setSelectedGemId(null);
        setActiveGemId(null);
      }
      setGemWarning(false);
    },
    [switchSession, sessions, loadMessages, setActiveGemId]
  );

  // List of all Gem options ordered by hot topic popularity with distinct subtle color themes
  const gemOptions = useMemo(
    () => [
      {
        id: "general",
        index: "01",
        name: t.welcome.generalName,
        description: t.welcome.generalDesc,
        statusLabel: "SCALE / ACTIVE",
        icon: <Sparkles className="w-4 h-4 text-[#10B981]" />,
        theme: {
          accent: "#10B981",
          selectedBg: "bg-emerald-500/[0.08] dark:bg-emerald-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-emerald-500/40 dark:ring-emerald-400/40",
          badgeBg: "bg-emerald-500/15 border-emerald-500/35 text-emerald-800 dark:text-emerald-300",
          indexText: "text-emerald-700 dark:text-emerald-400 font-medium",
          actionText: "text-emerald-700 dark:text-emerald-400 font-medium",
        },
      },
      {
        id: "finance-budget-strategist",
        index: "02",
        name: t.builtInGems.financeBudgetStrategist.name,
        description: t.builtInGems.financeBudgetStrategist.description,
        statusLabel: "50/30/20 BUDGET",
        icon: <Wallet className="w-4 h-4 text-[#0D9488]" />,
        theme: {
          accent: "#0D9488",
          selectedBg: "bg-teal-500/[0.08] dark:bg-teal-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-teal-500/40 dark:ring-teal-400/40",
          badgeBg: "bg-teal-500/15 border-teal-500/35 text-teal-800 dark:text-teal-300",
          indexText: "text-teal-700 dark:text-teal-400 font-medium",
          actionText: "text-teal-700 dark:text-teal-400 font-medium",
        },
      },
      {
        id: "decision-matrix-maker",
        index: "03",
        name: t.builtInGems.decisionMatrixMaker.name,
        description: t.builtInGems.decisionMatrixMaker.description,
        statusLabel: "MULTI-CRITERIA",
        icon: <Scale className="w-4 h-4 text-[#6366F1]" />,
        theme: {
          accent: "#6366F1",
          selectedBg: "bg-indigo-500/[0.08] dark:bg-indigo-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-indigo-500/40 dark:ring-indigo-400/40",
          badgeBg: "bg-indigo-500/15 border-indigo-500/35 text-indigo-800 dark:text-indigo-300",
          indexText: "text-indigo-700 dark:text-indigo-400 font-medium",
          actionText: "text-indigo-700 dark:text-indigo-400 font-medium",
        },
      },
      {
        id: "code-architect",
        index: "04",
        name: t.builtInGems.codeArchitect.name,
        description: t.builtInGems.codeArchitect.description,
        statusLabel: "SYSTEMS / ARCH",
        icon: <Code2 className="w-4 h-4 text-[#8B5CF6]" />,
        theme: {
          accent: "#8B5CF6",
          selectedBg: "bg-violet-500/[0.08] dark:bg-violet-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-violet-500/40 dark:ring-violet-400/40",
          badgeBg: "bg-violet-500/15 border-violet-500/35 text-violet-800 dark:text-violet-300",
          indexText: "text-violet-700 dark:text-violet-400 font-medium",
          actionText: "text-violet-700 dark:text-violet-400 font-medium",
        },
      },
      {
        id: "productivity-planner",
        index: "05",
        name: t.builtInGems.productivityPlanner.name,
        description: t.builtInGems.productivityPlanner.description,
        statusLabel: "TIME-BLOCKING",
        icon: <Clock className="w-4 h-4 text-[#F59E0B]" />,
        theme: {
          accent: "#F59E0B",
          selectedBg: "bg-amber-500/[0.08] dark:bg-amber-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-amber-500/40 dark:ring-amber-400/40",
          badgeBg: "bg-amber-500/15 border-amber-500/35 text-amber-800 dark:text-amber-300",
          indexText: "text-amber-700 dark:text-amber-400 font-medium",
          actionText: "text-amber-700 dark:text-amber-400 font-medium",
        },
      },
      {
        id: "negotiation-strategist",
        index: "06",
        name: t.builtInGems.negotiationStrategist.name,
        description: t.builtInGems.negotiationStrategist.description,
        statusLabel: "HARVARD PON",
        icon: <Handshake className="w-4 h-4 text-[#EA580C]" />,
        theme: {
          accent: "#EA580C",
          selectedBg: "bg-orange-500/[0.08] dark:bg-orange-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-orange-500/40 dark:ring-orange-400/40",
          badgeBg: "bg-orange-500/15 border-orange-500/35 text-orange-800 dark:text-orange-300",
          indexText: "text-orange-700 dark:text-orange-400 font-medium",
          actionText: "text-orange-700 dark:text-orange-400 font-medium",
        },
      },
      {
        id: "psychologist-counselor",
        index: "07",
        name: t.builtInGems.psychologistCounselor.name,
        description: t.builtInGems.psychologistCounselor.description,
        statusLabel: "EMPATHIC / CBT",
        icon: <Heart className="w-4 h-4 text-[#F43F5E]" />,
        theme: {
          accent: "#F43F5E",
          selectedBg: "bg-rose-500/[0.08] dark:bg-rose-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-rose-500/40 dark:ring-rose-400/40",
          badgeBg: "bg-rose-500/15 border-rose-500/35 text-rose-800 dark:text-rose-300",
          indexText: "text-rose-700 dark:text-rose-400 font-medium",
          actionText: "text-rose-700 dark:text-rose-400 font-medium",
        },
      },
      {
        id: "devils-advocate",
        index: "08",
        name: t.builtInGems.devilsAdvocate.name,
        description: t.builtInGems.devilsAdvocate.description,
        statusLabel: "RED TEAM / SKEPTIC",
        icon: <ShieldAlert className="w-4 h-4 text-[#E11D48]" />,
        theme: {
          accent: "#E11D48",
          selectedBg: "bg-red-500/[0.08] dark:bg-red-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-red-500/40 dark:ring-red-400/40",
          badgeBg: "bg-red-500/15 border-red-500/35 text-red-800 dark:text-red-300",
          indexText: "text-red-700 dark:text-red-400 font-medium",
          actionText: "text-red-700 dark:text-red-400 font-medium",
        },
      },
      {
        id: "smart-shopper",
        index: "09",
        name: t.builtInGems.smartShopper.name,
        description: t.builtInGems.smartShopper.description,
        statusLabel: "BENCHMARK / VALUE",
        icon: <ShoppingBag className="w-4 h-4 text-[#2563EB]" />,
        theme: {
          accent: "#2563EB",
          selectedBg: "bg-blue-500/[0.08] dark:bg-blue-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-blue-500/40 dark:ring-blue-400/40",
          badgeBg: "bg-blue-500/15 border-blue-500/35 text-blue-800 dark:text-blue-300",
          indexText: "text-blue-700 dark:text-blue-400 font-medium",
          actionText: "text-blue-700 dark:text-blue-400 font-medium",
        },
      },
      {
        id: "project-sop-builder",
        index: "10",
        name: t.builtInGems.projectSopBuilder.name,
        description: t.builtInGems.projectSopBuilder.description,
        statusLabel: "SOP / MILESTONES",
        icon: <CheckSquare className="w-4 h-4 text-[#059669]" />,
        theme: {
          accent: "#059669",
          selectedBg: "bg-emerald-600/[0.08] dark:bg-emerald-600/[0.16]",
          selectedRing: "ring-1 ring-inset ring-emerald-600/40 dark:ring-emerald-500/40",
          badgeBg: "bg-emerald-600/15 border-emerald-600/35 text-emerald-900 dark:text-emerald-300",
          indexText: "text-emerald-800 dark:text-emerald-400 font-medium",
          actionText: "text-emerald-800 dark:text-emerald-400 font-medium",
        },
      },
      {
        id: "writing-editor",
        index: "11",
        name: t.builtInGems.writingEditor.name,
        description: t.builtInGems.writingEditor.description,
        statusLabel: "SWISS EDITORIAL",
        icon: <PenTool className="w-4 h-4 text-[#B45309]" />,
        theme: {
          accent: "#B45309",
          selectedBg: "bg-amber-600/[0.08] dark:bg-amber-600/[0.16]",
          selectedRing: "ring-1 ring-inset ring-amber-600/40 dark:ring-amber-500/40",
          badgeBg: "bg-amber-600/15 border-amber-600/35 text-amber-900 dark:text-amber-300",
          indexText: "text-amber-800 dark:text-amber-400 font-medium",
          actionText: "text-amber-800 dark:text-amber-400 font-medium",
        },
      },
      {
        id: "travel-concierge",
        index: "12",
        name: t.builtInGems.travelConcierge.name,
        description: t.builtInGems.travelConcierge.description,
        statusLabel: "GEO-OPTIMIZED",
        icon: <Compass className="w-4 h-4 text-[#0284C7]" />,
        theme: {
          accent: "#0284C7",
          selectedBg: "bg-sky-500/[0.08] dark:bg-sky-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-sky-500/40 dark:ring-sky-400/40",
          badgeBg: "bg-sky-500/15 border-sky-500/35 text-sky-800 dark:text-sky-300",
          indexText: "text-sky-700 dark:text-sky-400 font-medium",
          actionText: "text-sky-700 dark:text-sky-400 font-medium",
        },
      },
      {
        id: "chef-meal-planner",
        index: "13",
        name: t.builtInGems.chefMealPlanner.name,
        description: t.builtInGems.chefMealPlanner.description,
        statusLabel: "ZERO-WASTE",
        icon: <UtensilsCrossed className="w-4 h-4 text-[#F97316]" />,
        theme: {
          accent: "#F97316",
          selectedBg: "bg-orange-500/[0.08] dark:bg-orange-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-orange-500/40 dark:ring-orange-400/40",
          badgeBg: "bg-orange-500/15 border-orange-500/35 text-orange-800 dark:text-orange-300",
          indexText: "text-orange-700 dark:text-orange-400 font-medium",
          actionText: "text-orange-700 dark:text-orange-400 font-medium",
        },
      },
      {
        id: "learning-coach",
        index: "14",
        name: t.builtInGems.learningCoach.name,
        description: t.builtInGems.learningCoach.description,
        statusLabel: "SOCRATIC / FEYNMAN",
        icon: <GraduationCap className="w-4 h-4 text-[#06B6D4]" />,
        theme: {
          accent: "#06B6D4",
          selectedBg: "bg-cyan-500/[0.08] dark:bg-cyan-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-cyan-500/40 dark:ring-cyan-400/40",
          badgeBg: "bg-cyan-500/15 border-cyan-500/35 text-cyan-800 dark:text-cyan-300",
          indexText: "text-cyan-700 dark:text-cyan-400 font-medium",
          actionText: "text-cyan-700 dark:text-cyan-400 font-medium",
        },
      },
      {
        id: "creative-brainstormer",
        index: "15",
        name: t.builtInGems.creativeBrainstormer.name,
        description: t.builtInGems.creativeBrainstormer.description,
        statusLabel: "LATERAL / DIVERGENT",
        icon: <Lightbulb className="w-4 h-4 text-[#D946EF]" />,
        theme: {
          accent: "#D946EF",
          selectedBg: "bg-fuchsia-500/[0.08] dark:bg-fuchsia-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-fuchsia-500/40 dark:ring-fuchsia-400/40",
          badgeBg: "bg-fuchsia-500/15 border-fuchsia-500/35 text-fuchsia-800 dark:text-fuchsia-300",
          indexText: "text-fuchsia-700 dark:text-fuchsia-400 font-medium",
          actionText: "text-fuchsia-700 dark:text-fuchsia-400 font-medium",
        },
      },
      ...settings.customGems.map((cg, cIdx) => ({
        id: cg.id,
        index: String(16 + cIdx).padStart(2, "0"),
        name: cg.name,
        description: cg.description,
        statusLabel: "CUSTOM VECTOR",
        icon: <Layers className="w-4 h-4 text-[#10B981]" />,
        theme: {
          accent: "#10B981",
          selectedBg: "bg-emerald-500/[0.08] dark:bg-emerald-500/[0.16]",
          selectedRing: "ring-1 ring-inset ring-emerald-500/40 dark:ring-emerald-400/40",
          badgeBg: "bg-emerald-500/15 border-emerald-500/35 text-emerald-800 dark:text-emerald-300",
          indexText: "text-emerald-700 dark:text-emerald-400 font-medium",
          actionText: "text-emerald-700 dark:text-emerald-400 font-medium",
        },
      })),
    ],
    [t, settings.customGems]
  );

  // Suggested starter prompts based on active chosen Gem
  const activePrompts = useMemo(() => {
    if (!selectedGemId || selectedGemId === "general") return t.gemStarters.general;
    if (selectedGemId === "psychologist-counselor") return t.gemStarters.psychologist;
    if (selectedGemId === "code-architect") return t.gemStarters.codeArchitect;
    if (selectedGemId === "writing-editor") return t.gemStarters.writingEditor;
    if (selectedGemId === "learning-coach") return t.gemStarters.learningCoach;
    if (selectedGemId === "creative-brainstormer") return t.gemStarters.creativeBrainstormer;
    if (selectedGemId === "decision-matrix-maker") return t.gemStarters.decisionMatrix;
    if (selectedGemId === "negotiation-strategist") return t.gemStarters.negotiation;
    if (selectedGemId === "productivity-planner") return t.gemStarters.productivity;
    if (selectedGemId === "devils-advocate") return t.gemStarters.devilsAdvocate;
    if (selectedGemId === "travel-concierge") return t.gemStarters.travel;
    if (selectedGemId === "chef-meal-planner") return t.gemStarters.chefMeal;
    if (selectedGemId === "smart-shopper") return t.gemStarters.smartShopper;
    if (selectedGemId === "finance-budget-strategist") return t.gemStarters.financeBudget;
    if (selectedGemId === "project-sop-builder") return t.gemStarters.projectSop;
    return t.gemStarters.general;
  }, [selectedGemId, t]);

  // Paste starter topic into input textarea without auto-sending
  const handleStarterClick = useCallback((prompt: string) => {
    setInputDraft(prompt);
    setTimeout(() => {
      const el = document.getElementById("chat-input") as HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = el.value.length;
      }
    }, 40);
  }, []);

  const currentInputPlaceholder = useMemo(() => {
    if (hasMessages) {
      return t.chat.inputPlaceholder;
    }
    if (!selectedGemId) {
      return t.welcome.warningChooseGem;
    }
    const chosenOpt = gemOptions.find((g) => g.id === selectedGemId);
    const gemName = chosenOpt ? chosenOpt.name : t.welcome.generalName;
    return t.welcome.inputPlaceholderWithGem.replace("{gem}", gemName);
  }, [hasMessages, selectedGemId, gemOptions, t]);

  return (
    <div className="flex fixed inset-0 w-full h-full h-dvh overflow-hidden bg-[#F9F9F8] dark:bg-[#09090B] text-[#111111] dark:text-[#FAFAFA] font-sans antialiased">
      {/* ── Conversation History Sidebar with Exposed 1px Right Border ─ */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
        onRenameSession={renameSession}
        t={t.sidebar}
      />

      {/* ── Main Chat Area ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col w-full h-full h-dvh min-h-0 min-w-0 relative overflow-hidden bg-[#F9F9F8] dark:bg-[#09090B]">
        {/* Minimalist Sticky Header with Exposed 1px Bottom Border */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-2.5 sm:px-6 h-14 border-b border-[#E5E5E0] dark:border-[#27272A] bg-[#F9F9F8]/90 dark:bg-[#09090B]/90 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Sidebar Toggle */}
            <button
              className="p-1.5 border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? t.sidebar.closeSidebar : t.sidebar.openSidebar}
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            {/* Wordmark */}
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base tracking-tighter">
                {t.common.appName}
              </span>
            </div>
          </div>

          {/* Header Controls Right Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Active Gem Skill Pill */}
            {activeGem && (
              <button
                type="button"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] font-mono text-[11px] uppercase tracking-wider"
                onClick={() => setSettingsOpen(true)}
                title={`${t.settings.gemsTitle}: ${activeGem.name}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>{activeGem.name}</span>
              </button>
            )}

            {/* + New Session CTA */}
            <button
              className="group hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
              onClick={handleNewChat}
              title={t.common.newChat}
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.common.newChat}</span>
              <span className="arrow-shift">→</span>
            </button>

            {/* Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={(modelId) => {
                setSelectedModel(modelId);
                if (activeSessionId) {
                  updateSessionModel(activeSessionId, modelId);
                }
              }}
              t={t.modelSelector}
            />

            {/* Language Toggle ID / EN */}
            <button
              onClick={() => setLanguage(settings.language === "en" ? "id" : "en")}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-medium border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors rounded"
              title="Toggle Language (ID / EN)"
            >
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <span>{settings.language.toUpperCase()}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-1.5 border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
              title={settings.theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {settings.theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Settings Modal Toggle */}
            <button
              className="p-1.5 border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
              onClick={() => setSettingsOpen(true)}
              title={t.settings.title}
              type="button"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ── Chat Messages or Gem Skill Selection Matrix ─────────── */}
        {hasMessages ? (
          <div
            ref={messagesAreaRef}
            className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6"
            onScroll={handleScroll}
          >
            {messages.map((msg, idx) => {
              const isLastAssistant = idx === messages.length - 1 && msg.role === "assistant";
              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={isStreaming && isLastAssistant}
                  isLastAssistant={isLastAssistant}
                  onRegenerate={() => regenerateLast(selectedModel)}
                  onContinue={() =>
                    handleSend(
                      t.chat?.continuePrompt ||
                        "Lanjutkan dari bagian yang terpotong secara lengkap dan tuntas sampai selesai."
                    )
                  }
                  t={t.chat}
                />
              );
            })}

            {error && (
              <div className="max-w-2xl mx-auto p-4 border border-[#F43F5E]/30 bg-[#F43F5E]/10 rounded flex items-center gap-3 text-xs font-mono text-[#F43F5E]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div ref={messagesAreaRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Editorial Welcome Header */}
              <div className="mb-10 pb-6 border-b border-[#E5E5E0] dark:border-[#27272A]">
                <span className="font-mono text-xs uppercase tracking-widest text-[#666666] dark:text-[#A1A1AA] mb-2 block">
                  00 // OPERATIONAL GEM SPECIALIZATION MATRIX
                </span>
                <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA]">
                  {t.welcome.chooseGemTitle}
                </h2>
                <p className="max-w-xl text-sm text-[#666666] dark:text-[#A1A1AA] mt-2 font-normal tracking-tight">
                  {t.welcome.chooseGemSubtitle}
                </p>
              </div>

              {/* Warning Banner if user attempts to send message without picking a Gem Skill */}
              {gemWarning && (
                <div className="mb-6 p-4 border border-[#F59E0B]/40 bg-[#F59E0B]/10 rounded flex items-center gap-3 text-xs font-mono text-[#F59E0B] animate-status-pulse">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{t.welcome.warningChooseGem}</span>
                </div>
              )}

              {/* Architectural Grid with Exposed Hairline Borders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E5E0] dark:bg-[#27272A] border border-[#E5E5E0] dark:border-[#27272A] mb-8">
                {gemOptions.map((gem) => {
                  const isSelected = selectedGemId === gem.id;
                  const theme = gem.theme;

                  return (
                    <button
                      key={gem.id}
                      type="button"
                      onClick={() => handleSelectGem(gem.id)}
                      className={`p-4 sm:p-6 text-left flex flex-col justify-between group transition-all duration-150 relative ${
                        isSelected
                          ? `${theme.selectedBg} ${theme.selectedRing}`
                          : "bg-[#F9F9F8] dark:bg-[#09090B] hover:bg-black/[0.025] dark:hover:bg-white/[0.035]"
                      }`}
                    >
                      <div>
                        {/* Top row: Monospace Index + Status Pill */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E0]/60 dark:border-[#27272A]/60">
                          <span
                            className={`font-mono text-sm font-light transition-colors ${
                              isSelected ? theme.indexText : "text-[#666666] dark:text-[#A1A1AA]"
                            }`}
                          >
                            {gem.index} //
                          </span>
                          <span
                            className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border transition-colors ${
                              isSelected
                                ? theme.badgeBg
                                : "border-[#E5E5E0] dark:border-[#27272A] bg-black/[0.03] dark:bg-white/[0.04] text-[#666666] dark:text-[#A1A1AA]"
                            }`}
                          >
                            {isSelected ? "✓ ACTIVE" : gem.statusLabel}
                          </span>
                        </div>

                        {/* Title with icon */}
                        <div className="flex items-center gap-2 mb-2">
                          {gem.icon}
                          <span className="font-medium text-base tracking-tight text-[#111111] dark:text-[#FAFAFA]">
                            {gem.name}
                          </span>
                        </div>

                        {/* Description */}
                        <p
                          className={`text-xs leading-relaxed font-normal mb-6 transition-colors ${
                            isSelected ? "text-[#333333] dark:text-[#D4D4D8]" : "text-[#666666] dark:text-[#A1A1AA]"
                          }`}
                        >
                          {gem.description}
                        </p>
                      </div>

                      {/* Directional Action */}
                      <div
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] transition-colors ${
                          isSelected ? theme.actionText : "text-[#111111] dark:text-[#FAFAFA] group-hover:text-[#10B981]"
                        }`}
                      >
                        <span>{isSelected ? "Specialization Loaded" : "Activate Persona"}</span>
                        <span className="arrow-shift">→</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Starter Prompt Chips (Shown once a Gem is selected) */}
              {selectedGemId && (
                <div className="pt-6 border-t border-[#E5E5E0] dark:border-[#27272A]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#666666] dark:text-[#A1A1AA]">
                      01 // SUGGESTED INFERENCE VECTORS
                    </span>
                    <span className="font-mono text-[10px] text-[#10B981]">
                      Click to insert prompt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activePrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        className="group p-3 text-left border border-[#E5E5E0] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white rounded transition-colors flex items-center justify-between gap-3 bg-black/[0.015] dark:bg-white/[0.015]"
                        onClick={() => handleStarterClick(prompt)}
                        title="Insert into chat input"
                      >
                        <span className="text-xs text-[#111111] dark:text-[#FAFAFA] tracking-tight leading-snug">
                          {prompt}
                        </span>
                        <span className="font-mono text-xs text-[#666666] dark:text-[#A1A1AA] group-hover:text-[#111111] dark:group-hover:text-white arrow-shift">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Input Area with Exposed 1px Top Border ──────────────── */}
        <div className="border-t border-[#E5E5E0] dark:border-[#27272A] bg-[#F9F9F8]/90 dark:bg-[#09090B]/90 backdrop-blur-md pt-2 sm:pt-3 pb-2 sm:pb-4">
          <ChatInput
            value={inputDraft}
            onChange={setInputDraft}
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            t={t.chat}
            placeholder={currentInputPlaceholder}
          />
        </div>
      </main>

      {/* ── Settings & Gem Skills Modal ────────────────────────────── */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        allGems={allGems}
        activeGem={activeGem}
        onSetTheme={setTheme}
        onSetLanguage={setLanguage}
        onSetActiveGemId={(id) => {
          setActiveGemId(id);
          setSelectedGemId(id || "general");
          if (activeSessionId) {
            updateSessionGem(activeSessionId, id);
          }
        }}
        onUpdateSettings={updateSettings}
        onAddCustomGem={addCustomGem}
        onDeleteCustomGem={deleteCustomGem}
        t={t.settings}
      />
    </div>
  );
}
