import type { WorkflowStage } from "./types";

export interface WorkflowStageDefinition {
  key: WorkflowStage;
  label: string;
  desc: string;
}

export interface WorkflowHistoryDependency {
  id: string;
  surface: string;
  preserves: string;
  source: string;
  externalActionAllowed: false;
}

export const bulkWorkflowStages: WorkflowStageDefinition[] = [
  { key: "concept", label: "Concept", desc: "Idea only - no copy yet" },
  { key: "copy-ready", label: "Copy Ready", desc: "Copy written, awaiting approval" },
  { key: "approved", label: "Approved", desc: "Signed off, needs creative brief" },
  { key: "creative-brief", label: "Creative Brief", desc: "Brief written, creative pending" },
  { key: "uploaded", label: "Uploaded", desc: "Uploaded to ad platform" },
  { key: "live", label: "Live", desc: "Running in market" },
];

export const bulkWorkflowNextStage: Partial<Record<WorkflowStage, WorkflowStage>> = {
  concept: "copy-ready",
  "copy-ready": "approved",
  approved: "creative-brief",
  "creative-brief": "uploaded",
  uploaded: "live",
};

export const workflowHistoryDependencies: WorkflowHistoryDependency[] = [
  {
    id: "stage-field",
    surface: "ads.workflow_stage",
    preserves: "Current pipeline position for each historical ad row.",
    source: "Supabase ads table and normalized Ad compatibility fields.",
    externalActionAllowed: false,
  },
  {
    id: "fallback-overrides",
    surface: "data/workflow-stages.json",
    preserves: "Local workflow-stage overrides used when the DB column is missing or unavailable.",
    source: "DataFiles.workflowStages fallback store.",
    externalActionAllowed: false,
  },
  {
    id: "bulk-transition-api",
    surface: "/api/ads/bulk-status",
    preserves: "Server-side bulk movement by ids, status, workflow stage, or campaign group filter.",
    source: "Legacy Workflow bulk advance buttons and Approval/GTM ad operations.",
    externalActionAllowed: false,
  },
  {
    id: "stage-board",
    surface: "/workflow",
    preserves: "Six-stage visual pipeline, per-stage counts, and stage expansion.",
    source: "Legacy direct-link archive page.",
    externalActionAllowed: false,
  },
  {
    id: "trade-breakdown",
    surface: "tradeFromAd + TRADE_MAP",
    preserves: "Per-trade workflow progress overview sorted by trade tier.",
    source: "Legacy workflow trade progress table.",
    externalActionAllowed: false,
  },
];

export function workflowTransitionPairs() {
  return bulkWorkflowStages
    .map((stage) => ({
      from: stage.key,
      to: bulkWorkflowNextStage[stage.key] ?? null,
    }))
    .filter((transition): transition is { from: WorkflowStage; to: WorkflowStage } => transition.to !== null);
}

export function workflowHistoryDependencySummary() {
  return {
    stageCount: bulkWorkflowStages.length,
    transitionCount: workflowTransitionPairs().length,
    dependencyCount: workflowHistoryDependencies.length,
    route: "/workflow",
    apiRoute: "/api/ads/bulk-status",
    fallbackFile: "data/workflow-stages.json",
    preservationRule:
      "Preserve workflow stage history, fallback overrides, and bulk transition behavior before any /workflow redirect work.",
  };
}
