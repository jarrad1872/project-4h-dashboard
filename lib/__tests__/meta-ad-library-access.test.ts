import { describe, expect, it } from "vitest";
import {
  buildMetaAccessMarkdown,
  findingsByKind,
  META_AD_LIBRARY_ACCESS_REPORT,
} from "../meta-ad-library-access";

describe("meta ad library access validation", () => {
  it("separates official findings from assumptions", () => {
    const limits = findingsByKind(META_AD_LIBRARY_ACCESS_REPORT, "limit");
    const assumptions = findingsByKind(META_AD_LIBRARY_ACCESS_REPORT, "assumption");

    expect(limits.length).toBeGreaterThan(0);
    expect(assumptions.length).toBeGreaterThan(0);
    expect(META_AD_LIBRARY_ACCESS_REPORT.officialFindings.every((finding) => finding.sourceUrl)).toBe(true);
    expect(assumptions.every((finding) => !finding.sourceUrl)).toBe(true);
  });

  it("does not claim official API is production-safe for US commercial monitoring", () => {
    expect(META_AD_LIBRARY_ACCESS_REPORT.status).toBe("validated-limited");
    expect(META_AD_LIBRARY_ACCESS_REPORT.verdict).toContain("not production-safe");
    expect(META_AD_LIBRARY_ACCESS_REPORT.officialFindings.some((finding) => finding.detail.includes("UK or EU"))).toBe(true);
    expect(META_AD_LIBRARY_ACCESS_REPORT.officialFindings.some((finding) => finding.detail.includes("US home-service SaaS"))).toBe(true);
  });

  it("keeps external actions blocked", () => {
    expect(META_AD_LIBRARY_ACCESS_REPORT.blockedAutomation).toContain("No scraping or reverse-engineered endpoints from this repo.");
    expect(META_AD_LIBRARY_ACCESS_REPORT.blockedAutomation.join(" ")).toContain("No external webhook");
  });

  it("builds a markdown report with sources and recommended next steps", () => {
    const markdown = buildMetaAccessMarkdown();

    expect(markdown).toContain("# Meta Ad Library Access Validation");
    expect(markdown).toContain("## Official Findings");
    expect(markdown).toContain("https://www.facebook.com/ads/library/api/");
    expect(markdown).toContain("## Assumptions To Validate");
    expect(markdown).toContain("Use Q-22 to create a manual-first competitor research template");
  });
});
