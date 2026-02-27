import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, normalizeApprovalItem, readFallback } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const queue = readFallback<any[]>(DataFiles.approvalQueue, []).map(normalizeApprovalItem);
      return okJson(queue);
    }

    const { data, error } = await supabaseAdmin
      .from("approval_queue")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return errorJson("Failed to load approval queue", 500, error.message);
    }

    return okJson((data ?? []).map(normalizeApprovalItem));
  } catch (error) {
    return errorJson("Failed to load approval queue", 500, String(error));
  }
}
