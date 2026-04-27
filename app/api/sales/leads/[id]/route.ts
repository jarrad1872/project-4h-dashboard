import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { isoNow } from "@/lib/file-db";
import { readSalesLeadsFallback, writeSalesLeadsFallback } from "@/lib/sales-lead-store";
import { requireSalesWriteAuth } from "@/lib/sales-write-auth";
import {
  canUseSalesStage,
  canReclassifySalesLead,
  normalizeSalesLead,
  normalizeSalesStage,
  salesLeadToDb,
} from "@/lib/sales-rep-pipeline";
import { hasSupabase, logActivity } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

function buildPatch(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  for (const [from, to] of [
    ["businessName", "businessName"],
    ["business_name", "businessName"],
    ["city", "city"],
    ["state", "state"],
    ["tradeDomain", "tradeDomain"],
    ["trade_domain", "tradeDomain"],
    ["stage", "stage"],
    ["leadType", "leadType"],
    ["lead_type", "leadType"],
    ["ownerProfile", "ownerProfile"],
    ["owner_profile", "ownerProfile"],
    ["painSignal", "painSignal"],
    ["pain_signal", "painSignal"],
    ["nextAction", "nextAction"],
    ["next_action", "nextAction"],
    ["lastTouchedAt", "lastTouchedAt"],
    ["last_touched_at", "lastTouchedAt"],
    ["trackingCode", "trackingCode"],
    ["tracking_code", "trackingCode"],
    ["notes", "notes"],
  ] as const) {
    if (body[from] !== undefined) patch[to] = body[from];
  }
  return patch;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const writeAuthError = requireSalesWriteAuth(request);
  if (writeAuthError) return writeAuthError;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const patch = buildPatch(body);

    if (Object.keys(patch).length === 0) {
      return errorJson("No fields to update", 400);
    }

    const requestedLeadType = patch.leadType === "real" ? "real" : patch.leadType === "archetype" ? "archetype" : null;
    const requestedStage = patch.stage !== undefined ? normalizeSalesStage(patch.stage) : null;

    if (!hasSupabase()) {
      const leads = readSalesLeadsFallback();
      const index = leads.findIndex((lead) => lead.id === id);
      if (index < 0) return errorJson("Sales lead not found", 404);

      const previous = leads[index];
      if (requestedLeadType && !canReclassifySalesLead(previous.leadType, requestedLeadType)) {
        return errorJson("Create a new real lead instead of reclassifying an archetype row.", 400);
      }
      const nextType = requestedLeadType ?? previous.leadType;
      const nextStage = requestedStage ?? previous.stage;
      if (!canUseSalesStage(nextType, nextStage)) {
        return errorJson(
          "Archetype leads cannot be marked visited, card-left, demo-booked, trial-started, activated, or paid. Create a real lead first.",
          400,
        );
      }

      const next = normalizeSalesLead({ ...previous, ...patch, id, updatedAt: isoNow() });
      leads[index] = next;
      writeSalesLeadsFallback(leads);
      await logActivity({
        entity_type: "sales_lead",
        entity_id: id,
        action: "updated",
        old_value: previous,
        new_value: next,
        note: "Q-32 internal field-sales CRM lead updated.",
      });
      return okJson(next);
    }

    const { data: existing, error: loadError } = await supabaseAdmin.from("sales_leads").select("*").eq("id", id).single();
    if (loadError) return errorJson("Failed to load sales lead", 500, loadError.message);
    if (!existing) return errorJson("Sales lead not found", 404);

    const previous = normalizeSalesLead(existing as Record<string, unknown>);
    if (requestedLeadType && !canReclassifySalesLead(previous.leadType, requestedLeadType)) {
      return errorJson("Create a new real lead instead of reclassifying an archetype row.", 400);
    }
    const nextType = requestedLeadType ?? previous.leadType;
    const nextStage = requestedStage ?? previous.stage;
    if (!canUseSalesStage(nextType, nextStage)) {
      return errorJson(
        "Archetype leads cannot be marked visited, card-left, demo-booked, trial-started, activated, or paid. Create a real lead first.",
        400,
      );
    }

    const next = normalizeSalesLead({ ...previous, ...patch, id, updatedAt: isoNow() });
    const { data, error } = await supabaseAdmin.from("sales_leads").update(salesLeadToDb(next)).eq("id", id).select("*").single();
    if (error) return errorJson("Failed to update sales lead", 500, error.message);

    const normalized = normalizeSalesLead((data ?? next) as Record<string, unknown>);
    await logActivity({
      entity_type: "sales_lead",
      entity_id: id,
      action: "updated",
      old_value: previous,
      new_value: normalized,
      note: "Q-32 internal field-sales CRM lead updated.",
    });
    return okJson(normalized);
  } catch (error) {
    return errorJson("Failed to update sales lead", 500, String(error));
  }
}
