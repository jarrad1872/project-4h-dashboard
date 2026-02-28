"use client";

import { useEffect, useState, useCallback } from "react";
import { getProjectState } from "@/lib/project-state-data";

type AssetStatus = "pending" | "approved" | "rejected";

interface TradeAsset {
  id: string;
  trade_slug: string;
  asset_type: "hero" | "og";
  image_url: string | null;
  status: AssetStatus;
  notes: string | null;
}

type AssetMap = Record<string, Record<string, TradeAsset>>;

const STATUS_STYLES: Record<AssetStatus, string> = {
  approved: "bg-green-500/20 text-green-400 border border-green-700",
  pending:  "bg-yellow-500/20 text-yellow-400 border border-yellow-700",
  rejected: "bg-red-500/20 text-red-400 border border-red-700",
};

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 — Priority",
  2: "Tier 2",
  3: "Tier 3",
};

function AssetSlot({
  tradeSlug,
  assetType,
  asset,
  onRefresh,
}: {
  tradeSlug: string;
  assetType: "hero" | "og";
  asset: TradeAsset | undefined;
  onRefresh: () => void;
}) {
  const [urlInput, setUrlInput] = useState(asset?.image_url ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const method = asset ? "PATCH" : "POST";
    const body = asset
      ? { id: asset.id, image_url: urlInput || null }
      : { trade_slug: tradeSlug, asset_type: assetType, image_url: urlInput || null };
    await fetch("/api/trade-assets", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    onRefresh();
  };

  const decide = async (status: AssetStatus) => {
    if (!asset) return;
    await fetch("/api/trade-assets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: asset.id, status }),
    });
    onRefresh();
  };

  const label = assetType === "hero" ? "Hero Image" : "OG Image";
  const status = asset?.status ?? "pending";
  const hasImage = !!asset?.image_url;

  return (
    <div className="rounded border border-slate-700 bg-slate-800/50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </div>

      {hasImage && (
        <div className="rounded overflow-hidden border border-slate-700 bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset!.image_url!}
            alt={`${tradeSlug} ${assetType}`}
            className="w-full object-cover max-h-36"
          />
        </div>
      )}

      {!hasImage && (
        <div className="flex h-20 items-center justify-center rounded border border-dashed border-slate-600 text-xs text-slate-500">
          No image yet
        </div>
      )}

      <div className="flex gap-1">
        <input
          type="url"
          placeholder="Paste image URL…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 min-w-0 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-400"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        >
          {saving ? "…" : "Set"}
        </button>
      </div>

      {asset && (
        <div className="flex gap-1">
          <button
            onClick={() => decide("approved")}
            disabled={status === "approved"}
            className="flex-1 rounded border border-green-700 px-2 py-1 text-xs text-green-400 hover:bg-green-900/30 disabled:opacity-40"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => decide("rejected")}
            disabled={status === "rejected"}
            className="flex-1 rounded border border-red-700 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-40"
          >
            ✗ Reject
          </button>
          <button
            onClick={() => decide("pending")}
            disabled={status === "pending"}
            className="flex-1 rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default function AssetsPage() {
  const [assetMap, setAssetMap] = useState<AssetMap>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | AssetStatus>("all");
  const [tierFilter, setTierFilter] = useState<"all" | 1 | 2 | 3>("all");

  const state = getProjectState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTrades: any[] = (state.campaign as any).all_trades ?? [];

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/trade-assets", { cache: "no-store" });
    const rows: TradeAsset[] = await res.json();
    const map: AssetMap = {};
    for (const row of rows) {
      if (!map[row.trade_slug]) map[row.trade_slug] = {};
      map[row.trade_slug][row.asset_type] = row;
    }
    setAssetMap(map);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchAssets(); }, [fetchAssets]);

  // Group trades by tier, exclude forwarding/platform
  const activeTrades = allTrades.filter((t) => t.status === "live" || t.status === "upcoming");

  // Summary counts
  let totalSlots = activeTrades.length * 2;
  let approvedCount = 0;
  let pendingCount = 0;
  let missingCount = 0;
  for (const t of activeTrades) {
    for (const type of ["hero", "og"] as const) {
      const a = assetMap[t.slug]?.[type];
      if (!a) { missingCount++; }
      else if (a.status === "approved") { approvedCount++; }
      else { pendingCount++; }
    }
  }

  const tiers = [1, 2, 3] as const;

  const filteredTrades = activeTrades.filter((t) => {
    if (tierFilter !== "all" && t.tier !== tierFilter) return false;
    if (statusFilter === "all") return true;
    for (const type of ["hero", "og"] as const) {
      const a = assetMap[t.slug]?.[type];
      const s = a?.status ?? "pending";
      if (s === statusFilter) return true;
    }
    return false;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Trade Asset Staging</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hero images + OG images per trade — generated, reviewed, and approved here before use in Saw.City LITE.
          No app connection. Assets staged only.
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 rounded border border-slate-700 bg-slate-800/50 p-4 text-sm">
        <div><span className="font-semibold text-white">{totalSlots}</span> <span className="text-slate-400">total slots</span></div>
        <div><span className="font-semibold text-green-400">{approvedCount}</span> <span className="text-slate-400">approved</span></div>
        <div><span className="font-semibold text-yellow-400">{pendingCount}</span> <span className="text-slate-400">pending</span></div>
        <div><span className="font-semibold text-slate-500">{missingCount}</span> <span className="text-slate-400">no image</span></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {(["all", "approved", "pending", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded px-3 py-1 text-xs capitalize ${statusFilter === s ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-4">
          {(["all", 1, 2, 3] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`rounded px-3 py-1 text-xs ${tierFilter === t ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {t === "all" ? "All Tiers" : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Setup notice */}
      {!loading && Object.keys(assetMap).length === 0 && (
        <div className="rounded border border-yellow-700 bg-yellow-900/20 p-4 text-sm text-yellow-300">
          <strong>DB setup required.</strong> Run <code className="rounded bg-slate-900 px-1 text-yellow-200">supabase/migrations/005_trade_assets.sql</code> in the{" "}
          <a href="https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas/sql" target="_blank" rel="noopener noreferrer" className="underline">Supabase SQL editor</a>.
        </div>
      )}

      {/* Trade grid by tier */}
      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        tiers.map((tier) => {
          const tierTrades = filteredTrades.filter((t) => t.tier === tier);
          if (tierTrades.length === 0) return null;
          return (
            <section key={tier} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  {TIER_LABEL[tier]}
                </h2>
                {tier === 1 && (
                  <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-yellow-400">
                    Priority
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tierTrades.map((trade) => (
                  <div key={trade.slug} className="rounded border border-slate-700 bg-slate-900 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{trade.appName}</p>
                        <p className="text-xs text-slate-500">{trade.domain} · {trade.slug}</p>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${trade.status === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {trade.status}
                      </span>
                    </div>
                    {/* Hero + OG slots */}
                    <div className="grid grid-cols-2 gap-2">
                      {(["hero", "og"] as const).map((type) => (
                        <AssetSlot
                          key={type}
                          tradeSlug={trade.slug}
                          assetType={type}
                          asset={assetMap[trade.slug]?.[type]}
                          onRefresh={fetchAssets}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
