import { CHATGPT_IMAGE_MODEL, IMAGE_CREATIVE_ANGLES, BEACHHEAD_IMAGE_TRADES } from "@/lib/image-creative-briefs";
import type { CreativeAsset } from "@/lib/types";

export interface BeachheadImagePackSummary {
  expectedTotal: number;
  total: number;
  generated: number;
  reviewReady: number;
  remaining: number;
  complete: boolean;
  next: CreativeAsset | null;
  missingKeys: string[];
}

export function isBeachheadPromptCard(asset: CreativeAsset) {
  return Boolean(asset.prompt_brief_id && asset.model === CHATGPT_IMAGE_MODEL);
}

export function hasUploadedImage(asset: CreativeAsset) {
  return Boolean(asset.asset_url || asset.thumbnail_url);
}

export function summarizeBeachheadImagePack(assets: CreativeAsset[]): BeachheadImagePackSummary {
  const expectedKeys = new Set(
    BEACHHEAD_IMAGE_TRADES.flatMap((trade) => IMAGE_CREATIVE_ANGLES.map((angle) => `${trade.slug}-${angle}`)),
  );
  const promptCards = assets.filter(isBeachheadPromptCard);
  const generated = promptCards.filter((asset) => hasUploadedImage(asset) && asset.generation_status === "generated");
  const reviewReady = generated.filter((asset) => ["review", "approved", "live"].includes(asset.status));
  const presentGeneratedKeys = new Set(generated.map((asset) => `${asset.trade_slug}-${asset.angle}`));
  const missingKeys = [...expectedKeys].filter((key) => !presentGeneratedKeys.has(key));

  return {
    expectedTotal: expectedKeys.size,
    total: promptCards.length,
    generated: generated.length,
    reviewReady: reviewReady.length,
    remaining: Math.max(0, expectedKeys.size - generated.length),
    complete: generated.length >= expectedKeys.size && reviewReady.length >= expectedKeys.size && missingKeys.length === 0,
    next: promptCards.find((asset) => !hasUploadedImage(asset) || asset.generation_status !== "generated") ?? null,
    missingKeys,
  };
}
