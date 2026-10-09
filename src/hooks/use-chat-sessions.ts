/**
 * Custom hook to manage persistent multi-session chat history.
 * Stores conversations in localStorage with auto-titling and timestamp tracking.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage } from "./use-chat";

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "el_chat_sessions_v1";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateTitleFromMessage(content: string): string {
  const clean = content.trim().replace(/^[^a-zA-Z0-9\u0600-\u06FF\u4e00-\u9fa5]+/, "");
  if (!clean) return "New Conversation";
  const firstLine = clean.split("\n")[0].trim();
  return firstLine.length > 36 ? `${firstLine.slice(0, 36)}...` : firstLine;
}

export function useChatSessions(defaultModel: string = "ag/gemini-3.8-flash-medium") {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const initialCreatedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("nexusai_chat_sessions_v2");
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sort by updatedAt descending
          parsed.sort((a, b) => b.updatedAt - a.updatedAt);
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }

    // Default first session if none exists
    if (!initialCreatedRef.current) {
      initialCreatedRef.current = true;
      const initialId = generateSessionId();
      const newSession: ChatSession = {
        id: initialId,
        title: "New Conversation",
        messages: [],
        model: defaultModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([newSession]);
      setActiveSessionId(initialId);
      setIsLoaded(true);
    }
  }, [defaultModel]);

  // Persist to localStorage whenever sessions change
  useEffect(() => {
    if (!isLoaded || sessions.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [sessions, isLoaded]);

  // Active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create new session
  const createNewSession = useCallback((model: string = defaultModel) => {
    const newId = generateSessionId();
    const newSession: ChatSession = {
      id: newId,
      title: "New Conversation",
      messages: [],
      model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newSession;
  }, [defaultModel]);

  // Switch session
  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const freshId = generateSessionId();
        const freshSession: ChatSession = {
          id: freshId,
          title: "New Conversation",
          messages: [],
          model: defaultModel,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveSessionId(freshId);
        return [freshSession];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeSessionId, defaultModel]);

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    const freshId = generateSessionId();
    const freshSession: ChatSession = {
      id: freshId,
      title: "New Conversation",
      messages: [],
      model: defaultModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([freshSession]);
    setActiveSessionId(freshId);
  }, [defaultModel]);

  // Rename session
  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim(), updatedAt: Date.now() } : s))
    );
  }, []);

  // Update messages of active session (called when messages stream or change)
  const saveSessionMessages = useCallback((sessionId: string, newMessages: ChatMessage[], currentModel?: string) => {
    setSessions((prev) => {
      return prev.map((s) => {
        if (s.id !== sessionId) return s;

        // Auto generate title if it was "New Conversation" and we have at least 1 user message
        let title = s.title;
        if ((title === "New Conversation" || !title) && newMessages.length > 0) {
          const firstUserMsg = newMessages.find((m) => m.role === "user");
          if (firstUserMsg) {
            title = generateTitleFromMessage(firstUserMsg.content);
          }
        }

        return {
          ...s,
          title,
          messages: newMessages,
          model: currentModel || s.model,
          updatedAt: Date.now(),
        };
      });
    });
  }, []);

  return {
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
  };
}
