import type {
  CreativeAssetPlatform,
  MarketingEvent,
  MarketingEventFunnelCounts,
  MarketingEventSummary,
  MarketingEventType,
} from "@/lib/types";

export const MARKETING_EVENT_TYPES = [
  "asset_view",
  "demo_call",
  "signup",
  "trial_started",
  "activated",
  "paid",
] as const satisfies readonly MarketingEventType[];

const VALID_PLATFORMS = ["linkedin", "youtube", "facebook", "instagram", "multi"] as const;

type MarketingEventInput = Partial<Omit<MarketingEvent, "id" | "created_at" | "metadata">> & {
  id?: string;
  event_key?: string;
  created_at?: string;
  metadata?: unknown;
  occurred_at?: string;
};

export interface MarketingEventValidationResult {
  event: MarketingEvent | null;
  errors: string[];
}

function nullableString(value: unknown, maxLength = 180): string | null {
  if (value === undefined || value === null || value === "") return null;
  return String(value).trim().slice(0, maxLength);
}

function metadataObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function emptyTypeCounts(): Record<MarketingEventType, number> {
  return {
    asset_view: 0,
    demo_call: 0,
    signup: 0,
    trial_started: 0,
    activated: 0,
    paid: 0,
  };
}

function emptyFunnelCounts(): MarketingEventFunnelCounts {
  return {
    total: 0,
    asset_view: 0,
    demo_call: 0,
    signup: 0,
    trial_started: 0,
    activated: 0,
    paid: 0,
    paidValueCents: 0,
  };
}

function addDimensionEvent(
  rows: Record<string, MarketingEventFunnelCounts>,
  key: string | null,
  event: MarketingEvent,
) {
  if (!key) return;
  rows[key] ??= emptyFunnelCounts();
  rows[key].total += 1;
  rows[key][event.event_type] += 1;
  if (event.event_type === "paid") rows[key].paidValueCents += event.value_cents;
}

function isUuid(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function deriveEventKey(input: MarketingEventInput, eventAt: string): string {
  return [
    input.event_type,
    input.tenant_id,
    input.visitor_id,
    input.session_id,
    input.contact_id,
    input.creator_id,
    input.creative_asset_id,
    input.trade_slug,
    input.platform,
    input.angle,
    input.variant_id,
    input.utm_campaign,
    input.utm_content,
    eventAt,
  ].map((value) => nullableString(value, 120) ?? "-").join("|");
}

export function validateMarketingEvent(input: MarketingEventInput, now = new Date()): MarketingEventValidationResult {
  const errors: string[] = [];
  const eventType = input.event_type;

  if (!eventType || !MARKETING_EVENT_TYPES.includes(eventType)) {
    errors.push(`event_type must be one of: ${MARKETING_EVENT_TYPES.join(", ")}`);
  }

  const platform = nullableString(input.platform) as CreativeAssetPlatform | null;
  if (platform && !VALID_PLATFORMS.includes(platform as (typeof VALID_PLATFORMS)[number])) {
    errors.push(`platform must be one of: ${VALID_PLATFORMS.join(", ")}`);
  }

  const tradeSlug = nullableString(input.trade_slug, 80);
  if (tradeSlug && !/^[a-z0-9-]+$/.test(tradeSlug)) {
    errors.push("trade_slug must be lowercase letters, numbers, or hyphens");
  }

  const eventAt = nullableString(input.event_at ?? input.occurred_at) ?? now.toISOString();
  if (Number.isNaN(Date.parse(eventAt))) {
    errors.push("event_at must be a valid ISO date");
  }

  const valueCents = Number(input.value_cents ?? 0);
  if (!Number.isFinite(valueCents) || valueCents < 0) {
    errors.push("value_cents must be a non-negative number");
  }

  if (errors.length > 0 || !eventType) {
    return { event: null, errors };
  }

  const inputId = nullableString(input.id);
  const eventKey = nullableString(input.event_key ?? (!isUuid(inputId) ? inputId : null)) ?? deriveEventKey(input, eventAt);

  return {
    event: {
      id: isUuid(inputId) ? inputId : crypto.randomUUID(),
      event_key: eventKey,
      event_type: eventType,
      event_at: eventAt,
      tenant_id: nullableString(input.tenant_id),
      visitor_id: nullableString(input.visitor_id),
      platform,
      trade_slug: tradeSlug,
      creator_id: nullableString(input.creator_id),
      creative_asset_id: nullableString(input.creative_asset_id),
      angle: nullableString(input.angle, 80),
      variant_id: nullableString(input.variant_id),
      utm_source: nullableString(input.utm_source),
      utm_medium: nullableString(input.utm_medium),
      utm_campaign: nullableString(input.utm_campaign),
      utm_content: nullableString(input.utm_content),
      utm_term: nullableString(input.utm_term),
      session_id: nullableString(input.session_id),
      contact_id: nullableString(input.contact_id),
      value_cents: Math.round(valueCents),
      metadata: metadataObject(input.metadata),
      created_at: nullableString(input.created_at) ?? now.toISOString(),
    },
    errors: [],
  };
}

export function validateMarketingEvents(input: unknown, now = new Date()) {
  const rows = Array.isArray(input)
    ? input
    : Array.isArray((input as { events?: unknown[] } | null)?.events)
      ? (input as { events: unknown[] }).events
      : [input];

  const events: MarketingEvent[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const result = validateMarketingEvent(row as MarketingEventInput, now);
    if (result.event) events.push(result.event);
    for (const error of result.errors) {
      errors.push(`Row ${index}: ${error}`);
    }
  });

  return { events, errors };
}

export function marketingEventToDb(event: MarketingEvent) {
  return {
    id: event.id,
    event_key: event.event_key,
    event_type: event.event_type,
    event_at: event.event_at,
    tenant_id: event.tenant_id,
    visitor_id: event.visitor_id,
    platform: event.platform,
    trade_slug: event.trade_slug,
    creator_id: event.creator_id,
    creative_asset_id: event.creative_asset_id,
    angle: event.angle,
    variant_id: event.variant_id,
    utm_source: event.utm_source,
    utm_medium: event.utm_medium,
    utm_campaign: event.utm_campaign,
    utm_content: event.utm_content,
    utm_term: event.utm_term,
    session_id: event.session_id,
    contact_id: event.contact_id,
    value_cents: event.value_cents,
    metadata: event.metadata,
    created_at: event.created_at,
  };
}

export function marketingEventToLegacyEventNameDb(event: MarketingEvent) {
  return {
    ...marketingEventToDb(event),
    event_name: event.event_type,
  };
}

export function isLegacyEventNameRequiredError(error: { message?: string } | null | undefined) {
  const message = String(error?.message ?? "").toLowerCase();
  return message.includes("event_name") && message.includes("not-null");
}

export function normalizeMarketingEvent(input: MarketingEvent | { [key: string]: unknown }): MarketingEvent {
  const row = input as { [key: string]: unknown };
  return {
    id: String(row.id),
    event_key: (row.event_key as string | null | undefined) ?? null,
    event_type: row.event_type as MarketingEventType,
    event_at: String(row.event_at ?? row.occurred_at),
    tenant_id: (row.tenant_id as string | null | undefined) ?? null,
    visitor_id: (row.visitor_id as string | null | undefined) ?? null,
    platform: (row.platform as CreativeAssetPlatform | null | undefined) ?? null,
    trade_slug: (row.trade_slug as string | null | undefined) ?? null,
    creator_id: (row.creator_id as string | null | undefined) ?? null,
    creative_asset_id: (row.creative_asset_id as string | null | undefined) ?? null,
    angle: (row.angle as string | null | undefined) ?? null,
    variant_id: (row.variant_id as string | null | undefined) ?? null,
    utm_source: (row.utm_source as string | null | undefined) ?? null,
    utm_medium: (row.utm_medium as string | null | undefined) ?? null,
    utm_campaign: (row.utm_campaign as string | null | undefined) ?? null,
    utm_content: (row.utm_content as string | null | undefined) ?? null,
    utm_term: (row.utm_term as string | null | undefined) ?? null,
    session_id: (row.session_id as string | null | undefined) ?? null,
    contact_id: (row.contact_id as string | null | undefined) ?? null,
    value_cents: Number(row.value_cents ?? 0),
    metadata: metadataObject(row.metadata),
    created_at: String(row.created_at ?? row.event_at ?? row.occurred_at),
  };
}

export function summarizeMarketingEvents(events: MarketingEvent[]): MarketingEventSummary {
  const summary: MarketingEventSummary = {
    total: events.length,
    byType: emptyTypeCounts(),
    byPlatform: {},
    byTrade: {},
    byAngle: {},
    dimensions: {
      trades: {},
      creators: {},
      creativeAssets: {},
      angles: {},
    },
    paidValueCents: 0,
  };

  for (const event of events) {
    summary.byType[event.event_type] += 1;
    if (event.platform) summary.byPlatform[event.platform] = (summary.byPlatform[event.platform] ?? 0) + 1;
    if (event.trade_slug) summary.byTrade[event.trade_slug] = (summary.byTrade[event.trade_slug] ?? 0) + 1;
    if (event.angle) summary.byAngle[event.angle] = (summary.byAngle[event.angle] ?? 0) + 1;
    if (event.event_type === "paid") summary.paidValueCents += event.value_cents;
    addDimensionEvent(summary.dimensions.trades, event.trade_slug, event);
    addDimensionEvent(summary.dimensions.creators, event.creator_id, event);
    addDimensionEvent(summary.dimensions.creativeAssets, event.creative_asset_id, event);
    addDimensionEvent(summary.dimensions.angles, event.angle, event);
  }

  return summary;
}
