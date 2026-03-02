import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles } from "@/lib/file-db";
import { readFallback } from "@/lib/server-utils";
import type { Ad, AdStatus, BudgetData, CampaignStatusData, MetricsData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    // Load campaign status
    const campaignStatus = readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
      status: "pre-launch",
      startDate: null,
      linkedinStatus: "ready",
      youtubeStatus: "ready",
      facebookStatus: "ready",
      instagramStatus: "ready",
    });

    // Load ads
    const ads = readFallback<Ad[]>(DataFiles.ads, []);

    // Count ads by status
    const by_status: Record<AdStatus, number> = {
      pending: 0,
      approved: 0,
      paused: 0,
      rejected: 0,
    };
    for (const ad of ads) {
      const s = ad.status as AdStatus;
      if (s in by_status) {
        by_status[s] = (by_status[s] ?? 0) + 1;
      }
    }

    const pending_approval = by_status.pending ?? 0;
    const approved = by_status.approved ?? 0;
    // "live" = approved ads (no separate live status in schema; live === active campaign with approved ads)
    const live = campaignStatus.status === "live" ? approved : 0;

    // Load budget
    const budget = readFallback<BudgetData>(DataFiles.budget, {
      totalBudget: 0,
      channels: {
        linkedin: { allocated: 0, spent: 0 },
        youtube: { allocated: 0, spent: 0 },
        facebook: { allocated: 0, spent: 0 },
        instagram: { allocated: 0, spent: 0 },
      },
    });

    const platforms = ["linkedin", "youtube", "facebook", "instagram"] as const;
    const by_platform: Record<string, { allocated: number; spent: number; pct_used: number }> = {};
    for (const p of platforms) {
      const ch = budget.channels[p] ?? { allocated: 0, spent: 0 };
      by_platform[p] = {
        allocated: ch.allocated,
        spent: ch.spent,
        pct_used: ch.allocated > 0 ? Math.round((ch.spent / ch.allocated) * 10000) / 100 : 0,
      };
    }

    // Load metrics (last week summary)
    const metricsData = readFallback<MetricsData>(DataFiles.metrics, { weeks: [] });
    let metrics_summary: {
      total_spend: number;
      total_impressions: number;
      total_clicks: number;
      total_signups: number;
    } | null = null;

    if (metricsData.weeks.length > 0) {
      // Sum up all channels for the most recent week
      const latestWeek = metricsData.weeks[0];
      let total_spend = 0;
      let total_impressions = 0;
      let total_clicks = 0;
      let total_signups = 0;
      for (const p of platforms) {
        const ch = latestWeek[p];
        if (ch) {
          total_spend += ch.spend ?? 0;
          total_impressions += ch.impressions ?? 0;
          total_clicks += ch.clicks ?? 0;
          total_signups += ch.signups ?? 0;
        }
      }
      metrics_summary = { total_spend, total_impressions, total_clicks, total_signups };
    }

    // Build blockers list
    const blockers: string[] = [];
    if (campaignStatus.status === "pre-launch") {
      blockers.push("Campaign status is pre-launch — not yet active");
    }
    if (pending_approval > 0) {
      blockers.push(`${pending_approval} ad(s) pending approval`);
    }
    for (const p of platforms) {
      if ((budget.channels[p]?.allocated ?? 0) === 0) {
        blockers.push(`${p} platform has $0 budget allocated`);
      }
    }

    return okJson({
      generated_at: new Date().toISOString(),
      campaign_status: campaignStatus.status,
      ads: {
        total: ads.length,
        by_status,
        pending_approval,
        approved,
        live,
      },
      budget: {
        total_allocated: budget.totalBudget ?? 0,
        total_spent: platforms.reduce((sum, p) => sum + (budget.channels[p]?.spent ?? 0), 0),
        by_platform,
      },
      blockers,
      metrics_summary,
    });
  } catch (err) {
    return errorJson("Failed to generate daily report", 500, String(err));
  }
}
