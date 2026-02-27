"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import { PlatformChip } from "@/components/chips";
import type { CampaignStatusData, LaunchChecklistItem } from "@/lib/types";

export default function LaunchPage() {
  const [items, setItems] = useState<LaunchChecklistItem[]>([]);
  const [status, setStatus] = useState<CampaignStatusData | null>(null);

  async function load() {
    const [checkRes, statusRes] = await Promise.all([
      fetch("/api/launch-checklist", { cache: "no-store" }),
      fetch("/api/campaign-status", { cache: "no-store" }),
    ]);

    setItems((await checkRes.json()) as LaunchChecklistItem[]);
    setStatus((await statusRes.json()) as CampaignStatusData);
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(id: string, checked: boolean) {
    await fetch("/api/launch-checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, checked: !checked }),
    });
    void load();
  }

  async function markAllReady() {
    await fetch("/api/launch-checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    void load();
  }

  async function goLive() {
    await fetch("/api/campaign-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "live",
        startDate: new Date().toISOString(),
        linkedinStatus: "live",
        youtubeStatus: "live",
        facebookStatus: "live",
        instagramStatus: "live",
      }),
    });
    void load();
  }

  const grouped = useMemo(() => {
    return {
      linkedin: items.filter((item) => item.platform === "linkedin"),
      meta: items.filter((item) => item.platform === "meta"),
      youtube: items.filter((item) => item.platform === "youtube"),
      tracking: items.filter((item) => item.platform === "tracking"),
      all: items.filter((item) => item.platform === "all"),
    };
  }, [items]);

  const complete = items.filter((item) => item.checked).length;
  const allChecked = items.length > 0 && complete === items.length;
  const readyToGo = allChecked && status?.status === "pre-launch";

  if (!status) {
    return <p className="text-sm text-slate-400">Loading launch gate…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Gate</h1>

      <Card>
        <p className="text-lg font-semibold">
          Overall readiness: {complete} / {items.length} complete — {allChecked ? "READY TO LAUNCH" : "NOT READY"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={markAllReady}>Mark All Ready</Button>
          <Button
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            disabled={!readyToGo}
            onClick={goLive}
          >
            🚀 GO LIVE
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.entries(grouped) as [keyof typeof grouped, LaunchChecklistItem[]][]).map(([group, rows]) => (
          <Card key={group}>
            <h2 className="mb-3 text-lg font-semibold capitalize">{group}</h2>
            <div className="space-y-2">
              {rows.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded border border-slate-700 p-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id, item.checked)} />
                    {item.label}
                  </label>
                  <PlatformChip platform={item.platform} />
                </div>
              ))}
              {rows.length === 0 && <p className="text-sm text-slate-500">No items in this group.</p>}
            </div>
          </Card>
        ))}
      </div>

      {!readyToGo && (
        <GhostButton disabled className="cursor-not-allowed">
          GO LIVE is enabled only when all checklist items are checked and campaign is pre-launch.
        </GhostButton>
      )}
    </div>
  );
}
