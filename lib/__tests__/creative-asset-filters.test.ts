import { describe, expect, it } from "vitest";
import {
  DEFAULT_CREATIVE_ASSET_FILTERS,
  filterCreativeAssets,
  hasGeneratedCreativeAsset,
  matchesCreativeGenerationFilter,
} from "../creative-asset-filters";
import type { CreativeAsset } from "../types";

function asset(overrides: Partial<CreativeAsset>): CreativeAsset {
  return {
    id: "asset-1",
    trade_slug: "pipe",
    title: "pipe.city missed-call concept",
    angle: "missed-call",
    tool_used: "chatgpt-image-latest",
    provider: "chatgpt-pro",
    model: "chatgpt-image-latest",
    prompt_brief_id: "pipe-missed-call-multi",
    prompt_text: "Prompt",
    source_image_url: null,
    dimensions: "1024x1024",
    variant_id: "pipe-missed-call-multi-v1",
    parent_asset_id: null,
    negative_prompt: null,
    generation_status: "brief",
    generation_error: null,
    storage_path: null,
    output_format: "png",
    quality: "medium",
    moderation: "auto",
    response_metadata: {},
    status: "draft",
    target_platform: "multi",
    thumbnail_url: null,
    asset_url: null,
    notes: null,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("creative asset filters", () => {
  it("detects generated assets from URLs or generation status", () => {
    expect(hasGeneratedCreativeAsset(asset({}))).toBe(false);
    expect(hasGeneratedCreativeAsset(asset({ asset_url: "https://example.com/a.png" }))).toBe(true);
    expect(hasGeneratedCreativeAsset(asset({ generation_status: "generated" }))).toBe(true);
  });

  it("matches generation-state filters", () => {
    const draftBrief = asset({});
    const generatedReview = asset({ id: "asset-2", status: "review", asset_url: "https://example.com/a.png" });

    expect(matchesCreativeGenerationFilter(draftBrief, "brief")).toBe(true);
    expect(matchesCreativeGenerationFilter(draftBrief, "needs-generation")).toBe(true);
    expect(matchesCreativeGenerationFilter(generatedReview, "generated")).toBe(true);
    expect(matchesCreativeGenerationFilter(generatedReview, "review-ready")).toBe(true);
  });

  it("filters by status, trade, angle, and generation state together", () => {
    const assets = [
      asset({ id: "pipe-1", trade_slug: "pipe", angle: "missed-call", status: "draft" }),
      asset({ id: "duct-1", trade_slug: "duct", angle: "demo-call", status: "review", asset_url: "https://example.com/duct.png" }),
      asset({ id: "mow-1", trade_slug: "mow", angle: "roi-math", status: "approved", asset_url: "https://example.com/mow.png" }),
    ];

    expect(
      filterCreativeAssets(assets, {
        ...DEFAULT_CREATIVE_ASSET_FILTERS,
        status: "review",
        trade_slug: "duct",
        angle: "demo-call",
        generation: "review-ready",
      }).map((item) => item.id),
    ).toEqual(["duct-1"]);
  });
});
