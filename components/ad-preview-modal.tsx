"use client";

/**
 * AdPreviewModal
 *
 * Shows a full-size ad preview with the v6 CTA overlay composited in CSS —
 * matching what produce-creatives.js outputs for the finished live ad:
 *   • Dark left gradient vignette
 *   • 3-line headline cluster (white headline, orange tagline)
 *   • Orange CTA button
 *   • Dark sub-pill descriptor
 *   • "No credit card required." pill
 */

import { useEffect } from "react";

interface AdPreviewModalProps {
  imageUrl: string;
  headline: string;
  domain: string;
  cta?: string;
  primaryText?: string;
  onClose: () => void;
}

// Universal brand tagline — answered.city platform
const UNIVERSAL_TAGLINE = "your calls, answered.";

// Sanitize CTA — some old DB records have model names stored in the cta field
function sanitizeCta(cta?: string): string | undefined {
  if (!cta) return undefined;
  if (/gemini|preview|image-gen|model/i.test(cta)) return undefined;
  if (cta.length > 80) return undefined; // too long to be a real CTA
  return cta;
}

export function AdPreviewModal({ imageUrl, headline, domain, cta, primaryText, onClose }: AdPreviewModalProps) {
  const tagline = UNIVERSAL_TAGLINE;
  const cleanCta = sanitizeCta(cta);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Primary text — appears above image in real social ads */}
        {primaryText && (
          <div className="relative bg-slate-900 border-b border-slate-700 px-4 pt-3 pb-3 pr-12 text-sm text-slate-200 leading-relaxed max-h-32 overflow-y-auto">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Primary Text</span>
            {primaryText}
            {/* Close button — top right of primary text strip */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Image + overlay composite */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1200/628" }}>
          {/* Close button when no primary text */}
          {!primaryText && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              ✕
            </button>
          )}

          {/* Label */}
          <div className="absolute left-3 top-3 z-20 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Ad Preview
          </div>
          {/* Raw hero image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Ad creative"
            className="h-full w-full object-cover"
          />

          {/* Dark left gradient vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.10) 75%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* CTA overlay — bottom left */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start gap-2 p-5">
            {/* Headline lines */}
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold leading-snug text-white drop-shadow-lg line-clamp-3" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                {headline}
              </span>
              <span className="text-base font-semibold text-orange-400" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                {tagline}
              </span>
            </div>

            {/* Orange CTA button */}
            <div
              className="rounded-md px-4 py-2 text-sm font-bold text-white"
              style={{ background: "#F97316", boxShadow: "0 2px 12px rgba(249,115,22,0.5)" }}
            >
              {cleanCta ?? "Get your AI employee — 14 days free →"}
            </div>

            {/* Sub-pill */}
            <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-slate-200">
              Answers calls. Quotes jobs. Schedules — automatically.
            </div>

            {/* No CC required */}
            <div className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              No credit card required.
            </div>
          </div>
        </div>

        {/* Meta bar */}
        <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-xs text-slate-400">
          <span className="font-semibold text-orange-400">{domain}</span>
          <span>Click outside to close</span>
        </div>
      </div>
    </div>
  );
}
