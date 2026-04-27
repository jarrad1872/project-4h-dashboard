"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { StatusChip } from "@/components/chips";
import { AdPreview } from "@/components/ad-preview/index";
import { TRADE_MAP, tradeFromAd } from "@/lib/trade-utils";
import type { ApprovalAuditSummary } from "@/lib/approval-audit-log";
import type { Ad, AdStatus } from "@/lib/types";

type TradeFilter = "all" | string;
type PlatformFilter = "all" | "linkedin" | "youtube" | "facebook" | "instagram";

const angleColors: Record<string, string> = {
  pain: "bg-rose-900/50 text-rose-300",
  solution: "bg-blue-900/50 text-blue-300",
  proof: "bg-green-900/50 text-green-300",
  urgency: "bg-amber-900/50 text-amber-300",
};

function splitAds(allData: Ad[]) {
  return {
    pending: allData.filter((ad) => ad.status === "pending"),
    reviewed: allData.filter((ad) => ad.status !== "pending"),
  };
}

function formatAuditDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ApprovalClient({ initialAds }: { initialAds: Ad[] }) {
  const initialSplit = splitAds(initialAds);
  const [pending, setPending] = useState<Ad[]>(initialSplit.pending);
  const [reviewed, setReviewed] = useState<Ad[]>(initialSplit.reviewed);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<Record<string, boolean>>({});
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [search, setSearch] = useState("");
  const [approveAllLoading, setApproveAllLoading] = useState(false);
  const [audit, setAudit] = useState<ApprovalAuditSummary | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  async function loadAudit() {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/approval-audit", { cache: "no-store" });
      if (res.ok) {
        setAudit((await res.json()) as ApprovalAuditSummary);
      }
    } finally {
      setAuditLoading(false);
    }
  }

  useEffect(() => {
    void loadAudit();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/ads", { cache: "no-store" });
    const allData = (await res.json()) as Ad[];
    const next = splitAds(allData);
    setPending(next.pending);
    setReviewed(next.reviewed);
    setLoading(false);
  }

  async function decide(id: string, status: AdStatus) {
    await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    void loadAudit();
  }

  async function bulkDecide(trade: string, status: AdStatus) {
    setBulkLoading((prev) => ({ ...prev, [trade]: true }));
    await fetch("/api/ads/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus: status, fromStatus: "pending", campaignGroupContains: `_${trade}` }),
    });
    setBulkLoading((prev) => ({ ...prev, [trade]: false }));
    await load();
    void loadAudit();
  }

  async function approveAllPending() {
    if (!confirm(`Approve all ${pending.length} pending ads? This cannot be undone easily.`)) return;
    setApproveAllLoading(true);
    await fetch("/api/ads/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus: "approved", fromStatus: "pending" }),
    });
    setApproveAllLoading(false);
    await load();
    void loadAudit();
  }

  const trades = useMemo(() => {
    const seen = new Set(pending.map(tradeFromAd));
    return [
      "all",
      ...Array.from(seen).sort((a, b) => {
        const ta = TRADE_MAP[a]?.tier ?? 99;
        const tb = TRADE_MAP[b]?.tier ?? 99;
        return ta !== tb ? ta - tb : a.localeCompare(b);
      }),
    ];
  }, [pending]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pending.filter((ad) => {
      const trade = tradeFromAd(ad);
      const tMatch = tradeFilter === "all" || trade === tradeFilter;
      const pMatch = platformFilter === "all" || ad.platform === platformFilter;
      const sMatch = !q
        ? true
        : (ad.headline ?? "").toLowerCase().includes(q) ||
          (ad.primaryText ?? "").toLowerCase().includes(q) ||
          (ad.campaignGroup ?? "").toLowerCase().includes(q) ||
          (TRADE_MAP[trade]?.domain ?? "").toLowerCase().includes(q);
      return tMatch && pMatch && sMatch;
    });
  }, [pending, tradeFilter, platformFilter, search]);

  const byTrade = useMemo(() => {
    const groups: Record<string, Ad[]> = {};
    for (const ad of filtered) {
      const trade = tradeFromAd(ad);
      if (!groups[trade]) groups[trade] = [];
      groups[trade].push(ad);
    }
    return groups;
  }, [filtered]);

  const tradeStats = useMemo(() => {
    const stats: Record<string, { approved: number; rejected: number }> = {};
    for (const ad of reviewed) {
      const trade = tradeFromAd(ad);
      if (!stats[trade]) stats[trade] = { approved: 0, rejected: 0 };
      if (ad.status === "approved") stats[trade].approved++;
      else if (ad.status === "rejected") stats[trade].rejected++;
    }
    return stats;
  }, [reviewed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Queue</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {pending.length} pending · {reviewed.length} reviewed
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={approveAllLoading || pending.length === 0}
            onClick={approveAllPending}
            className="bg-green-700 hover:bg-green-600"
          >
            {approveAllLoading ? "Approving..." : `Approve All ${pending.length} Pending`}
          </Button>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search headline, copy, domain..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-400 focus:outline-none"
          />
          <select
            value={tradeFilter}
            onChange={(event) => setTradeFilter(event.target.value)}
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-400 focus:outline-none"
          >
            {trades.map((trade) => (
              <option key={trade} value={trade}>
                {trade === "all" ? "All trades" : (TRADE_MAP[trade]?.domain ?? trade)}
              </option>
            ))}
          </select>
          {(search || tradeFilter !== "all") && (
            <GhostButton
              onClick={() => {
                setSearch("");
                setTradeFilter("all");
              }}
            >
              Clear
            </GhostButton>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "linkedin", "youtube", "facebook", "instagram"] as const).map((platform) => (
            <GhostButton
              key={platform}
              className={platformFilter === platform ? "bg-slate-700" : ""}
              onClick={() => setPlatformFilter(platform)}
            >
              {platform === "all" ? "All Platforms" : platform[0].toUpperCase() + platform.slice(1)}
            </GhostButton>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Approval Audit Log</h2>
            <p className="mt-1 text-sm text-slate-400">
              Internal who/when/what/why trail for approvals. The audit view is metadata only; it does not send outreach, take ad-platform action, launch, create webhooks, spend, or change billing.
            </p>
          </div>
          <GhostButton disabled={auditLoading} onClick={() => void loadAudit()}>
            {auditLoading ? "Refreshing..." : "Refresh audit"}
          </GhostButton>
        </div>

        <div className="grid gap-2 md:grid-cols-5">
          {(audit?.coverage ?? []).map((item) => (
            <div key={item.area} className="rounded-md border border-slate-700 bg-slate-900/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                <span className={item.covered ? "text-xs font-semibold text-green-300" : "text-xs font-semibold text-slate-500"}>
                  {item.records}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.route}</p>
              <p className="mt-2 text-xs text-slate-400">{item.requirement}</p>
            </div>
          ))}
          {!audit && (
            <div className="rounded-md border border-slate-700 bg-slate-900/50 p-3 text-sm text-slate-400 md:col-span-5">
              {auditLoading ? "Loading audit coverage..." : "Audit coverage will appear here."}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-300">Recent Decisions</p>
            {audit && (
              <p className="text-xs text-slate-500">
                Source: {audit.source} - Updated {formatAuditDate(audit.generatedAt)}
              </p>
            )}
          </div>
          {audit?.entries.length ? (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {audit.entries.map((entry) => (
                <div key={entry.id} className="rounded-md border border-slate-700 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-100">
                      {entry.areaLabel} - {entry.action}
                    </p>
                    <p className="text-xs text-slate-500">{formatAuditDate(entry.decidedAt)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {entry.actor} - {entry.entityType}:{entry.entityId}
                    {(entry.oldStatus || entry.newStatus) && (
                      <span>
                        {" "}
                        - {entry.oldStatus ?? "unknown"} to {entry.newStatus ?? "unknown"}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">{entry.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-400">
              No approval activity has been logged yet. The five approval surfaces above are ready to classify future creative, outreach, launch bundle, export, and ad copy decisions.
            </p>
          )}
        </div>
      </Card>

      {loading && (
        <Card>
          <p className="text-sm text-slate-400">Loading...</p>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">
            {pending.length === 0 ? "No pending ads." : "No ads match the current filters."}
          </p>
        </Card>
      )}

      {!loading &&
        Object.entries(byTrade)
          .sort(([a], [b]) => {
            const ta = TRADE_MAP[a]?.tier ?? 99;
            const tb = TRADE_MAP[b]?.tier ?? 99;
            return ta !== tb ? ta - tb : a.localeCompare(b);
          })
          .map(([trade, ads]) => {
            const info = TRADE_MAP[trade] ?? TRADE_MAP.saw;
            const stats = tradeStats[trade] ?? { approved: 0, rejected: 0 };
            const isBulkLoading = bulkLoading[trade] ?? false;

            return (
              <Card key={trade}>
                <div className="mb-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className={`text-lg font-semibold ${info.color}`}>{info.label}</h2>
                    {info.tier === 1 && (
                      <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-yellow-400">
                        Tier 1
                      </span>
                    )}
                    <span className="text-sm text-slate-400">
                      {stats.approved} approved · {ads.length} pending · {stats.rejected} rejected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button disabled={isBulkLoading || ads.length === 0} onClick={() => void bulkDecide(trade, "approved")}>
                      {isBulkLoading ? "Processing..." : `Approve All ${info.label}`}
                    </Button>
                    <GhostButton
                      className="border-red-500 text-red-400 hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isBulkLoading || ads.length === 0}
                      onClick={() => void bulkDecide(trade, "rejected")}
                    >
                      {isBulkLoading ? "Processing..." : `Reject All ${info.label}`}
                    </GhostButton>
                  </div>
                </div>

                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className="space-y-1">
                      {(ad.angle || ad.validation_notes) && (
                        <div className="flex flex-wrap items-center gap-2 px-1">
                          {ad.angle && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${angleColors[ad.angle] ?? "bg-slate-700 text-slate-300"}`}
                            >
                              {ad.angle}
                            </span>
                          )}
                          {ad.validation_notes && (
                            <span className="text-xs text-amber-400" title={ad.validation_notes}>
                              Warning: {ad.validation_notes}
                            </span>
                          )}
                        </div>
                      )}
                      <AdPreview ad={ad} tradeInfo={info} onDecision={decide} />
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

      {reviewed.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Review History</h2>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {reviewed.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center justify-between rounded border border-slate-700 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{ad.headline || "(no headline)"}</p>
                  <p className="text-xs text-slate-500">
                    {ad.platform} · {TRADE_MAP[tradeFromAd(ad)]?.label ?? "Saw.City"}
                  </p>
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
