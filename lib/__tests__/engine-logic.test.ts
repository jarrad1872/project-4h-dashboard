import { describe, it, expect } from "vitest";
import { evaluateSignals, evaluateAlerts, generateRecommendations, runEvaluation } from "../engine-logic";
import type { MetricsWeek } from "../types";

function makeWeek(overrides: Partial<Record<string, Partial<{ spend: number; impressions: number; clicks: number; signups: number; activations: number; paid: number }>>>): MetricsWeek {
  const empty = { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 };
  return {
    weekStart: "2026-03-10",
    linkedin: { ...empty, ...overrides.linkedin },
    youtube: { ...empty, ...overrides.youtube },
    facebook: { ...empty, ...overrides.facebook },
    instagram: { ...empty, ...overrides.instagram },
  };
}

describe("evaluateSignals", () => {
  it("returns empty for no active platforms", () => {
    const week = makeWeek({});
    expect(evaluateSignals(week)).toEqual([]);
  });

  it("detects kill signal", () => {
    const week = makeWeek({
      linkedin: { spend: 500, impressions: 10000, clicks: 50, signups: 10, activations: 1, paid: 0 },
    });
    const signals = evaluateSignals(week);
    expect(signals).toHaveLength(1);
    expect(signals[0].platform).toBe("linkedin");
    expect(signals[0].signal).toBe("kill");
  });

  it("detects scale signal", () => {
    const week = makeWeek({
      facebook: { spend: 200, impressions: 10000, clicks: 200, signups: 20, activations: 10, paid: 1 },
    });
    const signals = evaluateSignals(week);
    expect(signals).toHaveLength(1);
    expect(signals[0].platform).toBe("facebook");
    expect(signals[0].signal).toBe("scale");
  });

  it("detects watch signal", () => {
    const week = makeWeek({
      youtube: { spend: 100, impressions: 10000, clicks: 100, signups: 5, activations: 2, paid: 0 },
    });
    const signals = evaluateSignals(week);
    expect(signals).toHaveLength(1);
    expect(signals[0].signal).toBe("watch");
  });

  it("evaluates multiple platforms", () => {
    const week = makeWeek({
      linkedin: { spend: 500, impressions: 10000, clicks: 50, signups: 10, activations: 1, paid: 0 },
      facebook: { spend: 200, impressions: 10000, clicks: 200, signups: 20, activations: 10, paid: 1 },
    });
    const signals = evaluateSignals(week);
    expect(signals).toHaveLength(2);
  });
});

describe("evaluateAlerts", () => {
  it("returns empty with no rules", () => {
    const week = makeWeek({ linkedin: { spend: 500 } });
    expect(evaluateAlerts([], week)).toEqual([]);
  });

  it("fires alert when threshold exceeded (gt)", () => {
    const week = makeWeek({ linkedin: { spend: 600, impressions: 1000 } });
    const rules = [{ id: "a1", metric: "spend", platform: "linkedin", operator: "gt", threshold: 500, action: "notify" }];
    const fired = evaluateAlerts(rules, week);
    expect(fired).toHaveLength(1);
    expect(fired[0].current_value).toBe(600);
  });

  it("fires alert when value below threshold (lt)", () => {
    const week = makeWeek({ linkedin: { spend: 100, impressions: 10000, clicks: 50 } });
    const rules = [{ id: "a2", metric: "ctr", platform: "linkedin", operator: "lt", threshold: 1.0, action: "kill" }];
    const fired = evaluateAlerts(rules, week);
    expect(fired).toHaveLength(1);
    expect(fired[0].current_value).toBe(0.5);
  });

  it("does not fire when threshold not met", () => {
    const week = makeWeek({ linkedin: { spend: 400 } });
    const rules = [{ id: "a3", metric: "spend", platform: "linkedin", operator: "gt", threshold: 500, action: "notify" }];
    expect(evaluateAlerts(rules, week)).toEqual([]);
  });

  it("evaluates 'all' platform rules across each platform", () => {
    const week = makeWeek({
      linkedin: { spend: 600 },
      facebook: { spend: 700 },
    });
    const rules = [{ id: "a4", metric: "spend", platform: "all", operator: "gt", threshold: 500, action: "notify" }];
    const fired = evaluateAlerts(rules, week);
    expect(fired).toHaveLength(2);
  });
});

describe("generateRecommendations", () => {
  it("recommends pause for kill signal", () => {
    const signals = [{ platform: "linkedin", signal: "kill" as const, ctr: 0.5, cpa_paid: 800, activation_rate: 10, spend: 500 }];
    const recs = generateRecommendations(signals, []);
    expect(recs).toHaveLength(1);
    expect(recs[0]).toContain("PAUSE");
    expect(recs[0]).toContain("LINKEDIN");
  });

  it("recommends increase for scale signal", () => {
    const signals = [{ platform: "facebook", signal: "scale" as const, ctr: 2.0, cpa_paid: 200, activation_rate: 40, spend: 200 }];
    const recs = generateRecommendations(signals, []);
    expect(recs).toHaveLength(1);
    expect(recs[0]).toContain("INCREASE");
    expect(recs[0]).toContain("FACEBOOK");
  });

  it("returns empty for watch-only", () => {
    const signals = [{ platform: "youtube", signal: "watch" as const, ctr: 1.0, cpa_paid: 400, activation_rate: 30, spend: 200 }];
    expect(generateRecommendations(signals, [])).toEqual([]);
  });
});

describe("runEvaluation", () => {
  it("runs full evaluation loop", () => {
    const week = makeWeek({
      linkedin: { spend: 500, impressions: 10000, clicks: 50, signups: 10, activations: 1, paid: 0 },
    });
    const rules = [{ id: "a1", metric: "spend", platform: "linkedin", operator: "gt", threshold: 400, action: "notify" }];
    const result = runEvaluation(week, rules);
    expect(result.signals).toHaveLength(1);
    expect(result.alerts_fired).toHaveLength(1);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
