"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlatformChip, StatusChip } from "@/components/chips";
import { tradeBadge, TRADE_MAP, tradeFromAd, getCreativeUrls, CREATIVE_LABELS } from "@/lib/trade-utils";
import { AIGeneratePanel } from "@/components/ai-generate-panel";
import { Button, Card, GhostButton } from "@/components/ui";
import type { Ad, AdStatus, AdTemplate, WorkflowStage } from "@/lib/types";

const platformFilters = ["all", "linkedin", "youtube", "facebook", "instagram", "retargeting"] as const;
const statusFilters = ["all", "approved", "pending", "paused", "rejected"] as const;

const emptyAd: Partial<Ad> = {
  platform: "linkedin",
  campaignGroup: "4h_custom",
  format: "static1x1",
  primaryText: "",
  headline: "",
  cta: "Start now",
  landingPath: "/li",
  utmSource: "linkedin",
  utmMedium: "paid-social",
  utmCampaign: "4h_2026-03_custom",
  utmContent: "custom",
  utmTerm: "owners_1-10",
  status: "pending",
  workflowStage: "concept",
};

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [platform, setPlatform] = useState<(typeof platformFilters)[number]>("all");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [startFromTemplate, setStartFromTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [form, setForm] = useState<Partial<Ad>>(emptyAd);
  const [savingCreative, setSavingCreative] = useState<Set<string>>(new Set());

  // Creative edit modal
  interface EditTarget { adId: string; variant: 1|2|3; label: string; storagePath: string; currentUrl: string; }
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenResult, setRegenResult] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);

  function getStoragePath(variant: 1|2|3, prefix: string, imageUrl?: string | null): string {
    if (variant === 1 && imageUrl) {
      const match = imageUrl.match(/\/public\/ad-creatives\/(.+?)(\?|$)/);
      if (match) return match[1];
    }
    if (variant === 2) return `nb2-creatives/${prefix}-c2.jpg`;
    if (variant === 3) return `nb2-creatives/${prefix}-c3.jpg`;
    return `trade-heros/nb2/${prefix}-hero-a.jpg`;
  }

  function openEditModal(ad: Ad, variant: 1|2|3, prefix: string) {
    const urls = getCreativeUrls(prefix, ad.imageUrl ?? ad.image_url);
    const currentUrl = variant === 2 ? urls.c2 : variant === 3 ? urls.c3 : urls.c1;
    const storagePath = getStoragePath(variant, prefix, ad.imageUrl ?? ad.image_url);
    setEditTarget({ adId: ad.id, variant, label: `${prefix} · ${CREATIVE_LABELS[variant]}`, storagePath, currentUrl });
    setEditPrompt("");
    setRegenResult(null);
    setRegenError(null);
  }

  async function regenCreative() {
    if (!editTarget || !editPrompt.trim()) return;
    setRegenLoading(true);
    setRegenError(null);
    setRegenResult(null);
    try {
      const res = await fetch("/api/regen-creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: editTarget.storagePath, prompt: editPrompt.trim(), label: editTarget.label }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) { setRegenError(data.error ?? "Unknown error"); }
      else { setRegenResult(data.url ?? null); }
    } catch (err) {
      setRegenError(String(err));
    }
    setRegenLoading(false);
  }

  function applyRegenResult() {
    if (!regenResult || !editTarget) return;
    // Update local ad image URL so the card reflects the new image immediately
    setAds((prev) => prev.map((a) => {
      if (a.id !== editTarget.adId) return a;
      if (editTarget.variant === 1) return { ...a, imageUrl: regenResult, image_url: regenResult };
      return a; // C2/C3 are URL-constructed from storage, cache-busted by ?t= in the returned URL
    }));
    setEditTarget(null);
  }

  async function setCreativeVariant(adId: string, variant: number) {
    setSavingCreative((prev) => new Set(prev).add(adId));
    setAds((prev) => prev.map((a) => a.id === adId ? { ...a, creative_variant: variant, creativeVariant: variant } : a));
    await fetch(`/api/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creative_variant: variant }),
    });
    setSavingCreative((prev) => { const next = new Set(prev); next.delete(adId); return next; });
  }

  async function loadAds() {
    const res = await fetch("/api/ads", { cache: "no-store" });
    const data = (await res.json()) as Ad[];
    setAds(data);
  }

  async function loadTemplates() {
    const res = await fetch("/api/templates", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as AdTemplate[];
    setTemplates(data);
  }

  useEffect(() => {
    void loadAds();
    void loadTemplates();
  }, []);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ads.filter((ad) => {
      const platformMatch =
        platform === "all"
          ? true
          : platform === "retargeting"
            ? ad.campaignGroup.toLowerCase().includes("retarget")
            : ad.platform === platform;
      const statusMatch = status === "all" ? true : ad.status === status;
      const tradeMatch = tradeFilter === "all" ? true : tradeFromAd(ad) === tradeFilter;
      const searchMatch = !q
        ? true
        : (ad.headline ?? "").toLowerCase().includes(q) ||
          (ad.primaryText ?? "").toLowerCase().includes(q) ||
          (ad.campaignGroup ?? "").toLowerCase().includes(q) ||
          (ad.landingPath ?? "").toLowerCase().includes(q) ||
          (TRADE_MAP[tradeFromAd(ad)]?.domain ?? "").toLowerCase().includes(q);
      return platformMatch && statusMatch && tradeMatch && searchMatch;
    });
  }, [ads, platform, status, search, tradeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [platform, status, search, tradeFilter]);

  async function togglePause(id: string, currentStatus: AdStatus) {
    const next: AdStatus = currentStatus === "paused" ? "pending" : "paused";
    await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    void loadAds();
  }

  async function createAd() {
    await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setStartFromTemplate(false);
    setSelectedTemplateId("");
    setForm(emptyAd);
    void loadAds();
  }

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;

    setForm((prev) => ({
      ...prev,
      platform: template.platform,
      format: template.format ?? prev.format ?? "static1x1",
      headline: template.headline ?? "",
      primaryText: template.primaryText ?? "",
      cta: template.cta ?? "Start now",
      landingPath: template.landingPath || "/li",
      utmCampaign: template.utmCampaign || "4h_2026-03_template",
    }));
  }

  function updateWorkflowStage(workflowStage: WorkflowStage) {
    setForm((f) => ({ ...f, workflowStage }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Ad Library</h1>
        <Button
          onClick={() => {
            setShowModal(true);
            setForm(emptyAd);
          }}
        >
          + New Ad
        </Button>
      </div>

      <Card className="space-y-3">
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
            <option value="all">All trades</option>
            {Object.entries(TRADE_MAP)
              .sort((a, b) => a[1].tier - b[1].tier || a[1].domain.localeCompare(b[1].domain))
              .map(([key, t]) => (
                <option key={key} value={key}>{t.domain}</option>
              ))}
          </select>
          {(search || tradeFilter !== "all") && (
            <GhostButton onClick={() => { setSearch(""); setTradeFilter("all"); }}>
              Clear
            </GhostButton>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{filtered.length} ads</span>
        <div className="flex items-center gap-2">
          <GhostButton disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>← Prev</GhostButton>
          <span>Page {page + 1} / {totalPages || 1}</span>
          <GhostButton disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>Next →</GhostButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {paginated.map((ad) => {
          const utmUrl = `https://saw.city${ad.landingPath}?utm_source=${ad.utmSource}&utm_medium=${ad.utmMedium}&utm_campaign=${ad.utmCampaign}&utm_content=${ad.utmContent}&utm_term=${ad.utmTerm}`;

          return (
            <Card key={ad.id}>
              {(() => {
                const prefix = tradeFromAd(ad);
                const urls = getCreativeUrls(prefix, ad.imageUrl ?? ad.image_url);
                const activeVariant = ad.creative_variant ?? ad.creativeVariant ?? 1;
                const activeUrl = activeVariant === 2 ? urls.c2 : activeVariant === 3 ? urls.c3 : urls.c1;
                const isSaving = savingCreative.has(ad.id);
                return (
                  <>
                    {/* Main creative preview */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeUrl}
                      alt={ad.headline ?? "Ad creative"}
                      className="mb-2 w-full rounded object-cover"
                      style={{ maxHeight: 160 }}
                      loading="lazy"
                    />
                    {/* 3-slot creative picker */}
                    <div className="mb-3 flex gap-1.5">
                      {([1, 2, 3] as const).map((v) => {
                        const thumbUrl = v === 2 ? urls.c2 : v === 3 ? urls.c3 : urls.c1;
                        const isActive = activeVariant === v;
                        return (
                          <div key={v} className="relative flex-1" style={{ height: 40 }}>
                            <button
                              title={CREATIVE_LABELS[v]}
                              disabled={isSaving}
                              onClick={() => setCreativeVariant(ad.id, v)}
                              className={`h-full w-full overflow-hidden rounded border-2 transition-all ${isActive ? "border-blue-400 opacity-100" : "border-slate-700 opacity-50 hover:opacity-80"}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={thumbUrl} alt={`C${v}`} className="h-full w-full object-cover" loading="lazy" />
                              <span className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[9px] font-bold ${isActive ? "bg-blue-500/80 text-white" : "bg-black/50 text-slate-300"}`}>C{v}</span>
                            </button>
                            {/* Pencil edit button */}
                            <button
                              title={`Edit C${v} with prompt`}
                              onClick={(e) => { e.stopPropagation(); openEditModal(ad, v as 1|2|3, prefix); }}
                              className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/70 text-[9px] text-white hover:bg-blue-600/90 transition-colors"
                            >✏️</button>
                          </div>
                        );
                      })}
                    </div>
                    {isSaving && <p className="mb-1 text-center text-xs text-slate-400">Saving…</p>}
                  </>
                );
              })()}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <PlatformChip platform={ad.platform} />
                {(() => { const t = tradeBadge(ad); return (
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${t.bg} ${t.color}`}>{t.domain}</span>
                ); })()}
                <span className="ml-auto rounded bg-slate-700 px-2 py-1 text-xs">{ad.format}</span>
              </div>
              <p className="mb-2 font-semibold">{ad.headline || "(No headline)"}</p>
              <p className="line-clamp-3 text-sm text-slate-300">{ad.primaryText}</p>
              <p className="mt-2 text-xs text-slate-400">CTA: {ad.cta}</p>
              <p className="text-xs text-slate-400">UTM: {ad.utmCampaign}</p>
              <p className="mb-3 text-xs text-slate-400">Workflow: {ad.workflowStage}</p>
              <StatusChip status={ad.status} className="mb-3" />
              <div className="flex flex-wrap gap-2">
                <Link className="rounded-md border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700" href={`/ads/${ad.id}`}>
                  Edit
                </Link>
                <GhostButton onClick={() => togglePause(ad.id, ad.status)}>
                  {ad.status === "paused" ? "Unpause" : "Pause"}
                </GhostButton>
                <GhostButton
                  onClick={() => {
                    navigator.clipboard.writeText(utmUrl).catch(() => null);
                  }}
                >
                  Copy UTM
                </GhostButton>
              </div>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2 text-sm text-slate-400">
          <GhostButton disabled={page === 0} onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo(0,0); }}>← Prev</GhostButton>
          <span>Page {page + 1} / {totalPages}</span>
          <GhostButton disabled={page >= totalPages - 1} onClick={() => { setPage((p) => Math.min(totalPages - 1, p + 1)); window.scrollTo(0,0); }}>Next →</GhostButton>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-bold">New Ad</h2>

            <div className="mb-4 flex gap-2">
              <GhostButton className={!startFromTemplate ? "bg-slate-700" : ""} onClick={() => setStartFromTemplate(false)}>
                Manual
              </GhostButton>
              <GhostButton className={startFromTemplate ? "bg-slate-700" : ""} onClick={() => setStartFromTemplate(true)}>
                Start from Template
              </GhostButton>
            </div>

            {startFromTemplate && (
              <label className="mb-4 block text-sm">
                Template
                <select
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                >
                  <option value="">Choose a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.platform})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Platform
                <select
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as Ad["platform"] }))}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </label>
              <label className="text-sm">
                Headline
                <input
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  value={form.headline ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                />
              </label>
              <label className="text-sm md:col-span-2">
                Primary text
                <textarea
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  rows={4}
                  value={form.primaryText}
                  onChange={(e) => setForm((f) => ({ ...f, primaryText: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                CTA
                <input
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  value={form.cta}
                  onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                Landing path
                <input
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  value={form.landingPath}
                  onChange={(e) => setForm((f) => ({ ...f, landingPath: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                Workflow stage
                <select
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                  value={form.workflowStage}
                  onChange={(e) => updateWorkflowStage(e.target.value as WorkflowStage)}
                >
                  <option value="concept">Concept</option>
                  <option value="copy-ready">Copy Ready</option>
                  <option value="approved">Approved</option>
                  <option value="creative-brief">Creative Brief</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="live">Live</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <AIGeneratePanel
                platform={(form.platform as Ad["platform"]) ?? "linkedin"}
                onUseVariation={(variation) =>
                  setForm((f) => ({
                    ...f,
                    headline: variation.headline,
                    primaryText: variation.primaryText,
                  }))
                }
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <GhostButton onClick={() => setShowModal(false)}>Cancel</GhostButton>
              <Button onClick={createAd}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Creative Edit Modal ─────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Edit Creative</h2>
                <p className="text-xs text-slate-400">{editTarget.label}</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
            </div>

            {/* Current / result image */}
            <div className="mb-4 overflow-hidden rounded-lg border border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={regenResult ?? editTarget.currentUrl}
                alt="Creative preview"
                className="w-full object-cover"
                style={{ maxHeight: 240 }}
              />
              {regenResult && (
                <div className="bg-green-900/30 px-3 py-1.5 text-center text-xs text-green-400">
                  ✅ New image generated — looks good? Hit "Use This" to save.
                </div>
              )}
            </div>

            {/* Prompt input */}
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Describe the image you want
            </label>
            <p className="mb-2 text-xs text-slate-500">
              Tip: describe the full scene you want, or describe the fix (e.g. "painter on a ladder brushing the siding — window glass is clean, no paint on the glass panes")
            </p>
            <textarea
              rows={3}
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g. Painter on extension ladder brushing the exterior siding — window glass is clean and unpainted, clean brush stroke detail..."
              className="mb-3 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />

            {regenError && (
              <p className="mb-3 rounded border border-red-700 bg-red-900/30 px-3 py-2 text-xs text-red-400">
                ❌ {regenError}
              </p>
            )}

            <div className="flex gap-2">
              <GhostButton onClick={() => setEditTarget(null)}>Cancel</GhostButton>
              <GhostButton
                onClick={regenCreative}
                disabled={regenLoading || !editPrompt.trim()}
              >
                {regenLoading ? "Generating…" : regenResult ? "Regenerate Again" : "🎨 Generate"}
              </GhostButton>
              {regenResult && (
                <Button onClick={applyRegenResult}>✅ Use This</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
