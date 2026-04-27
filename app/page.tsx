"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";
import {
  beachheadTrades,
  customerMath,
  imageDriver,
  nextFourteenDays,
  operatingLoops,
  rebuildExecutionQueue,
  rebuildMission,
} from "@/lib/4h-rebuild-data";
import { latestMetricsWeek } from "@/lib/growth-command-center";
import type { Ad, CreativeAsset, Influencer, MetricsData } from "@/lib/types";

interface OverviewState {
  ads: Ad[];
  influencers: Influencer[];
  creativeAssets: CreativeAsset[];
  metrics: MetricsData | null;
}

const EMPTY_STATE: OverviewState = {
  ads: [],
  influencers: [],
  creativeAssets: [],
  metrics: null,
};

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-semibold uppercase text-slate-300">
      {children}
    </span>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
    >
      {children}
    </Link>
  );
}

export default function OverviewPage() {
  const [state, setState] = useState<OverviewState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ads, influencers, creativeAssets, metrics] = await Promise.all([
        fetch("/api/ads", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/influencers", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/creative-assets", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/metrics", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => null),
      ]);

      setState({
        ads: Array.isArray(ads) ? ads : [],
        influencers: Array.isArray(influencers) ? influencers : [],
        creativeAssets: Array.isArray(creativeAssets) ? creativeAssets : [],
        metrics,
      });
      setLoading(false);
    }

    void load();
  }, []);

  const summary = useMemo(() => {
    const approvedAds = state.ads.filter((ad) => ad.status === "approved").length;
    const pendingAds = state.ads.filter((ad) => ad.status === "pending").length;
    const creatorsReady = state.influencers.filter((creator) =>
      ["approved", "sent", "follow_up_due", "responded"].includes(creator.outreach_stage),
    ).length;
    const approvedAssets = state.creativeAssets.filter((asset) => ["approved", "live"].includes(asset.status)).length;
    const latestWeek = latestMetricsWeek(state.metrics);
    const paidCustomers = latestWeek
      ? latestWeek.linkedin.paid + latestWeek.youtube.paid + latestWeek.facebook.paid + latestWeek.instagram.paid
      : 0;

    return {
      approvedAds,
      pendingAds,
      creatorsReady,
      approvedAssets,
      paidCustomers,
    };
  }, [state]);

  const queueSummary = useMemo(() => {
    const ready = rebuildExecutionQueue.filter((item) => item.status === "ready");
    const reviewRequired = rebuildExecutionQueue.filter((item) => item.approval === "review-required");

    return {
      ready,
      reviewRequired,
      topReady: ready.slice(0, 8),
    };
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading Project 4H...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-emerald-900/60 bg-slate-800 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Project 4H rebuild</p>
            <h1 className="mt-2 max-w-4xl text-3xl font-bold text-white">
              Acquisition OS for {rebuildMission.productName}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              Goal: {formatNumber(rebuildMission.customerTargetLow)}-{formatNumber(rebuildMission.customerTargetHigh)} customers
              by December 31, 2026. The product reference is read-only {rebuildMission.referenceProduct}; the 4H surface is where
              we rebuild creator outreach, image-led creative, approvals, and measurement.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionLink href="/influencer">Open creators</ActionLink>
            <Link
              href="/assets"
              className="inline-flex items-center rounded-md border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              Open creative lab
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {customerMath.map((item) => (
          <Card key={item.label} className="min-h-36">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
            <p className="mt-2 text-sm leading-5 text-slate-400">{item.detail}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,1.05fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current production signal</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Useful assets, no customer signal yet</h2>
            </div>
            <StatusPill>pre-launch</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="border-t border-slate-700 pt-3">
              <p className="text-2xl font-semibold text-white">{formatNumber(state.ads.length)}</p>
              <p className="text-sm text-slate-400">ads in the archive</p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-2xl font-semibold text-white">{formatNumber(summary.approvedAds)}</p>
              <p className="text-sm text-slate-400">ads approved</p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-2xl font-semibold text-white">{formatNumber(summary.pendingAds)}</p>
              <p className="text-sm text-slate-400">ads pending approval</p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-2xl font-semibold text-white">
                {formatNumber(summary.creatorsReady)} / {formatNumber(state.influencers.length)}
              </p>
              <p className="text-sm text-slate-400">creators ready or in motion</p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-2xl font-semibold text-white">{formatNumber(summary.approvedAssets)}</p>
              <p className="text-sm text-slate-400">creative assets approved/live</p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-2xl font-semibold text-white">{formatNumber(summary.paidCustomers)}</p>
              <p className="text-sm text-slate-400">paid customers attributed in metrics</p>
            </div>
          </div>
        </Card>

        <Card className="border-emerald-900/60 bg-emerald-950/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Main creative driver</p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {imageDriver.provider} {imageDriver.model}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{imageDriver.role}</p>
          <p className="mt-3 border-l border-emerald-600 pl-3 text-sm leading-6 text-slate-300">{imageDriver.operatingRule}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
            <StatusPill>missed-call scenes</StatusPill>
            <StatusPill>demo proof</StatusPill>
            <StatusPill>creator frames</StatusPill>
            <StatusPill>trade-specific visuals</StatusPill>
          </div>
        </Card>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operating loops</p>
            <h2 className="mt-1 text-xl font-semibold text-white">What 4H should run every week</h2>
          </div>
          <Link href="/scorecard" className="text-sm font-semibold text-emerald-300 hover:underline">
            Open scorecard
          </Link>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-4">
          {operatingLoops.map((loop) => (
            <Link
              key={loop.name}
              href={loop.route}
              className="rounded-lg border border-slate-700 bg-slate-800 p-4 transition hover:border-emerald-600/70"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{loop.name}</h3>
                <StatusPill>{loop.status}</StatusPill>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{loop.metric}</p>
              <p className="mt-2 text-sm leading-5 text-slate-400">{loop.nextMove}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Beachhead trades</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Start where the missed-call pain is obvious</h2>
          <div className="mt-4 space-y-3">
            {beachheadTrades.map((trade) => (
              <div key={trade.domain} className="border-t border-slate-700 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{trade.domain}</p>
                  <span className="text-xs text-slate-500">{trade.trade}</span>
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-400">{trade.reason}</p>
                <p className="mt-1 text-sm leading-5 text-emerald-200">{trade.firstOffer}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next 14 days</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Turn the dashboard into a customer machine</h2>
          <div className="mt-4 space-y-3">
            {nextFourteenDays.map((item) => (
              <div key={item.day} className="grid gap-2 border-t border-slate-700 pt-3 sm:grid-cols-[84px,1fr]">
                <p className="text-sm font-semibold text-emerald-300">{item.day}</p>
                <div>
                  <p className="font-semibold text-white">{item.target}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{item.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autonomous build queue</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Next work is queued so agents can keep moving</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{queueSummary.ready.length} ready</StatusPill>
            <StatusPill>{queueSummary.reviewRequired.length} review gates</StatusPill>
          </div>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-4">
          {queueSummary.topReady.map((item) => (
            <Link
              key={item.id}
              href={item.route}
              className="rounded-lg border border-slate-700 bg-slate-800 p-4 transition hover:border-emerald-600/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase text-emerald-300">{item.id}</span>
                <StatusPill>{item.lane}</StatusPill>
              </div>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.phase}</p>
              <p className="mt-2 text-sm leading-5 text-slate-400">{item.outcome}</p>
              <p className="mt-3 border-l border-slate-700 pl-3 text-xs leading-5 text-slate-500">{item.acceptance}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
