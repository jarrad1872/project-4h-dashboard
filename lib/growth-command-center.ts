import type {
  BudgetData,
  CreativeAsset,
  CreativeAssetAngle,
  CreativeAssetStatus,
  Influencer,
  InfluencerStatus,
  MetricsData,
  MetricsWeek,
} from "./types";

export const PILOT_TRADE_SLUG = "pipe";
export const PILOT_DOMAIN = "pipe.city";
export const PILOT_LABEL = "Plumbing Pilot";
export const PILOT_LAUNCH_DATE = "2026-04-14T00:00:00.000Z";
export const MONTHLY_BUDGET_FLOOR = 5000;
export const MONTHLY_BUDGET_CEILING = 10000;
export const DEFAULT_CREATIVE_TOOL = "gemini-3.1-flash-image-preview";

export const INFLUENCER_STATUS_ORDER: InfluencerStatus[] = [
  "researching",
  "contacted",
  "negotiating",
  "contracted",
  "content_live",
  "paid",
  "declined",
];

export const CREATIVE_ASSET_STATUS_ORDER: CreativeAssetStatus[] = [
  "draft",
  "review",
  "approved",
  "live",
];

const INFLUENCER_STATUS_LABELS: Record<InfluencerStatus, string> = {
  researching: "Researching",
  contacted: "Contacted",
  negotiating: "Negotiating",
  contracted: "Contracted",
  content_live: "Content Live",
  paid: "Paid",
  declined: "Declined",
};

const CREATIVE_ASSET_STATUS_LABELS: Record<CreativeAssetStatus, string> = {
  draft: "Draft",
  review: "Review",
  approved: "Approved",
  live: "Live",
};

const CREATIVE_ASSET_ANGLE_LABELS: Record<CreativeAssetAngle, string> = {
  "missed-call": "Missed Call",
  "voice-boss": "Voice Boss",
  demo: "Demo",
  math: "Math",
};

const LEGACY_INFLUENCER_STATUS_MAP: Record<string, InfluencerStatus> = {
  identified: "researching",
  contacted: "contacted",
  replied: "negotiating",
  negotiating: "negotiating",
  active: "content_live",
  declined: "declined",
  researching: "researching",
  contracted: "contracted",
  content_live: "content_live",
  paid: "paid",
};

export function normalizeInfluencerStatus(status: string | null | undefined): InfluencerStatus {
  if (!status) return "researching";
  return LEGACY_INFLUENCER_STATUS_MAP[status] ?? "researching";
}

export function normalizeAudienceSize(
  audienceSize: number | null | undefined,
  estimatedReach: string | null | undefined,
): number | null {
  if (typeof audienceSize === "number" && Number.isFinite(audienceSize)) {
    return audienceSize;
  }

  if (!estimatedReach) return null;
  const numeric = estimatedReach.replace(/[^0-9.km]/gi, "").toLowerCase();
  if (!numeric) return null;

  if (numeric.endsWith("k")) return Math.round(Number(numeric.slice(0, -1)) * 1000);
  if (numeric.endsWith("m")) return Math.round(Number(numeric.slice(0, -1)) * 1000000);

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatAudienceSize(value: number | null | undefined): string {
  if (!value) return "Unknown";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatInfluencerStatusLabel(status: InfluencerStatus): string {
  return INFLUENCER_STATUS_LABELS[status];
}

export function formatCreativeAssetStatusLabel(status: CreativeAssetStatus): string {
  return CREATIVE_ASSET_STATUS_LABELS[status];
}

export function formatCreativeAssetAngleLabel(angle: CreativeAssetAngle): string {
  return CREATIVE_ASSET_ANGLE_LABELS[angle];
}

export function getCountdownDays(targetDate: string, now = new Date()): number {
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function summarizeInfluencerPipeline(influencers: Influencer[]) {
  const summary = Object.fromEntries(INFLUENCER_STATUS_ORDER.map((status) => [status, 0])) as Record<
    InfluencerStatus,
    number
  >;

  for (const influencer of influencers) {
    summary[normalizeInfluencerStatus(influencer.status)] += 1;
  }

  return summary;
}

export function summarizeCreativePipeline(assets: CreativeAsset[]) {
  const summary = Object.fromEntries(CREATIVE_ASSET_STATUS_ORDER.map((status) => [status, 0])) as Record<
    CreativeAssetStatus,
    number
  >;

  for (const asset of assets) {
    if (summary[asset.status] !== undefined) {
      summary[asset.status] += 1;
    }
  }

  return {
    ...summary,
    total: assets.length,
  };
}

export function latestMetricsWeek(metrics: MetricsData | null | undefined): MetricsWeek | null {
  if (!metrics?.weeks?.length) return null;
  return [...metrics.weeks].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0] ?? null;
}

export function summarizeBudget(budget: BudgetData | null | undefined) {
  const channels = budget?.channels ?? {
    linkedin: { allocated: 0, spent: 0 },
    youtube: { allocated: 0, spent: 0 },
    facebook: { allocated: 0, spent: 0 },
    instagram: { allocated: 0, spent: 0 },
  };

  const allocated = Object.values(channels).reduce((sum, channel) => sum + channel.allocated, 0);
  const spent = Object.values(channels).reduce((sum, channel) => sum + channel.spent, 0);

  return {
    allocated,
    spent,
    floor: MONTHLY_BUDGET_FLOOR,
    ceiling: MONTHLY_BUDGET_CEILING,
  };
}
