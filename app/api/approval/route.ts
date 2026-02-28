import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, isoNow, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeApprovalItem, readFallback } from "@/lib/server-utils";
import type { ApprovalItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** Map a pending ad row into the ApprovalItem shape used by the UI */
function adToApprovalItem(ad: Record<string, any>): ApprovalItem {
  const lines: string[] = [];
  if (ad.headline) lines.push(`**${ad.headline}**`);
  if (ad.primary_text) lines.push(ad.primary_text);
  if (ad.cta) lines.push(`CTA: ${ad.cta}`);
  if (ad.utm_campaign) lines.push(`UTM: ${ad.utm_campaign}`);
  return normalizeApprovalItem({
    id: ad.id,
    type: "ad_copy",
    title: `[${(ad.platform ?? "").toUpperCase()}] ${ad.headline ?? ad.id}`,
    content: lines.join("\n\n"),
    status: "pending",
    note: null,
    source: "ads",
    platform: ad.platform ?? null,
    campaign_group: ad.campaign_group ?? null,
    format: ad.format ?? null,
    created_at: ad.created_at ?? isoNow(),
    updated_at: ad.updated_at ?? isoNow(),
  });
}

export async function GET() {
  try {
    if (!hasSupabase()) {
      const queue = readFallback<any[]>(DataFiles.approvalQueue, []).map(normalizeApprovalItem);
      return okJson(queue);
    }

    // Pull approval_queue items
    const { data: queueData, error: queueError } = await supabaseAdmin
      .from("approval_queue")
      .select("*")
      .order("updated_at", { ascending: false });

    if (queueError) {
      return errorJson("Failed to load approval queue", 500, queueError.message);
    }

    // Pull pending ads from the ads table
    const { data: pendingAds, error: adsError } = await supabaseAdmin
      .from("ads")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (adsError) {
      return errorJson("Failed to load pending ads", 500, adsError.message);
    }

    const queueItems = (queueData ?? []).map(normalizeApprovalItem);
    const adItems = (pendingAds ?? []).map(adToApprovalItem);

    // Ad copy items first (action-required), then checklist items
    return okJson([...adItems, ...queueItems]);
  } catch (error) {
    return errorJson("Failed to load approval queue", 500, String(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: string;
      status?: ApprovalItem["status"];
      note?: string | null;
      source?: string;
    };

    if (!payload.id || !payload.status) {
      return errorJson("id and status are required", 400);
    }

    if (!hasSupabase()) {
      const queue = readFallback<any[]>(DataFiles.approvalQueue, []).map(normalizeApprovalItem);
      const index = queue.findIndex((item) => item.id === payload.id);
      if (index < 0) return errorJson("Approval item not found", 404);

      const previous = queue[index];
      const now = isoNow();
      const next = { ...previous, status: payload.status, note: payload.note ?? previous.note ?? null, updated_at: now, updatedAt: now };
      queue[index] = next;
      writeJsonFile(DataFiles.approvalQueue, queue.map((item) => ({ ...item, updatedAt: item.updated_at })));
      await logActivity({ entity_type: "approval", entity_id: payload.id, action: payload.status, old_value: previous, new_value: next, note: payload.note ?? null });
      return okJson(next);
    }

    // Determine source: explicit "source" field or detect by checking if it's an ad ID
    const isAdSource = payload.source === "ads" || /^(RINSE|MOW|ROOTER|SAW|LI|YT|FB|IG|META)-/.test(payload.id);

    if (isAdSource) {
      // Map approval decision to ads.status enum
      const adsStatus =
        payload.status === "approved" ? "approved" :
        payload.status === "rejected" ? "rejected" :
        "pending"; // revise → stays pending

      const { data: existing, error: existingError } = await supabaseAdmin
        .from("ads")
        .select("*")
        .eq("id", payload.id)
        .maybeSingle();

      if (existingError) return errorJson("Failed to load ad", 500, existingError.message);
      if (!existing) return errorJson("Ad not found", 404);

      const { data, error } = await supabaseAdmin
        .from("ads")
        .update({
          status: adsStatus,
          workflow_stage: payload.status === "approved" ? "approved" : payload.status === "rejected" ? "rejected" : "revision_requested",
          updated_at: isoNow(),
        })
        .eq("id", payload.id)
        .select("*")
        .single();

      if (error) return errorJson("Failed to update ad", 500, error.message);

      await logActivity({ entity_type: "ad", entity_id: payload.id, action: payload.status, old_value: existing, new_value: data, note: payload.note ?? null });

      return okJson(adToApprovalItem(data));
    }

    // approval_queue path
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("approval_queue")
      .select("*")
      .eq("id", payload.id)
      .maybeSingle();

    if (existingError) return errorJson("Failed to load approval item", 500, existingError.message);
    if (!existing) return errorJson("Approval item not found", 404);

    const { data, error } = await supabaseAdmin
      .from("approval_queue")
      .update({ status: payload.status, note: payload.note ?? existing.note ?? null, updated_at: isoNow() })
      .eq("id", payload.id)
      .select("*")
      .single();

    if (error) return errorJson("Failed to update approval item", 500, error.message);

    await logActivity({ entity_type: "approval", entity_id: payload.id, action: payload.status, old_value: existing, new_value: data, note: payload.note ?? null });

    return okJson(normalizeApprovalItem(data));
  } catch (error) {
    return errorJson("Failed to update approval item", 500, String(error));
  }
}
