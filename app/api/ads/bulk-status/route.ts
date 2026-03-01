/**
 * POST /api/ads/bulk-status
 * Server-side mass status update — single Supabase query, not N sequential requests.
 *
 * Body options:
 *   { newStatus: "approved", fromStatus: "pending" }         — approve ALL pending ads
 *   { newStatus: "approved", ids: ["id1","id2",...] }        — approve specific IDs
 *   { newStatus: "approved", fromStatus: "pending", campaignGroupContains: "coat" } — approve trade subset
 */

import { optionsResponse, okJson, errorJson } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase } from "@/lib/server-utils";
import type { AdStatus } from "@/lib/types";

const VALID_STATUSES: AdStatus[] = ["approved", "pending", "paused", "rejected"];

interface BulkRequest {
  newStatus: AdStatus;
  fromStatus?: AdStatus;
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

    if (!body.newStatus || !VALID_STATUSES.includes(body.newStatus)) {
      return errorJson("newStatus is required and must be a valid AdStatus", 400);
    }

    if (!body.ids?.length && !body.fromStatus) {
      return errorJson("Provide either ids[] or fromStatus to target which ads to update", 400);
    }

    if (!hasSupabase()) {
      return errorJson("Supabase not configured — bulk update requires DB", 500);
    }

    let query = supabaseAdmin.from("ads").update({ status: body.newStatus });

    if (body.ids?.length) {
      query = query.in("id", body.ids);
    } else if (body.fromStatus) {
      query = query.eq("status", body.fromStatus);
      if (body.campaignGroupContains) {
        query = query.ilike("campaign_group", `%${body.campaignGroupContains}%`);
      }
    }

    const { error, count } = await query.select("id");

    if (error) {
      return errorJson("Bulk update failed", 500, error.message);
    }

    return okJson({ updated: count ?? "unknown", newStatus: body.newStatus });
  } catch (err) {
    return errorJson("Bulk status update failed", 500, String(err));
  }
}
