import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { campaignConfigToData, hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { CampaignConfig, CampaignStatusData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const status = readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
        status: "pre-launch",
        startDate: null,
        linkedinStatus: "ready",
        youtubeStatus: "ready",
        facebookStatus: "ready",
        instagramStatus: "ready",
      });
      return okJson(status);
    }

    const { data, error } = await supabaseAdmin.from("campaign_config").select("*").eq("id", 1).single();

    if (error) {
      return errorJson("Failed to load campaign status", 500, error.message);
    }

    return okJson(campaignConfigToData(data as CampaignConfig));
  } catch (error) {
    return errorJson("Failed to load campaign status", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as Partial<CampaignStatusData> & Partial<CampaignConfig>;

    if (!hasSupabase()) {
      const current = readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
        status: "pre-launch",
        startDate: null,
        linkedinStatus: "ready",
        youtubeStatus: "ready",
        facebookStatus: "ready",
        instagramStatus: "ready",
      });

      const next: CampaignStatusData = {
        ...current,
        status: (payload.status ?? current.status) as CampaignStatusData["status"],
        startDate: (payload.startDate ?? payload.start_date ?? current.startDate) as string | null,
        linkedinStatus: (payload.linkedinStatus ?? payload.linkedin_status ?? current.linkedinStatus) as CampaignStatusData["linkedinStatus"],
        youtubeStatus: (payload.youtubeStatus ?? payload.youtube_status ?? current.youtubeStatus) as CampaignStatusData["youtubeStatus"],
        facebookStatus: (payload.facebookStatus ?? payload.facebook_status ?? current.facebookStatus) as CampaignStatusData["facebookStatus"],
        instagramStatus: (payload.instagramStatus ?? payload.instagram_status ?? current.instagramStatus) as CampaignStatusData["instagramStatus"],
        updatedAt: isoNow(),
      };

      writeJsonFile(DataFiles.campaignStatus, next);

      await logActivity({
        entity_type: "campaign",
        entity_id: "1",
        action: "updated",
        old_value: current,
        new_value: next,
      });

      return okJson(next);
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("campaign_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (existingError) {
      return errorJson("Failed to load campaign status", 500, existingError.message);
    }

    const updatePayload: Record<string, unknown> = {};
    if (payload.status !== undefined) updatePayload.status = payload.status;
    if (payload.startDate !== undefined || payload.start_date !== undefined) {
      updatePayload.start_date = payload.startDate ?? payload.start_date;
    }
    if (payload.linkedinStatus !== undefined || payload.linkedin_status !== undefined) {
      updatePayload.linkedin_status = payload.linkedinStatus ?? payload.linkedin_status;
    }
    if (payload.youtubeStatus !== undefined || payload.youtube_status !== undefined) {
      updatePayload.youtube_status = payload.youtubeStatus ?? payload.youtube_status;
    }
    if (payload.facebookStatus !== undefined || payload.facebook_status !== undefined) {
      updatePayload.facebook_status = payload.facebookStatus ?? payload.facebook_status;
    }
    if (payload.instagramStatus !== undefined || payload.instagram_status !== undefined) {
      updatePayload.instagram_status = payload.instagramStatus ?? payload.instagram_status;
    }
    if (payload.total_budget !== undefined) updatePayload.total_budget = payload.total_budget;
    if (payload.updated_at !== undefined) updatePayload.updated_at = payload.updated_at;

    const { data, error } = await supabaseAdmin
      .from("campaign_config")
      .update(updatePayload)
      .eq("id", 1)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to update campaign status", 500, error.message);
    }

    await logActivity({
      entity_type: "campaign",
      entity_id: "1",
      action: "updated",
      old_value: existing,
      new_value: data,
    });

    return okJson(campaignConfigToData(data as CampaignConfig));
  } catch (error) {
    return errorJson("Failed to update campaign status", 500, String(error));
  }
}
