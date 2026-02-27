import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { adToLegacyJson, hasSupabase, logActivity, normalizeAd, readFallback, statusToWorkflowStage } from "@/lib/server-utils";
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

function isWorkflowStageColumnMissing(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.code === "PGRST204" ||
        error.message?.includes("workflow_stage") ||
        error.message?.includes("schema cache")),
  );
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const workflowOverrides = readWorkflowOverrides();

    if (!hasSupabase()) {
      const ads = readFallback<any[]>(DataFiles.ads, []).map((item) =>
        normalizeAd({
          ...item,
          workflow_stage: workflowOverrides[item.id] ?? item.workflow_stage,
        }),
      );
      const ad = ads.find((item) => item.id === id);
      if (!ad) {
        return errorJson("Ad not found", 404);
      }
      return okJson(ad);
    }

    const { data, error } = await supabaseAdmin
      .from("ads")
      .select("*, ad_status_history(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return errorJson("Failed to load ad", 500, error.message);
    }

    if (!data) {
      return errorJson("Ad not found", 404);
    }

    return okJson(
      normalizeAd({
        ...data,
        workflow_stage: workflowOverrides[data.id] ?? data.workflow_stage,
      }),
    );
  } catch (error) {
    return errorJson("Failed to load ad", 500, String(error));
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as Partial<Ad>;

    if (!hasSupabase()) {
      const workflowOverrides = readWorkflowOverrides();
      const ads = readFallback<any[]>(DataFiles.ads, []).map((item) =>
        normalizeAd({
          ...item,
          workflow_stage: workflowOverrides[item.id] ?? item.workflow_stage,
        }),
      );
      const index = ads.findIndex((item) => item.id === id);
      if (index < 0) {
        return errorJson("Ad not found", 404);
      }

      const previous = ads[index];
      const nextStatus = (payload.status ?? previous.status) as AdStatus;
      const next = normalizeAd({
        ...previous,
        ...payload,
        campaign_group: payload.campaign_group ?? payload.campaignGroup ?? previous.campaign_group,
        primary_text: payload.primary_text ?? payload.primaryText ?? previous.primary_text,
        landing_path: payload.landing_path ?? payload.landingPath ?? previous.landing_path,
        utm_source: payload.utm_source ?? payload.utmSource ?? previous.utm_source,
        utm_medium: payload.utm_medium ?? payload.utmMedium ?? previous.utm_medium,
        utm_campaign: payload.utm_campaign ?? payload.utmCampaign ?? previous.utm_campaign,
        utm_content: payload.utm_content ?? payload.utmContent ?? previous.utm_content,
        utm_term: payload.utm_term ?? payload.utmTerm ?? previous.utm_term,
        workflow_stage:
          payload.workflow_stage ??
          payload.workflowStage ??
          (payload.status && payload.status !== previous.status ? statusToWorkflowStage(nextStatus) : previous.workflow_stage),
        updated_at: isoNow(),
      });

      if (payload.status && payload.status !== previous.status) {
        next.statusHistory = [
          ...(previous.statusHistory ?? []),
          {
            status: payload.status as AdStatus,
            at: isoNow(),
            note: payload.status === "approved" ? "Approved from detail view" : "Status changed",
          },
        ];
      }

      ads[index] = next;
      writeJsonFile(DataFiles.ads, ads.map(adToLegacyJson));

      await logActivity({
        entity_type: "ad",
        entity_id: id,
        action: "updated",
        old_value: previous,
        new_value: next,
      });

      return okJson(next);
    }

    const { data: currentRow, error: currentError } = await supabaseAdmin
      .from("ads")
      .select("*, ad_status_history(*)")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      return errorJson("Failed to load ad", 500, currentError.message);
    }

    if (!currentRow) {
      return errorJson("Ad not found", 404);
    }

    const workflowOverrides = readWorkflowOverrides();
    const current = normalizeAd({
      ...currentRow,
      workflow_stage: workflowOverrides[id] ?? currentRow.workflow_stage,
    });

    const updatePayload: Record<string, unknown> = {};
    const setIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) updatePayload[key] = value;
    };

    setIfDefined("platform", payload.platform);
    setIfDefined("campaign_group", payload.campaign_group ?? payload.campaignGroup);
    setIfDefined("format", payload.format);
    setIfDefined("primary_text", payload.primary_text ?? payload.primaryText);
    setIfDefined("headline", payload.headline);
    setIfDefined("cta", payload.cta);
    setIfDefined("landing_path", payload.landing_path ?? payload.landingPath);
    setIfDefined("utm_source", payload.utm_source ?? payload.utmSource);
    setIfDefined("utm_medium", payload.utm_medium ?? payload.utmMedium);
    setIfDefined("utm_campaign", payload.utm_campaign ?? payload.utmCampaign);
    setIfDefined("utm_content", payload.utm_content ?? payload.utmContent);
    setIfDefined("utm_term", payload.utm_term ?? payload.utmTerm);
    setIfDefined("status", payload.status);
    setIfDefined(
      "workflow_stage",
      payload.workflow_stage ??
        payload.workflowStage ??
        (payload.status && payload.status !== current.status ? statusToWorkflowStage(payload.status) : undefined),
    );

    const workflowOverride =
      (payload.workflow_stage ??
        payload.workflowStage ??
        (payload.status && payload.status !== current.status ? statusToWorkflowStage(payload.status) : undefined)) as
        | WorkflowStage
        | undefined;

    if (Object.keys(updatePayload).length > 0) {
      let { error: updateError } = await supabaseAdmin.from("ads").update(updatePayload).eq("id", id);

      if (isWorkflowStageColumnMissing(updateError) && "workflow_stage" in updatePayload) {
        const payloadWithoutWorkflow = { ...updatePayload };
        delete payloadWithoutWorkflow.workflow_stage;

        if (Object.keys(payloadWithoutWorkflow).length > 0) {
          const retried = await supabaseAdmin.from("ads").update(payloadWithoutWorkflow).eq("id", id);
          updateError = retried.error;
        } else {
          updateError = null;
        }

        if (!updateError && workflowOverride) {
          writeWorkflowOverride(id, workflowOverride);
        }
      } else if (!updateError && workflowOverride) {
        writeWorkflowOverride(id, workflowOverride);
      }

      if (updateError) {
        return errorJson("Failed to update ad", 500, updateError.message);
      }
    }

    if (payload.status && payload.status !== current.status) {
      await supabaseAdmin.from("ad_status_history").insert({
        ad_id: id,
        status: payload.status,
        note: payload.status === "approved" ? "Approved from detail view" : "Status changed",
      });
    }

    const { data: updatedRow, error: updatedError } = await supabaseAdmin
      .from("ads")
      .select("*, ad_status_history(*)")
      .eq("id", id)
      .maybeSingle();

    if (updatedError || !updatedRow) {
      return errorJson("Failed to load updated ad", 500, updatedError?.message ?? "Unknown error");
    }

    const overrides = readWorkflowOverrides();
    const updated = normalizeAd({
      ...updatedRow,
      workflow_stage: overrides[id] ?? updatedRow.workflow_stage,
    });

    await logActivity({
      entity_type: "ad",
      entity_id: id,
      action: payload.status && payload.status !== current.status ? "status_changed" : "updated",
      old_value: current,
      new_value: updated,
    });

    return okJson(updated);
  } catch (error) {
    return errorJson("Failed to update ad", 500, String(error));
  }
}
