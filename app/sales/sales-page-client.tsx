"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  Download,
  MessageSquareText,
  MapPin,
  PhoneCall,
  Printer,
  QrCode,
  Route,
  ScanLine,
  Search,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Button, Card } from "@/components/ui";
import { creativeSourceOfTruthRules } from "@/lib/creative-source-of-truth";
import { summarizeFieldSalesAttribution, type FieldSalesAttributionBucket } from "@/lib/field-sales-attribution";
import { buildFieldSalesOperatingPacket } from "@/lib/field-sales-operating-plan";
import {
  activationDefinition,
  beachheadPriorities,
  googleMapsLeadFinderRoadmap,
  objectionBank,
  pipeProofSprint,
  summarizeProofSprint,
  tenCustomerSprintRows,
} from "@/lib/customer-proof-sprint";
import {
  buildSalesTrackingParams,
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  getPrimarySalesCard,
  PIPE_CITY_DEMO_LINE,
  salesCardVariants,
  salesLeads as seedSalesLeads,
  salesReps,
  salesStages,
  summarizeSalesPipeline,
  validateSalesCardVariant,
  type SalesLead,
  type SalesStage,
} from "@/lib/sales-rep-pipeline";
import type { MarketingEvent } from "@/lib/types";

const STAGE_STYLE: Record<SalesStage, string> = {
  prospect: "border-slate-700 bg-slate-950/50 text-slate-300",
  qualified: "border-sky-800 bg-sky-950/30 text-sky-300",
  visited: "border-cyan-800 bg-cyan-950/30 text-cyan-300",
  "card-left": "border-amber-800 bg-amber-950/30 text-amber-300",
  "demo-booked": "border-violet-800 bg-violet-950/30 text-violet-300",
  "trial-started": "border-emerald-800 bg-emerald-950/30 text-emerald-300",
  activated: "border-lime-800 bg-lime-950/30 text-lime-300",
  paid: "border-teal-800 bg-teal-950/30 text-teal-300",
  lost: "border-rose-800 bg-rose-950/30 text-rose-300",
};

const EMPTY_FORM = {
  businessName: "",
  city: "Phoenix",
  state: "AZ",
  tradeDomain: "pipe.city",
  leadType: "real" as SalesLead["leadType"],
  stage: "prospect" as SalesStage,
  ownerProfile: "",
  painSignal: "",
  nextAction: "",
  notes: "",
};

const SALES_REP_CODE_HEADER = "x-sales-rep-code";
const REP_FIELD_STAGES: SalesStage[] = ["prospect", "qualified", "visited", "card-left", "demo-booked", "trial-started"];

function DownloadLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {children}
    </a>
  );
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function AttributionBucketRows({ title, rows }: { title: string; rows: FieldSalesAttributionBucket[] }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.length ? rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-900/50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{row.label}</p>
              <p className="text-xs text-slate-500">
                {row.asset_view} scans / {row.demo_call} demos / {row.trial_started} trials / {row.paid} paid
              </p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-emerald-300">{formatCurrency(row.paidValueCents)}</p>
          </div>
        )) : (
          <p className="rounded border border-dashed border-slate-800 px-3 py-2 text-xs text-slate-500">
            No attributed rows yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function SalesPageClient() {
  const rep = salesReps[0];
  const cardVariant = getPrimarySalesCard();
  const cardProofs = salesCardVariants.filter((variant) => variant.repId === rep.id);
  const [leads, setLeads] = useState<SalesLead[]>(seedSalesLeads);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attributionEvents, setAttributionEvents] = useState<MarketingEvent[]>([]);
  const [attributionLoading, setAttributionLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [repAccessCode, setRepAccessCode] = useState(() =>
    typeof window === "undefined" ? "" : (window.sessionStorage.getItem("dustin-sales-rep-code") ?? ""),
  );
  const [repAccessUnlocked, setRepAccessUnlocked] = useState(false);
  const [repAccessMessage, setRepAccessMessage] = useState("Checking field mode...");
  const [repAccessMode, setRepAccessMode] = useState("locked");
  const [appOrigin] = useState(() => (typeof window === "undefined" ? "https://pumpcans.com" : window.location.origin));

  function salesWriteHeaders() {
    return {
      "Content-Type": "application/json",
      ...(repAccessCode.trim() ? { [SALES_REP_CODE_HEADER]: repAccessCode.trim() } : {}),
    };
  }

  async function checkRepAccess(code = repAccessCode) {
    const response = await fetch("/api/sales/access", {
      cache: "no-store",
      headers: code.trim() ? { [SALES_REP_CODE_HEADER]: code.trim() } : undefined,
    });
    const data = (await response.json().catch(() => ({}))) as {
      unlocked?: boolean;
      mode?: string;
      message?: string;
      productionRepCodeConfigured?: boolean;
    };
    setRepAccessUnlocked(Boolean(data.unlocked));
    setRepAccessMode(data.mode ?? "locked");
    setRepAccessMessage(
      data.message ??
        (data.unlocked
          ? "Sales field mode is unlocked."
          : data.productionRepCodeConfigured
            ? "Enter Dustin's rep access code to unlock writes."
            : "Production rep access code is not configured yet."),
    );
    return Boolean(data.unlocked);
  }

  async function loadLeads() {
    const response = await fetch("/api/sales/leads", { cache: "no-store" });
    const data = (await response.json()) as { leads?: SalesLead[] };
    setLeads(Array.isArray(data.leads) ? data.leads : seedSalesLeads);
    setLoading(false);
  }

  async function loadAttribution() {
    const response = await fetch("/api/events?field_sales=1&limit=1000", { cache: "no-store" });
    if (!response.ok) {
      setAttributionEvents([]);
      setAttributionLoading(false);
      return;
    }
    const data = (await response.json()) as { events?: MarketingEvent[] };
    setAttributionEvents(Array.isArray(data.events) ? data.events : []);
    setAttributionLoading(false);
  }

  useEffect(() => {
    void loadLeads();
    void loadAttribution();
    void checkRepAccess(repAccessCode);
  }, []);

  async function createLead() {
    if (!form.businessName.trim()) return;
    setSavingId("new");
    setSaveError(null);
    const response = await fetch("/api/sales/leads", {
      method: "POST",
      headers: salesWriteHeaders(),
      body: JSON.stringify({
        ...form,
        repId: rep.id,
        lastTouchedAt: null,
        notes: form.notes || null,
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setSaveError(typeof data.error === "string" ? data.error : "Failed to save lead.");
      setSavingId(null);
      return;
    }
    if (repAccessCode.trim()) window.sessionStorage.setItem("dustin-sales-rep-code", repAccessCode.trim());
    setForm(EMPTY_FORM);
    setSavingId(null);
    await loadLeads();
  }

  async function updateLead(id: string, patch: Partial<SalesLead>) {
    setSavingId(id);
    setSaveError(null);
    const response = await fetch(`/api/sales/leads/${id}`, {
      method: "PATCH",
      headers: salesWriteHeaders(),
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setSaveError(typeof data.error === "string" ? data.error : "Failed to update lead.");
      setSavingId(null);
      return;
    }
    setSavingId(null);
    await loadLeads();
  }

  const summary = useMemo(() => summarizeSalesPipeline(leads), [leads]);
  const attribution = useMemo(() => summarizeFieldSalesAttribution(attributionEvents), [attributionEvents]);
  const operatingPacket = useMemo(
    () => buildFieldSalesOperatingPacket({ leads, attribution, rep, cardVariant }),
    [leads, attribution, rep, cardVariant],
  );
  const proofSprint = useMemo(() => summarizeProofSprint(), []);
  const leadsByStage = useMemo(
    () =>
      Object.fromEntries(salesStages.map((stage) => [stage.id, leads.filter((lead) => lead.stage === stage.id)])) as Record<
        SalesStage,
        SalesLead[]
      >,
    [leads],
  );
  const primaryTracking = useMemo(() => buildSalesTrackingParams({ rep, cardVariant }), [rep, cardVariant]);
  const primaryTrackingUrl = `${appOrigin}${primaryTracking.path}`;

  return (
    <div className="space-y-6" data-testid="sales-crm-page">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Q-66 pipe.city proof sprint</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Plumbing-First Sales Pipeline</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-400">
            The Deep Research reset makes pipe.city the primary scale lane for solo plumbing owner-operators. 4H
            creates internal CRM rows, proof stages, and printable assets only; no outreach, card order, webhook,
            billing action, spend, or sawcity-lite edit happens here.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          <ShieldCheck className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Internal pilot, Jarrad approval required before external action
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Total rows", value: summary.totalLeads, detail: `${summary.realLeads} real, ${summary.archetypeLeads} archetypes` },
          { label: "Active real leads", value: summary.activeLeads, detail: "Excludes archetypes" },
          { label: "Weekly touches", value: summary.weeklyTouchTarget, detail: "Rep target" },
          { label: "Demos booked", value: summary.bookedDemos, detail: "Real leads only" },
          { label: "Trial starts", value: summary.trialStarts, detail: "14-day trial path" },
          { label: "Paid", value: summary.paidCustomers, detail: "$39/mo customers" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4 border-emerald-900/60 bg-emerald-950/10" data-testid="dustin-field-mode">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Dustin field mode</p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {repAccessUnlocked ? "CRM writes unlocked" : "Unlock limited rep CRM writes"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Dustin can add real prospect rows, move his own field stages, and keep next actions current. This does not
              send outreach, place card orders, create webhooks, launch ads, move money, or change billing.
            </p>
            <p className="mt-2 text-xs text-slate-500">{repAccessMessage}</p>
          </div>
          <div className="w-full rounded-lg border border-slate-800 bg-slate-950/60 p-3 xl:max-w-md">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="rep-access-code">
              Rep access code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="rep-access-code"
                type="password"
                value={repAccessCode}
                onChange={(event) => setRepAccessCode(event.target.value)}
                placeholder="Configured in Vercel env"
                className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
              <Button
                onClick={() => {
                  if (repAccessCode.trim()) window.sessionStorage.setItem("dustin-sales-rep-code", repAccessCode.trim());
                  void checkRepAccess();
                }}
              >
                Unlock
              </Button>
            </div>
            <p className="mt-3 break-all font-mono text-xs text-cyan-200">{primaryTrackingUrl}</p>
            <p className="mt-2 text-xs text-slate-500">
              QR/card scan path logs `asset_view` and lands on Dustin&apos;s demo page.
            </p>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-4">
          {["Add real lead", "Mark card left", "Book demo", "Log next action"].map((step) => (
            <div key={step} className="rounded border border-slate-800 bg-slate-950/50 p-3 text-sm font-semibold text-white">
              {step}
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-amber-900/60 bg-amber-950/10" data-testid="sales-card-proof-top">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-300">Business card proofs</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Dustin Bouwhuis pipe.city card mockups</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              This is the generated creative proof sheet, not a code-redrawn imitation. The approved image-gen artifact is
              the source of truth; the app stores it, displays it, and tracks it without rebuilding the visual language.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-800 px-3 py-1 text-emerald-300">$39/mo locked</span>
            <span className="rounded-full border border-cyan-800 px-3 py-1 text-cyan-300">AI Agent</span>
            <span className="rounded-full border border-amber-800 px-3 py-1 text-amber-300">DUSTINAZ</span>
          </div>
        </div>

        <div className="rounded-lg border border-amber-800/50 bg-slate-950/60 p-3 text-sm text-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Creative source of truth</p>
          <p className="mt-1 leading-6">
            {creativeSourceOfTruthRules.summary} Blocked here: {creativeSourceOfTruthRules.blockedPattern}
          </p>
        </div>

        <div className="mx-auto w-full max-w-[1480px]" data-testid="sales-card-proof-sheet">
          <Image
            src="/sales-assets/dustin-pipe-proof-sheet-v2.png"
            alt="Dustin Bouwhuis pipe.city imagegen-native three-concept business card proof sheet"
            width={1536}
            height={1024}
            unoptimized
            className="block h-auto w-full rounded-[22px] border border-slate-800 shadow-2xl"
            priority
          />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Vistaprint-ready flattened exports</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            These PNGs are cropped from the imagegen-native proof sheet with the text baked into the image. Use these for
            Vistaprint instead of the legacy generated SVG/PNG route or any coded card rendering.
          </p>
          <div className="mt-3 grid gap-2 lg:grid-cols-3">
            <div className="rounded border border-amber-800/60 bg-amber-950/20 p-3 lg:col-span-3">
              <p className="text-sm font-semibold text-white">Approved generated proof sheet and print pack</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Source creative for Dustin to review: three concepts, front/back, captions, contact details, demo line{" "}
                {PIPE_CITY_DEMO_LINE}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DownloadLink href="/sales-assets/dustin-pipe-proof-sheet-v2.png">Imagegen Proof Sheet PNG</DownloadLink>
                <DownloadLink href="/sales-assets/print-hires/dustin-pipe-business-card-print-pack-hires.zip">
                  Hi-Res Print Pack ZIP
                </DownloadLink>
              </div>
            </div>
            {cardProofs.map((proof) => (
              <div key={proof.id} className="rounded border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-sm font-semibold text-white">{proof.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{proof.frontHeadline}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <DownloadLink href={proof.printFrontPath ?? `/api/sales/business-card/${proof.id}/front.png`}>
                    Print Front PNG
                  </DownloadLink>
                  <DownloadLink href={proof.printBackPath ?? `/api/sales/business-card/${proof.id}/back.png`}>
                    Print Back PNG
                  </DownloadLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-emerald-900/60 bg-emerald-950/10" data-testid="pipe-proof-sprint-board">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-300">Q-64 / Q-65 / Q-66 strategy reset</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Pipe.City 30-day urgent-call proof sprint</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
              ICP: {pipeProofSprint.icp} Target: {pipeProofSprint.targetQualifiedDemoCalls}; success starts at{" "}
              {pipeProofSprint.targetActivatedTrials}. Activated means {activationDefinition.shortLabel.toLowerCase()}.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-800/60 bg-slate-950/50 px-3 py-2 text-xs text-emerald-100">
            {pipeProofSprint.timebox} - {pipeProofSprint.rows.length} starter rows - {pipeProofSprint.stages.length} stages
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Beachhead recut</p>
              <div className="mt-3 space-y-2">
                {beachheadPriorities.map((priority) => (
                  <div key={priority.domain} className="rounded border border-slate-800 bg-slate-900/50 p-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{priority.domain}</p>
                        <p className="text-xs text-emerald-300">{priority.label}</p>
                      </div>
                      <span className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300">#{priority.priority}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{priority.directive}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Activated trial requires</p>
              <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-300">
                {activationDefinition.requiredSignals.map((signal) => <li key={signal}>- {signal}</li>)}
              </ul>
              <p className="mt-3 text-xs leading-5 text-amber-200">
                Not enough: {activationDefinition.notEnough.join(", ")}.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-3">
              {pipeProofSprint.stages.map((stage) => (
                <div key={stage.id} className="rounded border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-sm font-semibold text-white">{stage.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{stage.intent}</p>
                  <p className="mt-2 text-xs leading-5 text-emerald-200">Proof: {stage.proofRequired}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {pipeProofSprint.rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{row.businessName}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.cityState} - {row.source}</p>
                    </div>
                    <span className="rounded border border-emerald-800/60 bg-emerald-950/30 px-2 py-1 text-xs text-emerald-200">
                      {row.stage}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{row.painSignal}</p>
                  <p className="mt-2 text-xs leading-5 text-violet-100">Learn: {row.objectionToLearn}</p>
                  <p className="mt-2 border-l border-emerald-800 pl-3 text-xs leading-5 text-emerald-100">{row.nextAction}</p>
                </div>
              ))}
            </div>
            <p className="text-xs leading-5 text-slate-500">{pipeProofSprint.approvalBoundary}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-cyan-900/60 bg-cyan-950/10" data-testid="pain-signal-lead-finder">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Q-58 pain-signal lead finder</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Google Maps review-signal roadmap</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
              {googleMapsLeadFinderRoadmap.principle} This is prospect research and scoring only. 4H does not scrape,
              evade controls, enrich paid lists, or send outreach from this surface.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
            {googleMapsLeadFinderRoadmap.painSignals.length} pain signals - {googleMapsLeadFinderRoadmap.captureFields.length} capture fields
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <Search className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Starter queries</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
              {googleMapsLeadFinderRoadmap.targetQueries.map((query) => (
                <li key={query}>- {query}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <Download className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Manual/API/provider import</p>
            <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
              {googleMapsLeadFinderRoadmap.importWorkflow.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <Target className="h-4 w-4 text-cyan-300" aria-hidden="true" />
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Pain phrases</p>
            <div className="mt-3 space-y-2">
              {googleMapsLeadFinderRoadmap.painSignals.map((signal) => (
                <div key={signal.phrase} className="rounded border border-slate-800 bg-slate-900/50 p-2">
                  <p className="text-sm font-semibold text-white">{signal.phrase}</p>
                  <p className="mt-1 text-xs text-slate-400">{signal.whyItMatters}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-3">
            <ShieldCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <p className="mt-2 text-xs uppercase tracking-wide text-amber-300">Blocked tactics</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-amber-100">
              {googleMapsLeadFinderRoadmap.blockedTactics.map((tactic) => (
                <li key={tactic}>- {tactic}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Compliant path</p>
            <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
              {googleMapsLeadFinderRoadmap.compliantPath.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Aggressive but human path</p>
            <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
              {googleMapsLeadFinderRoadmap.aggressiveButHumanPath.map((step, index) => (
                <li key={step}>{index + 1}. {step}</li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-violet-900/60 bg-violet-950/10" data-testid="customer-proof-sprint-board">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-300">Q-60 / Q-62 customer proof sprint</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Objections and first 10 customer attempts</h2>
            <p className="mt-1 max-w-4xl text-sm text-slate-400">
              The next motion is ten named attempts, not abstract TAM math. Rows below are hypotheses until a real owner
              interaction, trial, or paid event is verified.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
            {proofSprint.firstCustomerRows} rows - {proofSprint.objections} objections
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-2 md:grid-cols-2">
            {tenCustomerSprintRows.map((row) => (
              <div key={row.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{row.id} - {row.tradeDomain}</p>
                    <p className="mt-1 text-xs text-violet-300">{row.source} / {row.status}</p>
                  </div>
                  <span className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300">internal</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">{row.ownerHypothesis}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{row.painSignal}</p>
                <p className="mt-2 border-l border-violet-800 pl-3 text-xs leading-5 text-violet-100">{row.nextMove}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {objectionBank.map((entry) => (
              <div key={entry.objection} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <MessageSquareText className="h-4 w-4 text-violet-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-white">{entry.objection}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{entry.whatItMeans}</p>
                <p className="mt-2 text-xs leading-5 text-violet-100">{entry.response}</p>
                <p className="mt-2 text-xs text-slate-500">Proof needed: {entry.proofNeeded}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-emerald-900/60 bg-emerald-950/10" data-testid="sales-attribution-panel">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-300">Q-33 field-sales attribution</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Card scans to paid signal</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Reads marketing_events for rep-coded field-sales UTMs and card metadata. This is measurement only: no outreach, card order, webhook, launch, billing action, or spend.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
            {attributionLoading ? "Loading attribution..." : attribution.evidence}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Card scans", value: attribution.cardScans, detail: "asset_view", icon: ScanLine, testId: "sales-attribution-card-scans" },
            { label: "Demo calls", value: attribution.demoCalls, detail: "demo_call", icon: PhoneCall, testId: "sales-attribution-demo-calls" },
            { label: "Signups", value: attribution.signups, detail: "signup", icon: Activity, testId: "sales-attribution-signups" },
            { label: "Trials", value: attribution.trialStarts, detail: "trial_started", icon: Route, testId: "sales-attribution-trials" },
            { label: "Activated", value: attribution.activations, detail: "activated", icon: BarChart3, testId: "sales-attribution-activated" },
            { label: "Paid", value: attribution.paidCustomers, detail: formatCurrency(attribution.paidValueCents), icon: BadgeDollarSign, testId: "sales-attribution-paid" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3" data-testid={item.testId}>
                <Icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{item.value.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
              </div>
            );
          })}
        </div>

        {attribution.fieldSalesEvents === 0 && !attributionLoading ? (
          <div className="rounded-lg border border-dashed border-amber-800 bg-amber-950/20 px-4 py-3 text-sm text-amber-200" data-testid="sales-attribution-zero-state">
            No field-sales events are logged yet. The next useful check is a QR scan that arrives with utm_medium=field-sales and a rep/card ID before any real outreach is counted.
          </div>
        ) : null}

        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1.2fr]">
          <AttributionBucketRows title="Top reps" rows={attribution.topReps} />
          <AttributionBucketRows title="Top cards" rows={attribution.topCards} />
          <AttributionBucketRows title="Top trades" rows={attribution.topTrades} />
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Next measurement move</p>
            <p className="mt-3 text-sm text-slate-300">{attribution.nextAction}</p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-cyan-900/60 bg-cyan-950/10" data-testid="sales-operating-packet">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-300">Q-34 weekly rep packet</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Arizona operating plan</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Turns the CRM board and field-sales attribution into an internal route plan. It is not an outreach sender, card order, webhook, ad launch, or billing control.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
            {operatingPacket.weekLabel} - {operatingPacket.evidence}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Weekly touches", value: operatingPacket.plannedTouches, detail: `${operatingPacket.dailyTouchTarget}/day`, icon: CalendarDays, testId: "sales-packet-weekly-touches" },
            { label: "Cards to carry", value: operatingPacket.cardsToCarry, detail: "Tracked cards", icon: QrCode, testId: "sales-packet-cards" },
            { label: "Real rows", value: operatingPacket.realLeadCount, detail: "Active only", icon: Users, testId: "sales-packet-real-rows" },
            { label: "Archetypes", value: operatingPacket.archetypeCount, detail: "Research only", icon: ShieldCheck, testId: "sales-packet-archetypes" },
            { label: "Scans logged", value: attribution.cardScans, detail: "Before scale", icon: ScanLine, testId: "sales-packet-scans" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3" data-testid={item.testId}>
                <Icon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{item.value.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3" data-testid="sales-packet-priority-leads">
            <p className="text-xs uppercase tracking-wide text-slate-500">Priority rows</p>
            <div className="mt-3 space-y-2">
              {operatingPacket.priorityLeads.length ? operatingPacket.priorityLeads.map((lead) => (
                <div key={lead.id} className="rounded border border-slate-800 bg-slate-900/50 p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{lead.businessName}</p>
                      <p className="text-xs text-slate-400">
                        {lead.cityState} - {lead.tradeDomain} - {lead.stage} - {lead.leadType}
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-800 px-2 py-1 font-mono text-xs text-cyan-200">
                      {lead.trackingCode}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{lead.recommendedMove}</p>
                  <p className="mt-2 text-xs text-slate-500">{lead.priorityReason}</p>
                  <p className="mt-2 break-all font-mono text-[11px] text-cyan-200">{lead.contentId}</p>
                </div>
              )) : (
                <p className="rounded border border-dashed border-slate-800 px-3 py-2 text-xs text-slate-500">
                  No active rows. Add real owner leads before field activity.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3" data-testid="sales-packet-daily-plan">
              <p className="text-xs uppercase tracking-wide text-slate-500">Daily cadence</p>
              <div className="mt-3 space-y-2">
                {operatingPacket.dailyPlan.map((day) => (
                  <div key={day.label} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded border border-slate-800 bg-slate-900/50 px-3 py-2">
                    <p className="font-semibold text-cyan-200">{day.label}</p>
                    <p className="text-xs text-slate-300">{day.targetTouches} touches - {day.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-3" data-testid="sales-packet-boundary">
              <p className="text-xs uppercase tracking-wide text-amber-300">Boundary</p>
              <p className="mt-2 text-sm text-amber-100">{operatingPacket.safetyBoundary}</p>
            </div>
          </div>
        </div>

        <textarea
          readOnly
          value={operatingPacket.copyText}
          data-testid="sales-packet-copy-text"
          className="min-h-56 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 outline-none"
        />
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card className="space-y-4 border-cyan-900/60 bg-cyan-950/10" data-testid="sales-rep-card-az-founding">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-300">Rep</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{rep.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{rep.role}</p>
            </div>
            <Users className="h-6 w-6 text-cyan-300" aria-hidden="true" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Region</p>
              <p className="mt-1 font-semibold text-white">
                <MapPin className="mr-1 inline h-4 w-4 text-amber-300" aria-hidden="true" />
                {rep.region}, {rep.state}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Rep code</p>
              <p className="mt-1 font-mono text-lg font-semibold text-emerald-300">{rep.code}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Next field move</p>
            <p className="mt-2 text-sm text-slate-300">{summary.nextAction}</p>
            <p className="mt-2 text-xs text-slate-500">{summary.evidence}</p>
          </div>
        </Card>

        <Card className="space-y-4 border-amber-900/60 bg-amber-950/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-300">Business card tracking utilities</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Dustin Bouwhuis pipe.city cards</h2>
              <p className="mt-1 text-sm text-slate-400">
                The generated proof sheet above is the visual source of truth. This section keeps rep-coded URLs and
                flattened print files available without sending outreach or placing card orders.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-emerald-800 px-3 py-1 text-emerald-300">$39/mo locked</span>
              <span className="rounded-full border border-cyan-800 px-3 py-1 text-cyan-300">AI Agent angle</span>
              <span className="rounded-full border border-amber-800 px-3 py-1 text-amber-300">{rep.email}</span>
            </div>
          </div>

          <div className="space-y-5">
            {cardProofs.map((proof, index) => {
              const proofValidation = validateSalesCardVariant(proof);
              const proofTracking = buildSalesTrackingParams({ rep, cardVariant: proof });
              const proofTrackingUrl = `${appOrigin}${proofTracking.path}`;

              return (
                <div
                  key={proof.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                  data-testid={`sales-card-proof-${proof.id}`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Mockup {index + 1}</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{proof.label}</h3>
                      <p className="mt-1 text-sm text-slate-400">{proof.frontHeadline}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{proof.frontSubhead}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-emerald-800 px-3 py-1 text-emerald-300">
                        {proofValidation.hasPrice ? "$39/mo OK" : "Price missing"}
                      </span>
                      <span className="rounded-full border border-cyan-800 px-3 py-1 text-cyan-300">
                        {proofValidation.hasTrial && proofValidation.hasNoCreditCard ? "Trial OK" : "Trial missing"}
                      </span>
                      <span className="rounded-full border border-violet-800 px-3 py-1 text-violet-300">
                        {proof.primaryTradeDomain}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Tracking URL</p>
                      <p
                        className="mt-2 break-all font-mono text-xs text-cyan-200"
                        data-testid={index === 0 ? "sales-card-tracking-url" : undefined}
                      >
                        {proofTrackingUrl}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2" data-testid={index === 0 ? "sales-card-download-front" : undefined}>
                      <DownloadLink href="/sales-assets/dustin-pipe-proof-sheet-v2.png">Imagegen Proof Sheet PNG</DownloadLink>
                      <DownloadLink href="/sales-assets/print-hires/dustin-pipe-business-card-print-pack-hires.zip">
                        Hi-Res Print Pack ZIP
                      </DownloadLink>
                      {proof.printFrontPath ? <DownloadLink href={proof.printFrontPath}>Print Front PNG</DownloadLink> : null}
                      {proof.printBackPath ? <DownloadLink href={proof.printBackPath}>Print Back PNG</DownloadLink> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Dustin proof guidance</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="rounded border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-sm font-semibold text-white">1. Local trust</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Best for face-to-face handoffs and supply-house conversations.</p>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-sm font-semibold text-white">2. Missed-call emergency</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Best when the owner already knows missed calls are costing jobs.</p>
              </div>
              <div className="rounded border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-sm font-semibold text-white">3. Live demo QR</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Best when the card needs to sell the demo before a longer conversation.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <Printer className="mb-2 h-5 w-5 text-amber-300" aria-hidden="true" />
              <p className="text-xs uppercase tracking-wide text-slate-500">Bleed export</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {businessCardPrintSpec.bleedInches.width} x {businessCardPrintSpec.bleedInches.height} in
              </p>
              <p className="text-xs text-slate-500">
                {businessCardPrintSpec.pixelSize.width} x {businessCardPrintSpec.pixelSize.height}px
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <Route className="mb-2 h-5 w-5 text-cyan-300" aria-hidden="true" />
              <p className="text-xs uppercase tracking-wide text-slate-500">Trim</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {businessCardPrintSpec.trimInches.width} x {businessCardPrintSpec.trimInches.height} in
              </p>
              <p className="text-xs text-slate-500">
                {businessCardPrintSpec.trimPixelSize.width} x {businessCardPrintSpec.trimPixelSize.height}px
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <QrCode className="mb-2 h-5 w-5 text-emerald-300" aria-hidden="true" />
              <p className="text-xs uppercase tracking-wide text-slate-500">Safe area</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {businessCardPrintSpec.safeInches.width} x {businessCardPrintSpec.safeInches.height} in
              </p>
              <p className="text-xs text-slate-500">
                {businessCardPrintSpec.safePixelSize.width} x {businessCardPrintSpec.safePixelSize.height}px
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4" data-testid="sales-lead-form">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300">Add lead</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Create a tracked Arizona row</h2>
          <p className="mt-1 text-sm text-slate-500">
            Real rows can move into contacted/demo stages. Archetype rows stay in research/qualification until replaced by a real owner lead.
          </p>
        </div>
        {saveError ? (
          <div className="rounded border border-rose-800 bg-rose-950/30 px-3 py-2 text-sm text-rose-200" data-testid="sales-save-error">
            {saveError}
          </div>
        ) : null}
        <div className="grid gap-3 lg:grid-cols-4">
          <input
            value={form.businessName}
            onChange={(event) => setForm((prev) => ({ ...prev, businessName: event.target.value }))}
            placeholder="Business or owner label"
            data-testid="sales-form-business-name"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <input
            value={form.city}
            onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            placeholder="City"
            data-testid="sales-form-city"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <select
            value={form.tradeDomain}
            onChange={(event) => setForm((prev) => ({ ...prev, tradeDomain: event.target.value }))}
            data-testid="sales-form-trade"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {rep.focusTrades.map((trade) => (
              <option key={trade} value={trade}>
                {trade}
              </option>
            ))}
          </select>
          <select
            value={form.leadType}
            onChange={(event) => setForm((prev) => ({ ...prev, leadType: event.target.value as SalesLead["leadType"] }))}
            data-testid="sales-form-lead-type"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="real">Real lead</option>
            <option value="archetype">Archetype</option>
          </select>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <input
            value={form.painSignal}
            onChange={(event) => setForm((prev) => ({ ...prev, painSignal: event.target.value }))}
            placeholder="Missed-call pain signal"
            data-testid="sales-form-pain"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <input
            value={form.nextAction}
            onChange={(event) => setForm((prev) => ({ ...prev, nextAction: event.target.value }))}
            placeholder="Next action"
            data-testid="sales-form-next-action"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <select
            value={form.stage}
            onChange={(event) => setForm((prev) => ({ ...prev, stage: event.target.value as SalesStage }))}
            data-testid="sales-form-stage"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {salesStages.map((stage) => (
              <option
                key={stage.id}
                value={stage.id}
                disabled={
                  form.leadType === "archetype" &&
                  ["visited", "card-left", "demo-booked", "trial-started", "activated", "paid"].includes(stage.id)
                }
              >
                {stage.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <textarea
            value={form.ownerProfile}
            onChange={(event) => setForm((prev) => ({ ...prev, ownerProfile: event.target.value }))}
            placeholder="Owner/context notes"
            data-testid="sales-form-owner-profile"
            className="min-h-24 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <textarea
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Visit notes, objection, or follow-up context"
            data-testid="sales-form-notes"
            className="min-h-24 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Enter only information shared for this pilot. This is internal CRM storage, not an outreach sender.
          </p>
          <Button
            onClick={() => void createLead()}
            disabled={savingId === "new" || !form.businessName.trim()}
            data-testid="sales-form-submit"
          >
            {savingId === "new" ? "Saving..." : "Add lead"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-4" data-testid="sales-crm-board">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-300">Mini CRM</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Arizona early tester board</h2>
            <p className="mt-1 text-sm text-slate-400">
              Placeholder lead rows are internal target archetypes, not sent outreach and not committed customer claims.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
            {loading ? "Loading CRM rows..." : "Persistent internal rows; no external send action."}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3 2xl:grid-cols-5">
          {salesStages.map((stage) => (
            <div
              key={stage.id}
              className={`rounded-lg border p-3 ${STAGE_STYLE[stage.id]}`}
              data-testid={`sales-stage-${stage.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-80">{stage.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{summary.byStage[stage.id]}</p>
                </div>
                <span className="rounded-full border border-current px-2 py-1 text-xs">
                  {summary.byStage[stage.id] ? "Active" : "Empty"}
                </span>
              </div>
              <p className="mt-2 min-h-10 text-xs opacity-80">{stage.intent}</p>
              <div className="mt-3 min-h-24 space-y-2">
                {leadsByStage[stage.id].map((lead) => {
                  const leadUrl = buildSalesTrackingUrl({
                    rep,
                    cardVariant: { ...cardVariant, destination: "trade-domain" },
                    tradeDomain: lead.tradeDomain,
                    leadTrackingCode: lead.trackingCode,
                  });
                  return (
                    <div
                      key={lead.id}
                      className="rounded border border-current/30 bg-slate-950/45 p-2"
                      data-testid={`sales-lead-${lead.id}`}
                      data-lead-name={lead.businessName}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{lead.businessName}</p>
                          <p className="text-xs text-slate-400">
                            {lead.city}, {lead.state} - {lead.tradeDomain}
                          </p>
                        </div>
                        <span className="rounded-full border border-current px-2 py-0.5 text-xs">{lead.leadType}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-300">{lead.painSignal || "No pain signal logged yet."}</p>
                      <p className="mt-2 text-xs text-slate-500">{lead.nextAction || "Set the next action before touching this row."}</p>
                      <p className="mt-2 break-all font-mono text-[11px] text-cyan-200">{leadUrl.contentId}</p>
                      <div className="mt-3 grid grid-cols-2 gap-1">
                        {(["visited", "card-left", "demo-booked", "trial-started"] as SalesStage[]).map((stageId) => {
                          const stage = salesStages.find((option) => option.id === stageId)!;
                          const disabled =
                            savingId === lead.id ||
                            lead.stage === stageId ||
                            (lead.leadType === "archetype" && ["visited", "card-left", "demo-booked", "trial-started"].includes(stageId));
                          return (
                            <button
                              key={stageId}
                              type="button"
                              disabled={disabled}
                              onClick={() => void updateLead(lead.id, { stage: stageId, lastTouchedAt: new Date().toISOString() })}
                              className="rounded border border-current/40 bg-slate-950 px-2 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {stage.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <select
                          value={lead.stage}
                          disabled={savingId === lead.id}
                          onChange={(event) =>
                            void updateLead(lead.id, { stage: event.target.value as SalesStage, lastTouchedAt: new Date().toISOString() })
                          }
                          data-testid={`sales-lead-stage-${lead.id}`}
                          className="rounded border border-current/40 bg-slate-950 px-2 py-1 text-xs text-white outline-none"
                        >
                          {salesStages.map((option) => (
                            <option
                              key={option.id}
                              value={option.id}
                              disabled={
                                (lead.leadType === "archetype" &&
                                  ["visited", "card-left", "demo-booked", "trial-started", "activated", "paid"].includes(option.id)) ||
                                (repAccessMode === "rep-code" && !REP_FIELD_STAGES.includes(option.id))
                              }
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {lead.leadType === "archetype" ? (
                          <span className="rounded border border-current/40 px-2 py-1 text-xs opacity-80">
                            Create real row to advance
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
