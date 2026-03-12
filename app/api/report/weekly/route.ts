import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, metricsRowsToData, readFallback } from "@/lib/server-utils";
import { calcCtr, calcCpaPaid, calcActivationRate, signal } from "@/lib/metrics";
import type { BudgetData, MetricsData, WeeklyMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    let metricsData: MetricsData;

    if (hasSupabase()) {
      const { data, error } = await supabaseAdmin
        .from("weekly_metrics")
        .select("*")
        .order("week_start", { ascending: true });

      if (error) {
        metricsData = readFallback<MetricsData>(DataFiles.metrics, { weeks: [] });
      } else {
        metricsData = metricsRowsToData((data ?? []) as WeeklyMetric[]);
      }
    } else {
      metricsData = readFallback<MetricsData>(DataFiles.metrics, { weeks: [] });
    }

    const budget = readFallback<BudgetData>(DataFiles.budget, {
      totalBudget: 0,
      channels: {
        linkedin: { allocated: 0, spent: 0 },
        youtube: { allocated: 0, spent: 0 },
        facebook: { allocated: 0, spent: 0 },
        instagram: { allocated: 0, spent: 0 },
      },
    });

    const weeks = metricsData.weeks;
    if (weeks.length === 0) {
      return okJson({ generated_at: new Date().toISOString(), message: "No metrics data", platforms: [] });
    }

    const current = weeks[weeks.length - 1];
    const previous = weeks.length > 1 ? weeks[weeks.length - 2] : null;
    const platforms = ["linkedin", "youtube", "facebook", "instagram"] as const;

    let totalSpend = 0;
    let prevTotalSpend = 0;

    const platformBreakdown = platforms.map((p) => {
      const ch = current[p];
      const prev = previous ? previous[p] : null;
      const ctr = calcCtr(ch);
      const cpaPaid = calcCpaPaid(ch);
      const activationRate = calcActivationRate(ch);
      const sig = signal(ch);

      totalSpend += ch.spend;
      if (prev) prevTotalSpend += prev.spend;

      return {
        platform: p,
        spend: ch.spend,
        prev_spend: prev?.spend,
        ctr: Math.round(ctr * 100) / 100,
        prev_ctr: prev ? Math.round(calcCtr(prev) * 100) / 100 : undefined,
        cpa_paid: Math.round(cpaPaid * 100) / 100,
        prev_cpa_paid: prev ? Math.round(calcCpaPaid(prev) * 100) / 100 : undefined,
        activation_rate: Math.round(activationRate * 100) / 100,
        prev_activation_rate: prev ? Math.round(calcActivationRate(prev) * 100) / 100 : undefined,
        signal: sig,
        prev_signal: prev ? signal(prev) : undefined,
        signups: ch.signups,
        prev_signups: prev?.signups,
        activations: ch.activations,
        paid: ch.paid,
      };
    });

    return okJson({
      generated_at: new Date().toISOString(),
      week_start: current.weekStart,
      prev_week_start: previous?.weekStart,
      platforms: platformBreakdown,
      total_spend: totalSpend,
      prev_total_spend: previous ? prevTotalSpend : undefined,
      budget_total: budget.totalBudget,
      budget_used_pct: budget.totalBudget > 0 ? Math.round((totalSpend / budget.totalBudget) * 10000) / 100 : 0,
    });
  } catch (err) {
    return errorJson("Failed to generate weekly report", 500, String(err));
  }
}
