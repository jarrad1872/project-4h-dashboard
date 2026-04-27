import type { MarketingEventDimension, MarketingEventFunnelCounts, MarketingEventSummary } from "./types";

export type LearningSignal = "winner" | "promising" | "learning" | "waiting";

export interface LearningRankedItem extends MarketingEventFunnelCounts {
  key: string;
  label: string;
  rank: number;
  score: number;
  conversionRate: number | null;
  signal: LearningSignal;
  evidence: string;
}

export interface LearningDimensionReport {
  dimension: MarketingEventDimension;
  title: string;
  emptyState: string;
  items: LearningRankedItem[];
}

export interface WeeklyLearningReport {
  hasAnySignal: boolean;
  hasPaidSignal: boolean;
  headline: string;
  reports: LearningDimensionReport[];
}

const DIMENSION_TITLES: Record<MarketingEventDimension, string> = {
  trades: "Trades",
  creators: "Creators",
  creativeAssets: "Images",
  angles: "Angles",
};

const EMPTY_STATES: Record<MarketingEventDimension, string> = {
  trades: "No trade-level attribution yet. The report will rank trades after assets generate tracked events.",
  creators: "No creator attribution yet. Creator ranking waits for tracked creator links or demo traffic.",
  creativeAssets: "No image attribution yet. Image ranking waits for tracked asset views, calls, trials, or paid conversions.",
  angles: "No angle attribution yet. Angle ranking waits for tracked missed-call, demo-call, owner-agent, or ROI-math events.",
};

function scoreCounts(counts: MarketingEventFunnelCounts) {
  return (
    counts.paid * 100 +
    counts.activated * 45 +
    counts.trial_started * 30 +
    counts.signup * 20 +
    counts.demo_call * 10 +
    counts.asset_view
  );
}

function signalFor(counts: MarketingEventFunnelCounts): LearningSignal {
  if (counts.paid > 0) return "winner";
  if (counts.activated > 0 || counts.trial_started > 0) return "promising";
  if (counts.signup > 0 || counts.demo_call > 0 || counts.asset_view > 0) return "learning";
  return "waiting";
}

function evidenceFor(counts: MarketingEventFunnelCounts) {
  if (counts.paid > 0) return `${counts.paid} paid conversion${counts.paid === 1 ? "" : "s"}`;
  if (counts.activated > 0) return `${counts.activated} activation${counts.activated === 1 ? "" : "s"}, no paid conversions yet`;
  if (counts.trial_started > 0) return `${counts.trial_started} trial start${counts.trial_started === 1 ? "" : "s"}, no paid conversions yet`;
  if (counts.signup > 0) return `${counts.signup} signup${counts.signup === 1 ? "" : "s"}, no paid conversions yet`;
  if (counts.demo_call > 0) return `${counts.demo_call} demo call${counts.demo_call === 1 ? "" : "s"}, no paid conversions yet`;
  if (counts.asset_view > 0) return `${counts.asset_view} asset view${counts.asset_view === 1 ? "" : "s"}, no downstream signal yet`;
  return "Waiting for tracked events";
}

function labelFor(dimension: MarketingEventDimension, key: string) {
  if (dimension === "trades") return key.endsWith(".city") ? key : `${key}.city`;
  return key;
}

export function rankLearningDimension(
  summary: MarketingEventSummary,
  dimension: MarketingEventDimension,
  limit = 5,
): LearningDimensionReport {
  const rows = Object.entries(summary.dimensions?.[dimension] ?? {})
    .map(([key, counts]) => {
      const conversionRate = counts.asset_view > 0 ? counts.paid / counts.asset_view : null;
      return {
        key,
        label: labelFor(dimension, key),
        rank: 0,
        score: scoreCounts(counts),
        conversionRate,
        signal: signalFor(counts),
        evidence: evidenceFor(counts),
        ...counts,
      };
    })
    .sort((a, b) => b.score - a.score || b.paid - a.paid || b.total - a.total || a.key.localeCompare(b.key))
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    dimension,
    title: DIMENSION_TITLES[dimension],
    emptyState: EMPTY_STATES[dimension],
    items: rows,
  };
}

export function buildWeeklyLearningReport(summary: MarketingEventSummary): WeeklyLearningReport {
  const reports = (["trades", "creators", "creativeAssets", "angles"] as const).map((dimension) =>
    rankLearningDimension(summary, dimension),
  );
  const hasAnySignal = summary.total > 0;
  const hasPaidSignal = summary.byType.paid > 0;

  return {
    hasAnySignal,
    hasPaidSignal,
    headline: hasPaidSignal
      ? "Rankings are using paid conversion signal."
      : hasAnySignal
        ? "Rankings are directional only until paid conversions appear."
        : "No paid campaign signal yet. This report will rank real winners after tracked events arrive.",
    reports,
  };
}
