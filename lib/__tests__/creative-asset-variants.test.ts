import { describe, expect, it } from "vitest";
import {
  buildReplacementPrompt,
  getCreativeVariantBase,
  getCreativeVariantVersion,
  getNextCreativeVariantPlan,
} from "../creative-asset-variants";
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
    prompt_text: "Create a realistic paid-social ad image for pipe.city.",
    source_image_url: null,
    dimensions: "1024x1024",
    variant_id: "pipe-missed-call-multi-v1",
    parent_asset_id: null,
    negative_prompt: "No generic SaaS dashboards.",
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

describe("creative asset variants", () => {
  it("uses prompt brief IDs as the stable variant base", () => {
    expect(getCreativeVariantBase(asset({ variant_id: "legacy-timestamp-id" }))).toBe("pipe-missed-call-multi");
  });

  it("parses numbered variant IDs and treats the root prompt as v1", () => {
    expect(getCreativeVariantVersion(asset({ variant_id: "pipe-missed-call-multi-v3" }), "pipe-missed-call-multi")).toBe(3);
    expect(getCreativeVariantVersion(asset({ variant_id: "legacy-timestamp-id" }), "pipe-missed-call-multi")).toBe(1);
  });

  it("creates the next deterministic variant ID from an existing family", () => {
    const parent = asset({ id: "parent", variant_id: "legacy-timestamp-id" });
    const child = asset({ id: "child", parent_asset_id: "parent", variant_id: "pipe-missed-call-multi-v2" });

    expect(getNextCreativeVariantPlan(parent, [parent, child])).toEqual({
      base: "pipe-missed-call-multi",
      version: 3,
      variantId: "pipe-missed-call-multi-v3",
    });
  });

  it("appends revision direction without dropping the original prompt", () => {
    const prompt = buildReplacementPrompt(asset({}), "Make the truck scene less polished.", "pipe-missed-call-multi-v2");

    expect(prompt).toContain("Create a realistic paid-social ad image");
    expect(prompt).toContain("Revision direction for pipe-missed-call-multi-v2");
    expect(prompt).toContain("Make the truck scene less polished.");
  });
});
