import type { ActivityLog } from "@/lib/types";

export type ApprovalAuditArea = "ad_copy" | "creative" | "outreach" | "launch_bundle" | "export";

export interface ApprovalAuditCoverageItem {
  area: ApprovalAuditArea;
  label: string;
  route: string;
  requirement: string;
  records: number;
  covered: boolean;
}

export interface ApprovalAuditEntry {
  id: string;
  area: ApprovalAuditArea;
  areaLabel: string;
  entityType: string;
  entityId: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  note: string;
  actor: string;
  decidedAt: string;
}

export interface ApprovalAuditSummary {
  coverage: ApprovalAuditCoverageItem[];
  entries: ApprovalAuditEntry[];
  source: "supabase" | "fallback" | "empty" | "unavailable";
  generatedAt: string;
}

export const APPROVAL_AUDIT_AREAS: Omit<ApprovalAuditCoverageItem, "records" | "covered">[] = [
  {
    area: "ad_copy",
    label: "Ad copy",
    route: "/approval",
    requirement: "Pending ad copy approvals and rejects from the approval queue.",
  },
  {
    area: "creative",
    label: "Creative",
    route: "/assets",
    requirement: "Creative asset approvals for generated images and replacement variants.",
  },
  {
    area: "outreach",
    label: "Outreach",
    route: "/influencer",
    requirement: "Creator outreach draft approval, rejection, and review decisions.",
  },
  {
    area: "launch_bundle",
    label: "Launch bundle",
    route: "/launch",
    requirement: "Launch bundle readiness and Jarrad approval checkpoints before external action.",
  },
  {
    area: "export",
    label: "Export",
    route: "/launch",
    requirement: "Local upload-sheet or Drive export approvals before any platform upload.",
  },
];

export function approvalAuditNote(area: ApprovalAuditArea, decision: string, context: string) {
  const label = labelForArea(area);
  return `${label} approval audit: ${context}; decision=${decision}; audit record only, no ad-platform action, outreach send, launch, webhook, spend, or billing action.`;
}

export function labelForArea(area: ApprovalAuditArea) {
  return APPROVAL_AUDIT_AREAS.find((item) => item.area === area)?.label ?? "Approval";
}

export function approvalAuditAreaFromActivity(log: Pick<ActivityLog, "entity_type" | "entity_id" | "action" | "note">) {
  const entitySignal = [log.entity_type, log.entity_id, log.action].join(" ").toLowerCase();
  const haystack = [log.entity_type, log.entity_id, log.action, log.note ?? ""].join(" ").toLowerCase();

  if (
    entitySignal.includes("export") ||
    entitySignal.includes("upload_sheet") ||
    entitySignal.includes("upload sheet") ||
    entitySignal.includes("platform_sheet") ||
    entitySignal.includes("platform sheet") ||
    entitySignal.includes("drive_backup") ||
    entitySignal.includes("drive backup") ||
    /\bcsv\b/.test(entitySignal)
  ) {
    return "export";
  }
  if (/\b(launch[-_\s]?bundle|launch[-_\s]?checklist|launch|preflight|jarrad[-_\s]?approval)\b/.test(entitySignal)) {
    return "launch_bundle";
  }
  if (/\b(influencer|creator|outreach|draft[-_\s]?approval)\b/.test(entitySignal)) return "outreach";
  if (/\b(creative[-_\s]?asset|trade[-_\s]?asset|asset|creative|image|variant)\b/.test(entitySignal)) return "creative";
  if (/\b(ad|ad[-_\s]?copy|copy[-_\s]?approval|status[-_\s]?changed)\b/.test(entitySignal)) return "ad_copy";

  if (
    haystack.includes("export") ||
    haystack.includes("upload_sheet") ||
    haystack.includes("upload sheet") ||
    haystack.includes("platform_sheet") ||
    haystack.includes("platform sheet") ||
    haystack.includes("drive_backup") ||
    haystack.includes("drive backup") ||
    /\bcsv\b/.test(haystack)
  ) {
    return "export";
  }
  if (/\b(launch[-_\s]?bundle|launch[-_\s]?checklist|launch|preflight|jarrad[-_\s]?approval)\b/.test(haystack)) {
    return "launch_bundle";
  }
  if (/\b(influencer|creator|outreach|draft[-_\s]?approval)\b/.test(haystack)) return "outreach";
  if (/\b(creative[-_\s]?asset|trade[-_\s]?asset|asset|creative|image|variant)\b/.test(haystack)) return "creative";
  if (/\b(ad|ad[-_\s]?copy|copy[-_\s]?approval|status[-_\s]?changed)\b/.test(haystack)) return "ad_copy";

  return null;
}

function statusFromValue(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const status = record.status ?? record.workflow_stage ?? record.workflowStage ?? record.draft_status ?? record.approval_status;
  return typeof status === "string" ? status : null;
}

function decisionNote(log: ActivityLog, area: ApprovalAuditArea) {
  if (log.note) return log.note;
  const oldStatus = statusFromValue(log.old_value);
  const newStatus = statusFromValue(log.new_value);
  if (oldStatus || newStatus) {
    return `${labelForArea(area)} decision changed from ${oldStatus ?? "unknown"} to ${newStatus ?? "unknown"}.`;
  }
  return `${labelForArea(area)} approval activity recorded.`;
}

export function normalizeApprovalAuditEntry(log: ActivityLog): ApprovalAuditEntry | null {
  const area = approvalAuditAreaFromActivity(log);
  if (!area) return null;

  return {
    id: log.id,
    area,
    areaLabel: labelForArea(area),
    entityType: log.entity_type,
    entityId: log.entity_id,
    action: log.action,
    oldStatus: statusFromValue(log.old_value),
    newStatus: statusFromValue(log.new_value),
    note: decisionNote(log, area),
    actor: "4H dashboard",
    decidedAt: log.created_at,
  };
}

export function buildApprovalAuditSummary(
  logs: ActivityLog[],
  source: ApprovalAuditSummary["source"] = logs.length ? "fallback" : "empty",
  generatedAt = new Date().toISOString(),
): ApprovalAuditSummary {
  const entries = logs
    .map(normalizeApprovalAuditEntry)
    .filter((entry): entry is ApprovalAuditEntry => Boolean(entry))
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  const coverage = APPROVAL_AUDIT_AREAS.map((item) => {
    const records = entries.filter((entry) => entry.area === item.area).length;
    return {
      ...item,
      records,
      covered: records > 0,
    };
  });

  return {
    coverage,
    entries: entries.slice(0, 50),
    source,
    generatedAt,
  };
}
