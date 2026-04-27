import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { CreativeAsset, CreativeAssetAngle, CreativeAssetPlatform, CreativeAssetStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: CreativeAssetStatus[] = ["draft", "review", "approved", "live"];
const VALID_PLATFORMS: CreativeAssetPlatform[] = ["linkedin", "youtube", "facebook", "instagram", "multi"];
const VALID_ANGLES: CreativeAssetAngle[] = ["missed-call", "demo-call", "owner-agent", "roi-math", "voice-boss", "demo", "math"];

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
    provider: (input.provider as string | null | undefined) ?? null,
    model: (input.model as string | null | undefined) ?? null,
    prompt_brief_id: (input.prompt_brief_id as string | null | undefined) ?? null,
    prompt_text: (input.prompt_text as string | null | undefined) ?? null,
    source_image_url: (input.source_image_url as string | null | undefined) ?? null,
    dimensions: (input.dimensions as string | null | undefined) ?? null,
    variant_id: (input.variant_id as string | null | undefined) ?? null,
    parent_asset_id: (input.parent_asset_id as string | null | undefined) ?? null,
    negative_prompt: (input.negative_prompt as string | null | undefined) ?? null,
    generation_status: (input.generation_status as string | null | undefined) ?? null,
    generation_error: (input.generation_error as string | null | undefined) ?? null,
    storage_path: (input.storage_path as string | null | undefined) ?? null,
    output_format: (input.output_format as string | null | undefined) ?? null,
    quality: (input.quality as string | null | undefined) ?? null,
    moderation: (input.moderation as string | null | undefined) ?? null,
    response_metadata: (input.response_metadata as Record<string, unknown> | null | undefined) ?? {},
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

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

async function uploadFileFromBase64(body: Record<string, unknown>, id: string) {
  if (!body.upload_base64 || !body.upload_file_name || !body.upload_target || !supabaseAdmin) {
    return {};
  }

  const buffer = Buffer.from(String(body.upload_base64), "base64");
  const fileName = safeFileName(String(body.upload_file_name));
  const uploadTarget = String(body.upload_target) === "thumbnail" ? "thumbnail" : "asset";
  const path = `creative-assets/${uploadTarget}/${id}-${Date.now()}-${fileName}`;

  const { error } = await supabaseAdmin.storage.from("ad-creatives").upload(path, buffer, {
    contentType: String(body.upload_content_type ?? "application/octet-stream"),
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from("ad-creatives").getPublicUrl(path);
  return uploadTarget === "thumbnail"
    ? { thumbnail_url: data.publicUrl, storage_path: path }
    : { asset_url: data.publicUrl, thumbnail_url: data.publicUrl, storage_path: path };
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
    const requestedStatus = body.status === undefined ? null : String(body.status);
    if (body.title !== undefined) update.title = body.title;
    if (body.trade_slug !== undefined) update.trade_slug = body.trade_slug;
    if (body.angle !== undefined) {
      if (!VALID_ANGLES.includes(String(body.angle) as CreativeAssetAngle)) {
        return errorJson(`angle must be one of: ${VALID_ANGLES.join(", ")}`, 400);
      }
      update.angle = body.angle;
    }
    if (body.tool_used !== undefined) update.tool_used = body.tool_used;
    if (body.provider !== undefined) update.provider = body.provider;
    if (body.model !== undefined) update.model = body.model;
    if (body.prompt_brief_id !== undefined) update.prompt_brief_id = body.prompt_brief_id;
    if (body.prompt_text !== undefined) update.prompt_text = body.prompt_text;
    if (body.source_image_url !== undefined) update.source_image_url = body.source_image_url;
    if (body.dimensions !== undefined) update.dimensions = body.dimensions;
    if (body.variant_id !== undefined) update.variant_id = body.variant_id;
    if (body.parent_asset_id !== undefined) update.parent_asset_id = body.parent_asset_id;
    if (body.negative_prompt !== undefined) update.negative_prompt = body.negative_prompt;
    if (body.generation_status !== undefined) update.generation_status = body.generation_status;
    if (body.generation_error !== undefined) update.generation_error = body.generation_error;
    if (body.storage_path !== undefined) update.storage_path = body.storage_path;
    if (body.output_format !== undefined) update.output_format = body.output_format;
    if (body.quality !== undefined) update.quality = body.quality;
    if (body.moderation !== undefined) update.moderation = body.moderation;
    if (body.response_metadata !== undefined) update.response_metadata = body.response_metadata;
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
      const hasUpload = Boolean(body.upload_base64 && body.upload_file_name && body.upload_target);
      if (!hasUpload) {
        return errorJson("No fields to update", 400);
      }
    }

    const uploadedUrls = hasSupabase() ? await uploadFileFromBase64(body, id) : {};
    Object.assign(update, uploadedUrls);

    if (!hasSupabase()) {
      const assets = readFallbackAssets();
      const index = assets.findIndex((row) => row.id === id);
      if (index < 0) {
        return errorJson("Creative asset not found", 404);
      }

      const previous = assets[index];
      if (requestedStatus === "live" && previous.status !== "approved") {
        return errorJson("Creative asset must be approved before it can be marked live", 400);
      }
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

    if (requestedStatus === "live") {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("creative_assets")
        .select("status")
        .eq("id", id)
        .single();

      if (existingError) {
        return errorJson("Failed to load creative asset before status change", 500, existingError.message);
      }
      if (!existing) {
        return errorJson("Creative asset not found", 404);
      }
      if (existing.status !== "approved") {
        return errorJson("Creative asset must be approved before it can be marked live", 400);
      }
    }

    const { data, error } = await supabaseAdmin.from("creative_assets").update(update).eq("id", id).select("*").single();
    if (error) {
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
