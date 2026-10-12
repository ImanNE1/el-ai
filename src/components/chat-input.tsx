/**
 * ChatInput component — textarea with auto-resize,
 * multimodal image attachment support (file picker, clipboard paste, drag & drop),
 * thumbnail previews, character count, send/stop button, and keyboard shortcuts.
 */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { TranslationDictionary } from "@/i18n/translations";
import {
  optimizeImageFile,
  getImagesFromClipboard,
  getImagesFromDrop,
  MAX_IMAGE_COUNT,
} from "@/lib/image-utils";
import styles from "./chat-input.module.css";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  t?: TranslationDictionary["chat"];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const MAX_CHAR_LIMIT = 4000;

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  t,
  placeholder,
  value: controlledValue,
  onChange: onControlledChange,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setValue = useCallback(
    (newVal: string) => {
      if (isControlled) {
        onControlledChange?.(newVal);
      } else {
        setInternalValue(newVal);
      }
    },
    [isControlled, onControlledChange]
  );

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Handle incoming image files from picker, paste, or drag & drop
  const processImageFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const remainingSlots = MAX_IMAGE_COUNT - attachedImages.length;
      if (remainingSlots <= 0) return;

      const toProcess = imageFiles.slice(0, remainingSlots);
      const results = await Promise.all(
        toProcess.map(async (file) => {
          try {
            return await optimizeImageFile(file);
          } catch {
            return null;
          }
        })
      );

      const validUrls = results.filter((url): url is string => Boolean(url));
      setAttachedImages((prev) => [...prev, ...validUrls].slice(0, MAX_IMAGE_COUNT));
    } finally {
      setIsProcessing(false);
    }
  }, [attachedImages.length]);

  // File input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processImageFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attached image
  const removeAttachedImage = (idxToRemove: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Clipboard paste detection (Ctrl+V / Cmd+V)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedImages = getImagesFromClipboard(e);
    if (pastedImages.length > 0) {
      e.preventDefault();
      await processImageFiles(pastedImages);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedImages = getImagesFromDrop(e);
    if (droppedImages.length > 0) {
      await processImageFiles(droppedImages);
    }
  };

  const handleSubmit = useCallback(() => {
    if (isStreaming) {
      onStop();
      return;
    }
    const trimmed = value.trim();
    if (!trimmed && attachedImages.length === 0) return;

    onSend(trimmed, attachedImages.length > 0 ? attachedImages : undefined);
    setValue("");
    setAttachedImages([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, attachedImages, isStreaming, onSend, onStop, setValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSubmit = Boolean(value.trim() || attachedImages.length > 0);

  return (
    <div
      className={styles.inputWrapper}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`${styles.inputContainer} ${isDragging ? styles.inputContainerDragging : ""}`}>
        {/* Hidden File Picker */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileInputChange}
          aria-hidden="true"
        />

        {/* Drag & Drop Overlay */}
        {isDragging && (
          <div className={styles.dragOverlay}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{t?.dropImagesHere || "Lepaskan gambar di sini..."}</span>
          </div>
        )}

        {/* Left Action: Upload (+) Button */}
        <button
          type="button"
          className={styles.attachBtnLeft}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachedImages.length >= MAX_IMAGE_COUNT || isProcessing}
          title={t?.uploadImage || "Unggah gambar (atau paste Ctrl+V)"}
          aria-label={t?.uploadImage || "Unggah gambar"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className={styles.inputInnerColumn}>
          {/* Attached Image Thumbnails */}
          {attachedImages.length > 0 && (
            <div className={styles.previewStrip}>
              {attachedImages.map((imgSrc, idx) => (
                <div key={idx} className={styles.previewCard}>
                  <img src={imgSrc} alt={`Lampiran ${idx + 1}`} className={styles.previewImage} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => removeAttachedImage(idx)}
                    title={t?.removeImage || "Hapus gambar"}
                    aria-label={t?.removeImage || "Hapus gambar"}
                  >
                    ×
                  </button>
                </div>
              ))}
              {isProcessing && (
                <div className={styles.processingThumb}>
                  <div className={styles.miniSpinner} />
                </div>
              )}
            </div>
          )}

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            id="chat-input"
            className={styles.textarea}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder || t?.inputPlaceholder || "Tanyakan apa saja atau minta kode..."}
            rows={1}
            maxLength={MAX_CHAR_LIMIT}
            disabled={disabled}
            aria-label={placeholder || t?.inputPlaceholder || "Tanyakan apa saja atau minta kode..."}
          />
        </div>

        {/* Action Controls */}
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
            disabled={disabled || (!isStreaming && !canSubmit)}
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
          <kbd>Enter</kbd> {t?.inputHintEnter || "untuk kirim"} · <kbd>Shift + Enter</kbd> {t?.inputHintShiftEnter || "untuk baris baru"} · <kbd>Ctrl + V</kbd> untuk tempel gambar
        </span>
      </div>
    </div>
  );
}
