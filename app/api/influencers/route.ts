import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { formatAudienceSize, normalizeAudienceSize, normalizeInfluencerStatus } from "@/lib/growth-command-center";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { Influencer, InfluencerStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<InfluencerStatus>([
  "researching",
  "contacted",
  "negotiating",
  "contracted",
  "content_live",
  "paid",
  "declined",
]);

export function OPTIONS() {
  return optionsResponse();
}

function normalizeInfluencer(input: Record<string, unknown>): Influencer {
  const audienceSize = normalizeAudienceSize(
    typeof input.audience_size === "number" ? input.audience_size : null,
    typeof input.estimated_reach === "string" ? input.estimated_reach : null,
  );

  return {
    id: String(input.id),
    creator_name: String(input.creator_name ?? ""),
    trade: String(input.trade ?? ""),
    platform: String(input.platform ?? ""),
    channel_url: (input.channel_url as string | null | undefined) ?? null,
    audience_size: audienceSize,
    estimated_reach: (input.estimated_reach as string | null | undefined) ?? (audienceSize ? formatAudienceSize(audienceSize) : null),
    status: normalizeInfluencerStatus(input.status as string | null | undefined),
    flat_fee_amount:
      typeof input.flat_fee_amount === "number" && Number.isFinite(input.flat_fee_amount)
        ? input.flat_fee_amount
        : null,
    deal_page: (input.deal_page as string | null | undefined) ?? null,
    referral_code: (input.referral_code as string | null | undefined) ?? null,
    notes: (input.notes as string | null | undefined) ?? null,
    last_contact_at: (input.last_contact_at as string | null | undefined) ?? null,
    created_at: String(input.created_at ?? isoNow()),
    updated_at: String(input.updated_at ?? input.created_at ?? isoNow()),
  };
}

function readInfluencersFallback() {
  return readFallback<Record<string, unknown>[]>(DataFiles.influencers, []).map(normalizeInfluencer);
}

function writeInfluencersFallback(influencers: Influencer[]) {
  writeJsonFile(DataFiles.influencers, influencers);
}

function isInfluencerSchemaMismatch(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.code === "PGRST204" ||
        error.message?.includes("audience_size") ||
        error.message?.includes("flat_fee_amount") ||
        error.message?.includes("schema cache")),
  );
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
    if (!VALID_STATUSES.has(status)) {
      return errorJson(`status must be one of: ${Array.from(VALID_STATUSES).join(", ")}`, 400);
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

    const insertPayload = {
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
    };

    let { data, error } = await supabaseAdmin.from("influencer_pipeline").insert(insertPayload).select("*").single();

    if (isInfluencerSchemaMismatch(error)) {
      const legacyPayload = {
        creator_name: row.creator_name,
        trade: row.trade,
        platform: row.platform,
        channel_url: row.channel_url,
        estimated_reach: row.estimated_reach,
        status: row.status,
        deal_page: row.deal_page,
        referral_code: row.referral_code,
        notes: row.notes,
        last_contact_at: row.last_contact_at,
      };

      const retry = await supabaseAdmin.from("influencer_pipeline").insert(legacyPayload).select("*").single();
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
