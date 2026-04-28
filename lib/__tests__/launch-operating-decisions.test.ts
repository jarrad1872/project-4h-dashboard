import { describe, expect, it } from "vitest";
import { confirmedLaunchBeachheads, launchOperatingDecisionSummary } from "../launch-operating-decisions";

describe("launch operating decisions", () => {
  it("records Jarrad's confirmed first-wave beachheads and approval gates", () => {
    expect(confirmedLaunchBeachheads).toEqual(["saw.city", "pipe.city", "mow.city", "rinse.city", "lockout.city"]);
    expect(launchOperatingDecisionSummary()).toMatchObject({
      beachheadCount: 5,
      creatorOutreachDraftsMayProceedAfter4HApproval: true,
      creatorOutreachSendRequiresActionTimeApproval: true,
      billingMode: "manual-at-first",
    });
    expect(launchOperatingDecisionSummary().imageApproval).toContain("Jarrad sign-off required");
    expect(launchOperatingDecisionSummary().externalActionApproval).toContain("action-time approval");
  });
});
