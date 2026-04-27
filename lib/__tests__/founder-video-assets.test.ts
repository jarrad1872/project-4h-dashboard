import { describe, expect, it } from "vitest";
import {
  buildFounderVideoPacket,
  founderVideoAssets,
  summarizeFounderVideoAssets,
} from "../founder-video-assets";

describe("founder video assets", () => {
  it("tracks one missed-call and one demo-proof clip per beachhead trade", () => {
    const byDomain = founderVideoAssets.reduce<Record<string, string[]>>((domains, asset) => {
      domains[asset.domain] = [...(domains[asset.domain] ?? []), asset.angle];
      return domains;
    }, {});

    expect(Object.keys(byDomain).sort()).toEqual(["coat.city", "duct.city", "mow.city", "pest.city", "pipe.city"]);
    expect(Object.values(byDomain).every((angles) => angles.includes("missed-call") && angles.includes("demo-proof"))).toBe(true);
  });

  it("summarizes founder video production status", () => {
    const summary = summarizeFounderVideoAssets();

    expect(summary.total).toBe(10);
    expect(summary.scripted).toBe(5);
    expect(summary.needed).toBe(5);
    expect(summary.remainingToFilm).toBe(10);
    expect(summary.readyForReview).toBe(0);
    expect(summary.nextAsset?.id).toBe("fv-pipe-demo-proof");
  });

  it("builds a review-gated shoot packet with the hard offer", () => {
    const packet = buildFounderVideoPacket(founderVideoAssets[0]);

    expect(packet).toContain("$39/mo");
    expect(packet).toContain("14-day free trial, no credit card required");
    expect(packet).toContain("Jarrad approval required");
    expect(packet).toContain("Do not publish, upload, send, launch, create webhooks, or spend");
  });
});
