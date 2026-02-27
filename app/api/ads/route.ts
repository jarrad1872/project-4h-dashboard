import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import {
  adToDb,
  adToLegacyJson,
  hasSupabase,
  logActivity,
  normalizeAd,
  readFallback,
  statusToWorkflowStage,
} from "@/lib/server-utils";
import type { Ad, AdStatus, WorkflowStage } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

function readWorkflowOverrides() {
  return readFallback<Record<string, WorkflowStage>>(DataFiles.workflowStages, {});
}

function writeWorkflowOverride(id: string, workflowStage: WorkflowStage) {
  const current = readWorkflowOverrides();
  current[id] = workflowStage;
  writeJsonFile(DataFiles.workflowStages, current);
}

function applyWorkflowOverrides(rows: unknown[]) {
  const overrides = readWorkflowOverrides();
  return rows.map((row) => {
    const item = row as { id: string; workflow_stage?: WorkflowStage };
    return normalizeAd({
      ...item,
      workflow_stage: overrides[item.id] ?? item.workflow_stage,
    });
  });
}

function isWorkflowStageColumnMissing(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.code === "PGRST204" ||
        error.message?.includes("workflow_stage") ||
        error.message?.includes("schema cache")),
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    if (!hasSupabase()) {
      const fallbackAds = applyWorkflowOverrides(readFallback<any[]>(DataFiles.ads, []));
      const filtered = fallbackAds.filter((ad) => {
        const platformMatch = !platform || platform === "all" || ad.platform === platform;
        const statusMatch = !status || status === "all" || ad.status === status;
        return platformMatch && statusMatch;
      });
      return okJson(filtered);
    }

    let query = supabaseAdmin.from("ads").select("*").order("created_at", { ascending: false });

    if (platform && platform !== "all") {
      query = query.eq("platform", platform);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return errorJson("Failed to load ads", 500, error.message);
    }

    return okJson(applyWorkflowOverrides(data ?? []));
  } catch (error) {
    return errorJson("Failed to load ads", 500, String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<Ad>;

    const platform = payload.platform;
    const primaryText = payload.primary_text ?? payload.primaryText;
    const landingPath = payload.landing_path ?? payload.landingPath;

    if (!platform || !primaryText || !payload.cta || !landingPath) {
      return errorJson("platform, primary_text, cta, and landing_path are required", 400);
    }

    const id = payload.id ?? `${platform}-${Date.now()}`;
    const now = isoNow();
    const status = (payload.status ?? "pending") as AdStatus;
    const workflowStage = payload.workflow_stage ?? payload.workflowStage ?? statusToWorkflowStage(status);

    const ad: Ad = normalizeAd({
      id,
      platform,
      campaign_group: payload.campaign_group ?? payload.campaignGroup ?? "4h_custom",
      format: payload.format ?? "static1x1",
      primary_text: primaryText,
      headline: payload.headline ?? null,
      cta: payload.cta,
      landing_path: landingPath,
      utm_source: payload.utm_source ?? payload.utmSource ?? platform,
      utm_medium: payload.utm_medium ?? payload.utmMedium ?? "paid-social",
      utm_campaign: payload.utm_campaign ?? payload.utmCampaign ?? "4h_2026-03_custom",
      utm_content: payload.utm_content ?? payload.utmContent ?? "custom",
      utm_term: payload.utm_term ?? payload.utmTerm ?? "owners_1-10",
      status,
      workflow_stage: workflowStage,
      created_at: payload.created_at ?? payload.createdAt ?? now,
      updated_at: now,
      statusHistory: [{ status, at: now, note: "Created from dashboard" }],
    });

    if (!hasSupabase()) {
      const existing = readFallback<any[]>(DataFiles.ads, []).map(normalizeAd);
      if (existing.some((row) => row.id === ad.id)) {
        return errorJson(`Ad with id ${ad.id} already exists`, 409);
      }

      existing.unshift(ad);
      writeJsonFile(DataFiles.ads, existing.map(adToLegacyJson));

      await logActivity({
        entity_type: "ad",
        entity_id: ad.id,
        action: "created",
        new_value: ad,
      });

      return okJson(ad, 201);
    }

    let { error } = await supabaseAdmin.from("ads").insert(adToDb(ad));
    if (isWorkflowStageColumnMissing(error)) {
      const dbPayload = adToDb(ad);
      delete (dbPayload as Record<string, unknown>).workflow_stage;
      const retried = await supabaseAdmin.from("ads").insert(dbPayload);
      error = retried.error;
      if (!error) {
        writeWorkflowOverride(ad.id, ad.workflow_stage);
      }
    }

    if (error) {
      if (error.code === "23505") {
        return errorJson(`Ad with id ${ad.id} already exists`, 409);
      }
      return errorJson("Failed to create ad", 500, error.message);
    }

    await supabaseAdmin.from("ad_status_history").insert({
      ad_id: ad.id,
      status: ad.status,
      note: "Created from dashboard",
      changed_at: now,
    });

    await logActivity({
      entity_type: "ad",
      entity_id: ad.id,
      action: "created",
      new_value: ad,
    });

    return okJson(ad, 201);
  } catch (error) {
    return errorJson("Failed to create ad", 500, String(error));
  }
}
