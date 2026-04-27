import { beachheadTrades } from "./4h-rebuild-data";
import type { CustomerPaceForecast } from "./customer-pace-forecast";
import type { MarketingEventSummary } from "./types";

export type TradeWeeklyTargetStatus = "waiting" | "behind" | "low-track" | "high-track";

export interface TradeWeeklyTarget {
  domain: string;
  trade: string;
  weeklyLowTarget: number;
  weeklyHighTarget: number;
  paidThisWeek: number;
  allTimePaid: number;
  gapToLow: number;
  gapToHigh: number;
  status: TradeWeeklyTargetStatus;
  nextAction: string;
}

export interface TradeWeeklyTargetPlan {
  totalWeeklyLowTarget: number;
  totalWeeklyHighTarget: number;
  totalPaidThisWeek: number;
  totalGapToLow: number;
  totalGapToHigh: number;
  trades: TradeWeeklyTarget[];
  evidence: string;
}

interface TradeWeeklyTargetOptions {
  pace: CustomerPaceForecast;
  weeklySummary: MarketingEventSummary;
  allTimeSummary: MarketingEventSummary;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function paidForTrade(summary: MarketingEventSummary, domain: string) {
  const slug = domain.replace(".city", "");
  const candidates = [slug, domain, domain.toLowerCase(), slug.toLowerCase()];

  for (const key of candidates) {
    const row = summary.dimensions.trades[key];
    if (row) return row.paid;
  }

  return 0;
}

function targetStatus(paidThisWeek: number, lowTarget: number, highTarget: number): TradeWeeklyTargetStatus {
  if (paidThisWeek >= highTarget && highTarget > 0) return "high-track";
  if (paidThisWeek >= lowTarget && lowTarget > 0) return "low-track";
  if (paidThisWeek > 0) return "behind";
  return "waiting";
}

function nextAction(status: TradeWeeklyTargetStatus, domain: string, gapToLow: number, gapToHigh: number) {
  if (status === "high-track") {
    return `Protect ${domain} quality and watch CAC before scaling again.`;
  }
  if (status === "low-track") {
    return `Find ${Math.ceil(gapToHigh).toLocaleString()} more paid customers for the high case.`;
  }
  if (status === "behind") {
    return `Close ${Math.ceil(gapToLow).toLocaleString()} paid customers to hit this week's low case.`;
  }
  return `Get one approved ${domain} test live manually, then log paid conversions here.`;
}

export function buildTradeWeeklyTargetPlan({
  pace,
  weeklySummary,
  allTimeSummary,
}: TradeWeeklyTargetOptions): TradeWeeklyTargetPlan {
  const tradeCount = beachheadTrades.length || 1;
  const weeklyLowTarget = roundOne(pace.requiredWeeklyLow / tradeCount);
  const weeklyHighTarget = roundOne(pace.requiredWeeklyHigh / tradeCount);
  const trades = beachheadTrades.map((trade) => {
    const paidThisWeek = paidForTrade(weeklySummary, trade.domain);
    const allTimePaid = paidForTrade(allTimeSummary, trade.domain);
    const gapToLow = Math.max(0, roundOne(weeklyLowTarget - paidThisWeek));
    const gapToHigh = Math.max(0, roundOne(weeklyHighTarget - paidThisWeek));
    const status = targetStatus(paidThisWeek, weeklyLowTarget, weeklyHighTarget);

    return {
      domain: trade.domain,
      trade: trade.trade,
      weeklyLowTarget,
      weeklyHighTarget,
      paidThisWeek,
      allTimePaid,
      gapToLow,
      gapToHigh,
      status,
      nextAction: nextAction(status, trade.domain, gapToLow, gapToHigh),
    };
  });

  const totalPaidThisWeek = trades.reduce((sum, trade) => sum + trade.paidThisWeek, 0);
  const totalWeeklyLowTarget = roundOne(weeklyLowTarget * tradeCount);
  const totalWeeklyHighTarget = roundOne(weeklyHighTarget * tradeCount);
  const totalGapToLow = Math.max(0, roundOne(totalWeeklyLowTarget - totalPaidThisWeek));
  const totalGapToHigh = Math.max(0, roundOne(totalWeeklyHighTarget - totalPaidThisWeek));

  return {
    totalWeeklyLowTarget,
    totalWeeklyHighTarget,
    totalPaidThisWeek,
    totalGapToLow,
    totalGapToHigh,
    trades,
    evidence: pace.paidCustomers === 0
      ? "No paid customer data is logged yet; targets are an even first-principles split across the beachhead trades."
      : `Targets split the remaining ${pace.remainingToLow.toLocaleString()}-${pace.remainingToHigh.toLocaleString()} customer gap evenly across the five beachhead trades until trade-level paid signal is strong enough to reweight.`,
  };
}
