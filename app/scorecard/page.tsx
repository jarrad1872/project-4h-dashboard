"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import { CHANNELS } from "@/lib/constants";
import { calcActivationRate, calcCpaPaid, calcCpaStart, calcCtr, signal } from "@/lib/metrics";
import type { ChannelMetrics, MetricsData, MetricsWeek } from "@/lib/types";

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

export default function ScorecardPage() {
  const [metrics, setMetrics] = useState<MetricsData>({ weeks: [] });
  const [selectedWeek, setSelectedWeek] = useState("");
  const [draft, setDraft] = useState<MetricsWeek | null>(null);

  async function load() {
    const res = await fetch("/api/metrics", { cache: "no-store" });
    const data = (await res.json()) as MetricsData;
    setMetrics(data);
    const latest = data.weeks.at(-1);
    if (latest) {
      setSelectedWeek(latest.weekStart);
      setDraft(latest);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const week = metrics.weeks.find((item) => item.weekStart === selectedWeek);
    if (week) setDraft(week);
  }, [selectedWeek, metrics.weeks]);

  const weeks = useMemo(() => metrics.weeks.map((week) => week.weekStart), [metrics.weeks]);

  function updateChannel(channel: (typeof CHANNELS)[number], field: keyof ChannelMetrics, value: string) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        [channel]: {
          ...current[channel],
          [field]: Number(value) || 0,
        },
      };
    });
  }

  async function saveWeek() {
    if (!draft) return;
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    void load();
  }

  async function addWeek() {
    const date = prompt("Week start (YYYY-MM-DD)", "2026-03-09");
    if (!date) return;
    const week = createWeek(date);
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(week),
    });
    void load();
  }

  if (!draft) {
    return <p className="text-sm text-slate-400">Loading scorecard…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Weekly KPI Scorecard</h1>
        <div className="flex gap-2">
          <select
            className="rounded border border-slate-600 bg-slate-800 px-3 py-2"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {weeks.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
          <Button onClick={addWeek}>Add Week</Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="p-2 text-left">Channel</th>
              <th className="p-2 text-left">Spend</th>
              <th className="p-2 text-left">Impressions</th>
              <th className="p-2 text-left">Clicks</th>
              <th className="p-2 text-left">Signups</th>
              <th className="p-2 text-left">Activations</th>
              <th className="p-2 text-left">Paid</th>
              <th className="p-2 text-left">CTR</th>
              <th className="p-2 text-left">CPA-Start</th>
              <th className="p-2 text-left">Activation Rate</th>
              <th className="p-2 text-left">CPA-Paid</th>
              <th className="p-2 text-left">Signal</th>
            </tr>
          </thead>
          <tbody>
            {CHANNELS.map((channel) => {
              const m = draft[channel];
              const s = signal(m);
              const emoji = s === "scale" ? "🟢 Scale" : s === "watch" ? "🟡 Watch" : "🔴 Kill";
              return (
                <tr key={channel} className="border-t border-slate-700">
                  <td className="p-2 capitalize">{channel}</td>
                  {(["spend", "impressions", "clicks", "signups", "activations", "paid"] as const).map((field) => (
                    <td key={field} className="p-2">
                      <input
                        className="w-24 rounded border border-slate-600 bg-slate-800 p-1"
                        type="number"
                        value={m[field]}
                        onChange={(e) => updateChannel(channel, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="p-2">{calcCtr(m).toFixed(2)}%</td>
                  <td className="p-2">${calcCpaStart(m).toFixed(2)}</td>
                  <td className="p-2">{calcActivationRate(m).toFixed(2)}%</td>
                  <td className="p-2">${calcCpaPaid(m).toFixed(2)}</td>
                  <td className="p-2">{emoji}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Button onClick={saveWeek}>Save Week</Button>
    </div>
  );
}
