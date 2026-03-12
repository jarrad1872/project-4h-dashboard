"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Button, GhostButton } from "@/components/ui";
import { PlatformChip, StatusChip } from "@/components/chips";
import type { Ad, CampaignStatusData } from "@/lib/types";
import { TRADE_MAP } from "@/lib/trade-utils";

const PLATFORMS = ["linkedin", "youtube", "facebook", "instagram"] as const;
const PLATFORM_ICONS: Record<string, string> = {
  linkedin: "in",
  youtube: "▶",
  facebook: "f",
  instagram: "ig",
};

const SEVERITY_STYLE: Record<string, string> = {
  high: "border-red-700/50 bg-red-950/20 text-red-400",
  med: "border-amber-700/50 bg-amber-950/20 text-amber-400",
  low: "border-slate-700/50 bg-slate-800/40 text-slate-400",
};

interface Blocker {
  id: string;
  label: string;
  severity: "high" | "med" | "low";
  action: string;
  href: string | null;
}

interface EngineStatus {
  configured: boolean;
  last_run: {
    id: string;
    run_at: string;
    signals: { platform: string; signal: string }[];
    alerts_fired: unknown[];
  } | null;
}

export default function OverviewPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [campaign, setCampaign] = useState<CampaignStatusData | null>(null);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/ads", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/campaign-status", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/blockers", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/engine/status", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]).then(([adsData, campaignData, blockersData, engineData]: [Ad[], CampaignStatusData, { blockers: Blocker[] } | null, EngineStatus | null]) => {
      setAds(adsData);
      setCampaign(campaignData);
      if (blockersData?.blockers) setBlockers(blockersData.blockers);
      if (engineData) setEngineStatus(engineData);
      setLoading(false);
    });
  }, []);

  async function setCampaignStatus(status: CampaignStatusData["status"]) {
    if (!campaign) return;
    setSaving(true);
    const patch = { status, ...(status === "live" ? { startDate: new Date().toISOString() } : {}) };
    const updated = await fetch("/api/campaign-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => r.json()) as CampaignStatusData;
    setCampaign(updated);
    setSaving(false);
  }

  // Derived stats
  const byStatus = ads.reduce<Record<string, number>>((acc, ad) => {
    acc[ad.status] = (acc[ad.status] ?? 0) + 1;
    return acc;
  }, {});

  const byPlatform = ads.reduce<Record<string, number>>((acc, ad) => {
    acc[ad.platform] = (acc[ad.platform] ?? 0) + 1;
    return acc;
  }, {});

  const approvedAds = byStatus["approved"] ?? 0;
  const pendingAds = byStatus["pending"] ?? 0;
  const totalAds = ads.length;
  const approvalPct = totalAds ? Math.round((approvedAds / totalAds) * 100) : 0;

  const customCreativeAds = ads.filter((a) => (a.creative_variant ?? 1) > 1).length;

  const highBlockers = blockers.filter((b) => b.severity === "high").length;
  const launchReady = highBlockers === 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading command center…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project 4H — Command Center</h1>
          <p className="mt-1 text-sm text-slate-400">
            65 trades · 1,040 ads · 4 channels · <span className="font-semibold text-white">Target: 2,000 users</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campaign && <StatusChip status={campaign.status} />}
          <span className={`text-xs font-bold px-2 py-1 rounded ${launchReady ? "bg-green-700 text-green-100" : "bg-red-900 text-red-300"}`}>
            {launchReady ? "LAUNCH READY" : `${highBlockers} BLOCKERS`}
          </span>
        </div>
      </div>

      {/* ── Mission Progress Bar ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mission Progress</h2>
          <span className="text-xs text-slate-500">2,000 users to hit profitability</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-700">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all" style={{ width: "0%" }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>0 users</span>
          <span className="text-slate-300 font-semibold">Pre-launch</span>
          <span>2,000 users</span>
        </div>
      </Card>

      {/* ── Engine Status ────────────────────────────────────────────────── */}
      {engineStatus && engineStatus.configured && (
        <Card className="border-blue-800/40 bg-blue-950/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-400">Engine Status</h2>
            {engineStatus.last_run && (
              <span className="text-xs text-slate-500">
                Last run: {new Date(engineStatus.last_run.run_at).toLocaleString()}
              </span>
            )}
          </div>
          {engineStatus.last_run ? (
            <div className="flex flex-wrap gap-3">
              {(engineStatus.last_run.signals ?? []).map((s: { platform: string; signal: string }) => (
                <div key={s.platform} className="rounded bg-slate-900/60 px-3 py-1.5 text-xs">
                  <span className="mr-1">
                    {s.signal === "scale" ? "🟢" : s.signal === "kill" ? "🔴" : "🟡"}
                  </span>
                  <span className="font-semibold capitalize">{s.platform}</span>
                  <span className="ml-1 uppercase text-slate-400">{s.signal}</span>
                </div>
              ))}
              {Array.isArray(engineStatus.last_run.alerts_fired) && engineStatus.last_run.alerts_fired.length > 0 && (
                <div className="rounded bg-red-900/30 px-3 py-1.5 text-xs text-red-300">
                  {engineStatus.last_run.alerts_fired.length} alert(s) fired
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No engine runs yet. Deploy 4h-engine.js to VPS.</p>
          )}
        </Card>
      )}

      {/* ── Campaign Status Toggle ────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-1">Campaign Status</h2>
            <p className="text-xs text-slate-500">Controls what's live across all 4 channels</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["pre-launch", "live", "paused", "ended"] as const).map((s) => (
              <button
                key={s}
                disabled={saving || campaign?.status === s}
                onClick={() => setCampaignStatus(s)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                  campaign?.status === s
                    ? "bg-blue-600 text-white"
                    : "border border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Blockers Board ────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          🚧 Launch Blockers ({blockers.length} total · {highBlockers} critical)
        </h2>
        {blockers.length > 0 ? (
          <div className="space-y-2">
            {blockers.map((b) => (
              <div key={b.id} className={`flex items-start justify-between gap-4 rounded border p-3 ${SEVERITY_STYLE[b.severity]}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100">{b.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{b.action}</p>
                </div>
                {b.href ? (
                  <Link href={b.href} className="shrink-0 rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600 transition-colors">
                    Go →
                  </Link>
                ) : (
                  <span className="shrink-0 rounded bg-slate-800 px-3 py-1 text-xs text-slate-500">Waiting</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-6">
            <p className="text-green-400 font-semibold">No blockers detected</p>
          </Card>
        )}
      </div>

      {/* ── Ad Stats by Platform ─────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Ad Library</h2>
          <Link href="/ads" className="text-xs text-blue-400 hover:underline">View all {totalAds} ads →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {PLATFORMS.map((p) => {
            const count = byPlatform[p] ?? 0;
            const platformApproved = ads.filter((a) => a.platform === p && a.status === "approved").length;
            const platformPending = ads.filter((a) => a.platform === p && a.status === "pending").length;
            return (
              <Link key={p} href={`/ads?platform=${p}`} className="block">
                <Card className="hover:border-blue-500/40 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-700 text-xs font-bold text-white">
                      {PLATFORM_ICONS[p]}
                    </span>
                    <span className="text-sm font-semibold capitalize">{p}</span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-slate-400 mt-1">ads total</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-green-400">{platformApproved} approved</span>
                    <span className="text-amber-400">{platformPending} pending</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Approval + Asset Status ──────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold">Ad Approvals</h3>
              <p className="text-xs text-slate-400 mt-0.5">{approvedAds} of {totalAds} approved ({approvalPct}%)</p>
            </div>
            <Link href="/approval" className="rounded bg-amber-700/30 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-700/50 transition-colors">
              Approve →
            </Link>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700 mb-3">
            <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${approvalPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded bg-slate-800 p-2">
              <p className="text-lg font-bold text-amber-400">{pendingAds}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="rounded bg-slate-800 p-2">
              <p className="text-lg font-bold text-green-400">{approvedAds}</p>
              <p className="text-xs text-slate-500">Approved</p>
            </div>
            <div className="rounded bg-slate-800 p-2">
              <p className="text-lg font-bold text-red-400">{byStatus["rejected"] ?? 0}</p>
              <p className="text-xs text-slate-500">Rejected</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold">Trade Assets</h3>
              <p className="text-xs text-slate-400 mt-0.5">325 images across 65 trades · 5 types each</p>
            </div>
            <Link href="/assets" className="rounded bg-amber-700/30 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-700/50 transition-colors">
              Review →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: "Hero A (ad zoom)", count: 65, type: "hero_a" },
              { label: "Hero B (landing page)", count: 65, type: "hero_b" },
              { label: "OG (link preview)", count: 65, type: "og_nb2" },
              { label: "C2 (company overview)", count: 64, type: "c2" },
              { label: "C3 (on-site wide)", count: 64, type: "c3" },
            ].map((row) => (
              <div key={row.type} className="rounded bg-slate-800 p-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">{row.label}</span>
                <span className="text-xs font-bold text-slate-200">{row.count}</span>
              </div>
            ))}
            <div className="rounded bg-slate-800 p-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-xs font-bold text-green-400">323</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Creative Variant Status ───────────────────────────────────────── */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold">Creative Variants</h3>
            <p className="text-xs text-slate-400 mt-0.5">3 swappable images per trade — C1/C2/C3</p>
          </div>
          <Link href="/ads" className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-600 transition-colors">
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded bg-slate-800 p-3">
            <p className="text-xl font-bold text-slate-200">65</p>
            <p className="text-xs text-slate-500 mt-1">C1 — Hands-on zoom</p>
            <p className="text-xs text-green-400 mt-1">✓ All generated</p>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <p className="text-xl font-bold text-slate-200">64</p>
            <p className="text-xs text-slate-500 mt-1">C2 — Company overview</p>
            <p className="text-xs text-amber-400 mt-1">128 images in storage</p>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <p className="text-xl font-bold text-slate-200">64</p>
            <p className="text-xs text-slate-500 mt-1">C3 — On-site action</p>
            <p className="text-xs text-amber-400 mt-1">Edit bad images via ✏️</p>
          </div>
        </div>
        {customCreativeAds > 0 && (
          <p className="mt-3 text-xs text-blue-400">{customCreativeAds} ads have custom creative variant assigned (C2 or C3)</p>
        )}
      </Card>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/approval">
            <Button>Review Ads ({pendingAds} pending)</Button>
          </Link>
          <Link href="/assets">
            <GhostButton>Review Assets (325 pending)</GhostButton>
          </Link>
          <Link href="/ads">
            <GhostButton>Browse Ad Library</GhostButton>
          </Link>
          <Link href="/gtm">
            <GhostButton>GTM Board</GhostButton>
          </Link>
          <Link href="/scorecard">
            <GhostButton>Log Metrics</GhostButton>
          </Link>
          <Link href="/launch">
            <GhostButton>Launch Checklist</GhostButton>
          </Link>
          <Link href="/influencer">
            <GhostButton>Influencer Pipeline</GhostButton>
          </Link>
        </div>
      </Card>

      {/* ── Trade Coverage ────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold">Trade Coverage</h3>
            <p className="text-xs text-slate-400 mt-0.5">65 trades · 3 tiers · each with own .city domain</p>
          </div>
          <Link href="/gtm" className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-600 transition-colors">
            GTM Board →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { tier: "Tier 1", count: 8, desc: "Highest TAM — launch first", color: "text-blue-400" },
            { tier: "Tier 2", count: 32, desc: "Strong TAM — queue behind T1", color: "text-slate-300" },
            { tier: "Tier 3", count: 25, desc: "Niche — launch last", color: "text-slate-500" },
          ].map((t) => (
            <div key={t.tier} className="rounded bg-slate-800 p-3">
              <p className={`text-xl font-bold ${t.color}`}>{t.count}</p>
              <p className="text-xs font-semibold text-slate-300 mt-1">{t.tier}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Live:</span>
          {Object.entries(TRADE_MAP).filter(([, v]) => v.tier === 1).map(([t]) => (
            <span key={t} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">{t}.city</span>
          ))}
        </div>
      </Card>

    </div>
  );
}
