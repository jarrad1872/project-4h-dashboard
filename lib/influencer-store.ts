import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { formatAudienceSize, normalizeAudienceSize, normalizeInfluencerStatus } from "@/lib/growth-command-center";
import { readFallback } from "@/lib/server-utils";
import type {
  Influencer,
  InfluencerBusinessFocus,
  InfluencerOutreachDraftStatus,
  InfluencerOutreachDraftStep,
  InfluencerOutreachStage,
  InfluencerSponsorOpenness,
  InfluencerStatus,
} from "@/lib/types";

export const VALID_INFLUENCER_STATUSES: InfluencerStatus[] = [
  "researching",
  "contacted",
  "negotiating",
  "contracted",
  "content_live",
  "paid",
  "declined",
];

const BUSINESS_FOCUS_MAP: Record<string, InfluencerBusinessFocus> = {
  owners: "owners",
  mixed: "mixed",
  consumer: "consumer",
};

const SPONSOR_OPENNESS_MAP: Record<string, InfluencerSponsorOpenness> = {
  low: "low",
  medium: "medium",
  high: "high",
};

const OUTREACH_STAGE_MAP: Record<string, InfluencerOutreachStage> = {
  discovery: "discovery",
  qualified: "qualified",
  approval_pending: "approval_pending",
  approved: "approved",
  sent: "sent",
  follow_up_due: "follow_up_due",
  responded: "responded",
  closed: "closed",
};

const DRAFT_STATUS_MAP: Record<string, InfluencerOutreachDraftStatus> = {
  not_started: "not_started",
  drafted: "drafted",
  pending_approval: "pending_approval",
  approved: "approved",
  rejected: "rejected",
  sent: "sent",
};

const DRAFT_STEP_MAP: Record<string, InfluencerOutreachDraftStep> = {
  initial: "initial",
  follow_up_1: "follow_up_1",
  follow_up_2: "follow_up_2",
};

export function normalizeBusinessFocus(value: unknown): InfluencerBusinessFocus {
  if (typeof value !== "string") return "mixed";
  return BUSINESS_FOCUS_MAP[value] ?? "mixed";
}

export function normalizeSponsorOpenness(value: unknown): InfluencerSponsorOpenness {
  if (typeof value !== "string") return "medium";
  return SPONSOR_OPENNESS_MAP[value] ?? "medium";
}

export function normalizeOutreachStage(value: unknown): InfluencerOutreachStage {
  if (typeof value !== "string") return "discovery";
  return OUTREACH_STAGE_MAP[value] ?? "discovery";
}

export function normalizeDraftStatus(value: unknown): InfluencerOutreachDraftStatus {
  if (typeof value !== "string") return "not_started";
  return DRAFT_STATUS_MAP[value] ?? "not_started";
}

export function normalizeDraftStep(value: unknown): InfluencerOutreachDraftStep {
  if (typeof value !== "string") return "initial";
  return DRAFT_STEP_MAP[value] ?? "initial";
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function normalizeInfluencer(input: Record<string, unknown>): Influencer {
  const audienceSize = normalizeAudienceSize(
    typeof input.audience_size === "number" ? input.audience_size : null,
    typeof input.estimated_reach === "string" ? input.estimated_reach : null,
  );

  return {
    id: String(input.id ?? crypto.randomUUID()),
    creator_name: String(input.creator_name ?? ""),
    trade: String(input.trade ?? ""),
    platform: String(input.platform ?? ""),
    channel_url: stringOrNull(input.channel_url),
    audience_size: audienceSize,
    estimated_reach: stringOrNull(input.estimated_reach) ?? (audienceSize ? formatAudienceSize(audienceSize) : null),
    status: normalizeInfluencerStatus(input.status as string | null | undefined),
    flat_fee_amount: numberOrNull(input.flat_fee_amount),
    deal_page: stringOrNull(input.deal_page),
    referral_code: stringOrNull(input.referral_code),
    notes: stringOrNull(input.notes),
    last_contact_at: stringOrNull(input.last_contact_at),
    contact_email: stringOrNull(input.contact_email),
    business_focus: normalizeBusinessFocus(input.business_focus),
    average_views: numberOrNull(input.average_views),
    engagement_rate: numberOrNull(input.engagement_rate),
    sponsor_openness: normalizeSponsorOpenness(input.sponsor_openness),
    outreach_stage: normalizeOutreachStage(input.outreach_stage),
    draft_status: normalizeDraftStatus(input.draft_status),
    draft_step: normalizeDraftStep(input.draft_step),
    draft_subject: stringOrNull(input.draft_subject),
    draft_body: stringOrNull(input.draft_body),
    approval_notes: stringOrNull(input.approval_notes),
    approved_at: stringOrNull(input.approved_at),
    draft_generated_at: stringOrNull(input.draft_generated_at),
    sent_at: stringOrNull(input.sent_at),
    follow_up_due_at: stringOrNull(input.follow_up_due_at),
    last_response_at: stringOrNull(input.last_response_at),
    created_at: String(input.created_at ?? isoNow()),
    updated_at: String(input.updated_at ?? input.created_at ?? isoNow()),
  };
}

export function readInfluencersFallback() {
  return readFallback<Record<string, unknown>[]>(DataFiles.influencers, []).map(normalizeInfluencer);
}

export function writeInfluencersFallback(influencers: Influencer[]) {
  writeJsonFile(DataFiles.influencers, influencers);
}

export function isInfluencerSchemaMismatch(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.code === "PGRST204" ||
        error.message?.includes("audience_size") ||
        error.message?.includes("flat_fee_amount") ||
        error.message?.includes("contact_email") ||
        error.message?.includes("business_focus") ||
        error.message?.includes("average_views") ||
        error.message?.includes("engagement_rate") ||
        error.message?.includes("sponsor_openness") ||
        error.message?.includes("outreach_stage") ||
        error.message?.includes("draft_status") ||
        error.message?.includes("draft_step") ||
        error.message?.includes("draft_subject") ||
        error.message?.includes("draft_body") ||
        error.message?.includes("approval_notes") ||
        error.message?.includes("approved_at") ||
        error.message?.includes("draft_generated_at") ||
        error.message?.includes("sent_at") ||
        error.message?.includes("follow_up_due_at") ||
        error.message?.includes("last_response_at") ||
        error.message?.includes("schema cache")),
  );
}

export function buildInfluencerPayload(row: Influencer): Record<string, unknown> {
  return {
    creator_name: row.creator_name,
    trade: row.trade,
    platform: row.platform,
    channel_url: row.channel_url,
    audience_size: row.audience_size,
    estimated_reach: row.estimated_reach,
    status: row.status,
    flat_fee_amount: row.flat_fee_amount,
    deal_page: row.deal_page,
    referral_code: row.referral_code,
    notes: row.notes,
    last_contact_at: row.last_contact_at,
    contact_email: row.contact_email,
    business_focus: row.business_focus,
    average_views: row.average_views,
    engagement_rate: row.engagement_rate,
    sponsor_openness: row.sponsor_openness,
    outreach_stage: row.outreach_stage,
    draft_status: row.draft_status,
    draft_step: row.draft_step,
    draft_subject: row.draft_subject,
    draft_body: row.draft_body,
    approval_notes: row.approval_notes,
    approved_at: row.approved_at,
    draft_generated_at: row.draft_generated_at,
    sent_at: row.sent_at,
    follow_up_due_at: row.follow_up_due_at,
    last_response_at: row.last_response_at,
  };
}

export function stripModernInfluencerPayload(payload: Record<string, unknown>) {
  const legacyPayload = { ...payload };
  delete legacyPayload.audience_size;
  delete legacyPayload.flat_fee_amount;
  delete legacyPayload.contact_email;
  delete legacyPayload.business_focus;
  delete legacyPayload.average_views;
  delete legacyPayload.engagement_rate;
  delete legacyPayload.sponsor_openness;
  delete legacyPayload.outreach_stage;
  delete legacyPayload.draft_status;
  delete legacyPayload.draft_step;
  delete legacyPayload.draft_subject;
  delete legacyPayload.draft_body;
  delete legacyPayload.approval_notes;
  delete legacyPayload.approved_at;
  delete legacyPayload.draft_generated_at;
  delete legacyPayload.sent_at;
  delete legacyPayload.follow_up_due_at;
  delete legacyPayload.last_response_at;
  return legacyPayload;
}
