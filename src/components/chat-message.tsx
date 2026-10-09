/**
 * ChatMessage component — renders a single message bubble
 * with avatar, role indicator, expandable reasoning process, markdown,
 * and one-click copy message action.
 */
"use client";

import React, { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/hooks/use-chat";
import type { TranslationDictionary } from "@/i18n/translations";
import Markdown from "./markdown";
import styles from "./chat-message.module.css";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
  t?: TranslationDictionary["chat"];
}

function ChatMessage({
  message,
  isStreaming,
  onRegenerate,
  isLastAssistant,
  t,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [showReasoning, setShowReasoning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const hasReasoning = Boolean(message.reasoning && message.reasoning.trim().length > 0);

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.userRow : styles.assistantRow}`}
      id={`message-${message.id}`}
    >
      <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.assistantAvatar}`}>
        {isUser ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>

      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        <div className={styles.bubbleHeader}>
          <div className={styles.bubbleHeaderLeft}>
            <span className={styles.roleLabel}>{isUser ? (t?.userRole || "Anda") : (t?.assistantRole || "EL")}</span>
            {!isUser && message.model && (
              <span className={styles.modelBadge}>{message.model.split("/").pop()}</span>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <>
              {/* Optional Reasoning / Thinking process */}
              {hasReasoning && (
                <div className={styles.reasoningBox}>
                  <button
                    className={styles.reasoningToggle}
                    onClick={() => setShowReasoning(!showReasoning)}
                    type="button"
                    aria-expanded={showReasoning}
                  >
                    <span className={styles.reasoningToggleLeft}>
                      <span>{isStreaming && !message.content ? (t?.thinking || "Sedang berpikir...") : (t?.thoughtProcess || "Proses Berpikir")}</span>
                    </span>
                    <svg
                      className={`${styles.reasoningChevron} ${showReasoning ? styles.reasoningChevronOpen : ""}`}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {showReasoning && (
                    <div className={styles.reasoningContent}>
                      {message.reasoning}
                    </div>
                  )}
                </div>
              )}

              {message.content ? (
                <Markdown content={message.content} />
              ) : isStreaming ? (
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  {hasReasoning && <span className={styles.thinkingLabel}>{t?.synthesizing || "Menyusun tanggapan..."}</span>}
                </div>
              ) : null}

              {/* Action buttons for assistant */}
              {!isStreaming && message.content && (
                <div className={styles.actionsBar}>
                  <button
                    className={styles.actionBtn}
                    onClick={handleCopyMessage}
                    type="button"
                    title={copied ? (t?.copied || "Tersalin!") : (t?.copy || "Salin pesan")}
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{t?.copied || "Tersalin"}</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{t?.copy || "Salin"}</span>
                      </>
                    )}
                  </button>

                  {isLastAssistant && onRegenerate && (
                    <button
                      className={styles.actionBtn}
                      onClick={onRegenerate}
                      type="button"
                      title={t?.regenerate || "Buat ulang tanggapan"}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      <span>{t?.regenerate || "Buat Ulang"}</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ChatMessage, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.reasoning === next.message.reasoning &&
    prev.message.model === next.message.model &&
    prev.isStreaming === next.isStreaming &&
    prev.isLastAssistant === next.isLastAssistant &&
    prev.t === next.t
  );
});
