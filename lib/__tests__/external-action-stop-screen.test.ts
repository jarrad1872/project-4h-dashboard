import { describe, expect, it } from "vitest";
import { externalActionStops, externalActionStopSummary, getExternalActionStop } from "../external-action-stop-screen";

describe("external action stop screen", () => {
  it("covers launch, upload, outreach, webhook, and spend risks", () => {
    const ids = externalActionStops.map((item) => item.id);

    expect(ids).toEqual(expect.arrayContaining([
      "launch_campaign",
      "upload_ads",
      "send_outreach",
      "create_webhook",
      "change_spend",
    ]));
  });

  it("requires exact Jarrad approval details for every external action", () => {
    for (const item of externalActionStops) {
      expect(item.exactApprovalNeeded).toContain("Jarrad must approve");
      expect(item.exactApprovalNeeded.length).toBeGreaterThan(80);
      expect(item.risk.length).toBeGreaterThan(40);
    }
  });

  it("does not define any external API action from the stop surface", () => {
    expect(externalActionStops.every((item) => item.performsExternalApiAction === false)).toBe(true);
    expect(externalActionStops.map((item) => item.blockedMechanism).join(" ")).toContain("does not call");
  });

  it("builds a copy-ready stop summary for launch review", () => {
    const summary = externalActionStopSummary(getExternalActionStop("launch_campaign"));

    expect(summary).toContain("Stopped action: Launch or edit a paid campaign");
    expect(summary).toContain("Approval needed:");
    expect(summary).toContain("Blocked mechanism:");
    expect(summary).toContain("LinkedIn, Meta, Google, YouTube, Instagram");
  });
});
