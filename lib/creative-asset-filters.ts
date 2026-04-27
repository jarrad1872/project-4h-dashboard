import type { CreativeAsset, CreativeAssetAngle, CreativeAssetStatus } from "./types";

export type CreativeAssetGenerationFilter = "all" | "brief" | "needs-generation" | "generated" | "review-ready";

export interface CreativeAssetFilters {
  status: CreativeAssetStatus | "all";
  trade_slug: string;
  angle: CreativeAssetAngle | "all";
  generation: CreativeAssetGenerationFilter;
}

export const DEFAULT_CREATIVE_ASSET_FILTERS: CreativeAssetFilters = {
  status: "all",
  trade_slug: "all",
  angle: "all",
  generation: "all",
};

export function hasGeneratedCreativeAsset(asset: CreativeAsset) {
  return Boolean(asset.asset_url || asset.thumbnail_url || asset.generation_status === "generated");
}

export function matchesCreativeGenerationFilter(asset: CreativeAsset, filter: CreativeAssetGenerationFilter) {
  if (filter === "all") return true;

  const generated = hasGeneratedCreativeAsset(asset);
  if (filter === "generated") return generated;
  if (filter === "needs-generation") return !generated;
  if (filter === "brief") return Boolean(asset.prompt_brief_id && !generated);
  if (filter === "review-ready") return generated && ["review", "approved", "live"].includes(asset.status);

  return true;
}

export function filterCreativeAssets(assets: CreativeAsset[], filters: CreativeAssetFilters) {
  return assets.filter((asset) => {
    const statusMatch = filters.status === "all" || asset.status === filters.status;
    const tradeMatch = filters.trade_slug === "all" || asset.trade_slug === filters.trade_slug;
    const angleMatch = filters.angle === "all" || asset.angle === filters.angle;
    const generationMatch = matchesCreativeGenerationFilter(asset, filters.generation);

    return statusMatch && tradeMatch && angleMatch && generationMatch;
  });
}
