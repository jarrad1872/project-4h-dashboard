import { describe, expect, it } from "vitest";
import { publicCreativeUrlDependencies } from "../trade-utils";
import { staticCreativeUrlGuardEvidence, staticCreativeUrlGuardSummary } from "../static-creative-url-guard";

describe("static creative URL guard", () => {
  it("records Q52 before-redirect evidence for every public creative URL", () => {
    expect(staticCreativeUrlGuardEvidence).toMatchObject({
      route: "/creatives",
      replacement: "/assets",
      verifiedAt: "2026-04-27",
      verifiedAgainst: "http://127.0.0.1:3106",
      pageRouteStatus: 200,
      staticAssetStatus: 200,
      staticAssetContentType: "image/jpeg",
      checkedStaticUrls: publicCreativeUrlDependencies.length,
      failedStaticUrls: 0,
      externalActionAllowed: false,
      redirectImplemented: false,
    });
  });

  it("marks the creatives route ready only for a future page-route packet", () => {
    expect(staticCreativeUrlGuardSummary()).toMatchObject({
      expectedStaticUrls: 24,
      checkedStaticUrls: 24,
      allStaticUrlsAccountedFor: true,
      readyForPageRedirectPacket: true,
      redirectImplemented: false,
    });
  });
});
