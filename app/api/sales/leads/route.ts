import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { isoNow } from "@/lib/file-db";
import { readSalesLeadsFallback, writeSalesLeadsFallback } from "@/lib/sales-lead-store";
import { getSalesRepAccessStatus, requireSalesWriteAuth } from "@/lib/sales-write-auth";
import {
  canUseSalesStage,
  normalizeSalesLead,
  normalizeSalesStage,
  salesLeadToDb,
  type SalesStage,
} from "@/lib/sales-rep-pipeline";
import { hasSupabase, logActivity } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

const REP_CREATE_STAGES = new Set<SalesStage>(["prospect", "qualified", "visited", "card-left", "demo-booked", "trial-started"]);

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildRepCreateBody(body: Record<string, unknown>, repId: string) {
  const requestedStage = normalizeSalesStage(body.stage);
  if (!REP_CREATE_STAGES.has(requestedStage)) {
    return {
      error: "Rep access can create or move leads through prospect, qualified, visited, card-left, demo-booked, and trial-started only.",
      body: null,
    };
  }

  return {
    error: null,
    body: {
      businessName: optionalString(body.businessName) ?? optionalString(body.business_name),
      city: optionalString(body.city) ?? "Phoenix",
      state: optionalString(body.state) ?? "AZ",
      tradeDomain: "pipe.city",
      leadType: "real",
      stage: requestedStage,
      ownerProfile: optionalString(body.ownerProfile) ?? optionalString(body.owner_profile) ?? "",
      painSignal: optionalString(body.painSignal) ?? optionalString(body.pain_signal) ?? "",
      nextAction: optionalString(body.nextAction) ?? optionalString(body.next_action) ?? "",
      notes: optionalString(body.notes) ?? "",
      repId,
    },
  };
}

function validateLeadInput(body: Record<string, unknown>) {
  const leadType = body.leadType === "real" || body.lead_type === "real" ? "real" : "archetype";
  const stage = normalizeSalesStage(body.stage);

  if (!canUseSalesStage(leadType, stage)) {
    return {
      error:
        "Archetype leads cannot be marked visited, card-left, demo-booked, trial-started, activated, or paid. Create a real lead first.",
    };
  }

  if (!body.businessName && !body.business_name) {
    return { error: "businessName is required" };
  }

  return { error: null };
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    if (!hasSupabase()) {
      return okJson({ leads: readSalesLeadsFallback() });
    }

    const { data, error } = await supabaseAdmin.from("sales_leads").select("*").order("created_at", { ascending: true });
    if (error) {
      return errorJson("Failed to load sales leads", 500, error.message);
    }

    return okJson({ leads: (data ?? []).map((row) => normalizeSalesLead(row as Record<string, unknown>)) });
  } catch (error) {
    return errorJson("Failed to load sales leads", 500, String(error));
  }
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const writeAuthError = requireSalesWriteAuth(request);
  if (writeAuthError) return writeAuthError;
  const access = getSalesRepAccessStatus(request);

  try {
    const rawBody = (await request.json()) as Record<string, unknown>;
    const repCreate = access.mode === "rep-code" && access.repId ? buildRepCreateBody(rawBody, access.repId) : null;
    if (repCreate?.error) return errorJson(repCreate.error, 403);

    const body = (repCreate?.body ?? rawBody) as Record<string, unknown>;
    const validation = validateLeadInput(body);
    if (validation.error) return errorJson(validation.error, 400);

    const now = isoNow();
    const lead = normalizeSalesLead({
      ...body,
      repId: access.mode === "rep-code" && access.repId ? access.repId : typeof body.repId === "string" ? body.repId : undefined,
      id: access.mode === "rep-code" ? crypto.randomUUID() : typeof body.id === "string" ? body.id : crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      trackingCode:
        access.mode === "rep-code"
          ? `AZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
          : typeof body.trackingCode === "string"
          ? body.trackingCode
          : typeof body.tracking_code === "string"
            ? body.tracking_code
            : `AZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    });

    if (!hasSupabase()) {
      const leads = readSalesLeadsFallback();
      leads.unshift(lead);
      writeSalesLeadsFallback(leads);
      await logActivity({
        entity_type: "sales_lead",
        entity_id: lead.id,
        action: "created",
        new_value: lead,
        note: "Q-32 internal field-sales CRM lead created.",
      });
      return okJson(lead, 201);
    }

    const { data, error } = await supabaseAdmin.from("sales_leads").insert(salesLeadToDb(lead)).select("*").single();
    if (error) {
      return errorJson("Failed to create sales lead", 500, error.message);
    }

    const normalized = normalizeSalesLead((data ?? lead) as Record<string, unknown>);
    await logActivity({
      entity_type: "sales_lead",
      entity_id: normalized.id,
      action: "created",
      new_value: normalized,
      note: "Q-32 internal field-sales CRM lead created.",
    });
    return okJson(normalized, 201);
  } catch (error) {
    return errorJson("Failed to create sales lead", 500, String(error));
  }
}
