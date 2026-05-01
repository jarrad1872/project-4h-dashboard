import { errorJson, okJson } from "@/lib/api";
import { FIELD_SALES_CAMPAIGN, FIELD_SALES_UTM_MEDIUM, salesReps } from "@/lib/sales-rep-pipeline";
import { DataFiles, writeJsonFile } from "@/lib/file-db";
import {
  isLegacyEventNameRequiredError,
  marketingEventToDb,
  marketingEventToLegacyEventNameDb,
  validateMarketingEvent,
} from "@/lib/marketing-events";
import { hasSupabase, logActivity, readFallback } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase";
import type { MarketingEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

function clean(value: string | null, fallback = "") {
  return (value ?? fallback).trim();
}

function tradeSlug(value: string | null) {
  return clean(value, "pipe.city").replace(/^https?:\/\//, "").split("/")[0].replace(/\.city$/, "").toLowerCase();
}

async function saveEvent(event: MarketingEvent) {
  if (!hasSupabase()) {
    const current = readFallback<MarketingEvent[]>(DataFiles.marketingEvents, []);
    if (!current.some((row) => row.event_key === event.event_key)) {
      writeJsonFile(DataFiles.marketingEvents, [event, ...current].slice(0, 5000));
    }
    return;
  }

  const { error } = await supabaseAdmin.from("marketing_events").upsert(marketingEventToDb(event), { onConflict: "event_key" });
  if (!error) return;

  if (isLegacyEventNameRequiredError(error)) {
    const retry = await supabaseAdmin
      .from("marketing_events")
      .upsert(marketingEventToLegacyEventNameDb(event), { onConflict: "event_key" });
    if (!retry.error) return;
    throw new Error(retry.error.message);
  }

  throw new Error(error.message);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const now = new Date();
  const rep = salesReps.find((candidate) => candidate.code === url.searchParams.get("rep")) ?? salesReps[0];
  const cardId = clean(url.searchParams.get("card"), "dustin-pipe-proof-sheet");
  const cardInstance = clean(url.searchParams.get("card_id"), cardId);
  const eventType = url.searchParams.get("event_type") === "demo_call" ? "demo_call" : "asset_view";
  const trade = tradeSlug(url.searchParams.get("trade_domain"));
  const utmCampaign = clean(url.searchParams.get("utm_campaign"), FIELD_SALES_CAMPAIGN);
  const utmContent = clean(url.searchParams.get("utm_content"), `${rep.code}_${cardId}_${cardInstance}`);
  const scanId = clean(url.searchParams.get("session_id") ?? url.searchParams.get("scan_id"), crypto.randomUUID());
  const eventKey = [
    "field-sales",
    eventType,
    rep.code,
    cardId,
    cardInstance,
    scanId,
  ].join("|");

  const { event, errors } = validateMarketingEvent({
    event_key: eventKey,
    event_type: eventType,
    event_at: now.toISOString(),
    platform: "multi",
    trade_slug: trade,
    creative_asset_id: cardId,
    variant_id: cardInstance,
    session_id: scanId,
    utm_source: rep.code.toLowerCase(),
    utm_medium: FIELD_SALES_UTM_MEDIUM,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: clean(url.searchParams.get("utm_term"), "phoenix_metro_trade_smb"),
    metadata: {
      rep: rep.code,
      rep_id: rep.id,
      card: cardId,
      card_id: cardInstance,
      scan_id: scanId,
      trade_domain: `${trade}.city`,
      source: "dustin-field-card",
    },
  }, now);

  if (!event) return errorJson("Invalid field-sales tracking event", 400, errors, request);

  try {
    await saveEvent(event);
    await logActivity({
      entity_type: "field_sales_event",
      entity_id: event.event_key ?? event.id,
      action: "created",
      new_value: event,
      note: "Dustin field-sales card scan/demo intent logged.",
    });
  } catch (error) {
    return errorJson("Failed to log field-sales event", 500, String(error), request);
  }

  if (url.searchParams.get("format") === "json") {
    return okJson({ event, next: `/sales/dustin?${url.searchParams.toString()}` }, 201, request);
  }

  const next = new URL("/sales/dustin", url.origin);
  for (const [key, value] of url.searchParams.entries()) {
    next.searchParams.set(key, value);
  }
  next.searchParams.set("tracked", "1");
  return Response.redirect(next, 302);
}
