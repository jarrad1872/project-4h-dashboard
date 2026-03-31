"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  formatCreativeAssetAngleLabel,
  formatCreativeAssetStatusLabel,
  formatInfluencerStatusLabel,
  MONTHLY_BUDGET_CEILING,
  MONTHLY_BUDGET_FLOOR,
  PILOT_DOMAIN,
  PILOT_LABEL,
  PILOT_LAUNCH_DATE,
  latestMetricsWeek,
  summarizeBudget,
  summarizeCreativePipeline,
  summarizeInfluencerPipeline,
  getCountdownDays,
} from "@/lib/growth-command-center";
import type { BudgetData, CampaignStatusData, CreativeAsset, Influencer, MetricsData } from "@/lib/types";

const PLATFORM_LABELS = {
  linkedin: "LinkedIn",
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
} as const;

const PLATFORM_COLORS = {
  linkedin: "text-blue-300",
  youtube: "text-red-300",
  facebook: "text-sky-300",
  instagram: "text-pink-300",
} as const;

interface OverviewState {
  campaign: CampaignStatusData | null;
  budget: BudgetData | null;
  metrics: MetricsData | null;
  influencers: Influencer[];
  creativeAssets: CreativeAsset[];
}

const EMPTY_OVERVIEW: OverviewState = {
  campaign: null,
  budget: null,
  metrics: null,
  influencers: [],
  creativeAssets: [],
};

export default function OverviewPage() {
  const [state, setState] = useState<OverviewState>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [campaign, budget, metrics, influencers, creativeAssets] = await Promise.all([
        fetch("/api/campaign-status", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/budget", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/metrics", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/influencers", { cache: "no-store" }).then((response) => response.json()).catch(() => []),
        fetch("/api/creative-assets", { cache: "no-store" }).then((response) => response.json()).catch(() => []),
      ]);

      setState({
        campaign,
        budget,
        metrics,
        influencers: Array.isArray(influencers) ? influencers : [],
        creativeAssets: Array.isArray(creativeAssets) ? creativeAssets : [],
      });
      setLoading(false);
    }

    void load();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading growth command center...</div>;
  }

  const countdownDays = getCountdownDays(PILOT_LAUNCH_DATE);
  const creativeSummary = summarizeCreativePipeline(state.creativeAssets);
  const influencerSummary = summarizeInfluencerPipeline(state.influencers);
  const budgetSummary = summarizeBudget(state.budget);
  const latestWeek = latestMetricsWeek(state.metrics);
  const hasLiveMetrics = Boolean(
    latestWeek &&
      Object.values(PLATFORM_LABELS).some((_, index) => {
        const platform = Object.keys(PLATFORM_LABELS)[index] as keyof typeof PLATFORM_LABELS;
        return latestWeek[platform].impressions > 0 || latestWeek[platform].clicks > 0 || latestWeek[platform].signups > 0;
      }),
  );
  const recentInfluencers = [...state.influencers]
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 4);
  const recentAssets = [...state.creativeAssets]
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Project 4H</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Growth Command Center</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Live focus is the {PILOT_LABEL.toLowerCase()} for <span className="font-semibold text-slate-200">{PILOT_DOMAIN}</span>:
            influencer outreach, AI UGC production, channel readiness, and spend discipline for the first launch window.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/influencer">
            <Button>Influencer Pipeline</Button>
          </Link>
          <Link href="/assets">
            <GhostButton>Creative Assets</GhostButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr,1fr]">
        <Card className="border-cyan-900/40 bg-cyan-950/10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Active Pilot Status</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{PILOT_LABEL}</h2>
              <p className="mt-1 text-sm text-slate-300">Plumbing owners on {PILOT_DOMAIN}. Countdown is tracking the first two-week launch window.</p>
            </div>
            <span className="rounded-full border border-cyan-700/50 bg-cyan-900/40 px-3 py-1 text-xs font-semibold uppercase text-cyan-200">
              {state.campaign?.status ?? "pre-launch"}
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Launch target</p>
              <p className="mt-2 text-xl font-semibold text-white">Apr 14</p>
              <p className="text-xs text-slate-500">2026 launch checkpoint</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Countdown</p>
              <p className="mt-2 text-xl font-semibold text-white">{countdownDays} days</p>
              <p className="text-xs text-slate-500">Two-week pilot runway</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Budget window</p>
              <p className="mt-2 text-xl font-semibold text-white">${MONTHLY_BUDGET_FLOOR.toLocaleString()}-${MONTHLY_BUDGET_CEILING.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Target monthly test range</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick Actions</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/influencer" className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-cyan-600/40">
              <p className="text-sm font-semibold text-white">Manage creator outreach</p>
              <p className="mt-1 text-xs text-slate-500">Track researching to paid across the pilot roster.</p>
            </Link>
            <Link href="/assets" className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-cyan-600/40">
              <p className="text-sm font-semibold text-white">Review AI UGC assets</p>
              <p className="mt-1 text-xs text-slate-500">Keep draft, review, approved, and live assets visible.</p>
            </Link>
            <Link href="/approval" className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-cyan-600/40">
              <p className="text-sm font-semibold text-white">Approval queue</p>
              <p className="mt-1 text-xs text-slate-500">CEO and CMO signoff still gates what goes live.</p>
            </Link>
            <Link href="/launch" className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-cyan-600/40">
              <p className="text-sm font-semibold text-white">Launch checklist</p>
              <p className="mt-1 text-xs text-slate-500">Track readiness beyond the pilot metrics surface.</p>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Creative Pipeline</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{creativeSummary.total} AI UGC assets tracked</h2>
            </div>
            <Link href="/assets" className="text-xs text-cyan-300 hover:underline">
              Open assets
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Draft", value: creativeSummary.draft, color: "text-slate-200" },
              { label: "Review", value: creativeSummary.review, color: "text-amber-300" },
              { label: "Approved", value: creativeSummary.approved, color: "text-emerald-300" },
              { label: "Live", value: creativeSummary.live, color: "text-cyan-300" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {recentAssets.length ? (
              recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-white">{asset.title}</p>
                    <p className="text-xs text-slate-500">{formatCreativeAssetAngleLabel(asset.angle)} · {asset.tool_used}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase text-slate-300">
                    {formatCreativeAssetStatusLabel(asset.status)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                No pilot assets saved yet. Use /assets to add the first missed-call, voice-boss, demo, or math creative.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Influencer Pipeline</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{state.influencers.length} creator prospects in play</h2>
            </div>
            <Link href="/influencer" className="text-xs text-cyan-300 hover:underline">
              Open pipeline
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Contacted", value: influencerSummary.contacted, color: "text-sky-300" },
              { label: "Negotiating", value: influencerSummary.negotiating, color: "text-amber-300" },
              { label: "Contracted", value: influencerSummary.contracted, color: "text-emerald-300" },
              { label: "Content Live", value: influencerSummary.content_live, color: "text-cyan-300" },
              { label: "Paid", value: influencerSummary.paid, color: "text-violet-300" },
              { label: "Researching", value: influencerSummary.researching, color: "text-slate-200" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {recentInfluencers.length ? (
              recentInfluencers.map((influencer) => (
                <div key={influencer.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-white">{influencer.creator_name}</p>
                    <p className="text-xs text-slate-500">{influencer.trade} · {influencer.platform}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase text-slate-300">
                    {formatInfluencerStatusLabel(influencer.status)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                No influencer records yet. Seed or add pilot creators on /influencer.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Channel Metrics</p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {hasLiveMetrics ? `Latest week: ${latestWeek?.weekStart}` : "Placeholder metrics until launch"}
            </h2>
          </div>
          <p className="text-xs text-slate-500">Impressions, clicks, signups, and CAC by channel will populate from weekly_metrics.</p>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {(Object.keys(PLATFORM_LABELS) as Array<keyof typeof PLATFORM_LABELS>).map((platform) => {
            const metrics = latestWeek?.[platform] ?? { spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0 };
            const cac = metrics.signups > 0 ? metrics.spend / metrics.signups : null;

            return (
              <div key={platform} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className={`text-sm font-semibold ${PLATFORM_COLORS[platform]}`}>{PLATFORM_LABELS[platform]}</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Impressions</span>
                    <span>{metrics.impressions ? metrics.impressions.toLocaleString() : "--"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Clicks</span>
                    <span>{metrics.clicks ? metrics.clicks.toLocaleString() : "--"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Signups</span>
                    <span>{metrics.signups ? metrics.signups.toLocaleString() : "--"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">CAC</span>
                    <span>{cac !== null ? `$${cac.toFixed(2)}` : "--"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Budget Tracker</p>
            <h2 className="mt-1 text-lg font-semibold text-white">${budgetSummary.spent.toLocaleString()} spent so far</h2>
          </div>
          <p className="text-xs text-slate-500">
            Target spend band is ${budgetSummary.floor.toLocaleString()}-${budgetSummary.ceiling.toLocaleString()} for the monthly pilot.
          </p>
        </div>
        <div className="mt-4 h-3 w-full rounded-full bg-slate-800">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
            style={{ width: `${Math.min(100, (budgetSummary.spent / budgetSummary.ceiling) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>$0</span>
          <span>${budgetSummary.floor.toLocaleString()} floor</span>
          <span>${budgetSummary.ceiling.toLocaleString()} ceiling</span>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {(Object.keys(PLATFORM_LABELS) as Array<keyof typeof PLATFORM_LABELS>).map((platform) => {
            const channel = state.budget?.channels[platform] ?? { allocated: 0, spent: 0 };
            const percent = channel.allocated > 0 ? Math.min(100, (channel.spent / channel.allocated) * 100) : 0;

            return (
              <div key={platform} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${PLATFORM_COLORS[platform]}`}>{PLATFORM_LABELS[platform]}</p>
                  <span className="text-xs text-slate-500">{percent.toFixed(0)}%</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  ${channel.spent.toLocaleString()} / ${channel.allocated.toLocaleString()}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-slate-400" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
