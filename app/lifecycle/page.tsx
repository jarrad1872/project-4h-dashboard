"use client";

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import type { LifecycleMessage } from "@/lib/types";

const CHANNEL_COLOR: Record<string, string> = {
  email: "bg-blue-900/40 text-blue-300 border-blue-700/40",
  sms: "bg-green-900/40 text-green-300 border-green-700/40",
  push: "bg-purple-900/40 text-purple-300 border-purple-700/40",
  in_app: "bg-slate-700 text-slate-300 border-slate-600",
};

const TIMING_STAGES = [
  "trial_start",
  "day_1",
  "day_3",
  "day_7",
  "day_10",
  "day_13",
  "conversion",
  "post_conversion",
  "churn_risk",
  "win_back",
];

function stageSortKey(timing: string) {
  const idx = TIMING_STAGES.indexOf(timing);
  return idx >= 0 ? idx : 999;
}

export default function LifecyclePage() {
  const [rows, setRows] = useState<LifecycleMessage[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<LifecycleMessage>>({});
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  async function load() {
    const res = await fetch("/api/lifecycle", { cache: "no-store" });
    setRows((await res.json()) as LifecycleMessage[]);
  }

  useEffect(() => { void load(); }, []);

  async function save(id: string) {
    await fetch("/api/lifecycle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, id }),
    });
    setEditing(null);
    setDraft({});
    void load();
  }

  async function toggleStatus(row: LifecycleMessage) {
    await fetch("/api/lifecycle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status: row.status === "active" ? "paused" : "active" }),
    });
    void load();
  }

  const filtered = rows
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => stageSortKey(a.timing) - stageSortKey(b.timing));

  const activeCount = rows.filter((r) => r.status === "active").length;
  const pausedCount = rows.filter((r) => r.status === "paused").length;

  // Group by timing for flow visualization
  const byTiming: Record<string, LifecycleMessage[]> = {};
  for (const row of filtered) {
    if (!byTiming[row.timing]) byTiming[row.timing] = [];
    byTiming[row.timing].push(row);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Lifecycle Messaging</h1>
          <p className="mt-1 text-sm text-slate-400">
            {rows.length} messages · {activeCount} active · {pausedCount} paused
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "active", "paused"] as const).map((f) => (
            <GhostButton key={f} onClick={() => setFilter(f)} className={filter === f ? "bg-slate-700" : ""}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </GhostButton>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Messages", value: rows.length },
          { label: "Active", value: activeCount, color: "text-green-400" },
          { label: "Paused", value: pausedCount, color: "text-amber-400" },
          { label: "Channels", value: [...new Set(rows.map((r) => r.channel))].length },
        ].map((s) => (
          <div key={s.label} className="rounded border border-slate-700 bg-slate-800/60 p-3 text-center">
            <p className={`text-xl font-bold ${s.color ?? "text-white"}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Messages by timing stage */}
      {Object.entries(byTiming).map(([timing, messages]) => (
        <div key={timing}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">
              {timing.replace(/_/g, " ")}
            </h2>
            <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">{messages.length}</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          <div className="space-y-3">
            {messages.map((row) => {
              const isEditing = editing === row.id;
              const channelStyle = CHANNEL_COLOR[row.channel] ?? "bg-slate-700 text-slate-300 border-slate-600";

              return (
                <Card key={row.id} className={`border ${row.status === "paused" ? "opacity-60" : ""}`}>
                  {isEditing ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${channelStyle}`}>
                          {row.channel}
                        </span>
                        <span className="text-xs text-slate-400">{row.timing} · {row.asset_id}</span>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">Subject</label>
                        <input
                          className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          value={(draft.subject as string) ?? row.subject ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">Message</label>
                        <textarea
                          rows={4}
                          className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          value={(draft.message as string) ?? row.message ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => save(row.id)}>Save</Button>
                        <GhostButton onClick={() => { setEditing(null); setDraft({}); }}>Cancel</GhostButton>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${channelStyle}`}>
                          {row.channel}
                        </span>
                        <span className="text-xs text-slate-500">{row.asset_id}</span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs text-slate-400 font-medium">{row.goal}</span>
                        <span className={`ml-auto text-xs font-semibold rounded px-2 py-0.5 ${row.status === "active" ? "bg-green-900/40 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                          {row.status}
                        </span>
                      </div>

                      {row.subject && (
                        <p className="text-sm font-semibold text-white mb-1">{row.subject}</p>
                      )}
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">{row.message}</p>

                      <div className="flex gap-2">
                        <GhostButton onClick={() => {
                          setEditing(row.id);
                          setDraft({ subject: row.subject, message: row.message });
                        }}>
                          Edit
                        </GhostButton>
                        <GhostButton onClick={() => toggleStatus(row)}>
                          {row.status === "active" ? "Pause" : "Activate"}
                        </GhostButton>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">No lifecycle messages match the current filter.</p>
        </Card>
      )}
    </div>
  );
}
