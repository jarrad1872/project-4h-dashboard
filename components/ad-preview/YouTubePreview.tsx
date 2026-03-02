"use client";

import Image from "next/image";
import { Button, GhostButton } from "@/components/ui";
import type { Ad, AdStatus } from "@/lib/types";
import { getCreativeUrl } from "@/lib/trade-utils";

interface AdPreviewProps {
  ad: Ad;
  tradeInfo: { domain: string; label: string; color: string };
  onDecision: (id: string, status: AdStatus) => void;
}

export function YouTubePreview({ ad, tradeInfo, onDecision }: AdPreviewProps) {
  const localUrl = getCreativeUrl(tradeInfo.domain, "youtube", ad.format);
  const creativeUrl = localUrl ?? ad.image_url ?? ad.imageUrl ?? null;

  const headline = ad.headline ?? "";
  const primaryText = ad.primaryText ?? ad.primary_text ?? "";
  const cta = ad.cta ?? "Visit Site";
  const domain = tradeInfo.domain;

  return (
    <div className="mx-auto w-full max-w-[420px] space-y-3">
      {/* YouTube card — near-black */}
      <div className="overflow-hidden rounded-lg border border-[#272727] bg-[#0F0F0F] font-sans">
        {/* 16:9 thumbnail with overlay controls */}
        <div className="relative w-full overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
          {creativeUrl ? (
            <Image
              src={creativeUrl}
              alt={headline || domain}
              fill
              sizes="420px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
              <span className={`text-7xl font-black opacity-15 ${tradeInfo.color}`}>
                {domain.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60">
              <div
                className="ml-1 h-0 w-0"
                style={{
                  borderTop: "14px solid transparent",
                  borderBottom: "14px solid transparent",
                  borderLeft: "22px solid white",
                }}
              />
            </div>
          </div>

          {/* Ad label — top left */}
          <div className="absolute left-2 top-2">
            <span className="rounded bg-[#1a1a1a]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
              Ad
            </span>
          </div>

          {/* Skip button — bottom right */}
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-0.5 rounded bg-[#1a1a1a]/90 px-3 py-1.5 text-xs text-white border border-[#444]">
              <span className="text-[#aaa]">Skip Ad in 5s</span>
              <span className="ml-1 text-white">›</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#333]">
            <div className="h-full w-1/4 bg-[#FF0000]" />
          </div>
        </div>

        {/* Ad info below video */}
        <div className="flex gap-3 px-3 py-3">
          {/* Channel avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF0000] text-xs font-bold text-white">
            {domain.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-snug text-white">
              {headline || "Your headline here"}
            </p>
            {primaryText && (
              <p className="mt-0.5 text-xs leading-relaxed text-[#aaa] line-clamp-2">{primaryText}</p>
            )}
            <p className="mt-1 text-[11px] text-[#717171]">{domain}</p>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between border-t border-[#272727] px-3 py-2.5">
          <p className="text-xs text-[#717171]">Sponsored</p>
          <button className="flex items-center gap-1 rounded border border-[#717171] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#272727] transition-colors">
            {cta} <span>↗</span>
          </button>
        </div>
      </div>

      {/* Platform badge */}
      <p className="text-center text-[10px] uppercase tracking-widest text-slate-600">YouTube Pre-Roll Ad Preview</p>

      {/* Approval buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={() => onDecision(ad.id, "approved")}>Approve ✓</Button>
        <GhostButton onClick={() => onDecision(ad.id, "paused")}>Hold ⏸</GhostButton>
        <GhostButton
          className="border-red-500 text-red-400 hover:bg-red-900/40"
          onClick={() => onDecision(ad.id, "rejected")}
        >
          Reject ✗
        </GhostButton>
      </div>
    </div>
  );
}
