import type { CampaignStatusData, CreativeAssetStatus, LaunchChecklistItem } from "./types";
import { LAUNCH_UTM_MEDIUM, launchPlatforms, type LaunchPlatform, type LaunchUrlResult } from "./launch-url-builder";

export type LaunchReadinessSeverity = "blocker" | "warning";
export type LaunchApprovalStatus = "missing" | "pending" | "approved" | "rejected";

export interface LaunchReadinessIssue {
  id: string;
  severity: LaunchReadinessSeverity;
  label: string;
  detail: string;
  action: string;
  evidence: string;
}

export interface LaunchReadinessInput {
  launch: LaunchUrlResult;
  checklistItems: LaunchChecklistItem[];
  campaignStatus: CampaignStatusData;
  offerText: string;
  trialText: string;
  creativeStatus: CreativeAssetStatus | "missing";
  copyApprovalStatus: LaunchApprovalStatus;
  jarradApprovalStatus: LaunchApprovalStatus;
}

export interface LaunchReadinessResult {
  ready: boolean;
  blockerCount: number;
  warningCount: number;
  issues: LaunchReadinessIssue[];
}

const REQUIRED_TRIAL_TERMS = ["14-day", "free trial", "no credit card"] as const;
const BANNED_PRICE_PATTERN = /\$(79|99|149|199|249|299)(?:\/mo)?/i;

function issue(input: LaunchReadinessIssue): LaunchReadinessIssue {
  return input;
}

function channelStatusForPlatform(status: CampaignStatusData, platform: LaunchPlatform) {
  if (platform === "linkedin") return status.linkedinStatus;
  if (platform === "youtube") return status.youtubeStatus;
  if (platform === "facebook") return status.facebookStatus;
  return status.instagramStatus;
}

function validateLaunchUrl(input: LaunchReadinessInput, issues: LaunchReadinessIssue[]) {
  let url: URL;
  try {
    url = new URL(input.launch.url);
  } catch {
    issues.push(issue({
      id: "invalid-url",
      severity: "blocker",
      label: "Launch URL is not parseable",
      detail: "The selected launch URL cannot be read as a valid URL.",
      action: "Regenerate the URL from the launch builder before using it in any bundle or upload sheet.",
      evidence: input.launch.url,
    }));
    return;
  }

  const expectedHost = input.launch.domain;
  if (url.hostname !== expectedHost) {
    issues.push(issue({
      id: "domain-mismatch",
      severity: "blocker",
      label: "Trade domain does not match the selected route",
      detail: "Paid traffic must land on the trade-specific .city domain selected in the launch builder.",
      action: `Use ${expectedHost} or change the selected trade before building the launch packet.`,
      evidence: `URL host: ${url.hostname}; selected domain: ${expectedHost}`,
    }));
  }

  if (!expectedHost.endsWith(".city")) {
    issues.push(issue({
      id: "missing-city-domain",
      severity: "blocker",
      label: "Trade domain is missing",
      detail: "Launch candidates must use a trade-specific .city domain, not a generic product or tracking URL.",
      action: "Choose a ready product route such as pipe.city, duct.city, mow.city, pest.city, or coat.city.",
      evidence: expectedHost,
    }));
  }

  if (input.launch.route.status !== "ready") {
    issues.push(issue({
      id: "route-not-ready",
      severity: "blocker",
      label: "Product route is not marked ready",
      detail: "The selected trade route is not ready for paid or creator traffic in the 4H inventory.",
      action: "Use a ready beachhead route or create a product handoff before launch planning continues.",
      evidence: `${input.launch.route.domain}: ${input.launch.route.status}`,
    }));
  }

  if (!input.launch.route.demoPhone) {
    issues.push(issue({
      id: "missing-demo-phone",
      severity: "warning",
      label: "Demo phone is missing",
      detail: "Demo-call and creator-proof angles work best when the trade has a confirmed live demo line.",
      action: "Confirm the demo number before using demo-call creative or creator scripts.",
      evidence: input.launch.route.domain,
    }));
  }

  const utmSource = url.searchParams.get("utm_source");
  const utmMedium = url.searchParams.get("utm_medium");
  const utmCampaign = url.searchParams.get("utm_campaign");
  const utmContent = url.searchParams.get("utm_content");
  const utmTerm = url.searchParams.get("utm_term");
  const trade = url.searchParams.get("trade");
  const angle = url.searchParams.get("angle");
  const asset = url.searchParams.get("asset");

  if (!utmSource || !launchPlatforms.includes(utmSource as LaunchPlatform)) {
    issues.push(issue({
      id: "invalid-utm-source",
      severity: "blocker",
      label: "UTM source is missing or invalid",
      detail: "Launch URLs must identify linkedin, facebook, instagram, or youtube as the paid source.",
      action: "Regenerate the URL from the platform selector.",
      evidence: `utm_source=${utmSource ?? "missing"}`,
    }));
  }

  if (utmMedium !== LAUNCH_UTM_MEDIUM) {
    issues.push(issue({
      id: "invalid-utm-medium",
      severity: "blocker",
      label: "UTM medium is not paid-social",
      detail: "Paid channel attribution must use the 4H medium convention.",
      action: `Set utm_medium=${LAUNCH_UTM_MEDIUM} before this can become a launch bundle.`,
      evidence: `utm_medium=${utmMedium ?? "missing"}`,
    }));
  }

  if (!utmCampaign || !/^4h_\d{4}-\d{2}_[a-z0-9_]+$/.test(utmCampaign)) {
    issues.push(issue({
      id: "invalid-utm-campaign",
      severity: "blocker",
      label: "UTM campaign is not in 4H format",
      detail: "Campaign names must follow AGENTS format so scorecard attribution can group results.",
      action: "Use the launch builder month and campaign fields to create 4h_YYYY-MM_campaign.",
      evidence: `utm_campaign=${utmCampaign ?? "missing"}`,
    }));
  }

  if (!utmContent || !utmContent.includes(input.launch.angleSlug) || !utmContent.includes(input.launch.tradeSlug)) {
    issues.push(issue({
      id: "invalid-utm-content",
      severity: "blocker",
      label: "UTM content does not connect trade and angle",
      detail: "utm_content must carry the trade, platform, angle, and asset identity for later keep/kill decisions.",
      action: "Regenerate the URL after selecting the final trade, platform, angle, and asset ID.",
      evidence: `utm_content=${utmContent ?? "missing"}`,
    }));
  }

  if (utmTerm !== "owners_1-10") {
    issues.push(issue({
      id: "invalid-utm-term",
      severity: "warning",
      label: "Audience term differs from owner-operator default",
      detail: "The rebuild is targeting owner-operated trade businesses first.",
      action: "Keep utm_term=owners_1-10 unless Jarrad intentionally approves a different audience.",
      evidence: `utm_term=${utmTerm ?? "missing"}`,
    }));
  }

  if (trade !== input.launch.route.tradeSlug) {
    issues.push(issue({
      id: "trade-param-mismatch",
      severity: "blocker",
      label: "Trade parameter does not match route",
      detail: "The trade parameter must identify the product route being tested.",
      action: "Regenerate the URL from the selected trade route.",
      evidence: `trade=${trade ?? "missing"}; expected=${input.launch.route.tradeSlug}`,
    }));
  }

  if (angle !== input.launch.angleSlug) {
    issues.push(issue({
      id: "angle-param-mismatch",
      severity: "blocker",
      label: "Angle parameter does not match creative angle",
      detail: "The landing promise, creative brief, and scorecard attribution all depend on the same angle.",
      action: "Regenerate the URL after choosing the final creative angle.",
      evidence: `angle=${angle ?? "missing"}; expected=${input.launch.angleSlug}`,
    }));
  }

  if (!asset) {
    issues.push(issue({
      id: "missing-asset-param",
      severity: "blocker",
      label: "Asset parameter is missing",
      detail: "Launch candidates must name the creative asset or variant being tested.",
      action: "Add the final creative asset ID before this can become a launch bundle.",
      evidence: "asset=missing",
    }));
  }
}

function validateOfferAndTrial(input: LaunchReadinessInput, issues: LaunchReadinessIssue[]) {
  const offerText = input.offerText.trim();
  const trialText = input.trialText.trim().toLowerCase();

  if (!offerText.includes("$39/mo")) {
    issues.push(issue({
      id: "missing-price",
      severity: "blocker",
      label: "$39/mo offer is missing",
      detail: "Every launch candidate must include the exact $39/mo price.",
      action: "Add $39/mo to the approved ad copy, landing handoff, or launch bundle copy before approval.",
      evidence: offerText || "no offer text attached",
    }));
  }

  const bannedPrice = offerText.match(BANNED_PRICE_PATTERN);
  if (bannedPrice) {
    issues.push(issue({
      id: "banned-price",
      severity: "blocker",
      label: "Wrong price detected",
      detail: "4H launch copy cannot include old or experimental prices.",
      action: "Replace the wrong price with $39/mo everywhere in the candidate packet.",
      evidence: bannedPrice[0],
    }));
  }

  const missingTrialTerms = REQUIRED_TRIAL_TERMS.filter((term) => !trialText.includes(term));
  if (missingTrialTerms.length > 0) {
    issues.push(issue({
      id: "missing-trial",
      severity: "blocker",
      label: "Trial promise is incomplete",
      detail: "Every launch candidate must include 14-day free trial and no-credit-card language.",
      action: "Add the full promise: 14-day free trial, no credit card required.",
      evidence: `missing: ${missingTrialTerms.join(", ")}`,
    }));
  }
}

function validateApprovals(input: LaunchReadinessInput, issues: LaunchReadinessIssue[]) {
  if (input.creativeStatus !== "approved") {
    issues.push(issue({
      id: "creative-not-approved",
      severity: "blocker",
      label: "Creative asset is not approved",
      detail: "The selected asset must be approved in 4H before it appears in a launch bundle or upload sheet.",
      action: "Finish image generation/upload and get Jarrad approval in the Creative Lab.",
      evidence: `creativeStatus=${input.creativeStatus}`,
    }));
  }

  if (input.copyApprovalStatus !== "approved") {
    issues.push(issue({
      id: "copy-not-approved",
      severity: "blocker",
      label: "Ad copy is not approved",
      detail: "Ad copy has to pass the approval queue before paid launch planning.",
      action: "Attach approved copy or route the draft through /approval before building the launch bundle.",
      evidence: `copyApprovalStatus=${input.copyApprovalStatus}`,
    }));
  }

  if (input.jarradApprovalStatus !== "approved") {
    issues.push(issue({
      id: "jarrad-launch-approval-missing",
      severity: "blocker",
      label: "Jarrad launch approval is missing",
      detail: "Nothing external can launch, upload, send, create webhooks, or spend money without explicit approval.",
      action: "Keep this as an internal planning packet until Jarrad approves the specific launch bundle.",
      evidence: `jarradApprovalStatus=${input.jarradApprovalStatus}`,
    }));
  }
}

function validateCampaignGate(input: LaunchReadinessInput, issues: LaunchReadinessIssue[]) {
  const incompleteItems = input.checklistItems.filter((item) => !item.checked);
  if (incompleteItems.length > 0) {
    issues.push(issue({
      id: "checklist-incomplete",
      severity: "blocker",
      label: "Launch checklist is incomplete",
      detail: `${incompleteItems.length} checklist item${incompleteItems.length === 1 ? "" : "s"} still need evidence.`,
      action: "Resolve the checklist items on this page before moving the candidate to launch bundle review.",
      evidence: incompleteItems.slice(0, 4).map((item) => item.label).join("; "),
    }));
  }

  if (input.campaignStatus.status !== "pre-launch") {
    issues.push(issue({
      id: "campaign-status-not-prelaunch",
      severity: "blocker",
      label: "Campaign status is not pre-launch",
      detail: "New launch candidates should only be promoted from the pre-launch state.",
      action: "Confirm whether the campaign is already live, paused, or ended before changing launch state.",
      evidence: `campaignStatus=${input.campaignStatus.status}`,
    }));
  }

  const channelStatus = channelStatusForPlatform(input.campaignStatus, input.launch.source);
  if (channelStatus !== "ready") {
    issues.push(issue({
      id: "channel-not-ready",
      severity: "blocker",
      label: "Selected channel is not ready",
      detail: "The selected platform channel must be marked ready before it can enter launch review.",
      action: `Set ${input.launch.source} status to ready only after its account, tracking, and approvals are confirmed.`,
      evidence: `${input.launch.source}Status=${channelStatus}`,
    }));
  }
}

export function validateLaunchReadiness(input: LaunchReadinessInput): LaunchReadinessResult {
  const issues: LaunchReadinessIssue[] = [];

  validateLaunchUrl(input, issues);
  validateOfferAndTrial(input, issues);
  validateApprovals(input, issues);
  validateCampaignGate(input, issues);

  const blockerCount = issues.filter((item) => item.severity === "blocker").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;

  return {
    ready: blockerCount === 0,
    blockerCount,
    warningCount,
    issues,
  };
}
