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

export function InstagramPreview({ ad, tradeInfo, onDecision }: AdPreviewProps) {
  // Instagram prefers square for feed; story/reel for 9:16
  const isStory =
    (ad.format ?? "").toLowerCase().includes("story") ||
    (ad.format ?? "").toLowerCase().includes("reel") ||
    (ad.format ?? "").toLowerCase().includes("1920");

  const localUrl = getCreativeUrl(tradeInfo.domain, "instagram", ad.format);
  const creativeUrl = localUrl ?? ad.image_url ?? ad.imageUrl ?? null;

  const primaryText = ad.primaryText ?? ad.primary_text ?? "";
  const cta = ad.cta ?? "Learn More";
  const domain = tradeInfo.domain;

  // Instagram username: domain without TLD, lowercase, no spaces
  const username = domain.replace(".city", "").toLowerCase();

  const initials = tradeInfo.label
    .replace(/\./g, " ")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Aspect ratio: 1:1 for feed, 9:16 for story (capped height)
  const aspectPb = isStory ? "177.78%" : "100%";

  return (
    <div className="mx-auto w-full max-w-[420px] space-y-3">
      {/* Instagram card — near-black with thin borders */}
      <div className="overflow-hidden rounded-lg border border-[#363636] bg-[#000000] font-sans">
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Circular avatar with gradient border (Instagram style) */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
              padding: "2px",
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              {initials}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">{username}</p>
              {/* Sponsored label */}
            </div>
            <p className="text-[11px] text-[#a8a8a8]">Sponsored</p>
          </div>
          <button className="text-white text-lg">···</button>
        </div>

        {/* Image */}
        <div className="relative w-full overflow-hidden bg-[#111]">
          {creativeUrl ? (
            <div className="relative w-full" style={{ paddingBottom: aspectPb }}>
              <Image
                src={creativeUrl}
                alt={username}
                fill
                sizes="420px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]"
              style={{ paddingBottom: aspectPb }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-6xl font-black opacity-20 ${tradeInfo.color}`}>
                  {domain.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center px-3 py-2.5">
          <div className="flex flex-1 items-center gap-4">
            <button className="text-2xl text-white hover:text-[#ed4956] transition-colors" title="Like">♡</button>
            <button className="text-xl text-white" title="Comment">💬</button>
            <button className="text-xl text-white" title="Share">✈</button>
          </div>
          <button className="text-2xl text-white" title="Save">🔖</button>
        </div>

        {/* Caption + CTA */}
        <div className="px-3 pb-4">
          {primaryText && (
            <p className="mb-2 text-sm text-white">
              <span className="font-semibold">{username}</span>{" "}
              <span className="text-[#a8a8a8] line-clamp-2">{primaryText}</span>
            </p>
          )}
          <button className="mt-1 w-full rounded-md border border-[#363636] py-1.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors">
            {cta}
          </button>
        </div>

        {/* Domain footer */}
        <div className="border-t border-[#363636] px-3 py-2 text-[11px] text-[#a8a8a8]">
          {domain}
        </div>
      </div>

      {/* Platform badge */}
      <p className="text-center text-[10px] uppercase tracking-widest text-slate-600">Instagram Feed Ad Preview</p>

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
