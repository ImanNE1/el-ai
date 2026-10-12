/**
 * Main Chat Page — EL
 * Features:
 * - Persistent Conversation History (Sidebar with sessions, rename, delete)
 * - Multi-model gateway with verified Antigravity models (ag/)
 * - Mandatory Gem Skill selection before initial / new chat starts
 * - General purpose AI assistant & specialized skill personas
 * - Markdown rendering with syntax highlighting & one-click copy
 * - Live streaming with reasoning / thought process
 * - Chat export (Markdown download)
 * - Clean anti-slop design with rich aesthetics
 */
"use client";

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useChat } from "@/hooks/use-chat";
import { useChatSessions } from "@/hooks/use-chat-sessions";
import { useSettings } from "@/hooks/use-settings";
import ChatMessage from "@/components/chat-message";
import ChatInput from "@/components/chat-input";
import ModelSelector from "@/components/model-selector";
import ChatSidebar from "@/components/chat-sidebar";
import SettingsModal from "@/components/settings-modal";
import styles from "./page.module.css";

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("ag/gemini-3.8-flash-high");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Gem Skill selection state for new/initial chats
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);
  const [gemWarning, setGemWarning] = useState<boolean>(false);

  // Settings & Gem Skills Hook (Dark mode & Bahasa Indonesia default)
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
  const currentSessionIdRef = useRef(activeSessionId);

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

  // Initial load
  useEffect(() => {
    if (isLoaded && activeSession && messages.length === 0 && activeSession.messages.length > 0) {
      loadMessages(activeSession.messages);
      if (activeSession.gemId) {
        setSelectedGemId(activeSession.gemId);
        setActiveGemId(activeSession.gemId);
      } else {
        setSelectedGemId("general");
      }
    }
  }, [isLoaded, activeSession, messages.length, loadMessages, setActiveGemId]);

  const shouldAutoScrollRef = useRef(true);

  // Auto-scroll to bottom safely without animation collisions
  useEffect(() => {
    const container = messagesAreaRef.current;
    if (!container || !shouldAutoScrollRef.current) return;

    if (isStreaming) {
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Handle user scroll detection
  const handleScroll = useCallback(() => {
    const container = messagesAreaRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceToBottom < 100;
  }, []);

  // Auto collapse sidebar on small mobile screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      setSidebarOpen(false);
    }
  }, []);

  const hasMessages = messages.length > 0;

  // Select Gem for this chat session
  const handleSelectGem = useCallback((gemId: string) => {
    setSelectedGemId(gemId);
    setGemWarning(false);
    const actualGemId = gemId === "general" ? null : gemId;
    setActiveGemId(actualGemId);
    if (activeSessionId) {
      saveSessionMessages(activeSessionId, messages, selectedModel, actualGemId);
    }
  }, [activeSessionId, messages, selectedModel, setActiveGemId, saveSessionMessages]);

  // Handle send message with Gem Skill requirement validation
  const handleSend = useCallback(
    (text: string) => {
      // If fresh/empty chat and no Gem has been picked yet, require user to choose one
      if (!hasMessages && !selectedGemId) {
        setGemWarning(true);
        if (messagesAreaRef.current) {
          messagesAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      setGemWarning(false);
      shouldAutoScrollRef.current = true;
      const actualGemId = selectedGemId === "general" ? null : selectedGemId;
      if (actualGemId !== activeGem?.id) {
        setActiveGemId(actualGemId);
      }
      sendMessage(text, selectedModel, getComputedSystemPrompt());
    },
    [hasMessages, selectedGemId, activeGem, setActiveGemId, sendMessage, selectedModel, getComputedSystemPrompt]
  );

  // Start new conversation — resets Gem selection so user is asked to choose for new chat
  const handleNewChat = useCallback(() => {
    const fresh = createNewSession(selectedModel, null);
    currentSessionIdRef.current = fresh.id;
    loadMessages([]);
    setSelectedGemId(null);
    setActiveGemId(null);
    setGemWarning(false);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [createNewSession, selectedModel, loadMessages, setActiveGemId]);

  // Switch session from history
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      if (sessionId === activeSessionId) return;
      switchSession(sessionId);
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        currentSessionIdRef.current = sessionId;
        loadMessages(target.messages || []);
        if (target.model) setSelectedModel(target.model);
        if (target.gemId !== undefined && target.gemId !== null) {
          setActiveGemId(target.gemId);
          setSelectedGemId(target.gemId);
        } else {
          setSelectedGemId((target.messages && target.messages.length > 0) ? "general" : null);
          setActiveGemId(null);
        }
        setGemWarning(false);
      }
    },
    [activeSessionId, switchSession, sessions, loadMessages, setActiveGemId]
  );

  // List of all Gem options to display on empty chat
  const gemOptions = useMemo(() => [
    {
      id: "psychologist-counselor",
      name: t.builtInGems.psychologistCounselor.name,
      description: t.builtInGems.psychologistCounselor.description,
      color: "#f43f5e",
      gradient: "linear-gradient(135deg, rgba(244, 63, 94, 0.22), rgba(225, 29, 72, 0.06))",
      borderColor: "rgba(244, 63, 94, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 5v4" />
          <path d="M10 7h4" />
        </svg>
      ),
    },
    {
      id: "code-architect",
      name: t.builtInGems.codeArchitect.name,
      description: t.builtInGems.codeArchitect.description,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(37, 99, 235, 0.06))",
      borderColor: "rgba(59, 130, 246, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: "writing-editor",
      name: t.builtInGems.writingEditor.name,
      description: t.builtInGems.writingEditor.description,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.06))",
      borderColor: "rgba(245, 158, 11, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      id: "learning-coach",
      name: t.builtInGems.learningCoach.name,
      description: t.builtInGems.learningCoach.description,
      color: "#10b981",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.06))",
      borderColor: "rgba(16, 185, 129, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      id: "creative-brainstormer",
      name: t.builtInGems.creativeBrainstormer.name,
      description: t.builtInGems.creativeBrainstormer.description,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(147, 51, 234, 0.06))",
      borderColor: "rgba(168, 85, 247, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ),
    },
    {
      id: "general",
      name: t.welcome.generalName,
      description: t.welcome.generalDesc,
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(14, 165, 233, 0.06))",
      borderColor: "rgba(6, 182, 212, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    ...settings.customGems.map((cg) => ({
      id: cg.id,
      name: cg.name,
      description: cg.description,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(124, 58, 237, 0.06))",
      borderColor: "rgba(139, 92, 246, 0.45)",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z" />
        </svg>
      ),
    })),
  ], [t, settings.customGems]);

  // Suggested starter prompts based on active chosen Gem
  const activePrompts = useMemo(() => {
    if (!selectedGemId || selectedGemId === "general") return t.gemStarters.general;
    if (selectedGemId === "psychologist-counselor") return t.gemStarters.psychologist;
    if (selectedGemId === "code-architect") return t.gemStarters.codeArchitect;
    if (selectedGemId === "writing-editor") return t.gemStarters.writingEditor;
    if (selectedGemId === "learning-coach") return t.gemStarters.learningCoach;
    if (selectedGemId === "creative-brainstormer") return t.gemStarters.creativeBrainstormer;
    return t.gemStarters.general;
  }, [selectedGemId, t]);

  // Contextual input placeholder
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
    <div className={styles.appWrapper}>
      {/* ── Conversation History Sidebar ────────────────────── */}
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

      {/* ── Main Chat Area ──────────────────────────────────── */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={`${styles.sidebarToggle} ${sidebarOpen ? styles.sidebarToggleActive : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? t.sidebar.closeSidebar : t.sidebar.openSidebar}
              aria-label={sidebarOpen ? t.sidebar.closeSidebar : t.sidebar.openSidebar}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </button>

            <div className={styles.logo}>
              <img
                src="/logo-icon.png"
                alt="EL.AI"
                className={styles.logoImg}
              />
            </div>

            <div>
              <h1 className={styles.headerTitle}>
                <span>{t.common.appName}</span>
                <span className={styles.statusIndicator} title={t.common.gatewayConnected}></span>
              </h1>
              <p className={styles.headerSubtitle}>{t.common.gatewaySubtitle}</p>
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Active Gem Skill indicator */}
            {activeGem && (
              <button
                type="button"
                className={styles.activeGemBadge}
                onClick={() => setSettingsOpen(true)}
                title={`${t.settings.gemsTitle}: ${activeGem.name} — ${t.settings.title}`}
              >
                <span>{activeGem.name}</span>
              </button>
            )}

            <button
              className={styles.newChatHeaderBtn}
              onClick={handleNewChat}
              title={t.common.newChat}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{t.common.newChat}</span>
            </button>

            {/* Model selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={(modelId) => {
                setSelectedModel(modelId);
                if (activeSessionId) {
                  const currentGem = selectedGemId === "general" ? null : selectedGemId;
                  saveSessionMessages(activeSessionId, messages, modelId, currentGem);
                }
              }}
              t={t.modelSelector}
            />

            {/* Quick Theme Toggle (Light default / Dark) */}
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={settings.theme === "dark" ? (settings.language === "id" ? "Beralih ke Mode Gelap" : "Switch to Dark Mode") : (settings.language === "id" ? "Beralih ke Mode Terang (Bawaan)" : "Switch to Light Mode (Default)")}
              aria-label="Toggle visual theme"
            >
              {settings.theme === "dark" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* Settings & Gem Skills Menu */}
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setSettingsOpen(true)}
              title={t.settings.title}
              aria-label={t.settings.title}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Messages / Gem Skill Selection Welcome Screen ── */}
        {hasMessages ? (
          <div ref={messagesAreaRef} className={styles.messagesArea} onScroll={handleScroll}>
            {messages.map((msg, idx) => {
              const isLastAssistant =
                idx === messages.length - 1 && msg.role === "assistant";
              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={isStreaming && isLastAssistant}
                  isLastAssistant={isLastAssistant}
                  onRegenerate={() => regenerateLast(selectedModel)}
                  t={t.chat}
                />
              );
            })}

            {error && (
              <div className={styles.errorToast}>
                <div className={styles.errorContent}>
                  <div className={styles.errorLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div ref={messagesAreaRef} className={styles.welcomeScrollArea}>
            <div className={styles.welcome}>
              {/* Header */}
              <div className={styles.welcomeHeader}>
                <div className={styles.welcomeIcon}>
                  <img
                    src="/logo-icon.png"
                    alt="EL.AI"
                    className={styles.welcomeLogoImg}
                  />
                </div>
                <div className={styles.welcomeBadgeRow}>
                  <span className={selectedGemId ? styles.gemSelectedBadge : styles.gemRequiredBadge}>
                    {selectedGemId ? `✓ ${t.welcome.gemSelectedBadge}` : `⚠️ ${t.welcome.chooseGemRequiredBadge}`}
                  </span>
                </div>
                <h2 className={styles.welcomeTitle}>
                  {t.welcome.chooseGemTitle}
                </h2>
                <p className={styles.welcomeSubtitle}>
                  {t.welcome.chooseGemSubtitle}
                </p>
              </div>

              {/* Warning Banner if user attempts to send message without picking a Gem Skill */}
              {gemWarning && (
                <div className={styles.gemWarningBanner}>
                  <div className={styles.gemWarningIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span>{t.welcome.warningChooseGem}</span>
                </div>
              )}

              {/* Gem Skill Selector Cards Grid */}
              <div className={`${styles.gemGrid} ${gemWarning ? styles.gemGridShake : ""}`}>
                {gemOptions.map((gem) => {
                  const isSelected = selectedGemId === gem.id;
                  return (
                    <button
                      key={gem.id}
                      type="button"
                      className={`${styles.gemCard} ${isSelected ? styles.gemCardSelected : ""}`}
                      onClick={() => handleSelectGem(gem.id)}
                      style={{
                        "--gem-color": gem.color,
                        "--gem-gradient": gem.gradient,
                        "--gem-border": gem.borderColor,
                      } as React.CSSProperties}
                    >
                      <div className={styles.gemCardHeader}>
                        <div className={styles.gemCardIconWrapper} style={{ color: gem.color }}>
                          {gem.icon}
                        </div>
                        <div className={styles.gemCardRadio}>
                          {isSelected ? (
                            <span className={styles.gemCardCheckIcon} style={{ background: gem.color }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : (
                            <span className={styles.gemCardUncheckedCircle} />
                          )}
                        </div>
                      </div>

                      <div className={styles.gemCardBody}>
                        <div className={styles.gemCardTitleRow}>
                          <span className={styles.gemCardTitle}>{gem.name}</span>
                          {isSelected && <span className={styles.gemActivePill} style={{ background: gem.color }}>{t.welcome.gemSelectedBadge}</span>}
                        </div>
                        <p className={styles.gemCardDescription}>{gem.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Starter Prompts (Shown once a Gem is chosen) */}
              {selectedGemId && (
                <div className={styles.starterSection}>
                  <div className={styles.starterHeader}>
                    <span className={styles.starterTitleIcon}>💡</span>
                    <span className={styles.starterTitle}>{t.welcome.starterPromptsTitle}</span>
                  </div>
                  <div className={styles.starterGrid}>
                    {activePrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        className={styles.starterChip}
                        onClick={() => handleSend(prompt)}
                        title={prompt}
                      >
                        <span className={styles.starterChipText}>{prompt}</span>
                        <span className={styles.starterChipArrow}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Input Area ──────────────────────────────────────── */}
        <div className={styles.inputArea}>
          <ChatInput
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            t={t.chat}
            placeholder={currentInputPlaceholder}
          />
        </div>
      </main>

      {/* ── Settings & Gem Skills Modal ────────────────────── */}
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
            saveSessionMessages(activeSessionId, messages, selectedModel, id);
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
