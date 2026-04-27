import { describe, expect, it } from "vitest";
import { clearRouteCleanupPacket, clearRouteCleanupPacketSummary } from "../route-cleanup-packet";

describe("clearRouteCleanupPacket", () => {
  it("groups only clear route candidates without authorizing implementation", () => {
    expect(clearRouteCleanupPacket.map((entry) => entry.route)).toEqual(["/ads", "/generate", "/gtm", "/settings"]);
    expect(clearRouteCleanupPacket.every((entry) => entry.implementationAllowed === false)).toBe(true);
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/creatives")).toBeUndefined();
    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/workflow")).toBeUndefined();
  });

  it("keeps preserved evidence and verification attached to every candidate", () => {
    for (const entry of clearRouteCleanupPacket) {
      expect(entry.preservedEvidence.length).toBeGreaterThan(0);
      expect(entry.requiredVerification).toContain("No redirect, deletion, upload, launch, webhook, spend, or external action occurs in the packet draft");
    }

    expect(clearRouteCleanupPacket.find((entry) => entry.route === "/ads")?.preservedEvidence).toContain(
      "Historical ad archive audit map preserved in ad-archive",
    );
  });

  it("summarizes packet counts and blocked actions", () => {
    expect(clearRouteCleanupPacketSummary()).toEqual({
      total: 4,
      routes: ["/ads", "/generate", "/gtm", "/settings"],
      counts: { rebuild: 0, redirect: 1, archive: 2, delete: 1 },
      implementationAllowed: false,
      blockedActions: ["route redirect", "route deletion", "ad upload", "campaign launch", "webhook creation", "spend change"],
      preservationRule:
        "This is a draft packet only: group clear candidates and verification requirements before any route implementation work.",
    });
  });
});
