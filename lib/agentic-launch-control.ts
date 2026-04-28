import type { LaunchBundle } from "./launch-bundles";
import type { PlatformUploadSheet } from "./platform-upload-sheets";

export type AgenticLaunchMode = "plan" | "prepare" | "execute";
export type AgenticLaunchSurface = "app" | "cli" | "codex" | "claude-code";
export type AgenticLaunchStepStatus =
  | "complete"
  | "ready"
  | "blocked"
  | "requires_approval"
  | "adapter_missing";

export interface AgenticLaunchStep {
  id: string;
  label: string;
  lane: "internal" | "external";
  status: AgenticLaunchStepStatus;
  detail: string;
  evidence: string;
}

export interface AgenticLaunchPlanInput {
  bundle: LaunchBundle | null;
  uploadSheets: PlatformUploadSheet[];
  mode?: AgenticLaunchMode;
  surface?: AgenticLaunchSurface;
  externalConfirmation?: boolean;
  serverVerifiedExternalApproval?: boolean;
  externalAdaptersConfigured?: boolean;
}

export interface AgenticLaunchPlan {
  mode: AgenticLaunchMode;
  surface: AgenticLaunchSurface;
  readyForInternalAutomation: boolean;
  readyForExternalAdapters: boolean;
  approvedForExternalRequest: boolean;
  externalAdaptersConfigured: boolean;
  externalConfirmation: boolean;
  summary: string;
  cli: {
    plan: string;
    prepare: string;
    execute: string;
  };
  steps: AgenticLaunchStep[];
  safetyNotes: string[];
}

function commandFor(bundle: LaunchBundle | null, mode: AgenticLaunchMode) {
  const base = ["npm run cli -- launch", mode];
  if (!bundle) return base.join(" ");

  base.push(
    "--trade",
    bundle.tradeDomain,
    "--platform",
    bundle.platform,
    "--angle",
    bundle.angle,
    "--asset",
    bundle.creative.assetId,
  );

  if (bundle.approvals.creative) base.push("--creative-status", bundle.approvals.creative);
  if (bundle.approvals.copy) base.push("--copy-status", bundle.approvals.copy);
  if (bundle.approvals.jarrad) base.push("--jarrad-status", bundle.approvals.jarrad);
  if (mode === "execute") base.push("--external-confirmation");

  return base.join(" ");
}

function externalStatus(input: AgenticLaunchPlanInput): AgenticLaunchStepStatus {
  if (!input.bundle || input.bundle.status !== "approved") return "blocked";
  if (!input.serverVerifiedExternalApproval) return "requires_approval";
  if (!input.externalAdaptersConfigured) return "adapter_missing";
  return "adapter_missing";
}

export function buildAgenticLaunchPlan(input: AgenticLaunchPlanInput): AgenticLaunchPlan {
  const mode = input.mode ?? "plan";
  const surface = input.surface ?? "app";
  const externalConfirmation = Boolean(input.externalConfirmation);
  const serverVerifiedExternalApproval = Boolean(input.serverVerifiedExternalApproval);
  const externalAdaptersConfigured = Boolean(input.externalAdaptersConfigured);
  const bundle = input.bundle;
  const externalStepStatus = externalStatus(input);
  const internalReady = Boolean(bundle);
  const approved = bundle?.status === "approved";
  const approvedForExternalRequest = approved && externalConfirmation && serverVerifiedExternalApproval;
  const readyForExternalAdapters = approvedForExternalRequest && externalAdaptersConfigured;

  const steps: AgenticLaunchStep[] = [
    {
      id: "build-launch-url",
      label: "Build launch URL",
      lane: "internal",
      status: bundle ? "complete" : "blocked",
      detail: "Create the trade-domain URL with 4H UTM conventions and selected asset identity.",
      evidence: bundle?.url ?? "No launch bundle selected.",
    },
    {
      id: "validate-readiness",
      label: "Validate launch readiness",
      lane: "internal",
      status: bundle?.readiness.ready ? "complete" : "blocked",
      detail: "Check route, UTM, offer, trial, creative, copy, Jarrad approval, channel, and checklist gates.",
      evidence: bundle
        ? `${bundle.readiness.blockerCount} blockers, ${bundle.readiness.warningCount} warnings`
        : "No readiness result.",
    },
    {
      id: "build-launch-bundle",
      label: "Build launch bundle",
      lane: "internal",
      status: bundle ? "complete" : "blocked",
      detail: "Assemble copy, creative, budget, approval, readiness, and safety notes into one launch packet.",
      evidence: bundle?.id ?? "No bundle ID.",
    },
    {
      id: "prepare-upload-sheets",
      label: "Prepare platform upload sheets",
      lane: "internal",
      status: input.uploadSheets.length > 0 ? "complete" : "blocked",
      detail: "Generate local review-only CSVs for platform import planning.",
      evidence: `${input.uploadSheets.length} sheet${input.uploadSheets.length === 1 ? "" : "s"} prepared`,
    },
    {
      id: "upload-ad-drafts",
      label: "Upload ad drafts",
      lane: "external",
      status: externalStepStatus,
      detail: "Future adapter target for Meta, LinkedIn, Google, YouTube, and Instagram draft upload APIs.",
      evidence: "No ad-platform upload adapter is configured in 4H yet.",
    },
    {
      id: "launch-campaign",
      label: "Launch campaign",
      lane: "external",
      status: externalStepStatus,
      detail: "Future adapter target for changing campaign delivery state after exact action-time approval.",
      evidence: "No campaign launch adapter is configured in 4H yet.",
    },
    {
      id: "send-creator-outreach",
      label: "Send creator outreach",
      lane: "external",
      status: externalStepStatus,
      detail: "Future adapter target for approved email/DM sends from the creator pipeline.",
      evidence: "No outreach send adapter is configured in 4H yet.",
    },
    {
      id: "sync-spend-and-webhooks",
      label: "Sync spend and webhooks",
      lane: "external",
      status: externalStepStatus,
      detail: "Future adapter target for spend changes, webhooks, and attribution syncs.",
      evidence: "Spend and webhook adapters are not configured in 4H yet.",
    },
  ];

  return {
    mode,
    surface,
    readyForInternalAutomation: internalReady,
    readyForExternalAdapters,
    approvedForExternalRequest,
    externalAdaptersConfigured,
    externalConfirmation,
    summary: readyForExternalAdapters
      ? "Internal launch packet has server-verified approval and configured adapters for the requested external action."
      : "4H can prepare the launch packet agentically; live external actions remain gated by server-verified approval and configured adapters.",
    cli: {
      plan: commandFor(bundle, "plan"),
      prepare: commandFor(bundle, "prepare"),
      execute: commandFor(bundle, "execute"),
    },
    steps,
    safetyNotes: [
      "App, Codex, and Claude Code should all use this launch plan as the shared contract.",
      "Internal automation may build URLs, validate readiness, assemble bundles, and prepare local upload sheets.",
      "External sends, uploads, launches, webhook creation, spend changes, and billing changes require exact action-time approval.",
      "The current implementation does not call third-party ad, messaging, billing, or webhook APIs.",
    ],
  };
}
