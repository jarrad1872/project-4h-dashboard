import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeTemplate, readFallback } from "@/lib/server-utils";
import type { AdTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

function readTemplatesFallback() {
  return readFallback<unknown[]>(DataFiles.templates, []).map(normalizeTemplate);
}

function saveTemplateFallback(template: AdTemplate) {
  const templates = readTemplatesFallback();
  templates.unshift(template);
  writeJsonFile(DataFiles.templates, templates);
}

function isMissingTemplatesTable(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.includes("ad_templates") ||
        error.message?.includes("schema cache")),
  );
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      return okJson(readTemplatesFallback());
    }

    const { data, error } = await supabaseAdmin.from("ad_templates").select("*").order("created_at", { ascending: false });
    if (error) {
      if (isMissingTemplatesTable(error)) {
        return okJson(readTemplatesFallback());
      }
      return errorJson("Failed to load templates", 500, error.message);
    }

    return okJson((data ?? []).map(normalizeTemplate));
  } catch (error) {
    return errorJson("Failed to load templates", 500, String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<AdTemplate>;
    const name = payload.name?.trim();
    const platform = payload.platform;

    if (!name || !platform) {
      return errorJson("name and platform are required", 400);
    }

    const template = normalizeTemplate({
      id: payload.id ?? crypto.randomUUID(),
      name,
      platform,
      format: payload.format ?? null,
      primary_text: payload.primary_text ?? payload.primaryText ?? "",
      headline: payload.headline ?? null,
      cta: payload.cta ?? null,
      landing_path: payload.landing_path ?? payload.landingPath ?? "",
      utm_campaign: payload.utm_campaign ?? payload.utmCampaign ?? "",
      created_at: payload.created_at ?? payload.createdAt ?? isoNow(),
    });

    if (!hasSupabase()) {
      saveTemplateFallback(template);

      await logActivity({
        entity_type: "template",
        entity_id: template.id,
        action: "created",
        new_value: template,
      });

      return okJson(template, 201);
    }

    const { error } = await supabaseAdmin.from("ad_templates").insert({
      id: template.id,
      name: template.name,
      platform: template.platform,
      format: template.format,
      primary_text: template.primary_text,
      headline: template.headline,
      cta: template.cta,
      landing_path: template.landing_path,
      utm_campaign: template.utm_campaign,
      created_at: template.created_at,
    });

    if (error) {
      if (isMissingTemplatesTable(error)) {
        saveTemplateFallback(template);
      } else {
        return errorJson("Failed to save template", 500, error.message);
      }
    }

    await logActivity({
      entity_type: "template",
      entity_id: template.id,
      action: "created",
      new_value: template,
    });

    return okJson(template, 201);
  } catch (error) {
    return errorJson("Failed to save template", 500, String(error));
  }
}
