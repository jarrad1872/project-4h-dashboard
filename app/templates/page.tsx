"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Templates load internal dashboard data after mount. */

import { useEffect, useState } from "react";
import { Button, Card, GhostButton } from "@/components/ui";
import {
  buildCompetitorResearchPacket,
  COMPETITOR_RESEARCH_TEMPLATE,
} from "@/lib/competitor-research-template";
import { buildContentBriefPacket, CONTENT_BRIEF_TEMPLATES, type ContentBriefTemplateId } from "@/lib/content-brief-templates";
import {
  buildFounderDemoScriptPacket,
  buildLiveProofPacketCopy,
  founderDemoScripts,
  liveProofPackets,
} from "@/lib/customer-proof-sprint";
import {
  buildMessageMatchPacket,
  listMessageMatchBriefs,
  type MessageMatchAngle,
  type MessageMatchBrief,
} from "@/lib/message-match-briefs";
import { META_AD_LIBRARY_ACCESS_REPORT } from "@/lib/meta-ad-library-access";
import type { AdTemplate } from "@/lib/types";

const MESSAGE_MATCH_BRIEFS = listMessageMatchBriefs();
const MESSAGE_MATCH_TRADES = Array.from(new Set(MESSAGE_MATCH_BRIEFS.map((brief) => brief.domain)));
const MESSAGE_MATCH_ANGLES = Array.from(new Set(MESSAGE_MATCH_BRIEFS.map((brief) => brief.angle)));

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [trackingUrl, setTrackingUrl] = useState("");
  const [copiedBrief, setCopiedBrief] = useState<ContentBriefTemplateId | null>(null);
  const [copiedMessageMatch, setCopiedMessageMatch] = useState<string | null>(null);
  const [copiedCompetitorResearch, setCopiedCompetitorResearch] = useState(false);
  const [copiedFounderScript, setCopiedFounderScript] = useState<string | null>(null);
  const [copiedProofPacket, setCopiedProofPacket] = useState<string | null>(null);
  const [copyFallback, setCopyFallback] = useState("");
  const [messageMatchTrade, setMessageMatchTrade] = useState("all");
  const [messageMatchAngle, setMessageMatchAngle] = useState<MessageMatchAngle | "all">("all");

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
      setCopiedMessageMatch(null);
      setCopiedCompetitorResearch(false);
      setCopiedFounderScript(null);
      setCopiedProofPacket(null);
      setCopyFallback("");
    } catch {
      setCopiedBrief(null);
      setCopyFallback(packet);
    }
  }

  async function copyMessageMatchBrief(brief: MessageMatchBrief) {
    const packet = buildMessageMatchPacket(brief);
    try {
      await navigator.clipboard.writeText(packet);
      setCopiedMessageMatch(brief.id);
      setCopiedBrief(null);
      setCopiedCompetitorResearch(false);
      setCopiedFounderScript(null);
      setCopiedProofPacket(null);
      setCopyFallback("");
    } catch {
      setCopiedMessageMatch(null);
      setCopyFallback(packet);
    }
  }

  async function copyCompetitorResearchTemplate() {
    const packet = buildCompetitorResearchPacket();
    try {
      await navigator.clipboard.writeText(packet);
      setCopiedCompetitorResearch(true);
      setCopiedMessageMatch(null);
      setCopiedBrief(null);
      setCopiedFounderScript(null);
      setCopiedProofPacket(null);
      setCopyFallback("");
    } catch {
      setCopiedCompetitorResearch(false);
      setCopyFallback(packet);
    }
  }

  async function copyFounderScript(id: string) {
    const script = founderDemoScripts.find((item) => item.id === id);
    if (!script) return;
    const packet = buildFounderDemoScriptPacket(script);
    try {
      await navigator.clipboard.writeText(packet);
      setCopiedFounderScript(id);
      setCopiedProofPacket(null);
      setCopiedMessageMatch(null);
      setCopiedBrief(null);
      setCopiedCompetitorResearch(false);
      setCopyFallback("");
    } catch {
      setCopiedFounderScript(null);
      setCopyFallback(packet);
    }
  }

  async function copyProofPacket(id: string) {
    const packet = liveProofPackets.find((item) => item.id === id);
    if (!packet) return;
    const copy = buildLiveProofPacketCopy(packet);
    try {
      await navigator.clipboard.writeText(copy);
      setCopiedProofPacket(id);
      setCopiedFounderScript(null);
      setCopiedMessageMatch(null);
      setCopiedBrief(null);
      setCopiedCompetitorResearch(false);
      setCopyFallback("");
    } catch {
      setCopiedProofPacket(null);
      setCopyFallback(copy);
    }
  }

  const filteredMessageMatchBriefs = MESSAGE_MATCH_BRIEFS.filter((brief) => {
    const tradeMatches = messageMatchTrade === "all" || brief.domain === messageMatchTrade;
    const angleMatches = messageMatchAngle === "all" || brief.angle === messageMatchAngle;
    return tradeMatches && angleMatches;
  });

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

      <Card className="space-y-4 border-violet-900/60 bg-slate-900/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Meta Ad Library access validation</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
              {META_AD_LIBRARY_ACCESS_REPORT.verdict}
            </p>
          </div>
          <span className="rounded border border-violet-800/60 bg-violet-950/30 px-3 py-2 text-xs font-semibold uppercase text-violet-200">
            {META_AD_LIBRARY_ACCESS_REPORT.status}
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Official limits</p>
            <div className="mt-3 space-y-3">
              {META_AD_LIBRARY_ACCESS_REPORT.officialFindings.map((finding) => (
                <div key={finding.title} className="border-t border-slate-800 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded border px-2 py-1 text-xs font-semibold uppercase ${
                      finding.kind === "available"
                        ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-300"
                        : "border-amber-700/50 bg-amber-950/30 text-amber-300"
                    }`}>
                      {finding.kind}
                    </span>
                    <p className="text-sm font-semibold text-white">{finding.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-400">{finding.detail}</p>
                  {finding.sourceUrl ? (
                    <a
                      href={finding.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-violet-300 hover:underline"
                    >
                      {finding.sourceLabel}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assumptions to validate</p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-400">
                {META_AD_LIBRARY_ACCESS_REPORT.assumptionsToValidate.map((finding) => (
                  <li key={finding.title}>
                    <span className="font-semibold text-slate-200">{finding.title}:</span> {finding.detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended 4H path</p>
              <ol className="mt-3 space-y-2 text-sm leading-5 text-slate-400">
                {META_AD_LIBRARY_ACCESS_REPORT.recommendedPath.map((step, index) => (
                  <li key={step}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-300">Blocked automation</p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-300">
                {META_AD_LIBRARY_ACCESS_REPORT.blockedAutomation.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-indigo-900/60 bg-slate-900/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Competitor research report template</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
              Manual-only capture format for competitor offers, hooks, visuals, platforms, citations, and evidence quality. Anything beyond human review remains approval-gated.
            </p>
          </div>
          <GhostButton onClick={() => void copyCompetitorResearchTemplate()}>
            {copiedCompetitorResearch ? "Copied template" : "Copy template"}
          </GhostButton>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source rule</p>
          <p className="mt-2 text-sm leading-5 text-slate-300">{COMPETITOR_RESEARCH_TEMPLATE.sourceRule}</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr,0.95fr]">
          <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capture fields</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {COMPETITOR_RESEARCH_TEMPLATE.fields.map((field) => (
                <div key={field.key} className="rounded border border-slate-800 bg-slate-900 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{field.label}</p>
                    {field.required ? (
                      <span className="rounded border border-indigo-800/60 bg-indigo-950/30 px-2 py-1 text-xs font-semibold text-indigo-300">
                        required
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{field.guidance}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence quality</p>
              <div className="mt-3 space-y-3">
                {COMPETITOR_RESEARCH_TEMPLATE.evidenceRules.map((rule) => (
                  <div key={rule.quality} className="border-t border-slate-800 pt-3 first:border-t-0 first:pt-0">
                    <p className="text-sm font-semibold text-white">{rule.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{rule.meaning}</p>
                    <p className="mt-1 text-xs leading-5 text-indigo-200">{rule.allowedUse}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Report sections</p>
              <ol className="mt-3 space-y-1 text-sm leading-5 text-slate-400">
                {COMPETITOR_RESEARCH_TEMPLATE.reportSections.map((section, index) => (
                  <li key={section}>{index + 1}. {section}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-300">Blocked claims</p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-300">
                {COMPETITOR_RESEARCH_TEMPLATE.blockedClaims.map((claim) => (
                  <li key={claim}>- {claim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-emerald-900/60 bg-emerald-950/10" data-testid="founder-demo-script-factory">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Q-59 founder demo script factory</p>
            <h2 className="text-lg font-semibold text-white">Founder-led proof scripts for the five beachhead domains</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
              Scripts are built for 30-60 second founder clips: show the missed-call moment, call the live demo line, show the job summary, and close with the $39/mo trial offer. These are review packets, not publish actions.
            </p>
          </div>
          <span className="rounded border border-emerald-800/60 bg-emerald-950/30 px-3 py-2 text-xs font-semibold uppercase text-emerald-200">
            {founderDemoScripts.length} scripts
          </span>
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          {founderDemoScripts.map((script) => (
            <div key={script.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-base font-semibold text-white">{script.domain}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-emerald-300">{script.trade}</p>
              <p className="mt-3 text-sm font-semibold text-slate-100">{script.title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{script.hook}</p>
              <ol className="mt-3 space-y-1 text-xs leading-5 text-slate-300">
                {script.beats.map((beat, index) => (
                  <li key={beat}>{index + 1}. {beat}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-slate-500">Proof shot: {script.proofShot}</p>
              <GhostButton className="mt-4" onClick={() => void copyFounderScript(script.id)}>
                {copiedFounderScript === script.id ? "Copied script" : "Copy script"}
              </GhostButton>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-cyan-900/60 bg-cyan-950/10" data-testid="live-proof-packets">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Q-61 live proof packets</p>
            <h2 className="text-lg font-semibold text-white">Call, capture, screenshot, and close</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
              Each packet gives a founder, creator, or field rep the exact demo call prompt and proof checklist. Screenshots must mask personal data, and external publishing still requires approval.
            </p>
          </div>
          <span className="rounded border border-cyan-800/60 bg-cyan-950/30 px-3 py-2 text-xs font-semibold uppercase text-cyan-200">
            {liveProofPackets.length} packets
          </span>
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          {liveProofPackets.map((packet) => (
            <div key={packet.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-base font-semibold text-white">{packet.domain}</p>
              <p className="mt-1 text-xs text-cyan-300">{packet.demoPhone}</p>
              <p className="mt-3 text-sm leading-5 text-slate-300">{packet.callPrompt}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">AI capture</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                {packet.aiCapture.map((item) => <li key={item}>- {item}</li>)}
              </ul>
              <p className="mt-3 break-all text-[11px] text-cyan-200">{packet.trackingPath}</p>
              <GhostButton className="mt-4" onClick={() => void copyProofPacket(packet.id)}>
                {copiedProofPacket === packet.id ? "Copied packet" : "Copy packet"}
              </GhostButton>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-cyan-900/60 bg-slate-900/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Message-match handoff briefs</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Landing-page handoff packets for future sawcity-lite work. These describe the first-screen promise;
              they do not edit the product, launch ads, or create external actions.
            </p>
          </div>
          <p className="rounded border border-cyan-800/60 bg-cyan-950/30 px-3 py-2 text-xs font-semibold text-cyan-200">
            {MESSAGE_MATCH_BRIEFS.length} briefs
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trade domain</span>
            <select
              value={messageMatchTrade}
              onChange={(event) => setMessageMatchTrade(event.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="all">All beachhead trades</option>
              {MESSAGE_MATCH_TRADES.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Angle</span>
            <select
              value={messageMatchAngle}
              onChange={(event) => setMessageMatchAngle(event.target.value as MessageMatchAngle | "all")}
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="all">All angles</option>
              {MESSAGE_MATCH_ANGLES.map((angle) => (
                <option key={angle} value={angle}>{angle}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredMessageMatchBriefs.map((brief) => (
            <div key={brief.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{brief.domain}</p>
                  <p className="text-xs uppercase tracking-wide text-cyan-300">{brief.angle}</p>
                </div>
                <span className="rounded-full border border-emerald-700/60 bg-emerald-950/30 px-2 py-1 text-xs font-semibold text-emerald-300">
                  {brief.offer}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Ad promise</p>
                  <p className="mt-1 text-sm text-slate-200">{brief.adPromise}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Landing headline</p>
                  <p className="mt-1 text-sm text-white">{brief.landingHeadline}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Hero direction</p>
                  <p className="mt-1 text-sm text-slate-300">{brief.heroDirection}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Supporting proof</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-300">
                    {brief.supportingProof.map((proof) => (
                      <li key={proof}>- {proof}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                  <p><span className="font-semibold text-slate-300">Trial:</span> {brief.trial}</p>
                  <p><span className="font-semibold text-slate-300">Destination:</span> https://{brief.domain}{brief.route}</p>
                </div>
              </div>
              <GhostButton className="mt-4" onClick={() => void copyMessageMatchBrief(brief)}>
                {copiedMessageMatch === brief.id ? "Copied handoff" : "Copy handoff"}
              </GhostButton>
            </div>
          ))}
        </div>
      </Card>

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
