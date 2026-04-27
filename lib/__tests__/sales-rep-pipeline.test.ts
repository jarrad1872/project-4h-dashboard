import { describe, expect, it } from "vitest";
import {
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  FIELD_SALES_UTM_MEDIUM,
  getPrimarySalesCard,
  salesReps,
  summarizeSalesPipeline,
  validateSalesCardVariant,
} from "../sales-rep-pipeline";

describe("buildSalesTrackingUrl", () => {
  it("builds field-sales attribution for the Arizona rep card", () => {
    const rep = salesReps[0];
    const cardVariant = getPrimarySalesCard();
    const result = buildSalesTrackingUrl({ rep, cardVariant });
    const url = new URL(result.url);

    expect(url.hostname).toBe("answered.city");
    expect(url.searchParams.get("utm_source")).toBe("azfounding");
    expect(url.searchParams.get("utm_medium")).toBe(FIELD_SALES_UTM_MEDIUM);
    expect(url.searchParams.get("utm_campaign")).toBe("4h_2026-04_az_field_sales");
    expect(url.searchParams.get("utm_content")).toBe("azfounding_az-founding-card-a_az-founding-card-a-master");
    expect(url.searchParams.get("rep")).toBe("AZFOUNDING");
    expect(url.searchParams.get("rep_id")).toBe("rep-az-founding");
    expect(url.searchParams.get("card")).toBe("az-founding-card-a");
    expect(url.searchParams.get("card_id")).toBe("az-founding-card-a-master");
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
    expect(url.searchParams.get("utm_content")).toBe("azfounding_az-founding-card-a_az-p-001");
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
    const rep = salesReps[0];
    const summary = summarizeSalesPipeline([
      {
        id: "a",
        repId: rep.id,
        businessName: "A",
        city: "Phoenix",
        state: "AZ",
        tradeDomain: "pipe.city",
        stage: "demo-booked",
        ownerProfile: "",
        painSignal: "",
        nextAction: "",
        lastTouchedAt: null,
        trackingCode: "A",
      },
      {
        id: "b",
        repId: rep.id,
        businessName: "B",
        city: "Phoenix",
        state: "AZ",
        tradeDomain: "mow.city",
        stage: "paid",
        ownerProfile: "",
        painSignal: "",
        nextAction: "",
        lastTouchedAt: null,
        trackingCode: "B",
      },
      {
        id: "c",
        repId: rep.id,
        businessName: "C",
        city: "Phoenix",
        state: "AZ",
        tradeDomain: "duct.city",
        stage: "lost",
        ownerProfile: "",
        painSignal: "",
        nextAction: "",
        lastTouchedAt: null,
        trackingCode: "C",
      },
    ]);

    expect(summary.totalLeads).toBe(3);
    expect(summary.activeLeads).toBe(1);
    expect(summary.bookedDemos).toBe(2);
    expect(summary.paidCustomers).toBe(1);
    expect(summary.byStage.lost).toBe(1);
  });
});
