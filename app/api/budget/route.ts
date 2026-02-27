import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { BudgetData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const budget = readJsonFile<BudgetData>(DataFiles.budget);
    return okJson(budget);
  } catch (error) {
    return errorJson("Failed to load budget", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      channel?: keyof BudgetData["channels"];
      spent?: number;
      allocated?: number;
      channels?: Partial<BudgetData["channels"]>;
    };

    const budget = readJsonFile<BudgetData>(DataFiles.budget);

    if (payload.channels) {
      budget.channels = {
        ...budget.channels,
        ...payload.channels,
      };
    }

    if (payload.channel) {
      const channel = budget.channels[payload.channel];
      if (!channel) {
        return errorJson("Invalid channel", 400);
      }
      budget.channels[payload.channel] = {
        allocated: payload.allocated ?? channel.allocated,
        spent: payload.spent ?? channel.spent,
      };
    }

    budget.updatedAt = isoNow();
    writeJsonFile(DataFiles.budget, budget);
    return okJson(budget);
  } catch (error) {
    return errorJson("Failed to update budget", 500, String(error));
  }
}
