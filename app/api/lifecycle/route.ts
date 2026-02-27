import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeLifecycleMessage, readFallback } from "@/lib/server-utils";
import type { LifecycleMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const lifecycle = readFallback<any[]>(DataFiles.lifecycle, []).map(normalizeLifecycleMessage);
      return okJson(lifecycle);
    }

    const { data, error } = await supabaseAdmin.from("lifecycle_messages").select("*").order("timing");

    if (error) {
      return errorJson("Failed to load lifecycle messages", 500, error.message);
    }

    return okJson((data ?? []).map(normalizeLifecycleMessage));
  } catch (error) {
    return errorJson("Failed to load lifecycle messages", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as Partial<LifecycleMessage> & { id?: string; asset_id?: string };
    const id = payload.id ?? payload.asset_id;

    if (!id) {
      return errorJson("id or asset_id is required", 400);
    }

    if (!hasSupabase()) {
      const lifecycle = readFallback<any[]>(DataFiles.lifecycle, []).map(normalizeLifecycleMessage);
      const index = lifecycle.findIndex((item) => item.id === id || item.asset_id === id);
      if (index < 0) {
        return errorJson("Lifecycle message not found", 404);
      }

      const previous = lifecycle[index];
      const next = normalizeLifecycleMessage({
        ...previous,
        ...payload,
        id: previous.id,
        asset_id: previous.asset_id,
        updated_at: isoNow(),
      });

      lifecycle[index] = next;
      writeJsonFile(
        DataFiles.lifecycle,
        lifecycle.map((item) => ({
          ...item,
          updatedAt: item.updated_at,
        })),
      );

      await logActivity({
        entity_type: "lifecycle",
        entity_id: next.id,
        action: "updated",
        old_value: previous,
        new_value: next,
      });

      return okJson(next);
    }

    const { data: existingRows, error: findError } = await supabaseAdmin
      .from("lifecycle_messages")
      .select("*")
      .or(`id.eq.${id},asset_id.eq.${id}`)
      .limit(1);

    if (findError) {
      return errorJson("Failed to load lifecycle message", 500, findError.message);
    }

    const existing = existingRows?.[0];
    if (!existing) {
      return errorJson("Lifecycle message not found", 404);
    }

    const updatePayload: Record<string, unknown> = {};
    if (payload.channel !== undefined) updatePayload.channel = payload.channel;
    if (payload.timing !== undefined) updatePayload.timing = payload.timing;
    if (payload.subject !== undefined) updatePayload.subject = payload.subject;
    if (payload.message !== undefined) updatePayload.message = payload.message;
    if (payload.goal !== undefined) updatePayload.goal = payload.goal;
    if (payload.status !== undefined) updatePayload.status = payload.status;

    const { data, error } = await supabaseAdmin
      .from("lifecycle_messages")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to update lifecycle message", 500, error.message);
    }

    const next = normalizeLifecycleMessage(data);

    await logActivity({
      entity_type: "lifecycle",
      entity_id: next.id,
      action: "updated",
      old_value: normalizeLifecycleMessage(existing),
      new_value: next,
    });

    return okJson(next);
  } catch (error) {
    return errorJson("Failed to update lifecycle message", 500, String(error));
  }
}
