"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { buildActiveLoopSupportSummary, EMPTY_MARKETING_EVENT_SUMMARY } from "@/lib/active-loop-support-summaries";
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
import {
  routeDependencyGuards,
  routeDependencyGuardSummary,
  routeDispositionDecisions,
  routeDispositionSummary,
} from "@/lib/navigation";
import { publicCreativeUrlDependencies, publicCreativeUrlDependencySummary } from "@/lib/trade-utils";
import {
  bulkWorkflowStages,
  workflowHistoryDependencies,
  workflowHistoryDependencySummary,
  workflowTransitionPairs,
} from "@/lib/workflow-history";
import {
  settingsDependencyNotes,
  settingsSetupGuides,
  settingsSourceDocs,
  settingsSourceNoteSummary,
} from "@/lib/settings-source-notes";
import {
  getBeachheadProductRoutes,
  productRouteInventorySources,
  productRouteRetirementDependencySummary,
} from "@/lib/product-route-inventory";
import type { Ad, AdTemplate, CreativeAsset, Influencer, LifecycleMessage, MarketingEventSummary, MetricsData } from "@/lib/types";

interface OverviewState {
  ads: Ad[];
  influencers: Influencer[];
  creativeAssets: CreativeAsset[];
  lifecycleMessages: LifecycleMessage[];
  templates: AdTemplate[];
  marketingSummary: MarketingEventSummary;
  metrics: MetricsData | null;
}

const EMPTY_STATE: OverviewState = {
  ads: [],
  influencers: [],
  creativeAssets: [],
  lifecycleMessages: [],
  templates: [],
  marketingSummary: EMPTY_MARKETING_EVENT_SUMMARY,
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
      const [ads, influencers, creativeAssets, lifecycleMessages, templates, marketingEvents, metrics] = await Promise.all([
        fetch("/api/ads", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/influencers", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/creative-assets", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/lifecycle", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/templates", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => []),
        fetch("/api/events?summary=1", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => null),
        fetch("/api/metrics", { cache: "no-store" })
          .then((response) => response.json())
          .catch(() => null),
      ]);

      setState({
        ads: Array.isArray(ads) ? ads : [],
        influencers: Array.isArray(influencers) ? influencers : [],
        creativeAssets: Array.isArray(creativeAssets) ? creativeAssets : [],
        lifecycleMessages: Array.isArray(lifecycleMessages) ? lifecycleMessages : [],
        templates: Array.isArray(templates) ? templates : [],
        marketingSummary: marketingEvents?.summary ?? EMPTY_MARKETING_EVENT_SUMMARY,
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
  const routeMatrixSummary = useMemo(() => routeDispositionSummary(), []);
  const routeGuardSummary = useMemo(() => routeDependencyGuardSummary(), []);
  const publicCreativeSummary = useMemo(() => publicCreativeUrlDependencySummary(), []);
  const workflowHistorySummary = useMemo(() => workflowHistoryDependencySummary(), []);
  const workflowTransitions = useMemo(() => workflowTransitionPairs(), []);
  const settingsSummary = useMemo(() => settingsSourceNoteSummary(), []);
  const gtmRouteSummary = useMemo(() => productRouteRetirementDependencySummary(), []);
  const gtmBeachheadRoutes = useMemo(() => getBeachheadProductRoutes(), []);
  const publicCreativeRows = useMemo(
    () =>
      publicCreativeUrlDependencies.reduce<Array<{ prefix: string; domain: string; urls: string[]; placements: string[] }>>(
        (rows, asset) => {
          let row = rows.find((item) => item.prefix === asset.prefix);
          if (!row) {
            row = { prefix: asset.prefix, domain: asset.domain, urls: [], placements: [] };
            rows.push(row);
          }
          row.urls.push(asset.url);
          row.placements.push(`${asset.platform}:${asset.placement}`);
          return rows;
        },
        [],
      ),
    [],
  );

  const supportSummary = useMemo(
    () =>
      buildActiveLoopSupportSummary({
        lifecycleMessages: state.lifecycleMessages,
        marketingSummary: state.marketingSummary,
        savedAdTemplates: state.templates.length,
      }),
    [state.lifecycleMessages, state.marketingSummary, state.templates.length],
  );

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

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Support signals in active loops</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Lifecycle and templates stay reachable without daily sidebar space</h2>
          </div>
          <Link href="/scorecard" className="text-sm font-semibold text-emerald-300 hover:underline">
            Review learning loop
          </Link>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <Card data-testid="support-loop-summary-lifecycle" className="border-cyan-900/60 bg-cyan-950/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Lifecycle support</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Follow-up coverage and conversion movement</h3>
              </div>
              <Link href="/lifecycle" className="text-sm font-semibold text-cyan-200 hover:underline">
                Open details
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Active follow-ups", value: supportSummary.lifecycle.activeMessages },
                { label: "Trial starts", value: supportSummary.lifecycle.trialStarts },
                { label: "Activations", value: supportSummary.lifecycle.activations },
                { label: "Paid", value: supportSummary.lifecycle.paid },
              ].map((item) => (
                <div key={item.label} className="rounded border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-2xl font-semibold text-white">{formatNumber(item.value)}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-5 text-slate-300">{supportSummary.lifecycle.nextAction}</p>
            <p className="mt-2 text-xs text-slate-500">{supportSummary.lifecycle.evidence}</p>
          </Card>

          <Card data-testid="support-loop-summary-templates" className="border-indigo-900/60 bg-indigo-950/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Template support</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Briefs and research context folded into launch work</h3>
              </div>
              <Link href="/templates" className="text-sm font-semibold text-indigo-200 hover:underline">
                Open details
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Creator briefs", value: supportSummary.templates.contentBriefs },
                { label: "Message-match", value: supportSummary.templates.messageMatchBriefs },
                { label: "Domains", value: supportSummary.templates.messageMatchDomains },
                { label: "Saved ads", value: supportSummary.templates.savedAdTemplates },
              ].map((item) => (
                <div key={item.label} className="rounded border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-2xl font-semibold text-white">{formatNumber(item.value)}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-5 text-slate-300">{supportSummary.templates.nextAction}</p>
            <p className="mt-2 text-xs text-slate-500">{supportSummary.templates.evidence}</p>
          </Card>
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

      <section data-testid="route-retirement-matrix">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Route retirement matrix</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Recommendations only, no route changes yet</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{routeMatrixSummary.counts.rebuild} rebuild</StatusPill>
            <StatusPill>{routeMatrixSummary.counts.redirect} redirect</StatusPill>
            <StatusPill>{routeMatrixSummary.counts.archive} archive</StatusPill>
            <StatusPill>{routeMatrixSummary.counts.delete} delete later</StatusPill>
          </div>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
          <div className="grid gap-px bg-slate-700 md:grid-cols-[0.7fr,0.8fr,0.8fr,1.5fr]">
            {routeDispositionDecisions.map((row) => (
              <div key={row.route} className="contents">
                <div className="bg-slate-800 p-3">
                  <p className="text-sm font-semibold text-white">{row.route}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.label}</p>
                </div>
                <div className="bg-slate-800 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Recommendation</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-300">{row.recommendation}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.currentDisposition}</p>
                </div>
                <div className="bg-slate-800 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Replacement</p>
                  {row.replacementHref ? (
                    <Link href={row.replacementHref} className="mt-1 inline-flex text-sm font-semibold text-slate-200 hover:underline">
                      {row.replacementHref}
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">None</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">No destructive action allowed</p>
                </div>
                <div className="bg-slate-800 p-3">
                  <p className="text-sm leading-5 text-slate-300">{row.rationale}</p>
                  <p className="mt-2 border-l border-slate-700 pl-3 text-xs leading-5 text-slate-500">{row.nextStep}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-testid="route-dependency-guard">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Route dependency guard</p>
            <h2 className="mt-1 text-xl font-semibold text-white">What blocks redirect/delete work</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{routeGuardSummary.counts.blocked} blocked</StatusPill>
            <StatusPill>{routeGuardSummary.counts.support} support</StatusPill>
            <StatusPill>{routeGuardSummary.readyForRedirectOrDelete} clear</StatusPill>
          </div>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {routeDependencyGuards.map((row) => (
            <Card key={row.route} className="bg-slate-800/80" data-testid={`route-dependency-${row.route.replace("/", "")}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{row.route}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.guardrail}</p>
                </div>
                <span
                  className={`rounded border px-2 py-1 text-xs font-semibold uppercase ${
                    row.status === "clear"
                      ? "border-emerald-700/40 bg-emerald-950/25 text-emerald-300"
                      : row.status === "support"
                        ? "border-cyan-700/40 bg-cyan-950/25 text-cyan-300"
                        : "border-amber-700/40 bg-amber-950/25 text-amber-300"
                  }`}
                >
                  {row.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active refs</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                    {row.activeReferences.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data deps</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                    {row.dataDependencies.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Docs/tests</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                    {row.docOrTestReferences.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section data-testid="public-creative-url-map">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public creative URL map</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Static asset URLs are separate from the legacy page route</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{publicCreativeSummary.assetCount} URLs</StatusPill>
            <StatusPill>{publicCreativeSummary.tradeCount} trades</StatusPill>
            <StatusPill>{publicCreativeSummary.formatCount} formats</StatusPill>
          </div>
        </div>
        <Card className="mt-3 border-amber-900/50 bg-amber-950/10">
          <p className="text-sm leading-6 text-slate-300">{publicCreativeSummary.preservationRule}</p>
          <p className="mt-2 text-xs text-slate-500">
            Directory: {publicCreativeSummary.assetDirectory}; URL prefix: {publicCreativeSummary.urlPrefix}; legacy page route:{" "}
            {publicCreativeSummary.legacyPageRoute}
          </p>
          <div className="mt-4 grid gap-3 xl:grid-cols-4">
            {publicCreativeRows.map((row) => (
              <div key={row.prefix} className="rounded border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{row.domain}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.urls.length} preserved static URLs</p>
                  </div>
                  <StatusPill>{row.prefix}</StatusPill>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-300">{row.placements.join(", ")}</p>
                <p className="mt-2 break-all text-xs text-slate-500">{row.urls[0]}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section data-testid="workflow-history-map">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bulk workflow history map</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Legacy workflow behavior is preserved before redirect work</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{workflowHistorySummary.stageCount} stages</StatusPill>
            <StatusPill>{workflowHistorySummary.transitionCount} transitions</StatusPill>
            <StatusPill>{workflowHistorySummary.dependencyCount} deps</StatusPill>
          </div>
        </div>
        <Card className="mt-3 border-cyan-900/50 bg-cyan-950/10">
          <p className="text-sm leading-6 text-slate-300">{workflowHistorySummary.preservationRule}</p>
          <p className="mt-2 text-xs text-slate-500">
            Route: {workflowHistorySummary.route}; API: {workflowHistorySummary.apiRoute}; fallback file:{" "}
            {workflowHistorySummary.fallbackFile}
          </p>
          <div className="mt-4 grid gap-3 xl:grid-cols-[0.8fr,1fr]">
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Stage order</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                {bulkWorkflowStages.map((stage, index) => (
                  <span key={stage.key} className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-1 font-semibold">{stage.label}</span>
                    {index < bulkWorkflowStages.length - 1 && <span className="text-slate-600">&gt;</span>}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Bulk transitions: {workflowTransitions.map((transition) => `${transition.from}->${transition.to}`).join(", ")}
              </p>
            </div>
            <div className="grid gap-2">
              {workflowHistoryDependencies.map((dependency) => (
                <div key={dependency.id} className="rounded border border-slate-700 bg-slate-900/60 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{dependency.surface}</p>
                    <StatusPill>internal only</StatusPill>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{dependency.preserves}</p>
                  <p className="mt-1 text-xs text-slate-500">{dependency.source}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section data-testid="settings-source-note-map">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legacy settings source notes</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Setup references are preserved before delete work</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{settingsSummary.setupGuideCount} setup notes</StatusPill>
            <StatusPill>{settingsSummary.sourceDocCount} source docs</StatusPill>
            <StatusPill>{settingsSummary.dependencyCount} deps</StatusPill>
          </div>
        </div>
        <Card className="mt-3 border-violet-900/50 bg-violet-950/10">
          <p className="text-sm leading-6 text-slate-300">{settingsSummary.preservationRule}</p>
          <p className="mt-2 text-xs text-slate-500">
            Route: {settingsSummary.route}; active replacement: {settingsSummary.replacement}; doc log items:{" "}
            {settingsSummary.docLogCount}
          </p>
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Platform setup notes</p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-300">
                {settingsSetupGuides.map((guide) => (
                  <li key={guide.id}>
                    <span className="font-semibold text-white">{guide.platform}:</span> {guide.note}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Read-only source docs</p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-300">
                {settingsSourceDocs.map((doc) => (
                  <li key={doc.id}>
                    <span className="font-semibold text-white">{doc.label}:</span> {doc.purpose}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Delete-work dependencies</p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-300">
                {settingsDependencyNotes.map((dependency) => (
                  <li key={dependency.id}>
                    <span className="font-semibold text-white">{dependency.surface}:</span> {dependency.preserves}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <section data-testid="gtm-product-route-map">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legacy GTM product-route inventory</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Product route context is preserved outside the old GTM board</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{gtmRouteSummary.inventoryCount} routes</StatusPill>
            <StatusPill>{gtmRouteSummary.beachheadRoutes} beachhead</StatusPill>
            <StatusPill>{gtmRouteSummary.demoLines} demo lines</StatusPill>
          </div>
        </div>
        <Card className="mt-3 border-sky-900/50 bg-sky-950/10">
          <p className="text-sm leading-6 text-slate-300">{gtmRouteSummary.preservationRule}</p>
          <p className="mt-2 text-xs text-slate-500">
            Route: {gtmRouteSummary.route}; source count: {gtmRouteSummary.sourceCount}; reference:{" "}
            {gtmRouteSummary.readOnlyReference}
          </p>
          <div className="mt-4 grid gap-3 xl:grid-cols-[1fr,0.8fr]">
            <div className="grid gap-2 md:grid-cols-5">
              {gtmBeachheadRoutes.map((route) => (
                <div key={route.domain} className="rounded border border-slate-700 bg-slate-900/60 p-3">
                  <p className="text-sm font-semibold text-white">{route.domain}</p>
                  <p className="mt-1 text-xs text-slate-500">{route.tradeLabel}</p>
                  <p className="mt-2 text-xs font-semibold text-sky-200">{route.demoPhone}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {route.landingPath} to {route.signupPath}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Read-only evidence</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                {productRouteInventorySources.map((source) => (
                  <li key={source}>- {source}</li>
                ))}
              </ul>
            </div>
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
