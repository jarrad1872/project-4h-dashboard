"use client";

import { useEffect, useState, useMemo } from "react";
import { getProjectState } from "@/lib/project-state-data";
import { TRADE_MAP, getCreativeUrls } from "@/lib/trade-utils";

interface TradeAsset {
  id: string;
  trade_slug: string;
  asset_type: "hero_a" | "hero_b" | "og_nb2";
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
}

const ASSET_LABELS: Record<string, string> = {
  hero_a: "Hero A — Hands-on Zoom",
  hero_b: "Hero B — Wide Layout",
  og_nb2: "OG NB2 — Social Preview",
  c2: "C2 — Company Overview",
  c3: "C3 — On-site Action",
};

function AssetCard({ url, type, label }: { url: string; type: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border border-slate-700 bg-slate-800 overflow-hidden shadow-lg transition-all hover:border-slate-500">
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400/0f172a/64748b?text=Not+Found"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white border border-white/10">
                {type.toUpperCase()}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={copy}
                    className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                >
                    {copied ? "COPIED" : "URL"}
                </button>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                >
                    OPEN
                </a>
            </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-slate-300 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function CreativesPage() {
  const [assets, setAssets] = useState<TradeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const state = getProjectState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTrades: any[] = (state.campaign as any).all_trades ?? [];

  useEffect(() => {
    fetch("/api/trade-assets", { cache: "no-store" })
      .then(r => r.json())
      .then((data: TradeAsset[]) => {
        setAssets(data.filter(a => a.status === "approved"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const approvedMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const a of assets) {
      if (!map[a.trade_slug]) map[a.trade_slug] = {};
      if (a.image_url) map[a.trade_slug][a.asset_type] = a.image_url;
    }
    return map;
  }, [assets]);

  const activeTrades = allTrades.filter(t => t.status === "live" || t.status === "upcoming");

  const filtered = activeTrades.filter(t => {
    if (filter !== "all" && String(t.tier) !== filter) return false;
    if (search && !t.domain.includes(search.toLowerCase()) && !t.slug.includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading master gallery…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="max-w-xl">
          <h1 className="text-4xl font-black text-white tracking-tight">The Gallery</h1>
          <p className="mt-3 text-lg text-slate-400 leading-relaxed">
            Behold the visual architecture of the 4H Campaign. Master assets for all 65 trades, verified and ready for deployment.
          </p>
        </div>
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-500">Tier Filter</span>
                <div className="flex gap-1">
                    {(["all", "1", "2", "3"] as const).map((t) => (
                        <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
                            filter === t
                            ? "bg-white text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                        }`}
                        >
                        {t === "all" ? "All Tiers" : `Tier ${t}`}
                        </button>
                    ))}
                </div>
           </div>
           <div className="relative">
                <input
                    type="text"
                    placeholder="Search by trade name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-full border border-slate-700 bg-slate-900 pl-10 pr-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
                <span className="absolute left-3.5 top-2.5 text-slate-500">🔍</span>
           </div>
        </div>
      </div>

      {/* Trade Sections */}
      <div className="space-y-16">
        {filtered.length === 0 ? (
           <div className="py-20 text-center text-slate-500">No trades match your search.</div>
        ) : (
          filtered.map((trade) => {
            const tradeInfo = TRADE_MAP[trade.slug] ?? TRADE_MAP.saw;
            const urls = getCreativeUrls(trade.slug);
            const masterAssets = [
                { type: "hero_a", url: approvedMap[trade.slug]?.hero_a || urls.c1, label: ASSET_LABELS.hero_a },
                { type: "hero_b", url: approvedMap[trade.slug]?.hero_b || `https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/${trade.slug}-hero-b.jpg`, label: ASSET_LABELS.hero_b },
                { type: "og_nb2", url: approvedMap[trade.slug]?.og_nb2 || `https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/${trade.slug}-og-nb2.jpg`, label: ASSET_LABELS.og_nb2 },
                { type: "c2", url: urls.c2, label: ASSET_LABELS.c2 },
                { type: "c3", url: urls.c3, label: ASSET_LABELS.c3 },
            ];

            return (
              <section key={trade.slug} className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <h2 className={`text-2xl font-black ${tradeInfo.color}`}>{tradeInfo.label}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${tradeInfo.bg} ${tradeInfo.color} border border-white/5`}>
                                    T{trade.tier}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">{trade.domain}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const urlsToOpen = masterAssets.map(a => a.url);
                                urlsToOpen.forEach(url => window.open(url, '_blank'));
                            }}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all shadow-sm"
                        >
                            Open All Assets
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {masterAssets.map((asset) => (
                        <AssetCard
                            key={asset.type}
                            type={asset.type}
                            url={asset.url}
                            label={asset.label}
                        />
                    ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Footer Footer */}
      <div className="pt-20 pb-10 border-t border-slate-800 text-center">
         <p className="text-sm text-slate-500 font-medium">Project 4H Master Asset Repository — March 2026</p>
      </div>
    </div>
  );
}