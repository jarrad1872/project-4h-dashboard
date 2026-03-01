"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlatformChip } from "@/components/chips";
import { Button, Card, GhostButton } from "@/components/ui";
import type { Ad, CampaignStatusData } from "@/lib/types";

const PLATFORMS = ["linkedin", "youtube", "facebook", "instagram"] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_ICONS: Record<Platform, string> = {
  linkedin: "🔵",
  youtube: "🔴",
  facebook: "🔷",
  instagram: "🟣",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  linkedin: "border-blue-500/40 bg-blue-950/20",
  youtube: "border-red-500/40 bg-red-950/20",
  facebook: "border-blue-400/40 bg-blue-900/20",
  instagram: "border-purple-500/40 bg-purple-950/20",
};

const TARGET_USERS = 2000;
const TOTAL_BUDGET = 20000;

interface Stats {
  totalAds: number;
  adsByPlatform: Record<Platform, number>;
  adsByStatus: Record<string, number>;
  totalAssets: number;
  pendingAssets: number;
  approvedAds: number;
  pendingAds: number;
}

export default function CommandCenter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaign, setCampaign] = useState<CampaignStatusData | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [dismissedBlockers, setDismissedBlockers] = useState<Set<string>>(new Set());

  async function loadStats() {
    const [adsRes, assetsRes, campaignRes] = await Promise.all([
      fetch("/api/ads", { cache: "no-store" }),
      fetch("/api/trade-assets", { cache: "no-store" }),
      fetch("/api/campaign-status", { cache: "no-store" }),
    ]);

    const ads = (await adsRes.json()) as Ad[];
    const assets = assetsRes.ok ? ((await assetsRes.json()) as any[]) : [];
    const camp = (await campaignRes.json()) as CampaignStatusData;

    const adsByPlatform = PLATFORMS.reduce((acc, p) => {
      acc[p] = ads.filter((a) => a.platform === p).length;
      return acc;
    }, {} as Record<Platform, number>);

    const adsByStatus = ads.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalAds: ads.length,
      adsByPlatform,
      adsByStatus,
      totalAssets: assets.length,
      pendingAssets: assets.filter((a: any) => a.status === "pending").length,
      approvedAds: adsByStatus["approved"] ?? 0,
      pendingAds: adsByStatus["pending"] ?? 0,
    });
    setCampaign(camp);
  }

  useEffect(() => { void loadStats(); }, []);

  async function setCampaignPhase(status: CampaignStatusData["status"]) {
    setTogglingStatus(true);
    await fetch("/api/campaign-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadStats();
    setTogglingStatus(false);
  }

  function dismiss(key: string) {
    setDismissedBlockers((prev) => new Set(prev).add(key));
  }

  const phases: CampaignStatusData["status"][] = ["pre-launch", "live", "paused", "ended"];
  const phaseColors: Record<string, string> = {
    "pre-launch": "bg-slate-700 text-slate-200",
    live: "bg-green-600 text-white",
    paused: "bg-amber-600 text-white",
    ended: "bg-red-800 text-white",
  };

  // Blockers — ordered by priority
  const blockers = [
    {
      key: "ad-accounts",
      severity: "red",
      title: "Ad accounts not set up",
      detail: "LinkedIn Campaign Manager, Meta Ads Manager, Google Ads — all three required before launch.",
      action: <Link href="/launch"><GhostButton>Open Launch Checklist →</GhostButton></Link>,
    },
    {
      key: "trial-copy",
      severity: "red",
      title: "14-day free trial missing from all 1,040 ads",
      detail: "\"14-day free trial, no credit card required\" is the key conversion hook. Currently absent from every NB2 ad. Decide: patch existing or generate v2 pass.",
      action: (
        <div className="flex gap-2">
          <GhostButton onClick={() => dismiss("trial-copy")}>Patch Later</GhostButton>
          <Link href="/ads"><Button>Go to Ads →</Button></Link>
        </div>
      ),
    },
    {
      key: "approve-ads",
      severity: "amber",
      title: `${stats?.pendingAds ?? "..."} ads pending approval`,
      detail: "All NB2 ads are in pending state. Review copy per trade and approve before campaign launch.",
      action: <Link href="/approval"><Button>Open Approval Queue →</Button></Link>,
    },
    {
      key: "approve-assets",
      severity: "amber",
      title: `${stats?.pendingAssets ?? "..."} trade assets pending approval`,
      detail: "Hero A, Hero B, and OG images for all 65 trades need approval before ads go live.",
      action: <Link href="/assets"><Button>Open Trade Assets →</Button></Link>,
    },
    {
      key: "creatives-gen",
      severity: "green",
      title: "C2/C3 creative variants generating",
      detail: "130 new images (company overview + on-site action) being generated for all 65 trades. Will complete automatically.",
      action: <Link href="/ads"><GhostButton>View on /ads →</GhostButton></Link>,
    },
    {
      key: "influencer",
      severity: "amber",
      title: "Influencer outreach not started",
      detail: "Top 3 priority: Mike Andes (lawn), Brian's Lawn Maintenance, AC Service Tech LLC. Deal structure ready.",
      action: <GhostButton onClick={() => dismiss("influencer")}>Mark In Progress</GhostButton>,
    },
  ].filter((b) => !dismissedBlockers.has(b.key));

  const severityStyles = {
    red: "border-red-600/50 bg-red-950/20",
    amber: "border-amber-500/50 bg-amber-950/20",
    green: "border-green-600/50 bg-green-950/20",
  };
  const severityDots = { red: "bg-red-500", amber: "bg-amber-400", green: "bg-green-500" };

  return (
    <div className="space-y-6">

      {/* ── MISSION HEADER ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Project 4H — Campaign Command</p>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-white">0</span>
              <span className="text-slate-500"> / {TARGET_USERS.toLocaleString()} users</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">65 trades · 4 channels · $20K budget · pre-launch</p>
          </div>

          {/* Phase toggle */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500">Campaign phase</p>
            <div className="flex gap-1">
              {phases.map((p) => (
                <button
                  key={p}
                  disabled={togglingStatus}
                  onClick={() => setCampaignPhase(p)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                    campaign?.status === p
                      ? phaseColors[p]
                      : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar toward 2,000 */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-slate-700">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: "0%" }} />
          </div>
          <p className="mt-1 text-right text-xs text-slate-500">0% of 2,000-user target</p>
        </div>
      </div>

      {/* ── BLOCKERS BOARD ───────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          🚧 Launch Blockers — {blockers.filter(b => b.severity !== "green").length} remaining
        </h2>
        <div className="space-y-2">
          {blockers.map((b) => (
            <div
              key={b.key}
              className={`flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between ${severityStyles[b.severity as keyof typeof severityStyles]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${severityDots[b.severity as keyof typeof severityDots]}`} />
                <div>
                  <p className="font-semibold text-slate-100">{b.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{b.detail}</p>
                </div>
              </div>
              <div className="ml-5 shrink-0 md:ml-0">{b.action}</div>
            </div>
          ))}
          {blockers.length === 0 && (
            <div className="rounded-lg border border-green-600/50 bg-green-950/20 p-4 text-center text-green-400 font-semibold">
              ✅ All blockers cleared — ready to launch
            </div>
          )}
        </div>
      </div>

      {/* ── PLATFORM CARDS ───────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Ad Inventory</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {PLATFORMS.map((p) => (
            <Link key={p} href={`/ads?platform=${p}`}>
              <div className={`group rounded-lg border p-4 transition-all hover:brightness-110 cursor-pointer ${PLATFORM_COLORS[p]}`}>
                <div className="mb-2 flex items-center justify-between">
                  <PlatformChip platform={p} />
                  <span className="text-lg">{PLATFORM_ICONS[p]}</span>
                </div>
                <p className="text-2xl font-bold">{stats?.adsByPlatform[p] ?? "—"}</p>
                <p className="text-xs text-slate-400">ads total</p>
                <p className="mt-2 text-xs text-slate-500">click to filter →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Ads", value: stats?.totalAds ?? "—", sub: "in database", href: "/ads" },
          { label: "Pending Approval", value: stats?.pendingAds ?? "—", sub: "need your review", href: "/approval" },
          { label: "Trade Assets", value: stats?.pendingAssets ?? "—", sub: "images to approve", href: "/assets" },
          { label: "Budget Remaining", value: `$${TOTAL_BUDGET.toLocaleString()}`, sub: "of $20K total", href: "/budget" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="cursor-pointer hover:border-slate-500 transition-all group">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 group-hover:text-slate-300">{s.label}</p>
              <p className="mt-1 text-3xl font-black text-white">{String(s.value)}</p>
              <p className="text-xs text-slate-500">{s.sub} →</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Approve Ads", icon: "✅", href: "/approval", badge: stats?.pendingAds, color: "border-green-600/40 hover:bg-green-950/30" },
            { label: "Approve Assets", icon: "🖼️", href: "/assets", badge: stats?.pendingAssets, color: "border-blue-600/40 hover:bg-blue-950/30" },
            { label: "Ad Library", icon: "📋", href: "/ads", color: "border-slate-600/40 hover:bg-slate-700/30" },
            { label: "GTM Board", icon: "🎯", href: "/gtm", color: "border-slate-600/40 hover:bg-slate-700/30" },
            { label: "AI Studio", icon: "🎨", href: "/generate", color: "border-purple-600/40 hover:bg-purple-950/30" },
            { label: "Launch Gate", icon: "🚀", href: "/launch", color: "border-orange-600/40 hover:bg-orange-950/30" },
          ].map((a) => (
            <Link key={a.label} href={a.href}>
              <div className={`relative flex flex-col items-center justify-center rounded-lg border p-4 text-center cursor-pointer transition-all ${a.color}`} style={{ minHeight: 80 }}>
                {a.badge != null && a.badge > 0 && (
                  <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {a.badge}
                  </span>
                )}
                <span className="text-2xl">{a.icon}</span>
                <span className="mt-1 text-xs font-semibold text-slate-300">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CREATIVE STATUS ──────────────────────────────────────────────── */}
      <Card>
        <h3 className="mb-3 font-semibold">Creative Coverage — 65 Trades</h3>
        <div className="space-y-3">
          {[
            { label: "C1 — Hands-on zoom (hero_a)", done: 65, total: 65, color: "bg-green-500" },
            { label: "C2 — Company overview (generating)", done: 0, total: 65, color: "bg-blue-500", note: "sub-agent running" },
            { label: "C3 — On-site action wide (generating)", done: 0, total: 65, color: "bg-purple-500", note: "sub-agent running" },
            { label: "Hero B — Wide top-down (landing pages)", done: 65, total: 65, color: "bg-green-500" },
            { label: "OG — Link preview banner", done: 65, total: 65, color: "bg-green-500" },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                <span>{row.label}{row.note ? <span className="ml-2 text-amber-400">({row.note})</span> : null}</span>
                <span className="font-semibold">{row.done}/{row.total}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-700">
                <div
                  className={`h-1.5 rounded-full transition-all ${row.color}`}
                  style={{ width: `${(row.done / row.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Link href="/assets"><GhostButton>View All Assets →</GhostButton></Link>
        </div>
      </Card>

    </div>
  );
}
