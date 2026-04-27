import { describe, expect, it } from "vitest";
import { buildLaunchBundle, type LaunchBundleInput } from "../launch-bundles";
import { buildLaunchUrl } from "../launch-url-builder";
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

function input(overrides: Partial<LaunchBundleInput> = {}): LaunchBundleInput {
  return {
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
      status: "missing",
      variantId: null,
      imageUrl: null,
    },
    copy: {
      headline: "Pipe.City answers plumbing calls",
      primaryText: "Pipe.City answers plumbing calls for $39/mo. 14-day free trial, no credit card required.",
      cta: "Start free trial",
      offer: "$39/mo",
      trial: "14-day free trial, no credit card required",
      approvalStatus: "missing",
    },
    approvals: {
      creative: "missing",
      copy: "missing",
      jarrad: "missing",
    },
    ...overrides,
  };
}

describe("buildLaunchBundle", () => {
  it("connects trade, angle, creative, copy, URL, budget, and approval state", () => {
    const bundle = buildLaunchBundle(input());

    expect(bundle.id).toBe("pipe_linkedin_missed-call_pipe-missed-call-multi-v1");
    expect(bundle.tradeDomain).toBe("pipe.city");
    expect(bundle.angle).toBe("missed-call");
    expect(bundle.url).toContain("utm_source=linkedin");
    expect(bundle.creative.assetId).toBe("pipe-missed-call-multi-v1");
    expect(bundle.copy.offer).toBe("$39/mo");
    expect(bundle.copy.trial).toBe("14-day free trial, no credit card required");
    expect(bundle.budget.platformAllocated).toBe(5000);
    expect(bundle.budget.platformRemaining).toBe(4000);
    expect(bundle.approvals.jarrad).toBe("missing");
    expect(bundle.status).toBe("blocked");
  });

  it("caps suggested test budget at 10 percent of remaining channel budget or $500", () => {
    expect(buildLaunchBundle(input()).budget.suggestedTestBudget).toBe(400);
    expect(buildLaunchBundle(input({
      budget: {
        ...budget,
        channels: {
          ...budget.channels,
          linkedin: { allocated: 10000, spent: 1000 },
        },
      },
    })).budget.suggestedTestBudget).toBe(500);
    expect(buildLaunchBundle(input({
      budget: {
        ...budget,
        channels: {
          ...budget.channels,
          linkedin: { allocated: 5000, spent: 4951 },
        },
      },
    })).budget.suggestedTestBudget).toBe(49);
  });

  it("marks review-ready only when readiness, creative, and copy are approved", () => {
    const bundle = buildLaunchBundle(input({
      readiness: { ready: true, blockerCount: 0, warningCount: 0, issues: [] },
      creative: {
        assetId: "pipe-missed-call-multi-v1",
        status: "approved",
        variantId: "pipe-missed-call-multi-v1",
        imageUrl: "https://example.com/pipe.png",
      },
      copy: {
        headline: "Pipe.City answers plumbing calls",
        primaryText: "Pipe.City answers plumbing calls for $39/mo. 14-day free trial, no credit card required.",
        cta: "Start free trial",
        offer: "$39/mo",
        trial: "14-day free trial, no credit card required",
        approvalStatus: "approved",
      },
      approvals: {
        creative: "approved",
        copy: "approved",
        jarrad: "pending",
      },
    }));

    expect(bundle.status).toBe("review-ready");
    expect(bundle.safetyNotes.join(" ")).toContain("does not launch");
  });

  it("marks approved only after explicit Jarrad approval is present", () => {
    const bundle = buildLaunchBundle(input({
      readiness: { ready: true, blockerCount: 0, warningCount: 0, issues: [] },
      creative: {
        assetId: "pipe-missed-call-multi-v1",
        status: "approved",
        variantId: "pipe-missed-call-multi-v1",
        imageUrl: "https://example.com/pipe.png",
      },
      copy: {
        headline: "Pipe.City answers plumbing calls",
        primaryText: "Pipe.City answers plumbing calls for $39/mo. 14-day free trial, no credit card required.",
        cta: "Start free trial",
        offer: "$39/mo",
        trial: "14-day free trial, no credit card required",
        approvalStatus: "approved",
      },
      approvals: {
        creative: "approved",
        copy: "approved",
        jarrad: "approved",
      },
    }));

    expect(bundle.status).toBe("approved");
  });
});
