import { describe, expect, it } from "vitest";
import {
  activeNavigationHrefs,
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
});
