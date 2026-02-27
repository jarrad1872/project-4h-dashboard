import { DataFiles, readJsonFile } from "@/lib/file-db";
import { errorJson, okJson, optionsResponse } from "@/lib/api";
import type { Ad, BudgetData, CampaignStatusData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  try {
    const ads = readJsonFile<Ad[]>(DataFiles.ads);
    const budget = readJsonFile<BudgetData>(DataFiles.budget);
    const campaign = readJsonFile<CampaignStatusData>(DataFiles.campaignStatus);

    const pendingApprovals = ads.filter((ad) => ad.status === "pending").length;
    const spent = Object.values(budget.channels).reduce((sum, channel) => sum + channel.spent, 0);

    return okJson({
      ok: true,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAds: ads.length,
        pendingApprovals,
        budgetRemaining: budget.totalBudget - spent,
        campaignStatus: campaign.status,
      },
    });
  } catch (error) {
    return errorJson("Failed to generate status summary", 500, String(error));
  }
}
