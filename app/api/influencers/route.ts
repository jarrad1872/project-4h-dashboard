import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { isoNow } from "@/lib/file-db";
import {
  buildInfluencerPayload,
  isInfluencerSchemaMismatch,
  normalizeBusinessFocus,
  normalizeInfluencer,
  normalizeOutreachStage,
  normalizeSponsorOpenness,
  readInfluencersFallback,
  stripModernInfluencerPayload,
  VALID_INFLUENCER_STATUSES,
  writeInfluencersFallback,
} from "@/lib/influencer-store";
import { formatAudienceSize, normalizeAudienceSize, normalizeInfluencerStatus } from "@/lib/growth-command-center";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (!hasSupabase()) {
      const fallback = readInfluencersFallback();
      const filtered = status ? fallback.filter((row) => row.status === normalizeInfluencerStatus(status)) : fallback;
      return okJson(filtered);
    }

    let query = supabaseAdmin
      .from("influencer_pipeline")
      .select("*")
      .order("created_at", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return errorJson("Failed to load influencers", 500, error.message);
    }

    const rows = (data ?? []).map((row) => normalizeInfluencer(row as Record<string, unknown>));
    return okJson(status ? rows.filter((row) => row.status === normalizeInfluencerStatus(status)) : rows);
  } catch (err) {
    return errorJson("Failed to load influencers", 500, String(err));
  }
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.creator_name || !body.trade || !body.platform) {
      return errorJson("creator_name, trade, and platform are required", 400);
    }

    const status = normalizeInfluencerStatus(body.status);
    if (!VALID_INFLUENCER_STATUSES.includes(status)) {
      return errorJson(`status must be one of: ${VALID_INFLUENCER_STATUSES.join(", ")}`, 400);
    }

    const audienceSize = normalizeAudienceSize(
      typeof body.audience_size === "number" ? body.audience_size : null,
      body.estimated_reach ?? null,
    );
    const row = normalizeInfluencer({
      id: body.id ?? crypto.randomUUID(),
      creator_name: body.creator_name,
      trade: body.trade,
      platform: body.platform,
      channel_url: body.channel_url || null,
      audience_size: audienceSize,
      estimated_reach: body.estimated_reach || (audienceSize ? formatAudienceSize(audienceSize) : null),
      status,
      flat_fee_amount: typeof body.flat_fee_amount === "number" ? body.flat_fee_amount : null,
      deal_page: body.deal_page || null,
      referral_code: body.referral_code || null,
      notes: body.notes || null,
      last_contact_at: body.last_contact_at || null,
      contact_email: body.contact_email || null,
      business_focus: normalizeBusinessFocus(body.business_focus),
      average_views: typeof body.average_views === "number" ? body.average_views : null,
      engagement_rate: typeof body.engagement_rate === "number" ? body.engagement_rate : null,
      sponsor_openness: normalizeSponsorOpenness(body.sponsor_openness),
      outreach_stage: normalizeOutreachStage(body.outreach_stage),
      draft_status: body.draft_status ?? "not_started",
      draft_step: body.draft_step ?? "initial",
      draft_subject: body.draft_subject || null,
      draft_body: body.draft_body || null,
      approval_notes: body.approval_notes || null,
      approved_at: body.approved_at || null,
      draft_generated_at: body.draft_generated_at || null,
      sent_at: body.sent_at || null,
      follow_up_due_at: body.follow_up_due_at || null,
      last_response_at: body.last_response_at || null,
      created_at: isoNow(),
      updated_at: isoNow(),
    });

    if (!hasSupabase()) {
      const influencers = readInfluencersFallback();
      influencers.unshift(row);
      writeInfluencersFallback(influencers);

      await logActivity({
        entity_type: "influencer",
        entity_id: row.id,
        action: "created",
        new_value: row,
      });

      return okJson(row, 201);
    }

    const insertPayload = buildInfluencerPayload(row);

    let { data, error } = await supabaseAdmin.from("influencer_pipeline").insert(insertPayload).select("*").single();

    if (isInfluencerSchemaMismatch(error)) {
      const retry = await supabaseAdmin
        .from("influencer_pipeline")
        .insert(stripModernInfluencerPayload(insertPayload))
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return errorJson("Failed to create influencer", 500, error.message);
    }

    const normalized = normalizeInfluencer((data ?? row) as Record<string, unknown>);
    await logActivity({
      entity_type: "influencer",
      entity_id: normalized.id,
      action: "created",
      new_value: normalized,
    });

    return okJson(normalized, 201);
  } catch (err) {
    return errorJson("Failed to create influencer", 500, String(err));
  }
}
