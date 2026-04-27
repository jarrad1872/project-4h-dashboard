import { describe, expect, it } from "vitest";
import { buildLifecycleFollowupMeasurement } from "../lifecycle-followup-measurement";
import type { LifecycleMessage, MarketingEventSummary } from "../types";

function message(id: string, timing: string, status: LifecycleMessage["status"], channel: LifecycleMessage["channel"]): LifecycleMessage {
  return {
    id,
    asset_id: id,
    channel,
    timing,
    subject: null,
    message: "Follow up",
    goal: "Move user to the next lifecycle step",
    status,
    updated_at: "2026-04-27T00:00:00.000Z",
  };
}

function summary(counts: Partial<MarketingEventSummary["byType"]>): MarketingEventSummary {
  return {
    total: Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0),
    byType: {
      asset_view: counts.asset_view ?? 0,
      demo_call: counts.demo_call ?? 0,
      signup: counts.signup ?? 0,
      trial_started: counts.trial_started ?? 0,
      activated: counts.activated ?? 0,
      paid: counts.paid ?? 0,
    },
    byPlatform: {},
    byTrade: {},
    byAngle: {},
    dimensions: {
      trades: {},
      creators: {},
      creativeAssets: {},
      angles: {},
    },
    paidValueCents: 0,
  };
}

describe("buildLifecycleFollowupMeasurement", () => {
  it("calculates lifecycle conversion rates from marketing events", () => {
    const result = buildLifecycleFollowupMeasurement(
      [
        message("day-1-email", "day_1", "active", "email"),
        message("day-1-sms", "day_1", "paused", "sms"),
        message("day-3-email", "day_3", "active", "email"),
        message("trial-start", "trial_start", "active", "email"),
      ],
      summary({ signup: 20, trial_started: 10, activated: 5, paid: 2 }),
    );

    expect(result.measuredMessages).toBe(3);
    expect(result.activeMessages).toBe(2);
    expect(result.pausedMessages).toBe(1);
    expect(result.rates[0]).toMatchObject({ label: "Signup to trial", from: 20, to: 10, rate: 0.5 });
    expect(result.rates[2]).toMatchObject({ label: "Activation to paid", from: 5, to: 2, rate: 0.4 });
    expect(result.coverage.find((row) => row.timing === "day_1")).toMatchObject({ active: 1, paused: 1, channelCount: 2 });
  });

  it("shows honest waiting state when no signup base exists", () => {
    const result = buildLifecycleFollowupMeasurement([message("day-1", "day_1", "active", "email")], summary({}));

    expect(result.rates[0].rate).toBeNull();
    expect(result.rates[0].note).toContain("No signup base");
    expect(result.nextAction).toContain("Log the first signup");
    expect(result.evidence).toContain("No marketing events");
  });
});
