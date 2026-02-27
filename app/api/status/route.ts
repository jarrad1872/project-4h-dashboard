import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, readFallback } from "@/lib/server-utils";
import type { Ad, BudgetData, CampaignStatusData, LaunchChecklistItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const ads = readFallback<any[]>(DataFiles.ads, []);
      const budget = readFallback<BudgetData>(DataFiles.budget, {
        totalBudget: 0,
        channels: {
          linkedin: { allocated: 0, spent: 0 },
          youtube: { allocated: 0, spent: 0 },
          facebook: { allocated: 0, spent: 0 },
          instagram: { allocated: 0, spent: 0 },
        },
      });
      const campaign = readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
        status: "pre-launch",
        startDate: null,
        linkedinStatus: "ready",
        youtubeStatus: "ready",
        facebookStatus: "ready",
        instagramStatus: "ready",
      });
      const checklist = readFallback<LaunchChecklistItem[]>(DataFiles.launchChecklist, []);

      const totalAds = ads.length;
      const approvedAds = ads.filter((ad: Ad) => ad.status === "approved").length;
      const pendingApprovals = ads.filter((ad: Ad) => ad.status === "pending").length;
      const spentBudget = Object.values(budget.channels).reduce((sum, row) => sum + row.spent, 0);
      const totalBudget = budget.totalBudget || Object.values(budget.channels).reduce((sum, row) => sum + row.allocated, 0);
      const complete = checklist.filter((item) => item.checked).length;

      return okJson({
        campaignStatus: campaign.status,
        totalAds,
        approvedAds,
        pendingApprovals,
        totalBudget,
        spentBudget,
        launchProgress: {
          complete,
          total: checklist.length,
        },
      });
    }

    const [adsRes, budgetRes, campaignRes, checklistRes] = await Promise.all([
      supabaseAdmin.from("ads").select("status"),
      supabaseAdmin.from("budget").select("allocated,spent"),
      supabaseAdmin.from("campaign_config").select("status,total_budget").eq("id", 1).single(),
      supabaseAdmin.from("launch_checklist").select("checked"),
    ]);

    if (adsRes.error) return errorJson("Failed to load ad status counts", 500, adsRes.error.message);
    if (budgetRes.error) return errorJson("Failed to load budget totals", 500, budgetRes.error.message);
    if (campaignRes.error) return errorJson("Failed to load campaign status", 500, campaignRes.error.message);
    if (checklistRes.error) return errorJson("Failed to load launch checklist", 500, checklistRes.error.message);

    const ads = adsRes.data ?? [];
    const budgetRows = budgetRes.data ?? [];
    const checklist = checklistRes.data ?? [];

    const totalAds = ads.length;
    const approvedAds = ads.filter((ad) => ad.status === "approved").length;
    const pendingApprovals = ads.filter((ad) => ad.status === "pending").length;
    const spentBudget = budgetRows.reduce((sum, row) => sum + Number(row.spent ?? 0), 0);
    const allocatedSum = budgetRows.reduce((sum, row) => sum + Number(row.allocated ?? 0), 0);
    const totalBudget = Number(campaignRes.data.total_budget ?? allocatedSum);
    const complete = checklist.filter((item) => item.checked).length;

    return okJson({
      campaignStatus: campaignRes.data.status,
      totalAds,
      approvedAds,
      pendingApprovals,
      totalBudget,
      spentBudget,
      launchProgress: {
        complete,
        total: checklist.length,
      },
    });
  } catch (error) {
    return errorJson("Failed to generate status summary", 500, String(error));
  }
}
