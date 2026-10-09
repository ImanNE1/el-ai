/**
 * Main Chat Page — EL
 * Features:
 * - Persistent Conversation History (Sidebar with sessions, rename, delete)
 * - Multi-model gateway with 24 verified Antigravity models (ag/)
 * - General purpose AI assistant without restrictive persona filters
 * - Markdown rendering with syntax highlighting & one-click copy
 * - Live streaming with reasoning / thought process
 * - Chat export (Markdown download)
 * - Clean anti-slop design without clutter
 */
"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
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
  const [selectedModel, setSelectedModel] = useState("ag/gemini-3.8-flash-medium");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        saveSessionMessages(activeSessionId, updatedMessages, selectedModel);
      }
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const currentSessionIdRef = useRef(activeSessionId);

  // When active session changes, load its messages
  useEffect(() => {
    if (!isLoaded || !activeSession) return;
    if (currentSessionIdRef.current !== activeSession.id) {
      currentSessionIdRef.current = activeSession.id;
      loadMessages(activeSession.messages || []);
      if (activeSession.model) {
        setSelectedModel(activeSession.model);
      }
    }
  }, [activeSession, isLoaded, loadMessages]);

  // Initial load
  useEffect(() => {
    if (isLoaded && activeSession && messages.length === 0 && activeSession.messages.length > 0) {
      loadMessages(activeSession.messages);
    }
  }, [isLoaded, activeSession, messages.length, loadMessages]);

  const shouldAutoScrollRef = useRef(true);

  // Auto-scroll to bottom safely without animation collisions
  useEffect(() => {
    const container = messagesAreaRef.current;
    if (!container || !shouldAutoScrollRef.current) return;

    if (isStreaming) {
      // Instant direct scroll during streaming to prevent smooth scroll animation stuttering
      container.scrollTop = container.scrollHeight;
    } else {
      // Smooth scroll when message sending begins or streaming completes
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Handle user scroll detection
  const handleScroll = useCallback(() => {
    const container = messagesAreaRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // If user is within 100px of bottom, keep auto-scroll enabled; otherwise let them read history
    shouldAutoScrollRef.current = distanceToBottom < 100;
  }, []);

  // Auto collapse sidebar on small mobile screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      setSidebarOpen(false);
    }
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      shouldAutoScrollRef.current = true;
      sendMessage(text, selectedModel, getComputedSystemPrompt());
    },
    [sendMessage, selectedModel, getComputedSystemPrompt]
  );

  const handleNewChat = useCallback(() => {
    const fresh = createNewSession(selectedModel);
    currentSessionIdRef.current = fresh.id;
    loadMessages([]);
  }, [createNewSession, selectedModel, loadMessages]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) return;
      switchSession(sessionId);
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        currentSessionIdRef.current = sessionId;
        loadMessages(target.messages || []);
        if (target.model) setSelectedModel(target.model);
      }
    },
    [activeSessionId, switchSession, sessions, loadMessages]
  );

  const hasMessages = messages.length > 0;

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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
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
                  saveSessionMessages(activeSessionId, messages, modelId);
                }
              }}
              t={t.modelSelector}
            />

            {/* Quick Theme Toggle (Light default / Dark) */}
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={settings.theme === "light" ? (settings.language === "id" ? "Beralih ke Mode Gelap" : "Switch to Dark Mode") : (settings.language === "id" ? "Beralih ke Mode Terang (Bawaan)" : "Switch to Light Mode (Default)")}
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



            {/* Clear chat */}
            {hasMessages && (
              <button
                id="clear-chat"
                className={styles.headerButton}
                onClick={clearMessages}
                aria-label={t.common.clear}
                title={t.common.clear}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>{t.common.clear}</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Messages / Clean Welcome ────────────────────────── */}
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
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className={styles.welcomeTitle}>
              {activeGem ? t.welcome.readyWithGem.replace("{gem}", activeGem.name) : t.welcome.title}
            </h2>
            <p className={styles.welcomeSubtitle}>
              {activeGem
                ? activeGem.description
                : t.welcome.subtitle}
            </p>
          </div>
        )}

        {/* ── Input Area ──────────────────────────────────────── */}
        <div className={styles.inputArea}>
          <ChatInput
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            t={t.chat}
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
        onSetActiveGemId={setActiveGemId}
        onUpdateSettings={updateSettings}
        onAddCustomGem={addCustomGem}
        onDeleteCustomGem={deleteCustomGem}
        t={t.settings}
      />
    </div>
  );
}
