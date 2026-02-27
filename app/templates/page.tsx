"use client";

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import type { AdTemplate } from "@/lib/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ad Templates</h1>
        <p className="text-sm text-slate-400">{templates.length} saved</p>
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
