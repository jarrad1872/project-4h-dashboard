import { describe, expect, it } from "vitest";
import {
  buildCreatorOutreachPipelineSummary,
  getCreatorOutreachPipelineStage,
} from "../creator-outreach-pipeline";
import type { Influencer } from "../types";

function creator(overrides: Partial<Influencer> = {}): Influencer {
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
    notes: "Strong plumbing owner/operator audience with sponsor history.",
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
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("creator outreach pipeline", () => {
  it("classifies a high-scoring creator as qualified before any send action", () => {
    expect(getCreatorOutreachPipelineStage(creator())).toBe("qualified");
  });

  it("prioritizes due follow-ups over sent state", () => {
    const row = creator({
      draft_status: "sent",
      outreach_stage: "sent",
      follow_up_due_at: "2026-04-03T00:00:00.000Z",
    });

    expect(getCreatorOutreachPipelineStage(row, new Date("2026-04-04T00:00:00.000Z"))).toBe("follow_up_due");
  });

  it("moves responded creators into the replied bucket before contract states", () => {
    const result = buildCreatorOutreachPipelineSummary(
      [
        creator({ id: "approved", draft_status: "approved", outreach_stage: "approved" }),
        creator({ id: "replied", last_response_at: "2026-04-05T12:00:00.000Z", outreach_stage: "responded" }),
        creator({ id: "paid", status: "paid" }),
      ],
      new Date("2026-04-06T00:00:00.000Z"),
    );

    expect(result.totalTracked).toBe(3);
    expect(result.buckets.find((bucket) => bucket.stage === "approved")?.count).toBe(1);
    expect(result.buckets.find((bucket) => bucket.stage === "replied")?.count).toBe(1);
    expect(result.buckets.find((bucket) => bucket.stage === "paid")?.count).toBe(1);
    expect(result.evidence).toContain("does not email creators");
  });

  it("keeps removed or declined creators out of active outreach buckets", () => {
    const result = buildCreatorOutreachPipelineSummary([
      creator({ id: "removed", audit_label: "remove" }),
      creator({ id: "declined", status: "declined" }),
    ]);

    expect(result.totalTracked).toBe(0);
    expect(result.readyForApproval).toBe(0);
    expect(result.nextBucket).toBeNull();
  });
});
