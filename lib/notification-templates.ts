/**
 * Telegram notification message templates.
 * All return Markdown-formatted strings for sendTelegram().
 */

import type { ChannelMetrics, AdPlatform } from "@/lib/types";

export interface SignalData {
  platform: string;
  signal: "scale" | "watch" | "kill";
  ctr: number;
  cpa_paid: number;
  activation_rate: number;
  spend: number;
}

export interface AlertFiredData {
  id: string;
  metric: string;
  platform: string;
  operator: string;
  threshold: number;
  action: string;
  current_value: number;
}

export interface DailyReportData {
  campaign_status: string;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_signups: number;
  signals: SignalData[];
  alerts_fired: AlertFiredData[];
  blockers: string[];
}

export interface WeeklyReportData {
  week_start: string;
  prev_week_start?: string;
  platforms: {
    platform: string;
    spend: number;
    prev_spend?: number;
    ctr: number;
    prev_ctr?: number;
    cpa_paid: number;
    prev_cpa_paid?: number;
    activation_rate: number;
    prev_activation_rate?: number;
    signal: string;
    prev_signal?: string;
    signups: number;
    prev_signups?: number;
  }[];
  total_spend: number;
  prev_total_spend?: number;
  budget_total: number;
  budget_used_pct: number;
}

function pctDelta(current: number, previous: number | undefined): string {
  if (previous === undefined || previous === 0) return "";
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return ` (${sign}${delta.toFixed(0)}%)`;
}

function signalEmoji(signal: string): string {
  if (signal === "scale") return "🟢";
  if (signal === "kill") return "🔴";
  return "🟡";
}

export function formatKillSignal(data: SignalData): string {
  return [
    `🔴 *KILL SIGNAL: ${data.platform.toUpperCase()}*`,
    "",
    `CTR: ${data.ctr.toFixed(1)}% | CPA: $${data.cpa_paid.toFixed(0)} | Activation: ${data.activation_rate.toFixed(0)}%`,
    `Spend: $${data.spend.toFixed(0)}`,
    "",
    `*Recommend:* Pause ${data.platform} ads immediately.`,
  ].join("\n");
}

export function formatScaleSignal(data: SignalData): string {
  return [
    `🟢 *SCALE SIGNAL: ${data.platform.toUpperCase()}*`,
    "",
    `CTR: ${data.ctr.toFixed(1)}% | CPA: $${data.cpa_paid.toFixed(0)} | Activation: ${data.activation_rate.toFixed(0)}%`,
    `Spend: $${data.spend.toFixed(0)}`,
    "",
    `*Recommend:* Increase ${data.platform} budget by 50%.`,
  ].join("\n");
}

export function formatAlertFired(data: AlertFiredData): string {
  const opLabel = data.operator === "gt" ? "exceeded" : "fell below";
  return [
    `⚠️ *ALERT: ${data.metric.toUpperCase()} ${opLabel} threshold*`,
    "",
    `Platform: ${data.platform} | Current: ${data.current_value} | Threshold: ${data.threshold}`,
    `Action: ${data.action}`,
  ].join("\n");
}

export function formatDailyReport(data: DailyReportData): string {
  const lines = [
    `📊 *4H Daily Report*`,
    `Campaign: ${data.campaign_status}`,
    "",
    `*Totals (latest week):*`,
    `Spend: $${data.total_spend.toFixed(0)} | Impr: ${data.total_impressions.toLocaleString()} | Clicks: ${data.total_clicks} | Signups: ${data.total_signups}`,
  ];

  if (data.signals.length > 0) {
    lines.push("", "*Signals:*");
    for (const s of data.signals) {
      lines.push(`${signalEmoji(s.signal)} ${s.platform}: ${s.signal.toUpperCase()} (CTR ${s.ctr.toFixed(1)}%, Act ${s.activation_rate.toFixed(0)}%)`);
    }
  }

  if (data.alerts_fired.length > 0) {
    lines.push("", `*Alerts (${data.alerts_fired.length}):*`);
    for (const a of data.alerts_fired) {
      lines.push(`⚠️ ${a.platform} ${a.metric}: ${a.current_value} (threshold: ${a.threshold})`);
    }
  }

  if (data.blockers.length > 0) {
    lines.push("", `*Blockers (${data.blockers.length}):*`);
    for (const b of data.blockers) {
      lines.push(`• ${b}`);
    }
  }

  return lines.join("\n");
}

export function formatWeeklyReport(data: WeeklyReportData): string {
  const lines = [
    `📈 *4H Weekly Report — ${data.week_start}*`,
    "",
    `*Budget:* $${data.total_spend.toFixed(0)}${pctDelta(data.total_spend, data.prev_total_spend)} of $${data.budget_total.toFixed(0)} (${data.budget_used_pct.toFixed(0)}%)`,
    "",
    "*Platform Breakdown:*",
  ];

  for (const p of data.platforms) {
    lines.push(
      `${signalEmoji(p.signal)} *${p.platform.toUpperCase()}* — ${p.signal.toUpperCase()}${p.prev_signal && p.prev_signal !== p.signal ? ` (was ${p.prev_signal})` : ""}`,
    );
    lines.push(
      `  Spend: $${p.spend.toFixed(0)}${pctDelta(p.spend, p.prev_spend)} | CTR: ${p.ctr.toFixed(1)}%${pctDelta(p.ctr, p.prev_ctr)} | CPA: $${p.cpa_paid.toFixed(0)}${pctDelta(p.cpa_paid, p.prev_cpa_paid)}`,
    );
    lines.push(
      `  Activation: ${p.activation_rate.toFixed(0)}%${pctDelta(p.activation_rate, p.prev_activation_rate)} | Signups: ${p.signups}${pctDelta(p.signups, p.prev_signups)}`,
    );
  }

  return lines.join("\n");
}

export function formatTestMessage(): string {
  return [
    "🔧 *4H Engine — Test Message*",
    "",
    "Telegram notifications are working.",
    `Sent at: ${new Date().toISOString()}`,
  ].join("\n");
}
