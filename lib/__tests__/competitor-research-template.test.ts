import { describe, expect, it } from "vitest";
import {
  buildCompetitorResearchPacket,
  COMPETITOR_RESEARCH_TEMPLATE,
  requiredCompetitorResearchFields,
} from "../competitor-research-template";

describe("competitor research template", () => {
  it("requires the core fields needed by Q-22", () => {
    const requiredLabels = requiredCompetitorResearchFields().map((field) => field.label);

    expect(requiredLabels).toContain("Offer");
    expect(requiredLabels).toContain("Primary hook");
    expect(requiredLabels).toContain("Visual pattern");
    expect(requiredLabels).toContain("Platforms");
    expect(requiredLabels).toContain("Evidence quality");
    expect(requiredLabels).toContain("Citation URL");
  });

  it("defines evidence quality without treating inference as observation", () => {
    const observed = COMPETITOR_RESEARCH_TEMPLATE.evidenceRules.find((rule) => rule.quality === "observed");
    const inferred = COMPETITOR_RESEARCH_TEMPLATE.evidenceRules.find((rule) => rule.quality === "inferred");
    const unverified = COMPETITOR_RESEARCH_TEMPLATE.evidenceRules.find((rule) => rule.quality === "unverified");

    expect(observed?.allowedUse).toContain("direct pattern");
    expect(inferred?.allowedUse).toContain("labeled as inference");
    expect(unverified?.allowedUse).toBe("Do not use for strategy decisions.");
  });

  it("blocks overconfident scraped-data claims", () => {
    expect(COMPETITOR_RESEARCH_TEMPLATE.blockedClaims).toContain(
      "Do not infer competitor spend from Meta Ad Library unless the source exposes official ranges.",
    );
    expect(COMPETITOR_RESEARCH_TEMPLATE.blockedClaims).toContain("Do not scrape or use reverse-engineered endpoints from this repo.");
  });

  it("builds a copy-ready markdown packet", () => {
    const packet = buildCompetitorResearchPacket();

    expect(packet).toContain("# Manual competitor ad snapshot");
    expect(packet).toContain("## Capture Fields");
    expect(packet).toContain("Offer (required)");
    expect(packet).toContain("## Evidence Quality");
    expect(packet).toContain("## Blocked Claims");
  });
});
