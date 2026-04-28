import { describe, expect, it } from "vitest";
import { buildAgenticLaunchPlan } from "../agentic-launch-control";
import type { LaunchBundle } from "../launch-bundles";
import type { PlatformUploadSheet } from "../platform-upload-sheets";

const approvedBundle: LaunchBundle = {
  id: "pipe_linkedin_missed-call_pipe-missed-call-v1",
  status: "approved",
  tradeDomain: "pipe.city",
  tradeSlug: "pipe",
  platform: "linkedin",
  angle: "missed-call",
  url: "https://pipe.city/?utm_source=linkedin&utm_medium=paid-social",
  contentId: "pipe_linkedin_missed-call_pipe-missed-call-v1",
  campaign: "4h_2026-04_missed_call",
  creative: {
    assetId: "pipe-missed-call-v1",
    status: "approved",
    variantId: "pipe-missed-call-v1",
    imageUrl: "https://example.com/pipe.png",
  },
  copy: {
    headline: "pipe.city missed-call launch candidate",
    primaryText: "$39/mo. 14-day free trial, no credit card required.",
    cta: "Start free trial",
    offer: "$39/mo",
    trial: "14-day free trial, no credit card required",
    approvalStatus: "approved",
  },
  budget: {
    platformAllocated: 500,
    platformSpent: 0,
    platformRemaining: 500,
    suggestedTestBudget: 100,
    source: "budget-page",
  },
  approvals: {
    creative: "approved",
    copy: "approved",
    jarrad: "approved",
  },
  readiness: {
    ready: true,
    blockerCount: 0,
    warningCount: 0,
  },
  safetyNotes: [],
};

const sheet: PlatformUploadSheet = {
  kind: "linkedin",
  label: "LinkedIn Campaign Manager",
  filename: "pipe.csv",
  columns: ["campaign"],
  rows: [{ campaign: "4h_2026-04_missed_call" }],
  csv: '"campaign"\n"4h_2026-04_missed_call"',
  safetyNote: "review only",
};

describe("agentic launch control", () => {
  it("lets agents prepare internal packets without external confirmation", () => {
    const plan = buildAgenticLaunchPlan({
      bundle: approvedBundle,
      uploadSheets: [sheet],
      mode: "prepare",
      surface: "cli",
    });

    expect(plan.readyForInternalAutomation).toBe(true);
    expect(plan.readyForExternalAdapters).toBe(false);
    expect(plan.steps.find((step) => step.id === "prepare-upload-sheets")?.status).toBe("complete");
    expect(plan.steps.find((step) => step.id === "launch-campaign")?.status).toBe("requires_approval");
    expect(plan.cli.execute).toContain("--external-confirmation");
  });

  it("does not treat caller confirmation as server-verified external readiness", () => {
    const plan = buildAgenticLaunchPlan({
      bundle: approvedBundle,
      uploadSheets: [sheet],
      mode: "execute",
      surface: "codex",
      externalConfirmation: true,
    });

    expect(plan.readyForExternalAdapters).toBe(false);
    expect(plan.approvedForExternalRequest).toBe(false);
    expect(plan.steps.filter((step) => step.lane === "external").every((step) => step.status === "requires_approval")).toBe(true);
    expect(plan.safetyNotes.join(" ")).toContain("does not call third-party");
  });

  it("requires both server-verified approval and configured adapters for external readiness", () => {
    const plan = buildAgenticLaunchPlan({
      bundle: approvedBundle,
      uploadSheets: [sheet],
      mode: "execute",
      surface: "codex",
      externalConfirmation: true,
      serverVerifiedExternalApproval: true,
      externalAdaptersConfigured: true,
    });

    expect(plan.approvedForExternalRequest).toBe(true);
    expect(plan.readyForExternalAdapters).toBe(true);
  });

  it("blocks external steps when the launch bundle is not approved", () => {
    const plan = buildAgenticLaunchPlan({
      bundle: { ...approvedBundle, status: "blocked", readiness: { ready: false, blockerCount: 1, warningCount: 0 } },
      uploadSheets: [sheet],
      externalConfirmation: true,
    });

    expect(plan.readyForExternalAdapters).toBe(false);
    expect(plan.steps.find((step) => step.id === "launch-campaign")?.status).toBe("blocked");
  });
});
