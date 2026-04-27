import { describe, expect, it } from "vitest";
import { buildLaunchUrl } from "../launch-url-builder";
import { validateLaunchReadiness, type LaunchReadinessInput } from "../launch-readiness-validator";
import type { CampaignStatusData, LaunchChecklistItem } from "../types";

const checkedChecklist: LaunchChecklistItem[] = [
  {
    id: "LG-01",
    label: "Tracking verified",
    platform: "tracking",
    checked: true,
    updated_at: "2026-04-27T00:00:00Z",
  },
];

const preLaunchStatus: CampaignStatusData = {
  status: "pre-launch",
  startDate: null,
  linkedinStatus: "ready",
  youtubeStatus: "ready",
  facebookStatus: "ready",
  instagramStatus: "ready",
};

function readyInput(overrides: Partial<LaunchReadinessInput> = {}): LaunchReadinessInput {
  return {
    launch: buildLaunchUrl({
      trade: "pipe.city",
      platform: "linkedin",
      angle: "missed-call",
      assetId: "pipe-missed-call-multi-v1",
      campaignMonth: "2026-04",
    }),
    checklistItems: checkedChecklist,
    campaignStatus: preLaunchStatus,
    offerText: "Pipe.City is $39/mo.",
    trialText: "14-day free trial, no credit card required",
    creativeStatus: "approved",
    copyApprovalStatus: "approved",
    jarradApprovalStatus: "approved",
    ...overrides,
  };
}

describe("validateLaunchReadiness", () => {
  it("passes when domain, UTMs, offer, trial, checklist, and approvals are ready", () => {
    const result = validateLaunchReadiness(readyInput());

    expect(result.ready).toBe(true);
    expect(result.blockerCount).toBe(0);
    expect(result.issues).toEqual([]);
  });

  it("returns actionable blockers for missing offer, trial, creative approval, and Jarrad approval", () => {
    const result = validateLaunchReadiness(readyInput({
      offerText: "Pipe.City is $99/mo.",
      trialText: "Free trial available.",
      creativeStatus: "review",
      copyApprovalStatus: "pending",
      jarradApprovalStatus: "missing",
    }));

    expect(result.ready).toBe(false);
    expect(result.issues.map((item) => item.id)).toEqual(expect.arrayContaining([
      "missing-price",
      "banned-price",
      "missing-trial",
      "creative-not-approved",
      "copy-not-approved",
      "jarrad-launch-approval-missing",
    ]));
    expect(result.issues.every((item) => item.action.length > 12)).toBe(true);
  });

  it("blocks invalid UTM and route-domain combinations", () => {
    const launch = buildLaunchUrl({
      trade: "duct.city",
      platform: "youtube",
      angle: "demo-call",
      assetId: "duct-demo-call-multi-v1",
      campaignMonth: "2026-04",
    });
    const url = new URL(launch.url);
    url.hostname = "answered.city";
    url.searchParams.set("utm_medium", "cpc");
    url.searchParams.delete("asset");

    const result = validateLaunchReadiness(readyInput({
      launch: {
        ...launch,
        url: url.toString(),
      },
    }));

    expect(result.ready).toBe(false);
    expect(result.issues.map((item) => item.id)).toEqual(expect.arrayContaining([
      "domain-mismatch",
      "invalid-utm-medium",
      "missing-asset-param",
    ]));
  });

  it("summarizes incomplete checklist and channel state as blockers", () => {
    const result = validateLaunchReadiness(readyInput({
      checklistItems: [
        { ...checkedChecklist[0], checked: false },
        { id: "LG-02", label: "Pixel verified", platform: "meta", checked: false, updated_at: null },
      ],
      campaignStatus: {
        ...preLaunchStatus,
        linkedinStatus: "paused",
      },
    }));

    expect(result.ready).toBe(false);
    expect(result.issues.map((item) => item.id)).toEqual(expect.arrayContaining([
      "checklist-incomplete",
      "channel-not-ready",
    ]));
    expect(result.issues.find((item) => item.id === "checklist-incomplete")?.detail).toContain("2 checklist items");
  });
});
