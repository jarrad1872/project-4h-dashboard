import { describe, expect, it } from "vitest";
import {
  DEFAULT_CREATIVE_TOOL,
  formatAudienceSize,
  formatCreativeAssetAngleLabel,
  formatCreativeAssetStatusLabel,
  formatInfluencerStatusLabel,
  getCountdownDays,
  latestMetricsWeek,
  normalizeAudienceSize,
  normalizeInfluencerStatus,
  summarizeBudget,
  summarizeCreativePipeline,
  summarizeInfluencerPipeline,
} from "../growth-command-center";
import type { BudgetData, CreativeAsset, Influencer, MetricsData } from "../types";

describe("normalizeInfluencerStatus", () => {
  it("maps legacy statuses to the new workflow", () => {
    expect(normalizeInfluencerStatus("identified")).toBe("researching");
    expect(normalizeInfluencerStatus("replied")).toBe("negotiating");
    expect(normalizeInfluencerStatus("active")).toBe("content_live");
  });

  it("defaults unknown statuses to researching", () => {
    expect(normalizeInfluencerStatus("mystery")).toBe("researching");
    expect(normalizeInfluencerStatus(null)).toBe("researching");
  });
});

describe("normalizeAudienceSize", () => {
  it("prefers explicit numeric audience size", () => {
    expect(normalizeAudienceSize(42000, "55K")).toBe(42000);
  });

  it("parses compact reach strings", () => {
    expect(normalizeAudienceSize(null, "55K+ operators")).toBe(55000);
    expect(normalizeAudienceSize(null, "1.2M followers")).toBe(1200000);
  });
});

describe("formatAudienceSize", () => {
  it("formats audience counts compactly", () => {
    expect(formatAudienceSize(12500)).toBe("12.5K");
    expect(formatAudienceSize(null)).toBe("Unknown");
  });
});

describe("label helpers", () => {
  it("formats influencer statuses for display", () => {
    expect(formatInfluencerStatusLabel("content_live")).toBe("Content Live");
  });

  it("formats creative asset labels for display", () => {
    expect(formatCreativeAssetAngleLabel("missed-call")).toBe("Missed Call");
    expect(formatCreativeAssetStatusLabel("approved")).toBe("Approved");
  });

  it("uses the configured default creative tool model", () => {
    expect(DEFAULT_CREATIVE_TOOL).toBe("gemini-3.1-flash-image-preview");
  });
});

describe("getCountdownDays", () => {
  it("returns the remaining whole days rounded up", () => {
    const now = new Date("2026-03-31T12:00:00.000Z");
    expect(getCountdownDays("2026-04-14T00:00:00.000Z", now)).toBe(14);
  });
});

describe("summaries", () => {
  it("summarizes influencer workflow counts", () => {
    const influencers = [
      { status: "identified" },
      { status: "contacted" },
      { status: "contracted" },
      { status: "paid" },
    ] as Influencer[];

    const summary = summarizeInfluencerPipeline(influencers);
    expect(summary.researching).toBe(1);
    expect(summary.contacted).toBe(1);
    expect(summary.contracted).toBe(1);
    expect(summary.paid).toBe(1);
  });

  it("summarizes creative pipeline counts", () => {
    const assets = [
      { status: "draft" },
      { status: "review" },
      { status: "review" },
      { status: "approved" },
    ] as CreativeAsset[];

    const summary = summarizeCreativePipeline(assets);
    expect(summary.total).toBe(4);
    expect(summary.review).toBe(2);
    expect(summary.approved).toBe(1);
  });

  it("returns the latest metrics week", () => {
    const metrics: MetricsData = {
      weeks: [
        {
          weekStart: "2026-03-10",
          linkedin: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
          youtube: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
          facebook: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
          instagram: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
        },
        {
          weekStart: "2026-03-24",
          linkedin: { spend: 10, impressions: 100, clicks: 5, signups: 1, activations: 0, paid: 0 },
          youtube: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
          facebook: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
          instagram: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
        },
      ],
    };

    expect(latestMetricsWeek(metrics)?.weekStart).toBe("2026-03-24");
  });

  it("summarizes budget totals", () => {
    const budget: BudgetData = {
      totalBudget: 8000,
      channels: {
        linkedin: { allocated: 2000, spent: 450 },
        youtube: { allocated: 2000, spent: 300 },
        facebook: { allocated: 2000, spent: 150 },
        instagram: { allocated: 2000, spent: 100 },
      },
    };

    expect(summarizeBudget(budget)).toMatchObject({
      allocated: 8000,
      spent: 1000,
      floor: 5000,
      ceiling: 10000,
    });
  });
});
