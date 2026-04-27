import type { CreativeAsset } from "./types";

export interface CreativeVariantPlan {
  base: string;
  version: number;
  variantId: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCreativeVariantBase(asset: Pick<CreativeAsset, "prompt_brief_id" | "variant_id" | "trade_slug" | "angle" | "target_platform">) {
  if (asset.prompt_brief_id) return asset.prompt_brief_id;
  if (asset.variant_id) return asset.variant_id.replace(/-v\d+$/i, "");
  return `${asset.trade_slug}-${asset.angle}-${asset.target_platform}`;
}

export function getCreativeVariantVersion(asset: Pick<CreativeAsset, "prompt_brief_id" | "variant_id">, base: string) {
  if (!asset.variant_id) return asset.prompt_brief_id === base ? 1 : null;

  const variantMatch = asset.variant_id.match(new RegExp(`^${escapeRegExp(base)}-v(\\d+)$`, "i"));
  if (variantMatch) {
    const parsed = Number(variantMatch[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return asset.prompt_brief_id === base ? 1 : null;
}

export function getNextCreativeVariantPlan(parent: CreativeAsset, family: CreativeAsset[]): CreativeVariantPlan {
  const base = getCreativeVariantBase(parent);
  const versions = family
    .map((asset) => getCreativeVariantVersion(asset, base))
    .filter((version): version is number => typeof version === "number" && version > 0);
  const version = Math.max(1, ...versions) + 1;

  return {
    base,
    version,
    variantId: `${base}-v${version}`,
  };
}

export function buildReplacementPrompt(parent: CreativeAsset, revisionInstruction: string, variantId: string) {
  const basePrompt = parent.prompt_text?.trim() || "Create a trade-specific paid-social image.";
  const instruction = revisionInstruction.trim() || "Improve the image while preserving the original strategy.";

  return [
    basePrompt,
    "",
    `Revision direction for ${variantId}:`,
    instruction,
    "",
    "Preserve the trade domain, offer context, owner/operator realism, and visible proof. Do not publish or launch this asset.",
  ].join("\n");
}
