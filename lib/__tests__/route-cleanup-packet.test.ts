import { describe, expect, it } from "vitest";
import {
  appliedRouteCleanupPackets,
  clearRouteCleanupPacket,
  clearRouteCleanupPacketSummary,
} from "../route-cleanup-packet";

describe("clearRouteCleanupPacket", () => {
  it("groups only clear route candidates without authorizing implementation", () => {
    expect(clearRouteCleanupPacket.map((entry) => entry.route)).toEqual([]);
    expect(clearRouteCleanupPacket.every((entry) => entry.implementationAllowed === false)).toBe(true);
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/generate")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/gtm")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/settings")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/creatives")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/workflow")).toBeUndefined();
  });

  it("has no pending clear candidates after Q50", () => {
    expect(clearRouteCleanupPacket).toHaveLength(0);
  });

  it("summarizes packet counts and blocked actions", () => {
    expect(clearRouteCleanupPacketSummary()).toEqual({
      total: 0,
      routes: [],
      appliedRoutes: ["/generate", "/gtm", "/settings", "/ads"],
      counts: { rebuild: 0, redirect: 0, archive: 0, delete: 0 },
      appliedCount: 4,
      implementationAllowed: false,
      blockedActions: ["route redirect", "route deletion", "ad upload", "campaign launch", "webhook creation", "spend change"],
      preservationRule:
        "This is a draft packet only: group clear candidates and verification requirements before any route implementation work.",
    });
  });

  it("records applied cleanup packets separately from pending candidates", () => {
    expect(appliedRouteCleanupPackets).toEqual([
      {
        route: "/generate",
        appliedIn: "Q-47",
        outcome: "Internal page route redirects to /assets while legacy generation API routes remain unchanged.",
        verification: ["/generate redirects to /assets", "/assets loads Creative Lab", "/api/generate is not removed"],
        externalActionAllowed: false,
      },
      {
        route: "/gtm",
        appliedIn: "Q-48",
        outcome: "Internal page route redirects to Command while product-route inventory remains preserved in Command/docs.",
        verification: ["/gtm redirects to /", "Command loads product-route inventory map", "sawcity-lite remains read-only"],
        externalActionAllowed: false,
      },
      {
        route: "/settings",
        appliedIn: "Q-49",
        outcome: "Internal page route redirects to Approval while setup/source notes remain preserved in Command/docs.",
        verification: ["/settings redirects to /approval", "Approval route loads", "placeholder credentials are not rendered"],
        externalActionAllowed: false,
      },
      {
        route: "/ads",
        appliedIn: "Q-50",
        outcome: "Ad archive remains readable while create/edit/pause/regenerate controls are removed and detail editor routes redirect back to archive.",
        verification: ["/ads shows read-only guard", "/ads/[id] redirects to /ads", "historical rows remain readable"],
        externalActionAllowed: false,
      },
    ]);
  });
});
