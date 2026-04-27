import { describe, expect, it } from "vitest";
import { buildCustomerPaceForecast } from "../customer-pace-forecast";
import type { ChannelMetrics, MetricsWeek } from "../types";

const emptyChannel: ChannelMetrics = {
  spend: 0,
  impressions: 0,
  clicks: 0,
  signups: 0,
  activations: 0,
  paid: 0,
};

function week(weekStart: string, paid: Partial<Record<keyof Omit<MetricsWeek, "weekStart" | "updatedAt">, number>> = {}): MetricsWeek {
  return {
    weekStart,
    linkedin: { ...emptyChannel, paid: paid.linkedin ?? 0 },
    youtube: { ...emptyChannel, paid: paid.youtube ?? 0 },
    facebook: { ...emptyChannel, paid: paid.facebook ?? 0 },
    instagram: { ...emptyChannel, paid: paid.instagram ?? 0 },
  };
}

describe("customer pace forecast", () => {
  const now = new Date("2026-04-27T12:00:00.000Z");

  it("returns an explicit no-data state before paid customers are logged", () => {
    const forecast = buildCustomerPaceForecast([week("2026-04-20")], { now });

    expect(forecast.status).toBe("no-data");
    expect(forecast.paidCustomers).toBe(0);
    expect(forecast.evidence).toBe("No paid customer data logged yet.");
    expect(forecast.nextBet).toContain("log paid conversions");
  });

  it("calculates current pace, projection, and gaps from logged paid rows", () => {
    const forecast = buildCustomerPaceForecast([
      week("2026-04-06", { linkedin: 20, facebook: 10 }),
      week("2026-04-13", { youtube: 30 }),
      week("2026-04-20", { instagram: 40 }),
    ], { now });

    expect(forecast.paidCustomers).toBe(100);
    expect(forecast.loggedWeeks).toBe(3);
    expect(forecast.weeksWithPaid).toBe(3);
    expect(forecast.weeksRemaining).toBe(36);
    expect(forecast.currentWeeklyPace).toBe(33.3);
    expect(forecast.projectedCustomers).toBe(1300);
    expect(forecast.projectedLowGap).toBe(0);
    expect(forecast.projectedHighGap).toBe(700);
    expect(forecast.status).toBe("low-track");
  });

  it("uses logged zero weeks in the pace denominator instead of inflating the forecast", () => {
    const forecast = buildCustomerPaceForecast([
      week("2026-04-06", { linkedin: 40 }),
      week("2026-04-13"),
      week("2026-04-20"),
    ], { now });

    expect(forecast.weeksWithPaid).toBe(1);
    expect(forecast.currentWeeklyPace).toBe(13.3);
    expect(forecast.status).toBe("behind");
    expect(forecast.projectedLowGap).toBe(480);
  });

  it("reports the weekly requirement for the low and high target paths", () => {
    const forecast = buildCustomerPaceForecast([week("2026-04-20", { linkedin: 100 })], { now });

    expect(forecast.requiredWeeklyLow).toBe(25);
    expect(forecast.requiredWeeklyHigh).toBe(52.8);
    expect(forecast.requiredMonthlyLow).toBe(108.3);
    expect(forecast.requiredMonthlyHigh).toBe(228.7);
    expect(forecast.remainingToLow).toBe(900);
    expect(forecast.remainingToHigh).toBe(1900);
  });
});
