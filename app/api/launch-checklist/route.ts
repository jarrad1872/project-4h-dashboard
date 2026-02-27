import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeLaunchChecklistItem, readFallback } from "@/lib/server-utils";
import type { LaunchChecklistItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const checklist = readFallback<any[]>(DataFiles.launchChecklist, []).map(normalizeLaunchChecklistItem);
      return okJson(checklist);
    }

    const { data, error } = await supabaseAdmin.from("launch_checklist").select("*").order("platform");

    if (error) {
      return errorJson("Failed to load launch checklist", 500, error.message);
    }

    return okJson((data ?? []).map(normalizeLaunchChecklistItem));
  } catch (error) {
    return errorJson("Failed to load launch checklist", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: string;
      checked?: boolean;
      markAll?: boolean;
    };

    if (!hasSupabase()) {
      const checklist = readFallback<any[]>(DataFiles.launchChecklist, []).map(normalizeLaunchChecklistItem);

      if (payload.markAll) {
        const now = isoNow();
        const updated = checklist.map((item) => ({ ...item, checked: true, updated_at: now, updatedAt: now }));
        writeJsonFile(DataFiles.launchChecklist, updated.map((item) => ({ ...item, updatedAt: item.updated_at })));

        await logActivity({
          entity_type: "checklist",
          entity_id: "all",
          action: "marked_all_ready",
          new_value: updated,
        });

        return okJson(updated);
      }

      if (!payload.id) {
        return errorJson("id is required", 400);
      }

      const index = checklist.findIndex((item) => item.id === payload.id);
      if (index < 0) {
        return errorJson("Checklist item not found", 404);
      }

      const previous = checklist[index];
      const updatedAt = isoNow();
      const next: LaunchChecklistItem = {
        ...previous,
        checked: payload.checked ?? !previous.checked,
        updated_at: updatedAt,
        updatedAt,
      };

      checklist[index] = next;
      writeJsonFile(DataFiles.launchChecklist, checklist.map((item) => ({ ...item, updatedAt: item.updated_at })));

      await logActivity({
        entity_type: "checklist",
        entity_id: next.id,
        action: "toggled",
        old_value: previous,
        new_value: next,
      });

      return okJson(next);
    }

    if (payload.markAll) {
      const now = isoNow();
      const { data, error } = await supabaseAdmin
        .from("launch_checklist")
        .update({ checked: true, updated_at: now })
        .neq("checked", true)
        .select("*");

      if (error) {
        return errorJson("Failed to update launch checklist", 500, error.message);
      }

      await logActivity({
        entity_type: "checklist",
        entity_id: "all",
        action: "marked_all_ready",
        new_value: data,
      });

      const { data: allRows } = await supabaseAdmin.from("launch_checklist").select("*").order("platform");
      return okJson((allRows ?? []).map(normalizeLaunchChecklistItem));
    }

    if (!payload.id) {
      return errorJson("id is required", 400);
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("launch_checklist")
      .select("*")
      .eq("id", payload.id)
      .maybeSingle();

    if (existingError) {
      return errorJson("Failed to load checklist item", 500, existingError.message);
    }

    if (!existing) {
      return errorJson("Checklist item not found", 404);
    }

    const nextChecked = payload.checked ?? !existing.checked;
    const updatedAt = isoNow();

    const { data, error } = await supabaseAdmin
      .from("launch_checklist")
      .update({ checked: nextChecked, updated_at: updatedAt })
      .eq("id", payload.id)
      .select("*")
      .single();

    if (error) {
      return errorJson("Failed to update launch checklist", 500, error.message);
    }

    const next = normalizeLaunchChecklistItem(data);

    await logActivity({
      entity_type: "checklist",
      entity_id: next.id,
      action: "toggled",
      old_value: normalizeLaunchChecklistItem(existing),
      new_value: next,
    });

    return okJson(next);
  } catch (error) {
    return errorJson("Failed to update launch checklist", 500, String(error));
  }
}
