import { describe, expect, it } from "vitest";
import { buildLaunchBundle, type LaunchBundleInput } from "../launch-bundles";
import { buildLaunchUrl } from "../launch-url-builder";
import { buildPlatformUploadSheet, buildPlatformUploadSheets, rowsToCsv } from "../platform-upload-sheets";
import type { BudgetData } from "../types";

const budget: BudgetData = {
  totalBudget: 20000,
  channels: {
    linkedin: { allocated: 5000, spent: 1000 },
    youtube: { allocated: 5000, spent: 0 },
    facebook: { allocated: 5000, spent: 0 },
    instagram: { allocated: 5000, spent: 0 },
  },
};

function bundle() {
  const input: LaunchBundleInput = {
    launch: buildLaunchUrl({
      trade: "pipe.city",
      platform: "linkedin",
      angle: "missed-call",
      assetId: "pipe-missed-call-multi-v1",
      campaignMonth: "2026-04",
    }),
    readiness: {
      ready: false,
      blockerCount: 3,
      warningCount: 0,
      issues: [],
    },
    budget,
    creative: {
      assetId: "pipe-missed-call-multi-v1",
      status: "review",
      variantId: "pipe-missed-call-multi-v1",
      imageUrl: "/creative-assets/q01-beachhead-pack/pipe-missed-call-q01-review.png",
    },
    copy: {
      headline: "Pipe.City answers plumbing calls",
      primaryText: "Pipe.City answers plumbing calls for $39/mo. 14-day free trial, no credit card required.",
      cta: "Start free trial",
      offer: "$39/mo",
      trial: "14-day free trial, no credit card required",
      approvalStatus: "pending",
    },
    approvals: {
      creative: "review",
      copy: "pending",
      jarrad: "missing",
    },
  };

  return buildLaunchBundle(input);
}

describe("platform upload sheets", () => {
  it("builds a review-only platform sheet from a launch bundle", () => {
    const sheet = buildPlatformUploadSheet(bundle(), "linkedin");

    expect(sheet.filename).toBe("q17-pipe-linkedin-missed-call-review-upload-sheet.csv");
    expect(sheet.rows).toHaveLength(1);
    expect(sheet.rows[0].review_status).toBe("REVIEW_ONLY_DO_NOT_UPLOAD");
    expect(sheet.rows[0].required_approval).toBe("JARRAD_APPROVAL_REQUIRED_BEFORE_PLATFORM_UPLOAD");
    expect(sheet.rows[0].trade_domain).toBe("pipe.city");
    expect(sheet.rows[0].landing_url).toContain("utm_source=linkedin");
    expect(sheet.rows[0].primary_text).toContain("$39/mo");
    expect(sheet.rows[0].primary_text).toContain("14-day free trial");
    expect(sheet.rows[0].primary_text).toContain("no credit card required");
    expect(sheet.rows[0].safety_note).toContain("Do not upload");
  });

  it("creates a combined Meta review sheet without calling platform APIs", () => {
    const sheet = buildPlatformUploadSheet(bundle(), "meta");

    expect(sheet.rows.map((row) => row.platform)).toEqual(["facebook", "instagram"]);
    expect(sheet.safetyNote).toContain("does not call ad-platform APIs");
    expect(sheet.csv).toContain("facebook");
    expect(sheet.csv).toContain("instagram");
  });

  it("deduplicates the active platform sheet when listing all exports", () => {
    const sheets = buildPlatformUploadSheets(bundle());
    expect(sheets.map((sheet) => sheet.kind)).toEqual(["linkedin", "meta", "youtube"]);
  });

  it("escapes CSV cells safely", () => {
    expect(rowsToCsv(["headline"], [{ headline: 'Pipe "answers", fast' }])).toBe('"headline"\n"Pipe ""answers"", fast"');
  });
});
