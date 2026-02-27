import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { BudgetData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      channel?: keyof BudgetData["channels"];
      newBudget?: number;
    };

    if (!payload.channel || payload.newBudget === undefined) {
      return errorJson("channel and newBudget are required", 400);
    }

    const budget = readJsonFile<BudgetData>(DataFiles.budget);
    if (!budget.channels[payload.channel]) {
      return errorJson("Invalid channel", 400);
    }

    budget.channels[payload.channel].allocated = payload.newBudget;
    budget.updatedAt = isoNow();
    writeJsonFile(DataFiles.budget, budget);

    return okJson(budget);
  } catch (error) {
    return errorJson("Failed to scale channel budget", 500, String(error));
  }
}
