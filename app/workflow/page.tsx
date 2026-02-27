"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { PlatformChip } from "@/components/chips";
import type { Ad, WorkflowStage } from "@/lib/types";

const stages: Array<{ key: WorkflowStage; label: string }> = [
  { key: "concept", label: "Concept" },
  { key: "copy-ready", label: "Copy Ready" },
  { key: "approved", label: "Approved" },
  { key: "creative-brief", label: "Creative Brief" },
  { key: "uploaded", label: "Uploaded" },
  { key: "live", label: "Live" },
];

export default function WorkflowPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadAds() {
    const res = await fetch("/api/ads", { cache: "no-store" });
    const data = (await res.json()) as Ad[];
    setAds(data);
  }

  useEffect(() => {
    void loadAds();
  }, []);

  async function moveAd(id: string, workflowStage: WorkflowStage) {
    setSavingId(id);
    await fetch(`/api/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowStage }),
    });
    await loadAds();
    setSavingId(null);
  }

  const grouped = useMemo(() => {
    return stages.reduce<Record<WorkflowStage, Ad[]>>((acc, stage) => {
      acc[stage.key] = ads.filter((ad) => ad.workflowStage === stage.key);
      return acc;
    }, {
      concept: [],
      "copy-ready": [],
      approved: [],
      "creative-brief": [],
      uploaded: [],
      live: [],
    });
  }, [ads]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflow Pipeline</h1>
        <p className="text-sm text-slate-400">{ads.length} ads</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-6 md:grid-cols-2">
        {stages.map((stage) => (
          <Card key={stage.key} className="space-y-3 bg-slate-850">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">{stage.label}</h2>
              <span className="rounded bg-slate-700 px-2 py-1 text-xs">{grouped[stage.key].length}</span>
            </div>

            <div className="space-y-2">
              {grouped[stage.key].map((ad) => (
                <div key={ad.id} className="rounded border border-slate-700 bg-slate-900 p-2">
                  <p className="line-clamp-2 text-sm font-semibold">{ad.headline || "(No headline)"}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <PlatformChip platform={ad.platform} />
                    <select
                      className="max-w-[130px] rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs"
                      value={ad.workflowStage}
                      disabled={savingId === ad.id}
                      onChange={(e) => moveAd(ad.id, e.target.value as WorkflowStage)}
                    >
                      {stages.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
