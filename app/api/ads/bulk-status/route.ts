/**
 * POST /api/ads/bulk-status
 * Server-side mass status/workflow update — single Supabase query.
 */

import { optionsResponse, okJson, errorJson } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase } from "@/lib/server-utils";
import type { AdStatus, WorkflowStage } from "@/lib/types";

interface BulkRequest {
  newStatus?: AdStatus;
  newWorkflowStage?: WorkflowStage;
  fromStatus?: AdStatus;
  fromWorkflowStage?: WorkflowStage;
  ids?: string[];
  campaignGroupContains?: string;
}

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BulkRequest>;

    if (!body.newStatus && !body.newWorkflowStage) {
      return errorJson("newStatus or newWorkflowStage is required", 400);
    }

    if (!body.ids?.length && !body.fromStatus && !body.fromWorkflowStage) {
      return errorJson("Provide either ids[], fromStatus, or fromWorkflowStage to target", 400);
    }

    if (!hasSupabase()) {
      return errorJson("Supabase not configured — bulk update requires DB", 500);
    }

    const updatePayload: any = {};
    if (body.newStatus) updatePayload.status = body.newStatus;
    if (body.newWorkflowStage) updatePayload.workflow_stage = body.newWorkflowStage;

    let query = supabaseAdmin.from("ads").update(updatePayload);

    if (body.ids?.length) {
      query = query.in("id", body.ids);
    } else {
      if (body.fromStatus) query = query.eq("status", body.fromStatus);
      if (body.fromWorkflowStage) query = query.eq("workflow_stage", body.fromWorkflowStage);
      if (body.campaignGroupContains) {
        query = query.ilike("campaign_group", `%${body.campaignGroupContains}%`);
      }
    }

    const { error, count } = await query.select("id");

    if (error) {
      return errorJson("Bulk update failed", 500, error.message);
    }

    return okJson({ updated: count ?? "unknown", status: body.newStatus, stage: body.newWorkflowStage });
  } catch (err) {
    return errorJson("Bulk status update failed", 500, String(err));
  }
}
