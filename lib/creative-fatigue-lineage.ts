import { getCreativeVariantBase, getCreativeVariantVersion } from "./creative-asset-variants";
import type { CreativeAsset, MarketingEventFunnelCounts, MarketingEventSummary } from "./types";

export type CreativeFatigueStatus = "waiting" | "healthy" | "watch" | "needs-variant";

export interface CreativeLineageFamily {
  base: string;
  tradeSlug: string;
  angle: string;
  targetPlatform: string;
  assets: CreativeAsset[];
  variantIds: string[];
  totalViews: number;
  downstreamEvents: number;
  paid: number;
  conversionRate: number | null;
  fatigueStatus: CreativeFatigueStatus;
  nextAction: string;
  evidence: string;
}

export interface CreativeFatigueSummary {
  totalFamilies: number;
  waiting: number;
  healthy: number;
  watch: number;
  needsVariant: number;
  families: CreativeLineageFamily[];
  nextFamily: CreativeLineageFamily | null;
  evidence: string;
}

function emptyCounts(): MarketingEventFunnelCounts {
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

function countsForAsset(summary: MarketingEventSummary, assetId: string) {
  return summary.dimensions.creativeAssets[assetId] ?? emptyCounts();
}

function statusFor(views: number, downstreamEvents: number, paid: number): CreativeFatigueStatus {
  if (paid > 0 || downstreamEvents >= 5) return "healthy";
  if (views >= 100 && downstreamEvents === 0) return "needs-variant";
  if (views >= 50 && downstreamEvents <= 1) return "watch";
  return "waiting";
}

function nextAction(status: CreativeFatigueStatus, family: string) {
  if (status === "healthy") return `Keep ${family} in review rotation until CAC or paid conversion quality changes.`;
  if (status === "needs-variant") return `Create a v2/v3 replacement prompt for ${family} before adding more traffic.`;
  if (status === "watch") return `Watch ${family}; it has exposure but weak downstream signal.`;
  return `Wait for tracked asset views before judging ${family}.`;
}

export function buildCreativeFatigueSummary(
  assets: CreativeAsset[],
  summary: MarketingEventSummary,
): CreativeFatigueSummary {
  const groups = new Map<string, CreativeAsset[]>();

  for (const asset of assets) {
    const base = getCreativeVariantBase(asset);
    groups.set(base, [...(groups.get(base) ?? []), asset]);
  }

  const families = Array.from(groups.entries())
    .map(([base, familyAssets]) => {
      const sortedAssets = [...familyAssets].sort((a, b) => {
        const versionA = getCreativeVariantVersion(a, base) ?? 999;
        const versionB = getCreativeVariantVersion(b, base) ?? 999;
        return versionA - versionB || a.created_at.localeCompare(b.created_at);
      });
      const aggregate = sortedAssets.reduce(
        (totals, asset) => {
          const counts = countsForAsset(summary, asset.id);
          totals.views += counts.asset_view;
          totals.downstream += counts.demo_call + counts.signup + counts.trial_started + counts.activated + counts.paid;
          totals.paid += counts.paid;
          return totals;
        },
        { views: 0, downstream: 0, paid: 0 },
      );
      const status = statusFor(aggregate.views, aggregate.downstream, aggregate.paid);
      const firstAsset = sortedAssets[0];
      const variantIds = sortedAssets.map((asset) => asset.variant_id ?? asset.prompt_brief_id ?? asset.id);

      return {
        base,
        tradeSlug: firstAsset.trade_slug,
        angle: firstAsset.angle,
        targetPlatform: firstAsset.target_platform,
        assets: sortedAssets,
        variantIds,
        totalViews: aggregate.views,
        downstreamEvents: aggregate.downstream,
        paid: aggregate.paid,
        conversionRate: aggregate.views > 0 ? aggregate.paid / aggregate.views : null,
        fatigueStatus: status,
        nextAction: nextAction(status, base),
        evidence:
          aggregate.views === 0
            ? "No tracked views yet."
            : `${aggregate.views.toLocaleString()} views, ${aggregate.downstream.toLocaleString()} downstream events, ${aggregate.paid.toLocaleString()} paid conversions.`,
      } satisfies CreativeLineageFamily;
    })
    .sort(
      (a, b) =>
        statusPriority(b.fatigueStatus) - statusPriority(a.fatigueStatus) ||
        b.totalViews - a.totalViews ||
        a.base.localeCompare(b.base),
    );

  const counts = families.reduce(
    (totals, family) => {
      totals[family.fatigueStatus] += 1;
      return totals;
    },
    { waiting: 0, healthy: 0, watch: 0, "needs-variant": 0 } as Record<CreativeFatigueStatus, number>,
  );

  return {
    totalFamilies: families.length,
    waiting: counts.waiting,
    healthy: counts.healthy,
    watch: counts.watch,
    needsVariant: counts["needs-variant"],
    families,
    nextFamily: families.find((family) => family.fatigueStatus === "needs-variant" || family.fatigueStatus === "watch") ?? null,
    evidence:
      summary.total === 0
        ? "No marketing events are logged yet; fatigue tracking is waiting for real asset views and downstream events."
        : "Fatigue tracking uses creative-asset attribution only and does not pause, launch, upload, spend, or change billing.",
  };
}

function statusPriority(status: CreativeFatigueStatus) {
  if (status === "needs-variant") return 4;
  if (status === "watch") return 3;
  if (status === "healthy") return 2;
  return 1;
}
