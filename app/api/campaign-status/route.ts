import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { CampaignStatusData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const status = readJsonFile<CampaignStatusData>(DataFiles.campaignStatus);
    return okJson(status);
  } catch (error) {
    return errorJson("Failed to load campaign status", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as Partial<CampaignStatusData>;
    const status = readJsonFile<CampaignStatusData>(DataFiles.campaignStatus);

    const next = {
      ...status,
      ...payload,
      updatedAt: isoNow(),
    };

    writeJsonFile(DataFiles.campaignStatus, next);
    return okJson(next);
  } catch (error) {
    return errorJson("Failed to update campaign status", 500, String(error));
  }
}
