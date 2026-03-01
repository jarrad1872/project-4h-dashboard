"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { TRADE_MAP, tradeFromAd } from "@/lib/trade-utils";
import type { Ad, WorkflowStage } from "@/lib/types";

const STAGES: Array<{ key: WorkflowStage; label: string; desc: string }> = [
  { key: "concept", label: "Concept", desc: "Idea only — no copy yet" },
  { key: "copy-ready", label: "Copy Ready", desc: "Copy written, awaiting approval" },
  { key: "approved", label: "Approved", desc: "Signed off, needs creative brief" },
  { key: "creative-brief", label: "Creative Brief", desc: "Brief written, creative pending" },
  { key: "uploaded", label: "Uploaded", desc: "Uploaded to ad platform" },
  { key: "live", label: "Live", desc: "Running in market" },
];

const STAGE_COLORS: Record<WorkflowStage, string> = {
  concept: "bg-slate-700 text-slate-300",
  "copy-ready": "bg-amber-900/60 text-amber-300",
  approved: "bg-blue-900/60 text-blue-300",
  "creative-brief": "bg-purple-900/60 text-purple-300",
  uploaded: "bg-cyan-900/60 text-cyan-300",
  live: "bg-green-900/60 text-green-300",
};

const STAGE_NEXT: Partial<Record<WorkflowStage, WorkflowStage>> = {
  concept: "copy-ready",
  "copy-ready": "approved",
  approved: "creative-brief",
  "creative-brief": "uploaded",
  uploaded: "live",
};

export default function WorkflowPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkMoving, setBulkMoving] = useState<WorkflowStage | null>(null);
  const [expandedStage, setExpandedStage] = useState<WorkflowStage | null>(null);

  async function load() {
    const res = await fetch("/api/ads", { cache: "no-store" });
    const data = (await res.json()) as Ad[];
    setAds(data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const grouped = useMemo(() => {
    return STAGES.reduce<Record<WorkflowStage, Ad[]>>((acc, s) => {
      acc[s.key] = ads.filter((ad) => (ad.workflowStage ?? ad.workflow_stage) === s.key);
      return acc;
    }, {
      concept: [], "copy-ready": [], approved: [],
      "creative-brief": [], uploaded: [], live: [],
    });
  }, [ads]);

  // Per-trade breakdown for a given stage
  const tradeBreakdown = useMemo(() => {
    if (!expandedStage) return {};
    const stageAds = grouped[expandedStage];
    const byTrade: Record<string, Ad[]> = {};
    for (const ad of stageAds) {
      const t = tradeFromAd(ad);
      if (!byTrade[t]) byTrade[t] = [];
      byTrade[t].push(ad);
    }
    return byTrade;
  }, [expandedStage, grouped]);

  async function bulkAdvance(fromStage: WorkflowStage) {
    const nextStage = STAGE_NEXT[fromStage];
    if (!nextStage) return;
    const stageAds = grouped[fromStage];
    if (!stageAds.length) return;
    if (!confirm(`Move all ${stageAds.length} ads from "${fromStage}" → "${nextStage}"?`)) return;

    setBulkMoving(fromStage);
    // Batch in groups of 50 — parallel requests
    const chunks: Ad[][] = [];
    for (let i = 0; i < stageAds.length; i += 50) chunks.push(stageAds.slice(i, i + 50));
    for (const chunk of chunks) {
      await Promise.all(chunk.map((ad) =>
        fetch(`/api/ads/${ad.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflowStage: nextStage }),
        })
      ));
    }
    setBulkMoving(null);
    void load();
  }

  const totalLive = grouped.live.length;
  const totalAds = ads.length;
  const livePercent = totalAds ? ((totalLive / totalAds) * 100).toFixed(0) : 0;

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading pipeline…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflow Pipeline</h1>
          <p className="mt-1 text-sm text-slate-400">
            {totalAds} total ads · {totalLive} live ({livePercent}%) · Click a stage to see per-trade breakdown
          </p>
        </div>
        <Link href="/approval">
          <GhostButton>Go to Approval →</GhostButton>
        </Link>
      </div>

      {/* Pipeline funnel */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage, idx) => {
          const count = grouped[stage.key].length;
          const isExpanded = expandedStage === stage.key;
          const nextStage = STAGE_NEXT[stage.key];
          const isBulkMoving = bulkMoving === stage.key;
          const pct = totalAds ? Math.round((count / totalAds) * 100) : 0;

          return (
            <div key={stage.key}
                 onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                 className={`cursor-pointer rounded border p-4 transition-all ${
                   isExpanded
                     ? "border-blue-500 bg-blue-900/20"
                     : "border-slate-700 bg-slate-800/60 hover:border-slate-500"
                 }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {idx + 1}/{STAGES.length}
                </span>
                {count > 0 && nextStage && (
                  <button
                    onClick={(e) => { e.stopPropagation(); void bulkAdvance(stage.key); }}
                    disabled={isBulkMoving}
                    className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
                    title={`Advance all → ${nextStage}`}
                  >
                    {isBulkMoving ? "…" : "→"}
                  </button>
                )}
              </div>
              <p className="text-3xl font-black text-white">{count}</p>
              <p className={`mt-1 text-xs font-semibold rounded px-1.5 py-0.5 inline-block ${STAGE_COLORS[stage.key]}`}>
                {stage.label}
              </p>
              <p className="mt-2 text-xs text-slate-500">{stage.desc}</p>
              {totalAds > 0 && (
                <div className="mt-2 h-1 w-full rounded-full bg-slate-700">
                  <div className="h-1 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                </div>
              )}
              {isExpanded && <p className="mt-2 text-xs text-blue-400 font-semibold">▼ Expanded below</p>}
            </div>
          );
        })}
      </div>

      {/* Flow diagram */}
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {STAGES.map((s, i) => (
            <span key={s.key} className="flex items-center gap-2">
              <span className={`rounded px-2 py-1 text-xs font-semibold ${STAGE_COLORS[s.key]}`}>
                {s.label} ({grouped[s.key].length})
              </span>
              {i < STAGES.length - 1 && <span className="text-slate-600">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Click the <span className="text-slate-300">→</span> button on any stage to bulk-advance all ads to the next stage (batched 50 at a time).
        </p>
      </Card>

      {/* Expanded stage breakdown by trade */}
      {expandedStage && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              <span className={`rounded px-2 py-1 text-xs font-semibold mr-2 ${STAGE_COLORS[expandedStage]}`}>
                {expandedStage}
              </span>
              — {grouped[expandedStage].length} ads by trade
            </h2>
            {STAGE_NEXT[expandedStage] && (
              <Button
                onClick={() => bulkAdvance(expandedStage)}
                disabled={bulkMoving === expandedStage || grouped[expandedStage].length === 0}
              >
                {bulkMoving === expandedStage
                  ? "Moving…"
                  : `Advance All → ${STAGE_NEXT[expandedStage]}`}
              </Button>
            )}
          </div>

          {Object.keys(tradeBreakdown).length === 0 ? (
            <p className="text-sm text-slate-500">No ads in this stage.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(tradeBreakdown)
                .sort(([a], [b]) => {
                  const ta = TRADE_MAP[a]?.tier ?? 99;
                  const tb = TRADE_MAP[b]?.tier ?? 99;
                  return ta !== tb ? ta - tb : a.localeCompare(b);
                })
                .map(([trade, tradeAds]) => {
                  const info = TRADE_MAP[trade] ?? TRADE_MAP.saw;
                  const platforms = [...new Set(tradeAds.map((a) => a.platform))];
                  return (
                    <div key={trade} className="rounded border border-slate-700 bg-slate-800 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${info.color}`}>{info.label}</span>
                        <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-bold">{tradeAds.length}</span>
                      </div>
                      <p className="text-xs text-slate-500">{platforms.join(", ")}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      {/* Per-stage trade summary (all stages, compact) */}
      <Card>
        <h2 className="mb-4 font-semibold">Trade Progress Overview</h2>
        <p className="mb-3 text-xs text-slate-500">
          Shows which stage each trade's ads are in. All 65 trades × 16 ads.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-3">Trade</th>
                <th className="pb-2 pr-3">Tier</th>
                <th className="pb-2 pr-3">Concept</th>
                <th className="pb-2 pr-3">Copy Ready</th>
                <th className="pb-2 pr-3">Approved</th>
                <th className="pb-2 pr-3">Brief</th>
                <th className="pb-2 pr-3">Uploaded</th>
                <th className="pb-2">Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {(() => {
                // Aggregate by trade across all stages
                const tradeStage: Record<string, Record<WorkflowStage, number>> = {};
                for (const ad of ads) {
                  const t = tradeFromAd(ad);
                  const stage = (ad.workflowStage ?? ad.workflow_stage ?? "copy-ready") as WorkflowStage;
                  if (!tradeStage[t]) {
                    tradeStage[t] = { concept: 0, "copy-ready": 0, approved: 0, "creative-brief": 0, uploaded: 0, live: 0 };
                  }
                  tradeStage[t][stage]++;
                }

                return Object.entries(tradeStage)
                  .sort(([a], [b]) => {
                    const ta = TRADE_MAP[a]?.tier ?? 99;
                    const tb = TRADE_MAP[b]?.tier ?? 99;
                    return ta !== tb ? ta - tb : a.localeCompare(b);
                  })
                  .map(([trade, stages]) => {
                    const info = TRADE_MAP[trade] ?? TRADE_MAP.saw;
                    const total = Object.values(stages).reduce((s, n) => s + n, 0);
                    return (
                      <tr key={trade}>
                        <td className="py-1.5 pr-3">
                          <span className={`text-xs font-semibold ${info.color}`}>{info.label}</span>
                        </td>
                        <td className="py-1.5 pr-3">
                          <span className={`text-xs rounded px-1 ${info.tier === 1 ? "text-green-400" : info.tier === 2 ? "text-yellow-400" : "text-slate-500"}`}>
                            T{info.tier}
                          </span>
                        </td>
                        {(["concept", "copy-ready", "approved", "creative-brief", "uploaded", "live"] as WorkflowStage[]).map((s) => (
                          <td key={s} className="py-1.5 pr-3 text-center">
                            {stages[s] > 0 ? (
                              <span className={`text-xs font-bold ${s === "live" ? "text-green-400" : s === "approved" ? "text-blue-400" : "text-slate-300"}`}>
                                {stages[s]}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-700">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  });
              })()}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
