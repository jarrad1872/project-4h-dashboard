import { describe, expect, it } from "vitest";
import { auditCreator, summarizeCreatorAudit } from "../creator-audit";
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

describe("auditCreator", () => {
  it("keeps owner-focused creators with strong qualification signals", () => {
    expect(auditCreator(makeInfluencer()).label).toBe("keep");
  });

  it("marks likely fits as needs-research when evidence is incomplete", () => {
    const result = auditCreator(
      makeInfluencer({
        average_views: null,
        engagement_rate: null,
        sponsor_openness: "medium",
      }),
    );

    expect(result.label).toBe("needs-research");
    expect(result.reason).toContain("missing");
  });

  it("removes consumer-heavy creators without deleting their history", () => {
    const result = auditCreator(
      makeInfluencer({
        business_focus: "consumer",
        sponsor_openness: "low",
        audience_size: 8000,
        engagement_rate: 1.2,
      }),
    );

    expect(result.label).toBe("remove");
    expect(result.reason).toContain("deprioritize");
  });
});

describe("summarizeCreatorAudit", () => {
  it("counts persisted labels and computed recommendations", () => {
    const summary = summarizeCreatorAudit([
      makeInfluencer({ id: "keep-1", audit_label: "keep" }),
      makeInfluencer({ id: "maybe-1", audit_label: "maybe" }),
      makeInfluencer({ id: "remove-1", audit_label: "remove" }),
      makeInfluencer({ id: "research-1", average_views: null, engagement_rate: null, sponsor_openness: "medium" }),
    ]);

    expect(summary.keep).toBe(1);
    expect(summary.maybe).toBe(1);
    expect(summary.remove).toBe(1);
    expect(summary["needs-research"]).toBe(1);
  });
});
