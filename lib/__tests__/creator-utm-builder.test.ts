import { describe, expect, it } from "vitest";
import { buildCreatorReferralCode, buildCreatorUtmUrl, DEFAULT_CREATOR_CAMPAIGN } from "../creator-utm-builder";
import type { Influencer } from "../types";

function makeInfluencer(overrides: Partial<Influencer> = {}): Influencer {
  return {
    id: "creator-1",
    creator_name: "Mike Andes",
    trade: "mow.city",
    platform: "youtube",
    channel_url: "https://youtube.com/@mikeandes",
    audience_size: 100000,
    estimated_reach: "100K",
    status: "researching",
    flat_fee_amount: 500,
    deal_page: null,
    referral_code: null,
    notes: null,
    last_contact_at: null,
    contact_email: null,
    business_focus: "owners",
    average_views: 20000,
    engagement_rate: 4.2,
    sponsor_openness: "medium",
    audit_label: null,
    audit_reason: null,
    audited_at: null,
    outreach_stage: "discovery",
    draft_status: "not_started",
    draft_step: "initial",
    draft_subject: null,
    draft_body: null,
    approval_notes: null,
    approved_at: null,
    draft_generated_at: null,
    sent_at: null,
    follow_up_due_at: null,
    last_response_at: null,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildCreatorReferralCode", () => {
  it("builds stable trade-creator-platform referral codes", () => {
    expect(buildCreatorReferralCode(makeInfluencer())).toBe("mow-mike-andes-youtube");
  });
});

describe("buildCreatorUtmUrl", () => {
  it("includes creator, trade, platform, campaign, and content identifiers", () => {
    const result = buildCreatorUtmUrl(makeInfluencer());
    const url = new URL(result.url);

    expect(url.hostname).toBe("mow.city");
    expect(url.searchParams.get("utm_source")).toBe("youtube");
    expect(url.searchParams.get("utm_medium")).toBe("creator");
    expect(url.searchParams.get("utm_campaign")).toBe(DEFAULT_CREATOR_CAMPAIGN);
    expect(url.searchParams.get("utm_content")).toBe("creator_mow_mike-andes_youtube_creator-1");
    expect(url.searchParams.get("utm_term")).toBe("mow");
    expect(url.searchParams.get("creator")).toBe("mike-andes");
    expect(url.searchParams.get("creator_id")).toBe("creator-1");
    expect(url.searchParams.get("trade")).toBe("mow");
    expect(url.searchParams.get("ref")).toBe("mow-mike-andes-youtube");
  });

  it("normalizes non-domain trade names to city domains", () => {
    const result = buildCreatorUtmUrl(makeInfluencer({ trade: "Pipe" }));
    const url = new URL(result.url);

    expect(url.hostname).toBe("pipe.city");
    expect(url.searchParams.get("trade")).toBe("pipe");
  });

  it("extracts city domains from full trade URLs without crashing render", () => {
    const result = buildCreatorUtmUrl(makeInfluencer({ trade: "https://pipe.city/demo?x=1" }));
    const url = new URL(result.url);

    expect(url.hostname).toBe("pipe.city");
    expect(url.searchParams.get("trade")).toBe("pipe");
  });

  it("uses trade and creator ID in content IDs to avoid cross-trade collisions", () => {
    const pipe = buildCreatorUtmUrl(makeInfluencer({ id: "same-creator", trade: "pipe.city" }));
    const mow = buildCreatorUtmUrl(makeInfluencer({ id: "same-creator", trade: "mow.city" }));

    expect(pipe.contentId).toBe("creator_pipe_mike-andes_youtube_same-creator");
    expect(mow.contentId).toBe("creator_mow_mike-andes_youtube_same-creator");
    expect(pipe.contentId).not.toBe(mow.contentId);
  });
});
