import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { hasSupabase } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** GET /api/influencers — list influencer pipeline entries */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      return errorJson("Supabase required for influencer pipeline", 503);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

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

    return okJson(data ?? []);
  } catch (err) {
    return errorJson("Failed to load influencers", 500, String(err));
  }
}

/** POST /api/influencers — add a new influencer to the pipeline */
export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      return errorJson("Supabase required for influencer pipeline", 503);
    }

    const body = await request.json();

    if (!body.creator_name || !body.trade || !body.platform) {
      return errorJson("creator_name, trade, and platform are required", 400);
    }

    const validStatuses = ["identified", "contacted", "replied", "negotiating", "active", "declined"];
    const status = body.status || "identified";
    if (!validStatuses.includes(status)) {
      return errorJson(`status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const row = {
      creator_name: body.creator_name,
      trade: body.trade,
      platform: body.platform,
      channel_url: body.channel_url || null,
      estimated_reach: body.estimated_reach || null,
      status,
      deal_page: body.deal_page || null,
      referral_code: body.referral_code || null,
      notes: body.notes || null,
      last_contact_at: body.last_contact_at || null,
    };

    const { data, error } = await supabaseAdmin
      .from("influencer_pipeline")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to create influencer", 500, error.message);
    }

    return okJson(data, 201);
  } catch (err) {
    return errorJson("Failed to create influencer", 500, String(err));
  }
}
