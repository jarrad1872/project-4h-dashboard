"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import {
  campaignDealMetrics,
  campaignFlowLinks,
  dealStructure,
  outreachChecklist,
  outreachTemplate,
} from "@/lib/influencer-campaign-data";

interface Influencer {
  id: string;
  creator_name: string;
  trade: string;
  platform: string;
  channel_url: string | null;
  estimated_reach: string | null;
  status: string;
  deal_page: string | null;
  referral_code: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLUMNS = [
  { key: "identified", label: "Identified", color: "border-slate-600 bg-slate-800/50" },
  { key: "contacted", label: "Contacted", color: "border-blue-700/50 bg-blue-950/30" },
  { key: "replied", label: "Replied", color: "border-cyan-700/50 bg-cyan-950/30" },
  { key: "negotiating", label: "Negotiating", color: "border-amber-700/50 bg-amber-950/30" },
  { key: "active", label: "Active", color: "border-green-700/50 bg-green-950/30" },
  { key: "declined", label: "Declined", color: "border-red-700/50 bg-red-950/30" },
];

export default function InfluencerPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetch("/api/influencers", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        setInfluencers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setUseFallback(true);
        setLoading(false);
      });
  }, []);

  const grouped = STATUS_COLUMNS.map((col) => ({
    ...col,
    items: influencers.filter((i) => i.status === col.key),
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Influencer Campaign</h1>
        <p className="text-sm text-slate-400">
          Pipeline tracking for creator partnerships. Manage via CLI:{" "}
          <code className="text-slate-300">4h influencer list|add|update|seed</code>
        </p>
      </header>

      <Card className="border-green-800/40 bg-green-950/20">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-green-400">Program economics</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {campaignDealMetrics.map((metric) => (
            <div key={metric.label} className="rounded border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-lg font-bold text-slate-100">{metric.value}</p>
              {metric.note && <p className="mt-1 text-xs text-slate-500">{metric.note}</p>}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Pipeline Kanban ────────────────────────────────────────────── */}
      {!useFallback && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Creator Pipeline ({influencers.length} total)
            </h2>
          </div>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-slate-400">Loading pipeline...</div>
          ) : influencers.length === 0 ? (
            <Card className="text-center text-slate-400 py-8">
              <p>No influencers in pipeline yet.</p>
              <p className="text-xs mt-1">Run <code className="text-slate-300">4h influencer seed</code> to populate from shortlist.</p>
            </Card>
          ) : (
            <div className="grid gap-3 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2">
              {grouped.map((col) => (
                <div key={col.key} className={`rounded border p-3 ${col.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">{col.label}</h3>
                    <span className="text-xs text-slate-500">{col.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.items.map((inf) => (
                      <div key={inf.id} className="rounded bg-slate-900/60 p-2">
                        <p className="text-sm font-semibold text-slate-100">{inf.creator_name}</p>
                        <p className="text-xs text-slate-400">{inf.trade}</p>
                        {inf.channel_url && (
                          <a
                            href={inf.channel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            {inf.platform}
                          </a>
                        )}
                        {inf.estimated_reach && (
                          <p className="text-xs text-slate-500 mt-1">{inf.estimated_reach}</p>
                        )}
                        {inf.notes && (
                          <p className="text-xs text-slate-500 mt-1 italic">{inf.notes}</p>
                        )}
                      </div>
                    ))}
                    {col.items.length === 0 && (
                      <p className="text-xs text-slate-600 italic">Empty</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Static fallback (original content) ──────────────────────── */}
      {useFallback && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-100">Top creator shortlist</h2>
            <p className="text-xs text-slate-500">Run migration 008 and <code>4h influencer seed</code> for dynamic pipeline</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-3">Creator</th>
                  <th className="pb-2 pr-3">Trade</th>
                  <th className="pb-2 pr-3">Reach</th>
                  <th className="pb-2">Deal page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { creator: "Mike Andes", trade: "Lawn Care", reach: "80K+ operators", deal: "mow.city/mikeandes" },
                  { creator: "Brian's Lawn Maintenance", trade: "Lawn Care", reach: "150K+ operators", deal: "mow.city/brianslawn" },
                  { creator: "AC Service Tech LLC", trade: "HVAC", reach: "90K+ techs/owners", deal: "duct.city/acservicetech" },
                  { creator: "HVAC School (Bryan Orr)", trade: "HVAC", reach: "60K+ techs/owners", deal: "duct.city/hvacschool" },
                  { creator: "Roofing Insights (Dmitry)", trade: "Roofing", reach: "60K+ contractors", deal: "roofrepair.city/roofinginsights" },
                  { creator: "Electrician U (Dustin Stelzer)", trade: "Electrical", reach: "120K+ electricians", deal: "electricians.city/electricianu" },
                  { creator: "Roger Wakefield", trade: "Plumbing", reach: "120K+ contractor-adjacent", deal: "pipe.city/rogerwakefield" },
                  { creator: "King of Pressure Washing", trade: "Pressure Washing", reach: "35K+ operators", deal: "rinse.city/kingofpw" },
                  { creator: "Painting Business Pro (Barstow)", trade: "Painting", reach: "36K operators", deal: "coat.city/paintingbizpro" },
                ].map((c) => (
                  <tr key={c.creator}>
                    <td className="py-2 pr-3 font-semibold text-slate-100">{c.creator}</td>
                    <td className="py-2 pr-3 text-slate-300">{c.trade}</td>
                    <td className="py-2 pr-3 text-slate-300">{c.reach}</td>
                    <td className="py-2 text-slate-400">{c.deal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-100">Deal structure</h2>
          <ul className="mt-3 space-y-3">
            {dealStructure.map((row) => (
              <li key={row.benefit} className="rounded border border-slate-700 bg-slate-900/40 p-3">
                <p className="text-sm font-semibold text-slate-100">{row.benefit}</p>
                <p className="mt-1 text-xs text-slate-400">{row.details}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-100">Outreach template (current baseline)</h2>
          <p className="mt-1 text-xs text-slate-500">Subject</p>
          <p className="mt-1 rounded border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">{outreachTemplate.subject}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {outreachTemplate.bodyLines.map((line) => (
              <p key={line} className="rounded border border-slate-800 bg-slate-900/30 px-3 py-2">
                {line}
              </p>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-100">Execution checklist</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-300">
            {outreachChecklist.map((item, idx) => (
              <li key={item.id} className="flex gap-2">
                <span className="text-slate-500">{idx + 1}.</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-100">Pumpcans flow links</h2>
          <div className="mt-3 space-y-2">
            {campaignFlowLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href ?? "/"}
                className="block rounded border border-slate-700 bg-slate-900/40 p-3 transition-colors hover:border-blue-500/50"
              >
                <p className="text-sm font-semibold text-blue-400">{item.href}</p>
                <p className="mt-1 text-xs text-slate-400">{item.text}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
