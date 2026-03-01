/**
 * POST /api/drive-backup/export
 * Fetches all ads from Supabase, converts to CSV, and uploads to Drive.
 * Also available as GET for quick manual trigger.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, normalizeAd } from "@/lib/server-utils";
import { backupCsvToDrive, isDriveConfigured } from "@/lib/drive-backup";
import { okJson, errorJson, optionsResponse } from "@/lib/api";
import type { Ad } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

const CSV_FIELDS: (keyof Ad)[] = [
  "id",
  "platform",
  "campaign_group",
  "format",
  "status",
  "workflow_stage",
  "headline",
  "primary_text",
  "cta",
  "landing_path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "image_url",
  "creative_variant",
  "created_at",
  "updated_at",
];

function adsToCSV(ads: Ad[]): string {
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = CSV_FIELDS.join(",");
  const rows = ads.map((ad) => CSV_FIELDS.map((f) => escape(ad[f])).join(","));
  return [header, ...rows].join("\n");
}

export async function GET() {
  return handleExport();
}

export async function POST() {
  return handleExport();
}

async function handleExport(): Promise<NextResponse> {
  if (!isDriveConfigured()) {
    return NextResponse.json(
      { error: "Google Drive not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN" },
      { status: 503 },
    );
  }

  if (!hasSupabase()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return errorJson("Failed to fetch ads for export", 500, error.message);
    }

    const ads = (data ?? []).map(normalizeAd) as Ad[];
    const csv = adsToCSV(ads);
    const date = new Date().toISOString().slice(0, 10);

    const driveLink = await backupCsvToDrive({ csv, dateLabel: date });

    return okJson({
      exported: ads.length,
      date,
      driveLink,
    });
  } catch (err) {
    return errorJson("Export failed", 500, String(err));
  }
}
