import { describe, expect, it } from "vitest";
import {
  buildLaunchUrl,
  defaultLaunchAssetId,
  findLaunchRoute,
  getCurrentCampaignMonth,
  LAUNCH_UTM_MEDIUM,
  slugifyLaunchValue,
} from "../launch-url-builder";

describe("slugifyLaunchValue", () => {
  it("normalizes IDs for stable URL params", () => {
    expect(slugifyLaunchValue("Pipe ROI Math / C1", "fallback")).toBe("pipe-roi-math-c1");
    expect(slugifyLaunchValue("", "fallback")).toBe("fallback");
  });
});

describe("findLaunchRoute", () => {
  it("finds routes by trade slug, domain, and prefix", () => {
    expect(findLaunchRoute("plumbing")?.domain).toBe("pipe.city");
    expect(findLaunchRoute("pipe.city")?.tradeSlug).toBe("plumbing");
    expect(findLaunchRoute("https://mow.city/?x=1")?.tradeSlug).toBe("lawn-care");
  });
});

describe("defaultLaunchAssetId", () => {
  it("suggests an asset ID from the selected route and angle", () => {
    expect(defaultLaunchAssetId("duct.city", "demo-call")).toBe("duct-demo-call-multi-v1");
    expect(defaultLaunchAssetId("plumbing", "roi math")).toBe("pipe-roi-math-multi-v1");
  });
});

describe("getCurrentCampaignMonth", () => {
  it("formats a date as YYYY-MM", () => {
    expect(getCurrentCampaignMonth(new Date("2026-12-05T12:00:00Z"))).toBe("2026-12");
  });
});

describe("buildLaunchUrl", () => {
  it("builds AGENTS-compatible paid social UTMs for a beachhead domain", () => {
    const result = buildLaunchUrl({
      trade: "pipe.city",
      platform: "linkedin",
      angle: "missed-call",
      assetId: "pipe-missed-call-multi-v1",
      campaignMonth: "2026-04",
    });
    const url = new URL(result.url);

    expect(url.hostname).toBe("pipe.city");
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("utm_source")).toBe("linkedin");
    expect(url.searchParams.get("utm_medium")).toBe(LAUNCH_UTM_MEDIUM);
    expect(url.searchParams.get("utm_campaign")).toBe("4h_2026-04_missed_call");
    expect(url.searchParams.get("utm_content")).toBe("pipe_linkedin_missed-call_pipe-missed-call-multi-v1");
    expect(url.searchParams.get("utm_term")).toBe("owners_1-10");
    expect(url.searchParams.get("trade")).toBe("plumbing");
    expect(url.searchParams.get("angle")).toBe("missed-call");
    expect(url.searchParams.get("asset")).toBe("pipe-missed-call-multi-v1");
  });

  it("preserves signup mode while adding launch attribution", () => {
    const result = buildLaunchUrl({
      trade: "duct",
      platform: "youtube",
      angle: "demo-call",
      assetId: "duct-demo-video-c2",
      destination: "signup",
      campaignName: "demo-call",
      campaignMonth: "2026-04",
    });
    const url = new URL(result.url);

    expect(url.hostname).toBe("duct.city");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("mode")).toBe("signup");
    expect(url.searchParams.get("utm_source")).toBe("youtube");
    expect(url.searchParams.get("utm_campaign")).toBe("4h_2026-04_demo_call");
  });

  it("uses the selected trade and angle when no asset is provided", () => {
    const result = buildLaunchUrl({
      trade: "pest.city",
      platform: "facebook",
      angle: "roi-math",
      campaignMonth: "2026-04",
    });
    const url = new URL(result.url);

    expect(url.searchParams.get("utm_content")).toBe("pest_facebook_roi-math_pest-roi-math-multi-v1");
    expect(url.searchParams.get("asset")).toBe("pest-roi-math-multi-v1");
  });

  it("adds creator metadata without changing paid-social UTM medium", () => {
    const result = buildLaunchUrl({
      trade: "mow.city",
      platform: "instagram",
      angle: "owner-agent",
      assetId: "mow-owner-agent-c1",
      creatorSlug: "Brian's Lawn Maintenance",
      creatorId: "creator-42",
      campaignName: "creator proof",
      campaignMonth: "2026-04",
    });
    const url = new URL(result.url);

    expect(url.searchParams.get("utm_medium")).toBe("paid-social");
    expect(url.searchParams.get("utm_campaign")).toBe("4h_2026-04_creator_proof");
    expect(url.searchParams.get("utm_content")).toBe("mow_instagram_owner-agent_mow-owner-agent-c1_brian-s-lawn-maintenance");
    expect(url.searchParams.get("creator")).toBe("brian-s-lawn-maintenance");
    expect(url.searchParams.get("creator_id")).toBe("creator-42");
  });

  it("rejects invalid campaign months", () => {
    expect(() => buildLaunchUrl({
      trade: "coat.city",
      platform: "facebook",
      angle: "roi-math",
      campaignMonth: "April 2026",
    })).toThrow("campaignMonth must use YYYY-MM");
  });
});
