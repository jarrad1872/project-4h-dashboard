import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { CampaignStatusData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { channel?: "linkedin" | "youtube" | "facebook" | "instagram" | "all" };
    if (!payload.channel) {
      return errorJson("channel is required", 400);
    }

    const status = readJsonFile<CampaignStatusData>(DataFiles.campaignStatus);

    if (payload.channel === "all") {
      status.linkedinStatus = "paused";
      status.youtubeStatus = "paused";
      status.facebookStatus = "paused";
      status.instagramStatus = "paused";
      status.status = "paused";
    } else {
      const key = `${payload.channel}Status` as const;
      status[key] = "paused";
    }

    status.updatedAt = isoNow();
    writeJsonFile(DataFiles.campaignStatus, status);

    return okJson(status);
  } catch (error) {
    return errorJson("Failed to pause channel", 500, String(error));
  }
}
