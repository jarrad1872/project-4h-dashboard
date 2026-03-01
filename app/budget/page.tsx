"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { CHANNELS, PLATFORM_LABELS } from "@/lib/constants";
import type { BudgetData } from "@/lib/types";

const CAMPAIGN_DAYS = 30;
const TOTAL_BUDGET = 20000;
const KILL_CPL = 40;
const SCALE_CPL = 20;

type ChannelKey = (typeof CHANNELS)[number];

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [editing, setEditing] = useState<Partial<Record<ChannelKey, { spent: string; allocated: string }>>>({});
  const [saving, setSaving] = useState<Partial<Record<ChannelKey, boolean>>>({});

  async function load() {
    const res = await fetch("/api/budget", { cache: "no-store" });
    const data = (await res.json()) as BudgetData;
    setBudget(data);
  }

  useEffect(() => { void load(); }, []);

  function startEdit(channel: ChannelKey) {
    if (!budget) return;
    setEditing((prev) => ({
      ...prev,
      [channel]: {
        spent: String(budget.channels[channel].spent),
        allocated: String(budget.channels[channel].allocated),
      },
    }));
  }

  function cancelEdit(channel: ChannelKey) {
    setEditing((prev) => { const n = { ...prev }; delete n[channel]; return n; });
  }

  async function saveEdit(channel: ChannelKey) {
    const e = editing[channel];
    if (!e) return;
    setSaving((prev) => ({ ...prev, [channel]: true }));

    await fetch("/api/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, spent: Number(e.spent) || 0 }),
    });

    if (budget && Number(e.allocated) !== budget.channels[channel].allocated) {
      await fetch("/api/actions/scale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, newBudget: Number(e.allocated) || 0 }),
      });
    }

    setSaving((prev) => ({ ...prev, [channel]: false }));
    cancelEdit(channel);
    void load();
  }

  const totals = useMemo(() => {
    if (!budget) return { allocated: 0, spent: 0, remaining: 0 };
    const allocated = Object.values(budget.channels).reduce((sum, c) => sum + c.allocated, 0);
    const spent = Object.values(budget.channels).reduce((sum, c) => sum + c.spent, 0);
    return { allocated, spent, remaining: allocated - spent };
  }, [budget]);

  if (!budget) return <div className="flex h-64 items-center justify-center text-slate-400">Loading budget…</div>;

  const burnPct = totals.allocated ? (totals.spent / totals.allocated) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget &amp; Pacing</h1>
          <p className="mt-1 text-sm text-slate-400">$20,000 total · 4 channels · 30-day campaign</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-400">Kill if CPL &gt; <span className="text-red-400 font-semibold">${KILL_CPL}</span></p>
          <p className="text-slate-400">Scale if CPL &lt; <span className="text-green-400 font-semibold">${SCALE_CPL}</span> + 5 sign-ups</p>
        </div>
      </div>

      {/* Total summary */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-400">Allocated</p>
              <p className="text-xl font-bold">${totals.allocated.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Spent</p>
              <p className="text-xl font-bold text-amber-400">${totals.spent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Remaining</p>
              <p className="text-xl font-bold text-green-400">${totals.remaining.toLocaleString()}</p>
            </div>
          </div>
          <span className={`rounded px-3 py-1 text-xs font-bold ${burnPct > 80 ? "bg-red-900/50 text-red-400" : burnPct > 50 ? "bg-amber-900/50 text-amber-400" : "bg-slate-700 text-slate-300"}`}>
            {burnPct.toFixed(1)}% burned
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-700">
          <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-amber-500 transition-all" style={{ width: `${Math.min(burnPct, 100)}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {TOTAL_BUDGET - totals.allocated > 0 ? `$${(TOTAL_BUDGET - totals.allocated).toLocaleString()} unallocated` : "Fully allocated"}
        </p>
      </Card>

      {/* Per-channel cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {CHANNELS.map((channel) => {
          const row = budget.channels[channel];
          const remaining = row.allocated - row.spent;
          const dailyBurn = row.spent / 7 || 0;
          const daysRemaining = dailyBurn > 0 ? remaining / dailyBurn : CAMPAIGN_DAYS;
          const pct = row.allocated ? (row.spent / row.allocated) * 100 : 0;
          const isEditing = !!editing[channel];
          const isSaving = !!saving[channel];
          const e = editing[channel];

          return (
            <Card key={channel}>
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold">{PLATFORM_LABELS[channel]}</h2>
                {!isEditing ? (
                  <GhostButton onClick={() => startEdit(channel)} className="text-xs py-1 px-2">
                    Edit
                  </GhostButton>
                ) : (
                  <div className="flex gap-1">
                    <Button onClick={() => saveEdit(channel)} disabled={isSaving} className="text-xs py-1 px-2">
                      {isSaving ? "Saving…" : "Save"}
                    </Button>
                    <GhostButton onClick={() => cancelEdit(channel)} disabled={isSaving} className="text-xs py-1 px-2">
                      Cancel
                    </GhostButton>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 mb-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Spent ($)</label>
                    <input
                      type="number"
                      value={e?.spent ?? ""}
                      onChange={(ev) => setEditing((prev) => ({ ...prev, [channel]: { ...prev[channel]!, spent: ev.target.value } }))}
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Allocated ($)</label>
                    <input
                      type="number"
                      value={e?.allocated ?? ""}
                      onChange={(ev) => setEditing((prev) => ({ ...prev, [channel]: { ...prev[channel]!, allocated: ev.target.value } }))}
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-3 text-center text-sm">
                  <div className="rounded bg-slate-800 p-2">
                    <p className="text-xs text-slate-500">Allocated</p>
                    <p className="font-bold">${row.allocated.toLocaleString()}</p>
                  </div>
                  <div className="rounded bg-slate-800 p-2">
                    <p className="text-xs text-slate-500">Spent</p>
                    <p className="font-bold text-amber-400">${row.spent.toLocaleString()}</p>
                  </div>
                  <div className="rounded bg-slate-800 p-2">
                    <p className="text-xs text-slate-500">Left</p>
                    <p className="font-bold text-green-400">${remaining.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="h-1.5 w-full rounded-full bg-slate-700 mb-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {!isEditing && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Daily burn: ${dailyBurn.toFixed(0)}</span>
                  <span>{daysRemaining > 0 ? `~${daysRemaining.toFixed(0)} days left` : "No spend yet"}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Kill/Scale thresholds */}
      <Card>
        <h3 className="mb-3 font-semibold">Kill / Scale Thresholds</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded bg-red-950/30 border border-red-800/30 p-3">
            <p className="text-xs text-slate-400 mb-1">Kill</p>
            <p className="text-lg font-bold text-red-400">CPL &gt; $40</p>
            <p className="text-xs text-slate-500 mt-1">Pause creative, kill platform</p>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <p className="text-xs text-slate-400 mb-1">Hold</p>
            <p className="text-lg font-bold text-slate-300">CTR &lt; 0.3%</p>
            <p className="text-xs text-slate-500 mt-1">After 1K impressions</p>
          </div>
          <div className="rounded bg-green-950/30 border border-green-800/30 p-3">
            <p className="text-xs text-slate-400 mb-1">Scale</p>
            <p className="text-lg font-bold text-green-400">CPL &lt; $20</p>
            <p className="text-xs text-slate-500 mt-1">+ 5 sign-ups → double budget</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
