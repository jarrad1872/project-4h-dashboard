import { describe, it, expect } from "vitest";
import {
  normalizeAd,
  adToDb,
  adToLegacyJson,
  statusToWorkflowStage,
  asNumber,
  metricsRowsToData,
  budgetRowsToData,
} from "../server-utils";

describe("statusToWorkflowStage", () => {
  it("maps approved → approved", () => {
    expect(statusToWorkflowStage("approved")).toBe("approved");
  });
  it("maps paused → uploaded", () => {
    expect(statusToWorkflowStage("paused")).toBe("uploaded");
  });
  it("maps rejected → concept", () => {
    expect(statusToWorkflowStage("rejected")).toBe("concept");
  });
  it("maps pending → copy-ready", () => {
    expect(statusToWorkflowStage("pending")).toBe("copy-ready");
  });
});

describe("asNumber", () => {
  it("returns number as-is", () => {
    expect(asNumber(42)).toBe(42);
  });
  it("parses numeric string", () => {
    expect(asNumber("123.45")).toBe(123.45);
  });
  it("returns 0 for non-numeric string", () => {
    expect(asNumber("abc")).toBe(0);
  });
  it("returns 0 for null/undefined", () => {
    expect(asNumber(null)).toBe(0);
    expect(asNumber(undefined)).toBe(0);
  });
  it("returns 0 for Infinity string", () => {
    expect(asNumber("Infinity")).toBe(0);
  });
});

describe("normalizeAd", () => {
  const input = {
    id: "LI-R1",
    platform: "linkedin",
    campaign_group: "4h_2026-03_pipe",
    format: "static1x1",
    primary_text: "Stop losing jobs to voicemail.",
    headline: "Pipe.City AI Receptionist",
    cta: "Start Free Trial",
    landing_path: "/pipe",
    utm_source: "linkedin",
    utm_medium: "paid-social",
    utm_campaign: "4h_2026-03_pipe",
    utm_content: "pain-v1",
    utm_term: "owners_1-10",
    status: "pending",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  };

  it("normalizes snake_case input", () => {
    const ad = normalizeAd(input);
    expect(ad.id).toBe("LI-R1");
    expect(ad.platform).toBe("linkedin");
    expect(ad.primary_text).toBe("Stop losing jobs to voicemail.");
    expect(ad.primaryText).toBe("Stop losing jobs to voicemail.");
    expect(ad.campaign_group).toBe("4h_2026-03_pipe");
    expect(ad.campaignGroup).toBe("4h_2026-03_pipe");
  });

  it("normalizes camelCase input", () => {
    const camelInput = {
      id: "LI-R2",
      platform: "linkedin",
      campaignGroup: "4h_custom",
      format: "static1x1",
      primaryText: "Hello world",
      headline: null,
      cta: "Sign Up",
      landingPath: "/mow",
      utmSource: "linkedin",
      utmMedium: "paid-social",
      utmCampaign: "4h_2026-03_mow",
      utmContent: "test",
      utmTerm: "owners",
      status: "approved",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z",
    };
    const ad = normalizeAd(camelInput);
    expect(ad.campaign_group).toBe("4h_custom");
    expect(ad.primary_text).toBe("Hello world");
    expect(ad.landing_path).toBe("/mow");
  });

  it("infers workflow_stage from status when missing", () => {
    const ad = normalizeAd({ ...input, status: "approved" });
    expect(ad.workflow_stage).toBe("approved");
    expect(ad.workflowStage).toBe("approved");
  });

  it("preserves explicit workflow_stage", () => {
    const ad = normalizeAd({ ...input, workflow_stage: "live" });
    expect(ad.workflow_stage).toBe("live");
  });

  it("normalizes status history from DB format", () => {
    const withHistory = {
      ...input,
      ad_status_history: [
        { status: "pending", changed_at: "2026-03-01T00:00:00Z", note: "Created" },
        { status: "approved", changed_at: "2026-03-02T00:00:00Z" },
      ],
    };
    const ad = normalizeAd(withHistory);
    expect(ad.statusHistory).toHaveLength(2);
    expect(ad.statusHistory![0].status).toBe("pending");
    expect(ad.statusHistory![0].at).toBe("2026-03-01T00:00:00Z");
    expect(ad.statusHistory![1].note).toBeUndefined();
  });

  it("defaults creative_variant to 1", () => {
    const ad = normalizeAd(input);
    expect(ad.creative_variant).toBe(1);
    expect(ad.creativeVariant).toBe(1);
  });

  it("defaults image_url to null", () => {
    const ad = normalizeAd(input);
    expect(ad.image_url).toBeNull();
    expect(ad.imageUrl).toBeNull();
  });
});

describe("adToDb", () => {
  it("maps to snake_case DB columns", () => {
    const ad = normalizeAd({
      id: "TEST-1",
      platform: "facebook",
      campaign_group: "4h_test",
      format: "static1x1",
      primary_text: "Test copy",
      headline: null,
      cta: "Sign Up",
      landing_path: "/test",
      utm_source: "facebook",
      utm_medium: "paid-social",
      utm_campaign: "4h_test",
      utm_content: "v1",
      utm_term: "owners",
      status: "pending",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    const db = adToDb(ad);
    expect(db.id).toBe("TEST-1");
    expect(db.primary_text).toBe("Test copy");
    expect(db.landing_path).toBe("/test");
    expect(db.utm_campaign).toBe("4h_test");
    // Should not have camelCase keys
    expect((db as any).primaryText).toBeUndefined();
    expect((db as any).landingPath).toBeUndefined();
  });
});

describe("adToLegacyJson", () => {
  it("maps to camelCase for JSON file storage", () => {
    const ad = normalizeAd({
      id: "TEST-2",
      platform: "youtube",
      campaign_group: "4h_legacy",
      format: "video30",
      primary_text: "Legacy text",
      headline: "Legacy headline",
      cta: "Watch Now",
      landing_path: "/legacy",
      utm_source: "youtube",
      utm_medium: "paid-social",
      utm_campaign: "4h_legacy",
      utm_content: "v1",
      utm_term: "owners",
      status: "approved",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    const json = adToLegacyJson(ad);
    expect(json.primaryText).toBe("Legacy text");
    expect(json.landingPath).toBe("/legacy");
    expect(json.utmCampaign).toBe("4h_legacy");
    expect(json.workflowStage).toBe("approved");
    // Should not have snake_case keys
    expect((json as any).primary_text).toBeUndefined();
    expect((json as any).landing_path).toBeUndefined();
  });
});

describe("metricsRowsToData", () => {
  it("groups rows by week and platform", () => {
    const rows = [
      { id: "1", week_start: "2026-03-03", platform: "linkedin" as const, spend: 500, impressions: 10000, clicks: 150, signups: 10, activations: 5, paid: 2 },
      { id: "2", week_start: "2026-03-03", platform: "youtube" as const, spend: 300, impressions: 8000, clicks: 100, signups: 8, activations: 3, paid: 1 },
      { id: "3", week_start: "2026-03-10", platform: "linkedin" as const, spend: 600, impressions: 12000, clicks: 200, signups: 15, activations: 7, paid: 3 },
    ];

    const data = metricsRowsToData(rows);
    expect(data.weeks).toHaveLength(2);
    expect(data.weeks[0].weekStart).toBe("2026-03-03");
    expect(data.weeks[0].linkedin.spend).toBe(500);
    expect(data.weeks[0].youtube.spend).toBe(300);
    expect(data.weeks[0].facebook.spend).toBe(0); // empty channel
    expect(data.weeks[1].linkedin.spend).toBe(600);
  });

  it("returns empty weeks for no rows", () => {
    const data = metricsRowsToData([]);
    expect(data.weeks).toHaveLength(0);
  });
});

describe("budgetRowsToData", () => {
  it("aggregates budget rows", () => {
    const rows = [
      { platform: "linkedin" as const, allocated: 5000, spent: 1200, updated_at: "2026-03-01T00:00:00Z" },
      { platform: "youtube" as const, allocated: 5000, spent: 800, updated_at: "2026-03-01T00:00:00Z" },
    ];
    const data = budgetRowsToData(rows);
    expect(data.channels.linkedin.allocated).toBe(5000);
    expect(data.channels.linkedin.spent).toBe(1200);
    expect(data.channels.youtube.spent).toBe(800);
    expect(data.channels.facebook.allocated).toBe(0); // default
    expect(data.totalBudget).toBe(10000); // sum of allocated
  });

  it("uses config total_budget when provided", () => {
    const rows = [
      { platform: "linkedin" as const, allocated: 5000, spent: 0, updated_at: "2026-03-01T00:00:00Z" },
    ];
    const config = {
      id: 1,
      status: "live" as const,
      start_date: "2026-03-01",
      linkedin_status: "live",
      youtube_status: "ready",
      facebook_status: "ready",
      instagram_status: "ready",
      total_budget: 20000,
      updated_at: "2026-03-01T00:00:00Z",
    };
    const data = budgetRowsToData(rows, config);
    expect(data.totalBudget).toBe(20000);
  });
});
