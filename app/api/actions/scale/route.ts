import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { budgetRowsToData, hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { BudgetData, BudgetRow, CampaignConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      channel?: BudgetRow["platform"];
      newBudget?: number;
    };

    if (!payload.channel || payload.newBudget === undefined) {
      return errorJson("channel and newBudget are required", 400);
    }

    if (!hasSupabase()) {
      const budget = readFallback<BudgetData>(DataFiles.budget, {
        totalBudget: 0,
        channels: {
          linkedin: { allocated: 0, spent: 0 },
          youtube: { allocated: 0, spent: 0 },
          facebook: { allocated: 0, spent: 0 },
          instagram: { allocated: 0, spent: 0 },
        },
      });

      if (!budget.channels[payload.channel]) {
        return errorJson("Invalid channel", 400);
      }

      const previous = { ...budget.channels[payload.channel] };
      budget.channels[payload.channel].allocated = Number(payload.newBudget) || 0;
      budget.updatedAt = isoNow();
      writeJsonFile(DataFiles.budget, budget);

      await logActivity({
        entity_type: "budget",
        entity_id: payload.channel,
        action: "scaled",
        old_value: previous,
        new_value: budget.channels[payload.channel],
      });

      return okJson(budget);
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("budget")
      .select("*")
      .eq("platform", payload.channel)
      .maybeSingle();

    if (existingError) {
      return errorJson("Failed to load budget row", 500, existingError.message);
    }

    if (!existing) {
      return errorJson("Invalid channel", 400);
    }

    const { error } = await supabaseAdmin
      .from("budget")
      .update({ allocated: Number(payload.newBudget) || 0, updated_at: isoNow() })
      .eq("platform", payload.channel);

    if (error) {
      return errorJson("Failed to scale channel budget", 500, error.message);
    }

    await logActivity({
      entity_type: "budget",
      entity_id: payload.channel,
      action: "scaled",
      old_value: existing,
      new_value: { ...existing, allocated: Number(payload.newBudget) || 0 },
    });

    const [{ data: budgetRows }, { data: config }] = await Promise.all([
      supabaseAdmin.from("budget").select("*"),
      supabaseAdmin.from("campaign_config").select("*").eq("id", 1).maybeSingle(),
    ]);

    return okJson(budgetRowsToData((budgetRows ?? []) as BudgetRow[], (config ?? null) as CampaignConfig | null));
  } catch (error) {
    return errorJson("Failed to scale channel budget", 500, String(error));
  }
}
