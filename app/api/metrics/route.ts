import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { MetricsData, MetricsWeek } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const metrics = readJsonFile<MetricsData>(DataFiles.metrics);
    return okJson(metrics);
  } catch (error) {
    return errorJson("Failed to load metrics", 500, String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MetricsWeek;
    if (!payload.weekStart) {
      return errorJson("weekStart is required", 400);
    }

    const metrics = readJsonFile<MetricsData>(DataFiles.metrics);
    const index = metrics.weeks.findIndex((week) => week.weekStart === payload.weekStart);
    const nextWeek = { ...payload, updatedAt: isoNow() };

    if (index >= 0) {
      metrics.weeks[index] = nextWeek;
    } else {
      metrics.weeks.push(nextWeek);
    }

    writeJsonFile(DataFiles.metrics, metrics);
    return okJson(nextWeek, 201);
  } catch (error) {
    return errorJson("Failed to save week metrics", 500, String(error));
  }
}
