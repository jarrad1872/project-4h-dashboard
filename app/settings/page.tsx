"use client";

import { useEffect, useState } from "react";
import { LegacyRouteBanner } from "@/components/route-disposition-banner";
import { Button, Card } from "@/components/ui";
import { settingsDocUpdateLog, settingsSetupGuides, settingsSourceDocs } from "@/lib/settings-source-notes";
import type { CampaignStatusData } from "@/lib/types";

const BOB_API_KEY = "bob_project4h_sk_live_7f4a2ca5_demo";

export default function SettingsPage() {
  const [status, setStatus] = useState<CampaignStatusData | null>(null);

  async function load() {
    const res = await fetch("/api/campaign-status", { cache: "no-store" });
    setStatus((await res.json()) as CampaignStatusData);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy settings hydrate campaign status after mount.
    void load();
  }, []);

  async function saveStatus() {
    if (!status) return;
    await fetch("/api/campaign-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status),
    });
    void load();
  }

  if (!status) return <p className="text-sm text-slate-400">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <LegacyRouteBanner route="/settings" />

      <h1 className="text-2xl font-bold">Settings &amp; References</h1>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Platform Setup Guides</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          {settingsSetupGuides.map((guide) => (
            <li key={guide.id}>{guide.note}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Bob API Key</h2>
        <code className="rounded bg-slate-900 px-2 py-1 text-green-400">{BOB_API_KEY}</code>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Campaign Status Control</h2>
        <select
          value={status.status}
          onChange={(event) =>
            setStatus((prev) => (prev ? { ...prev, status: event.target.value as CampaignStatusData["status"] } : prev))
          }
          className="rounded border border-slate-600 bg-slate-800 px-3 py-2"
        >
          <option value="pre-launch">pre-launch</option>
          <option value="live">live</option>
          <option value="paused">paused</option>
          <option value="ended">ended</option>
        </select>
        <div className="mt-3">
          <Button onClick={saveStatus}>Save Campaign Status</Button>
        </div>
      </Card>

      <Card className="border-slate-700/40">
        <h2 className="mb-1 text-lg font-semibold text-slate-300">Doc Update Log</h2>
        <div className="space-y-2">
          {settingsDocUpdateLog.map((item) => (
            <div
              key={item.id}
              className={`rounded border p-3 ${
                item.status === "applied" ? "border-green-800/40 bg-green-950/20" : "border-slate-700 bg-slate-900"
              }`}
            >
              <p className={`mb-0.5 text-sm font-semibold ${item.status === "applied" ? "text-green-400" : "text-slate-200"}`}>
                {item.status === "applied" ? "Applied" : "Pending"}: {item.target}
              </p>
              <p className="text-xs text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Details: <code>docs/pending-doc-updates.md</code>
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Project 4H Source Docs</h2>
        <ul className="space-y-2 text-sm">
          {settingsSourceDocs.map((doc) => (
            <li key={doc.id} className="rounded border border-slate-700 px-3 py-2">
              <a href={`file://${doc.path}`} className="text-blue-300 underline" target="_blank" rel="noreferrer">
                {doc.path}
              </a>
              <p className="mt-1 text-xs text-slate-500">{doc.purpose}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
