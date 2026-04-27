"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Templates load internal dashboard data after mount. */

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { buildContentBriefPacket, CONTENT_BRIEF_TEMPLATES, type ContentBriefTemplateId } from "@/lib/content-brief-templates";
import type { AdTemplate } from "@/lib/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [copiedBrief, setCopiedBrief] = useState<ContentBriefTemplateId | null>(null);
  const [copyFallback, setCopyFallback] = useState("");

  async function loadTemplates() {
    const res = await fetch("/api/templates", { cache: "no-store" });
    const data = (await res.json()) as AdTemplate[];
    setTemplates(data);
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function createAdFromTemplate(template: AdTemplate) {
    setBusyId(template.id);
    await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: template.platform,
        format: template.format ?? "static1x1",
        headline: template.headline ?? "",
        primaryText: template.primaryText,
        cta: template.cta ?? "Start now",
        landingPath: template.landingPath || "/li",
        utmCampaign: template.utmCampaign || "4h_2026-03_template",
      }),
    });
    setBusyId(null);
  }

  async function deleteTemplate(id: string) {
    if (!window.confirm("Delete this template?")) return;
    setBusyId(id);
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    await loadTemplates();
    setBusyId(null);
  }

  async function copyContentBrief(id: ContentBriefTemplateId) {
    const template = CONTENT_BRIEF_TEMPLATES.find((brief) => brief.id === id);
    if (!template) return;
    const packet = buildContentBriefPacket(template, trackingUrl);
    try {
      await navigator.clipboard.writeText(packet);
      setCopiedBrief(id);
      setCopyFallback("");
    } catch {
      setCopiedBrief(null);
      setCopyFallback(packet);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Brief Templates</h1>
          <p className="mt-1 text-sm text-slate-400">
            Creator-ready internal briefs for demo-call videos, founder assists, and screenshot-proof assets.
          </p>
        </div>
        <p className="text-sm text-slate-400">{CONTENT_BRIEF_TEMPLATES.length} creator briefs · {templates.length} ad templates</p>
      </div>

      <Card className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Creator tracking URL</h2>
          <p className="text-sm text-slate-500">
            Paste a creator URL from `/influencer` before copying a packet. Leaving this blank keeps the packet as guidance only.
          </p>
        </div>
        <input
          type="url"
          value={trackingUrl}
          onChange={(event) => setTrackingUrl(event.target.value)}
          placeholder="https://pipe.city/?utm_source=youtube&utm_medium=creator..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        {copyFallback ? (
          <textarea
            readOnly
            rows={8}
            value={copyFallback}
            className="w-full rounded-lg border border-amber-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none"
          />
        ) : null}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {CONTENT_BRIEF_TEMPLATES.map((template) => (
          <Card key={template.id} className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-white">{template.title}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{template.format}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Hook</p>
              <p className="mt-1 text-sm text-slate-200">{template.hook}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Shot list</p>
              <ol className="mt-2 space-y-1 text-sm text-slate-300">
                {template.shotList.map((shot, index) => (
                  <li key={shot}>
                    {index + 1}. {shot}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">CTA and offer</p>
              <p className="mt-1 text-sm text-slate-200">{template.cta}</p>
              <p className="text-sm font-semibold text-emerald-300">{template.offer}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Tracking</p>
              <p className="mt-1 text-sm text-slate-400">{template.trackingGuidance}</p>
            </div>
            <GhostButton onClick={() => void copyContentBrief(template.id)}>
              {copiedBrief === template.id ? "Copied packet" : "Copy packet"}
            </GhostButton>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Legacy ad templates</h2>
          <p className="text-sm text-slate-500">Saved ad templates remain here for archive and reuse.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="space-y-3">
            <div>
              <p className="text-lg font-semibold">{template.name}</p>
              <p className="text-xs uppercase text-slate-400">{template.platform}</p>
            </div>
            <p className="line-clamp-3 text-sm text-slate-300">{template.primaryText || "No primary text"}</p>
            <p className="text-sm font-semibold">{template.headline || "(No headline)"}</p>
            <div className="flex gap-2">
              <Button disabled={busyId === template.id} onClick={() => createAdFromTemplate(template)}>
                Create Ad from Template
              </Button>
              <GhostButton disabled={busyId === template.id} onClick={() => deleteTemplate(template.id)}>
                Delete
              </GhostButton>
            </div>
          </Card>
        ))}
      </div>

      {!templates.length && <Card>No templates saved yet. Save one from an ad detail page.</Card>}
    </div>
  );
}
