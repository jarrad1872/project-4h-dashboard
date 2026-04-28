import { describe, expect, it } from "vitest";
import { workflowOwnershipGuardSummary, workflowOwnershipSurfaces } from "../workflow-ownership-guard";

describe("workflow ownership guard", () => {
  it("documents current ownership before /workflow redirect work", () => {
    expect(workflowOwnershipSurfaces.map((surface) => surface.surface)).toEqual([
      "/workflow",
      "/approval",
      "/launch",
      "/api/ads/bulk-status",
      "data/workflow-stages.json",
      "lib/workflow-history.ts",
    ]);
    expect(workflowOwnershipSurfaces.every((surface) => surface.mutationAllowedInGuard === false)).toBe(true);
  });

  it("marks workflow redirect implemented after preserving ownership", () => {
    expect(workflowOwnershipGuardSummary()).toMatchObject({
      route: "/workflow",
      replacement: "/launch",
      verifiedAt: "2026-04-27",
      verifiedAgainst: "http://127.0.0.1:3106",
      routeStatus: 307,
      redirectDestination: "/launch",
      stageCount: 6,
      transitionCount: 5,
      dependencyCount: 5,
      ownershipSurfaceCount: 6,
      readyForPageRedirectPacket: true,
      externalActionAllowed: false,
      redirectImplemented: true,
    });
  });
});
