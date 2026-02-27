"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { CHANNELS, PLATFORM_LABELS } from "@/lib/constants";
import type { BudgetData } from "@/lib/types";

const CAMPAIGN_DAYS = 30;

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetData | null>(null);

  async function load() {
    const res = await fetch("/api/budget", { cache: "no-store" });
    const data = (await res.json()) as BudgetData;
    setBudget(data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateSpend(channel: (typeof CHANNELS)[number]) {
    if (!budget) return;
    const current = budget.channels[channel].spent;
    const value = prompt(`Update spent amount for ${PLATFORM_LABELS[channel]}`, String(current));
    if (value === null) return;

    await fetch("/api/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, spent: Number(value) || 0 }),
    });
    void load();
  }

  async function scaleBudget(channel: (typeof CHANNELS)[number]) {
    const value = prompt(`New allocated budget for ${PLATFORM_LABELS[channel]}`, "6000");
    if (value === null) return;

    await fetch("/api/actions/scale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, newBudget: Number(value) || 0 }),
    });
    void load();
  }

  const totals = useMemo(() => {
    if (!budget) return { allocated: 0, spent: 0, remaining: 0 };
    const allocated = Object.values(budget.channels).reduce((sum, c) => sum + c.allocated, 0);
    const spent = Object.values(budget.channels).reduce((sum, c) => sum + c.spent, 0);
    return { allocated, spent, remaining: allocated - spent };
  }, [budget]);

  if (!budget) return <p className="text-sm text-slate-400">Loading budget…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Budget &amp; Pacing</h1>

      <Card>
        <p className="text-sm text-slate-400">Total campaign budget summary</p>
        <p className="mt-1 text-xl font-semibold">
          Allocated ${totals.allocated.toLocaleString()} · Spent ${totals.spent.toLocaleString()} · Remaining ${totals.remaining.toLocaleString()}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {CHANNELS.map((channel) => {
          const row = budget.channels[channel];
          const remaining = row.allocated - row.spent;
          const dailyBurn = row.spent / 7;
          const daysRemaining = dailyBurn > 0 ? remaining / dailyBurn : CAMPAIGN_DAYS;
          const pct = row.allocated ? (row.spent / row.allocated) * 100 : 0;

          return (
            <Card key={channel}>
              <h2 className="mb-2 text-lg font-semibold">{PLATFORM_LABELS[channel]}</h2>
              <div className="space-y-1 text-sm text-slate-300">
                <p>Allocated: ${row.allocated.toLocaleString()}</p>
                <p>Spent: ${row.spent.toLocaleString()}</p>
                <p>Remaining: ${remaining.toLocaleString()}</p>
                <p>Daily burn rate: ${dailyBurn.toFixed(2)}</p>
                <p>Days remaining: {daysRemaining.toFixed(1)}</p>
              </div>
              <div className="mt-3 h-2 w-full rounded bg-slate-700">
                <div className="h-2 rounded bg-green-500" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => updateSpend(channel)}>Update Spend</Button>
                <GhostButton onClick={() => scaleBudget(channel)}>Scale Budget</GhostButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
