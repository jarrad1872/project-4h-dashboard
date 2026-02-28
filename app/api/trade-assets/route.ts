import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tradeSlug = searchParams.get("trade_slug");
  const status = searchParams.get("status");

  if (!supabaseAdmin) {
    return errorJson("Supabase not configured", 503);
  }

  let query = supabaseAdmin.from("trade_assets").select("*").order("trade_slug").order("asset_type");
  if (tradeSlug) query = query.eq("trade_slug", tradeSlug);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return errorJson(error.message, 500);
  return okJson(data ?? []);
}

export async function POST(req: Request) {
  if (!supabaseAdmin) return errorJson("Supabase not configured", 503);

  const body = (await req.json()) as {
    trade_slug: string;
    asset_type: "hero" | "og";
    image_url?: string;
    notes?: string;
  };

  const { data, error } = await supabaseAdmin
    .from("trade_assets")
    .upsert(
      { ...body, status: "pending", updated_at: new Date().toISOString() },
      { onConflict: "trade_slug,asset_type" }
    )
    .select()
    .single();

  if (error) return errorJson(error.message, 500);
  return okJson(data);
}

export async function PATCH(req: Request) {
  if (!supabaseAdmin) return errorJson("Supabase not configured", 503);

  const body = (await req.json()) as {
    id: string;
    status?: "pending" | "approved" | "rejected";
    image_url?: string;
    notes?: string;
  };

  const { id, ...patch } = body;
  if (!id) return errorJson("id required", 400);

  const { data, error } = await supabaseAdmin
    .from("trade_assets")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return errorJson(error.message, 500);
  return okJson(data);
}
