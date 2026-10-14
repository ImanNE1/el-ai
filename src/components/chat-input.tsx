/**
 * ChatInput component — textarea with auto-resize,
 * multimodal attachment support (images + PDF, Word, Excel, CSV, TXT documents),
 * thumbnail & document previews, character count, send/stop button, and keyboard shortcuts.
 */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { TranslationDictionary } from "@/i18n/translations";
import type { AttachedDoc } from "@/hooks/use-chat";
import {
  optimizeImageFile,
  getImagesFromClipboard,
  getImagesFromDrop,
  MAX_IMAGE_COUNT,
} from "@/lib/image-utils";
import { extractDocumentFile } from "@/lib/document-parser";
import styles from "./chat-input.module.css";

interface ChatInputProps {
  onSend: (message: string, images?: string[], documents?: AttachedDoc[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  t?: TranslationDictionary["chat"];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const MAX_CHAR_LIMIT = 4000;
const MAX_DOC_COUNT = 5;
const SUPPORTED_DOC_EXTS = [
  "pdf",
  "docx",
  "xlsx",
  "xls",
  "csv",
  "txt",
  "md",
  "markdown",
  "json",
  "sql",
  "yaml",
  "yml",
];

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocIcon(type: string) {
  switch (type.toLowerCase()) {
    case "pdf":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "docx":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      );
    case "xlsx":
    case "xls":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      );
    case "csv":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M8 13h2" />
          <path d="M8 17h4" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
        </svg>
      );
  }
}

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
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasContent = Boolean(
    (value && value.trim().length > 0) ||
    attachedImages.length > 0 ||
    attachedDocs.length > 0
  );

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
    // When text or attachment context is present, expand to ~5 lines (~108px) for clear multiline visibility
    const minH = hasContent ? 108 : 24;
    const targetH = Math.max(minH, Math.min(textarea.scrollHeight, 240));
    textarea.style.height = `${targetH}px`;
  }, [hasContent]);

  useEffect(() => {
    adjustHeight();
  }, [value, hasContent, adjustHeight]);

  // Handle incoming image files
  const processImageFiles = useCallback(async (imageFiles: File[]) => {
    if (imageFiles.length === 0) return;

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
  }, [attachedImages.length]);

  // Handle incoming document files (PDF, DOCX, XLSX, CSV, TXT)
  const processDocFiles = useCallback(async (docFiles: File[]) => {
    if (docFiles.length === 0) return;

    const remainingSlots = MAX_DOC_COUNT - attachedDocs.length;
    if (remainingSlots <= 0) {
      alert("Maksimal 5 dokumen terlampir sekaligus.");
      return;
    }

    const toProcess = docFiles.slice(0, remainingSlots);
    for (const file of toProcess) {
      setProcessingStatus(`Mengekstrak ${file.name}...`);
      try {
        const result = await extractDocumentFile(file);

        if (!result.success || !result.text) {
          alert(result.error || `Gagal membaca isi dokumen ${file.name}. Pastikan file tidak rusak atau terkunci.`);
          continue;
        }

        const newDoc: AttachedDoc = {
          name: result.name,
          size: result.size,
          type: result.type,
          pageCount: result.pageCount,
          sheetCount: result.sheetCount,
          extractedText: result.text,
        };

        setAttachedDocs((prev) => [...prev, newDoc]);
      } catch (err: unknown) {
        console.error("Document upload error:", err);
        const errorMsg = err instanceof Error ? err.message : `Gagal mengunggah file ${file.name}`;
        alert(errorMsg);
      }
    }
  }, [attachedDocs.length]);

  // Unified file processor for image and document files
  const handleIncomingFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const docFiles = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return SUPPORTED_DOC_EXTS.includes(ext);
    });

    if (imageFiles.length === 0 && docFiles.length === 0) {
      alert("Format file belum didukung. Silakan unggah gambar, PDF, Word (.docx), Excel (.xlsx/.xls), CSV, atau teks.");
      return;
    }

    setIsProcessing(true);
    try {
      if (imageFiles.length > 0) {
        await processImageFiles(imageFiles);
      }
      if (docFiles.length > 0) {
        await processDocFiles(docFiles);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  }, [processImageFiles, processDocFiles]);

  // File input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleIncomingFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attached image
  const removeAttachedImage = (idxToRemove: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Remove attached document
  const removeAttachedDoc = (idxToRemove: number) => {
    setAttachedDocs((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Clipboard paste detection (images or files)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardFiles = Array.from(e.clipboardData.files || []);
    if (clipboardFiles.length > 0) {
      e.preventDefault();
      await handleIncomingFiles(clipboardFiles);
      return;
    }

    const pastedImages = getImagesFromClipboard(e);
    if (pastedImages.length > 0) {
      e.preventDefault();
      await handleIncomingFiles(pastedImages);
    }
  };

  // Handle "Media from Clipboard"
  const handleMediaFromClipboard = useCallback(async () => {
    setIsMediaMenuOpen(false);
    try {
      if (!navigator.clipboard) {
        alert("Akses clipboard tidak didukung pada browser ini. Silakan gunakan Ctrl+V / Cmd+V.");
        return;
      }

      // Try reading clipboard items (images or files)
      if (navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          const imageFiles: File[] = [];
          for (const item of items) {
            const imageType = item.types.find((typeStr) => typeStr.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              const ext = imageType.split("/")[1] || "png";
              imageFiles.push(new File([blob], `clipboard-${Date.now()}.${ext}`, { type: imageType }));
            }
          }
          if (imageFiles.length > 0) {
            await handleIncomingFiles(imageFiles);
            return;
          }
        } catch {
          // Fallback to clipboard text if reading binary failed or permission issue
        }
      }

      // Read text from clipboard
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setValue(value ? `${value}\n${text}` : text);
        setTimeout(() => textareaRef.current?.focus(), 50);
      } else {
        alert("Clipboard kosong atau tidak berisi teks/gambar yang didukung.");
      }
    } catch (err) {
      console.warn("Clipboard access error:", err);
      alert("Tidak dapat mengakses clipboard. Silakan tempel secara langsung dengan Ctrl+V.");
    }
  }, [handleIncomingFiles, setValue, value]);

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

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      await handleIncomingFiles(droppedFiles);
      return;
    }

    const droppedImages = getImagesFromDrop(e);
    if (droppedImages.length > 0) {
      await handleIncomingFiles(droppedImages);
    }
  };

  const handleSubmit = useCallback(() => {
    if (isStreaming) {
      onStop();
      return;
    }
    const trimmed = value.trim();
    if (!trimmed && attachedImages.length === 0 && attachedDocs.length === 0) return;

    onSend(
      trimmed,
      attachedImages.length > 0 ? attachedImages : undefined,
      attachedDocs.length > 0 ? attachedDocs : undefined
    );
    setValue("");
    setAttachedImages([]);
    setAttachedDocs([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, attachedImages, attachedDocs, isStreaming, onSend, onStop, setValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSubmit = Boolean(value.trim() || attachedImages.length > 0 || attachedDocs.length > 0);
  const hasAttachments = attachedImages.length > 0 || attachedDocs.length > 0;

  return (
    <div
      className={styles.inputWrapper}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`${styles.inputContainer} ${isDragging ? styles.inputContainerDragging : ""} ${hasContent ? styles.inputContainerHasContent : ""}`}>
        {/* Hidden File Picker: General */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,.pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.markdown,.json,.sql,.yaml,.yml"
          multiple
          style={{ display: "none" }}
          onChange={handleFileInputChange}
          aria-hidden="true"
        />

        {/* Hidden File Picker: Documents */}
        <input
          type="file"
          ref={docInputRef}
          accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.markdown,.json,.sql,.yaml,.yml"
          multiple
          style={{ display: "none" }}
          onChange={handleFileInputChange}
          aria-hidden="true"
        />

        {/* Hidden File Picker: Images */}
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileInputChange}
          aria-hidden="true"
        />

        {/* Hidden File Picker: Camera */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
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
            <span>{t?.dropFilesHere || "Lepaskan gambar atau dokumen di sini..."}</span>
          </div>
        )}

        {/* Left Action: Upload (+) Button with Media Popover */}
        <div className={styles.attachWrapper}>
          {isMediaMenuOpen && (
            <>
              <div
                className={styles.mediaBackdrop}
                onClick={() => setIsMediaMenuOpen(false)}
                aria-hidden="true"
              />
              <div className={styles.mediaPopover}>
                <div className={styles.mediaPopoverHeader}>
                  <span className={styles.mediaPopoverTag}>01 // MEDIA FROM...</span>
                  <button
                    type="button"
                    className={styles.mediaCloseBtn}
                    onClick={() => setIsMediaMenuOpen(false)}
                    aria-label="Tutup menu"
                  >
                    ×
                  </button>
                </div>

                {/* 1. Media from Dokumen & File */}
                <button
                  type="button"
                  className={styles.mediaOptionBtn}
                  onClick={() => {
                    setIsMediaMenuOpen(false);
                    docInputRef.current?.click();
                  }}
                >
                  <div className={styles.mediaOptionIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="16" y2="17" />
                    </svg>
                  </div>
                  <div className={styles.mediaOptionInfo}>
                    <span className={styles.mediaOptionTitle}>Media from Dokumen & File</span>
                    <span className={styles.mediaOptionDesc}>PDF, Word (.docx), Excel (.xlsx), CSV, TXT, JSON</span>
                  </div>
                  <span className={styles.mediaOptionArrow}>→</span>
                </button>

                {/* 2. Media from Galeri Foto */}
                <button
                  type="button"
                  className={styles.mediaOptionBtn}
                  onClick={() => {
                    setIsMediaMenuOpen(false);
                    imageInputRef.current?.click();
                  }}
                >
                  <div className={styles.mediaOptionIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className={styles.mediaOptionInfo}>
                    <span className={styles.mediaOptionTitle}>Media from Galeri Foto</span>
                    <span className={styles.mediaOptionDesc}>Pilih gambar dari galeri perangkat (PNG, JPG, WebP)</span>
                  </div>
                  <span className={styles.mediaOptionArrow}>→</span>
                </button>

                {/* 3. Media from Kamera Langsung */}
                <button
                  type="button"
                  className={styles.mediaOptionBtn}
                  onClick={() => {
                    setIsMediaMenuOpen(false);
                    cameraInputRef.current?.click();
                  }}
                >
                  <div className={styles.mediaOptionIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className={styles.mediaOptionInfo}>
                    <span className={styles.mediaOptionTitle}>Media from Kamera / Scan</span>
                    <span className={styles.mediaOptionDesc}>Pindai berkas langsung menggunakan kamera HP / webcam</span>
                  </div>
                  <span className={styles.mediaOptionArrow}>→</span>
                </button>

                {/* 4. Media from Clipboard */}
                <button
                  type="button"
                  className={styles.mediaOptionBtn}
                  onClick={handleMediaFromClipboard}
                >
                  <div className={styles.mediaOptionIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="M12 11h4" />
                      <path d="M12 16h4" />
                      <path d="M8 11h.01" />
                      <path d="M8 16h.01" />
                    </svg>
                  </div>
                  <div className={styles.mediaOptionInfo}>
                    <span className={styles.mediaOptionTitle}>Media from Clipboard</span>
                    <span className={styles.mediaOptionDesc}>Tempel instan tangkapan layar atau teks dari clipboard</span>
                  </div>
                  <span className={styles.mediaOptionArrow}>→</span>
                </button>

                {/* 5. Tulis / Tempel Teks Panjang (5 Baris) */}
                <button
                  type="button"
                  className={styles.mediaOptionBtn}
                  onClick={() => {
                    setIsMediaMenuOpen(false);
                    if (!value) {
                      setValue(" ");
                    }
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                >
                  <div className={styles.mediaOptionIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 7 4 4 20 4 20 7" />
                      <line x1="9" y1="20" x2="15" y2="20" />
                      <line x1="12" y1="4" x2="12" y2="20" />
                    </svg>
                  </div>
                  <div className={styles.mediaOptionInfo}>
                    <span className={styles.mediaOptionTitle}>Mode Tulis 5 Baris (Composer)</span>
                    <span className={styles.mediaOptionDesc}>Buka area input lapang untuk menyusun prompt panjang</span>
                  </div>
                  <span className={styles.mediaOptionArrow}>→</span>
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            className={`${styles.attachBtnLeft} ${isMediaMenuOpen ? styles.attachBtnLeftActive : ""}`}
            onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
            disabled={disabled || (attachedImages.length >= MAX_IMAGE_COUNT && attachedDocs.length >= MAX_DOC_COUNT) || isProcessing}
            title={t?.uploadAttachment || "Pilih media atau dokumen untuk dilampirkan"}
            aria-label={t?.uploadAttachment || "Pilih media"}
            aria-expanded={isMediaMenuOpen}
          >
            <svg
              className={`${styles.attachIcon} ${isMediaMenuOpen ? styles.attachIconOpen : ""}`}
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div className={styles.inputInnerColumn}>
          {/* Attached Attachments Preview Strip */}
          {hasAttachments && (
            <div className={styles.previewStrip}>
              {/* Document Badges */}
              {attachedDocs.map((doc, idx) => (
                <div key={`doc-${idx}`} className={`${styles.docPreviewCard} ${styles[`docType_${doc.type}`] || ""}`}>
                  <div className={styles.docPreviewIcon}>{getDocIcon(doc.type)}</div>
                  <div className={styles.docPreviewMeta}>
                    <span className={styles.docPreviewName} title={doc.name}>{doc.name}</span>
                    <span className={styles.docPreviewSub}>
                      {formatFileSize(doc.size)}
                      {doc.pageCount ? ` · ${doc.pageCount} ${t?.pages || "hal"}` : ""}
                      {doc.sheetCount ? ` · ${doc.sheetCount} ${t?.sheets || "sheet"}` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.removeDocBtn}
                    onClick={() => removeAttachedDoc(idx)}
                    title={t?.removeAttachment || "Hapus dokumen"}
                    aria-label={t?.removeAttachment || "Hapus dokumen"}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Image Thumbnails */}
              {attachedImages.map((imgSrc, idx) => (
                <div key={`img-${idx}`} className={styles.previewCard}>
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

              {/* Processing Spinner / Loading */}
              {isProcessing && (
                <div className={styles.processingThumb} title={processingStatus || "Memproses file..."}>
                  <div className={styles.miniSpinner} />
                  {processingStatus && <span className={styles.processingText}>{processingStatus}</span>}
                </div>
              )}
            </div>
          )}

          {/* Text Area (Expands to ~5 lines when text is present) */}
          <textarea
            ref={textareaRef}
            id="chat-input"
            className={`${styles.textarea} ${hasContent ? styles.textareaExpanded : ""}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder || t?.inputPlaceholder || "Tanyakan apa saja atau minta kode..."}
            rows={hasContent ? 5 : 1}
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
          <kbd>Enter</kbd> {t?.inputHintEnter || "untuk kirim"} · <kbd>Shift + Enter</kbd> {t?.inputHintShiftEnter || "untuk baris baru"} · <kbd>+</kbd> lampirkan gambar & dokumen
        </span>
      </div>
    </div>
  );
}
