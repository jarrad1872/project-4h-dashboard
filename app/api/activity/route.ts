import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, readFallback } from "@/lib/server-utils";
import type { ActivityLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const activity = readFallback<ActivityLog[]>(DataFiles.activity, [])
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 20);
      return okJson(activity);
    }

    const { data, error } = await supabaseAdmin
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return errorJson("Failed to load activity log", 500, error.message);
    }

    return okJson(data ?? []);
  } catch (error) {
    return errorJson("Failed to load activity log", 500, String(error));
  }
}
