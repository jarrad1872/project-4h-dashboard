export const dynamic = "force-dynamic";

interface ReadinessItem {
  label: string;
  status: "done" | "in-review" | "in-progress" | "pending" | "blocked";
  note: string;
}

interface ActionItem {
  priority: number;
  label: string;
  effort: string;
  owner: string;
  detail: string;
  link: string | null;
}

interface KeyLink {
  label: string;
  url: string;
}

interface ProjectState {
  lastUpdated: string;
  version: string;
  product: {
    name: string;
    headline: string;
    status: string;
    summary: string;
    readiness: ReadinessItem[];
    metrics: Record<string, number | string>;
  };
  campaign: {
    name: string;
    budget_total: number;
    channels: string[];
    status: string;
    readiness: ReadinessItem[];
  };
  actions: ActionItem[];
  keyLinks: KeyLink[];
}

async function getProjectState(): Promise<ProjectState> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/project-state`, { cache: "no-store" });
  return res.json();
}

const STATUS_CONFIG = {
  done: { label: "Done", color: "bg-green-500/20 text-green-400 border border-green-500/30" },
  "in-review": { label: "In Review", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  "in-progress": { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  pending: { label: "Pending", color: "bg-slate-600/40 text-slate-400 border border-slate-600" },
  blocked: { label: "Blocked", color: "bg-red-500/20 text-red-400 border border-red-500/30" },
} as const;

function StatusPill({ status }: { status: ReadinessItem["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

const PRIORITY_COLORS = [
  "border-red-500 bg-red-500/10",
  "border-orange-500 bg-orange-500/10",
  "border-yellow-500 bg-yellow-500/10",
  "border-blue-500 bg-blue-500/10",
  "border-slate-600 bg-slate-700/40",
  "border-slate-600 bg-slate-700/40",
  "border-slate-600 bg-slate-700/40",
];

export default async function GTMPage() {
  const state = await getProjectState();

  const doneCount = (items: ReadinessItem[]) => items.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">GTM Action Board</h1>
        <p className="mt-1 text-sm text-slate-400">
          {state.product.name} v{state.version} · Last synced from repo:{" "}
          <span className="text-slate-300">{state.lastUpdated}</span>
        </p>
      </div>

      {/* Mission Banner */}
      <div className="rounded-xl border-2 border-green-500 bg-green-500/10 px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-400">The Mission</p>
            <p className="mt-1 text-4xl font-black text-white">2,000 Users</p>
            <p className="mt-1 text-sm text-green-300">
              Saw.City LITE · 20 trades · 4 channels · $20K budget · No demo, self-serve
            </p>
          </div>
          <div className="ml-auto hidden sm:block">
            <p className="text-right text-xs text-slate-400">Tier 1 Trades</p>
            {(state.campaign as any).tier1_trades?.map((t: string) => (
              <p key={t} className="text-right text-sm font-medium text-green-300">{t}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Product State Summary */}
      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{state.product.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{state.product.headline}</p>
          </div>
          <span className="shrink-0 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-400 border border-green-500/30">
            Production
          </span>
        </div>

        <p className="mb-5 rounded-lg bg-slate-700/40 px-4 py-3 text-sm text-slate-300">
          {state.product.summary}
        </p>

        {/* Metrics row */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Tests", value: state.product.metrics.total_tests },
            { label: "API Endpoints", value: state.product.metrics.api_endpoints },
            { label: "Trade Domains", value: state.product.metrics.trade_domains },
            { label: "Price", value: `$${state.product.metrics.monthly_price}/mo` },
            { label: "Gross Margin", value: state.product.metrics.gross_margin_pct },
            { label: "Readiness", value: `${doneCount(state.product.readiness)}/${state.product.readiness.length}` },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-center">
              <div className="text-lg font-bold text-white">{m.value}</div>
              <div className="text-xs text-slate-400">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Product readiness */}
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Product Readiness ({doneCount(state.product.readiness)}/{state.product.readiness.length})
        </h3>
        <div className="space-y-1.5">
          {state.product.readiness.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-lg bg-slate-700/30 px-3 py-2">
              <StatusPill status={item.status} />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-white">{item.label}</span>
                {item.note && (
                  <span className="ml-2 text-xs text-slate-400">{item.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campaign State */}
      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{state.campaign.name}</h2>
            <p className="mt-1 text-sm text-slate-400">
              ${state.campaign.budget_total.toLocaleString()} ·{" "}
              {state.campaign.channels.join(", ")}
            </p>
            {(state.campaign as any).mission && (
              <p className="mt-2 text-xs font-semibold text-green-400">{(state.campaign as any).mission}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-400 border border-yellow-500/30">
            Pre-Launch
          </span>
        </div>

        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Campaign Readiness ({doneCount(state.campaign.readiness)}/{state.campaign.readiness.length})
        </h3>
        <div className="space-y-1.5">
          {state.campaign.readiness.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-lg bg-slate-700/30 px-3 py-2">
              <StatusPill status={item.status} />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-white">{item.label}</span>
                {item.note && (
                  <span className="ml-2 text-xs text-slate-400">{item.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Action Board */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Next Actions</h2>
        <div className="space-y-3">
          {state.actions.map((action) => (
            <div
              key={action.priority}
              className={`rounded-xl border-l-4 p-4 ${PRIORITY_COLORS[action.priority - 1] ?? PRIORITY_COLORS[4]}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400">#{action.priority}</span>
                <span className="font-semibold text-white">{action.label}</span>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                  {action.effort}
                </span>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                  {action.owner}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-400">{action.detail}</p>
              {action.link && (
                <a
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  {action.link}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Key Links */}
      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Key Links</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {state.keyLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-700/40 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 hover:text-blue-300 transition-colors"
            >
              <span className="truncate">{link.label}</span>
              <span className="shrink-0 text-slate-500">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
