import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { budgetRowsToData, hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { BudgetData, BudgetRow, CampaignConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
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
      return okJson(budget);
    }

    const [{ data: budgetRows, error: budgetError }, { data: config, error: configError }] = await Promise.all([
      supabaseAdmin.from("budget").select("*"),
      supabaseAdmin.from("campaign_config").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (budgetError) {
      return errorJson("Failed to load budget", 500, budgetError.message);
    }

    if (configError) {
      return errorJson("Failed to load campaign config", 500, configError.message);
    }

    return okJson(budgetRowsToData((budgetRows ?? []) as BudgetRow[], (config ?? null) as CampaignConfig | null));
  } catch (error) {
    return errorJson("Failed to load budget", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      channel?: BudgetRow["platform"];
      platform?: BudgetRow["platform"];
      spent?: number;
    };

    const platform = payload.platform ?? payload.channel;
    if (!platform || payload.spent === undefined) {
      return errorJson("platform and spent are required", 400);
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

      if (!budget.channels[platform]) {
        return errorJson("Invalid platform", 400);
      }

      const previous = { ...budget.channels[platform] };
      budget.channels[platform].spent = Number(payload.spent) || 0;
      budget.updatedAt = isoNow();
      writeJsonFile(DataFiles.budget, budget);

      await logActivity({
        entity_type: "budget",
        entity_id: platform,
        action: "spent_updated",
        old_value: previous,
        new_value: budget.channels[platform],
      });

      return okJson(budget);
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("budget")
      .select("*")
      .eq("platform", platform)
      .maybeSingle();

    if (existingError) {
      return errorJson("Failed to load budget row", 500, existingError.message);
    }

    if (!existing) {
      return errorJson("Invalid platform", 400);
    }

    const { error } = await supabaseAdmin
      .from("budget")
      .update({ spent: Number(payload.spent) || 0, updated_at: isoNow() })
      .eq("platform", platform);

    if (error) {
      return errorJson("Failed to update budget", 500, error.message);
    }

    await logActivity({
      entity_type: "budget",
      entity_id: platform,
      action: "spent_updated",
      old_value: existing,
      new_value: { ...existing, spent: Number(payload.spent) || 0 },
    });

    const [{ data: budgetRows }, { data: config }] = await Promise.all([
      supabaseAdmin.from("budget").select("*"),
      supabaseAdmin.from("campaign_config").select("*").eq("id", 1).maybeSingle(),
    ]);

    return okJson(budgetRowsToData((budgetRows ?? []) as BudgetRow[], (config ?? null) as CampaignConfig | null));
  } catch (error) {
    return errorJson("Failed to update budget", 500, String(error));
  }
}
