import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { Ad, AdStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET(request: Request) {
  try {
    const ads = readJsonFile<Ad[]>(DataFiles.ads);
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");

    const filtered = ads.filter((ad) => {
      const platformMatch = !platform || platform === "all" || ad.platform === platform;
      const statusMatch = !status || status === "all" || ad.status === status;
      return platformMatch && statusMatch;
    });

    return okJson(filtered);
  } catch (error) {
    return errorJson("Failed to load ads", 500, String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<Ad>;
    if (!payload.platform || !payload.primaryText || !payload.cta || !payload.landingPath) {
      return errorJson("platform, primaryText, cta, and landingPath are required", 400);
    }

    const ads = readJsonFile<Ad[]>(DataFiles.ads);
    const id = payload.id ?? `${payload.platform}-${Date.now()}`;
    if (ads.some((ad) => ad.id === id)) {
      return errorJson(`Ad with id ${id} already exists`, 409);
    }

    const status = (payload.status ?? "pending") as AdStatus;
    const now = isoNow();
    const newAd: Ad = {
      id,
      platform: payload.platform,
      campaignGroup: payload.campaignGroup ?? "4h_custom",
      format: payload.format ?? "static1x1",
      primaryText: payload.primaryText,
      headline: payload.headline ?? "",
      cta: payload.cta,
      landingPath: payload.landingPath,
      utmSource: payload.utmSource ?? payload.platform,
      utmMedium: payload.utmMedium ?? "paid-social",
      utmCampaign: payload.utmCampaign ?? "4h_2026-03_custom",
      utmContent: payload.utmContent ?? "custom",
      utmTerm: payload.utmTerm ?? "owners_1-10",
      status,
      createdAt: now,
      statusHistory: [{ status, at: now, note: "Created from dashboard" }],
    };

    ads.unshift(newAd);
    writeJsonFile(DataFiles.ads, ads);
    return okJson(newAd, 201);
  } catch (error) {
    return errorJson("Failed to create ad", 500, String(error));
  }
}
