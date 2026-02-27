import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeApprovalItem, readFallback } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!hasSupabase()) {
      const queue = readFallback<any[]>(DataFiles.approvalQueue, []).map(normalizeApprovalItem);
      const index = queue.findIndex((item) => item.id === id);
      if (index < 0) {
        return errorJson("Approval item not found", 404);
      }

      const previous = queue[index];
      const next = {
        ...previous,
        status: "approved" as const,
        updated_at: isoNow(),
        updatedAt: isoNow(),
      };

      queue[index] = next;
      writeJsonFile(DataFiles.approvalQueue, queue.map((item) => ({ ...item, updatedAt: item.updated_at })));

      await logActivity({
        entity_type: "approval",
        entity_id: id,
        action: "approved",
        old_value: previous,
        new_value: next,
      });

      return okJson(next);
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("approval_queue")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return errorJson("Failed to load approval item", 500, existingError.message);
    }

    if (!existing) {
      return errorJson("Approval item not found", 404);
    }

    const { data, error } = await supabaseAdmin
      .from("approval_queue")
      .update({ status: "approved", updated_at: isoNow() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to approve item", 500, error.message);
    }

    await logActivity({
      entity_type: "approval",
      entity_id: id,
      action: "approved",
      old_value: existing,
      new_value: data,
    });

    return okJson(normalizeApprovalItem(data));
  } catch (error) {
    return errorJson("Failed to approve item", 500, String(error));
  }
}
