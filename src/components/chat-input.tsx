/**
 * ChatInput component — textarea with auto-resize,
 * character count, send/stop button, and keyboard shortcuts.
 */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { TranslationDictionary } from "@/i18n/translations";
import styles from "./chat-input.module.css";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  t?: TranslationDictionary["chat"];
}

const MAX_CHAR_LIMIT = 4000;

export default function ChatInput({ onSend, onStop, isStreaming, disabled, t }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = useCallback(() => {
    if (isStreaming) {
      onStop();
      return;
    }
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isStreaming, onSend, onStop]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          id="chat-input"
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t?.inputPlaceholder || "Tanyakan apa saja atau minta kode..."}
          rows={1}
          maxLength={MAX_CHAR_LIMIT}
          disabled={disabled}
          aria-label={t?.inputPlaceholder || "Tanyakan apa saja atau minta kode..."}
        />

        <div className={styles.controls}>
          {value.length > 50 && (
            <span
              className={`${styles.counter} ${
                value.length > MAX_CHAR_LIMIT - 200 ? styles.counterWarn : ""
              }`}
            >
              {value.length}/{MAX_CHAR_LIMIT}
            </span>
          )}

          <button
            id="send-button"
            className={`${styles.sendButton} ${isStreaming ? styles.stopButton : ""}`}
            onClick={handleSubmit}
            disabled={disabled || (!isStreaming && !value.trim())}
            aria-label={isStreaming ? (t?.stopGenerating || "Hentikan pembuatan") : (t?.sendMessage || "Kirim pesan")}
          >
            {isStreaming ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={styles.footerRow}>
        <span className={styles.hint}>
          <kbd>Enter</kbd> {t?.inputHintEnter || "untuk kirim"} · <kbd>Shift + Enter</kbd> {t?.inputHintShiftEnter || "untuk baris baru"}
        </span>
      </div>
    </div>
  );
}
