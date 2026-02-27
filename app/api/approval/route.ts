import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { ApprovalItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const queue = readJsonFile<ApprovalItem[]>(DataFiles.approvalQueue);
    return okJson(queue);
  } catch (error) {
    return errorJson("Failed to load approval queue", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as { id?: string; status?: ApprovalItem["status"] };
    if (!payload.id || !payload.status) {
      return errorJson("id and status are required", 400);
    }

    const queue = readJsonFile<ApprovalItem[]>(DataFiles.approvalQueue);
    const index = queue.findIndex((item) => item.id === payload.id);
    if (index < 0) {
      return errorJson("Approval item not found", 404);
    }

    queue[index] = {
      ...queue[index],
      status: payload.status,
      updatedAt: isoNow(),
    };

    writeJsonFile(DataFiles.approvalQueue, queue);
    return okJson(queue[index]);
  } catch (error) {
    return errorJson("Failed to update approval item", 500, String(error));
  }
}
