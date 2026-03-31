import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { CreativeAsset, CreativeAssetPlatform, CreativeAssetStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: CreativeAssetStatus[] = ["draft", "review", "approved", "live"];
const VALID_PLATFORMS: CreativeAssetPlatform[] = ["linkedin", "youtube", "facebook", "instagram", "multi"];

export function OPTIONS() {
  return optionsResponse();
}

function normalizeCreativeAsset(input: Record<string, unknown>): CreativeAsset {
  return {
    id: String(input.id),
    trade_slug: String(input.trade_slug ?? "pipe"),
    title: String(input.title ?? "Untitled asset"),
    angle: (input.angle as CreativeAsset["angle"] | undefined) ?? "missed-call",
    tool_used: String(input.tool_used ?? "unknown"),
    status: (input.status as CreativeAssetStatus | undefined) ?? "draft",
    target_platform: (input.target_platform as CreativeAssetPlatform | undefined) ?? "multi",
    thumbnail_url: (input.thumbnail_url as string | null | undefined) ?? null,
    asset_url: (input.asset_url as string | null | undefined) ?? null,
    notes: (input.notes as string | null | undefined) ?? null,
    created_at: String(input.created_at ?? ""),
    updated_at: String(input.updated_at ?? input.created_at ?? ""),
  };
}

function readFallbackAssets() {
  return readFallback<Record<string, unknown>[]>(DataFiles.creativeAssets, []).map(normalizeCreativeAsset);
}

function writeFallbackAssets(assets: CreativeAsset[]) {
  writeJsonFile(DataFiles.creativeAssets, assets);
}

function isCreativeAssetsTableMissing(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.includes("creative_assets") ||
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
    const body = (await request.json()) as Record<string, unknown>;

    const update: Record<string, unknown> = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.trade_slug !== undefined) update.trade_slug = body.trade_slug;
    if (body.angle !== undefined) update.angle = body.angle;
    if (body.tool_used !== undefined) update.tool_used = body.tool_used;
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(String(body.status) as CreativeAssetStatus)) {
        return errorJson(`status must be one of: ${VALID_STATUSES.join(", ")}`, 400);
      }
      update.status = body.status;
    }
    if (body.target_platform !== undefined) {
      if (!VALID_PLATFORMS.includes(String(body.target_platform) as CreativeAssetPlatform)) {
        return errorJson(`target_platform must be one of: ${VALID_PLATFORMS.join(", ")}`, 400);
      }
      update.target_platform = body.target_platform;
    }
    if (body.thumbnail_url !== undefined) update.thumbnail_url = body.thumbnail_url;
    if (body.asset_url !== undefined) update.asset_url = body.asset_url;
    if (body.notes !== undefined) update.notes = body.notes;

    if (!Object.keys(update).length) {
      return errorJson("No fields to update", 400);
    }

    if (!hasSupabase()) {
      const assets = readFallbackAssets();
      const index = assets.findIndex((row) => row.id === id);
      if (index < 0) {
        return errorJson("Creative asset not found", 404);
      }

      const previous = assets[index];
      const next = normalizeCreativeAsset({ ...previous, ...update, id });
      assets[index] = next;
      writeFallbackAssets(assets);

      await logActivity({
        entity_type: "creative_asset",
        entity_id: id,
        action: "updated",
        old_value: previous,
        new_value: next,
      });

      return okJson(next);
    }

    const { data, error } = await supabaseAdmin.from("creative_assets").update(update).eq("id", id).select("*").single();
    if (error) {
      if (isCreativeAssetsTableMissing(error)) {
        const assets = readFallbackAssets();
        const index = assets.findIndex((row) => row.id === id);
        if (index < 0) {
          return errorJson("Creative asset not found", 404);
        }

        const next = normalizeCreativeAsset({ ...assets[index], ...update, id });
        assets[index] = next;
        writeFallbackAssets(assets);
        return okJson(next);
      }
      return errorJson("Failed to update creative asset", 500, error.message);
    }

    if (!data) {
      return errorJson("Creative asset not found", 404);
    }

    const normalized = normalizeCreativeAsset(data as Record<string, unknown>);
    await logActivity({
      entity_type: "creative_asset",
      entity_id: id,
      action: "updated",
      new_value: normalized,
    });

    return okJson(normalized);
  } catch (error) {
    return errorJson("Failed to update creative asset", 500, String(error));
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
      const assets = readFallbackAssets();
      const deleted = assets.find((row) => row.id === id);
      if (!deleted) {
        return errorJson("Creative asset not found", 404);
      }

      writeFallbackAssets(assets.filter((row) => row.id !== id));
      await logActivity({
        entity_type: "creative_asset",
        entity_id: id,
        action: "deleted",
        old_value: deleted,
      });

      return okJson({ ok: true, deleted });
    }

    const { data, error } = await supabaseAdmin.from("creative_assets").delete().eq("id", id).select("*").single();
    if (error) {
      if (isCreativeAssetsTableMissing(error)) {
        const assets = readFallbackAssets();
        const deleted = assets.find((row) => row.id === id);
        if (!deleted) {
          return errorJson("Creative asset not found", 404);
        }
        writeFallbackAssets(assets.filter((row) => row.id !== id));
        return okJson({ ok: true, deleted });
      }
      return errorJson("Failed to delete creative asset", 500, error.message);
    }

    if (!data) {
      return errorJson("Creative asset not found", 404);
    }

    const normalized = normalizeCreativeAsset(data as Record<string, unknown>);
    await logActivity({
      entity_type: "creative_asset",
      entity_id: id,
      action: "deleted",
      old_value: normalized,
    });

    return okJson({ ok: true, deleted: normalized });
  } catch (error) {
    return errorJson("Failed to delete creative asset", 500, String(error));
  }
}
