import { describe, expect, it } from "vitest";
import {
  generateOutreachDraft,
  getAudienceSizeTier,
  getNextDraftStep,
  getNextFollowUpDate,
  qualifyInfluencer,
  resolveInfluencerTradeDomain,
  summarizeOutreachPackets,
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
    audit_label: null,
    audit_reason: null,
    audited_at: null,
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
    expect(qualified.totalScore).toBe(94);
    expect(qualified.recommendation).toBe("priority");
    expect(qualified.sizeTier).toBe("established");
    expect(qualified.ownerAudienceScore).toBe(25);
    expect(qualified.averageViewsScore).toBe(15);
    expect(qualified.sponsorScore).toBe(15);
    expect(qualified.trustScore).toBe(15);
    expect(qualified.productionValueScore).toBe(10);
  });

  it("downgrades consumer-heavy creators", () => {
    const qualified = qualifyInfluencer(
      makeInfluencer({
        business_focus: "consumer",
        sponsor_openness: "low",
        engagement_rate: 1.2,
        audience_size: 8000,
        average_views: 800,
        channel_url: null,
        contact_email: null,
        notes: null,
        platform: "linkedin",
      }),
    );

    expect(qualified.totalScore).toBeLessThan(40);
    expect(qualified.recommendation).toBe("watch");
    expect(qualified.sizeTier).toBe("micro");
  });

  it("rewards trade-language fit separately from owner-audience fit", () => {
    const qualified = qualifyInfluencer(
      makeInfluencer({
        notes: "Plumbing business channel with water heater demos and dispatch advice for owner operators.",
      }),
    );

    expect(qualified.tradeFitScore).toBe(20);
    expect(qualified.scoreSignals).toContain("clear trade fit");
  });
});

describe("generateOutreachDraft", () => {
  it("builds an initial flat-fee outreach draft", () => {
    const draft = generateOutreachDraft(makeInfluencer(), "initial");
    expect(draft.subject).toContain("Roger");
    expect(draft.body).toContain("flat-fee only ($500)");
    expect(draft.body).toContain("pipe.city");
    expect(draft.body).toContain("$39/mo");
    expect(draft.body).toContain("14-day free trial");
    expect(draft.body).toContain("no credit card required");
  });

  it("builds the first follow-up variant", () => {
    const draft = generateOutreachDraft(makeInfluencer(), "follow_up_1");
    expect(draft.subject).toContain("checking in");
    expect(draft.body).toContain("Following up");
    expect(draft.body).toContain("pipe.city");
  });

  it("resolves canonical domains for free-text trades", () => {
    expect(resolveInfluencerTradeDomain(makeInfluencer({ trade: "Lawn Care" }))).toBe("mow.city");
    expect(resolveInfluencerTradeDomain(makeInfluencer({ trade: "HVAC" }))).toBe("duct.city");
    expect(resolveInfluencerTradeDomain(makeInfluencer({ trade: "Pressure Washing" }))).toBe("rinse.city");
  });

  it("blocks outreach drafts when no trade-specific .city domain can be resolved", () => {
    const influencer = makeInfluencer({ trade: "Unknown Trade", deal_page: null });
    expect(resolveInfluencerTradeDomain(influencer)).toBeNull();
    expect(() => generateOutreachDraft(influencer, "initial")).toThrow(/trade-specific \.city domain/);
  });
});

describe("summarizeOutreachPackets", () => {
  it("counts a complete unsent first packet set", () => {
    const influencers = Array.from({ length: 10 }, (_, index) =>
      makeInfluencer({
        id: `creator-${index}`,
        draft_status: "pending_approval",
        outreach_stage: "approval_pending",
        draft_subject: `Creator ${index} x pipe.city`,
        draft_body: "Draft body",
      }),
    );

    expect(summarizeOutreachPackets(influencers)).toMatchObject({
      target: 10,
      drafted: 10,
      pendingApproval: 10,
      sent: 0,
      remaining: 0,
      complete: true,
    });
  });

  it("does not treat sent outreach as an acceptable Q-07 packet state", () => {
    const influencers = Array.from({ length: 10 }, (_, index) =>
      makeInfluencer({
        id: `creator-${index}`,
        draft_status: index === 0 ? "sent" : "pending_approval",
        outreach_stage: index === 0 ? "sent" : "approval_pending",
        draft_subject: `Creator ${index} x pipe.city`,
        draft_body: "Draft body",
      }),
    );

    const summary = summarizeOutreachPackets(influencers);
    expect(summary.sent).toBe(1);
    expect(summary.complete).toBe(false);
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
