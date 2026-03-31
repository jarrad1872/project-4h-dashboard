import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity } from "@/lib/server-utils";
import type {
  CreativeAsset,
  CreativeAssetAngle,
  CreativeAssetPlatform,
  CreativeAssetStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: CreativeAssetStatus[] = ["draft", "review", "approved", "live"];
const VALID_ANGLES: CreativeAssetAngle[] = ["missed-call", "voice-boss", "demo", "math"];
const VALID_PLATFORMS: CreativeAssetPlatform[] = ["linkedin", "youtube", "facebook", "instagram", "multi"];

export function OPTIONS() {
  return optionsResponse();
}

function normalizeCreativeAsset(input: Record<string, unknown>): CreativeAsset {
  return {
    id: String(input.id),
    trade_slug: String(input.trade_slug ?? "pipe"),
    title: String(input.title ?? "Untitled asset"),
    angle: (input.angle as CreativeAssetAngle | null | undefined) ?? "missed-call",
    tool_used: String(input.tool_used ?? "unknown"),
    status: (input.status as CreativeAssetStatus | null | undefined) ?? "draft",
    target_platform: (input.target_platform as CreativeAssetPlatform | null | undefined) ?? "multi",
    thumbnail_url: (input.thumbnail_url as string | null | undefined) ?? null,
    asset_url: (input.asset_url as string | null | undefined) ?? null,
    notes: (input.notes as string | null | undefined) ?? null,
    created_at: String(input.created_at ?? isoNow()),
    updated_at: String(input.updated_at ?? input.created_at ?? isoNow()),
  };
}

function readFallbackAssets() {
  try {
    return readJsonFile<Record<string, unknown>[]>(DataFiles.creativeAssets).map(normalizeCreativeAsset);
  } catch {
    return [];
  }
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

function isValidValue<T extends string>(value: string | undefined, validValues: T[]): value is T {
  return Boolean(value && validValues.includes(value as T));
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

async function uploadFileFromBase64(body: Record<string, unknown>) {
  if (!body.upload_base64 || !body.upload_file_name || !body.upload_target || !supabaseAdmin) {
    return {};
  }

  const buffer = Buffer.from(String(body.upload_base64), "base64");
  const fileName = safeFileName(String(body.upload_file_name));
  const uploadTarget = String(body.upload_target) === "thumbnail" ? "thumbnail" : "asset";
  const path = `creative-assets/${uploadTarget}/${Date.now()}-${fileName}`;

  const { error } = await supabaseAdmin.storage.from("ad-creatives").upload(path, buffer, {
    contentType: String(body.upload_content_type ?? "application/octet-stream"),
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from("ad-creatives").getPublicUrl(path);
  return uploadTarget === "thumbnail" ? { thumbnail_url: data.publicUrl } : { asset_url: data.publicUrl };
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const tradeSlug = searchParams.get("trade_slug");
    const status = searchParams.get("status");

    if (!hasSupabase()) {
      const rows = readFallbackAssets();
      const filtered = rows.filter((asset) => {
        const tradeMatch = !tradeSlug || asset.trade_slug === tradeSlug;
        const statusMatch = !status || asset.status === status;
        return tradeMatch && statusMatch;
      });
      return okJson(filtered);
    }

    let query = supabaseAdmin.from("creative_assets").select("*").order("updated_at", { ascending: false });
    if (tradeSlug) query = query.eq("trade_slug", tradeSlug);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      if (isCreativeAssetsTableMissing(error)) {
        return okJson(readFallbackAssets());
      }
      return errorJson("Failed to load creative assets", 500, error.message);
    }

    return okJson((data ?? []).map((row) => normalizeCreativeAsset(row as Record<string, unknown>)));
  } catch (error) {
    return errorJson("Failed to load creative assets", 500, String(error));
  }
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const uploadedUrls = hasSupabase() ? await uploadFileFromBase64(body) : {};

    const status = String(body.status ?? "draft");
    const angle = String(body.angle ?? "missed-call");
    const targetPlatform = String(body.target_platform ?? "multi");

    if (!body.title || !body.tool_used) {
      return errorJson("title and tool_used are required", 400);
    }
    if (!isValidValue(status, VALID_STATUSES)) {
      return errorJson(`status must be one of: ${VALID_STATUSES.join(", ")}`, 400);
    }
    if (!isValidValue(angle, VALID_ANGLES)) {
      return errorJson(`angle must be one of: ${VALID_ANGLES.join(", ")}`, 400);
    }
    if (!isValidValue(targetPlatform, VALID_PLATFORMS)) {
      return errorJson(`target_platform must be one of: ${VALID_PLATFORMS.join(", ")}`, 400);
    }

    const row = normalizeCreativeAsset({
      id: body.id ?? crypto.randomUUID(),
      trade_slug: body.trade_slug ?? "pipe",
      title: body.title,
      angle,
      tool_used: body.tool_used,
      status,
      target_platform: targetPlatform,
      thumbnail_url: body.thumbnail_url ?? uploadedUrls.thumbnail_url ?? null,
      asset_url: body.asset_url ?? uploadedUrls.asset_url ?? null,
      notes: body.notes ?? null,
      created_at: isoNow(),
      updated_at: isoNow(),
    });

    if (!hasSupabase()) {
      const assets = readFallbackAssets();
      assets.unshift(row);
      writeFallbackAssets(assets);

      await logActivity({
        entity_type: "creative_asset",
        entity_id: row.id,
        action: "created",
        new_value: row,
      });

      return okJson(row, 201);
    }

    const { data, error } = await supabaseAdmin.from("creative_assets").insert(row).select("*").single();
    if (error) {
      if (isCreativeAssetsTableMissing(error)) {
        const assets = readFallbackAssets();
        assets.unshift(row);
        writeFallbackAssets(assets);
        return okJson(row, 201);
      }
      return errorJson("Failed to create creative asset", 500, error.message);
    }

    const normalized = normalizeCreativeAsset((data ?? row) as Record<string, unknown>);
    await logActivity({
      entity_type: "creative_asset",
      entity_id: normalized.id,
      action: "created",
      new_value: normalized,
    });

    return okJson(normalized, 201);
  } catch (error) {
    return errorJson("Failed to create creative asset", 500, String(error));
  }
}
