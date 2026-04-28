import { describe, expect, it } from "vitest";
import { BEACHHEAD_IMAGE_TRADES, IMAGE_CREATIVE_ANGLES, getImageCreativeBrief } from "../image-creative-briefs";
import { summarizeBeachheadImagePack } from "../beachhead-image-pack";
import type { CreativeAsset } from "../types";

function asset(trade_slug: string, angle: (typeof IMAGE_CREATIVE_ANGLES)[number], overrides: Partial<CreativeAsset> = {}): CreativeAsset {
  const brief = getImageCreativeBrief({ trade_slug, angle, platform: "multi" });
  return {
    id: `${trade_slug}-${angle}`,
    trade_slug,
    title: brief.title,
    angle,
    tool_used: "chatgpt-image-latest",
    provider: "chatgpt-pro",
    model: "chatgpt-image-latest",
    prompt_brief_id: brief.id,
    prompt_text: brief.prompt,
    source_image_url: null,
    dimensions: brief.dimensions,
    variant_id: `${brief.id}-v1`,
    parent_asset_id: null,
    negative_prompt: brief.negative_prompt,
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

describe("beachhead image pack summary", () => {
  it("requires all five beachhead trades across all four angles", () => {
    const summary = summarizeBeachheadImagePack([]);

    expect(summary.expectedTotal).toBe(BEACHHEAD_IMAGE_TRADES.length * IMAGE_CREATIVE_ANGLES.length);
    expect(summary.complete).toBe(false);
    expect(summary.missingKeys).toContain("pipe-missed-call");
    expect(summary.missingKeys).toContain("lockout-roi-math");
  });

  it("is complete only when every expected card has an uploaded generated image in review or better", () => {
    const assets = BEACHHEAD_IMAGE_TRADES.flatMap((trade) =>
      IMAGE_CREATIVE_ANGLES.map((angle) =>
        asset(trade.slug, angle, {
          generation_status: "generated",
          asset_url: `/creative-assets/q01-beachhead-pack/${trade.slug}-${angle}-q01-review.png`,
          thumbnail_url: `/creative-assets/q01-beachhead-pack/${trade.slug}-${angle}-q01-review.png`,
          status: "review",
        }),
      ),
    );

    const summary = summarizeBeachheadImagePack(assets);

    expect(summary.total).toBe(20);
    expect(summary.generated).toBe(20);
    expect(summary.reviewReady).toBe(20);
    expect(summary.remaining).toBe(0);
    expect(summary.complete).toBe(true);
    expect(summary.missingKeys).toEqual([]);
  });

  it("does not count generated metadata without an uploaded image URL", () => {
    const summary = summarizeBeachheadImagePack([
      asset("pipe", "missed-call", { generation_status: "generated", status: "review" }),
    ]);

    expect(summary.generated).toBe(0);
    expect(summary.complete).toBe(false);
    expect(summary.next?.id).toBe("pipe-missed-call");
  });
});
