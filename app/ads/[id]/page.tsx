"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, GhostButton } from "@/components/ui";
import { PlatformChip, StatusChip } from "@/components/chips";
import type { Ad, AdStatus } from "@/lib/types";

export default function AdDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [ad, setAd] = useState<Ad | null>(null);
  const [form, setForm] = useState<Partial<Ad>>({});

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

  if (!ad) {
    return <p className="text-sm text-slate-400">Loading ad…</p>;
  }

  const utmUrl = `https://saw.city${ad.landingPath}?utm_source=${ad.utmSource}&utm_medium=${ad.utmMedium}&utm_campaign=${ad.utmCampaign}&utm_content=${ad.utmContent}&utm_term=${ad.utmTerm}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ad Detail — {ad.id}</h1>
        <GhostButton onClick={() => router.push("/ads")}>Back to Ads</GhostButton>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <PlatformChip platform={ad.platform} />
          <StatusChip status={ad.status} />
          <span className="rounded bg-slate-700 px-2 py-1 text-xs">{ad.format}</span>
        </div>
        <p className="mb-1 text-sm text-slate-400">Headline</p>
        <p className="mb-3 text-lg font-semibold">{ad.headline || "(No headline)"}</p>
        <p className="mb-1 text-sm text-slate-400">Primary text</p>
        <p className="whitespace-pre-wrap text-slate-200">{ad.primaryText}</p>

        <div className="mt-4 rounded border border-slate-700 bg-slate-900 p-3">
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
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Edit Ad</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Headline
            <input
              className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
              value={form.headline ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            CTA
            <input
              className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
              value={form.cta ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Primary text
            <textarea
              rows={5}
              className="mt-1 w-full rounded border border-slate-600 bg-slate-800 p-2"
              value={form.primaryText ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, primaryText: e.target.value }))}
            />
          </label>
        </div>
        <Button className="mt-4" onClick={save}>
          Save Changes
        </Button>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Status History</h2>
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
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setStatus("approved")}>Approve</Button>
          <GhostButton onClick={() => setStatus("paused")}>Pause</GhostButton>
          <GhostButton className="border-red-500 text-red-400 hover:bg-red-900/40" onClick={() => setStatus("rejected")}>
            Reject
          </GhostButton>
        </div>
      </Card>
    </div>
  );
}
