import { describe, expect, it } from "vitest";
import { buildActiveLoopSupportSummary, EMPTY_MARKETING_EVENT_SUMMARY } from "../active-loop-support-summaries";
import type { LifecycleMessage, MarketingEventSummary } from "../types";

const messages: LifecycleMessage[] = [
  {
    id: "m1",
    asset_id: "trial-day-1",
    channel: "email",
    timing: "day_1",
    subject: "Book the first job",
    message: "Push the trial user toward their first captured call.",
    goal: "activation",
    status: "active",
    updated_at: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "m2",
    asset_id: "trial-day-3",
    channel: "sms",
    timing: "day_3",
    subject: null,
    message: "Remind them to try the demo line.",
    goal: "trial",
    status: "paused",
    updated_at: "2026-04-27T00:00:00.000Z",
  },
];

const summary: MarketingEventSummary = {
  ...EMPTY_MARKETING_EVENT_SUMMARY,
  total: 10,
  byType: {
    ...EMPTY_MARKETING_EVENT_SUMMARY.byType,
    signup: 4,
    trial_started: 3,
    activated: 2,
    paid: 1,
  },
};

describe("buildActiveLoopSupportSummary", () => {
  it("folds lifecycle conversion and template support into active-loop summaries", () => {
    const result = buildActiveLoopSupportSummary({
      lifecycleMessages: messages,
      marketingSummary: summary,
      savedAdTemplates: 7,
    });

    expect(result.lifecycle.activeMessages).toBe(1);
    expect(result.lifecycle.pausedMessages).toBe(1);
    expect(result.lifecycle.signups).toBe(4);
    expect(result.lifecycle.paid).toBe(1);
    expect(result.templates.contentBriefs).toBe(3);
    expect(result.templates.messageMatchBriefs).toBe(20);
    expect(result.templates.messageMatchDomains).toBe(5);
    expect(result.templates.savedAdTemplates).toBe(7);
    expect(result.templates.evidence).toContain("does not edit sawcity-lite");
  });
});
