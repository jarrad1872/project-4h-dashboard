import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import {
  BEACHHEAD_IMAGE_TRADES,
  CHATGPT_IMAGE_MODEL,
  IMAGE_CREATIVE_ANGLES,
  IMAGE_CREATIVE_PLATFORMS,
  IMAGE_CREATIVE_PROVIDER,
  getImageCreativeBrief,
  listImageCreativeBriefs,
} from "@/lib/image-creative-briefs";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { CreativeAsset, CreativeAssetAngle, CreativeAssetPlatform, CreativeAssetStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return optionsResponse(request);
}

function normalizeCreativeAsset(input: Record<string, unknown>): CreativeAsset {
  const now = isoNow();
  return {
    id: String(input.id),
    trade_slug: String(input.trade_slug ?? "pipe"),
    title: String(input.title ?? "Untitled image concept"),
    angle: (input.angle as CreativeAssetAngle | undefined) ?? "missed-call",
    tool_used: String(input.tool_used ?? CHATGPT_IMAGE_MODEL),
    provider: (input.provider as string | null | undefined) ?? IMAGE_CREATIVE_PROVIDER,
    model: (input.model as string | null | undefined) ?? CHATGPT_IMAGE_MODEL,
    prompt_brief_id: (input.prompt_brief_id as string | null | undefined) ?? null,
    prompt_text: (input.prompt_text as string | null | undefined) ?? null,
    source_image_url: (input.source_image_url as string | null | undefined) ?? null,
    dimensions: (input.dimensions as string | null | undefined) ?? null,
    variant_id: (input.variant_id as string | null | undefined) ?? null,
    parent_asset_id: (input.parent_asset_id as string | null | undefined) ?? null,
    negative_prompt: (input.negative_prompt as string | null | undefined) ?? null,
    generation_status: (input.generation_status as string | null | undefined) ?? "brief",
    generation_error: (input.generation_error as string | null | undefined) ?? null,
    storage_path: (input.storage_path as string | null | undefined) ?? null,
    output_format: (input.output_format as string | null | undefined) ?? "png",
    quality: (input.quality as string | null | undefined) ?? "medium",
    moderation: (input.moderation as string | null | undefined) ?? "auto",
    response_metadata: (input.response_metadata as Record<string, unknown> | null | undefined) ?? {},
    status: (input.status as CreativeAssetStatus | undefined) ?? "draft",
    target_platform: (input.target_platform as CreativeAssetPlatform | undefined) ?? "multi",
    thumbnail_url: null,
    asset_url: null,
    notes: (input.notes as string | null | undefined) ?? null,
    created_at: String(input.created_at ?? now),
    updated_at: String(input.updated_at ?? now),
  };
}

function readFallbackAssets() {
  return readFallback<Record<string, unknown>[]>(DataFiles.creativeAssets, []).map(normalizeCreativeAsset);
}

function writeFallbackAssets(assets: CreativeAsset[]) {
  writeJsonFile(DataFiles.creativeAssets, assets);
}

function isNewPromptConcept(concept: CreativeAsset, existingPromptIds: Set<string>) {
  return concept.prompt_brief_id !== null && !existingPromptIds.has(concept.prompt_brief_id);
}

function buildConceptFromBrief(input: {
  brief: ReturnType<typeof getImageCreativeBrief>;
  title?: unknown;
  notes?: unknown;
  source_image_url?: unknown;
  variant_id?: unknown;
}) {
  const { brief } = input;
  const variantId = String(input.variant_id ?? `${brief.id}-${Date.now()}`);

  return normalizeCreativeAsset({
    id: crypto.randomUUID(),
    trade_slug: brief.trade_slug,
    title: input.title ?? brief.title,
    angle: brief.angle,
    target_platform: brief.platform,
    tool_used: CHATGPT_IMAGE_MODEL,
    provider: IMAGE_CREATIVE_PROVIDER,
    model: CHATGPT_IMAGE_MODEL,
    prompt_brief_id: brief.id,
    prompt_text: brief.prompt,
    negative_prompt: brief.negative_prompt,
    dimensions: brief.dimensions,
    variant_id: variantId,
    generation_status: "brief",
    output_format: "png",
    quality: "medium",
    moderation: "auto",
    response_metadata: { production_mode: "manual_chatgpt_pro" },
    source_image_url: input.source_image_url ?? null,
    notes: input.notes ?? "Draft image prompt for manual ChatGPT Pro generation. Upload the generated asset here after review.",
  });
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") as CreativeAssetPlatform | null;

  return okJson({
    model: CHATGPT_IMAGE_MODEL,
    provider: IMAGE_CREATIVE_PROVIDER,
    briefs: listImageCreativeBriefs({
      trade_slug: searchParams.get("trade_slug"),
      angle: searchParams.get("angle"),
      platform: platform && IMAGE_CREATIVE_PLATFORMS.includes(platform) ? platform : null,
    }),
  }, 200, request);
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const isBatch = body.batch === true;
    const tradeSlug = String(body.trade_slug ?? "pipe");
    const angle = String(body.angle ?? "missed-call") as CreativeAssetAngle;
    const targetPlatform = String(body.target_platform ?? "multi") as CreativeAssetPlatform;

    if (!IMAGE_CREATIVE_PLATFORMS.includes(targetPlatform)) {
      return errorJson(`target_platform must be one of: ${IMAGE_CREATIVE_PLATFORMS.join(", ")}`, 400, undefined, request);
    }

    if (isBatch) {
      const briefs = listImageCreativeBriefs({ platform: targetPlatform });
      const concepts = briefs.map((brief) => buildConceptFromBrief({ brief }));
      const promptIds = concepts
        .map((concept) => concept.prompt_brief_id)
        .filter((promptId): promptId is string => Boolean(promptId));

      if (!hasSupabase()) {
        const assets = readFallbackAssets();
        const existingPromptIds = new Set(
          assets.map((asset) => asset.prompt_brief_id).filter((promptId): promptId is string => Boolean(promptId)),
        );
        const created = concepts.filter((concept) => isNewPromptConcept(concept, existingPromptIds));
        writeFallbackAssets([...created, ...assets]);
        return okJson({
          created,
          skipped: promptIds.filter((id) => existingPromptIds.has(id)),
        }, created.length ? 201 : 200, request);
      }

      const { data: existingRows, error: existingError } = await supabaseAdmin
        .from("creative_assets")
        .select("prompt_brief_id")
        .in("prompt_brief_id", promptIds);

      if (existingError) {
        return errorJson("Failed to check existing image concepts", 500, existingError.message, request);
      }

      const existingPromptIds = new Set(
        (existingRows ?? []).map((row) => String((row as Record<string, unknown>).prompt_brief_id)).filter(Boolean),
      );
      const created = concepts.filter((concept) => isNewPromptConcept(concept, existingPromptIds));

      if (!created.length) {
        return okJson({ created: [], skipped: promptIds }, 200, request);
      }

      const { data, error } = await supabaseAdmin.from("creative_assets").insert(created).select("*");
      if (error) {
        return errorJson("Failed to save image concept set", 500, error.message, request);
      }

      const saved = (data ?? created).map((row) => normalizeCreativeAsset(row as Record<string, unknown>));
      await logActivity({
        entity_type: "creative_asset",
        entity_id: "beachhead_prompt_set",
        action: "image_concept_set_created",
        new_value: { count: saved.length, target_platform: targetPlatform },
      });

      return okJson({
        created: saved,
        skipped: promptIds.filter((id) => existingPromptIds.has(id)),
      }, 201, request);
    }

    if (!BEACHHEAD_IMAGE_TRADES.some((trade) => trade.slug === tradeSlug)) {
      return errorJson(
        `trade_slug must be one of: ${BEACHHEAD_IMAGE_TRADES.map((trade) => trade.slug).join(", ")}`,
        400,
        undefined,
        request,
      );
    }

    if (!IMAGE_CREATIVE_ANGLES.includes(angle as (typeof IMAGE_CREATIVE_ANGLES)[number])) {
      return errorJson(`angle must be one of: ${IMAGE_CREATIVE_ANGLES.join(", ")}`, 400, undefined, request);
    }

    const brief = getImageCreativeBrief({
      trade_slug: tradeSlug,
      angle: angle as (typeof IMAGE_CREATIVE_ANGLES)[number],
      platform: targetPlatform,
    });
    const concept = buildConceptFromBrief({
      brief,
      title: body.title,
      notes: body.notes,
      source_image_url: body.source_image_url,
      variant_id: body.variant_id,
    });

    if (!hasSupabase()) {
      const assets = readFallbackAssets();
      assets.unshift(concept);
      writeFallbackAssets(assets);
      return okJson(concept, 201, request);
    }

    const { data, error } = await supabaseAdmin.from("creative_assets").insert(concept).select("*").single();
    if (error) {
      return errorJson("Failed to save image concept", 500, error.message, request);
    }

    const saved = normalizeCreativeAsset((data ?? concept) as Record<string, unknown>);
    await logActivity({
      entity_type: "creative_asset",
      entity_id: saved.id,
      action: "image_concept_created",
      new_value: saved,
    });

    return okJson(saved, 201, request);
  } catch (error) {
    return errorJson("Failed to create image concept", 500, String(error), request);
  }
}
