import {
  Download,
  MapPin,
  Printer,
  QrCode,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui";
import {
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  getPrimarySalesCard,
  salesLeads,
  salesReps,
  salesStages,
  summarizeSalesPipeline,
  validateSalesCardVariant,
  type SalesStage,
} from "@/lib/sales-rep-pipeline";

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

export default function SalesPage() {
  const rep = salesReps[0];
  const cardVariant = getPrimarySalesCard();
  const summary = summarizeSalesPipeline();
  const cardValidation = validateSalesCardVariant(cardVariant);
  const tracking = buildSalesTrackingUrl({ rep, cardVariant });
  const leadsByStage = Object.fromEntries(
    salesStages.map((stage) => [stage.id, salesLeads.filter((lead) => lead.stage === stage.id)]),
  ) as Record<SalesStage, typeof salesLeads>;

  return (
    <div className="space-y-6" data-testid="sales-crm-page">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Q-31 field sales loop</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Human Sales Rep Pipeline</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-400">
            Arizona pilot lane for local SMB trade outreach, rep-coded business cards, and early tester tracking. 4H
            creates the internal assets and CRM view only; no outreach, card order, webhook, billing action, or spend happens here.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          <ShieldCheck className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Internal pilot, Jarrad approval required before external action
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "AZ leads", value: summary.totalLeads, detail: `${summary.activeLeads} active` },
          { label: "Weekly touches", value: summary.weeklyTouchTarget, detail: "Rep target" },
          { label: "Demos booked", value: summary.bookedDemos, detail: "Includes downstream stages" },
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
            <p className="text-xs uppercase tracking-wide text-slate-500">Focus trades</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {rep.focusTrades.map((trade) => (
                <span key={trade} className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                  {trade}
                </span>
              ))}
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
              <p className="text-xs uppercase tracking-wide text-amber-300">Business card system</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{cardVariant.label}</h2>
              <p className="mt-1 text-sm text-slate-400">
                Rep-coded card assets with a QR-backed field-sales URL, hard offer language, and no external order action.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-emerald-800 px-3 py-1 text-emerald-300">
                {cardValidation.hasPrice ? "$39/mo OK" : "Price missing"}
              </span>
              <span className="rounded-full border border-cyan-800 px-3 py-1 text-cyan-300">
                {cardValidation.hasTrial && cardValidation.hasNoCreditCard ? "Trial OK" : "Trial missing"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div data-testid="sales-card-front">
              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-xl">
                <Image
                  src={`/api/sales/business-card/${cardVariant.id}/front.svg`}
                  alt="Answered.City Arizona field sales business card front"
                  width={businessCardPrintSpec.pixelSize.width}
                  height={businessCardPrintSpec.pixelSize.height}
                  unoptimized
                  className="block w-full"
                />
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Front</p>
            </div>
            <div data-testid="sales-card-back">
              <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-xl">
                <Image
                  src={`/api/sales/business-card/${cardVariant.id}/back.svg`}
                  alt="Answered.City Arizona field sales business card back"
                  width={businessCardPrintSpec.pixelSize.width}
                  height={businessCardPrintSpec.pixelSize.height}
                  unoptimized
                  className="block w-full"
                />
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Back</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Tracking URL</p>
              <p className="mt-2 break-all font-mono text-xs text-cyan-200" data-testid="sales-card-tracking-url">
                {tracking.url}
              </p>
            </div>
            <div className="flex flex-wrap gap-2" data-testid="sales-card-download-front">
              <DownloadLink href={`/api/sales/business-card/${cardVariant.id}/front.png`}>Front PNG</DownloadLink>
              <DownloadLink href={`/api/sales/business-card/${cardVariant.id}/back.png`}>Back PNG</DownloadLink>
              <DownloadLink href={`/api/sales/business-card/${cardVariant.id}/front.svg`}>Front SVG</DownloadLink>
              <DownloadLink href={`/api/sales/business-card/${cardVariant.id}/back.svg`}>Back SVG</DownloadLink>
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
            Active first principle: touch fewer real owners, track every card, learn before spend.
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
                    <div key={lead.id} className="rounded border border-current/30 bg-slate-950/45 p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{lead.businessName}</p>
                          <p className="text-xs text-slate-400">
                            {lead.city}, {lead.state} - {lead.tradeDomain}
                          </p>
                        </div>
                        <span className="font-mono text-xs opacity-80">{lead.trackingCode}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-300">{lead.painSignal}</p>
                      <p className="mt-2 text-xs text-slate-500">{lead.nextAction}</p>
                      <p className="mt-2 break-all font-mono text-[11px] text-cyan-200">{leadUrl.contentId}</p>
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
