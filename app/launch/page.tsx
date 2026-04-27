"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Launch gate loads checklist/status data after mount. */

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  buildLaunchUrl,
  defaultLaunchAssetId,
  getCurrentCampaignMonth,
  launchAngles,
  launchPlatforms,
  type LaunchAngle,
  type LaunchDestination,
  type LaunchPlatform,
} from "@/lib/launch-url-builder";
import { productRouteInventory } from "@/lib/product-route-inventory";
import { getTierTrades } from "@/lib/trade-utils";
import type { CampaignStatusData, LaunchChecklistItem } from "@/lib/types";

const GROUP_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  linkedin: { label: "LinkedIn", icon: "in", color: "text-blue-400" },
  meta: { label: "Meta (Facebook + Instagram)", icon: "f", color: "text-blue-500" },
  youtube: { label: "YouTube / Google Ads", icon: "▶", color: "text-red-400" },
  tracking: { label: "Tracking & Analytics", icon: "📊", color: "text-purple-400" },
  all: { label: "Universal (All Platforms)", icon: "✓", color: "text-green-400" },
};

const BLOCKERS_BEFORE_LAUNCH = [
  "14-day free trial messaging added to 1,040 ads",
  "All ad accounts created (LinkedIn CM, Meta Ads, Google/YouTube)",
  "1,040 ads approved by Jarrad at pumpcans.com/approval",
  "UTM parameters verified across all ad variants",
  "Tracking pixels installed and verified",
];

const LAUNCH_ROUTE_OPTIONS = productRouteInventory.filter((route) => route.status === "ready");

export default function LaunchPage() {
  const [items, setItems] = useState<LaunchChecklistItem[]>([]);
  const [status, setStatus] = useState<CampaignStatusData | null>(null);
  const [saving, setSaving] = useState(false);
  const [launchTrade, setLaunchTrade] = useState("pipe.city");
  const [launchPlatform, setLaunchPlatform] = useState<LaunchPlatform>("linkedin");
  const [launchAngle, setLaunchAngle] = useState<LaunchAngle>("missed-call");
  const [launchDestination, setLaunchDestination] = useState<LaunchDestination>("landing");
  const [launchAssetId, setLaunchAssetId] = useState(defaultLaunchAssetId("pipe.city", "missed-call"));
  const [launchCampaignMonth, setLaunchCampaignMonth] = useState(getCurrentCampaignMonth());
  const [launchCampaignName, setLaunchCampaignName] = useState("");
  const [launchCreatorSlug, setLaunchCreatorSlug] = useState("");
  const [launchCreatorId, setLaunchCreatorId] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function load() {
    const [checkRes, statusRes] = await Promise.all([
      fetch("/api/launch-checklist", { cache: "no-store" }),
      fetch("/api/campaign-status", { cache: "no-store" }),
    ]);
    setItems((await checkRes.json()) as LaunchChecklistItem[]);
    setStatus((await statusRes.json()) as CampaignStatusData);
  }

  useEffect(() => { void load(); }, []);

  async function toggle(id: string, checked: boolean) {
    await fetch("/api/launch-checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked: !checked }),
    });
    void load();
  }

  async function markAllReady() {
    if (!confirm(`Mark all ${items.length} checklist items as complete? Only do this if everything is genuinely ready.`)) return;
    setSaving(true);
    await fetch("/api/launch-checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setSaving(false);
    void load();
  }

  async function goLive() {
    if (!confirm("This will set campaign status to LIVE. Confirm only when ad accounts are active and all checklist items are truly ready.")) return;
    setSaving(true);
    await fetch("/api/campaign-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "live",
        startDate: new Date().toISOString(),
        linkedinStatus: "live",
        youtubeStatus: "live",
        facebookStatus: "live",
        instagramStatus: "live",
      }),
    });
    setSaving(false);
    void load();
  }

  const grouped = useMemo(() => {
    const groups: Record<string, LaunchChecklistItem[]> = {};
    for (const item of items) {
      const g = item.platform ?? "all";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [items]);

  const complete = items.filter((i) => i.checked).length;
  const allChecked = items.length > 0 && complete === items.length;
  const readyToGo = allChecked && status?.status === "pre-launch";
  const overallPct = items.length ? Math.round((complete / items.length) * 100) : 0;
  const tierOneLaunchOrder = getTierTrades(1).join("/");
  const launchCampaignMonthIsValid = /^\d{4}-\d{2}$/.test(launchCampaignMonth);
  const launchUrlResult = useMemo(() => buildLaunchUrl({
    trade: launchTrade,
    platform: launchPlatform,
    angle: launchAngle,
    assetId: launchAssetId,
    campaignName: launchCampaignName,
    campaignMonth: launchCampaignMonthIsValid ? launchCampaignMonth : getCurrentCampaignMonth(),
    creatorSlug: launchCreatorSlug,
    creatorId: launchCreatorId,
    destination: launchDestination,
  }), [
    launchAngle,
    launchAssetId,
    launchCampaignMonth,
    launchCampaignMonthIsValid,
    launchCampaignName,
    launchCreatorId,
    launchCreatorSlug,
    launchDestination,
    launchPlatform,
    launchTrade,
  ]);

  async function copyLaunchUrl() {
    try {
      await navigator.clipboard.writeText(launchUrlResult.url);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  if (!status) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading launch gate…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Gate</h1>

      {/* Launch URL builder */}
      <Card className="border-cyan-800/60 bg-slate-900/70">
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">Launch URL Builder</p>
            <h2 className="mt-1 text-xl font-black text-white">{launchUrlResult.domain}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Internal planning URL only. Nothing is uploaded, launched, sent, or billed from this panel.
            </p>
          </div>
          <div className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-right text-xs text-slate-400">
            <p className="font-semibold text-slate-200">{launchUrlResult.campaign}</p>
            <p>{launchUrlResult.contentId}</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trade</span>
            <select
              value={launchTrade}
              onChange={(event) => {
                setLaunchTrade(event.target.value);
                setLaunchAssetId(defaultLaunchAssetId(event.target.value, launchAngle));
                setCopyStatus("idle");
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              {LAUNCH_ROUTE_OPTIONS.map((route) => (
                <option key={route.domain} value={route.domain}>
                  {route.domain} - {route.tradeLabel}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Platform</span>
            <select
              value={launchPlatform}
              onChange={(event) => {
                setLaunchPlatform(event.target.value as LaunchPlatform);
                setCopyStatus("idle");
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              {launchPlatforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Angle</span>
            <select
              value={launchAngle}
              onChange={(event) => {
                const nextAngle = event.target.value as LaunchAngle;
                setLaunchAngle(nextAngle);
                setLaunchAssetId(defaultLaunchAssetId(launchTrade, nextAngle));
                setCopyStatus("idle");
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              {launchAngles.map((angle) => (
                <option key={angle} value={angle}>{angle}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Destination</span>
            <select
              value={launchDestination}
              onChange={(event) => {
                setLaunchDestination(event.target.value as LaunchDestination);
                setCopyStatus("idle");
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="landing">domain root</option>
              <option value="signup">signup path</option>
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          <label className="space-y-1 text-sm lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Asset ID</span>
            <input
              value={launchAssetId}
              onChange={(event) => {
                setLaunchAssetId(event.target.value);
                setCopyStatus("idle");
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Month</span>
            <input
              value={launchCampaignMonth}
              onChange={(event) => {
                setLaunchCampaignMonth(event.target.value);
                setCopyStatus("idle");
              }}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
            {!launchCampaignMonthIsValid && (
              <span className="text-xs text-amber-300">Use YYYY-MM.</span>
            )}
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Campaign</span>
            <input
              value={launchCampaignName}
              onChange={(event) => {
                setLaunchCampaignName(event.target.value);
                setCopyStatus("idle");
              }}
              placeholder={launchAngle}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600"
            />
          </label>

          <label className="space-y-1 text-sm lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Creator</span>
            <input
              value={launchCreatorSlug}
              onChange={(event) => {
                setLaunchCreatorSlug(event.target.value);
                setCopyStatus("idle");
              }}
              placeholder="optional"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_160px]">
          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Creator ID</span>
            <input
              value={launchCreatorId}
              onChange={(event) => {
                setLaunchCreatorId(event.target.value);
                setCopyStatus("idle");
              }}
              placeholder="optional"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600"
            />
          </label>
          <div className="flex items-end">
            <GhostButton className="w-full" onClick={() => void copyLaunchUrl()}>
              {copyStatus === "copied" ? "Copied" : "Copy URL"}
            </GhostButton>
          </div>
        </div>

        <textarea
          readOnly
          value={launchUrlResult.url}
          className="mt-4 h-24 w-full rounded border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-cyan-100"
        />
        {copyStatus === "failed" && (
          <p className="mt-2 text-xs text-amber-300">Clipboard failed. The URL is selectable above.</p>
        )}
        <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-4">
          <p><span className="font-semibold text-slate-300">Source:</span> {launchUrlResult.source}</p>
          <p><span className="font-semibold text-slate-300">Medium:</span> {launchUrlResult.medium}</p>
          <p><span className="font-semibold text-slate-300">Trade:</span> {launchUrlResult.route.tradeSlug}</p>
          <p><span className="font-semibold text-slate-300">Demo:</span> {launchUrlResult.route.demoPhone}</p>
        </div>
      </Card>

      {/* Overall readiness */}
      <Card className={`border-2 ${allChecked ? "border-green-500" : "border-amber-600"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Overall Readiness</p>
            <p className={`text-2xl font-black mt-1 ${allChecked ? "text-green-400" : "text-amber-400"}`}>
              {complete} / {items.length} — {allChecked ? "READY TO LAUNCH 🚀" : `${items.length - complete} items remaining`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton disabled={saving} onClick={markAllReady}>
              {saving ? "Saving…" : "Mark All Ready"}
            </GhostButton>
            <Button
              className={`${readyToGo ? "bg-emerald-600 hover:bg-emerald-500" : "opacity-50 cursor-not-allowed"} font-bold text-white`}
              disabled={!readyToGo || saving}
              onClick={goLive}
            >
              🚀 GO LIVE
            </Button>
          </div>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-700 mb-1">
          <div className={`h-3 rounded-full transition-all ${allChecked ? "bg-green-500" : "bg-amber-500"}`}
               style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-xs text-slate-400">{overallPct}% complete · Campaign status: <span className="font-semibold text-slate-200">{status.status}</span></p>
      </Card>

      {/* Hard blockers (separate from checklist) */}
      <Card>
        <h2 className="mb-3 font-semibold text-amber-400">🚧 Hard Blockers Before Launch</h2>
        <p className="mb-3 text-xs text-slate-500">These are NOT in the checklist — they must be resolved regardless of checklist state.</p>
        <div className="space-y-2">
          {BLOCKERS_BEFORE_LAUNCH.map((b) => (
            <div key={b} className="flex items-start gap-3 rounded border border-red-800/40 bg-red-950/20 px-3 py-2">
              <span className="text-red-400 mt-0.5 shrink-0">✗</span>
              <p className="text-sm text-slate-300">{b}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Per-platform groups */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(grouped)
          .sort(([a], [b]) => {
            const order = ["linkedin", "meta", "youtube", "tracking", "all"];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map(([group, rows]) => {
            const cfg = GROUP_CONFIG[group] ?? { label: group, icon: "?", color: "text-slate-300" };
            const groupComplete = rows.filter((r) => r.checked).length;
            const groupPct = rows.length ? Math.round((groupComplete / rows.length) * 100) : 0;
            const allGroupDone = groupComplete === rows.length;

            return (
              <Card key={group}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-700 text-xs font-bold">
                      {cfg.icon}
                    </span>
                    <h2 className={`font-semibold ${cfg.color}`}>{cfg.label}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${allGroupDone ? "text-green-400" : "text-slate-400"}`}>
                      {groupComplete}/{rows.length}
                    </span>
                    {allGroupDone && <span className="text-green-400 text-sm">✓</span>}
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-700 mb-3">
                  <div className={`h-1.5 rounded-full transition-all ${allGroupDone ? "bg-green-500" : "bg-blue-500"}`}
                       style={{ width: `${groupPct}%` }} />
                </div>

                <div className="space-y-2">
                  {rows.map((item) => (
                    <label key={item.id}
                           className={`flex items-start gap-3 rounded border p-2 cursor-pointer transition-colors ${
                             item.checked
                               ? "border-green-800/30 bg-green-950/20"
                               : "border-slate-700 bg-slate-800/40 hover:border-slate-500"
                           }`}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(item.id, item.checked)}
                        className="mt-0.5 accent-green-500"
                      />
                      <span className={`text-sm ${item.checked ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                  {rows.length === 0 && (
                    <p className="text-sm text-slate-500">No items in this group.</p>
                  )}
                </div>
              </Card>
            );
          })}
      </div>

      {/* Launch sequence */}
      <Card>
        <h2 className="mb-4 font-semibold">Launch Sequence</h2>
        <div className="space-y-2 text-sm">
          {[
            { step: 1, label: "Approve all 1,040 ads at /approval", done: false },
            { step: 2, label: "Set up LinkedIn Campaign Manager, Meta Ads, Google/YouTube Ads", done: false },
            { step: 3, label: "Patch 14-day free trial messaging into ad copy (pending Jarrad decision)", done: false },
            { step: 4, label: "Upload approved ads with correct UTMs to each platform", done: false },
            { step: 5, label: "Verify tracking pixels on all .city landing pages", done: false },
            { step: 6, label: "Set daily budgets: LinkedIn $200, YouTube $167, Facebook $133, Instagram $100", done: false },
            { step: 7, label: `Launch Tier 1 trades first: ${tierOneLaunchOrder}`, done: false },
            { step: 8, label: "Log Week 1 metrics in /scorecard — apply kill/scale rules", done: false },
          ].map((s) => (
            <div key={s.step} className={`flex items-start gap-3 rounded border px-3 py-2 ${s.done ? "border-green-800/30 bg-green-950/20" : "border-slate-700"}`}>
              <span className={`shrink-0 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center mt-0.5 ${s.done ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`}>
                {s.step}
              </span>
              <span className={s.done ? "line-through text-slate-500" : "text-slate-300"}>{s.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
