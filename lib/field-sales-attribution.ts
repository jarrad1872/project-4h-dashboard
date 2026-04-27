import { FIELD_SALES_UTM_MEDIUM, salesCardVariants, salesReps, slugifySalesValue } from "@/lib/sales-rep-pipeline";
import type { MarketingEvent, MarketingEventType } from "@/lib/types";

export interface FieldSalesAttributionBucket {
  key: string;
  label: string;
  total: number;
  asset_view: number;
  demo_call: number;
  signup: number;
  trial_started: number;
  activated: number;
  paid: number;
  paidValueCents: number;
  lastEventAt: string | null;
}

export interface FieldSalesAttributionSummary extends FieldSalesAttributionBucket {
  fieldSalesEvents: number;
  cardScans: number;
  demoCalls: number;
  signups: number;
  trialStarts: number;
  activations: number;
  paidCustomers: number;
  topReps: FieldSalesAttributionBucket[];
  topCards: FieldSalesAttributionBucket[];
  topTrades: FieldSalesAttributionBucket[];
  nextAction: string;
  evidence: string;
}

const UNKNOWN_REP = "unattributed-rep";
const UNKNOWN_CARD = "unattributed-card";
const UNKNOWN_TRADE = "unknown-trade";

function emptyBucket(key: string, label = key): FieldSalesAttributionBucket {
  return {
    key,
    label,
    total: 0,
    asset_view: 0,
    demo_call: 0,
    signup: 0,
    trial_started: 0,
    activated: 0,
    paid: 0,
    paidValueCents: 0,
    lastEventAt: null,
  };
}

function metadataString(event: MarketingEvent, keys: string[]) {
  for (const key of keys) {
    const value = event.metadata[key];
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return null;
}

function normalizeKey(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  return slugifySalesValue(value, fallback);
}

function normalizeCampaign(value: string | null) {
  return normalizeKey(value, "").replace(/-/g, "_");
}

function labelForRep(key: string) {
  const rep = salesReps.find((candidate) => {
    const id = normalizeKey(candidate.id, candidate.id);
    const code = normalizeKey(candidate.code, candidate.id);
    return id === key || code === key;
  });
  return rep ? rep.name : key;
}

function labelForCard(key: string) {
  const card = salesCardVariants.find((candidate) => normalizeKey(candidate.id, candidate.id) === key);
  return card ? card.label : key;
}

function labelForTrade(key: string) {
  if (key === UNKNOWN_TRADE) return "Unknown trade";
  return key.endsWith("-city") ? key.replace(/-city$/, ".city") : key;
}

function getBucket(rows: Record<string, FieldSalesAttributionBucket>, key: string, label: string) {
  rows[key] ??= emptyBucket(key, label);
  return rows[key];
}

function addEvent(bucket: FieldSalesAttributionBucket, event: MarketingEvent) {
  bucket.total += 1;
  bucket[event.event_type] += 1;
  if (event.event_type === "paid") bucket.paidValueCents += event.value_cents;
  if (!bucket.lastEventAt || event.event_at > bucket.lastEventAt) bucket.lastEventAt = event.event_at;
}

function sortBuckets(rows: Record<string, FieldSalesAttributionBucket>) {
  return Object.values(rows).sort((a, b) => {
    const scoreA = a.paid * 1000 + a.activated * 250 + a.trial_started * 100 + a.signup * 40 + a.demo_call * 20 + a.asset_view;
    const scoreB = b.paid * 1000 + b.activated * 250 + b.trial_started * 100 + b.signup * 40 + b.demo_call * 20 + b.asset_view;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.total - a.total;
  });
}

export function isFieldSalesEvent(event: MarketingEvent) {
  const metadataMedium = metadataString(event, ["utm_medium", "medium", "source_medium"]);
  const metadataChannel = metadataString(event, ["channel", "source_channel"]);
  const campaign = normalizeCampaign(event.utm_campaign);
  const metadataCampaign = normalizeCampaign(metadataString(event, ["utm_campaign", "campaign"]));

  return (
    event.utm_medium === FIELD_SALES_UTM_MEDIUM ||
    metadataMedium === FIELD_SALES_UTM_MEDIUM ||
    metadataChannel === FIELD_SALES_UTM_MEDIUM ||
    campaign.includes("field_sales") ||
    metadataCampaign.includes("field_sales") ||
    Boolean(metadataString(event, ["rep", "rep_id", "sales_rep", "sales_rep_id", "card", "card_id", "physical_card_id"]))
  );
}

export function fieldSalesRepKey(event: MarketingEvent) {
  return normalizeKey(
    metadataString(event, ["rep_id", "sales_rep_id", "rep", "sales_rep"]) ?? event.utm_source,
    UNKNOWN_REP,
  );
}

export function fieldSalesCardKey(event: MarketingEvent) {
  return normalizeKey(
    metadataString(event, ["card_id", "physical_card_id", "card", "sales_card_id"]) ??
      event.utm_content ??
      event.creative_asset_id,
    UNKNOWN_CARD,
  );
}

export function fieldSalesTradeKey(event: MarketingEvent) {
  const rawTrade = event.trade_slug ?? metadataString(event, ["trade_slug", "trade", "trade_domain"]);
  return normalizeKey(rawTrade?.replace(/\.city$/, "-city"), UNKNOWN_TRADE);
}

function nextActionFor(summary: FieldSalesAttributionBucket, hasEvents: boolean) {
  if (!hasEvents) {
    return "No field-sales scans are logged yet. Confirm the printed card QR lands with field-sales UTMs before counting rep activity.";
  }
  if (summary.asset_view > 0 && summary.demo_call === 0) {
    return "Card scans exist, but no demo calls are logged. Tighten the scanned landing path around one live-call proof action.";
  }
  if (summary.demo_call > 0 && summary.trial_started === 0) {
    return "Demo calls are happening. Add a same-call trial handoff so interested owners can start immediately.";
  }
  if (summary.trial_started > 0 && summary.paid === 0) {
    return "Trials exist without paid conversion. Watch activation quality before adding more cards or reps.";
  }
  if (summary.paid > 0) {
    return "Field sales has paid signal. Find the rep/card/trade bucket with the strongest conversion path and clone that motion.";
  }
  return "Field-sales signal exists. Keep collecting rep-coded events until the next bottleneck is obvious.";
}

export function summarizeFieldSalesAttribution(events: MarketingEvent[]): FieldSalesAttributionSummary {
  const summary = emptyBucket("field-sales", "Field sales");
  const byRep: Record<string, FieldSalesAttributionBucket> = {};
  const byCard: Record<string, FieldSalesAttributionBucket> = {};
  const byTrade: Record<string, FieldSalesAttributionBucket> = {};
  const fieldEvents = events.filter(isFieldSalesEvent);

  for (const event of fieldEvents) {
    addEvent(summary, event);
    addEvent(getBucket(byRep, fieldSalesRepKey(event), labelForRep(fieldSalesRepKey(event))), event);
    addEvent(getBucket(byCard, fieldSalesCardKey(event), labelForCard(fieldSalesCardKey(event))), event);
    addEvent(getBucket(byTrade, fieldSalesTradeKey(event), labelForTrade(fieldSalesTradeKey(event))), event);
  }

  return {
    ...summary,
    fieldSalesEvents: fieldEvents.length,
    cardScans: summary.asset_view,
    demoCalls: summary.demo_call,
    signups: summary.signup,
    trialStarts: summary.trial_started,
    activations: summary.activated,
    paidCustomers: summary.paid,
    topReps: sortBuckets(byRep).slice(0, 3),
    topCards: sortBuckets(byCard).slice(0, 3),
    topTrades: sortBuckets(byTrade).slice(0, 3),
    nextAction: nextActionFor(summary, fieldEvents.length > 0),
    evidence: `${fieldEvents.length} field-sales events, ${summary.asset_view} card scans, ${summary.demo_call} demos, ${summary.trial_started} trials, ${summary.paid} paid customers from marketing_events only.`,
  };
}

export const fieldSalesAttributionEventTypes: MarketingEventType[] = [
  "asset_view",
  "demo_call",
  "signup",
  "trial_started",
  "activated",
  "paid",
];
