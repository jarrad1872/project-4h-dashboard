import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { LaunchChecklistItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const checklist = readJsonFile<LaunchChecklistItem[]>(DataFiles.launchChecklist);
    return okJson(checklist);
  } catch (error) {
    return errorJson("Failed to load launch checklist", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: string;
      checked?: boolean;
      markAll?: boolean;
    };

    const checklist = readJsonFile<LaunchChecklistItem[]>(DataFiles.launchChecklist);

    if (payload.markAll) {
      const updated = checklist.map((item) => ({ ...item, checked: true, updatedAt: isoNow() }));
      writeJsonFile(DataFiles.launchChecklist, updated);
      return okJson(updated);
    }

    if (!payload.id) {
      return errorJson("id is required", 400);
    }

    const index = checklist.findIndex((item) => item.id === payload.id);
    if (index < 0) {
      return errorJson("Checklist item not found", 404);
    }

    checklist[index] = {
      ...checklist[index],
      checked: payload.checked ?? !checklist[index].checked,
      updatedAt: isoNow(),
    };

    writeJsonFile(DataFiles.launchChecklist, checklist);
    return okJson(checklist[index]);
  } catch (error) {
    return errorJson("Failed to update launch checklist", 500, String(error));
  }
}
