import { Card } from "@/components/ui";
import { OverviewActions } from "@/components/overview-actions";
import { PlatformChip, StatusChip } from "@/components/chips";
import { CHANNELS, PLATFORM_LABELS } from "@/lib/constants";
import { DataFiles, readJsonFile } from "@/lib/file-db";
import { calcCtr } from "@/lib/metrics";
import type { Ad, BudgetData, CampaignStatusData, LaunchChecklistItem, MetricsData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const ads = readJsonFile<Ad[]>(DataFiles.ads);
  const budget = readJsonFile<BudgetData>(DataFiles.budget);
  const campaign = readJsonFile<CampaignStatusData>(DataFiles.campaignStatus);
  const metrics = readJsonFile<MetricsData>(DataFiles.metrics);
  const checklist = readJsonFile<LaunchChecklistItem[]>(DataFiles.launchChecklist);

  const latestWeek = metrics.weeks.at(-1);
  const completed = checklist.filter((item) => item.checked).length;
  const progress = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;

  const totalSpent = Object.values(budget.channels).reduce((sum, c) => sum + c.spent, 0);

  const feed = [
    ...ads.map((ad) => ({
      time: ad.createdAt,
      text: `Ad ${ad.id} (${ad.platform}) status: ${ad.status}`,
    })),
    ...metrics.weeks.map((week) => ({
      time: week.updatedAt ?? `${week.weekStart}T00:00:00Z`,
      text: `Scorecard updated for week ${week.weekStart}`,
    })),
    ...checklist
      .filter((item) => item.updatedAt)
      .map((item) => ({ time: item.updatedAt ?? new Date().toISOString(), text: `Launch checklist updated: ${item.label}` })),
  ]
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project 4H — Saw.City Campaign Command</h1>
          <p className="mt-1 text-sm text-slate-400">Live ops view for LinkedIn, YouTube, Meta, and lifecycle execution.</p>
        </div>
        <StatusChip status={campaign.status} />
      </div>

      <Card>
        <h2 className="mb-3 text-sm uppercase tracking-wide text-slate-400">Quick Actions</h2>
        <OverviewActions />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CHANNELS.map((channel) => {
          const channelAds = ads.filter((ad) => ad.platform === channel);
          const channelMetrics = latestWeek?.[channel];
          const ctr = channelMetrics ? calcCtr(channelMetrics) : 0;
          const channelStatus = campaign[`${channel}Status` as keyof CampaignStatusData] as string;

          return (
            <Card key={channel}>
              <div className="mb-2 flex items-center justify-between">
                <PlatformChip platform={channel} />
                <StatusChip status={channelStatus} />
              </div>
              <p className="text-sm text-slate-300">{channelAds.length} ads</p>
              <p className="text-sm text-slate-300">
                ${budget.channels[channel].spent.toLocaleString()} / ${budget.channels[channel].allocated.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-slate-400">Top KPI: CTR {ctr.toFixed(2)}%</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Budget Overview</h3>
          <div className="space-y-3">
            {CHANNELS.map((channel) => {
              const pct = (budget.channels[channel].spent / budget.channels[channel].allocated) * 100 || 0;
              return (
                <div key={channel}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{PLATFORM_LABELS[channel]}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-700">
                    <div className="h-2 rounded bg-green-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Total spent ${totalSpent.toLocaleString()} of ${budget.totalBudget.toLocaleString()}
          </p>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Launch Gate</h3>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500 text-lg font-bold">
              {completed}/{checklist.length}
            </div>
            <div>
              <p className="font-semibold">{progress}% complete</p>
              <p className="text-sm text-slate-400">{progress === 100 ? "READY TO LAUNCH" : "NOT READY"}</p>
            </div>
          </div>

          <h4 className="mb-2 text-sm font-semibold">Recent Activity</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {feed.map((item, idx) => (
              <li key={`${item.time}-${idx}`} className="rounded border border-slate-700 px-2 py-1">
                {item.text}
              </li>
            ))}
            {feed.length === 0 && <li className="text-slate-500">No recent activity yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
