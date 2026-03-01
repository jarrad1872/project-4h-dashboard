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
  onClose: () => void;
}

// Per-domain tagline (matches produce-creatives.js trade taglines)
const DOMAIN_TAGLINES: Record<string, string> = {
  "saw.city":           "on the saw.",
  "rinse.city":         "on the wand.",
  "mow.city":           "on the mower.",
  "rooter.city":        "on the snake.",
  "pipe.city":          "on the pipe.",
  "pave.city":          "on the paver.",
  "haul.city":          "behind the wheel.",
  "lockout.city":       "on the job.",
  "pest.city":          "on the route.",
  "chimney.city":       "on the roof.",
  "duct.city":          "in the ducts.",
  "detail.city":        "on the detail.",
  "plow.city":          "on the plow.",
  "grade.city":         "on the blade.",
  "coat.city":          "on the floor.",
  "brake.city":         "in the bay.",
  "wrench.city":        "under the hood.",
  "polish.city":        "on the buffer.",
  "wreck.city":         "on the machine.",
  "prune.city":         "in the lift.",
  "drywall.city":       "on the wall.",
  "excavation.city":    "on the excavator.",
  "housecleaning.city": "on the clean.",
  "insulation.city":    "in the attic.",
  "metalworks.city":    "at the bench.",
  "plank.city":         "on the floor.",
  "refrigeration.city": "on the call.",
  "remodels.city":      "on the build.",
  "renewables.city":    "on the install.",
  "sentry.city":        "on the install.",
  "shrink.city":        "on the wrap.",
  "bodyshop.city":      "in the bay.",
  "carpetcleaning.city":"on the wand.",
  "mold.city":          "on the job.",
  "siding.city":        "on the wall.",
  "septic.city":        "on the pump.",
  "rolloff.city":       "on the route.",
  "electricians.city":  "in the panel.",
  "roofrepair.city":    "on the roof.",
  "disaster.city":      "on the call.",
  "alignment.city":     "in the bay.",
  "appraisals.city":    "on the appraisal.",
  "bartender.city":     "behind the bar.",
  "bookkeeper.city":    "on the books.",
};

// Sanitize CTA — some old DB records have model names stored in the cta field
function sanitizeCta(cta?: string): string | undefined {
  if (!cta) return undefined;
  if (/gemini|preview|image-gen|model/i.test(cta)) return undefined;
  if (cta.length > 80) return undefined; // too long to be a real CTA
  return cta;
}

export function AdPreviewModal({ imageUrl, headline, domain, cta, onClose }: AdPreviewModalProps) {
  const tagline = DOMAIN_TAGLINES[domain] ?? "on the job.";
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
        >
          ✕
        </button>

        {/* Label */}
        <div className="absolute left-3 top-3 z-20 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Ad Preview
        </div>

        {/* Image + overlay composite */}
        <div className="relative w-full" style={{ aspectRatio: "1200/628" }}>
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
              <span className="text-xl font-bold leading-snug text-white drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
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
