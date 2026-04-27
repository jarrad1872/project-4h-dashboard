"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import { CHANNELS } from "@/lib/constants";
import { calcActivationRate, calcCpaPaid, calcCpaStart, calcCtr, signal } from "@/lib/metrics";
import { buildWeeklyLearningReport, type LearningSignal } from "@/lib/weekly-learning-report";
import type { ChannelMetrics, MarketingEventSummary, MetricsData, MetricsWeek } from "@/lib/types";

const emptyChannel: ChannelMetrics = {
  spend: 0,
  impressions: 0,
  clicks: 0,
  signups: 0,
  activations: 0,
  paid: 0,
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
    (totals, channel) => {
      for (const week of weeks) {
        const metrics = week[channel];
        totals.spend += metrics.spend;
        totals.impressions += metrics.impressions;
        totals.clicks += metrics.clicks;
        totals.signups += metrics.signups;
        totals.activations += metrics.activations;
        totals.paid += metrics.paid;
      }
      return totals;
    },
    { ...emptyChannel },
  );
}

const SIGNAL_STYLE: Record<string, string> = {
  scale: "font-bold text-green-400",
  watch: "font-bold text-amber-400",
  kill: "font-bold text-red-400",
};

const SIGNAL_LABEL: Record<string, string> = {
  scale: "Scale",
  watch: "Watch",
  kill: "Kill",
};

const EMPTY_MARKETING_SUMMARY: MarketingEventSummary = {
  total: 0,
  byType: {
    asset_view: 0,
    demo_call: 0,
    signup: 0,
    trial_started: 0,
    activated: 0,
    paid: 0,
  },
  byPlatform: {},
  byTrade: {},
  byAngle: {},
  dimensions: {
    trades: {},
    creators: {},
    creativeAssets: {},
    angles: {},
  },
  paidValueCents: 0,
};

const LEARNING_SIGNAL_STYLE: Record<LearningSignal, string> = {
  winner: "border-green-700/40 bg-green-950/25 text-green-300",
  promising: "border-blue-700/40 bg-blue-950/25 text-blue-300",
  learning: "border-amber-700/40 bg-amber-950/25 text-amber-300",
  waiting: "border-slate-700 bg-slate-800 text-slate-400",
};

function pct(value: number | null) {
  if (value === null) return "No view base";
  return `${(value * 100).toFixed(1)}%`;
}

function weekEventParams(weekStart: string) {
  const from = new Date(`${weekStart}T00:00:00.000Z`);
  if (Number.isNaN(from.getTime())) return null;
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 7);
  return new URLSearchParams({
    summary: "1",
    from: from.toISOString(),
    to: to.toISOString(),
  });
}

export default function ScorecardPage() {
  const [metrics, setMetrics] = useState<MetricsData>({ weeks: [] });
  const [marketingSummary, setMarketingSummary] = useState<MarketingEventSummary>(EMPTY_MARKETING_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [draft, setDraft] = useState<MetricsWeek | null>(null);
  const [saving, setSaving] = useState(false);
  const [newWeekDate, setNewWeekDate] = useState("");
  const [showAddWeek, setShowAddWeek] = useState(false);

  async function load() {
    setLoading(true);
    const metricsRes = await fetch("/api/metrics", { cache: "no-store" });
    const data = (await metricsRes.json()) as MetricsData;
    setMetrics(data);
    const latest = data.weeks.at(-1);
    if (latest && !selectedWeek) {
      setSelectedWeek(latest.weekStart);
      setDraft(latest);
    }
    if (!latest) {
      setDraft(null);
      setMarketingSummary(EMPTY_MARKETING_SUMMARY);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const week = metrics.weeks.find((item) => item.weekStart === selectedWeek);
    setDraft(week ?? null);
  }, [selectedWeek, metrics.weeks]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeeklyEvents() {
      setMarketingSummary(EMPTY_MARKETING_SUMMARY);
      const params = selectedWeek ? weekEventParams(selectedWeek) : null;
      if (!params) {
        return;
      }

      const eventsRes = await fetch(`/api/events?${params.toString()}`, { cache: "no-store" }).catch(() => null);
      if (cancelled) return;
      if (eventsRes?.ok) {
        const eventsData = (await eventsRes.json()) as { summary?: MarketingEventSummary };
        if (cancelled) return;
        setMarketingSummary(eventsData.summary ?? EMPTY_MARKETING_SUMMARY);
      } else {
        setMarketingSummary(EMPTY_MARKETING_SUMMARY);
      }
    }

    void loadWeeklyEvents();
    return () => {
      cancelled = true;
    };
  }, [selectedWeek]);

  const weeks = useMemo(() => metrics.weeks.map((week) => week.weekStart), [metrics.weeks]);
  const campaignTotals = useMemo(() => sumChannels(metrics.weeks), [metrics.weeks]);
  const totalUsers = metrics.weeks.reduce((sum, week) => sum + CHANNELS.reduce((inner, channel) => inner + week[channel].paid, 0), 0);
  const learningReport = useMemo(() => buildWeeklyLearningReport(marketingSummary), [marketingSummary]);
  const visibleWeek = draft ?? createWeek(selectedWeek || "No week selected");
  const weekTotals = useMemo(() => sumChannels([visibleWeek]), [visibleWeek]);

  function updateChannel(channel: (typeof CHANNELS)[number], field: keyof ChannelMetrics, value: string) {
    setDraft((current) => {
      if (!current) return current;
      return { ...current, [channel]: { ...current[channel], [field]: Number(value) || 0 } };
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

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading scorecard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Weekly KPI Scorecard</h1>
          <p className="mt-1 text-sm text-slate-400">
            {totalUsers > 0
              ? `${totalUsers} paying users - ${metrics.weeks.length} weeks logged - Target: 2,000`
              : `${metrics.weeks.length} weeks logged - Target: 2,000 users - Campaign not yet live`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-400 focus:outline-none"
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(event.target.value)}
          >
            {weeks.length === 0 && <option value="">No week selected</option>}
            {weeks.map((week) => <option key={week} value={week}>{week}</option>)}
          </select>
          <Button onClick={() => setShowAddWeek(!showAddWeek)}>
            {showAddWeek ? "Cancel" : "+ Week"}
          </Button>
        </div>
      </div>

      {showAddWeek && (
        <Card>
          <div className="flex items-center gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Week Start Date</label>
              <input
                type="date"
                value={newWeekDate}
                onChange={(event) => setNewWeekDate(event.target.value)}
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="pt-5">
              <Button onClick={addWeek} disabled={!newWeekDate}>Create Week</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Mission Progress</h2>
          <span className="text-sm font-semibold text-slate-300">{totalUsers} / 2,000 users ({((totalUsers / 2000) * 100).toFixed(1)}%)</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-700">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
            style={{ width: `${Math.min((totalUsers / 2000) * 100, 100)}%` }}
          />
        </div>
        {totalUsers === 0 && <p className="mt-2 text-xs text-slate-500">No paying users yet. Campaign pre-launch. Log weekly actuals here once ads go live.</p>}
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Marketing Event Funnel</h2>
            <p className="mt-1 text-sm text-slate-500">Raw weekly attribution for assets, demo calls, trials, activations, and paid conversions.</p>
          </div>
          <span className="text-sm font-semibold text-slate-300">{marketingSummary.total.toLocaleString()} events this week</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Asset views", value: marketingSummary.byType.asset_view },
            { label: "Demo calls", value: marketingSummary.byType.demo_call },
            { label: "Signups", value: marketingSummary.byType.signup },
            { label: "Trials", value: marketingSummary.byType.trial_started },
            { label: "Activated", value: marketingSummary.byType.activated },
            { label: "Paid", value: marketingSummary.byType.paid },
          ].map((item) => (
            <div key={item.label} className="rounded border border-slate-700 bg-slate-800 p-3">
              <p className="text-2xl font-bold text-slate-100">{item.value.toLocaleString()}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Weekly Learning Report</h2>
            <p className="mt-1 text-sm text-slate-500">{learningReport.headline}</p>
          </div>
          <span className={`rounded border px-3 py-1 text-xs font-semibold ${learningReport.hasPaidSignal ? "border-green-700/40 bg-green-950/25 text-green-300" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
            {learningReport.hasPaidSignal ? "Paid signal present" : "No paid winners yet"}
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {learningReport.reports.map((report) => (
            <section key={report.dimension} className="rounded border border-slate-700 bg-slate-900/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-100">{report.title}</h3>
                <span className="text-xs text-slate-500">Top {report.items.length}</span>
              </div>
              {report.items.length === 0 ? (
                <p className="rounded border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-400">{report.emptyState}</p>
              ) : (
                <div className="space-y-2">
                  {report.items.map((item) => (
                    <div key={item.key} className="rounded border border-slate-700 bg-slate-800/60 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">#{item.rank} {item.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.evidence}</p>
                        </div>
                        <span className={`rounded border px-2 py-1 text-xs font-semibold ${LEARNING_SIGNAL_STYLE[item.signal]}`}>
                          {item.signal}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{item.demo_call}</p>
                          <p className="text-slate-500">Calls</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{item.signup}</p>
                          <p className="text-slate-500">Signups</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{item.paid}</p>
                          <p className="text-slate-500">Paid</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{pct(item.conversionRate)}</p>
                          <p className="text-slate-500">Paid/view</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Week of {selectedWeek || "No week selected"}</h2>
          <Button onClick={saveWeek} disabled={saving || !draft}>{saving ? "Saving..." : "Save Week"}</Button>
        </div>
        {!draft && (
          <div className="mb-4 rounded border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-400">
            No weekly metrics row exists yet. Create a week above to begin logging spend and conversion actuals.
          </div>
        )}
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
              const metricsRow = visibleWeek[channel];
              const channelSignal = signal(metricsRow);
              return (
                <tr key={channel} className="border-t border-slate-700">
                  <td className="py-2 pr-3 font-medium capitalize text-slate-200">{channel}</td>
                  {(["spend", "impressions", "clicks", "signups", "activations", "paid"] as const).map((field) => (
                    <td key={field} className="py-2 pr-3">
                      <input
                        className="w-24 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        type="number"
                        value={metricsRow[field]}
                        disabled={!draft}
                        onChange={(event) => updateChannel(channel, field, event.target.value)}
                      />
                    </td>
                  ))}
                  <td className="py-2 pr-3 font-mono text-xs">{calcCtr(metricsRow).toFixed(2)}%</td>
                  <td className="py-2 pr-3 font-mono text-xs">{metricsRow.spend > 0 && metricsRow.signups > 0 ? `$${calcCpaStart(metricsRow).toFixed(0)}` : "-"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{metricsRow.signups > 0 ? `${calcActivationRate(metricsRow).toFixed(0)}%` : "-"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{metricsRow.spend > 0 && metricsRow.paid > 0 ? `$${calcCpaPaid(metricsRow).toFixed(0)}` : "-"}</td>
                  <td className={`py-2 text-xs ${SIGNAL_STYLE[channelSignal] ?? ""}`}>{SIGNAL_LABEL[channelSignal] ?? "-"}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-slate-500 bg-slate-800/60 font-semibold">
              <td className="py-2 pr-3 text-slate-300">Week Total</td>
              <td className="py-2 pr-3 text-slate-200">${weekTotals.spend.toLocaleString()}</td>
              <td className="py-2 pr-3 text-slate-200">{weekTotals.impressions.toLocaleString()}</td>
              <td className="py-2 pr-3 text-slate-200">{weekTotals.clicks.toLocaleString()}</td>
              <td className="py-2 pr-3 text-green-400">{weekTotals.signups}</td>
              <td className="py-2 pr-3 text-blue-400">{weekTotals.activations}</td>
              <td className="py-2 pr-3 text-emerald-400">{weekTotals.paid}</td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.impressions > 0 ? `${((weekTotals.clicks / weekTotals.impressions) * 100).toFixed(2)}%` : "-"}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.spend > 0 && weekTotals.signups > 0 ? `$${(weekTotals.spend / weekTotals.signups).toFixed(0)}` : "-"}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.signups > 0 ? `${((weekTotals.activations / weekTotals.signups) * 100).toFixed(0)}%` : "-"}
              </td>
              <td className="py-2 pr-3 font-mono text-xs text-slate-400">
                {weekTotals.spend > 0 && weekTotals.paid > 0 ? `$${(weekTotals.spend / weekTotals.paid).toFixed(0)}` : "-"}
              </td>
              <td className="py-2"></td>
            </tr>
          </tbody>
        </table>
      </Card>

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
            ].map((stat) => (
              <div key={stat.label} className="rounded bg-slate-800 p-3">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Signal Legend</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded border border-red-800/30 bg-red-950/30 p-3">
            <p className="text-lg font-bold text-red-400">Kill</p>
            <p className="mt-1 text-xs text-slate-400">CPL &gt; $40 after 1K impressions</p>
          </div>
          <div className="rounded border border-amber-800/30 bg-amber-950/30 p-3">
            <p className="text-lg font-bold text-amber-400">Watch</p>
            <p className="mt-1 text-xs text-slate-400">CTR &lt; 0.3% means monitor before scaling</p>
          </div>
          <div className="rounded border border-green-800/30 bg-green-950/30 p-3">
            <p className="text-lg font-bold text-green-400">Scale</p>
            <p className="mt-1 text-xs text-slate-400">CPL &lt; $20 plus 5 sign-ups means double budget</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
