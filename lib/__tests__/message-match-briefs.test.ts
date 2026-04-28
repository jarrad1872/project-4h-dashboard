import { describe, expect, it } from "vitest";
import {
  buildMessageMatchPacket,
  listMessageMatchBriefs,
  type MessageMatchBrief,
} from "../message-match-briefs";

describe("listMessageMatchBriefs", () => {
  it("creates one brief for every beachhead trade and image angle", () => {
    const briefs = listMessageMatchBriefs();

    expect(briefs).toHaveLength(20);
    expect(briefs.map((brief) => brief.domain).sort()).toEqual([
      "lockout.city",
      "lockout.city",
      "lockout.city",
      "lockout.city",
      "mow.city",
      "mow.city",
      "mow.city",
      "mow.city",
      "pipe.city",
      "pipe.city",
      "pipe.city",
      "pipe.city",
      "rinse.city",
      "rinse.city",
      "rinse.city",
      "rinse.city",
      "saw.city",
      "saw.city",
      "saw.city",
      "saw.city",
    ]);
    expect(new Set(briefs.map((brief) => brief.angle))).toEqual(new Set([
      "missed-call",
      "demo-call",
      "owner-agent",
      "roi-math",
    ]));
  });

  it("keeps every brief complete for message match handoff", () => {
    for (const brief of listMessageMatchBriefs()) {
      expect(brief.domain).toMatch(/\.city$/);
      expect(brief.adPromise).toBeTruthy();
      expect(brief.landingHeadline).toContain(brief.tradeLabel.toLowerCase());
      expect(brief.heroDirection).toBeTruthy();
      expect(brief.supportingProof.length).toBeGreaterThanOrEqual(3);
      expect(brief.primaryCta).toBe("Start free trial");
      expect(brief.offer).toBe("$39/mo");
      expect(brief.trial).toBe("14-day free trial, no credit card required");
      expect(brief.handoffNotes.join(" ")).toMatch(/do not edit sawcity-lite/i);
    }
  });
});

describe("buildMessageMatchPacket", () => {
  it("renders a copy-ready handoff packet with offer rules", () => {
    const brief = listMessageMatchBriefs().find((item): item is MessageMatchBrief =>
      item.domain === "pipe.city" && item.angle === "demo-call",
    );
    expect(brief).toBeTruthy();

    const packet = buildMessageMatchPacket(brief);

    expect(packet).toContain("pipe.city message-match brief");
    expect(packet).toContain("Ad promise:");
    expect(packet).toContain("Landing headline:");
    expect(packet).toContain("https://pipe.city/");
    expect(packet).toContain("$39/mo");
    expect(packet).toContain("14-day free trial, no credit card required");
    expect(packet).toContain("4H handoff only");
  });
});
