import { describe, expect, it } from "vitest";
import {
  fieldSalesCardKey,
  fieldSalesRepKey,
  fieldSalesTradeKey,
  isFieldSalesEvent,
  summarizeFieldSalesAttribution,
} from "../field-sales-attribution";
import type { MarketingEvent, MarketingEventType } from "../types";

function event(overrides: Partial<MarketingEvent> & { event_type?: MarketingEventType } = {}): MarketingEvent {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    event_key: overrides.event_key ?? null,
    event_type: overrides.event_type ?? "asset_view",
    event_at: overrides.event_at ?? "2026-04-27T12:00:00.000Z",
    tenant_id: overrides.tenant_id ?? null,
    visitor_id: overrides.visitor_id ?? null,
    platform: overrides.platform ?? null,
    trade_slug: Object.hasOwn(overrides, "trade_slug") ? (overrides.trade_slug ?? null) : "pipe",
    creator_id: overrides.creator_id ?? null,
    creative_asset_id: overrides.creative_asset_id ?? null,
    angle: overrides.angle ?? null,
    variant_id: overrides.variant_id ?? null,
    utm_source: overrides.utm_source ?? "azfounding",
    utm_medium: overrides.utm_medium ?? "field-sales",
    utm_campaign: overrides.utm_campaign ?? "4h_2026-04_az_field_sales",
    utm_content: overrides.utm_content ?? "azfounding_az-founding-card-a_az-p-001",
    utm_term: overrides.utm_term ?? "phoenix_metro_trade_smb",
    session_id: overrides.session_id ?? null,
    contact_id: overrides.contact_id ?? null,
    value_cents: overrides.value_cents ?? 0,
    metadata: overrides.metadata ?? {},
    created_at: overrides.created_at ?? "2026-04-27T12:00:00.000Z",
  };
}

describe("isFieldSalesEvent", () => {
  it("accepts field-sales UTM events and metadata-card events", () => {
    expect(isFieldSalesEvent(event())).toBe(true);
    expect(isFieldSalesEvent(event({
      utm_medium: null,
      utm_campaign: "4h_2026-04_pipe",
      metadata: { card_id: "AZ-P-001" },
    }))).toBe(true);
  });

  it("filters out paid-social and creator events without rep or card evidence", () => {
    expect(isFieldSalesEvent(event({ utm_medium: "paid-social", utm_campaign: "4h_2026-04_pipe", metadata: {} }))).toBe(false);
    expect(isFieldSalesEvent(event({ utm_medium: "creator", utm_campaign: "4h_2026-04_creator_demo", metadata: {} }))).toBe(false);
  });
});

describe("field sales attribution keys", () => {
  it("extracts rep, card, and trade from UTMs and metadata", () => {
    const row = event({
      trade_slug: null,
      metadata: { rep_id: "rep-az-founding", card_id: "AZ-P-001", trade_domain: "pipe.city" },
    });

    expect(fieldSalesRepKey(row)).toBe("rep-az-founding");
    expect(fieldSalesCardKey(row)).toBe("az-p-001");
    expect(fieldSalesTradeKey(row)).toBe("pipe-city");
  });
});

describe("summarizeFieldSalesAttribution", () => {
  it("counts only field-sales funnel events and paid value", () => {
    const summary = summarizeFieldSalesAttribution([
      event({ event_type: "asset_view" }),
      event({ event_type: "demo_call" }),
      event({ event_type: "trial_started", trade_slug: "duct", metadata: { card_id: "AZ-D-001" } }),
      event({ event_type: "paid", value_cents: 3900, trade_slug: "duct", metadata: { card_id: "AZ-D-001" } }),
      event({ event_type: "paid", utm_medium: "paid-social", utm_campaign: "4h_2026-04_pipe", value_cents: 3900, metadata: {} }),
    ]);

    expect(summary.fieldSalesEvents).toBe(4);
    expect(summary.cardScans).toBe(1);
    expect(summary.demoCalls).toBe(1);
    expect(summary.trialStarts).toBe(1);
    expect(summary.paidCustomers).toBe(1);
    expect(summary.paidValueCents).toBe(3900);
    expect(summary.topReps[0].key).toBe("azfounding");
    expect(summary.topCards[0].key).toBe("az-d-001");
    expect(summary.topTrades[0].key).toBe("duct");
  });

  it("returns an explicit zero-data next action", () => {
    const summary = summarizeFieldSalesAttribution([]);

    expect(summary.fieldSalesEvents).toBe(0);
    expect(summary.nextAction).toContain("No field-sales scans");
    expect(summary.evidence).toContain("marketing_events only");
  });
});
