import { bulkWorkflowStages, workflowHistoryDependencySummary, workflowTransitionPairs } from "./workflow-history";

export interface WorkflowOwnershipSurface {
  surface: string;
  owns: string;
  mutationAllowedInGuard: false;
}

export const workflowOwnershipSurfaces: WorkflowOwnershipSurface[] = [
  {
    surface: "/workflow",
    owns: "Legacy direct-link six-stage board and bulk-advance UI until Q-55 redirects the page route.",
    mutationAllowedInGuard: false,
  },
  {
    surface: "/approval",
    owns: "Human approval decisions and bulk ad status changes through the existing guarded API route.",
    mutationAllowedInGuard: false,
  },
  {
    surface: "/launch",
    owns: "Current launch readiness, bundles, stop screens, and review-only upload sheets.",
    mutationAllowedInGuard: false,
  },
  {
    surface: "/api/ads/bulk-status",
    owns: "Server-side status/workflow-stage updates when a human-approved surface explicitly calls it.",
    mutationAllowedInGuard: false,
  },
  {
    surface: "data/workflow-stages.json",
    owns: "Local fallback workflow-stage overrides when the database workflow_stage column is unavailable.",
    mutationAllowedInGuard: false,
  },
  {
    surface: "lib/workflow-history.ts",
    owns: "Six-stage historical stage order, transition pairs, and dependency inventory for route retirement.",
    mutationAllowedInGuard: false,
  },
];

export function workflowOwnershipGuardSummary() {
  const history = workflowHistoryDependencySummary();

  return {
    route: "/workflow",
    replacement: "/launch",
    verifiedAt: "2026-04-27",
    verifiedAgainst: "http://127.0.0.1:3106",
    routeStatus: 200,
    stageCount: bulkWorkflowStages.length,
    transitionCount: workflowTransitionPairs().length,
    dependencyCount: history.dependencyCount,
    ownershipSurfaceCount: workflowOwnershipSurfaces.length,
    readyForPageRedirectPacket:
      bulkWorkflowStages.length === 6 &&
      workflowTransitionPairs().length === 5 &&
      history.dependencyCount === 5 &&
      workflowOwnershipSurfaces.some((surface) => surface.surface === "/workflow") &&
      workflowOwnershipSurfaces.every((surface) => surface.mutationAllowedInGuard === false),
    externalActionAllowed: false,
    redirectImplemented: false,
    preservationRule:
      "Workflow stage history and active ownership are documented before any future /workflow page-route redirect.",
  };
}
