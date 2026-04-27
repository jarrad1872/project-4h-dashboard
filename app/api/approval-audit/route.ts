import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { buildApprovalAuditSummary } from "@/lib/approval-audit-log";
import { DataFiles } from "@/lib/file-db";
import { hasSupabase, readFallback } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";
import type { ActivityLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      const logs = readFallback<ActivityLog[]>(DataFiles.activity, []);
      return okJson(buildApprovalAuditSummary(logs, logs.length ? "fallback" : "empty"));
    }

    const { data, error } = await supabaseAdmin
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return okJson(buildApprovalAuditSummary([], "unavailable"));
    }

    return okJson(buildApprovalAuditSummary((data ?? []) as ActivityLog[], data?.length ? "supabase" : "empty"));
  } catch (error) {
    return errorJson("Failed to load approval audit", 500, String(error));
  }
}
