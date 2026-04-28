import { describe, expect, it } from "vitest";
import { summarizeFieldSalesAttribution } from "../field-sales-attribution";
import { buildFieldSalesOperatingPacket } from "../field-sales-operating-plan";
import { salesReps, type SalesLead } from "../sales-rep-pipeline";
import type { MarketingEvent } from "../types";

function lead(overrides: Partial<SalesLead> = {}): SalesLead {
  return {
    id: "lead-1",
    repId: salesReps[0].id,
    businessName: "Phoenix plumbing owner",
    city: "Phoenix",
    state: "AZ",
    tradeDomain: "pipe.city",
    stage: "qualified",
    leadType: "real",
    ownerProfile: "",
    painSignal: "Owner misses emergency calls while on jobs.",
    nextAction: "",
    lastTouchedAt: null,
    trackingCode: "AZ-P-001",
    notes: null,
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    ...overrides,
  };
}

function event(overrides: Partial<MarketingEvent> = {}): MarketingEvent {
  return {
    id: "event-1",
    event_key: null,
    event_type: "asset_view",
    event_at: "2026-04-27T12:00:00.000Z",
    tenant_id: null,
    visitor_id: null,
    platform: null,
    trade_slug: "pipe",
    creator_id: null,
    creative_asset_id: null,
    angle: null,
    variant_id: null,
    utm_source: "dustinaz",
    utm_medium: "field-sales",
    utm_campaign: "4h_2026-04_az_pipe_proof_sprint",
    utm_content: "dustinaz_dustin-pipe-local-trust_az-p-001",
    utm_term: "phoenix_metro_trade_smb",
    session_id: null,
    contact_id: null,
    value_cents: 0,
    metadata: {},
    created_at: "2026-04-27T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildFieldSalesOperatingPacket", () => {
  it("prioritizes real downstream rows ahead of archetypes", () => {
    const packet = buildFieldSalesOperatingPacket({
      leads: [
        lead({ id: "archetype", businessName: "Mesa HVAC archetype", leadType: "archetype", stage: "qualified", trackingCode: "AZ-D-001" }),
        lead({ id: "demo", businessName: "Real demo row", stage: "demo-booked", trackingCode: "AZ-P-002" }),
      ],
      attribution: summarizeFieldSalesAttribution([event({ event_type: "asset_view" }), event({ event_type: "demo_call" })]),
      now: new Date("2026-04-27T00:00:00.000Z"),
    });

    expect(packet.weekLabel).toBe("Week of Apr 27, 2026");
    expect(packet.dailyTouchTarget).toBe(7);
    expect(packet.cardsToCarry).toBe(14);
    expect(packet.priorityLeads[0].id).toBe("demo");
    expect(packet.priorityLeads[0].recommendedMove).toContain("Run the demo");
    expect(packet.evidence).toContain("1 active real rows");
    expect(packet.copyText).toContain("Real demo row");
  });

  it("keeps archetypes research-only in the packet", () => {
    const packet = buildFieldSalesOperatingPacket({
      leads: [lead({ leadType: "archetype", stage: "qualified" })],
      attribution: summarizeFieldSalesAttribution([]),
      now: new Date("2026-04-27T00:00:00.000Z"),
    });

    expect(packet.realLeadCount).toBe(0);
    expect(packet.nextAction).toContain("first real Arizona owner row");
    expect(packet.priorityLeads[0].recommendedMove).toContain("Research only");
    expect(packet.safetyBoundary).toContain("Do not send outreach");
    expect(packet.safetyBoundary).toContain("treat archetypes as contacted businesses");
  });

  it("builds tracked trade-domain URLs for priority rows", () => {
    const packet = buildFieldSalesOperatingPacket({
      leads: [lead({ tradeDomain: "duct.city", trackingCode: "AZ-D-009" })],
      attribution: summarizeFieldSalesAttribution([]),
      now: new Date("2026-04-27T00:00:00.000Z"),
    });

    expect(packet.priorityLeads[0].trackingUrl).toContain("https://duct.city/");
    expect(packet.priorityLeads[0].trackingUrl).toContain("utm_medium=field-sales");
    expect(packet.priorityLeads[0].trackingUrl).toContain("card_id=az-d-009");
    expect(packet.priorityLeads[0].contentId).toBe("dustinaz_dustin-pipe-local-trust_az-d-009");
  });
});
