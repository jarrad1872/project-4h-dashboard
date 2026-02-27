import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { LifecycleMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const lifecycle = readJsonFile<LifecycleMessage[]>(DataFiles.lifecycle);
    return okJson(lifecycle);
  } catch (error) {
    return errorJson("Failed to load lifecycle messages", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as Partial<LifecycleMessage> & { id?: string; asset_id?: string };
    const id = payload.id ?? payload.asset_id;
    if (!id) {
      return errorJson("id or asset_id is required", 400);
    }

    const lifecycle = readJsonFile<LifecycleMessage[]>(DataFiles.lifecycle);
    const index = lifecycle.findIndex((item) => item.id === id || item.asset_id === id);

    if (index < 0) {
      return errorJson("Lifecycle message not found", 404);
    }

    lifecycle[index] = {
      ...lifecycle[index],
      ...payload,
      id: lifecycle[index].id,
      asset_id: lifecycle[index].asset_id,
      updatedAt: isoNow(),
    };

    writeJsonFile(DataFiles.lifecycle, lifecycle);
    return okJson(lifecycle[index]);
  } catch (error) {
    return errorJson("Failed to update lifecycle message", 500, String(error));
  }
}
