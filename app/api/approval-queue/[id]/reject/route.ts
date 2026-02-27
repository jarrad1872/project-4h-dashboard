import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeApprovalItem, readFallback } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as { note?: string };

    if (!hasSupabase()) {
      const queue = readFallback<any[]>(DataFiles.approvalQueue, []).map(normalizeApprovalItem);
      const index = queue.findIndex((item) => item.id === id);
      if (index < 0) {
        return errorJson("Approval item not found", 404);
      }

      const previous = queue[index];
      const now = isoNow();
      const next = {
        ...previous,
        status: "rejected" as const,
        note: payload.note ?? null,
        updated_at: now,
        updatedAt: now,
      };

      queue[index] = next;
      writeJsonFile(DataFiles.approvalQueue, queue.map((item) => ({ ...item, updatedAt: item.updated_at })));

      await logActivity({
        entity_type: "approval",
        entity_id: id,
        action: "rejected",
        old_value: previous,
        new_value: next,
        note: payload.note ?? null,
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
      .update({ status: "rejected", note: payload.note ?? null, updated_at: isoNow() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to reject item", 500, error.message);
    }

    await logActivity({
      entity_type: "approval",
      entity_id: id,
      action: "rejected",
      old_value: existing,
      new_value: data,
      note: payload.note ?? null,
    });

    return okJson(normalizeApprovalItem(data));
  } catch (error) {
    return errorJson("Failed to reject item", 500, String(error));
  }
}
