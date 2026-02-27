"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AIGeneratePanel } from "@/components/ai-generate-panel";
import { AdPreview } from "@/components/ad-preview";
import { Button, Card, GhostButton } from "@/components/ui";
import { PlatformChip, StatusChip } from "@/components/chips";
import type { Ad, AdStatus, WorkflowStage } from "@/lib/types";

export default function AdDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [ad, setAd] = useState<Ad | null>(null);
  const [form, setForm] = useState<Partial<Ad>>({});
  const [savingTemplate, setSavingTemplate] = useState(false);

  async function loadAd() {
    const res = await fetch(`/api/ads/${id}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as Ad;
    setAd(data);
    setForm(data);
  }

  useEffect(() => {
    if (id) void loadAd();
  }, [id]);

  async function save() {
    await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    void loadAd();
  }

  async function setStatus(status: AdStatus) {
    if (!window.confirm(`Set ad status to ${status}?`)) return;
    await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void loadAd();
  }

  async function saveAsTemplate() {
    const name = window.prompt("Template name");
    if (!name) return;

    setSavingTemplate(true);
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        platform: form.platform,
        format: form.format,
        primaryText: form.primaryText,
        headline: form.headline,
        cta: form.cta,
        landingPath: form.landingPath,
        utmCampaign: form.utmCampaign,
      }),
    });
    setSavingTemplate(false);
  }

  if (!ad) {
    return <p className="text-sm text-slate-400">Loading ad…</p>;
  }

  const headline = form.headline ?? "";
  const primaryText = form.primaryText ?? "";
  const cta = form.cta ?? "Start now";
  const workflowStage = (form.workflowStage ?? "concept") as WorkflowStage;

  const utmUrl = `https://saw.city${form.landingPath ?? ad.landingPath}?utm_source=${form.utmSource ?? ad.utmSource}&utm_medium=${form.utmMedium ?? ad.utmMedium}&utm_campaign=${form.utmCampaign ?? ad.utmCampaign}&utm_content=${form.utmContent ?? ad.utmContent}&utm_term=${form.utmTerm ?? ad.utmTerm}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Ad Detail — {ad.id}</h1>
        <div className="flex gap-2">
          <GhostButton onClick={() => router.push("/ads")}>Back to Ads</GhostButton>
          <Button disabled={savingTemplate} onClick={saveAsTemplate}>
            {savingTemplate ? "Saving..." : "Save as Template"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformChip platform={(form.platform as Ad["platform"]) ?? ad.platform} />
            <StatusChip status={(form.status as AdStatus) ?? ad.status} />
            <span className="rounded bg-slate-700 px-2 py-1 text-xs">{form.format ?? ad.format}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Headline
              <input
                className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                value={headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              />
            </label>

            <label className="text-sm">
              CTA
              <input
                className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                value={cta}
                onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
              />
            </label>

            <label className="text-sm">
              Status
              <select
                className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                value={form.status ?? ad.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdStatus }))}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <label className="text-sm">
              Workflow Stage
              <select
                className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                value={workflowStage}
                onChange={(e) => setForm((f) => ({ ...f, workflowStage: e.target.value as WorkflowStage }))}
              >
                <option value="concept">Concept</option>
                <option value="copy-ready">Copy Ready</option>
                <option value="approved">Approved</option>
                <option value="creative-brief">Creative Brief</option>
                <option value="uploaded">Uploaded</option>
                <option value="live">Live</option>
              </select>
            </label>

            <label className="text-sm md:col-span-2">
              Primary text
              <textarea
                rows={5}
                className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
                value={primaryText}
                onChange={(e) => setForm((f) => ({ ...f, primaryText: e.target.value }))}
              />
            </label>
          </div>

          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <p className="mb-1 text-xs text-slate-400">Full UTM URL</p>
            <p className="break-all text-sm">{utmUrl}</p>
            <GhostButton
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(utmUrl).catch(() => null);
              }}
            >
              Copy URL
            </GhostButton>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>Save Changes</Button>
            <GhostButton onClick={() => setStatus("approved")}>Approve</GhostButton>
            <GhostButton onClick={() => setStatus("paused")}>Pause</GhostButton>
            <GhostButton className="border-red-500 text-red-400 hover:bg-red-900/40" onClick={() => setStatus("rejected")}>
              Reject
            </GhostButton>
          </div>

          <AIGeneratePanel
            platform={(form.platform as Ad["platform"]) ?? ad.platform}
            onUseVariation={(variation) =>
              setForm((f) => ({
                ...f,
                headline: variation.headline,
                primaryText: variation.primaryText,
              }))
            }
          />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Platform Preview</h2>
          <AdPreview
            platform={(form.platform as Ad["platform"]) ?? ad.platform}
            headline={headline}
            primaryText={primaryText}
            cta={cta}
          />

          <div>
            <h3 className="mb-2 text-sm font-semibold">Status History</h3>
            <ul className="space-y-2 text-sm">
              {(ad.statusHistory ?? []).map((entry, idx) => (
                <li key={`${entry.at}-${idx}`} className="rounded border border-slate-700 p-2">
                  <div className="flex items-center justify-between">
                    <StatusChip status={entry.status} />
                    <span className="text-xs text-slate-400">{new Date(entry.at).toLocaleString()}</span>
                  </div>
                  {entry.note && <p className="mt-1 text-slate-300">{entry.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
