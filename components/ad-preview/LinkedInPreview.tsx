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

function CreativeImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: "52.35%" /* 628/1200 */ }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="420px"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

function Placeholder({ domain, color }: { domain: string; color: string }) {
  const initial = domain.charAt(0).toUpperCase();
  return (
    <div className="flex w-full items-center justify-center bg-[#2a3441]" style={{ paddingBottom: "52.35%" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-5xl font-black opacity-20 ${color}`}>{initial}</span>
      </div>
    </div>
  );
}

export function LinkedInPreview({ ad, tradeInfo, onDecision }: AdPreviewProps) {
  const localUrl = getCreativeUrl(tradeInfo.domain, "linkedin", ad.format);
  const creativeUrl = localUrl ?? ad.image_url ?? ad.imageUrl ?? null;

  const headline = ad.headline ?? "";
  const cta = ad.cta ?? "Learn More";
  const domain = tradeInfo.domain;
  // Avatar initials from label e.g. "Saw.City" → "SC"
  const initials = tradeInfo.label.replace(/\./g, " ").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-[420px] space-y-3">
      {/* LinkedIn Card */}
      <div className="overflow-hidden rounded-lg border border-[#38434f] bg-[#1B2027] font-sans">
        {/* Post header */}
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Logo */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight text-white">{tradeInfo.label}</p>
            <p className="mt-0.5 text-xs text-[#9db3c8]">
              Sponsored&nbsp;·&nbsp;
              <span className="inline-block">🌐</span>
            </p>
          </div>
          <button className="ml-2 text-[#9db3c8] hover:text-white text-lg">···</button>
        </div>

        {/* Creative image */}
        <div className="relative w-full overflow-hidden border-y border-[#38434f]">
          {creativeUrl ? (
            <CreativeImage src={creativeUrl} alt={headline || domain} />
          ) : (
            <div className="relative" style={{ paddingBottom: "52.35%" }}>
              <Placeholder domain={domain} color={tradeInfo.color} />
            </div>
          )}
        </div>

        {/* Ad copy + CTA */}
        <div className="flex items-center justify-between gap-3 border-t border-[#38434f] bg-[#16202b] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[#9db3c8]">{domain}</p>
            <p className="truncate text-sm font-semibold leading-snug text-white">{headline || "Your headline here"}</p>
          </div>
          <button className="shrink-0 rounded border border-[#9db3c8] px-4 py-1.5 text-xs font-semibold text-[#9db3c8] hover:border-white hover:text-white transition-colors">
            {cta}
          </button>
        </div>

        {/* Engagement row */}
        <div className="flex items-center gap-4 border-t border-[#38434f] px-4 py-2 text-xs text-[#9db3c8]">
          <button className="hover:text-[#70b5f9] transition-colors">👍 Like</button>
          <button className="hover:text-[#70b5f9] transition-colors">💬 Comment</button>
          <button className="hover:text-[#70b5f9] transition-colors">🔄 Repost</button>
          <button className="hover:text-[#70b5f9] transition-colors ml-auto">↗ Send</button>
        </div>
      </div>

      {/* Platform badge */}
      <p className="text-center text-[10px] uppercase tracking-widest text-slate-600">LinkedIn Feed Ad Preview</p>

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
