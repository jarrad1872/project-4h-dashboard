import { describe, expect, it } from "vitest";
import {
  BASE_COMPETITIVE_KEYWORDS,
  buildCompetitiveAnalysisPrompt,
  buildCompetitiveWeeklyReport,
  normalizeMetaAdSnapshot,
} from "../competitive-ad-research-agent";

describe("competitive ad research foundation", () => {
  it("ships a direct competitor seed list", () => {
    expect(BASE_COMPETITIVE_KEYWORDS.some((seed) => seed.term === "smith.ai")).toBe(true);
    expect(BASE_COMPETITIVE_KEYWORDS.some((seed) => seed.category === "trade_saas")).toBe(true);
  });

  it("normalizes a Meta ad payload into the shared snapshot shape", () => {
    const snapshot = normalizeMetaAdSnapshot(
      {
        id: "meta-1",
        page_name: "Smith.ai",
        page_id: "12345",
        ad_creative_body: "Never miss another inbound lead.",
        ad_creative_link_title: "Answer every call",
        cta_text: "Learn More",
        link_url: "https://smith.ai/demo",
        ad_snapshot_url: "https://www.facebook.com/ads/library/?id=1",
        publisher_platforms: ["facebook", "instagram"],
        ad_active_status: "ACTIVE",
        ad_delivery_start_time: "2026-03-28T00:00:00.000Z",
        video_hd_url: "https://video.example/smith.mp4",
      },
      {
        searchTerm: "ai receptionist",
        category: "direct",
        capturedAt: "2026-04-01T00:00:00.000Z",
      },
    );

    expect(snapshot.advertiserName).toBe("Smith.ai");
    expect(snapshot.creativeType).toBe("video");
    expect(snapshot.status).toBe("active");
    expect(snapshot.platforms).toEqual(["facebook", "instagram"]);
    expect(snapshot.searchTerm).toBe("ai receptionist");
  });

  it("includes coverage caveats in the Claude prompt builder", () => {
    const prompt = buildCompetitiveAnalysisPrompt({
      objectiveTrade: "pipe.city",
      periodLabel: "Week of 2026-04-01",
      coverageNotes: ["Meta API coverage for trade-SaaS terms is still being validated."],
      ads: [],
    });

    expect(prompt).toContain("pipe.city");
    expect(prompt).toContain("Coverage notes:");
    expect(prompt).toContain("still being validated");
    expect(prompt).toContain("Separate observation from inference.");
  });

  it("builds a weekly markdown report with structured sections", () => {
    const report = buildCompetitiveWeeklyReport({
      periodLabel: "Week of 2026-04-01",
      providerSummary: "Meta token validation run",
      coverageNotes: ["Direct-competitor terms returned stronger results than generic trade software terms."],
      advertisers: [
        {
          advertiserName: "Smith.ai",
          adsActive: 4,
          primaryAngle: "Never miss a lead",
          creativeMix: "video-heavy",
          ctaPattern: "demo",
        },
      ],
      marketFindings: ["Video creative dominated direct competitors in this sample."],
      recommendations: ["Test a stronger missed-call hook against current pipe.city pain ads."],
      notableAds: [
        {
          advertiserName: "Smith.ai",
          reason: "Clear missed-call hook with direct CTA.",
          url: "https://www.facebook.com/ads/library/?id=1",
        },
      ],
    });

    expect(report).toContain("## Competitive Ad Intelligence - Week of 2026-04-01");
    expect(report).toContain("| Smith.ai | 4 | Never miss a lead | video-heavy | demo |");
    expect(report).toContain("### Recommendations for 4H");
    expect(report).toContain("Direct-competitor terms returned stronger results");
  });
});
