import { describe, expect, it } from "vitest";
import {
  summarizeMarketingEvents,
  validateMarketingEvent,
  validateMarketingEvents,
} from "../marketing-events";

const fixedNow = new Date("2026-04-27T12:00:00.000Z");

describe("validateMarketingEvent", () => {
  it("accepts a valid demo-call event", () => {
    const result = validateMarketingEvent({
      event_type: "demo_call",
      event_at: "2026-04-27T11:00:00.000Z",
      trade_slug: "pipe",
      platform: "facebook",
      utm_campaign: "4h_2026-04_pipe",
      utm_medium: "paid-social",
      creative_asset_id: "asset-1",
      creator_id: "creator-1",
      variant_id: "v1",
    }, fixedNow);

    expect(result.errors).toEqual([]);
    expect(result.event?.event_type).toBe("demo_call");
    expect(result.event?.trade_slug).toBe("pipe");
  });

  it("rejects unknown event types", () => {
    const result = validateMarketingEvent({ event_type: "watched_video" as any }, fixedNow);

    expect(result.event).toBeNull();
    expect(result.errors[0]).toContain("event_type must be one of");
  });

  it("rejects invalid trade slugs and platforms", () => {
    const result = validateMarketingEvent({
      event_type: "signup",
      trade_slug: "Pipe City",
      platform: "tiktok" as any,
    }, fixedNow);

    expect(result.event).toBeNull();
    expect(result.errors).toContain("trade_slug must be lowercase letters, numbers, or hyphens");
    expect(result.errors[0]).toContain("platform must be one of");
  });

  it("supports legacy occurred_at input while normalizing to event_at", () => {
    const result = validateMarketingEvent({
      event_type: "asset_view",
      occurred_at: "2026-04-27T10:00:00.000Z",
    }, fixedNow);

    expect(result.event?.event_at).toBe("2026-04-27T10:00:00.000Z");
  });

  it("turns non-UUID caller IDs into idempotency event keys", () => {
    const result = validateMarketingEvent({
      id: "pipe-demo-call-001",
      event_type: "demo_call",
    }, fixedNow);

    expect(result.event?.event_key).toBe("pipe-demo-call-001");
    expect(result.event?.id).not.toBe("pipe-demo-call-001");
  });

  it("derives an event key when callers omit idempotency fields", () => {
    const result = validateMarketingEvent({
      event_type: "signup",
      event_at: "2026-04-27T10:00:00.000Z",
      trade_slug: "pipe",
      platform: "facebook",
      utm_campaign: "4h_2026-04_pipe",
      utm_content: "asset-1",
    }, fixedNow);

    expect(result.event?.event_key).toContain("signup");
    expect(result.event?.event_key).toContain("pipe");
    expect(result.event?.event_key).toContain("4h_2026-04_pipe");
  });
});

describe("validateMarketingEvents", () => {
  it("validates arrays and preserves row-specific errors", () => {
    const result = validateMarketingEvents([
      { event_type: "asset_view", trade_slug: "pipe" },
      { event_type: "nope" },
    ], fixedNow);

    expect(result.events).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Row 1");
  });
});

describe("summarizeMarketingEvents", () => {
  it("summarizes funnel counts and paid value", () => {
    const events = [
      validateMarketingEvent({
        event_type: "asset_view",
        trade_slug: "pipe",
        platform: "facebook",
        creator_id: "creator-1",
        creative_asset_id: "asset-1",
        angle: "missed-call",
      }, fixedNow).event!,
      validateMarketingEvent({
        event_type: "demo_call",
        trade_slug: "pipe",
        platform: "facebook",
        creator_id: "creator-1",
        creative_asset_id: "asset-1",
        angle: "missed-call",
      }, fixedNow).event!,
      validateMarketingEvent({
        event_type: "paid",
        trade_slug: "pipe",
        platform: "facebook",
        creator_id: "creator-1",
        creative_asset_id: "asset-1",
        angle: "missed-call",
        value_cents: 3900,
      }, fixedNow).event!,
    ];

    const summary = summarizeMarketingEvents(events);

    expect(summary.total).toBe(3);
    expect(summary.byType.asset_view).toBe(1);
    expect(summary.byType.demo_call).toBe(1);
    expect(summary.byType.paid).toBe(1);
    expect(summary.byPlatform.facebook).toBe(3);
    expect(summary.byTrade.pipe).toBe(3);
    expect(summary.paidValueCents).toBe(3900);
    expect(summary.dimensions.trades.pipe.paid).toBe(1);
    expect(summary.dimensions.creators["creator-1"].demo_call).toBe(1);
    expect(summary.dimensions.creativeAssets["asset-1"].total).toBe(3);
    expect(summary.dimensions.angles["missed-call"].paidValueCents).toBe(3900);
  });
});
