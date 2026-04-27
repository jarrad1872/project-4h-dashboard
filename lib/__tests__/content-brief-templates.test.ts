import { describe, expect, it } from "vitest";
import { buildContentBriefPacket, CONTENT_BRIEF_TEMPLATES } from "../content-brief-templates";

describe("CONTENT_BRIEF_TEMPLATES", () => {
  it("includes demo-call, founder-assist, and screenshot-proof templates", () => {
    expect(CONTENT_BRIEF_TEMPLATES.map((template) => template.id)).toEqual([
      "demo-call-video",
      "founder-assist",
      "screenshot-proof",
    ]);
  });

  it("keeps every template complete enough for creator review", () => {
    for (const template of CONTENT_BRIEF_TEMPLATES) {
      expect(template.hook).toBeTruthy();
      expect(template.shotList.length).toBeGreaterThanOrEqual(5);
      expect(template.creatorTalkingPoints.length).toBeGreaterThanOrEqual(3);
      expect(template.cta).toMatch(/14-day free trial/i);
      expect(template.cta).toMatch(/no credit card/i);
      expect(template.offer).toContain("$39/mo");
      expect(template.trackingGuidance).toMatch(/utm|creator|referral|deal_page/i);
    }
  });
});

describe("buildContentBriefPacket", () => {
  it("renders a copy-ready packet with tracking URL", () => {
    const packet = buildContentBriefPacket(CONTENT_BRIEF_TEMPLATES[0], "https://pipe.city/?utm_source=youtube");

    expect(packet).toContain("Demo-call video");
    expect(packet).toContain("Shot list:");
    expect(packet).toContain("Talking points:");
    expect(packet).toContain("CTA:");
    expect(packet).toContain("$39/mo");
    expect(packet).toContain("https://pipe.city/?utm_source=youtube");
  });
});
