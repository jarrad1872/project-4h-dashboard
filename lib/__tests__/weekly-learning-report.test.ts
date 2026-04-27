import { describe, expect, it } from "vitest";
import { summarizeMarketingEvents, validateMarketingEvent } from "../marketing-events";
import { buildWeeklyLearningReport, rankLearningDimension } from "../weekly-learning-report";

const fixedNow = new Date("2026-04-27T12:00:00.000Z");

function event(input: Parameters<typeof validateMarketingEvent>[0]) {
  return validateMarketingEvent(input, fixedNow).event!;
}

describe("weekly learning report", () => {
  it("returns honest empty states when there is no attribution data", () => {
    const report = buildWeeklyLearningReport(summarizeMarketingEvents([]));

    expect(report.hasAnySignal).toBe(false);
    expect(report.hasPaidSignal).toBe(false);
    expect(report.headline).toContain("No paid campaign signal yet");
    expect(report.reports.every((dimension) => dimension.items.length === 0)).toBe(true);
    expect(report.reports[0].emptyState).toContain("No trade-level attribution yet");
  });

  it("ranks dimensions by funnel performance instead of raw views alone", () => {
    const summary = summarizeMarketingEvents([
      event({ event_type: "asset_view", trade_slug: "mow", creative_asset_id: "asset-b", angle: "owner-agent" }),
      event({ event_type: "asset_view", trade_slug: "mow", creative_asset_id: "asset-b", angle: "owner-agent" }),
      event({ event_type: "asset_view", trade_slug: "mow", creative_asset_id: "asset-b", angle: "owner-agent" }),
      event({ event_type: "asset_view", trade_slug: "pipe", creative_asset_id: "asset-a", angle: "missed-call" }),
      event({ event_type: "signup", trade_slug: "pipe", creative_asset_id: "asset-a", angle: "missed-call" }),
      event({ event_type: "paid", trade_slug: "pipe", creative_asset_id: "asset-a", angle: "missed-call" }),
    ]);

    const trades = rankLearningDimension(summary, "trades");
    const assets = rankLearningDimension(summary, "creativeAssets");

    expect(trades.items[0].key).toBe("pipe");
    expect(trades.items[0].signal).toBe("winner");
    expect(trades.items[0].evidence).toContain("paid conversion");
    expect(assets.items[0].key).toBe("asset-a");
  });

  it("labels non-paid activity as directional learning", () => {
    const summary = summarizeMarketingEvents([
      event({ event_type: "demo_call", creator_id: "creator-1", trade_slug: "duct" }),
      event({ event_type: "trial_started", creator_id: "creator-1", trade_slug: "duct" }),
    ]);

    const report = buildWeeklyLearningReport(summary);
    const creators = rankLearningDimension(summary, "creators");

    expect(report.hasPaidSignal).toBe(false);
    expect(report.headline).toContain("directional only");
    expect(creators.items[0].signal).toBe("promising");
    expect(creators.items[0].evidence).toContain("trial start");
  });
});
