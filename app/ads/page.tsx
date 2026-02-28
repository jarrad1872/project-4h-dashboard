"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlatformChip, StatusChip } from "@/components/chips";
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
  const [showModal, setShowModal] = useState(false);
  const [startFromTemplate, setStartFromTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [form, setForm] = useState<Partial<Ad>>(emptyAd);

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

  const filtered = useMemo(() => {
    return ads.filter((ad) => {
      const platformMatch =
        platform === "all"
          ? true
          : platform === "retargeting"
            ? ad.campaignGroup.toLowerCase().includes("retarget")
            : ad.platform === platform;
      const statusMatch = status === "all" ? true : ad.status === status;
      return platformMatch && statusMatch;
    });
  }, [ads, platform, status]);

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
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {filtered.map((ad) => {
          const utmUrl = `https://saw.city${ad.landingPath}?utm_source=${ad.utmSource}&utm_medium=${ad.utmMedium}&utm_campaign=${ad.utmCampaign}&utm_content=${ad.utmContent}&utm_term=${ad.utmTerm}`;

          return (
            <Card key={ad.id}>
              {(ad.imageUrl ?? ad.image_url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ad.imageUrl ?? ad.image_url ?? ""}
                  alt={ad.headline ?? "Ad creative"}
                  className="mb-3 w-full rounded object-cover"
                  style={{ maxHeight: 180 }}
                />
              )}
              <div className="mb-3 flex items-center justify-between gap-2">
                <PlatformChip platform={ad.platform} />
                <span className="rounded bg-slate-700 px-2 py-1 text-xs">{ad.format}</span>
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
    </div>
  );
}
