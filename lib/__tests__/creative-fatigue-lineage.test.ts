import { describe, expect, it } from "vitest";
import { buildCreativeFatigueSummary } from "../creative-fatigue-lineage";
import type { CreativeAsset, MarketingEventFunnelCounts, MarketingEventSummary } from "../types";

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
    prompt_text: "Create a realistic paid-social ad image for pipe.city.",
    source_image_url: null,
    dimensions: "1024x1024",
    variant_id: "pipe-missed-call-multi-v1",
    parent_asset_id: null,
    negative_prompt: null,
    generation_status: "generated",
    generation_error: null,
    storage_path: null,
    output_format: "png",
    quality: "medium",
    moderation: "auto",
    response_metadata: {},
    status: "review",
    target_platform: "multi",
    thumbnail_url: null,
    asset_url: null,
    notes: null,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
    ...overrides,
  };
}

function counts(overrides: Partial<MarketingEventFunnelCounts>): MarketingEventFunnelCounts {
  return {
    total: 0,
    asset_view: 0,
    demo_call: 0,
    signup: 0,
    trial_started: 0,
    activated: 0,
    paid: 0,
    paidValueCents: 0,
    ...overrides,
  };
}

function summary(creativeAssets: Record<string, MarketingEventFunnelCounts>): MarketingEventSummary {
  return {
    total: Object.values(creativeAssets).reduce((sum, row) => sum + row.total, 0),
    byType: {
      asset_view: 0,
      demo_call: 0,
      signup: 0,
      trial_started: 0,
      activated: 0,
      paid: 0,
    },
    byPlatform: {},
    byTrade: {},
    byAngle: {},
    dimensions: {
      trades: {},
      creators: {},
      creativeAssets,
      angles: {},
    },
    paidValueCents: 0,
  };
}

describe("buildCreativeFatigueSummary", () => {
  it("groups variant families by prompt brief and preserves variant IDs", () => {
    const parent = asset({ id: "parent", variant_id: "pipe-missed-call-multi-v1" });
    const child = asset({
      id: "child",
      parent_asset_id: "parent",
      variant_id: "pipe-missed-call-multi-v2",
      created_at: "2026-04-28T00:00:00.000Z",
    });

    const result = buildCreativeFatigueSummary([child, parent], summary({}));

    expect(result.totalFamilies).toBe(1);
    expect(result.families[0].variantIds).toEqual(["pipe-missed-call-multi-v1", "pipe-missed-call-multi-v2"]);
    expect(result.families[0].assets.map((row) => row.id)).toEqual(["parent", "child"]);
  });

  it("flags high-view no-downstream creative as needing a replacement variant", () => {
    const result = buildCreativeFatigueSummary(
      [asset({ id: "asset-a" })],
      summary({ "asset-a": counts({ total: 120, asset_view: 120 }) }),
    );

    expect(result.needsVariant).toBe(1);
    expect(result.nextFamily?.fatigueStatus).toBe("needs-variant");
    expect(result.nextFamily?.nextAction).toContain("Create a v2/v3 replacement");
  });

  it("marks families with downstream conversion signal healthy", () => {
    const result = buildCreativeFatigueSummary(
      [asset({ id: "asset-a" })],
      summary({ "asset-a": counts({ total: 15, asset_view: 10, demo_call: 2, signup: 1, trial_started: 1, activated: 1 }) }),
    );

    expect(result.healthy).toBe(1);
    expect(result.families[0].fatigueStatus).toBe("healthy");
  });
});
