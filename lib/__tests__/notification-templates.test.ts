import { describe, it, expect } from "vitest";
import {
  formatKillSignal,
  formatScaleSignal,
  formatAlertFired,
  formatDailyReport,
  formatWeeklyReport,
  formatTestMessage,
} from "../notification-templates";

describe("formatKillSignal", () => {
  it("formats kill signal message", () => {
    const msg = formatKillSignal({
      platform: "linkedin",
      signal: "kill",
      ctr: 0.5,
      cpa_paid: 800,
      activation_rate: 10,
      spend: 500,
    });
    expect(msg).toContain("KILL SIGNAL: LINKEDIN");
    expect(msg).toContain("CTR: 0.5%");
    expect(msg).toContain("CPA: $800");
    expect(msg).toContain("Pause linkedin");
  });
});

describe("formatScaleSignal", () => {
  it("formats scale signal message", () => {
    const msg = formatScaleSignal({
      platform: "facebook",
      signal: "scale",
      ctr: 2.1,
      cpa_paid: 200,
      activation_rate: 42,
      spend: 300,
    });
    expect(msg).toContain("SCALE SIGNAL: FACEBOOK");
    expect(msg).toContain("CTR: 2.1%");
    expect(msg).toContain("Increase facebook budget");
  });
});

describe("formatAlertFired", () => {
  it("formats gt alert", () => {
    const msg = formatAlertFired({
      id: "alert-1",
      metric: "spend",
      platform: "linkedin",
      operator: "gt",
      threshold: 500,
      action: "notify",
      current_value: 520,
    });
    expect(msg).toContain("SPEND exceeded threshold");
    expect(msg).toContain("Current: 520");
    expect(msg).toContain("Threshold: 500");
  });

  it("formats lt alert", () => {
    const msg = formatAlertFired({
      id: "alert-2",
      metric: "ctr",
      platform: "facebook",
      operator: "lt",
      threshold: 1.0,
      action: "kill",
      current_value: 0.5,
    });
    expect(msg).toContain("CTR fell below threshold");
  });
});

describe("formatDailyReport", () => {
  it("formats daily report with signals and blockers", () => {
    const msg = formatDailyReport({
      campaign_status: "live",
      total_spend: 1200,
      total_impressions: 50000,
      total_clicks: 800,
      total_signups: 30,
      signals: [
        { platform: "linkedin", signal: "kill", ctr: 0.5, cpa_paid: 800, activation_rate: 10, spend: 500 },
        { platform: "facebook", signal: "scale", ctr: 2.0, cpa_paid: 200, activation_rate: 40, spend: 300 },
      ],
      alerts_fired: [],
      blockers: ["Budget low on youtube"],
    });
    expect(msg).toContain("4H Daily Report");
    expect(msg).toContain("Spend: $1200");
    expect(msg).toContain("linkedin: KILL");
    expect(msg).toContain("facebook: SCALE");
    expect(msg).toContain("Budget low on youtube");
  });
});

describe("formatWeeklyReport", () => {
  it("formats weekly report with platform breakdown", () => {
    const msg = formatWeeklyReport({
      week_start: "2026-03-10",
      platforms: [
        {
          platform: "linkedin",
          spend: 500,
          ctr: 0.5,
          cpa_paid: 800,
          activation_rate: 10,
          signal: "kill",
          signups: 2,
        },
      ],
      total_spend: 500,
      budget_total: 5000,
      budget_used_pct: 10,
    });
    expect(msg).toContain("Weekly Report — 2026-03-10");
    expect(msg).toContain("$500");
    expect(msg).toContain("LINKEDIN");
    expect(msg).toContain("KILL");
  });

  it("shows delta from previous week", () => {
    const msg = formatWeeklyReport({
      week_start: "2026-03-10",
      prev_week_start: "2026-03-03",
      platforms: [
        {
          platform: "facebook",
          spend: 300,
          prev_spend: 200,
          ctr: 2.0,
          prev_ctr: 1.5,
          cpa_paid: 200,
          prev_cpa_paid: 250,
          activation_rate: 40,
          prev_activation_rate: 35,
          signal: "scale",
          prev_signal: "watch",
          signups: 10,
          prev_signups: 5,
        },
      ],
      total_spend: 300,
      prev_total_spend: 200,
      budget_total: 5000,
      budget_used_pct: 6,
    });
    expect(msg).toContain("was watch");
    expect(msg).toContain("+50%");
  });
});

describe("formatTestMessage", () => {
  it("returns test message", () => {
    const msg = formatTestMessage();
    expect(msg).toContain("Test Message");
    expect(msg).toContain("working");
  });
});
