"use client";

import type { Ad, AdStatus } from "@/lib/types";
import { LinkedInPreview } from "./LinkedInPreview";
import { MetaPreview } from "./MetaPreview";
import { InstagramPreview } from "./InstagramPreview";
import { YouTubePreview } from "./YouTubePreview";

export interface AdPreviewProps {
  ad: Ad;
  tradeInfo: { domain: string; label: string; color: string };
  onDecision: (id: string, status: AdStatus) => void;
}

export function AdPreview({ ad, tradeInfo, onDecision }: AdPreviewProps) {
  switch (ad.platform) {
    case "linkedin":
      return <LinkedInPreview ad={ad} tradeInfo={tradeInfo} onDecision={onDecision} />;
    case "facebook":
      return <MetaPreview ad={ad} tradeInfo={tradeInfo} onDecision={onDecision} />;
    case "instagram":
      return <InstagramPreview ad={ad} tradeInfo={tradeInfo} onDecision={onDecision} />;
    case "youtube":
      return <YouTubePreview ad={ad} tradeInfo={tradeInfo} onDecision={onDecision} />;
    default:
      return <MetaPreview ad={ad} tradeInfo={tradeInfo} onDecision={onDecision} />;
  }
}
