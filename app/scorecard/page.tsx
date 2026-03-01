"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { CHANNELS } from "@/lib/constants";
import { calcActivationRate, calcCpaPaid, calcCpaStart, calcCtr, signal } from "@/lib/metrics";
import type { ChannelMetrics, MetricsData, MetricsWeek } from "@/lib/types";

const emptyChannel: ChannelMetrics = {
  spend: 0, impressions: 0, clicks: 0, signups: 0, activations: 0, paid: 0,
};

function createWeek(weekStart: string): MetricsWeek {
  return {
    weekStart,
    linkedin: { ...emptyChannel },
    youtube: { ...emptyChannel },
    facebook: { ...emptyChannel },
    instagram: { ...emptyChannel },
  };
}

function sumChannels(weeks: MetricsWeek[]): ChannelMetrics {
  return CHANNELS.reduce(
    (totals, ch) => {
      for (const week of weeks) {
        const m = week[ch];
        totals.spend += m.spend;
        totals.impressions += m.impressions;
        totals.clicks += m.clicks;
        totals.signups += m.signups;
        totals.activations += m.activations;
        totals.paid += m.paid;
      }
      return totals;
    },
    { ...emptyChannel }
  );
}

const SIGNAL_STYLE: Record<string, string> = {
  scale: "text-green-400 font-bold",
  watch: "text-amber-400 font-bold",
  kill: "text-red-400 font-bold",
};
const SIGNAL_LABEL: Record<string, string> = {
  scale: "🟢 Scale",
  watch: "🟡 Watch",
  kill: "🔴 Kill",
};

export default function ScorecardPage() {
  const [metrics, setMetrics] = useState<MetricsData>({ weeks: [] });
  const [selectedWeek, setSelectedWeek] = useState("");
  const [draft, setDraft] = useState<MetricsWeek | null>(null);
  const [saving, setSaving] = useState(false);
  const [newWeekDate, setNewWeekDate] = useState("");
  const [showAddWeek, setShowAddWeek] = useState(false);

  async function load() {
    const res = await fetch("/api/metrics", { cache: "no-store" });
    const data = (await res.json()) as MetricsData;
    setMetrics(data);
    const latest = data.weeks.at(-1);
    if (latest && !selectedWeek) {
      setSelectedWeek(latest.weekStart);
      setDraft(latest);
    }
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const week = metrics.weeks.find((item) => item.weekStart === selectedWeek);
    if (week) setDraft(week);
  }, [selectedWeek, metrics.weeks]);

  const weeks = useMemo(() => metrics.weeks.map((w) => w.weekStart), [metrics.weeks]);

  function updateChannel(channel: (typeof CHANNELS)[number], field: keyof ChannelMetrics, value: string) {
    setDraft((cur) => {
      if (!cur) return cur;
      return { ...cur, [channel]: { ...cur[channel], [field]: Number(value) || 0 } };
    });
  }

  async function saveWeek() {
    if (!draft) return;
    setSaving(true);
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    void load();
  }

  async function addWeek() {
    if (!newWeekDate) return;
    const week = createWeek(newWeekDate);
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(week),
    });
    setNewWeekDate("");
    setShowAddWeek(false);
    setSelectedWeek(newWeekDate);
    void load();
  }

  // Campaign totals across all weeks
  const campaignTotals = useMemo(() => sumChannels(metrics.weeks), [metrics.weeks]);
  const totalUsers = metrics.weeks.reduce((sum, w) => sum + CHANNELS.reduce((s, ch) => s + w[ch].paid, 0), 0);

  if (!draft) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading scorecard…</div>;
  }

  // Per-channel totals for this week
  const weekTotals = CHANNELS.reduce((acc, ch) => {
    const m = draft[ch];
    acc.spend += m.spend;
    acc.impressions += m.impressions;
    acc.clicks += m.clicks;
    acc.signups += m.signups;
    acc.activations += m.activations;
    acc.paid += m.paid;
    return acc;
  }, { ...emptyChannel });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Weekly KPI Scorecard</h1>
          <p className="mt-1 text-sm text-slate-400">
            {totalUsers > 0
              ? `${totalUsers} paying users · ${metrics.weeks.length} weeks logged · Target: 2,000`
              : `${metrics.weeks.length} weeks logged · Target: 2,000 users · Campaign not yet live`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-400 focus:outline-none"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {weeks.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <Button onClick={() => setShowAddWeek(!showAddWeek)}>
            {showAddWeek ? "Cancel" : "+ Week"}
          </Button>
        </div>
      </div>

      {/* Add week inline */}
      {showAddWeek && (
        <Card>
          <div className="flex items-center gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Week Start Date</label>
              <input
                type="date"
                value={newWeekDate}
                onChange={(e) => setNewWeekDate(e.target.value)}
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="pt-5">
              <Button onClick={addWeek} disabled={!newWeekDate}>Create Week</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Progress toward 2,000 */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mission Progress</h2>
          <span className="text-sm text-slate-300 font-semibold">{totalUsers} / 2,000 users ({((totalUsers / 2000) * 100).toFixed(1)}%)</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-700">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
               style={{ width: `${Math.min((totalUsers / 2000) * 100, 100)}%` }} />
        </div>
        {totalUsers === 0 && <p className="mt-2 text-xs text-slate-500">No paying users yet — campaign pre-launch. Log weekly actuals here once ads go live.</p>}
      </Card>

      {/* Weekly metrics table */}
      <Card className="overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Week of {selectedWeek}</h2>
          <Button onClick={saveWeek} disabled={saving}>{saving ? "Saving…" : "Save Week"}</Button>
        </div>
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-3">Channel</th>
              <th className="pb-2 pr-3">Spend ($)</th>
              <th className="pb-2 pr-3">Impressions</th>
              <th className="pb-2 pr-3">Clicks</th>
              <th className="pb-2 pr-3">Sign-ups</th>
              <th className="pb-2 pr-3">Activations</th>
              <th className="pb-2 pr-3">Paid</th>
              <th className="pb-2 pr-3">CTR</th>
              <th className="pb-2 pr-3">CPA-Start</th>
              <th className="pb-2 pr-3">Act Rate</th>
              <th className="pb-2 pr-3">CPL</th>
              <th className="pb-2">Signal</th>
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((channel) => {
              const m = draft[channel];
              const sig = signal(m);
              return (
                <tr key={channel} className="border-t border-slate-700">
                  <td className="py-2 pr-3 capitalize font-medium text-slate-200">{channel}</td>
                  {(["spend", "impressions", "clicks", "signups", "activations", "paid"] as const).map((field) => (
                    <td key={field} className="py-2 pr-3">
                      <input
                        className="w-24 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        type="number"
                        value={m[field]}
                        onChange={(e) => updateChannel(channel, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="py-2 pr-3 font-mono text-xs">{calcCtr(m).toFixed(2)}%</td>
                  <td className="py-2 pr-3 font-mono text-xs">{m.spend > 0 && m.signups > 0 ? `$${calcCpaStart(m).toFixed(0)}` : "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{m.signups > 0 ? `${calcActivationRate(m).toFixed(0)}%` : "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{m.spend > 0 && m.paid > 0 ? `$${calcCpaPaid(m).toFixed(0)}` : "—"}</td>
                  <td className={`py-2 text-xs ${SIGNAL_STYLE[sig] ?? ""}`}>{SIGNAL_LABEL[sig] ?? "—"}</td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr className="border-t-2 border-slate-500 bg-slate-800/60 font-semibold">
              <td className="py-2 pr-3 text-slate-300">Week Total</td>
              <td className="py-2 pr-3 text-slate-200">${weekTotals.spend.toLocaleString()}</td>
              <td className="py-2 pr-3 text-slate-200">{weekTotals.impressions.toLocaleString()}</td>
              <td className="py-2 pr-3 text-slate-200">{weekTotals.clicks.toLocaleString()}</td>
              <td className="py-2 pr-3 text-green-400">{weekTotals.signups}</td>
              <td className="py-2 pr-3 text-blue-400">{weekTotals.activations}</td>
              <td className="py-2 pr-3 text-emerald-400">{weekTotals.paid}</td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.impressions > 0 ? `${((weekTotals.clicks / weekTotals.impressions) * 100).toFixed(2)}%` : "—"}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.spend > 0 && weekTotals.signups > 0 ? `$${(weekTotals.spend / weekTotals.signups).toFixed(0)}` : "—"}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.signups > 0 ? `${((weekTotals.activations / weekTotals.signups) * 100).toFixed(0)}%` : "—"}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.spend > 0 && weekTotals.paid > 0 ? `$${(weekTotals.spend / weekTotals.paid).toFixed(0)}` : "—"}
              </td>
              <td className="py-2"></td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* All-time campaign totals */}
      {metrics.weeks.length > 1 && (
        <Card>
          <h2 className="mb-4 font-semibold">All-Time Campaign Totals ({metrics.weeks.length} weeks)</h2>
          <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
            {[
              { label: "Spend", value: `$${campaignTotals.spend.toLocaleString()}`, color: "text-amber-400" },
              { label: "Impressions", value: campaignTotals.impressions.toLocaleString(), color: "text-slate-200" },
              { label: "Clicks", value: campaignTotals.clicks.toLocaleString(), color: "text-slate-200" },
              { label: "Sign-ups", value: campaignTotals.signups, color: "text-green-400" },
              { label: "Activations", value: campaignTotals.activations, color: "text-blue-400" },
              { label: "Paying Users", value: campaignTotals.paid, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded bg-slate-800 p-3">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Signal legend */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Signal Legend</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded bg-red-950/30 border border-red-800/30 p-3">
            <p className="text-lg font-bold text-red-400">🔴 Kill</p>
            <p className="text-xs text-slate-400 mt-1">CPL &gt; $40 after 1K impressions</p>
          </div>
          <div className="rounded bg-amber-950/30 border border-amber-800/30 p-3">
            <p className="text-lg font-bold text-amber-400">🟡 Watch</p>
            <p className="text-xs text-slate-400 mt-1">CTR &lt; 0.3% — monitor, don't scale</p>
          </div>
          <div className="rounded bg-green-950/30 border border-green-800/30 p-3">
            <p className="text-lg font-bold text-green-400">🟢 Scale</p>
            <p className="text-xs text-slate-400 mt-1">CPL &lt; $20 + 5 sign-ups → double budget</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
