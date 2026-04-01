"use client";

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  formatAudienceSize,
  formatBusinessFocusLabel,
  formatDraftStatusLabel,
  formatInfluencerStatusLabel,
  formatOutreachStageLabel,
  formatSponsorOpennessLabel,
  summarizeInfluencerPipeline,
} from "@/lib/growth-command-center";
import {
  generateOutreachDraft,
  getNextDraftStep,
  getNextFollowUpDate,
  qualifyInfluencer,
} from "@/lib/influencer-outreach-agent";
import type {
  Influencer,
  InfluencerBusinessFocus,
  InfluencerOutreachDraftStep,
  InfluencerSponsorOpenness,
  InfluencerStatus,
} from "@/lib/types";

const STATUS_OPTIONS: InfluencerStatus[] = [
  "researching",
  "contacted",
  "negotiating",
  "contracted",
  "content_live",
  "paid",
  "declined",
];

const BUSINESS_FOCUS_OPTIONS: InfluencerBusinessFocus[] = ["owners", "mixed", "consumer"];
const SPONSOR_OPENNESS_OPTIONS: InfluencerSponsorOpenness[] = ["low", "medium", "high"];

const EMPTY_FORM = {
  creator_name: "",
  trade: "pipe.city",
  platform: "youtube",
  contact_email: "",
  audience_size: "",
  average_views: "",
  engagement_rate: "",
  flat_fee_amount: "",
  business_focus: "owners" as InfluencerBusinessFocus,
  sponsor_openness: "medium" as InfluencerSponsorOpenness,
  channel_url: "",
  notes: "",
};

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Open";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function draftButtonLabel(step: InfluencerOutreachDraftStep | null) {
  if (step === "follow_up_1") return "Draft follow-up 1";
  if (step === "follow_up_2") return "Draft follow-up 2";
  return "Draft outreach";
}

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
        contact_email: form.contact_email || null,
        audience_size: form.audience_size ? Number(form.audience_size) : null,
        average_views: form.average_views ? Number(form.average_views) : null,
        engagement_rate: form.engagement_rate ? Number(form.engagement_rate) : null,
        flat_fee_amount: form.flat_fee_amount ? Number(form.flat_fee_amount) : null,
        business_focus: form.business_focus,
        sponsor_openness: form.sponsor_openness,
        channel_url: form.channel_url || null,
        notes: form.notes || null,
        status: "researching",
        outreach_stage: "discovery",
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

  async function generateDraft(id: string, step: InfluencerOutreachDraftStep) {
    setSavingId(id);
    await fetch(`/api/influencers/${id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
    });
    setSavingId(null);
    await load();
  }

  async function reviewDraft(id: string, approved: boolean) {
    setSavingId(id);
    await fetch(`/api/influencers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        approved
          ? {
              draft_status: "approved",
              outreach_stage: "approved",
              approved_at: new Date().toISOString(),
            }
          : {
              draft_status: "rejected",
              outreach_stage: "qualified",
              approved_at: null,
            },
      ),
    });
    setSavingId(null);
    await load();
  }

  async function markSent(influencer: Influencer) {
    setSavingId(influencer.id);
    const now = new Date().toISOString();
    await fetch(`/api/influencers/${influencer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft_status: "sent",
        outreach_stage: "sent",
        status: "contacted",
        sent_at: now,
        last_contact_at: now,
        follow_up_due_at: getNextFollowUpDate(influencer.draft_step),
      }),
    });
    setSavingId(null);
    await load();
  }

  async function markResponded(influencer: Influencer) {
    setSavingId(influencer.id);
    await fetch(`/api/influencers/${influencer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outreach_stage: "responded",
        last_response_at: new Date().toISOString(),
        follow_up_due_at: null,
        draft_status: influencer.draft_status === "sent" ? "sent" : influencer.draft_status,
      }),
    });
    setSavingId(null);
    await load();
  }

  async function deleteInfluencer(id: string) {
    if (!window.confirm("Delete this creator from the outreach pipeline?")) return;
    setSavingId(id);
    await fetch(`/api/influencers/${id}`, { method: "DELETE" });
    setSavingId(null);
    await load();
  }

  const ranked = influencers
    .map((influencer) => ({
      influencer,
      qualification: qualifyInfluencer(influencer),
      nextDraftStep: getNextDraftStep(influencer),
    }))
    .sort((a, b) => b.qualification.totalScore - a.qualification.totalScore);

  const summary = summarizeInfluencerPipeline(influencers);
  const committedFees = influencers.reduce((sum, influencer) => sum + (influencer.flat_fee_amount ?? 0), 0);
  const pendingApproval = ranked.filter((entry) => entry.influencer.draft_status === "pending_approval");
  const readyToSend = ranked.filter((entry) => entry.influencer.draft_status === "approved");
  const followUpDue = ranked.filter((entry) => entry.nextDraftStep && entry.influencer.draft_status === "sent");
  const qualified = ranked.filter((entry) => entry.qualification.totalScore >= 70);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Influencer Outreach Agent</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            Email-only, human-gated outreach for creator partnerships. Discovery and qualification stay automated, but every
            outbound draft still requires approval before send.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {influencers.length} creators · {qualified.length} priority fits · {formatCurrency(committedFees)} in tracked flat fees
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Researching", value: summary.researching, color: "text-slate-200" },
          { label: "Contacted", value: summary.contacted, color: "text-sky-300" },
          { label: "Negotiating", value: summary.negotiating, color: "text-amber-300" },
          { label: "Approval Queue", value: pendingApproval.length, color: "text-rose-300" },
          { label: "Ready to Send", value: readyToSend.length, color: "text-emerald-300" },
          { label: "Follow-up Due", value: followUpDue.length, color: "text-cyan-300" },
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
          <p className="text-sm text-slate-500">
            Store qualification signals up front so the agent can score audience fit, draft emails, and queue only the items
            Jarrad actually needs to review.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
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
            placeholder="Trade domain"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="email"
            value={form.contact_email}
            onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))}
            placeholder="Contact email"
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
            placeholder="Audience size"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="number"
            min="0"
            value={form.average_views}
            onChange={(event) => setForm((current) => ({ ...current, average_views: event.target.value }))}
            placeholder="Average views"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.engagement_rate}
            onChange={(event) => setForm((current) => ({ ...current, engagement_rate: event.target.value }))}
            placeholder="Engagement %"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.flat_fee_amount}
            onChange={(event) => setForm((current) => ({ ...current, flat_fee_amount: event.target.value }))}
            placeholder="Flat fee"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          />
          <select
            value={form.business_focus}
            onChange={(event) => setForm((current) => ({ ...current, business_focus: event.target.value as InfluencerBusinessFocus }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            {BUSINESS_FOCUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatBusinessFocusLabel(option)}
              </option>
            ))}
          </select>
          <select
            value={form.sponsor_openness}
            onChange={(event) => setForm((current) => ({ ...current, sponsor_openness: event.target.value as InfluencerSponsorOpenness }))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
          >
            {SPONSOR_OPENNESS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Sponsor signals: {formatSponsorOpennessLabel(option)}
              </option>
            ))}
          </select>
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
          placeholder="Why this creator matters, owner-vs-DIY fit, sponsor history, or personalization notes"
          rows={3}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        />
        <div className="flex justify-end">
          <Button disabled={savingId === "new" || !form.creator_name.trim()} onClick={createInfluencer}>
            {savingId === "new" ? "Saving..." : "Add creator"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Approval queue</h2>
            <p className="text-sm text-slate-500">Drafted emails waiting for a human decision before anything is sent.</p>
          </div>
          {pendingApproval.length === 0 ? (
            <p className="text-sm text-slate-500">No drafts awaiting approval.</p>
          ) : (
            pendingApproval.map(({ influencer, qualification }) => (
              <div key={influencer.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{influencer.creator_name}</p>
                    <p className="text-xs text-slate-500">
                      {influencer.trade} · score {qualification.totalScore}/100 · {formatCurrency(influencer.flat_fee_amount)}
                    </p>
                  </div>
                  <div className="rounded-full border border-rose-800 px-2 py-1 text-xs text-rose-300">
                    {formatDraftStatusLabel(influencer.draft_status)}
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">{influencer.draft_subject || "(no subject)"}</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-200">
                  {influencer.draft_body || "No draft body"}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button disabled={savingId === influencer.id} onClick={() => void reviewDraft(influencer.id, true)}>
                    Approve
                  </Button>
                  <GhostButton disabled={savingId === influencer.id} onClick={() => void reviewDraft(influencer.id, false)}>
                    Reject
                  </GhostButton>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Ready to send</h2>
            <p className="text-sm text-slate-500">Approved drafts can only move forward with an explicit human send action.</p>
          </div>
          {readyToSend.length === 0 ? (
            <p className="text-sm text-slate-500">No approved drafts ready for dispatch.</p>
          ) : (
            readyToSend.map(({ influencer, qualification }) => (
              <div key={influencer.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{influencer.creator_name}</p>
                    <p className="text-xs text-slate-500">
                      {influencer.contact_email || "No contact email"} · score {qualification.totalScore}/100
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-800 px-2 py-1 text-xs text-emerald-300">
                    {formatOutreachStageLabel(influencer.outreach_stage)}
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">{influencer.draft_subject || "(no subject)"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button disabled={savingId === influencer.id} onClick={() => void markSent(influencer)}>
                    Mark sent
                  </Button>
                  <GhostButton disabled={savingId === influencer.id} onClick={() => void reviewDraft(influencer.id, false)}>
                    Send back
                  </GhostButton>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Follow-up due</h2>
          <p className="text-sm text-slate-500">Initial sends queue day-3 and day-7 follow-up drafts. Replies stop the cadence.</p>
        </div>
        {followUpDue.length === 0 ? (
          <p className="text-sm text-slate-500">No follow-up drafts due right now.</p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {followUpDue.map(({ influencer, nextDraftStep }) => (
              <div key={influencer.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-white">{influencer.creator_name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Last sent {influencer.sent_at ? new Date(influencer.sent_at).toLocaleString() : "unknown"} · next step{" "}
                  {nextDraftStep?.replace("_", " ") ?? "none"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {nextDraftStep && (
                    <Button disabled={savingId === influencer.id} onClick={() => void generateDraft(influencer.id, nextDraftStep)}>
                      {draftButtonLabel(nextDraftStep)}
                    </Button>
                  )}
                  <GhostButton disabled={savingId === influencer.id} onClick={() => void markResponded(influencer)}>
                    Mark responded
                  </GhostButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Creator roster</h2>
            <p className="text-sm text-slate-500">
              Qualification score, outreach state, and draft controls for each creator prospect.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="py-8 text-sm text-slate-500">Loading influencer pipeline...</div>
        ) : ranked.length === 0 ? (
          <div className="py-8 text-sm text-slate-500">No creators added yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1450px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-3">Creator</th>
                  <th className="pb-3 pr-3">Contact</th>
                  <th className="pb-3 pr-3">Qualification</th>
                  <th className="pb-3 pr-3">Signals</th>
                  <th className="pb-3 pr-3">Pipeline</th>
                  <th className="pb-3 pr-3">Draft</th>
                  <th className="pb-3 pr-3">Fee</th>
                  <th className="pb-3 pr-3">Notes</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ranked.map(({ influencer, qualification, nextDraftStep }) => {
                  const previewDraft = generateOutreachDraft(influencer, nextDraftStep ?? "initial");

                  return (
                    <tr key={influencer.id} className="align-top">
                      <td className="py-3 pr-3">
                        <div>
                          <p className="font-medium text-white">{influencer.creator_name}</p>
                          <p className="text-xs text-slate-500">{influencer.trade} · {influencer.platform}</p>
                          {influencer.channel_url ? (
                            <a href={influencer.channel_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 hover:underline">
                              Channel
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <input
                          type="email"
                          defaultValue={influencer.contact_email ?? ""}
                          onBlur={(event) => void updateInfluencer(influencer.id, { contact_email: event.target.value || null })}
                          placeholder="email@creator.com"
                          className="w-52 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">{formatAudienceSize(influencer.audience_size)}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-white">{qualification.totalScore}/100</p>
                        <p className="text-xs text-slate-500">
                          {qualification.recommendation} · {qualification.sizeTier}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="space-y-2">
                          <select
                            value={influencer.business_focus}
                            onChange={(event) =>
                              void updateInfluencer(influencer.id, { business_focus: event.target.value as InfluencerBusinessFocus })
                            }
                            className="w-32 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                          >
                            {BUSINESS_FOCUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {formatBusinessFocusLabel(option)}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              defaultValue={influencer.engagement_rate ?? ""}
                              onBlur={(event) =>
                                void updateInfluencer(influencer.id, {
                                  engagement_rate: event.target.value ? Number(event.target.value) : null,
                                })
                              }
                              placeholder="Eng %"
                              className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                            />
                            <input
                              type="number"
                              min="0"
                              defaultValue={influencer.average_views ?? ""}
                              onBlur={(event) =>
                                void updateInfluencer(influencer.id, {
                                  average_views: event.target.value ? Number(event.target.value) : null,
                                })
                              }
                              placeholder="Views"
                              className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                            />
                          </div>
                          <select
                            value={influencer.sponsor_openness}
                            onChange={(event) =>
                              void updateInfluencer(influencer.id, { sponsor_openness: event.target.value as InfluencerSponsorOpenness })
                            }
                            className="w-32 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                          >
                            {SPONSOR_OPENNESS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {formatSponsorOpennessLabel(option)}
                              </option>
                            ))}
                          </select>
                        </div>
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
                        <p className="mt-2 text-xs text-slate-500">{formatOutreachStageLabel(influencer.outreach_stage)}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-xs text-slate-500">{formatDraftStatusLabel(influencer.draft_status)}</p>
                        <p className="mt-1 text-sm text-white">{influencer.draft_subject || previewDraft.subject}</p>
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
                            })
                          }
                          className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">{formatCurrency(influencer.flat_fee_amount)}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <textarea
                          rows={3}
                          defaultValue={influencer.notes ?? ""}
                          onBlur={(event) => void updateInfluencer(influencer.id, { notes: event.target.value })}
                          className="w-full min-w-[260px] rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {nextDraftStep ? (
                            <Button disabled={savingId === influencer.id} onClick={() => void generateDraft(influencer.id, nextDraftStep)}>
                              {draftButtonLabel(nextDraftStep)}
                            </Button>
                          ) : influencer.outreach_stage === "sent" ? (
                            <GhostButton disabled={savingId === influencer.id} onClick={() => void markResponded(influencer)}>
                              Mark responded
                            </GhostButton>
                          ) : null}
                          <GhostButton disabled={savingId === influencer.id} onClick={() => void deleteInfluencer(influencer.id)}>
                            Remove
                          </GhostButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
