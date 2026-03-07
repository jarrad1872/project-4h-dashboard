import Link from "next/link";
import { Card } from "@/components/ui";
import {
  campaignDealMetrics,
  campaignFlowLinks,
  creatorShortlist,
  dealStructure,
  outreachChecklist,
  outreachTemplate,
} from "@/lib/influencer-campaign-data";

function rankBadge(rank: number) {
  if (rank === 1) return "🥇 #1";
  if (rank === 2) return "🥈 #2";
  if (rank === 3) return "🥉 #3";
  return `#${rank}`;
}

export default function InfluencerPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Influencer Campaign</h1>
        <p className="text-sm text-slate-400">
          Production rollout based on <code className="text-slate-300">docs/influencer-outreach.md</code>. Reuses existing campaign assets and keeps
          execution inside the current Project 4H workflow.
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

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-100">Top creator shortlist</h2>
          <p className="text-xs text-slate-500">Source: outreach doc §5 (priority hit list)</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-3">Rank</th>
                <th className="pb-2 pr-3">Creator</th>
                <th className="pb-2 pr-3">Trade</th>
                <th className="pb-2 pr-3">Reach</th>
                <th className="pb-2 pr-3">Conv.</th>
                <th className="pb-2">Deal page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {creatorShortlist.map((creator) => (
                <tr key={creator.creator}>
                  <td className="py-2 pr-3 text-slate-300">{rankBadge(creator.rank)}</td>
                  <td className="py-2 pr-3">
                    <p className="font-semibold text-slate-100">{creator.creator}</p>
                    <a
                      href={creator.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {creator.channel}
                    </a>
                  </td>
                  <td className="py-2 pr-3 text-slate-300">{creator.trade}</td>
                  <td className="py-2 pr-3 text-slate-300">{creator.estimatedContractorReach}</td>
                  <td className="py-2 pr-3 text-slate-300">{creator.conversionProbability}</td>
                  <td className="py-2 text-slate-400">{creator.dealPage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
