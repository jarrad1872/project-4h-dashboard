import { describe, expect, it } from "vitest";
import {
  generateOutreachDraft,
  getAudienceSizeTier,
  getNextDraftStep,
  getNextFollowUpDate,
  qualifyInfluencer,
} from "../influencer-outreach-agent";
import type { Influencer } from "../types";

function makeInfluencer(overrides: Partial<Influencer> = {}): Influencer {
  return {
    id: "creator-1",
    creator_name: "Roger Wakefield",
    trade: "pipe.city",
    platform: "youtube",
    channel_url: "https://youtube.com/@roger",
    audience_size: 120000,
    estimated_reach: "120K",
    status: "researching",
    flat_fee_amount: 500,
    deal_page: null,
    referral_code: null,
    notes: "Strong owner/operator audience with frequent business-content videos.",
    last_contact_at: null,
    contact_email: "roger@example.com",
    business_focus: "owners",
    average_views: 42000,
    engagement_rate: 5.6,
    sponsor_openness: "high",
    outreach_stage: "discovery",
    draft_status: "not_started",
    draft_step: "initial",
    draft_subject: null,
    draft_body: null,
    approval_notes: null,
    approved_at: null,
    draft_generated_at: null,
    sent_at: null,
    follow_up_due_at: null,
    last_response_at: null,
    created_at: "2026-03-31T00:00:00.000Z",
    updated_at: "2026-03-31T00:00:00.000Z",
    ...overrides,
  };
}

describe("qualifyInfluencer", () => {
  it("scores owner-focused creators higher", () => {
    const qualified = qualifyInfluencer(makeInfluencer());
    expect(qualified.totalScore).toBe(98);
    expect(qualified.recommendation).toBe("priority");
    expect(qualified.sizeTier).toBe("established");
  });

  it("downgrades consumer-heavy creators", () => {
    const qualified = qualifyInfluencer(
      makeInfluencer({
        business_focus: "consumer",
        sponsor_openness: "low",
        engagement_rate: 1.2,
        audience_size: 8000,
      }),
    );

    expect(qualified.totalScore).toBeLessThan(40);
    expect(qualified.recommendation).toBe("watch");
    expect(qualified.sizeTier).toBe("micro");
  });
});

describe("generateOutreachDraft", () => {
  it("builds an initial flat-fee outreach draft", () => {
    const draft = generateOutreachDraft(makeInfluencer(), "initial");
    expect(draft.subject).toContain("Roger");
    expect(draft.body).toContain("flat-fee only ($500)");
    expect(draft.body).toContain("14-day free trial");
  });

  it("builds the first follow-up variant", () => {
    const draft = generateOutreachDraft(makeInfluencer(), "follow_up_1");
    expect(draft.subject).toContain("checking in");
    expect(draft.body).toContain("Following up");
  });
});

describe("follow-up helpers", () => {
  it("queues a first follow-up after the due date passes", () => {
    const influencer = makeInfluencer({
      draft_status: "sent",
      draft_step: "initial",
      follow_up_due_at: "2026-03-10T00:00:00.000Z",
    });

    expect(getNextDraftStep(influencer, new Date("2026-03-11T00:00:00.000Z"))).toBe("follow_up_1");
  });

  it("stops follow-up generation after a response", () => {
    const influencer = makeInfluencer({
      draft_status: "sent",
      draft_step: "follow_up_1",
      follow_up_due_at: "2026-03-14T00:00:00.000Z",
      last_response_at: "2026-03-13T12:00:00.000Z",
    });

    expect(getNextDraftStep(influencer, new Date("2026-03-15T00:00:00.000Z"))).toBeNull();
  });

  it("uses day-3 and day-7 cadence windows", () => {
    expect(getNextFollowUpDate("initial", new Date("2026-03-01T00:00:00.000Z"))).toBe("2026-03-04T00:00:00.000Z");
    expect(getNextFollowUpDate("follow_up_1", new Date("2026-03-04T00:00:00.000Z"))).toBe("2026-03-08T00:00:00.000Z");
    expect(getNextFollowUpDate("follow_up_2", new Date("2026-03-08T00:00:00.000Z"))).toBeNull();
  });
});
