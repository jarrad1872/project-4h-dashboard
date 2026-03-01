"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import type { CampaignStatusData } from "@/lib/types";

const BOB_API_KEY = "bob_project4h_sk_live_7f4a2ca5_demo";

const sourceDocs = [
  "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/CAMPAIGN-UPLOAD-SHEET-v2.csv",
  "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/LIFECYCLE-MESSAGING-v1.csv",
  "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/APPROVAL-BATCH-002-CUSTOMER-FACING.md",
  "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/PLATFORM-LAUNCH-GATE-v1.md",
];

export default function SettingsPage() {
  const [status, setStatus] = useState<CampaignStatusData | null>(null);

  async function load() {
    const res = await fetch("/api/campaign-status", { cache: "no-store" });
    setStatus((await res.json()) as CampaignStatusData);
  }

  useEffect(() => {
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

  if (!status) return <p className="text-sm text-slate-400">Loading settings…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings &amp; References</h1>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Platform Setup Guides</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>LinkedIn Insight Tag: saw.city/li landing instrumentation checklist</li>
          <li>Meta Pixel events: saw.city/fb and saw.city/ig launch package</li>
          <li>YouTube / Google Tag config: saw.city/yt campaign setup</li>
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
          onChange={(e) => setStatus((prev) => (prev ? { ...prev, status: e.target.value as CampaignStatusData["status"] } : prev))}
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
        <h2 className="mb-1 text-lg font-semibold text-slate-300">📋 Doc Update Log</h2>
        <div className="space-y-2">
          <div className="rounded border border-green-800/40 bg-green-950/20 p-3">
            <p className="mb-0.5 text-sm font-semibold text-green-400">✅ SOP-WORKFLOW.md — TRADE_MAP Maintenance Rule</p>
            <p className="text-xs text-slate-400">Applied 2026-03-01 — rule added to SOP-WORKFLOW.md under CREATIVE VARIANTS SYSTEM section. Baseline: 65 prefixes (commit <code>820719f</code>).</p>
          </div>
          <div className="rounded border border-slate-700 bg-slate-900 p-3">
            <p className="mb-0.5 text-sm font-semibold text-slate-200">⏳ AGENTS.md — lib/trade-utils.ts Row Update</p>
            <p className="text-xs text-slate-400">
              Still pending: note that TRADE_MAP must contain ALL active prefixes. Document <code>tradeFromAd()</code> behavior — checks both <code>utm_campaign</code> + <code>campaign_group</code>; fallback is <code>saw</code> (silent, not thrown).
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Details: <code>docs/pending-doc-updates.md</code></p>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">Project 4H Source Docs</h2>
        <ul className="space-y-2 text-sm">
          {sourceDocs.map((doc) => (
            <li key={doc} className="rounded border border-slate-700 px-3 py-2">
              <a href={`file://${doc}`} className="text-blue-300 underline" target="_blank" rel="noreferrer">
                {doc}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
