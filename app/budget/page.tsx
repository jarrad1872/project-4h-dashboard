"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { CHANNELS, PLATFORM_LABELS } from "@/lib/constants";
import {
  allocateExperimentBudgets,
  seedExperimentBudgets,
  type ExperimentBudgetStatus,
} from "@/lib/experiment-budget-allocation";
import type { BudgetData } from "@/lib/types";

const CAMPAIGN_DAYS = 30;
const TOTAL_BUDGET = 20000;
const KILL_CPL = 40;
const SCALE_CPL = 20;

type ChannelKey = (typeof CHANNELS)[number];

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function statusClass(status: ExperimentBudgetStatus) {
  if (status === "allocated") return "border-green-700/40 bg-green-950/25 text-green-300";
  if (status === "partial") return "border-amber-700/40 bg-amber-950/30 text-amber-300";
  return "border-red-700/40 bg-red-950/25 text-red-300";
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [editing, setEditing] = useState<Partial<Record<ChannelKey, { spent: string; allocated: string }>>>({});
  const [saving, setSaving] = useState<Partial<Record<ChannelKey, boolean>>>({});
  const [experimentRequests, setExperimentRequests] = useState<Record<string, string>>(() =>
    Object.fromEntries(seedExperimentBudgets.map((experiment) => [experiment.id, String(experiment.requestedBudget)])),
  );

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
    setEditing((prev) => {
      const next = { ...prev };
      delete next[channel];
      return next;
    });
  }

  async function saveEdit(channel: ChannelKey) {
    const edit = editing[channel];
    if (!edit) return;
    setSaving((prev) => ({ ...prev, [channel]: true }));

    await fetch("/api/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, spent: Number(edit.spent) || 0 }),
    });

    if (budget && Number(edit.allocated) !== budget.channels[channel].allocated) {
      await fetch("/api/actions/scale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, newBudget: Number(edit.allocated) || 0 }),
      });
    }

    setSaving((prev) => ({ ...prev, [channel]: false }));
    cancelEdit(channel);
    void load();
  }

  const totals = useMemo(() => {
    if (!budget) return { allocated: 0, spent: 0, remaining: 0 };
    const allocated = Object.values(budget.channels).reduce((sum, channel) => sum + channel.allocated, 0);
    const spent = Object.values(budget.channels).reduce((sum, channel) => sum + channel.spent, 0);
    return { allocated, spent, remaining: allocated - spent };
  }, [budget]);

  const experimentPlan = useMemo(() => {
    if (!budget) return null;
    return allocateExperimentBudgets(
      budget,
      seedExperimentBudgets.map((experiment) => ({
        ...experiment,
        requestedBudget: Number(experimentRequests[experiment.id]) || 0,
      })),
    );
  }, [budget, experimentRequests]);

  if (!budget) return <div className="flex h-64 items-center justify-center text-slate-400">Loading budget...</div>;

  const burnPct = totals.allocated ? (totals.spent / totals.allocated) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget &amp; Pacing</h1>
          <p className="mt-1 text-sm text-slate-400">$20,000 total - 4 channels - 30-day campaign</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-400">Kill if CPL &gt; <span className="font-semibold text-red-400">${KILL_CPL}</span></p>
          <p className="text-slate-400">Scale if CPL &lt; <span className="font-semibold text-green-400">${SCALE_CPL}</span> + 5 sign-ups</p>
        </div>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-slate-400">Allocated</p>
              <p className="text-xl font-bold">{money(totals.allocated)}</p>
            </div>
            <div>
              <p className="text-slate-400">Spent</p>
              <p className="text-xl font-bold text-amber-400">{money(totals.spent)}</p>
            </div>
            <div>
              <p className="text-slate-400">Remaining</p>
              <p className="text-xl font-bold text-green-400">{money(totals.remaining)}</p>
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
          {TOTAL_BUDGET - totals.allocated > 0 ? `${money(TOTAL_BUDGET - totals.allocated)} unallocated` : "Fully allocated"}
        </p>
      </Card>

      {experimentPlan && (
        <Card className="border-blue-700/40 bg-blue-950/20">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Planning only</p>
              <h2 className="mt-1 text-lg font-semibold">Experiment Budget Allocation</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-300">
                Assign the first launch test budget by experiment before any manual platform upload. These rows are local
                planning state and do not save billing, Supabase budget rows, ad accounts, webhooks, or spend.
              </p>
            </div>
            <GhostButton
              onClick={() =>
                setExperimentRequests(
                  Object.fromEntries(
                    seedExperimentBudgets.map((experiment) => [experiment.id, String(experiment.requestedBudget)]),
                  ),
                )
              }
              className="text-xs"
            >
              Reset plan
            </GhostButton>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Requested</p>
              <p className="text-xl font-bold">{money(experimentPlan.totals.requested)}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Allocated to tests</p>
              <p className="text-xl font-bold text-green-300">{money(experimentPlan.totals.allocated)}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Partial</p>
              <p className="text-xl font-bold text-amber-300">{experimentPlan.totals.partial}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">Blocked</p>
              <p className="text-xl font-bold text-red-300">{experimentPlan.totals.blocked}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Priority</th>
                  <th className="py-2 pr-3 font-semibold">Experiment</th>
                  <th className="py-2 pr-3 font-semibold">Platform</th>
                  <th className="py-2 pr-3 font-semibold">Request</th>
                  <th className="py-2 pr-3 font-semibold">Allocated</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Budget left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {experimentPlan.allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="py-3 pr-3 text-slate-400">#{allocation.priority}</td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-white">{allocation.label}</p>
                      <p className="text-xs text-slate-500">
                        {allocation.tradeDomain} - {allocation.angle}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-slate-300">{PLATFORM_LABELS[allocation.platform]}</td>
                    <td className="py-3 pr-3">
                      <label className="sr-only" htmlFor={`request-${allocation.id}`}>
                        Requested budget for {allocation.label}
                      </label>
                      <input
                        id={`request-${allocation.id}`}
                        type="number"
                        min="0"
                        step="25"
                        value={experimentRequests[allocation.id] ?? ""}
                        onChange={(event) =>
                          setExperimentRequests((prev) => ({ ...prev, [allocation.id]: event.target.value }))
                        }
                        className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 pr-3 font-semibold text-green-300">{money(allocation.allocatedBudget)}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${statusClass(allocation.status)}`}>
                        {allocation.status}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">{allocation.notes[0]}</p>
                    </td>
                    <td className="py-3 text-xs text-slate-400">
                      {money(allocation.channelRemainingBefore)} before - {money(allocation.channelRemainingAfter)} after
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {CHANNELS.map((platform) => {
              const row = experimentPlan.byPlatform[platform];
              return (
                <div key={platform} className="rounded border border-slate-700 bg-slate-900/50 p-3 text-xs">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200">{PLATFORM_LABELS[platform]}</span>
                    <span className="text-slate-500">{money(row.unassigned)} unassigned</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700">
                    <div
                      className="h-1.5 rounded-full bg-blue-400"
                      style={{ width: `${row.available ? Math.min(100, (row.allocated / row.available) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-slate-500">
                    {money(row.allocated)} planned of {money(row.available)} available
                  </p>
                </div>
              );
            })}
          </div>

          <ul className="mt-4 space-y-1 text-xs text-slate-400">
            {experimentPlan.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {CHANNELS.map((channel) => {
          const row = budget.channels[channel];
          const remaining = row.allocated - row.spent;
          const dailyBurn = row.spent / 7 || 0;
          const daysRemaining = dailyBurn > 0 ? remaining / dailyBurn : CAMPAIGN_DAYS;
          const pct = row.allocated ? (row.spent / row.allocated) * 100 : 0;
          const isEditing = !!editing[channel];
          const isSaving = !!saving[channel];
          const edit = editing[channel];

          return (
            <Card key={channel}>
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-lg font-semibold">{PLATFORM_LABELS[channel]}</h2>
                {!isEditing ? (
                  <GhostButton onClick={() => startEdit(channel)} className="px-2 py-1 text-xs">
                    Edit
                  </GhostButton>
                ) : (
                  <div className="flex gap-1">
                    <Button onClick={() => saveEdit(channel)} disabled={isSaving} className="px-2 py-1 text-xs">
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <GhostButton onClick={() => cancelEdit(channel)} disabled={isSaving} className="px-2 py-1 text-xs">
                      Cancel
                    </GhostButton>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="mb-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Spent ($)</label>
                    <input
                      type="number"
                      value={edit?.spent ?? ""}
                      onChange={(event) => setEditing((prev) => ({ ...prev, [channel]: { ...prev[channel]!, spent: event.target.value } }))}
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Allocated ($)</label>
                    <input
                      type="number"
                      value={edit?.allocated ?? ""}
                      onChange={(event) => setEditing((prev) => ({ ...prev, [channel]: { ...prev[channel]!, allocated: event.target.value } }))}
                      className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded bg-slate-800 p-2">
                    <p className="text-xs text-slate-500">Allocated</p>
                    <p className="font-bold">{money(row.allocated)}</p>
                  </div>
                  <div className="rounded bg-slate-800 p-2">
                    <p className="text-xs text-slate-500">Spent</p>
                    <p className="font-bold text-amber-400">{money(row.spent)}</p>
                  </div>
                  <div className="rounded bg-slate-800 p-2">
                    <p className="text-xs text-slate-500">Left</p>
                    <p className="font-bold text-green-400">{money(remaining)}</p>
                  </div>
                </div>
              )}

              <div className="mb-2 h-1.5 w-full rounded-full bg-slate-700">
                <div
                  className={`h-1.5 rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {!isEditing && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Daily burn: {money(Number(dailyBurn.toFixed(0)))}</span>
                  <span>{daysRemaining > 0 ? `~${daysRemaining.toFixed(0)} days left` : "No spend yet"}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Kill / Scale Thresholds</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded border border-red-800/30 bg-red-950/30 p-3">
            <p className="mb-1 text-xs text-slate-400">Kill</p>
            <p className="text-lg font-bold text-red-400">CPL &gt; $40</p>
            <p className="mt-1 text-xs text-slate-500">Pause creative, kill platform</p>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <p className="mb-1 text-xs text-slate-400">Hold</p>
            <p className="text-lg font-bold text-slate-300">CTR &lt; 0.3%</p>
            <p className="mt-1 text-xs text-slate-500">After 1K impressions</p>
          </div>
          <div className="rounded border border-green-800/30 bg-green-950/30 p-3">
            <p className="mb-1 text-xs text-slate-400">Scale</p>
            <p className="text-lg font-bold text-green-400">CPL &lt; $20</p>
            <p className="mt-1 text-xs text-slate-500">+ 5 sign-ups means double budget</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
