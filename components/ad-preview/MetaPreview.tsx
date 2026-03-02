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

export function MetaPreview({ ad, tradeInfo, onDecision }: AdPreviewProps) {
  const localUrl = getCreativeUrl(tradeInfo.domain, "facebook", ad.format);
  const creativeUrl = localUrl ?? ad.image_url ?? ad.imageUrl ?? null;

  const headline = ad.headline ?? "";
  const primaryText = ad.primaryText ?? ad.primary_text ?? "";
  const cta = ad.cta ?? "Learn More";
  const domain = tradeInfo.domain;

  const initials = tradeInfo.label
    .replace(/\./g, " ")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-[420px] space-y-3">
      {/* Facebook Card — light mode card on dark bg */}
      <div className="overflow-hidden rounded-lg border border-slate-300/20 bg-white font-sans shadow-xl">
        {/* Post header */}
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight text-[#050505]">{tradeInfo.label}</p>
            <div className="flex items-center gap-1 text-xs text-[#65676B]">
              <span>Sponsored</span>
              <span>·</span>
              <span>🌐</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#65676B]">
            <button className="text-base hover:text-[#050505]">···</button>
            <button className="text-base hover:text-[#050505]">✕</button>
          </div>
        </div>

        {/* Primary text above image */}
        {primaryText && (
          <div className="px-4 pb-3">
            <p className="text-sm leading-relaxed text-[#050505] line-clamp-3">{primaryText}</p>
          </div>
        )}

        {/* Creative image — full width */}
        <div className="relative w-full overflow-hidden bg-[#f0f2f5]">
          {creativeUrl ? (
            <div className="relative w-full" style={{ paddingBottom: "52.35%" }}>
              <Image
                src={creativeUrl}
                alt={headline || domain}
                fill
                sizes="420px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300" style={{ height: "220px" }}>
              <span className="text-5xl font-black text-slate-400 opacity-30">
                {domain.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Domain + headline + CTA — bottom bar */}
        <div className="flex items-center justify-between gap-3 bg-[#f0f2f5] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[#65676B]">{domain}</p>
            <p className="truncate text-sm font-semibold text-[#050505]">{headline || "Get started today"}</p>
          </div>
          <button className="shrink-0 rounded bg-[#e4e6eb] px-4 py-1.5 text-xs font-semibold text-[#050505] hover:bg-[#d8dadf] transition-colors">
            {cta}
          </button>
        </div>

        {/* Reactions row */}
        <div className="flex items-center gap-4 border-t border-[#e4e6eb] px-4 py-2 text-xs font-semibold text-[#65676B]">
          <button className="hover:text-[#1877F2] transition-colors">👍 Like</button>
          <button className="hover:text-[#1877F2] transition-colors">💬 Comment</button>
          <button className="hover:text-[#1877F2] transition-colors">↗ Share</button>
        </div>
      </div>

      {/* Platform badge */}
      <p className="text-center text-[10px] uppercase tracking-widest text-slate-600">Facebook Feed Ad Preview</p>

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
