import { describe, expect, it } from "vitest";
import {
  APPROVAL_AUDIT_AREAS,
  approvalAuditAreaFromActivity,
  approvalAuditNote,
  buildApprovalAuditSummary,
} from "../approval-audit-log";
import type { ActivityLog } from "../types";

function activity(overrides: Partial<ActivityLog>): ActivityLog {
  return {
    id: overrides.id ?? "log-1",
    entity_type: overrides.entity_type ?? "ad",
    entity_id: overrides.entity_id ?? "LI-P1",
    action: overrides.action ?? "status_changed",
    old_value: overrides.old_value ?? { status: "pending" },
    new_value: overrides.new_value ?? { status: "approved" },
    note: overrides.note ?? null,
    created_at: overrides.created_at ?? "2026-04-27T12:00:00.000Z",
  };
}

describe("approval audit log", () => {
  it("defines coverage for all approval surfaces required by Q-23", () => {
    const labels = APPROVAL_AUDIT_AREAS.map((item) => item.label);

    expect(labels).toContain("Creative");
    expect(labels).toContain("Outreach");
    expect(labels).toContain("Launch bundle");
    expect(labels).toContain("Export");
    expect(labels).toContain("Ad copy");
  });

  it("classifies existing activity rows into approval areas", () => {
    expect(approvalAuditAreaFromActivity(activity({ entity_type: "creative_asset" }))).toBe("creative");
    expect(approvalAuditAreaFromActivity(activity({ entity_type: "influencer", action: "draft_approved" }))).toBe("outreach");
    expect(approvalAuditAreaFromActivity(activity({ entity_type: "launch_bundle" }))).toBe("launch_bundle");
    expect(approvalAuditAreaFromActivity(activity({ entity_type: "platform_upload_sheet_export" }))).toBe("export");
    expect(approvalAuditAreaFromActivity(activity({ entity_type: "ad", action: "status_changed" }))).toBe("ad_copy");
  });

  it("builds a recent decision summary with who, when, what, and why metadata", () => {
    const summary = buildApprovalAuditSummary(
      [
        activity({
          id: "older",
          entity_type: "creative_asset",
          note: "Creative approval audit: approved prompt image.",
          created_at: "2026-04-27T11:00:00.000Z",
        }),
        activity({
          id: "newer",
          entity_type: "ad",
          note: "Ad copy approval audit: individual approval queue decision.",
          created_at: "2026-04-27T12:00:00.000Z",
        }),
      ],
      "fallback",
      "2026-04-27T12:01:00.000Z",
    );

    expect(summary.entries[0].id).toBe("newer");
    expect(summary.entries[0].actor).toBe("4H dashboard");
    expect(summary.entries[0].oldStatus).toBe("pending");
    expect(summary.entries[0].newStatus).toBe("approved");
    expect(summary.entries[0].note).toContain("approval audit");
    expect(summary.coverage.find((item) => item.area === "creative")?.records).toBe(1);
    expect(summary.coverage.find((item) => item.area === "ad_copy")?.records).toBe(1);
  });

  it("keeps ad copy audit notes classified as ad copy even when safety text mentions launch", () => {
    const note = approvalAuditNote("ad_copy", "approved", "individual approval queue decision");
    const summary = buildApprovalAuditSummary([
      activity({
        entity_type: "ad",
        action: "status_changed",
        note,
      }),
    ]);

    expect(summary.entries[0].area).toBe("ad_copy");
    expect(summary.coverage.find((item) => item.area === "ad_copy")?.records).toBe(1);
    expect(summary.coverage.find((item) => item.area === "launch_bundle")?.records).toBe(0);
  });

  it("marks audit notes as metadata only with no external platform action", () => {
    const note = approvalAuditNote("export", "approved", "local upload-sheet export review");

    expect(note).toContain("audit record only");
    expect(note).toContain("no ad-platform action, outreach send, launch, webhook, spend, or billing action");
  });
});
