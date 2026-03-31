import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, writeJsonFile } from "@/lib/file-db";
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
    created_at: String(input.created_at ?? ""),
    updated_at: String(input.updated_at ?? input.created_at ?? ""),
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status && !VALID_STATUSES.has(normalizeInfluencerStatus(body.status))) {
      return errorJson(`status must be one of: ${Array.from(VALID_STATUSES).join(", ")}`, 400);
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
      const legacyUpdate = { ...update };
      delete legacyUpdate.audience_size;
      delete legacyUpdate.flat_fee_amount;
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
