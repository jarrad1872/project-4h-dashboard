import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import type { MetricsData, WeeklyMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** POST /api/metrics/batch — upsert multiple metric rows at once */
export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const rows: Partial<WeeklyMetric>[] = Array.isArray(body) ? body : body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return errorJson("Expected an array of metric rows (or { rows: [...] })", 400);
    }

    // Validate each row
    const validPlatforms = ["linkedin", "youtube", "facebook", "instagram"];
    const errors: string[] = [];
    const validated: {
      week_start: string;
      platform: string;
      spend: number;
      impressions: number;
      clicks: number;
      signups: number;
      activations: number;
      paid: number;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.week_start) {
        errors.push(`Row ${i}: missing week_start`);
        continue;
      }
      if (!r.platform || !validPlatforms.includes(r.platform)) {
        errors.push(`Row ${i}: invalid platform "${r.platform}"`);
        continue;
      }
      validated.push({
        week_start: String(r.week_start),
        platform: r.platform,
        spend: Number(r.spend ?? 0),
        impressions: Number(r.impressions ?? 0),
        clicks: Number(r.clicks ?? 0),
        signups: Number(r.signups ?? 0),
        activations: Number(r.activations ?? 0),
        paid: Number(r.paid ?? 0),
      });
    }

    if (validated.length === 0) {
      return errorJson("No valid rows", 400, errors);
    }

    if (!hasSupabase()) {
      // File-based fallback
      const metrics = readFallback<MetricsData>(DataFiles.metrics, { weeks: [] });

      for (const row of validated) {
        const idx = metrics.weeks.findIndex((w) => w.weekStart === row.week_start);
        const week = idx >= 0
          ? metrics.weeks[idx]
          : {
              weekStart: row.week_start,
              linkedin: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
              youtube: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
              facebook: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
              instagram: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
            };

        const platform = row.platform as "linkedin" | "youtube" | "facebook" | "instagram";
        week[platform] = {
          spend: row.spend,
          impressions: row.impressions,
          clicks: row.clicks,
          signups: row.signups,
          activations: row.activations,
          paid: row.paid,
        };
        (week as { updatedAt?: string }).updatedAt = isoNow();

        if (idx >= 0) {
          metrics.weeks[idx] = week;
        } else {
          metrics.weeks.push(week);
        }
      }

      writeJsonFile(DataFiles.metrics, metrics);

      await logActivity({
        entity_type: "metric",
        entity_id: "batch",
        action: "batch_upserted",
        new_value: { count: validated.length },
      });

      return okJson({
        inserted: validated.length,
        errors: errors.length > 0 ? errors : undefined,
      }, 201);
    }

    // Supabase path
    const { error } = await supabaseAdmin
      .from("weekly_metrics")
      .upsert(validated, { onConflict: "week_start,platform" });

    if (error) {
      return errorJson("Failed to batch upsert metrics", 500, error.message);
    }

    await logActivity({
      entity_type: "metric",
      entity_id: "batch",
      action: "batch_upserted",
      new_value: { count: validated.length },
    });

    return okJson({
      inserted: validated.length,
      errors: errors.length > 0 ? errors : undefined,
    }, 201);
  } catch (err) {
    return errorJson("Failed to batch upsert metrics", 500, String(err));
  }
}
