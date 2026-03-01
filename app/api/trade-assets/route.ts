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
    asset_type: "hero_a" | "hero_b" | "og_nb2";
    image_url?: string;
    imageBase64?: string; // Optional: upload to storage
    notes?: string;
  };

  let imageUrl = body.image_url;

  // Handle base64 upload if provided
  if (body.imageBase64) {
    const buffer = Buffer.from(body.imageBase64, "base64");
    const fileName = `trade-heros/nb2/${body.trade_slug}-${body.asset_type.replace("_", "-")}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("ad-creatives")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) return errorJson(`Upload failed: ${uploadError.message}`, 500);

    const { data: urlData } = supabaseAdmin.storage
      .from("ad-creatives")
      .getPublicUrl(fileName);
      
    imageUrl = urlData.publicUrl;
  }

  if (!imageUrl) return errorJson("image_url or imageBase64 required", 400);

  const { data, error } = await supabaseAdmin
    .from("trade_assets")
    .upsert(
      { 
        trade_slug: body.trade_slug, 
        asset_type: body.asset_type, 
        image_url: imageUrl,
        status: "pending", 
        updated_at: new Date().toISOString() 
      },
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