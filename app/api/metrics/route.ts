import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, metricsRowsToData, metricsWeekToRows, readFallback } from "@/lib/server-utils";
import type { MetricsData, MetricsWeek, WeeklyMetric } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const fallback = readFallback<MetricsData>(DataFiles.metrics, { weeks: [] });
      return okJson(fallback);
    }

    const { data, error } = await supabaseAdmin
      .from("weekly_metrics")
      .select("*")
      .order("week_start", { ascending: false });

    if (error) {
      return errorJson("Failed to load metrics", 500, error.message);
    }

    return okJson(metricsRowsToData((data ?? []) as WeeklyMetric[]));
  } catch (error) {
    return errorJson("Failed to load metrics", 500, String(error));
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<WeeklyMetric> & Partial<MetricsWeek>;

    const hasRowShape = Boolean(payload.week_start && payload.platform);
    const hasLegacyShape = Boolean(payload.weekStart);

    if (!hasRowShape && !hasLegacyShape) {
      return errorJson("week_start + platform (or weekStart) is required", 400);
    }

    if (!hasSupabase()) {
      const metrics = readFallback<MetricsData>(DataFiles.metrics, { weeks: [] });

      if (hasLegacyShape) {
        const week = payload as MetricsWeek;
        const index = metrics.weeks.findIndex((item) => item.weekStart === week.weekStart);
        const nextWeek = {
          ...week,
          updatedAt: isoNow(),
        } as MetricsWeek;

        if (index >= 0) {
          metrics.weeks[index] = nextWeek;
        } else {
          metrics.weeks.push(nextWeek);
        }

        writeJsonFile(DataFiles.metrics, metrics);

        await logActivity({
          entity_type: "metric",
          entity_id: week.weekStart,
          action: "upserted",
          new_value: nextWeek,
        });

        return okJson(nextWeek, 201);
      }

      const row = payload as WeeklyMetric;
      const weekStart = String(row.week_start);
      const platform = row.platform;

      const index = metrics.weeks.findIndex((item) => item.weekStart === weekStart);
      const week = index >= 0
        ? metrics.weeks[index]
        : {
            weekStart,
            linkedin: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
            youtube: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
            facebook: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
            instagram: { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 },
          };

      week[platform] = {
        spend: Number(row.spend ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        signups: Number(row.signups ?? 0),
        activations: Number(row.activations ?? 0),
        paid: Number(row.paid ?? 0),
      };
      week.updatedAt = isoNow();

      if (index >= 0) {
        metrics.weeks[index] = week;
      } else {
        metrics.weeks.push(week);
      }

      writeJsonFile(DataFiles.metrics, metrics);

      await logActivity({
        entity_type: "metric",
        entity_id: `${weekStart}:${platform}`,
        action: "upserted",
        new_value: row,
      });

      return okJson(row, 201);
    }

    if (hasLegacyShape) {
      const week = payload as MetricsWeek;
      const rows = metricsWeekToRows(week);
      const { error } = await supabaseAdmin
        .from("weekly_metrics")
        .upsert(rows, { onConflict: "week_start,platform" });

      if (error) {
        return errorJson("Failed to save week metrics", 500, error.message);
      }

      await logActivity({
        entity_type: "metric",
        entity_id: week.weekStart,
        action: "upserted",
        new_value: week,
      });

      return okJson({ ...week, updatedAt: isoNow() }, 201);
    }

    const rowPayload = payload as WeeklyMetric;
    const row = {
      week_start: rowPayload.week_start,
      platform: rowPayload.platform,
      spend: rowPayload.spend ?? 0,
      impressions: rowPayload.impressions ?? 0,
      clicks: rowPayload.clicks ?? 0,
      signups: rowPayload.signups ?? 0,
      activations: rowPayload.activations ?? 0,
      paid: rowPayload.paid ?? 0,
    };

    const { data, error } = await supabaseAdmin
      .from("weekly_metrics")
      .upsert(row, { onConflict: "week_start,platform" })
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to save week metrics", 500, error.message);
    }

    await logActivity({
      entity_type: "metric",
      entity_id: `${row.week_start}:${row.platform}`,
      action: "upserted",
      new_value: data,
    });

    return okJson(data, 201);
  } catch (error) {
    return errorJson("Failed to save week metrics", 500, String(error));
  }
}
