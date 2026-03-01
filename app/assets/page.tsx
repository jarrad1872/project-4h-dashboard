"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getProjectState } from "@/lib/project-state-data";
import { TRADE_MAP, getCreativeUrls } from "@/lib/trade-utils";

type AssetStatus = "pending" | "approved" | "rejected";

interface TradeAsset {
  id: string;
  trade_slug: string;
  asset_type: "hero" | "og" | "hero_a" | "hero_b" | "og_nb2";
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

const ASSET_TYPES = [
  { key: "hero_a", label: "Hero A (Zoom)", desc: "Ad creative primary focus" },
  { key: "hero_b", label: "Hero B (Wide)", desc: "Landing page background" },
  { key: "og_nb2", label: "OG (NB2)", desc: "Social link previews" },
] as const;

function AssetSlot({
  tradeSlug,
  assetType,
  asset,
  onRefresh,
}: {
  tradeSlug: string;
  assetType: string;
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

  const status = asset?.status ?? "pending";
  const hasImage = !!asset?.image_url;

  return (
    <div className="rounded border border-slate-700 bg-slate-800/30 p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[status]}`}>
          {status}
        </span>
      </div>

      {hasImage ? (
        <div className="rounded overflow-hidden border border-slate-700 bg-slate-900 group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset!.image_url!}
            alt={`${tradeSlug} ${assetType}`}
            className="w-full object-cover aspect-video"
          />
          <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
             <button
                onClick={() => decide("approved")}
                disabled={status === "approved"}
                className="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-green-500 disabled:opacity-30"
              >
                ✓
              </button>
              <button
                onClick={() => decide("rejected")}
                disabled={status === "rejected"}
                className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-500 disabled:opacity-30"
              >
                ✗
              </button>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded border border-dashed border-slate-600 text-[10px] text-slate-500 bg-slate-900">
          No image
        </div>
      )}

      <div className="flex gap-1">
        <input
          type="url"
          placeholder="URL…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 min-w-0 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 text-[10px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-400"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-slate-700 px-1.5 py-1 text-[10px] text-slate-200 hover:bg-slate-600"
        >
          {saving ? "…" : "Set"}
        </button>
      </div>
    </div>
  );
}

function StorageAssetSlot({ tradeSlug, variant }: { tradeSlug: string; variant: "c2" | "c3" }) {
  const urls = getCreativeUrls(tradeSlug);
  const url = urls[variant];

  return (
    <div className="rounded border border-slate-700 bg-slate-800/30 p-2 space-y-2 grayscale hover:grayscale-0 transition-all">
      <div className="flex items-center justify-between">
        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-slate-700 text-slate-400 border border-slate-600">
          STAGED
        </span>
      </div>
      <div className="rounded overflow-hidden border border-slate-700 bg-slate-900 group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`${tradeSlug} ${variant}`}
          className="w-full object-cover aspect-video"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-white/50">{variant.toUpperCase()}</span>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => { void navigator.clipboard.writeText(url); alert("Storage URL copied!"); }}
          className="w-full rounded bg-slate-700 px-1.5 py-1 text-[10px] text-slate-200 hover:bg-slate-600"
        >
          Copy Storage URL
        </button>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const [assetMap, setAssetMap] = useState<AssetMap>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | AssetStatus>("all");
  const [tierFilter, setTierFilter] = useState<"all" | 1 | 2 | 3>("all");
  const [search, setSearch] = useState("");

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

  const activeTrades = useMemo(() => {
    return allTrades.filter((t) => (t.status === "live" || t.status === "upcoming"));
  }, [allTrades]);

  const filteredTrades = useMemo(() => {
    return activeTrades.filter((t) => {
      if (tierFilter !== "all" && t.tier !== tierFilter) return false;
      if (search && !t.domain.includes(search.toLowerCase()) && !t.slug.includes(search.toLowerCase())) return false;
      if (statusFilter === "all") return true;
      for (const type of ASSET_TYPES) {
        const a = assetMap[t.slug]?.[type.key];
        const s = a?.status ?? "pending";
        if (s === statusFilter) return true;
      }
      return false;
    });
  }, [activeTrades, tierFilter, search, statusFilter, assetMap]);

  // Summary counts
  const stats = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let missing = 0;
    for (const t of activeTrades) {
      for (const type of ASSET_TYPES) {
        const a = assetMap[t.slug]?.[type.key];
        if (!a || !a.image_url) { missing++; }
        else if (a.status === "approved") { approved++; }
        else { pending++; }
      }
    }
    return { approved, pending, missing, total: activeTrades.length * ASSET_TYPES.length };
  }, [activeTrades, assetMap]);

  const tiers = [1, 2, 3] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-bold text-white">Trade Asset Staging</h1>
            <p className="mt-1 text-sm text-slate-400">
                Review and approve the 5 core visual blocks per trade.
            </p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={fetchAssets}
                className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
            >
                ↻ Refresh
            </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded border border-slate-700 bg-slate-800/50 p-3">
            <p className="text-xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">DB Slots</p>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/50 p-3">
            <p className="text-xl font-bold text-green-400">{stats.approved}</p>
            <p className="text-xs text-slate-400">Approved</p>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/50 p-3">
            <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-slate-400">Pending</p>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800/50 p-3">
            <p className="text-xl font-bold text-slate-500">{stats.missing}</p>
            <p className="text-xs text-slate-400">Missing</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded border border-slate-700 bg-slate-800/30 p-4">
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Search</span>
            <input
                type="text"
                placeholder="Trade slug/domain…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-400"
            />
        </div>
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
            <div className="flex gap-1">
                {(["all", "approved", "pending", "rejected"] as const).map((s) => (
                    <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded px-3 py-1.5 text-xs capitalize ${statusFilter === s ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                    {s}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-500">Tier</span>
            <div className="flex gap-1">
                {(["all", 1, 2, 3] as const).map((t) => (
                    <button
                    key={t}
                    onClick={() => setTierFilter(t)}
                    className={`rounded px-3 py-1.5 text-xs ${tierFilter === t ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                    {t === "all" ? "All" : `T${t}`}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Trade grid by tier */}
      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        tiers.map((tier) => {
          const tierTrades = filteredTrades.filter((t) => t.tier === tier);
          if (tierTrades.length === 0) return null;
          return (
            <section key={tier} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {TIER_LABEL[tier]}
                </h2>
                <div className="flex-1 border-t border-slate-800" />
              </div>

              <div className="grid gap-6">
                {tierTrades.map((trade) => {
                   const tradeInfo = TRADE_MAP[trade.slug] ?? TRADE_MAP.saw;
                   return (
                    <div key={trade.slug} className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className={`text-lg font-bold ${tradeInfo.color}`}>{tradeInfo.label}</h3>
                                <p className="text-xs text-slate-500">{trade.domain} · {trade.slug}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${trade.status === 'live' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                                    {trade.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {/* DB-backed assets (Hero A, Hero B, OG) */}
                            {ASSET_TYPES.map((type) => (
                                <div key={type.key} className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase px-1">{type.label}</p>
                                    <AssetSlot
                                        tradeSlug={trade.slug}
                                        assetType={type.key}
                                        asset={assetMap[trade.slug]?.[type.key]}
                                        onRefresh={fetchAssets}
                                    />
                                </div>
                            ))}
                            {/* Storage-backed assets (C2, C3) */}
                            {(["c2", "c3"] as const).map((v) => (
                                <div key={v} className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase px-1">{v.toUpperCase()}</p>
                                    <StorageAssetSlot tradeSlug={trade.slug} variant={v} />
                                </div>
                            ))}
                        </div>
                    </div>
                   );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}