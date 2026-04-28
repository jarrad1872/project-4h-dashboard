"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Ads archive loads API rows after mount and resets pagination when filters change. */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlatformChip, StatusChip } from "@/components/chips";
import { LegacyRouteBanner } from "@/components/route-disposition-banner";
import { AdPreviewModal } from "@/components/ad-preview-modal";
import { Card, GhostButton } from "@/components/ui";
import { getAdArchiveState, summarizeAdArchive } from "@/lib/ad-archive";
import { CREATIVE_LABELS, getCreativeUrls, TRADE_MAP, tradeBadge, tradeFromAd } from "@/lib/trade-utils";
import type { Ad } from "@/lib/types";

export const dynamic = "force-dynamic";

const platformFilters = ["all", "linkedin", "youtube", "facebook", "instagram", "retargeting"] as const;
const statusFilters = ["all", "approved", "pending", "paused", "rejected"] as const;
const archiveFilters = ["historical", "current", "all"] as const;
const PAGE_SIZE = 30;

function isPlatformFilter(value: string): value is (typeof platformFilters)[number] {
  return platformFilters.includes(value as (typeof platformFilters)[number]);
}

function AdsContent() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<(typeof platformFilters)[number]>(() => {
    const p = searchParams.get("platform") ?? "all";
    return isPlatformFilter(p) ? p : "all";
  });
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [archiveFilter, setArchiveFilter] = useState<(typeof archiveFilters)[number]>("historical");
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [copiedAdId, setCopiedAdId] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<{
    imageUrl: string;
    headline: string;
    domain: string;
    cta?: string;
    primaryText?: string;
  } | null>(null);

  async function loadAds() {
    setLoading(true);
    const res = await fetch("/api/ads", { cache: "no-store" });
    const data = (await res.json()) as Ad[];
    setAds(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    void loadAds();
  }, []);

  const archiveSummary = useMemo(() => summarizeAdArchive(ads), [ads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return ads.filter((ad) => {
      const archiveState = getAdArchiveState(ad);
      const platformMatch =
        platform === "all"
          ? true
          : platform === "retargeting"
            ? ad.campaignGroup.toLowerCase().includes("retarget")
            : ad.platform === platform;
      const statusMatch = status === "all" ? true : ad.status === status;
      const archiveMatch = archiveFilter === "all" ? true : archiveState.bucket === archiveFilter;
      const tradeMatch = tradeFilter === "all" ? true : tradeFromAd(ad) === tradeFilter;
      const searchMatch = !q
        ? true
        : (ad.headline ?? "").toLowerCase().includes(q) ||
          (ad.primaryText ?? "").toLowerCase().includes(q) ||
          (ad.campaignGroup ?? "").toLowerCase().includes(q) ||
          (ad.landingPath ?? "").toLowerCase().includes(q) ||
          (TRADE_MAP[tradeFromAd(ad)]?.domain ?? "").toLowerCase().includes(q);

      return platformMatch && statusMatch && archiveMatch && tradeMatch && searchMatch;
    });
  }, [ads, archiveFilter, platform, status, search, tradeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [archiveFilter, platform, status, search, tradeFilter]);

  function adUtmUrl(ad: Ad) {
    return `https://saw.city${ad.landingPath}?utm_source=${ad.utmSource}&utm_medium=${ad.utmMedium}&utm_campaign=${ad.utmCampaign}&utm_content=${ad.utmContent}&utm_term=${ad.utmTerm}`;
  }

  async function copyUtm(ad: Ad) {
    await navigator.clipboard.writeText(adUtmUrl(ad)).catch(() => null);
    setCopiedAdId(ad.id);
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading ad archive...</div>;
  }

  return (
    <div className="space-y-6">
      <LegacyRouteBanner route="/ads" />

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Read-only reference</p>
          <h1 className="mt-1 text-2xl font-bold">Ad Archive</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Historical ads stay readable for audit, copy review, UTM lookup, and preview. Current-candidate creation,
            editing, pause/unpause, and creative regeneration have moved out of this route.
          </p>
        </div>
        <span className="rounded-md border border-amber-700/60 bg-amber-950/30 px-3 py-2 text-sm font-semibold text-amber-200">
          Archive-only
        </span>
      </div>

      <Card className="border-amber-800/60 bg-amber-950/20" data-testid="ad-archive-readonly-guard">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">No mutable ad actions</p>
            <h2 className="mt-1 text-xl font-black text-white">{archiveSummary.historical} legacy ads labeled</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-300">
              This page does not create ads, edit ads, pause campaigns, regenerate creatives, upload to ad platforms,
              launch campaigns, create webhooks, spend money, or change billing.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 sm:min-w-80">
            <div className="rounded border border-slate-700 bg-slate-950 px-3 py-2">
              <p className="text-lg font-bold text-white">{archiveSummary.total}</p>
              <p>Total</p>
            </div>
            <div className="rounded border border-emerald-800/60 bg-emerald-950/30 px-3 py-2">
              <p className="text-lg font-bold text-emerald-200">{archiveSummary.current}</p>
              <p>Current</p>
            </div>
            <div className="rounded border border-amber-800/60 bg-amber-950/30 px-3 py-2">
              <p className="text-lg font-bold text-amber-200">{archiveSummary.historical}</p>
              <p>Archived</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {archiveFilters.map((value) => (
            <GhostButton
              key={value}
              className={archiveFilter === value ? "bg-slate-700" : ""}
              onClick={() => setArchiveFilter(value)}
            >
              {value === "current" ? "Current references" : value === "historical" ? "Historical archive" : "All ads"}
            </GhostButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {platformFilters.map((value) => (
            <GhostButton
              key={value}
              className={platform === value ? "bg-slate-700" : ""}
              onClick={() => setPlatform(value)}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </GhostButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((value) => (
            <GhostButton key={value} className={status === value ? "bg-slate-700" : ""} onClick={() => setStatus(value)}>
              {value[0].toUpperCase() + value.slice(1)}
            </GhostButton>
          ))}
        </div>
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
            <option value="all">All trades</option>
            {Object.entries(TRADE_MAP)
              .sort((a, b) => a[1].tier - b[1].tier || a[1].domain.localeCompare(b[1].domain))
              .map(([key, trade]) => (
                <option key={key} value={key}>
                  {trade.domain}
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
      </Card>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {filtered.length} ads shown -{" "}
          {archiveFilter === "current"
            ? "current-reference rows"
            : archiveFilter === "historical"
              ? "archive reference view"
              : "all rows visible"}
        </span>
        <div className="flex items-center gap-2">
          <GhostButton disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Prev
          </GhostButton>
          <span>
            Page {page + 1} / {totalPages || 1}
          </span>
          <GhostButton disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
            Next
          </GhostButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {paginated.map((ad) => {
          const archiveState = getAdArchiveState(ad);
          const adPrefix = tradeFromAd(ad);
          const adUrls = getCreativeUrls(adPrefix, ad.imageUrl ?? ad.image_url);
          const adVariant = ad.creative_variant ?? ad.creativeVariant ?? 1;
          const adActiveUrl = adVariant === 2 ? adUrls.c2 : adVariant === 3 ? adUrls.c3 : adUrls.c1;
          const adDomain = tradeBadge(ad).domain;

          return (
            <Card key={ad.id} className={archiveState.bucket === "historical" ? "border-amber-900/70 bg-slate-900/70" : ""}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={adActiveUrl}
                alt={ad.headline ?? "Ad creative"}
                className="mb-2 w-full rounded object-cover"
                style={{ maxHeight: 160 }}
                loading="lazy"
              />
              <div className="mb-3 grid grid-cols-3 gap-1.5">
                {([1, 2, 3] as const).map((variant) => {
                  const thumbUrl = variant === 2 ? adUrls.c2 : variant === 3 ? adUrls.c3 : adUrls.c1;
                  const isActive = adVariant === variant;

                  return (
                    <div
                      key={variant}
                      className={`relative h-10 overflow-hidden rounded border-2 ${
                        isActive ? "border-blue-400 opacity-100" : "border-slate-700 opacity-60"
                      }`}
                      title={`${CREATIVE_LABELS[variant]} reference only`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbUrl} alt={`C${variant}`} className="h-full w-full object-cover" loading="lazy" />
                      <span
                        className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[9px] font-bold ${
                          isActive ? "bg-blue-500/80 text-white" : "bg-black/50 text-slate-300"
                        }`}
                      >
                        C{variant}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <PlatformChip platform={ad.platform} />
                {(() => {
                  const trade = tradeBadge(ad);
                  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${trade.bg} ${trade.color}`}>{trade.domain}</span>;
                })()}
                <span className="ml-auto rounded bg-slate-700 px-2 py-1 text-xs">{ad.format}</span>
              </div>
              <div
                className={`mb-3 rounded border px-3 py-2 text-xs ${
                  archiveState.bucket === "historical"
                    ? "border-amber-800/60 bg-amber-950/25 text-amber-100"
                    : "border-emerald-800/60 bg-emerald-950/20 text-emerald-100"
                }`}
              >
                <p className="font-semibold">{archiveState.label}</p>
                <p className="mt-1 text-slate-300">{archiveState.guidance}</p>
                {archiveState.bucket === "historical" && <p className="mt-1 text-amber-200">Archive signal: {archiveState.reason}</p>}
              </div>
              <p className="mb-2 font-semibold">{ad.headline || "(No headline)"}</p>
              <p className="line-clamp-3 text-sm text-slate-300">{ad.primaryText}</p>
              <p className="mt-2 text-xs text-slate-400">CTA: {ad.cta}</p>
              <p className="text-xs text-slate-400">UTM: {ad.utmCampaign}</p>
              <p className="mb-3 text-xs text-slate-400">Workflow: {ad.workflowStage}</p>
              <StatusChip status={ad.status} className="mb-3" />
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300">
                  Read-only reference
                </span>
                <GhostButton onClick={() => void copyUtm(ad)}>{copiedAdId === ad.id ? "Copied" : "Copy UTM"}</GhostButton>
                <GhostButton
                  className="border-orange-500/60 text-orange-400 hover:bg-orange-900/30"
                  onClick={() =>
                    setPreviewAd({
                      imageUrl: adActiveUrl,
                      headline: ad.headline ?? ad.primaryText?.slice(0, 60) ?? "",
                      domain: adDomain,
                      cta: ad.cta ?? undefined,
                      primaryText: ad.primaryText ?? ad.primary_text ?? undefined,
                    })
                  }
                >
                  Preview Ad
                </GhostButton>
              </div>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2 text-sm text-slate-400">
          <GhostButton
            disabled={page === 0}
            onClick={() => {
              setPage((p) => Math.max(0, p - 1));
              window.scrollTo(0, 0);
            }}
          >
            Prev
          </GhostButton>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <GhostButton
            disabled={page >= totalPages - 1}
            onClick={() => {
              setPage((p) => Math.min(totalPages - 1, p + 1));
              window.scrollTo(0, 0);
            }}
          >
            Next
          </GhostButton>
        </div>
      )}

      {previewAd && (
        <AdPreviewModal
          imageUrl={previewAd.imageUrl}
          headline={previewAd.headline}
          domain={previewAd.domain}
          cta={previewAd.cta}
          primaryText={previewAd.primaryText}
          onClose={() => setPreviewAd(null)}
        />
      )}
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center text-slate-400">Loading ad archive...</div>}>
      <AdsContent />
    </Suspense>
  );
}
