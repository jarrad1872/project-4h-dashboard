import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { hasSupabase } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** PATCH /api/influencers/[id] — update an influencer entry */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      return errorJson("Supabase required for influencer pipeline", 503);
    }

    const { id } = await params;
    const body = await request.json();

    const validStatuses = ["identified", "contacted", "replied", "negotiating", "active", "declined"];
    if (body.status && !validStatuses.includes(body.status)) {
      return errorJson(`status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    // Only allow updating specific fields
    const update: Record<string, unknown> = {};
    if (body.status !== undefined) update.status = body.status;
    if (body.notes !== undefined) update.notes = body.notes;
    if (body.deal_page !== undefined) update.deal_page = body.deal_page;
    if (body.referral_code !== undefined) update.referral_code = body.referral_code;
    if (body.channel_url !== undefined) update.channel_url = body.channel_url;
    if (body.estimated_reach !== undefined) update.estimated_reach = body.estimated_reach;
    if (body.last_contact_at !== undefined) update.last_contact_at = body.last_contact_at;
    if (body.creator_name !== undefined) update.creator_name = body.creator_name;
    if (body.trade !== undefined) update.trade = body.trade;
    if (body.platform !== undefined) update.platform = body.platform;

    if (Object.keys(update).length === 0) {
      return errorJson("No fields to update", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("influencer_pipeline")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to update influencer", 500, error.message);
    }

    if (!data) {
      return errorJson("Influencer not found", 404);
    }

    return okJson(data);
  } catch (err) {
    return errorJson("Failed to update influencer", 500, String(err));
  }
}

/** DELETE /api/influencers/[id] — remove an influencer entry */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      return errorJson("Supabase required for influencer pipeline", 503);
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("influencer_pipeline")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to delete influencer", 500, error.message);
    }

    if (!data) {
      return errorJson("Influencer not found", 404);
    }

    return okJson({ ok: true, deleted: data });
  } catch (err) {
    return errorJson("Failed to delete influencer", 500, String(err));
  }
}
