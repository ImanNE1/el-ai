/**
 * Custom hook for managing chat state and SSE streaming.
 * Handles message history, streaming, and error states.
 */
"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  timestamp: number;
  model?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  rawName?: string;
  provider: string;
  vision: boolean;
  reasoning: boolean;
  contextWindow: number;
  status?: "verified" | "credits_required" | "standard";
  isRecommended?: boolean;
}

interface UseChatOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Parse SSE data chunks from the OpenAI-compatible stream.
 * Extracts both text content and reasoning/thought traces.
 */
function parseSSEChunk(chunk: string): { content: string; reasoning: string } {
  let content = "";
  let reasoning = "";
  const lines = chunk.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data: ")) continue;
    const data = trimmed.slice(6);
    if (data === "[DONE]") continue;

    try {
      const parsed = JSON.parse(data);
      const delta = parsed.choices?.[0]?.delta;
      if (delta?.content) {
        content += delta.content;
      }
      if (delta?.reasoning_content) {
        reasoning += delta.reasoning_content;
      } else if (delta?.reasoning) {
        reasoning += delta.reasoning;
      }
    } catch {
      // Skip malformed JSON lines
    }
  }

  return { content, reasoning };
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onMessagesUpdateRef = useRef(options.onMessagesUpdate);
  onMessagesUpdateRef.current = options.onMessagesUpdate;

  const notifyPersistence = useCallback((updated: ChatMessage[]) => {
    if (onMessagesUpdateRef.current) {
      onMessagesUpdateRef.current(updated);
    }
  }, []);

  const loadMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string, modelOverride?: string, customPrompt?: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      const selectedModel = modelOverride || options.model || "ag/gemini-3.8-flash-medium";

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        reasoning: "",
        timestamp: Date.now(),
        model: selectedModel,
      };

      const initialList = [...messages, userMessage, assistantMessage];
      setMessages(initialList);
      notifyPersistence(initialList);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build message history for API (exclude the empty assistant placeholder)
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            model: selectedModel,
            systemPrompt: customPrompt || options.systemPrompt,
            temperature: options.temperature,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        if (!res.body) {
          throw new Error("No response body received.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let accumulatedReasoning = "";
        let lastRenderTime = 0;
        let lastPersistTime = Date.now();

        const flushToState = (isFinal = false) => {
          const curContent = accumulatedContent;
          const curReasoning = accumulatedReasoning;

          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: curContent,
                reasoning: curReasoning,
              };
            }
            if (isFinal) {
              notifyPersistence(updated);
            } else if (Date.now() - lastPersistTime > 2000) {
              lastPersistTime = Date.now();
              notifyPersistence(updated);
            }
            return updated;
          });
        };

        let streamRemainder = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (streamRemainder.trim()) {
              const { content: chunkContent, reasoning: chunkReasoning } = parseSSEChunk(streamRemainder);
              accumulatedContent += chunkContent;
              accumulatedReasoning += chunkReasoning;
            }
            break;
          }

          streamRemainder += decoder.decode(value, { stream: true });
          const lastNewline = streamRemainder.lastIndexOf("\n");
          if (lastNewline === -1) {
            continue; // Wait for complete line boundary
          }

          const completePayload = streamRemainder.slice(0, lastNewline);
          streamRemainder = streamRemainder.slice(lastNewline + 1);

          const { content: chunkContent, reasoning: chunkReasoning } = parseSSEChunk(completePayload);
          accumulatedContent += chunkContent;
          accumulatedReasoning += chunkReasoning;

          const now = performance.now();
          // Throttle React renders to ~30-60fps (32ms) to eliminate main-thread stuttering
          if (now - lastRenderTime >= 32) {
            lastRenderTime = now;
            flushToState(false);
          }
        }

        // Final flush when stream finishes
        flushToState(true);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — persist current state
          setMessages((prev) => {
            notifyPersistence(prev);
            return prev;
          });
        } else {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(errorMessage);
          // Remove the empty assistant message on error
          setMessages((prev) => {
            let next = prev;
            if (prev.length > 0 && prev[prev.length - 1].content === "" && !prev[prev.length - 1].reasoning) {
              next = prev.slice(0, -1);
            }
            notifyPersistence(next);
            return next;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, options.model, options.systemPrompt, options.temperature, notifyPersistence]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setMessages((prev) => {
      notifyPersistence(prev);
      return prev;
    });
  }, [notifyPersistence]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    notifyPersistence([]);
    setError(null);
  }, [notifyPersistence]);

  const regenerateLast = useCallback(
    (modelOverride?: string) => {
      if (messages.length === 0 || isStreaming) return;
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (!lastUserMsg) return;

      // Remove the last assistant message if exists
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
          return prev.slice(0, -1);
        }
        return prev;
      });

      sendMessage(lastUserMsg.content, modelOverride);
    },
    [messages, isStreaming, sendMessage]
  );

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    regenerateLast,
    loadMessages,
    setMessages,
  };
}
