import { describe, expect, it } from "vitest";
import { buildCustomerPaceForecast } from "../customer-pace-forecast";
import { buildTradeWeeklyTargetPlan } from "../trade-weekly-targets";
import type { MarketingEventSummary, MetricsWeek } from "../types";

function week(paid: number): MetricsWeek {
  return {
    weekStart: "2026-04-20",
    linkedin: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid },
    youtube: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
    facebook: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
    instagram: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
  };
}

function summary(tradePaid: Record<string, number>): MarketingEventSummary {
  return {
    total: 0,
    byType: {
      asset_view: 0,
      demo_call: 0,
      signup: 0,
      trial_started: 0,
      activated: 0,
      paid: Object.values(tradePaid).reduce((sum, paid) => sum + paid, 0),
    },
    byPlatform: {},
    byTrade: {},
    byAngle: {},
    dimensions: {
      trades: Object.fromEntries(
        Object.entries(tradePaid).map(([trade, paid]) => [
          trade,
          {
            total: paid,
            asset_view: 0,
            demo_call: 0,
            signup: 0,
            trial_started: 0,
            activated: 0,
            paid,
            paidValueCents: 0,
          },
        ]),
      ),
      creators: {},
      creativeAssets: {},
      angles: {},
    },
    paidValueCents: 0,
  };
}

describe("buildTradeWeeklyTargetPlan", () => {
  it("splits the required weekly customer target across beachhead trades", () => {
    const pace = buildCustomerPaceForecast([week(10)], {
      now: new Date("2026-04-27T00:00:00.000Z"),
      targetLow: 1010,
      targetHigh: 2010,
      deadline: "2026-04-27",
    });
    const plan = buildTradeWeeklyTargetPlan({
      pace,
      weeklySummary: summary({ pipe: 2 }),
      allTimeSummary: summary({ pipe: 12 }),
    });

    expect(plan.trades).toHaveLength(5);
    expect(plan.totalWeeklyLowTarget).toBe(1000);
    expect(plan.totalWeeklyHighTarget).toBe(2000);
    expect(plan.totalPaidThisWeek).toBe(2);
    expect(plan.trades[0]).toMatchObject({
      domain: "pipe.city",
      weeklyLowTarget: 200,
      weeklyHighTarget: 400,
      paidThisWeek: 2,
      allTimePaid: 12,
      status: "behind",
    });
  });

  it("matches paid counts by domain or slug", () => {
    const pace = buildCustomerPaceForecast([], {
      now: new Date("2026-04-27T00:00:00.000Z"),
      targetLow: 50,
      targetHigh: 100,
      deadline: "2026-05-04",
    });
    const plan = buildTradeWeeklyTargetPlan({
      pace,
      weeklySummary: summary({ "duct.city": 20, mow: 40 }),
      allTimeSummary: summary({ "duct.city": 25, mow: 55 }),
    });

    expect(plan.trades.find((trade) => trade.domain === "duct.city")?.paidThisWeek).toBe(20);
    expect(plan.trades.find((trade) => trade.domain === "mow.city")?.paidThisWeek).toBe(40);
  });

  it("shows waiting state when no trade has paid signal yet", () => {
    const pace = buildCustomerPaceForecast([], {
      now: new Date("2026-04-27T00:00:00.000Z"),
      targetLow: 50,
      targetHigh: 100,
      deadline: "2026-05-04",
    });
    const plan = buildTradeWeeklyTargetPlan({
      pace,
      weeklySummary: summary({}),
      allTimeSummary: summary({}),
    });

    expect(plan.trades.every((trade) => trade.status === "waiting")).toBe(true);
    expect(plan.evidence).toContain("No paid customer data is logged yet");
  });
});
