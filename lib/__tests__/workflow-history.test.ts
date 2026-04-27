import { describe, expect, it } from "vitest";
import {
  bulkWorkflowNextStage,
  bulkWorkflowStages,
  workflowHistoryDependencies,
  workflowHistoryDependencySummary,
  workflowTransitionPairs,
} from "../workflow-history";

describe("workflow history dependency map", () => {
  it("preserves the legacy six-stage workflow order", () => {
    expect(bulkWorkflowStages.map((stage) => stage.key)).toEqual([
      "concept",
      "copy-ready",
      "approved",
      "creative-brief",
      "uploaded",
      "live",
    ]);
  });

  it("preserves the bulk advance transitions without adding a live-stage transition", () => {
    expect(bulkWorkflowNextStage).toEqual({
      concept: "copy-ready",
      "copy-ready": "approved",
      approved: "creative-brief",
      "creative-brief": "uploaded",
      uploaded: "live",
    });
    expect(workflowTransitionPairs()).toEqual([
      { from: "concept", to: "copy-ready" },
      { from: "copy-ready", to: "approved" },
      { from: "approved", to: "creative-brief" },
      { from: "creative-brief", to: "uploaded" },
      { from: "uploaded", to: "live" },
    ]);
  });

  it("inventories the workflow data dependencies separately from the legacy page route", () => {
    expect(workflowHistoryDependencySummary()).toMatchObject({
      stageCount: 6,
      transitionCount: 5,
      dependencyCount: 5,
      route: "/workflow",
      apiRoute: "/api/ads/bulk-status",
      fallbackFile: "data/workflow-stages.json",
    });
    expect(workflowHistoryDependencies.map((dependency) => dependency.surface)).toEqual([
      "ads.workflow_stage",
      "data/workflow-stages.json",
      "/api/ads/bulk-status",
      "/workflow",
      "tradeFromAd + TRADE_MAP",
    ]);
    expect(workflowHistoryDependencies.every((dependency) => dependency.externalActionAllowed === false)).toBe(true);
  });
});
