import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import {
  isInfluencerSchemaMismatch,
  normalizeBusinessFocus,
  normalizeDraftStatus,
  normalizeDraftStep,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status && !VALID_INFLUENCER_STATUSES.includes(normalizeInfluencerStatus(body.status))) {
      return errorJson(`status must be one of: ${VALID_INFLUENCER_STATUSES.join(", ")}`, 400);
    }

    const update: Record<string, unknown> = {};
    if (body.status !== undefined) update.status = normalizeInfluencerStatus(body.status);
    if (body.notes !== undefined) update.notes = body.notes;
    if (body.deal_page !== undefined) update.deal_page = body.deal_page;
    if (body.referral_code !== undefined) update.referral_code = body.referral_code;
    if (body.channel_url !== undefined) update.channel_url = body.channel_url;
    if (body.estimated_reach !== undefined) update.estimated_reach = body.estimated_reach;
    if (body.audience_size !== undefined || body.estimated_reach !== undefined) {
      const audienceSize = normalizeAudienceSize(
        typeof body.audience_size === "number" ? body.audience_size : null,
        body.estimated_reach ?? null,
      );
      update.audience_size = audienceSize;
      if (body.estimated_reach === undefined) {
        update.estimated_reach = audienceSize ? formatAudienceSize(audienceSize) : null;
      }
    }
    if (body.flat_fee_amount !== undefined) update.flat_fee_amount = body.flat_fee_amount;
    if (body.last_contact_at !== undefined) update.last_contact_at = body.last_contact_at;
    if (body.creator_name !== undefined) update.creator_name = body.creator_name;
    if (body.trade !== undefined) update.trade = body.trade;
    if (body.platform !== undefined) update.platform = body.platform;
    if (body.contact_email !== undefined) update.contact_email = body.contact_email;
    if (body.business_focus !== undefined) update.business_focus = normalizeBusinessFocus(body.business_focus);
    if (body.average_views !== undefined) update.average_views = body.average_views;
    if (body.engagement_rate !== undefined) update.engagement_rate = body.engagement_rate;
    if (body.sponsor_openness !== undefined) update.sponsor_openness = normalizeSponsorOpenness(body.sponsor_openness);
    if (body.outreach_stage !== undefined) update.outreach_stage = normalizeOutreachStage(body.outreach_stage);
    if (body.draft_status !== undefined) update.draft_status = normalizeDraftStatus(body.draft_status);
    if (body.draft_step !== undefined) update.draft_step = normalizeDraftStep(body.draft_step);
    if (body.draft_subject !== undefined) update.draft_subject = body.draft_subject;
    if (body.draft_body !== undefined) update.draft_body = body.draft_body;
    if (body.approval_notes !== undefined) update.approval_notes = body.approval_notes;
    if (body.approved_at !== undefined) update.approved_at = body.approved_at;
    if (body.draft_generated_at !== undefined) update.draft_generated_at = body.draft_generated_at;
    if (body.sent_at !== undefined) update.sent_at = body.sent_at;
    if (body.follow_up_due_at !== undefined) update.follow_up_due_at = body.follow_up_due_at;
    if (body.last_response_at !== undefined) update.last_response_at = body.last_response_at;

    if (Object.keys(update).length === 0) {
      return errorJson("No fields to update", 400);
    }

    if (!hasSupabase()) {
      const influencers = readInfluencersFallback();
      const index = influencers.findIndex((row) => row.id === id);
      if (index < 0) {
        return errorJson("Influencer not found", 404);
      }

      const previous = influencers[index];
      const next = normalizeInfluencer({ ...previous, ...update, id });
      influencers[index] = next;
      writeInfluencersFallback(influencers);

      await logActivity({
        entity_type: "influencer",
        entity_id: id,
        action: "updated",
        old_value: previous,
        new_value: next,
      });

      return okJson(next);
    }

    let { data, error } = await supabaseAdmin.from("influencer_pipeline").update(update).eq("id", id).select("*").single();

    if (isInfluencerSchemaMismatch(error)) {
      const legacyUpdate = stripModernInfluencerPayload(update);
      const retry = await supabaseAdmin.from("influencer_pipeline").update(legacyUpdate).eq("id", id).select("*").single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return errorJson("Failed to update influencer", 500, error.message);
    }

    if (!data) {
      return errorJson("Influencer not found", 404);
    }

    const normalized = normalizeInfluencer(data as Record<string, unknown>);
    await logActivity({
      entity_type: "influencer",
      entity_id: id,
      action: "updated",
      new_value: normalized,
    });

    return okJson(normalized);
  } catch (err) {
    return errorJson("Failed to update influencer", 500, String(err));
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!hasSupabase()) {
      const influencers = readInfluencersFallback();
      const deleted = influencers.find((row) => row.id === id);
      if (!deleted) {
        return errorJson("Influencer not found", 404);
      }

      writeInfluencersFallback(influencers.filter((row) => row.id !== id));
      await logActivity({
        entity_type: "influencer",
        entity_id: id,
        action: "deleted",
        old_value: deleted,
      });

      return okJson({ ok: true, deleted });
    }

    const { data, error } = await supabaseAdmin.from("influencer_pipeline").delete().eq("id", id).select("*").single();

    if (error) {
      return errorJson("Failed to delete influencer", 500, error.message);
    }

    if (!data) {
      return errorJson("Influencer not found", 404);
    }

    const normalized = normalizeInfluencer(data as Record<string, unknown>);
    await logActivity({
      entity_type: "influencer",
      entity_id: id,
      action: "deleted",
      old_value: normalized,
    });

    return okJson({ ok: true, deleted: normalized });
  } catch (err) {
    return errorJson("Failed to delete influencer", 500, String(err));
  }
}
