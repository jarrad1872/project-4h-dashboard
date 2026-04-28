import { describe, expect, it } from "vitest";
import { buildSalesTrackingParams, getPrimarySalesCard, salesCardVariants, salesReps } from "@/lib/sales-rep-pipeline";
import { getSalesRepAccessStatus, SALES_REP_CODE_HEADER } from "@/lib/sales-write-auth";

describe("Dustin field sales access", () => {
  it("allows localhost writes without a production rep code", () => {
    const access = getSalesRepAccessStatus(new Request("http://127.0.0.1:3114/api/sales/leads"));

    expect(access.ok).toBe(true);
    expect(access.mode).toBe("local");
    expect(access.repId).toBe("rep-az-founding");
  });

  it("keeps production writes locked without an accepted credential", () => {
    const access = getSalesRepAccessStatus(new Request("https://pumpcans.com/api/sales/leads"));

    expect(access.ok).toBe(false);
    expect(access.mode).toBe("locked");
  });

  it("builds a pumpcans tracking path for Dustin card scans", () => {
    const tracking = buildSalesTrackingParams({ rep: salesReps[0], cardVariant: getPrimarySalesCard() });

    expect(tracking.path).toContain("/api/sales/track?");
    expect(tracking.path).toContain("utm_medium=field-sales");
    expect(tracking.path).toContain("rep=DUSTINAZ");
    expect(tracking.path).toContain("event_type=asset_view");
    expect(SALES_REP_CODE_HEADER).toBe("x-sales-rep-code");
  });

  it("points Dustin card downloads at flattened print artwork", () => {
    for (const card of salesCardVariants.filter((variant) => variant.repId === "rep-az-founding")) {
      expect(card.printFrontPath).toMatch(/^\/sales-assets\/print\/.+-front-print-1086x636\.png$/);
      expect(card.printBackPath).toMatch(/^\/sales-assets\/print\/.+-back-print-1086x636\.png$/);
    }
  });
});
