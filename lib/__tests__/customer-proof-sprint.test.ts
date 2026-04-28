import { describe, expect, it } from "vitest";
import {
  buildFounderDemoScriptPacket,
  buildLiveProofPacketCopy,
  channelExperimentLedger,
  founderDemoScripts,
  googleMapsLeadFinderRoadmap,
  liveProofPackets,
  proofSprintQueue,
  rankChannelExperiments,
  summarizeProofSprint,
  tenCustomerSprintRows,
} from "../customer-proof-sprint";

describe("customer proof sprint", () => {
  it("covers Q-58 through Q-63 as completed internal sprint packets", () => {
    expect(proofSprintQueue.map((item) => item.id)).toEqual(["Q-58", "Q-59", "Q-60", "Q-61", "Q-62", "Q-63"]);
    expect(proofSprintQueue.every((item) => item.status === "complete")).toBe(true);
    const safetyText = proofSprintQueue.map((item) => `${item.acceptance} ${item.evidence}`).join(" ");
    expect(safetyText).toContain("outreach");
    expect(safetyText).toContain("paid social");
  });

  it("keeps the Google Maps roadmap manual/API-first and blocks evasion", () => {
    expect(googleMapsLeadFinderRoadmap.principle).toContain("official Places API");
    expect(googleMapsLeadFinderRoadmap.compliantPath.join(" ")).toContain("manual");
    expect(googleMapsLeadFinderRoadmap.blockedTactics.join(" ")).toContain("CAPTCHA");
    expect(googleMapsLeadFinderRoadmap.blockedTactics.join(" ")).toContain("rate-limit evasion");
    expect(googleMapsLeadFinderRoadmap.reviewRequiredBefore).toContain("sending email, SMS, DM, or form submissions");
  });

  it("builds founder scripts and proof packets for the five beachhead domains", () => {
    const domains = founderDemoScripts.map((script) => script.domain).sort();

    expect(domains).toEqual(["lockout.city", "mow.city", "pipe.city", "rinse.city", "saw.city"]);
    expect(liveProofPackets).toHaveLength(5);
    expect(founderDemoScripts.every((script) => script.cta.includes("$39/mo"))).toBe(true);
    expect(founderDemoScripts.every((script) => script.cta.toLowerCase().includes("no credit card"))).toBe(true);
  });

  it("creates copy packets with demo and tracking evidence", () => {
    const scriptPacket = buildFounderDemoScriptPacket(founderDemoScripts[0]);
    const proofPacket = buildLiveProofPacketCopy(liveProofPackets[0]);

    expect(scriptPacket).toContain("Demo line:");
    expect(scriptPacket).toContain("CTA:");
    expect(proofPacket).toContain("Tracking path:");
    expect(proofPacket).toContain("Screenshot checklist:");
  });

  it("keeps the first-customer board focused on ten attempts", () => {
    expect(tenCustomerSprintRows).toHaveLength(10);
    expect(tenCustomerSprintRows.some((row) => row.source === "review-signal-outbound")).toBe(true);
    expect(tenCustomerSprintRows.some((row) => row.source === "field-sales")).toBe(true);
    expect(tenCustomerSprintRows.every((row) => row.nextMove.length > 20)).toBe(true);
  });

  it("ranks stronger channel experiments before weaker paid tests", () => {
    const ranked = rankChannelExperiments(channelExperimentLedger);

    expect(ranked[0].evidenceStrength).toBe("strong");
    expect(ranked.at(-1)?.channel).toBe("paid-social");
    expect(channelExperimentLedger.every((experiment) => experiment.killCriteria.length > 20)).toBe(true);
  });

  it("summarizes the sprint boundary", () => {
    const summary = summarizeProofSprint();

    expect(summary.queueItems).toBe(6);
    expect(summary.firstCustomerRows).toBe(10);
    expect(summary.safetyBoundary).toContain("No scraping evasion");
    expect(summary.safetyBoundary).toContain("sawcity-lite edits");
  });
});
