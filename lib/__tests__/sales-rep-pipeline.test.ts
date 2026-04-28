import { describe, expect, it } from "vitest";
import {
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  canReclassifySalesLead,
  FIELD_SALES_UTM_MEDIUM,
  getPrimarySalesCard,
  normalizeSalesLead,
  salesReps,
  summarizeSalesPipeline,
  validateSalesCardVariant,
  type SalesLead,
  type SalesStage,
} from "../sales-rep-pipeline";

function makeLead(overrides: Partial<SalesLead> = {}): SalesLead {
  return {
    id: "lead-1",
    repId: salesReps[0].id,
    businessName: "Test lead",
    city: "Phoenix",
    state: "AZ",
    tradeDomain: "pipe.city",
    stage: "prospect",
    leadType: "real",
    ownerProfile: "",
    painSignal: "",
    nextAction: "",
    lastTouchedAt: null,
    trackingCode: "AZ-T-001",
    notes: null,
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildSalesTrackingUrl", () => {
  it("builds field-sales attribution for the Arizona rep card", () => {
    const rep = salesReps[0];
    const cardVariant = getPrimarySalesCard();
    const result = buildSalesTrackingUrl({ rep, cardVariant });
    const url = new URL(result.url);

    expect(url.hostname).toBe("pipe.city");
    expect(url.searchParams.get("utm_source")).toBe("dustinaz");
    expect(url.searchParams.get("utm_medium")).toBe(FIELD_SALES_UTM_MEDIUM);
    expect(url.searchParams.get("utm_campaign")).toBe("4h_2026-04_az_pipe_proof_sprint");
    expect(url.searchParams.get("utm_content")).toBe("dustinaz_dustin-pipe-local-trust_dustin-pipe-local-trust-master");
    expect(url.searchParams.get("rep")).toBe("DUSTINAZ");
    expect(url.searchParams.get("rep_id")).toBe("rep-az-founding");
    expect(url.searchParams.get("card")).toBe("dustin-pipe-local-trust");
    expect(url.searchParams.get("card_id")).toBe("dustin-pipe-local-trust-master");
    expect(url.searchParams.get("offer")).toBe("14-day-free-trial-no-credit-card");
  });

  it("can target a trade domain while preserving field-sales attribution", () => {
    const rep = salesReps[0];
    const cardVariant = { ...getPrimarySalesCard(), destination: "trade-domain" as const };
    const result = buildSalesTrackingUrl({ rep, cardVariant, tradeDomain: "pipe.city", leadTrackingCode: "AZ-P-001" });
    const url = new URL(result.url);

    expect(url.hostname).toBe("pipe.city");
    expect(url.searchParams.get("utm_medium")).toBe("field-sales");
    expect(url.searchParams.get("trade_domain")).toBe("pipe.city");
    expect(url.searchParams.get("utm_content")).toBe("dustinaz_dustin-pipe-local-trust_az-p-001");
    expect(url.searchParams.get("card_id")).toBe("az-p-001");
  });
});

describe("businessCardPrintSpec", () => {
  it("keeps print exports at 300 DPI with bleed and safe-area dimensions", () => {
    expect(businessCardPrintSpec.pixelSize).toEqual({ width: 1125, height: 675 });
    expect(businessCardPrintSpec.trimPixelSize).toEqual({ width: 1050, height: 600 });
    expect(businessCardPrintSpec.safePixelSize).toEqual({ width: 975, height: 525 });
    expect(businessCardPrintSpec.safePixelSize.width).toBeLessThan(businessCardPrintSpec.pixelSize.width);
    expect(businessCardPrintSpec.safePixelSize.height).toBeLessThan(businessCardPrintSpec.pixelSize.height);
  });
});

describe("validateSalesCardVariant", () => {
  it("enforces the field-card offer and pricing rules", () => {
    const result = validateSalesCardVariant(getPrimarySalesCard());

    expect(result.hasPrice).toBe(true);
    expect(result.hasTrial).toBe(true);
    expect(result.hasNoCreditCard).toBe(true);
    expect(result.hasAnsweredCity).toBe(true);
  });
});

describe("summarizeSalesPipeline", () => {
  it("summarizes active field-sales leads without treating lost rows as active", () => {
    const summary = summarizeSalesPipeline([
      makeLead({ id: "a", stage: "demo-booked", trackingCode: "A" }),
      makeLead({ id: "b", stage: "paid", trackingCode: "B" }),
      makeLead({ id: "c", stage: "lost", trackingCode: "C" }),
      makeLead({ id: "d", stage: "qualified", leadType: "archetype", trackingCode: "D" }),
    ]);

    expect(summary.totalLeads).toBe(4);
    expect(summary.realLeads).toBe(3);
    expect(summary.archetypeLeads).toBe(1);
    expect(summary.activeLeads).toBe(1);
    expect(summary.bookedDemos).toBe(2);
    expect(summary.paidCustomers).toBe(1);
    expect(summary.byStage.lost).toBe(1);
  });

  it("does not count archetype rows as booked demos or paid customers", () => {
    const summary = summarizeSalesPipeline([
      makeLead({ id: "real-demo", stage: "demo-booked", leadType: "real" }),
      makeLead({ id: "fake-paid", stage: "paid", leadType: "archetype" }),
    ]);

    expect(summary.bookedDemos).toBe(1);
    expect(summary.paidCustomers).toBe(0);
  });
});

describe("normalizeSalesLead", () => {
  it("downgrades archetypes away from advanced stages", () => {
    const lead = normalizeSalesLead({
      businessName: "Archetype",
      leadType: "archetype",
      stage: "demo-booked" as SalesStage,
    });

    expect(lead.leadType).toBe("archetype");
    expect(lead.stage).toBe("qualified");
  });

  it("does not allow archetypes to be reclassified into real leads", () => {
    expect(canReclassifySalesLead("archetype", "real")).toBe(false);
    expect(canReclassifySalesLead("real", "archetype")).toBe(true);
    expect(canReclassifySalesLead("real", "real")).toBe(true);
  });
});
