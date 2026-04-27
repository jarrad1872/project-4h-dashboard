import { describe, expect, it } from "vitest";
import {
  getBeachheadProductRoutes,
  productRouteInventory,
  productRouteInventorySources,
  summarizeProductRouteInventory,
} from "../product-route-inventory";

describe("product route inventory", () => {
  it("tracks the five beachhead routes with demo lines", () => {
    const beachhead = getBeachheadProductRoutes();

    expect(beachhead.map((route) => route.domain).sort()).toEqual([
      "coat.city",
      "duct.city",
      "mow.city",
      "pest.city",
      "pipe.city",
    ]);
    expect(beachhead).toHaveLength(5);

    for (const route of beachhead) {
      expect(route.status).toBe("ready");
      expect(route.landingPath).toBe("/");
      expect(route.signupPath).toBe("/login?mode=signup");
      expect(route.demoAuthPath).toBe("/api/auth/demo");
      expect(route.demoLineApiPath).toBe(`/api/demo-line/${route.tradeSlug}`);
      expect(route.demoPhone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
      expect(route.canonicalUrl).toBe(`https://${route.domain}/`);
      expect(route.heroImagePath).toBe(`/hero/${route.domain.replace(".city", "")}-hero.jpg`);
    }
  });

  it("keeps answered.city as a directory watch item, not a trade demo route", () => {
    const answered = productRouteInventory.find((route) => route.domain === "answered.city");

    expect(answered).toMatchObject({
      tradeSlug: "custom",
      campaignUse: "platform-directory",
      status: "watch",
      demoPhone: null,
      canonicalUrl: "https://answered.city/",
    });
  });

  it("summarizes confirmed live routes without claiming sawcity-lite writes", () => {
    const summary = summarizeProductRouteInventory();

    expect(summary.total).toBe(21);
    expect(summary.ready).toBe(20);
    expect(summary.watch).toBe(1);
    expect(summary.missing).toBe(0);
    expect(summary.beachhead).toBe(5);
    expect(summary.demoLines).toBe(20);
    expect(productRouteInventorySources.every((source) => source.startsWith("sawcity-lite/"))).toBe(true);
  });
});
