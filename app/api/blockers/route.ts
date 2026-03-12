import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, readFallback } from "@/lib/server-utils";
import type { Ad, BudgetData, CampaignStatusData } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** GET /api/blockers — compute current launch blockers from live data */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    // Load campaign status
    let campaignStatus: CampaignStatusData;
    if (hasSupabase()) {
      const { data } = await supabaseAdmin.from("campaign_config").select("*").single();
      campaignStatus = data
        ? {
            status: data.status,
            startDate: data.start_date,
            linkedinStatus: data.linkedin_status,
            youtubeStatus: data.youtube_status,
            facebookStatus: data.facebook_status,
            instagramStatus: data.instagram_status,
          }
        : readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
            status: "pre-launch",
            startDate: null,
            linkedinStatus: "ready",
            youtubeStatus: "ready",
            facebookStatus: "ready",
            instagramStatus: "ready",
          });
    } else {
      campaignStatus = readFallback<CampaignStatusData>(DataFiles.campaignStatus, {
        status: "pre-launch",
        startDate: null,
        linkedinStatus: "ready",
        youtubeStatus: "ready",
        facebookStatus: "ready",
        instagramStatus: "ready",
      });
    }

    // Load ads
    let ads: Ad[] = [];
    if (hasSupabase()) {
      const { data } = await supabaseAdmin.from("ads").select("id, status, platform");
      ads = (data ?? []) as Ad[];
    } else {
      ads = readFallback<Ad[]>(DataFiles.ads, []);
    }

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
    const blockers: { id: string; label: string; severity: "high" | "med" | "low"; action: string; href: string | null }[] = [];

    // Campaign not live
    if (campaignStatus.status === "pre-launch") {
      blockers.push({
        id: "campaign-status",
        label: "Campaign status is pre-launch — not yet active",
        severity: "high",
        action: "Set campaign status to live when ready",
        href: null,
      });
    }

    // Pending ads
    const pendingCount = ads.filter((a) => a.status === "pending").length;
    if (pendingCount > 0) {
      blockers.push({
        id: "pending-ads",
        label: `${pendingCount} ad(s) pending approval`,
        severity: pendingCount > 100 ? "med" : "low",
        action: "Review and approve pending ads",
        href: "/approval",
      });
    }

    // No approved ads
    const approvedCount = ads.filter((a) => a.status === "approved").length;
    if (approvedCount === 0 && ads.length > 0) {
      blockers.push({
        id: "no-approved-ads",
        label: "No ads approved — campaigns can't run",
        severity: "high",
        action: "Approve ads in the approval queue",
        href: "/approval",
      });
    }

    // Budget not allocated
    for (const p of platforms) {
      if ((budget.channels[p]?.allocated ?? 0) === 0) {
        blockers.push({
          id: `budget-${p}`,
          label: `${p} has $0 budget allocated`,
          severity: "med",
          action: `Allocate budget for ${p}`,
          href: "/budget",
        });
      }
    }

    // Ad accounts not set up (check if any platform channel status is still "ready")
    for (const p of platforms) {
      const statusKey = `${p}Status` as keyof CampaignStatusData;
      if (campaignStatus[statusKey] === "ready" && campaignStatus.status !== "pre-launch") {
        blockers.push({
          id: `account-${p}`,
          label: `${p} ad account not activated`,
          severity: "med",
          action: `Set up ${p} ad account`,
          href: null,
        });
      }
    }

    return okJson({
      generated_at: new Date().toISOString(),
      total: blockers.length,
      critical: blockers.filter((b) => b.severity === "high").length,
      blockers,
    });
  } catch (err) {
    return errorJson("Failed to compute blockers", 500, String(err));
  }
}
