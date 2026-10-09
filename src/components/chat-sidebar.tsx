/**
 * ChatSidebar component — displays conversation history,
 * allowing users to switch chats, create new chats, delete, and search.
 */
"use client";

import React, { useState, useMemo } from "react";
import type { ChatSession } from "@/hooks/use-chat-sessions";
import type { TranslationDictionary } from "@/i18n/translations";
import styles from "./chat-sidebar.module.css";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  t?: TranslationDictionary["sidebar"];
}

function formatRelativeTime(timestamp: number, t?: TranslationDictionary["sidebar"]): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t?.justNow || "Baru saja";
  if (minutes < 60) return t ? t.minutesAgo.replace("{m}", String(minutes)) : `${minutes}m yang lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t ? t.hoursAgo.replace("{h}", String(hours)) : `${hours}j yang lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return t?.yesterday || "Kemarin";
  if (days < 7) return t ? t.daysAgo.replace("{d}", String(days)) : `${days}h yang lalu`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ChatSidebar({
  sessions,
  activeSessionId,
  isOpen,
  onClose,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  onRenameSession,
  t,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [sessions, search]);

  const handleStartRename = (e: React.MouseEvent, s: ChatSession) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleFinishRename = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className={styles.sidebarOverlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${!isOpen ? styles.sidebarCollapsed : ""}`}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.headerTop}>
            <div className={styles.sidebarBrand}>
              <div className={styles.brandIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span>{t?.title || "Percakapan"}</span>
            </div>
            <button
              className={styles.closeButton}
              onClick={onClose}
              title={t?.closeSidebar || "Tutup bilah samping"}
              aria-label="Close sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <button
            className={styles.newChatButton}
            onClick={() => {
              onNewChat();
              // On mobile, close on new chat
              if (window.innerWidth < 768) onClose();
            }}
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{t?.newChatBtn || "Obrolan Baru"}</span>
          </button>

          {/* Search box */}
          {sessions.length > 2 && (
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t?.searchPlaceholder || "Cari riwayat percakapan..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Sessions list */}
        <div className={styles.sessionsList}>
          {filteredSessions.length === 0 ? (
            <div className={styles.emptyState}>{t?.noChatsFound || "Tidak ada percakapan ditemukan."}</div>
          ) : (
            filteredSessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const isEditing = editingId === s.id;

              return (
                <div
                  key={s.id}
                  className={`${styles.sessionItem} ${isActive ? styles.sessionItemActive : ""}`}
                  onClick={() => {
                    onSelectSession(s.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  title={s.title}
                >
                  <div className={styles.sessionContent}>
                    <svg className={styles.chatIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>

                    <div className={styles.sessionDetails}>
                      {isEditing ? (
                        <input
                          type="text"
                          className={styles.editInput}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleFinishRename(s.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleFinishRename(s.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={styles.sessionTitle}>{s.title}</span>
                      )}
                      <span className={styles.sessionDate}>{formatRelativeTime(s.updatedAt, t)}</span>
                    </div>
                  </div>

                  <div className={styles.sessionActions}>
                    <button
                      className={styles.actionIconBtn}
                      onClick={(e) => handleStartRename(e, s)}
                      title="Rename"
                      type="button"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      className={styles.actionIconBtn}
                      onClick={(e) => handleDelete(e, s.id)}
                      title="Delete chat"
                      type="button"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <span className={styles.historyCount}>
            {t ? t.chatCount.replace("{count}", String(sessions.length)) : `${sessions.length} percakapan`}
          </span>
          {sessions.length > 1 && (
            <button
              className={styles.clearAllBtn}
              onClick={() => {
                if (window.confirm(t?.confirmClearAll || "Hapus semua riwayat percakapan?")) {
                  onClearAll();
                }
              }}
              type="button"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
              <span>{t?.clearAll || "Hapus Semua"}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default React.memo(ChatSidebar);
