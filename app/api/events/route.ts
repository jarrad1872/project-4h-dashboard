import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { DataFiles, writeJsonFile } from "@/lib/file-db";
import {
  marketingEventToDb,
  normalizeMarketingEvent,
  summarizeMarketingEvents,
  validateMarketingEvents,
} from "@/lib/marketing-events";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";
import type { MarketingEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return optionsResponse(request);
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const summaryOnly = url.searchParams.get("summary") === "1";
    const limit = summaryOnly ? null : Math.min(1000, Math.max(1, Number(url.searchParams.get("limit") ?? 250)));

    let events: MarketingEvent[];

    if (!hasSupabase()) {
      events = readFallback<MarketingEvent[]>(DataFiles.marketingEvents, []).map(normalizeMarketingEvent);
    } else {
      const baseQuery = supabaseAdmin
        .from("marketing_events")
        .select("*")
        .order("event_at", { ascending: false });

      const query = limit ? baseQuery.limit(limit) : baseQuery;
      const { data, error } = await query;

      if (error) {
        return errorJson("Failed to load marketing events", 500, error.message, request);
      }

      events = (data ?? []).map(normalizeMarketingEvent);
    }

    const summary = summarizeMarketingEvents(events);
    return okJson(summaryOnly ? { summary } : { events, summary }, 200, request);
  } catch (error) {
    return errorJson("Failed to load marketing events", 500, String(error), request);
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!process.env.PUMPCANS_API_TOKEN || authHeader !== `Bearer ${process.env.PUMPCANS_API_TOKEN}`) {
    return errorJson("Unauthorized", 401, undefined, request);
  }

  const rl = checkRateLimit(rateLimitKey(request), { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return errorJson("Rate limit exceeded", 429, { retryAfterMs: rl.retryAfterMs }, request);
  }

  try {
    const body = await request.json();
    const { events, errors } = validateMarketingEvents(body);

    if (events.length === 0) {
      return errorJson("No valid marketing events", 400, errors, request);
    }

    if (!hasSupabase()) {
      const current = readFallback<MarketingEvent[]>(DataFiles.marketingEvents, []);
      const existingKeys = new Set(current.map((event) => event.event_key ?? event.id));
      const newEvents = events.filter((event) => !existingKeys.has(event.event_key ?? event.id));
      const next = [...newEvents, ...current].slice(0, 5000);
      writeJsonFile(DataFiles.marketingEvents, next);
    } else {
      const { error } = await supabaseAdmin
        .from("marketing_events")
        .upsert(events.map(marketingEventToDb), { onConflict: "event_key" });

      if (error) {
        return errorJson("Failed to save marketing events", 500, error.message, request);
      }
    }

    await logActivity({
      entity_type: "marketing_event",
      entity_id: events.length === 1 ? events[0].id : "batch",
      action: "created",
      new_value: { count: events.length, errors: errors.length ? errors : undefined },
    });

    return okJson({ inserted: events.length, errors: errors.length ? errors : undefined }, 201, request);
  } catch (error) {
    return errorJson("Failed to save marketing events", 500, String(error), request);
  }
}
