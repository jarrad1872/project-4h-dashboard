import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { isoNow } from "@/lib/file-db";
import {
  isInfluencerSchemaMismatch,
  normalizeInfluencer,
  readInfluencersFallback,
  stripModernInfluencerPayload,
  writeInfluencersFallback,
} from "@/lib/influencer-store";
import { generateOutreachDraft } from "@/lib/influencer-outreach-agent";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const step = body.step ?? "initial";

    if (!hasSupabase()) {
      const influencers = readInfluencersFallback();
      const index = influencers.findIndex((row) => row.id === id);
      if (index < 0) {
        return errorJson("Influencer not found", 404);
      }

      const current = influencers[index];
      const draft = generateOutreachDraft(current, step);
      const updated = normalizeInfluencer({
        ...current,
        draft_step: draft.step,
        draft_subject: draft.subject,
        draft_body: draft.body,
        draft_status: "pending_approval",
        outreach_stage: "approval_pending",
        draft_generated_at: isoNow(),
        approval_notes: body.approval_notes ?? current.approval_notes,
        id,
      });

      influencers[index] = updated;
      writeInfluencersFallback(influencers);

      await logActivity({
        entity_type: "influencer",
        entity_id: id,
        action: "draft_generated",
        new_value: updated,
      });

      return okJson(updated);
    }

    const lookup = await supabaseAdmin.from("influencer_pipeline").select("*").eq("id", id).single();
    if (lookup.error) {
      return errorJson("Failed to load influencer", 500, lookup.error.message);
    }

    if (!lookup.data) {
      return errorJson("Influencer not found", 404);
    }

    const current = normalizeInfluencer(lookup.data as Record<string, unknown>);
    const draft = generateOutreachDraft(current, step);

    let { data, error } = await supabaseAdmin
      .from("influencer_pipeline")
      .update({
        draft_step: draft.step,
        draft_subject: draft.subject,
        draft_body: draft.body,
        draft_status: "pending_approval",
        outreach_stage: "approval_pending",
        draft_generated_at: isoNow(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (isInfluencerSchemaMismatch(error)) {
      const legacyUpdate = stripModernInfluencerPayload({
        draft_step: draft.step,
        draft_subject: draft.subject,
        draft_body: draft.body,
      });

      if (Object.keys(legacyUpdate).length === 0) {
        return errorJson("Influencer outreach draft fields require migration 010", 409);
      }

      const retry = await supabaseAdmin
        .from("influencer_pipeline")
        .update(legacyUpdate)
        .eq("id", id)
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return errorJson("Failed to update influencer draft", 500, error.message);
    }

    const normalized = normalizeInfluencer((data ?? current) as Record<string, unknown>);
    await logActivity({
      entity_type: "influencer",
      entity_id: id,
      action: "draft_generated",
      new_value: normalized,
    });

    return okJson(normalized);
  } catch (err) {
    return errorJson("Failed to generate influencer draft", 500, String(err));
  }
}
