import { describe, it, expect } from "vitest";
import { TRADE_MAP, tradeFromAd, tradeBadge, getCreativeUrl, getCreativeUrls } from "../trade-utils";
import type { Ad } from "../types";

function makeAd(overrides: Partial<Ad> = {}): Ad {
  return {
    id: "TEST-1",
    platform: "linkedin",
    campaign_group: "",
    format: "static1x1",
    primary_text: "",
    headline: null,
    cta: "Sign Up",
    landing_path: "/saw",
    utm_source: "linkedin",
    utm_medium: "paid-social",
    utm_campaign: "",
    utm_content: "v1",
    utm_term: "owners",
    status: "pending",
    workflow_stage: "copy-ready",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    campaignGroup: "",
    primaryText: "",
    landingPath: "/saw",
    utmSource: "linkedin",
    utmMedium: "paid-social",
    utmCampaign: "",
    utmContent: "v1",
    utmTerm: "owners",
    createdAt: "2026-01-01T00:00:00Z",
    workflowStage: "copy-ready",
    ...overrides,
  };
}

describe("TRADE_MAP", () => {
  it("has 64 trades", () => {
    expect(Object.keys(TRADE_MAP).length).toBe(64);
  });

  it("all tier 1 trades present", () => {
    const tier1 = ["pipe", "mow", "coat", "duct", "pest", "electricians", "roofrepair", "disaster"];
    for (const key of tier1) {
      expect(TRADE_MAP[key]).toBeDefined();
      expect(TRADE_MAP[key].tier).toBe(1);
    }
  });

  it("every trade has required fields", () => {
    for (const [key, trade] of Object.entries(TRADE_MAP)) {
      expect(trade.label).toBeTruthy();
      expect(trade.color).toBeTruthy();
      expect(trade.bg).toBeTruthy();
      expect(trade.domain).toMatch(/\.city$/);
      expect([1, 2, 3]).toContain(trade.tier);
    }
  });
});

describe("tradeFromAd", () => {
  it("extracts trade from utm_campaign segment", () => {
    const ad = makeAd({ utm_campaign: "4h_2026-03_pipe_d1", utmCampaign: "4h_2026-03_pipe_d1" });
    expect(tradeFromAd(ad)).toBe("pipe");
  });

  it("extracts trade from campaign_group", () => {
    const ad = makeAd({ campaign_group: "nb2_d1_linkedin_mow", campaignGroup: "nb2_d1_linkedin_mow" });
    expect(tradeFromAd(ad)).toBe("mow");
  });

  it("extracts trade from utm_campaign ending", () => {
    const ad = makeAd({ utm_campaign: "4h_2026-03_coat", utmCampaign: "4h_2026-03_coat" });
    expect(tradeFromAd(ad)).toBe("coat");
  });

  it("falls back to landing_path", () => {
    const ad = makeAd({
      utm_campaign: "generic_campaign",
      utmCampaign: "generic_campaign",
      campaign_group: "generic_group",
      campaignGroup: "generic_group",
      landing_path: "/duct",
      landingPath: "/duct",
    });
    expect(tradeFromAd(ad)).toBe("duct");
  });

  it("returns 'saw' as ultimate fallback", () => {
    const ad = makeAd({
      utm_campaign: "unknown",
      utmCampaign: "unknown",
      campaign_group: "unknown",
      campaignGroup: "unknown",
      landing_path: "/unknown",
      landingPath: "/unknown",
    });
    expect(tradeFromAd(ad)).toBe("saw");
  });
});

describe("tradeBadge", () => {
  it("returns badge for known trade", () => {
    const ad = makeAd({ utm_campaign: "4h_2026-03_pipe", utmCampaign: "4h_2026-03_pipe" });
    const badge = tradeBadge(ad);
    expect(badge.label).toBe("Pipe.City");
    expect(badge.domain).toBe("pipe.city");
  });

  it("returns saw badge for unknown trade", () => {
    const ad = makeAd({
      utm_campaign: "xxx",
      utmCampaign: "xxx",
      campaign_group: "xxx",
      campaignGroup: "xxx",
      landing_path: "/xxx",
      landingPath: "/xxx",
    });
    const badge = tradeBadge(ad);
    expect(badge.label).toBe("Saw.City");
  });
});

describe("getCreativeUrl", () => {
  it("returns URL for known trade + platform", () => {
    expect(getCreativeUrl("saw.city", "facebook")).toBe("/creatives/saw-1200x628-facebook.jpg");
    expect(getCreativeUrl("mow.city", "linkedin")).toBe("/creatives/mow-1200x1200-linkedin.jpg");
    expect(getCreativeUrl("rinse.city", "youtube")).toBe("/creatives/rinse-1280x720-youtube.jpg");
  });

  it("returns null for unknown trade", () => {
    expect(getCreativeUrl("pipe.city", "facebook")).toBeNull();
  });

  it("handles instagram story format", () => {
    expect(getCreativeUrl("saw.city", "instagram", "story")).toBe("/creatives/saw-1080x1920-instagram.jpg");
    expect(getCreativeUrl("saw.city", "instagram", "reel9x16")).toBe("/creatives/saw-1080x1920-instagram.jpg");
  });

  it("handles instagram default (square)", () => {
    expect(getCreativeUrl("saw.city", "instagram")).toBe("/creatives/saw-1080x1080-meta.jpg");
  });
});

describe("getCreativeUrls", () => {
  it("returns three creative variant URLs", () => {
    const urls = getCreativeUrls("pipe");
    expect(urls.c1).toContain("pipe-hero-a.jpg");
    expect(urls.c2).toContain("pipe-c2.jpg");
    expect(urls.c3).toContain("pipe-c3.jpg");
  });

  it("uses provided heroAUrl for c1", () => {
    const urls = getCreativeUrls("pipe", "https://example.com/custom.jpg");
    expect(urls.c1).toBe("https://example.com/custom.jpg");
    expect(urls.c2).toContain("pipe-c2.jpg");
  });
});
