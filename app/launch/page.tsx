"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
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

export default function LaunchPage() {
  const [items, setItems] = useState<LaunchChecklistItem[]>([]);
  const [status, setStatus] = useState<CampaignStatusData | null>(null);
  const [saving, setSaving] = useState(false);

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

  if (!status) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading launch gate…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Gate</h1>

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
            { step: 7, label: "Launch Tier 1 trades first: mow/pipe/coat/duct/pest/electricians/roofrepair/disaster", done: false },
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
