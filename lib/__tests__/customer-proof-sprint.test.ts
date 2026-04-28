import { describe, expect, it } from "vitest";
import {
  buildFounderDemoScriptPacket,
  buildLiveProofPacketCopy,
  activationDefinition,
  beachheadPriorities,
  channelExperimentLedger,
  deepResearchVerdict,
  founderDemoScripts,
  googleMapsLeadFinderRoadmap,
  outreachDraftPackets,
  pipeProofSprint,
  liveProofPackets,
  proofSprintQueue,
  rankChannelExperiments,
  summarizeProofSprint,
  tenCustomerSprintRows,
} from "../customer-proof-sprint";

describe("customer proof sprint", () => {
  it("covers Q-58 through Q-72 as completed internal sprint packets", () => {
    expect(proofSprintQueue.map((item) => item.id)).toEqual([
      "Q-58",
      "Q-59",
      "Q-60",
      "Q-61",
      "Q-62",
      "Q-63",
      "Q-64",
      "Q-65",
      "Q-66",
      "Q-67",
      "Q-68",
      "Q-69",
      "Q-70",
      "Q-71",
      "Q-72",
    ]);
    expect(proofSprintQueue.every((item) => item.status === "complete")).toBe(true);
    const safetyText = proofSprintQueue.map((item) => `${item.acceptance} ${item.evidence}`).join(" ");
    expect(safetyText).toContain("outreach");
    expect(safetyText).toContain("paid social");
  });

  it("keeps the Google Maps roadmap manual/API-first and blocks evasion", () => {
    expect(googleMapsLeadFinderRoadmap.principle).toContain("official Places API");
    expect(googleMapsLeadFinderRoadmap.compliantPath.join(" ")).toContain("manual");
    expect(googleMapsLeadFinderRoadmap.importWorkflow.join(" ")).toContain("Official API");
    expect(googleMapsLeadFinderRoadmap.importWorkflow.join(" ")).toContain("Provider row");
    expect(googleMapsLeadFinderRoadmap.blockedTactics.join(" ")).toContain("CAPTCHA");
    expect(googleMapsLeadFinderRoadmap.blockedTactics.join(" ")).toContain("rate-limit evasion");
    expect(googleMapsLeadFinderRoadmap.reviewRequiredBefore).toContain("sending email, SMS, DM, or form submissions");
  });

  it("locks the deep research reset to pipe.city and strict activation", () => {
    expect(beachheadPriorities[0]).toMatchObject({ domain: "pipe.city", role: "primary-scale" });
    expect(activationDefinition.requiredSignals).toContain("at least one real inbound call is handled by the AI");
    expect(activationDefinition.notEnough).toContain("trial signup alone");
    expect(deepResearchVerdict.preferredOption).toContain("plumbing first");
  });

  it("builds the pipe.city proof sprint and approval-only outreach packets", () => {
    expect(pipeProofSprint.domain).toBe("pipe.city");
    expect(pipeProofSprint.icp).toContain("Solo plumbing owner-operator");
    expect(pipeProofSprint.stages.map((stage) => stage.id)).toContain("real-call-handled");
    expect(pipeProofSprint.stages.map((stage) => stage.id)).toContain("job-captured");
    expect(outreachDraftPackets).toHaveLength(3);
    expect(outreachDraftPackets.every((packet) => packet.approvalGate.toLowerCase().includes("approval"))).toBe(true);
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

    expect(summary.queueItems).toBe(15);
    expect(summary.resetQueueItems).toBe(9);
    expect(summary.firstCustomerRows).toBe(10);
    expect(summary.primaryLane).toBe("pipe.city");
    expect(summary.safetyBoundary).toContain("No scraping evasion");
    expect(summary.safetyBoundary).toContain("sawcity-lite edits");
  });
});
