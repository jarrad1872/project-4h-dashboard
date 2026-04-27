import { describe, expect, it } from "vitest";
import { campaignFlowLinks } from "../influencer-campaign-data";

describe("campaignFlowLinks", () => {
  it("points creator campaign flow links at active lanes instead of legacy routes", () => {
    expect(campaignFlowLinks.map((link) => link.href)).toEqual([
      "/assets",
      "/approval",
      "/launch",
      "/scorecard",
    ]);
    expect(campaignFlowLinks.map((link) => link.href)).not.toContain("/creatives");
    expect(campaignFlowLinks.map((link) => link.href)).not.toContain("/workflow");
  });
});
