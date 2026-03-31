"use client";

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  formatAudienceSize,
  formatInfluencerStatusLabel,
  summarizeInfluencerPipeline,
} from "@/lib/growth-command-center";
import type { Influencer, InfluencerStatus } from "@/lib/types";

const STATUS_OPTIONS: InfluencerStatus[] = [
  "researching",
  "contacted",
  "negotiating",
  "contracted",
  "content_live",
  "paid",
  "declined",
];

const EMPTY_FORM = {
  creator_name: "",
  trade: "pipe.city",
  platform: "youtube",
  audience_size: "",
  flat_fee_amount: "",
  channel_url: "",
  notes: "",
};

export default function InfluencerPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/influencers", { cache: "no-store" });
    const data = await response.json();
    setInfluencers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createInfluencer() {
    setSavingId("new");
    await fetch("/api/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creator_name: form.creator_name,
        trade: form.trade,
        platform: form.platform,
        audience_size: form.audience_size ? Number(form.audience_size) : null,
        flat_fee_amount: form.flat_fee_amount ? Number(form.flat_fee_amount) : null,
        channel_url: form.channel_url || null,
        notes: form.notes || null,
        status: "researching",
      }),
    });
    setForm(EMPTY_FORM);
    setSavingId(null);
    await load();
  }

  async function updateInfluencer(id: string, patch: Partial<Influencer>) {
    setSavingId(id);
    await fetch(`/api/influencers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    await load();
  }

  async function deleteInfluencer(id: string) {
    if (!window.confirm("Delete this creator from the pipeline?")) return;
    setSavingId(id);
    await fetch(`/api/influencers/${id}`, { method: "DELETE" });
    setSavingId(null);
    await load();
  }

  const summary = summarizeInfluencerPipeline(influencers);
  const committedFees = influencers.reduce((sum, influencer) => sum + (influencer.flat_fee_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Influencer Pipeline</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track pilot creators from research to paid. This is the working outreach queue for the plumbing launch.
          </p>
        </div>
        <p className="text-sm text-slate-500">{influencers.length} creators · ${committedFees.toLocaleString()} committed fees</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Researching", value: summary.researching, color: "text-slate-200" },
          { label: "Contacted", value: summary.contacted, color: "text-sky-300" },
          { label: "Negotiating", value: summary.negotiating, color: "text-amber-300" },
          { label: "Contracted", value: summary.contracted, color: "text-emerald-300" },
          { label: "Content Live", value: summary.content_live, color: "text-cyan-300" },
          { label: "Paid", value: summary.paid, color: "text-violet-300" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${item.color}`}>{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Add creator prospect</h2>
          <p className="text-sm text-slate-500">Store name, audience size, flat fee, and notes from the first outreach pass.</p>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <input
            type="text"
            value={form.creator_name}
            onChange={(event) => setForm((current) => ({ ...current, creator_name: event.target.value }))}
            placeholder="Creator name"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={form.trade}
            onChange={(event) => setForm((current) => ({ ...current, trade: event.target.value }))}
            placeholder="Trade or domain"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <select
            value={form.platform}
            onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>
          <input
            type="number"
            min="0"
            value={form.audience_size}
            onChange={(event) => setForm((current) => ({ ...current, audience_size: event.target.value }))}
            placeholder="Followers / subscribers"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.flat_fee_amount}
            onChange={(event) => setForm((current) => ({ ...current, flat_fee_amount: event.target.value }))}
            placeholder="Flat fee amount"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="url"
            value={form.channel_url}
            onChange={(event) => setForm((current) => ({ ...current, channel_url: event.target.value }))}
            placeholder="Channel URL"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
        </div>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Why this creator matters, pricing context, or outreach notes"
          rows={3}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        <div className="flex justify-end">
          <Button disabled={savingId === "new" || !form.creator_name.trim()} onClick={createInfluencer}>
            {savingId === "new" ? "Saving..." : "Add creator"}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Creator roster</h2>
            <p className="text-sm text-slate-500">Workflow: Researching to Contacted to Negotiating to Contracted to Content Live to Paid</p>
          </div>
        </div>
        {loading ? (
          <div className="py-8 text-sm text-slate-500">Loading influencer pipeline...</div>
        ) : influencers.length === 0 ? (
          <div className="py-8 text-sm text-slate-500">No creators added yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-3">Creator</th>
                  <th className="pb-3 pr-3">Platform</th>
                  <th className="pb-3 pr-3">Followers</th>
                  <th className="pb-3 pr-3">Status</th>
                  <th className="pb-3 pr-3">Flat fee</th>
                  <th className="pb-3 pr-3">Notes</th>
                  <th className="pb-3 pr-3">Links</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {influencers.map((influencer) => (
                  <tr key={influencer.id} className="align-top">
                    <td className="py-3 pr-3">
                      <div>
                        <p className="font-medium text-white">{influencer.creator_name}</p>
                        <p className="text-xs text-slate-500">{influencer.trade}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-slate-300">{influencer.platform}</td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        defaultValue={influencer.audience_size ?? ""}
                        onBlur={(event) =>
                          void updateInfluencer(influencer.id, {
                            audience_size: event.target.value ? Number(event.target.value) : null,
                          } as Partial<Influencer>)
                        }
                        className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">{formatAudienceSize(influencer.audience_size)}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <select
                        value={influencer.status}
                        onChange={(event) =>
                          void updateInfluencer(influencer.id, {
                            status: event.target.value as InfluencerStatus,
                            last_contact_at: new Date().toISOString(),
                          })
                        }
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {formatInfluencerStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={influencer.flat_fee_amount ?? ""}
                        onBlur={(event) =>
                          void updateInfluencer(influencer.id, {
                            flat_fee_amount: event.target.value ? Number(event.target.value) : null,
                          } as Partial<Influencer>)
                        }
                        className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <textarea
                        rows={2}
                        defaultValue={influencer.notes ?? ""}
                        onBlur={(event) => void updateInfluencer(influencer.id, { notes: event.target.value })}
                        className="w-full min-w-[220px] rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      {influencer.channel_url ? (
                        <a href={influencer.channel_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                          Channel
                        </a>
                      ) : (
                        <span className="text-slate-500">No URL</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <GhostButton disabled={savingId === influencer.id} onClick={() => void deleteInfluencer(influencer.id)}>
                        Remove
                      </GhostButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
