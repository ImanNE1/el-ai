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
import { downloadDocx, isDocumentLike, extractDocumentTitle } from "@/lib/docx-generator";
import styles from "./chat-message.module.css";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
  t?: TranslationDictionary["chat"];
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderDocIcon(type: string) {
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

  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadDocx = async () => {
    if (isDownloadingDocx || !message.content) return;
    setIsDownloadingDocx(true);
    try {
      const docTitle = extractDocumentTitle(message.content);
      await downloadDocx(message.content, `${docTitle}.docx`);
    } catch (err) {
      console.error("Failed to generate docx:", err);
      alert("Terjadi kesalahan saat memformat dokumen Word. Silakan coba kembali.");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const hasReasoning = Boolean(message.reasoning && message.reasoning.trim().length > 0);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
          <img
            src="/logo-icon.png"
            alt="EL Assistant"
            className={styles.assistantAvatarImg}
          />
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
            <>
              {/* Document Attachments */}
              {message.documents && message.documents.length > 0 && (
                <div className={styles.messageDocsList}>
                  {message.documents.map((doc, docIdx) => (
                    <div
                      key={docIdx}
                      className={`${styles.messageDocChip} ${styles[`docType_${doc.type}`] || ""}`}
                    >
                      <div className={styles.messageDocIcon}>
                        {renderDocIcon(doc.type)}
                      </div>
                      <div className={styles.messageDocDetails}>
                        <span className={styles.messageDocName} title={doc.name}>
                          {doc.name}
                        </span>
                        <span className={styles.messageDocMeta}>
                          {formatFileSize(doc.size)}
                          {doc.pageCount ? ` · ${doc.pageCount} ${t?.pages || "hal"}` : ""}
                          {doc.sheetCount ? ` · ${doc.sheetCount} ${t?.sheets || "sheet"}` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Attachments */}
              {message.images && message.images.length > 0 && (
                <div className={styles.messageImagesGrid}>
                  {message.images.map((imgSrc, imgIdx) => (
                    <div
                      key={imgIdx}
                      className={styles.messageImageCard}
                      onClick={() => setZoomedImage(imgSrc)}
                      title={t?.imageZoomHint || "Klik untuk memperbesar gambar"}
                    >
                      <img
                        src={imgSrc}
                        alt={`Lampiran gambar ${imgIdx + 1}`}
                        className={styles.messageAttachedImg}
                      />
                      <div className={styles.imageZoomIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {message.content && <p>{message.content}</p>}
            </>
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
                <>
                  <Markdown content={message.content} />
                  {!isStreaming && isDocumentLike(message.content) && (
                    <div className={styles.docExportCard}>
                      <div className={styles.docExportLeft}>
                        <div className={styles.docExportIcon}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="8" y1="13" x2="16" y2="13" />
                            <line x1="8" y1="17" x2="16" y2="17" />
                          </svg>
                        </div>
                        <div className={styles.docExportInfo}>
                          <span className={styles.docExportTitle}>
                            {extractDocumentTitle(message.content)}
                          </span>
                          <span className={styles.docExportSubtitle}>
                            {t?.downloadDocxSubtitle || "Diformat rapi dengan judul, tabel & daftar"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.docExportBtn}
                        onClick={handleDownloadDocx}
                        disabled={isDownloadingDocx}
                      >
                        {isDownloadingDocx ? (
                          <>
                            <div className={styles.docMiniSpinner} />
                            <span>{t?.docxDownloading || "Menyiapkan..."}</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>{t?.downloadDocx || "Unduh .docx"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
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

                  <button
                    className={styles.actionBtn}
                    onClick={handleDownloadDocx}
                    type="button"
                    disabled={isDownloadingDocx}
                    title={t?.downloadDocx || "Unduh dokumen Word (.docx)"}
                  >
                    {isDownloadingDocx ? (
                      <>
                        <div className={styles.docActionMiniSpinner} />
                        <span>{t?.docxDownloading || "Menyiapkan..."}</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M12 18v-6" />
                          <path d="m9 15 3 3 3-3" />
                        </svg>
                        <span>{t?.downloadDocx || "Unduh .docx"}</span>
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

      {/* Lightbox Fullscreen Preview */}
      {zoomedImage && (
        <div className={styles.lightboxOverlay} onClick={() => setZoomedImage(null)}>
          <div className={styles.lightboxModal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setZoomedImage(null)}
              aria-label="Tutup pratinjau gambar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img src={zoomedImage} alt="Pratinjau gambar penuh" className={styles.lightboxImg} />
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ChatMessage, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.reasoning === next.message.reasoning &&
    prev.message.images === next.message.images &&
    prev.message.model === next.message.model &&
    prev.isStreaming === next.isStreaming &&
    prev.isLastAssistant === next.isLastAssistant &&
    prev.t === next.t
  );
});
