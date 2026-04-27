import type { LaunchReadinessResult, LaunchApprovalStatus } from "./launch-readiness-validator";
import type { LaunchUrlResult } from "./launch-url-builder";
import type { BudgetData, CreativeAssetStatus } from "./types";

export type LaunchBundleStatus = "blocked" | "draft" | "review-ready" | "approved";

export interface LaunchBundleCreative {
  assetId: string;
  status: CreativeAssetStatus | "missing";
  variantId: string | null;
  imageUrl: string | null;
}

export interface LaunchBundleCopy {
  headline: string;
  primaryText: string;
  cta: string;
  offer: string;
  trial: string;
  approvalStatus: LaunchApprovalStatus;
}

export interface LaunchBundleApprovals {
  creative: CreativeAssetStatus | "missing";
  copy: LaunchApprovalStatus;
  jarrad: LaunchApprovalStatus;
}

export interface LaunchBundleInput {
  launch: LaunchUrlResult;
  readiness: LaunchReadinessResult;
  budget: BudgetData | null;
  creative: LaunchBundleCreative;
  copy: LaunchBundleCopy;
  approvals: LaunchBundleApprovals;
}

export interface LaunchBundle {
  id: string;
  status: LaunchBundleStatus;
  tradeDomain: string;
  tradeSlug: string;
  platform: LaunchUrlResult["source"];
  angle: string;
  url: string;
  contentId: string;
  campaign: string;
  creative: LaunchBundleCreative;
  copy: LaunchBundleCopy;
  budget: {
    platformAllocated: number;
    platformSpent: number;
    platformRemaining: number;
    suggestedTestBudget: number;
    source: "budget-page" | "missing";
  };
  approvals: LaunchBundleApprovals;
  readiness: {
    ready: boolean;
    blockerCount: number;
    warningCount: number;
  };
  safetyNotes: string[];
}

function suggestedBudget(remaining: number) {
  if (remaining <= 0) return 0;
  return Math.min(remaining, 500, Math.max(100, Math.floor(remaining * 0.1)));
}

function bundleStatus(input: LaunchBundleInput): LaunchBundleStatus {
  if (!input.readiness.ready) return "blocked";
  if (
    input.approvals.creative === "approved" &&
    input.approvals.copy === "approved" &&
    input.approvals.jarrad === "approved"
  ) {
    return "approved";
  }
  if (input.approvals.creative === "approved" && input.approvals.copy === "approved") {
    return "review-ready";
  }
  return "draft";
}

export function buildLaunchBundle(input: LaunchBundleInput): LaunchBundle {
  const channelBudget = input.budget?.channels[input.launch.source] ?? null;
  const platformAllocated = channelBudget?.allocated ?? 0;
  const platformSpent = channelBudget?.spent ?? 0;
  const platformRemaining = Math.max(0, platformAllocated - platformSpent);

  return {
    id: [
      input.launch.tradeSlug,
      input.launch.source,
      input.launch.angleSlug,
      input.creative.assetId || "missing-asset",
    ].join("_"),
    status: bundleStatus(input),
    tradeDomain: input.launch.domain,
    tradeSlug: input.launch.tradeSlug,
    platform: input.launch.source,
    angle: input.launch.angleSlug,
    url: input.launch.url,
    contentId: input.launch.contentId,
    campaign: input.launch.campaign,
    creative: input.creative,
    copy: input.copy,
    budget: {
      platformAllocated,
      platformSpent,
      platformRemaining,
      suggestedTestBudget: suggestedBudget(platformRemaining),
      source: channelBudget ? "budget-page" : "missing",
    },
    approvals: input.approvals,
    readiness: {
      ready: input.readiness.ready,
      blockerCount: input.readiness.blockerCount,
      warningCount: input.readiness.warningCount,
    },
    safetyNotes: [
      "Planning bundle only; does not launch, upload, send, create webhooks, or spend money.",
      "Requires approved creative, approved copy, and explicit Jarrad launch approval before any external action.",
      "Use as the source object for Q-17 local review/download sheets; external platform upload remains manual and approval-gated.",
    ],
  };
}
