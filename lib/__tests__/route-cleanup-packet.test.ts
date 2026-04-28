import { describe, expect, it } from "vitest";
import {
  appliedRouteCleanupPackets,
  blockedRouteCleanupPacket,
  blockedRouteCleanupPacketSummary,
  clearRouteCleanupPacket,
  clearRouteCleanupPacketSummary,
} from "../route-cleanup-packet";

describe("clearRouteCleanupPacket", () => {
  it("groups only clear route candidates without authorizing implementation", () => {
    expect(clearRouteCleanupPacket.map((entry) => entry.route)).toEqual(["/creatives"]);
    expect(clearRouteCleanupPacket.every((entry) => entry.implementationAllowed === false)).toBe(true);
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/generate")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/gtm")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/settings")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/creatives")?.preservedEvidence).toContain(
      "Q-52 verified /creatives page route and all 24 public JPEG URLs returned 200 before redirect work",
    );
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/workflow")).toBeUndefined();
  });

  it("keeps only /creatives clear after Q52 guard resolution", () => {
    expect(clearRouteCleanupPacket).toHaveLength(1);
    expect(clearRouteCleanupPacket[0].requiredVerification).toContain("Command route guard shows clear");
  });

  it("summarizes packet counts and blocked actions", () => {
    expect(clearRouteCleanupPacketSummary()).toEqual({
      total: 1,
      routes: ["/creatives"],
      appliedRoutes: ["/generate", "/gtm", "/settings", "/ads"],
      counts: { rebuild: 0, redirect: 1, archive: 0, delete: 0 },
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

  it("drafts blocked-route cleanup packets without authorizing implementation", () => {
    expect(blockedRouteCleanupPacket.map((entry) => entry.route)).toEqual(["/workflow"]);
    expect(blockedRouteCleanupPacket.every((entry) => entry.implementationAllowed === false)).toBe(true);
    expect(blockedRouteCleanupPacket.find((entry) => entry.route === "/workflow")?.requiredVerification).toContain(
      "Workflow history map still exposes six stages, five transitions, and fallback/API dependencies",
    );
  });

  it("summarizes blocked-route packet requirements", () => {
    expect(blockedRouteCleanupPacketSummary()).toEqual({
      total: 1,
      routes: ["/workflow"],
      replacements: ["/launch"],
      implementationAllowed: false,
      staticChecksRequired: false,
      blockedActions: [
        "route redirect",
        "route deletion",
        "static asset move",
        "ad upload",
        "campaign launch",
        "outreach send",
        "external API call",
        "webhook creation",
        "spend change",
        "billing change",
        "sawcity-lite change",
      ],
      preservationRule:
        "Q-52 resolved the static creative URL blocker; the remaining blocked-route packet preserves workflow history before any future /workflow redirect work.",
    });
  });
});
