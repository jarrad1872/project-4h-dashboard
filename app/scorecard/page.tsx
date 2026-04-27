"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Scorecard hydrates persisted dashboard data after mount. */

import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import { buildActiveLoopSupportSummary, EMPTY_MARKETING_EVENT_SUMMARY } from "@/lib/active-loop-support-summaries";
import { CHANNELS } from "@/lib/constants";
import { buildCustomerPaceForecast, type CustomerPaceStatus } from "@/lib/customer-pace-forecast";
import {
  addLearningDecision,
  currentLearningDecisions,
  decisionTargetFromRankedItem,
  LEARNING_DECISIONS_STORAGE_KEY,
  reverseLatestDecision,
  type LearningDecisionAction,
  type LearningDecisionEntry,
  type LearningDecisionTarget,
} from "@/lib/learning-decisions";
import { calcActivationRate, calcCpaPaid, calcCpaStart, calcCtr, signal } from "@/lib/metrics";
import { buildTradeWeeklyTargetPlan, type TradeWeeklyTargetStatus } from "@/lib/trade-weekly-targets";
import { buildWeeklyLearningReport, type LearningSignal } from "@/lib/weekly-learning-report";
import type { AdTemplate, ChannelMetrics, LifecycleMessage, MarketingEventSummary, MetricsData, MetricsWeek } from "@/lib/types";

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

const LEARNING_SIGNAL_STYLE: Record<LearningSignal, string> = {
  winner: "border-green-700/40 bg-green-950/25 text-green-300",
  promising: "border-blue-700/40 bg-blue-950/25 text-blue-300",
  learning: "border-amber-700/40 bg-amber-950/25 text-amber-300",
  waiting: "border-slate-700 bg-slate-800 text-slate-400",
};

const DECISION_STYLE: Record<LearningDecisionAction, string> = {
  keep: "border-blue-700/40 bg-blue-950/25 text-blue-300",
  kill: "border-red-700/40 bg-red-950/25 text-red-300",
  iterate: "border-amber-700/40 bg-amber-950/25 text-amber-300",
};

const PACE_STATUS_STYLE: Record<CustomerPaceStatus, string> = {
  "no-data": "border-slate-700 bg-slate-800 text-slate-300",
  behind: "border-red-700/40 bg-red-950/25 text-red-300",
  "low-track": "border-amber-700/40 bg-amber-950/25 text-amber-300",
  "high-track": "border-green-700/40 bg-green-950/25 text-green-300",
};

const PACE_STATUS_LABEL: Record<CustomerPaceStatus, string> = {
  "no-data": "Waiting for paid signal",
  behind: "Behind 1,000 pace",
  "low-track": "On 1,000 pace",
  "high-track": "On 2,000 pace",
};

const TRADE_TARGET_STATUS_STYLE: Record<TradeWeeklyTargetStatus, string> = {
  waiting: "border-slate-700 bg-slate-800 text-slate-300",
  behind: "border-red-700/40 bg-red-950/25 text-red-300",
  "low-track": "border-amber-700/40 bg-amber-950/25 text-amber-300",
  "high-track": "border-green-700/40 bg-green-950/25 text-green-300",
};

const TRADE_TARGET_STATUS_LABEL: Record<TradeWeeklyTargetStatus, string> = {
  waiting: "Waiting",
  behind: "Behind",
  "low-track": "Low case",
  "high-track": "High case",
};

function pct(value: number | null) {
  if (value === null) return "No view base";
  return `${(value * 100).toFixed(1)}%`;
}

function number(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
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
  const [marketingSummary, setMarketingSummary] = useState<MarketingEventSummary>(EMPTY_MARKETING_EVENT_SUMMARY);
  const [allTimeMarketingSummary, setAllTimeMarketingSummary] = useState<MarketingEventSummary>(EMPTY_MARKETING_EVENT_SUMMARY);
  const [lifecycleMessages, setLifecycleMessages] = useState<LifecycleMessage[]>([]);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [draft, setDraft] = useState<MetricsWeek | null>(null);
  const [saving, setSaving] = useState(false);
  const [newWeekDate, setNewWeekDate] = useState("");
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<LearningDecisionEntry[]>([]);
  const [decisionNote, setDecisionNote] = useState("");

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
      setMarketingSummary(EMPTY_MARKETING_EVENT_SUMMARY);
    }
    const [allTimeEventsRes, lifecycleRes, templatesRes] = await Promise.all([
      fetch("/api/events?summary=1", { cache: "no-store" }).catch(() => null),
      fetch("/api/lifecycle", { cache: "no-store" }).catch(() => null),
      fetch("/api/templates", { cache: "no-store" }).catch(() => null),
    ]);
    if (allTimeEventsRes?.ok) {
      const allTimeEventsData = (await allTimeEventsRes.json()) as { summary?: MarketingEventSummary };
      setAllTimeMarketingSummary(allTimeEventsData.summary ?? EMPTY_MARKETING_EVENT_SUMMARY);
    } else {
      setAllTimeMarketingSummary(EMPTY_MARKETING_EVENT_SUMMARY);
    }
    setLifecycleMessages(lifecycleRes?.ok ? ((await lifecycleRes.json()) as LifecycleMessage[]) : []);
    setTemplates(templatesRes?.ok ? ((await templatesRes.json()) as AdTemplate[]) : []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LEARNING_DECISIONS_STORAGE_KEY);
      if (raw) setDecisionHistory(JSON.parse(raw) as LearningDecisionEntry[]);
    } catch {
      setDecisionHistory([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LEARNING_DECISIONS_STORAGE_KEY, JSON.stringify(decisionHistory));
  }, [decisionHistory]);

  useEffect(() => {
    const week = metrics.weeks.find((item) => item.weekStart === selectedWeek);
    setDraft(week ?? null);
  }, [selectedWeek, metrics.weeks]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeeklyEvents() {
      setMarketingSummary(EMPTY_MARKETING_EVENT_SUMMARY);
      const params = selectedWeek ? weekEventParams(selectedWeek) : null;
      if (!params) {
        return;
      }

      const eventsRes = await fetch(`/api/events?${params.toString()}`, { cache: "no-store" }).catch(() => null);
      if (cancelled) return;
      if (eventsRes?.ok) {
        const eventsData = (await eventsRes.json()) as { summary?: MarketingEventSummary };
        if (cancelled) return;
        setMarketingSummary(eventsData.summary ?? EMPTY_MARKETING_EVENT_SUMMARY);
      } else {
        setMarketingSummary(EMPTY_MARKETING_EVENT_SUMMARY);
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
  const paceForecast = useMemo(() => buildCustomerPaceForecast(metrics.weeks), [metrics.weeks]);
  const tradeTargetPlan = useMemo(
    () => buildTradeWeeklyTargetPlan({
      pace: paceForecast,
      weeklySummary: marketingSummary,
      allTimeSummary: allTimeMarketingSummary,
    }),
    [allTimeMarketingSummary, marketingSummary, paceForecast],
  );
  const learningReport = useMemo(() => buildWeeklyLearningReport(marketingSummary), [marketingSummary]);
  const supportSummary = useMemo(
    () =>
      buildActiveLoopSupportSummary({
        lifecycleMessages,
        marketingSummary: allTimeMarketingSummary,
        savedAdTemplates: templates.length,
      }),
    [allTimeMarketingSummary, lifecycleMessages, templates.length],
  );
  const decisionTargets = useMemo(
    () => learningReport.reports.flatMap((report) =>
      report.items.map((item) => decisionTargetFromRankedItem(report.dimension, item)),
    ),
    [learningReport],
  );
  const selectedWeekDecisionHistory = useMemo(
    () => decisionHistory.filter((entry) => entry.weekStart === selectedWeek),
    [decisionHistory, selectedWeek],
  );
  const currentDecisions = useMemo(() => currentLearningDecisions(selectedWeekDecisionHistory), [selectedWeekDecisionHistory]);
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

  function decide(target: LearningDecisionTarget, decision: LearningDecisionAction) {
    if (!selectedWeek) return;
    setDecisionHistory((history) => addLearningDecision(history, selectedWeek, target, decision, decisionNote, new Date().toISOString()));
    setDecisionNote("");
  }

  function undoDecision(targetId: string) {
    if (!selectedWeek) return;
    setDecisionHistory((history) => reverseLatestDecision(history, selectedWeek, targetId, new Date().toISOString()));
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Customer Pace Forecast</h2>
            <p className="mt-1 text-sm text-slate-500">
              Target range: {paceForecast.targetLow.toLocaleString()}-{paceForecast.targetHigh.toLocaleString()} paying users by {paceForecast.deadline}.
            </p>
          </div>
          <span className={`rounded border px-3 py-1 text-xs font-semibold ${PACE_STATUS_STYLE[paceForecast.status]}`}>
            {PACE_STATUS_LABEL[paceForecast.status]}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Current paid", value: paceForecast.paidCustomers.toLocaleString(), detail: `${paceForecast.loggedWeeks} logged weeks` },
            { label: "Current pace", value: `${number(paceForecast.currentWeeklyPace)}/wk`, detail: `${number(paceForecast.currentMonthlyPace)}/mo actualized` },
            { label: "Needed this month", value: `${number(paceForecast.requiredMonthlyLow)}-${number(paceForecast.requiredMonthlyHigh)}`, detail: `${number(paceForecast.requiredWeeklyLow)}-${number(paceForecast.requiredWeeklyHigh)}/wk required` },
            { label: "Projected finish", value: paceForecast.projectedCustomers.toLocaleString(), detail: `${paceForecast.weeksRemaining} weeks remaining` },
          ].map((item) => (
            <div key={item.label} className="rounded border border-slate-700 bg-slate-800 p-3">
              <p className="text-2xl font-bold text-slate-100">{item.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Projected gap to 1,000</p>
            <p className="mt-1 text-xl font-bold text-slate-100">{paceForecast.projectedLowGap.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">{paceForecast.remainingToLow.toLocaleString()} customers left before projection.</p>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Projected gap to 2,000</p>
            <p className="mt-1 text-xl font-bold text-slate-100">{paceForecast.projectedHighGap.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">{paceForecast.remainingToHigh.toLocaleString()} customers left before projection.</p>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Next bet</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{paceForecast.nextBet}</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">{paceForecast.evidence}</p>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Trade Weekly Target Calculator</h2>
            <p className="mt-1 text-sm text-slate-500">
              First-principles weekly quotas for the five beachhead domains, tied to the 1,000-2,000 customer deadline.
            </p>
          </div>
          <span className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {number(tradeTargetPlan.totalPaidThisWeek)} / {number(tradeTargetPlan.totalWeeklyLowTarget)} low-case this week
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Weekly low target", value: number(tradeTargetPlan.totalWeeklyLowTarget), detail: "Across beachhead trades" },
            { label: "Weekly high target", value: number(tradeTargetPlan.totalWeeklyHighTarget), detail: "2,000-customer case" },
            { label: "Paid this week", value: number(tradeTargetPlan.totalPaidThisWeek), detail: "From selected-week attribution" },
            { label: "Gap to low case", value: number(tradeTargetPlan.totalGapToLow), detail: `${number(tradeTargetPlan.totalGapToHigh)} to high case` },
          ].map((item) => (
            <div key={item.label} className="rounded border border-slate-700 bg-slate-800 p-3">
              <p className="text-2xl font-bold text-slate-100">{item.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {tradeTargetPlan.trades.map((trade) => (
            <div key={trade.domain} className="rounded border border-slate-700 bg-slate-900/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{trade.domain}</p>
                  <p className="mt-1 text-xs text-slate-500">{trade.trade}</p>
                </div>
                <span className={`rounded border px-2 py-1 text-xs font-semibold ${TRADE_TARGET_STATUS_STYLE[trade.status]}`}>
                  {TRADE_TARGET_STATUS_LABEL[trade.status]}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{number(trade.weeklyLowTarget)}-{number(trade.weeklyHighTarget)}</p>
                  <p className="text-slate-500">Weekly target</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{number(trade.paidThisWeek)}</p>
                  <p className="text-slate-500">Paid this week</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{number(trade.allTimePaid)}</p>
                  <p className="text-slate-500">All-time paid</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{number(trade.gapToLow)}</p>
                  <p className="text-slate-500">Low gap</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">{trade.nextAction}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500">{tradeTargetPlan.evidence}</p>
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

      <Card className="border-cyan-900/60 bg-cyan-950/10" data-testid="scorecard-support-loop-summary">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Support Signals Folded Into Learning</h2>
            <p className="mt-1 text-sm text-slate-400">
              Lifecycle and template pages stay direct-link support routes; their useful status now lives in the active scorecard loop.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <a href="/lifecycle" className="font-semibold text-cyan-200 hover:underline">Lifecycle detail</a>
            <span className="text-slate-600">/</span>
            <a href="/templates" className="font-semibold text-cyan-200 hover:underline">Template detail</a>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Lifecycle follow-up</p>
                <p className="mt-1 text-xs text-slate-500">
                  {supportSummary.lifecycle.activeMessages} active / {supportSummary.lifecycle.measuredMessages} measured messages
                </p>
              </div>
              <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                {supportSummary.lifecycle.paid.toLocaleString()} paid
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              {[
                { label: "Signups", value: supportSummary.lifecycle.signups },
                { label: "Trials", value: supportSummary.lifecycle.trialStarts },
                { label: "Activated", value: supportSummary.lifecycle.activations },
                { label: "Paused", value: supportSummary.lifecycle.pausedMessages },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-base font-semibold text-slate-100">{item.value.toLocaleString()}</p>
                  <p className="text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{supportSummary.lifecycle.nextAction}</p>
          </div>

          <div className="rounded border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Brief and research library</p>
                <p className="mt-1 text-xs text-slate-500">
                  {supportSummary.templates.messageMatchDomains} domains covered by message-match handoffs
                </p>
              </div>
              <span className="rounded border border-indigo-800/60 bg-indigo-950/30 px-2 py-1 text-xs font-semibold text-indigo-300">
                {supportSummary.templates.competitorResearchStatus}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              {[
                { label: "Creator", value: supportSummary.templates.contentBriefs },
                { label: "Message", value: supportSummary.templates.messageMatchBriefs },
                { label: "Saved ads", value: supportSummary.templates.savedAdTemplates },
                { label: "Domains", value: supportSummary.templates.messageMatchDomains },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-base font-semibold text-slate-100">{item.value.toLocaleString()}</p>
                  <p className="text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{supportSummary.templates.evidence}</p>
          </div>
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

      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Keep / Kill / Iterate Decisions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Local learning notes for the selected week. Decisions are reversible and do not pause, launch, upload, or spend.
            </p>
          </div>
          <span className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {Object.keys(currentDecisions).length} active
          </span>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-slate-400">Optional note for next decision</label>
          <input
            value={decisionNote}
            onChange={(event) => setDecisionNote(event.target.value)}
            placeholder="Why are we making this call?"
            className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {decisionTargets.length === 0 ? (
          <p className="rounded border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-400">
            Decision controls appear after tracked trades, creators, images, or angles have attribution in the selected week.
          </p>
        ) : (
          <div className="space-y-3">
            {decisionTargets.map((target) => {
              const currentDecision = currentDecisions[target.id] ?? null;
              return (
                <div key={target.id} className="rounded border border-slate-700 bg-slate-900/40 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{target.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{target.type} - {target.evidence}</p>
                    </div>
                    {currentDecision ? (
                      <span className={`rounded border px-2 py-1 text-xs font-semibold ${DECISION_STYLE[currentDecision.decision]}`}>
                        {currentDecision.decision} at {new Date(currentDecision.decidedAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-400">
                        undecided
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["keep", "kill", "iterate"] as const).map((decision) => (
                      <Button
                        key={decision}
                        onClick={() => decide(target, decision)}
                        disabled={!selectedWeek}
                        className="bg-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-600"
                      >
                        {decision}
                      </Button>
                    ))}
                    <Button
                      onClick={() => undoDecision(target.id)}
                      disabled={!currentDecision}
                      className="bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                    >
                      Undo last
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedWeekDecisionHistory.length > 0 && (
          <div className="mt-4 border-t border-slate-700 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-300">Decision History for {selectedWeek}</h3>
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {[...selectedWeekDecisionHistory].reverse().map((entry) => (
                <div key={entry.id} className="rounded border border-slate-700 bg-slate-800/50 p-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{entry.targetLabel}</span> marked{" "}
                  <span className={entry.reversedAt ? "line-through" : "text-slate-200"}>{entry.decision}</span>{" "}
                  at {new Date(entry.decidedAt).toLocaleString()}
                  {entry.previousDecision && <span> from {entry.previousDecision}</span>}
                  {entry.reversedAt && <span> - reversed at {new Date(entry.reversedAt).toLocaleString()}</span>}
                  {entry.note && <p className="mt-1 text-slate-500">{entry.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
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
