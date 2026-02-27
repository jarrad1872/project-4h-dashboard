import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { Ad, AdStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const ads = readJsonFile<Ad[]>(DataFiles.ads);
    const ad = ads.find((item) => item.id === id);
    if (!ad) {
      return errorJson("Ad not found", 404);
    }

    return okJson(ad);
  } catch (error) {
    return errorJson("Failed to load ad", 500, String(error));
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as Partial<Ad>;
    const ads = readJsonFile<Ad[]>(DataFiles.ads);
    const index = ads.findIndex((item) => item.id === id);

    if (index < 0) {
      return errorJson("Ad not found", 404);
    }

    const existing = ads[index];
    const next: Ad = {
      ...existing,
      ...payload,
      id: existing.id,
      createdAt: existing.createdAt,
      statusHistory: existing.statusHistory ?? [],
    };

    if (payload.status && payload.status !== existing.status) {
      const history = next.statusHistory ?? [];
      history.push({
        status: payload.status as AdStatus,
        at: isoNow(),
        note: payload.status === "approved" ? "Approved from detail view" : "Status changed",
      });
      next.statusHistory = history;
    }

    ads[index] = next;
    writeJsonFile(DataFiles.ads, ads);
    return okJson(next);
  } catch (error) {
    return errorJson("Failed to update ad", 500, String(error));
  }
}
