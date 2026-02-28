"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { PlatformChip, StatusChip } from "@/components/chips";
import type { Ad, AdStatus } from "@/lib/types";

const TRADE_MAP: Record<string, { label: string; color: string; domain: string }> = {
  rinse: { label: "Rinse.City", color: "text-blue-400", domain: "rinse.city" },
  mow:   { label: "Mow.City",   color: "text-green-400", domain: "mow.city" },
  rooter:{ label: "Rooter.City",color: "text-purple-400", domain: "rooter.city" },
  saw:   { label: "Saw.City",   color: "text-orange-400", domain: "saw.city" },
};

function tradeFromAd(ad: Ad): string {
  const utm = (ad.utm_campaign ?? ad.utmCampaign ?? "").toLowerCase();
  for (const key of Object.keys(TRADE_MAP)) {
    if (utm.includes(`_${key}_`) || utm.endsWith(`_${key}`)) return key;
  }
  // fallback: check landing path or utm_content
  const lp = (ad.landing_path ?? ad.landingPath ?? "").toLowerCase();
  for (const key of Object.keys(TRADE_MAP)) {
    if (lp.includes(key)) return key;
  }
  return "saw";
}

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
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

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

  const trades = useMemo(() => {
    const seen = new Set(pending.map(tradeFromAd));
    return ["all", ...Array.from(seen).sort()];
  }, [pending]);

  const filtered = useMemo(() => {
    return pending.filter((ad) => {
      const tMatch = tradeFilter === "all" || tradeFromAd(ad) === tradeFilter;
      const pMatch = platformFilter === "all" || ad.platform === platformFilter;
      return tMatch && pMatch;
    });
  }, [pending, tradeFilter, platformFilter]);

  // Group by trade for display
  const byTrade = useMemo(() => {
    const groups: Record<string, Ad[]> = {};
    for (const ad of filtered) {
      const t = tradeFromAd(ad);
      if (!groups[t]) groups[t] = [];
      groups[t].push(ad);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Approval Queue</h1>
        <span className="text-sm text-slate-400">
          {pending.length} pending · {reviewed.length} reviewed
        </span>
      </div>

      {/* Filters */}
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {trades.map((t) => (
            <GhostButton
              key={t}
              className={tradeFilter === t ? "bg-slate-700" : ""}
              onClick={() => setTradeFilter(t)}
            >
              {t === "all" ? "All Trades" : (TRADE_MAP[t]?.label ?? t)}
            </GhostButton>
          ))}
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

      {!loading && Object.entries(byTrade).map(([trade, ads]) => {
        const info = TRADE_MAP[trade] ?? TRADE_MAP.saw;
        return (
          <Card key={trade}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className={`text-lg font-semibold ${info.color}`}>{info.label}</h2>
              <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                {ads.length} pending
              </span>
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
