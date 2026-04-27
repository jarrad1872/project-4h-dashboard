import { describe, expect, it } from "vitest";
import {
  BEACHHEAD_IMAGE_TRADES,
  IMAGE_CREATIVE_ANGLES,
  getImageCreativeBrief,
  listImageCreativeBriefs,
} from "../image-creative-briefs";

describe("image creative briefs", () => {
  it("generates one multi-platform brief per beachhead trade and angle", () => {
    const briefs = listImageCreativeBriefs();

    expect(briefs).toHaveLength(BEACHHEAD_IMAGE_TRADES.length * IMAGE_CREATIVE_ANGLES.length);
    expect(briefs.every((brief) => brief.platform === "multi")).toBe(true);
  });

  it("builds trade-specific gpt-image prompt context", () => {
    const brief = getImageCreativeBrief({ trade_slug: "pipe", angle: "missed-call", platform: "facebook" });

    expect(brief.id).toBe("pipe-missed-call-facebook");
    expect(brief.domain).toBe("pipe.city");
    expect(brief.dimensions).toBe("1080x1080");
    expect(brief.prompt).toContain("pipe.city");
    expect(brief.prompt).toContain("$39/mo");
    expect(brief.prompt).toContain("14-day free trial");
    expect(brief.negative_prompt).toContain("No generic SaaS dashboards");
  });

  it("rejects unknown trades", () => {
    expect(() => getImageCreativeBrief({ trade_slug: "unknown", angle: "demo-call" })).toThrow(
      "Unknown image creative trade",
    );
  });
});
