"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";
import type { AgencyTranslations } from "@/i18n/agency-translations";

interface AgencyBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: AgencyTranslations;
  isDark: boolean;
}

export default function AgencyBriefModal({
  isOpen,
  onClose,
  t,
  isDark,
}: AgencyBriefModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(t.briefModal.budgetTiers[1]);
  const [selectedScope, setSelectedScope] = useState(t.briefModal.scopeOptions[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTicketId(`EL-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1000);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFullName("");
    setEmail("");
    setCompany("");
    setDetails("");
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl border border-[#E5E5E0] dark:border-[#27272A] p-6 sm:p-8 rounded-none transition-colors ${
          isDark ? "bg-[#09090B] text-[#FAFAFA]" : "bg-[#F9F9F8] text-[#111111]"
        } shadow-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors rounded text-[#111111] dark:text-[#FAFAFA]"
          title="Close Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="block font-mono text-xs uppercase tracking-widest text-[#10B981] mb-2">
              [TELEMETRY:LOGGED] · {ticketId}
            </span>

            <h3 className="text-2xl font-medium tracking-tight mb-2">
              {t.briefModal.successTitle}
            </h3>

            <p className="text-sm text-[#666666] dark:text-[#A1A1AA] max-w-md mx-auto mb-8 font-normal">
              {t.briefModal.successMessage}
            </p>

            <button
              onClick={handleReset}
              type="button"
              className="px-6 py-2.5 text-xs font-mono font-medium border border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              {t.briefModal.close}
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-[#E5E5E0] dark:border-[#27272A]">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#666666] dark:text-[#A1A1AA] block mb-1">
                [ENGAGEMENT INTAKE PROTOCOL]
              </span>
              <h2 className="text-2xl font-medium tracking-tight text-[#111111] dark:text-[#FAFAFA]">
                {t.briefModal.title}
              </h2>
              <p className="text-xs text-[#666666] dark:text-[#A1A1AA] mt-1">
                {t.briefModal.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666666] dark:text-[#A1A1AA] mb-1.5">
                    {t.briefModal.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adrian Meier"
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E0] dark:border-[#27272A] bg-transparent focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666666] dark:text-[#A1A1AA] mb-1.5">
                    {t.briefModal.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adrian@enterprise.com"
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E0] dark:border-[#27272A] bg-transparent focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666666] dark:text-[#A1A1AA] mb-1.5">
                  {t.briefModal.company} *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Kronos Global"
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E0] dark:border-[#27272A] bg-transparent focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                />
              </div>

              {/* Budget Tiers */}
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666666] dark:text-[#A1A1AA] mb-2">
                  {t.briefModal.budget}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {t.briefModal.budgetTiers.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedBudget(tier)}
                      className={`px-3 py-2 text-left font-mono text-[11px] border transition-colors ${
                        selectedBudget === tier
                          ? "border-[#111111] bg-[#111111] text-[#F9F9F8] dark:border-white dark:bg-white dark:text-[#09090B]"
                          : "border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Scope */}
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666666] dark:text-[#A1A1AA] mb-2">
                  {t.briefModal.scope}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.briefModal.scopeOptions.map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setSelectedScope(sc)}
                      className={`px-3 py-2 text-left text-xs border transition-colors ${
                        selectedScope === sc
                          ? "border-[#111111] bg-[#111111] text-[#F9F9F8] dark:border-white dark:bg-white dark:text-[#09090B]"
                          : "border-[#E5E5E0] dark:border-[#27272A] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#666666] dark:text-[#A1A1AA] mb-1.5">
                  {t.briefModal.details}
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Outline key obstacles, timeline, or current attribution architecture..."
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E0] dark:border-[#27272A] bg-transparent focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group flex items-center justify-center gap-2 py-3 text-xs font-mono font-medium bg-[#111111] text-[#F9F9F8] dark:bg-[#FAFAFA] dark:text-[#09090B] hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <span>
                    {isSubmitting
                      ? t.briefModal.submitting
                      : t.briefModal.submit.replace(" →", "")}
                  </span>
                  {!isSubmitting && <span className="arrow-shift">→</span>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
