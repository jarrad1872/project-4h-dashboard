import { describe, expect, it } from "vitest";
import {
  activeNavigationHrefs,
  getLegacyRouteBanner,
  legacyRouteBanners,
  legacyNavigationItems,
  legacyRouteAuditRows,
  navigationGroups,
} from "../navigation";

describe("navigation IA", () => {
  it("keeps the primary sidebar focused on active growth loops and governance", () => {
    expect(activeNavigationHrefs()).toEqual([
      "/",
      "/influencer",
      "/sales",
      "/assets",
      "/scorecard",
      "/approval",
      "/launch",
      "/budget",
    ]);
  });

  it("keeps original-build routes classified as legacy instead of primary operating lanes", () => {
    expect(legacyNavigationItems.map((item) => item.href)).toEqual(["/ads", "/generate", "/gtm", "/settings"]);
    expect(legacyNavigationItems.every((item) => item.status === "legacy")).toBe(true);
  });

  it("records route disposition rows for the cleanup plan", () => {
    const rows = legacyRouteAuditRows();

    expect(rows.find((row) => row.route === "/creatives")?.disposition).toBe("keep as direct-link archive until rebuilt or retired");
    expect(rows.find((row) => row.route === "/templates")?.disposition).toBe("support route, omit from primary nav");
    expect(navigationGroups).toHaveLength(2);
  });

  it("defines visible banners for the original-build legacy routes", () => {
    expect(Object.keys(legacyRouteBanners).sort()).toEqual(["/ads", "/creatives", "/generate", "/gtm", "/settings", "/workflow"]);
    expect(getLegacyRouteBanner("/generate")?.replacementHref).toBe("/assets");
    expect(getLegacyRouteBanner("/workflow")?.replacementHref).toBe("/launch");
    expect(getLegacyRouteBanner("/scorecard")).toBeNull();
  });
});
