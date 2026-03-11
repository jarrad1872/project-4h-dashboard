import { describe, it, expect } from "vitest";
import { calcCtr, calcCpaStart, calcActivationRate, calcCpaPaid, signal } from "../metrics";
import type { ChannelMetrics } from "../types";

function makeMetrics(overrides: Partial<ChannelMetrics> = {}): ChannelMetrics {
  return {
    spend: 0,
    impressions: 0,
    clicks: 0,
    signups: 0,
    activations: 0,
    paid: 0,
    ...overrides,
  };
}

describe("calcCtr", () => {
  it("returns 0 when no impressions", () => {
    expect(calcCtr(makeMetrics())).toBe(0);
  });
  it("calculates CTR as percentage", () => {
    expect(calcCtr(makeMetrics({ impressions: 1000, clicks: 15 }))).toBeCloseTo(1.5);
  });
});

describe("calcCpaStart", () => {
  it("returns 0 when no signups", () => {
    expect(calcCpaStart(makeMetrics())).toBe(0);
  });
  it("calculates cost per signup", () => {
    expect(calcCpaStart(makeMetrics({ spend: 500, signups: 10 }))).toBe(50);
  });
});

describe("calcActivationRate", () => {
  it("returns 0 when no signups", () => {
    expect(calcActivationRate(makeMetrics())).toBe(0);
  });
  it("calculates activation rate as percentage", () => {
    expect(calcActivationRate(makeMetrics({ signups: 20, activations: 8 }))).toBe(40);
  });
});

describe("calcCpaPaid", () => {
  it("returns 0 when no paid users", () => {
    expect(calcCpaPaid(makeMetrics())).toBe(0);
  });
  it("calculates cost per paid user", () => {
    expect(calcCpaPaid(makeMetrics({ spend: 1000, paid: 5 }))).toBe(200);
  });
});

describe("signal", () => {
  it("returns 'watch' for zero data", () => {
    expect(signal(makeMetrics())).toBe("watch");
  });

  it("returns 'scale' when CTR >= 1.6, activation >= 35%, CPA paid <= 350", () => {
    const m = makeMetrics({
      spend: 500,
      impressions: 10000,
      clicks: 200,    // CTR = 2.0%
      signups: 20,
      activations: 8, // activation = 40%
      paid: 3,        // CPA paid = 166.67
    });
    expect(signal(m)).toBe("scale");
  });

  it("returns 'scale' when CPA paid is 0 (no paid yet but metrics are good)", () => {
    const m = makeMetrics({
      spend: 100,
      impressions: 5000,
      clicks: 100,     // CTR = 2.0%
      signups: 10,
      activations: 5,  // activation = 50%
      paid: 0,         // CPA paid = 0
    });
    expect(signal(m)).toBe("scale");
  });

  it("returns 'kill' when spend >= 300 and CTR < 0.9", () => {
    const m = makeMetrics({
      spend: 500,
      impressions: 10000,
      clicks: 50,      // CTR = 0.5%
      signups: 5,
      activations: 3,
      paid: 1,
    });
    expect(signal(m)).toBe("kill");
  });

  it("returns 'kill' when spend >= 300 and activation < 20%", () => {
    const m = makeMetrics({
      spend: 400,
      impressions: 10000,
      clicks: 200,     // CTR = 2.0%
      signups: 20,
      activations: 3,  // activation = 15%
      paid: 2,
    });
    expect(signal(m)).toBe("kill");
  });

  it("returns 'kill' when spend >= 300 and CPA paid > 600", () => {
    const m = makeMetrics({
      spend: 1000,
      impressions: 10000,
      clicks: 200,     // CTR = 2.0%
      signups: 20,
      activations: 10, // activation = 50%
      paid: 1,         // CPA paid = 1000
    });
    expect(signal(m)).toBe("kill");
  });

  it("returns 'watch' when spend < 300 even with bad metrics", () => {
    const m = makeMetrics({
      spend: 100,
      impressions: 10000,
      clicks: 10,      // CTR = 0.1%
      signups: 1,
      activations: 0,
      paid: 0,
    });
    expect(signal(m)).toBe("watch");
  });

  it("returns 'watch' when metrics are moderate (between scale and kill)", () => {
    const m = makeMetrics({
      spend: 500,
      impressions: 10000,
      clicks: 120,     // CTR = 1.2% (not enough for scale)
      signups: 10,
      activations: 4,  // activation = 40% (good)
      paid: 2,         // CPA paid = 250 (good)
    });
    expect(signal(m)).toBe("watch");
  });
});
