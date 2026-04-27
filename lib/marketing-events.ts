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

export function normalizeMarketingEvent(input: any): MarketingEvent {
  return {
    id: String(input.id),
    event_key: input.event_key ?? null,
    event_type: input.event_type,
    event_at: String(input.event_at ?? input.occurred_at),
    tenant_id: input.tenant_id ?? null,
    visitor_id: input.visitor_id ?? null,
    platform: input.platform ?? null,
    trade_slug: input.trade_slug ?? null,
    creator_id: input.creator_id ?? null,
    creative_asset_id: input.creative_asset_id ?? null,
    angle: input.angle ?? null,
    variant_id: input.variant_id ?? null,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_content: input.utm_content ?? null,
    utm_term: input.utm_term ?? null,
    session_id: input.session_id ?? null,
    contact_id: input.contact_id ?? null,
    value_cents: Number(input.value_cents ?? 0),
    metadata: metadataObject(input.metadata),
    created_at: String(input.created_at ?? input.event_at ?? input.occurred_at),
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
