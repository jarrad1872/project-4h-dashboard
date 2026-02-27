import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { campaignConfigToData, hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { CampaignConfig, CampaignStatusData } from "@/lib/types";

export const dynamic = "force-dynamic";

const validChannels = ["linkedin", "youtube", "facebook", "instagram", "all"] as const;

type PauseChannel = (typeof validChannels)[number];

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { channel?: PauseChannel };
    const channel = payload.channel;

    if (!channel || !validChannels.includes(channel)) {
      return errorJson("channel is required", 400);
    }

    if (!hasSupabase()) {
      const current = readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
        status: "pre-launch",
        startDate: null,
        linkedinStatus: "ready",
        youtubeStatus: "ready",
        facebookStatus: "ready",
        instagramStatus: "ready",
      });

      const next = { ...current };
      if (channel === "all") {
        next.linkedinStatus = "paused";
        next.youtubeStatus = "paused";
        next.facebookStatus = "paused";
        next.instagramStatus = "paused";
        next.status = "paused";
      } else {
        const key = `${channel}Status` as const;
        next[key] = "paused";
      }
      next.updatedAt = isoNow();

      writeJsonFile(DataFiles.campaignStatus, next);

      await logActivity({
        entity_type: "campaign",
        entity_id: "1",
        action: "paused",
        old_value: current,
        new_value: next,
        note: `Channel: ${channel}`,
      });

      return okJson(next);
    }

    const { data: current, error: currentError } = await supabaseAdmin
      .from("campaign_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (currentError) {
      return errorJson("Failed to load campaign status", 500, currentError.message);
    }

    const updatePayload: Record<string, unknown> = {};

    if (channel === "all") {
      updatePayload.linkedin_status = "paused";
      updatePayload.youtube_status = "paused";
      updatePayload.facebook_status = "paused";
      updatePayload.instagram_status = "paused";
      updatePayload.status = "paused";
    } else {
      updatePayload[`${channel}_status`] = "paused";
    }

    const { data, error } = await supabaseAdmin
      .from("campaign_config")
      .update(updatePayload)
      .eq("id", 1)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to pause channel", 500, error.message);
    }

    await logActivity({
      entity_type: "campaign",
      entity_id: "1",
      action: "paused",
      old_value: current,
      new_value: data,
      note: `Channel: ${channel}`,
    });

    return okJson(campaignConfigToData(data as CampaignConfig));
  } catch (error) {
    return errorJson("Failed to pause channel", 500, String(error));
  }
}
