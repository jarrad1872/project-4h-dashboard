"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { PlatformChip, StatusChip } from "@/components/chips";
import type { Ad, AdStatus } from "@/lib/types";
import { TRADE_MAP, tradeFromAd } from "@/lib/trade-utils";

function AdCard({
  ad,
  onDecision,
}: {
  ad: Ad;
  onDecision: (id: string, status: AdStatus) => void;
}) {
  const trade = tradeFromAd(ad);
  const tradeInfo = TRADE_MAP[trade] ?? TRADE_MAP.saw;

  return (
    <div className="rounded border border-slate-700 bg-slate-800/50 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PlatformChip platform={ad.platform} />
        <span className={`text-xs font-bold uppercase tracking-wider ${tradeInfo.color}`}>
          {tradeInfo.domain}
        </span>
        <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">{ad.format}</span>
        <span className="text-xs text-slate-500">Workflow: {ad.workflowStage ?? ad.workflow_stage}</span>
      </div>

      {ad.image_url && (
        <div className="mb-3 overflow-hidden rounded border border-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt={ad.headline ?? "Ad creative"}
            className="w-full object-cover max-h-48"
          />
        </div>
      )}

      {ad.headline && (
        <p className="mb-2 text-base font-semibold text-white">{ad.headline}</p>
      )}

      <p className="mb-3 text-sm leading-relaxed text-slate-300">{ad.primaryText ?? ad.primary_text}</p>

      <p className="mb-1 text-xs text-cyan-400">CTA: {ad.cta}</p>
      <p className="mb-3 font-mono text-xs text-slate-500">UTM: {ad.utmCampaign ?? ad.utm_campaign}</p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onDecision(ad.id, "approved")}>
          Approve ✓
        </Button>
        <GhostButton onClick={() => onDecision(ad.id, "paused")}>
          Hold ⏸
        </GhostButton>
        <GhostButton
          className="border-red-500 text-red-400 hover:bg-red-900/40"
          onClick={() => onDecision(ad.id, "rejected")}
        >
          Reject ✗
        </GhostButton>
      </div>
    </div>
  );
}

type TradeFilter = "all" | string;
type PlatformFilter = "all" | "linkedin" | "youtube" | "facebook" | "instagram";

export default function ApprovalPage() {
  const [pending, setPending] = useState<Ad[]>([]);
  const [reviewed, setReviewed] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState<Record<string, boolean>>({});
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const [pendRes, reviewedRes] = await Promise.all([
      fetch("/api/ads?status=pending", { cache: "no-store" }),
      fetch("/api/ads", { cache: "no-store" }),
    ]);
    const pendData = (await pendRes.json()) as Ad[];
    const allData = (await reviewedRes.json()) as Ad[];
    setPending(pendData);
    setReviewed(allData.filter((a) => a.status !== "pending"));
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, status: AdStatus) {
    await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void load();
  }

  async function bulkDecide(trade: string, _ads: Ad[], status: AdStatus) {
    setBulkLoading((prev) => ({ ...prev, [trade]: true }));
    // Single server-side query — not N sequential requests
    await fetch("/api/ads/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus: status, fromStatus: "pending", campaignGroupContains: `_${trade}` }),
    });
    setBulkLoading((prev) => ({ ...prev, [trade]: false }));
    void load();
  }

  const [approveAllLoading, setApproveAllLoading] = useState(false);

  async function approveAllPending() {
    if (!confirm(`Approve all ${pending.length} pending ads? This cannot be undone easily.`)) return;
    setApproveAllLoading(true);
    await fetch("/api/ads/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus: "approved", fromStatus: "pending" }),
    });
    setApproveAllLoading(false);
    void load();
  }

  const trades = useMemo(() => {
    const seen = new Set(pending.map(tradeFromAd));
    return ["all", ...Array.from(seen).sort((a, b) => {
      const ta = TRADE_MAP[a]?.tier ?? 99;
      const tb = TRADE_MAP[b]?.tier ?? 99;
      return ta !== tb ? ta - tb : a.localeCompare(b);
    })];
  }, [pending]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pending.filter((ad) => {
      const tMatch = tradeFilter === "all" || tradeFromAd(ad) === tradeFilter;
      const pMatch = platformFilter === "all" || ad.platform === platformFilter;
      const sMatch = !q
        ? true
        : (ad.headline ?? "").toLowerCase().includes(q) ||
          (ad.primaryText ?? "").toLowerCase().includes(q) ||
          (ad.campaignGroup ?? "").toLowerCase().includes(q) ||
          (TRADE_MAP[tradeFromAd(ad)]?.domain ?? "").toLowerCase().includes(q);
      return tMatch && pMatch && sMatch;
    });
  }, [pending, tradeFilter, platformFilter, search]);

  // Group pending ads by trade for display
  const byTrade = useMemo(() => {
    const groups: Record<string, Ad[]> = {};
    for (const ad of filtered) {
      const t = tradeFromAd(ad);
      if (!groups[t]) groups[t] = [];
      groups[t].push(ad);
    }
    return groups;
  }, [filtered]);

  // Per-trade approved/rejected counts (from reviewed ads)
  const tradeStats = useMemo(() => {
    const stats: Record<string, { approved: number; rejected: number }> = {};
    for (const ad of reviewed) {
      const t = tradeFromAd(ad);
      if (!stats[t]) stats[t] = { approved: 0, rejected: 0 };
      if (ad.status === "approved") stats[t].approved++;
      else if (ad.status === "rejected") stats[t].rejected++;
    }
    return stats;
  }, [reviewed]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Queue</h1>
          <p className="text-sm text-slate-400 mt-0.5">{pending.length} pending · {reviewed.length} reviewed</p>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={approveAllLoading || pending.length === 0}
            onClick={approveAllPending}
            className="bg-green-700 hover:bg-green-600"
          >
            {approveAllLoading ? "Approving…" : `✓ Approve All ${pending.length} Pending`}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search headline, copy, domain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-400 focus:outline-none"
          />
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-400 focus:outline-none"
          >
            {trades.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All trades" : (TRADE_MAP[t]?.domain ?? t)}
              </option>
            ))}
          </select>
          {(search || tradeFilter !== "all") && (
            <GhostButton onClick={() => { setSearch(""); setTradeFilter("all"); }}>Clear</GhostButton>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "linkedin", "youtube", "facebook", "instagram"] as const).map((p) => (
            <GhostButton
              key={p}
              className={platformFilter === p ? "bg-slate-700" : ""}
              onClick={() => setPlatformFilter(p)}
            >
              {p === "all" ? "All Platforms" : p[0].toUpperCase() + p.slice(1)}
            </GhostButton>
          ))}
        </div>
      </Card>

      {/* Pending ads */}
      {loading && (
        <Card><p className="text-sm text-slate-400">Loading…</p></Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">
            {pending.length === 0 ? "No pending ads. 🎉" : "No ads match the current filters."}
          </p>
        </Card>
      )}

      {!loading && Object.entries(byTrade).sort(([a],[b]) => {
        const ta = TRADE_MAP[a]?.tier ?? 99;
        const tb = TRADE_MAP[b]?.tier ?? 99;
        return ta !== tb ? ta - tb : a.localeCompare(b);
      }).map(([trade, ads]) => {
        const info = TRADE_MAP[trade] ?? TRADE_MAP.saw;
        const stats = tradeStats[trade] ?? { approved: 0, rejected: 0 };
        const isBulkLoading = bulkLoading[trade] ?? false;
        return (
          <Card key={trade}>
            <div className="mb-4 space-y-3">
              {/* Trade label + per-trade stats */}
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={`text-lg font-semibold ${info.color}`}>{info.label}</h2>
                {info.tier === 1 && (
                  <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-yellow-400">Tier 1</span>
                )}
                <span className="text-sm text-slate-400">
                  {stats.approved} approved · {ads.length} pending · {stats.rejected} rejected
                </span>
              </div>

              {/* Bulk action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={isBulkLoading || ads.length === 0}
                  onClick={() => void bulkDecide(trade, ads, "approved")}
                >
                  {isBulkLoading ? "Processing…" : `Approve All ${info.label}`}
                </Button>
                <GhostButton
                  className="border-red-500 text-red-400 hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isBulkLoading || ads.length === 0}
                  onClick={() => void bulkDecide(trade, ads, "rejected")}
                >
                  {isBulkLoading ? "Processing…" : `Reject All ${info.label}`}
                </GhostButton>
              </div>
            </div>

            <div className="space-y-4">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} onDecision={decide} />
              ))}
            </div>
          </Card>
        );
      })}

      {/* Review history */}
      {reviewed.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Review History</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reviewed.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center justify-between rounded border border-slate-700 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{ad.headline || "(no headline)"}</p>
                  <p className="text-xs text-slate-500">{ad.platform} · {TRADE_MAP[tradeFromAd(ad)]?.label ?? "Saw.City"}</p>
                </div>
                <StatusChip status={ad.status} className="ml-3 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
