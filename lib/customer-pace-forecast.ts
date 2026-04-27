import { CHANNELS } from "./constants";
import type { MetricsWeek } from "./types";

export type CustomerPaceStatus = "no-data" | "behind" | "low-track" | "high-track";

export interface CustomerPaceForecast {
  targetLow: number;
  targetHigh: number;
  deadline: string;
  paidCustomers: number;
  loggedWeeks: number;
  weeksWithPaid: number;
  weeksRemaining: number;
  currentWeeklyPace: number;
  currentMonthlyPace: number;
  requiredMonthlyLow: number;
  requiredMonthlyHigh: number;
  requiredWeeklyLow: number;
  requiredWeeklyHigh: number;
  projectedCustomers: number;
  projectedLowGap: number;
  projectedHighGap: number;
  remainingToLow: number;
  remainingToHigh: number;
  status: CustomerPaceStatus;
  evidence: string;
  nextBet: string;
}

interface CustomerPaceForecastOptions {
  now?: Date;
  deadline?: string;
  targetLow?: number;
  targetHigh?: number;
}

const DEFAULT_DEADLINE = "2026-12-31";
const DEFAULT_TARGET_LOW = 1000;
const DEFAULT_TARGET_HIGH = 2000;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEKS_PER_MONTH = 52 / 12;

function paidForWeek(week: MetricsWeek) {
  return CHANNELS.reduce((sum, channel) => sum + week[channel].paid, 0);
}

function weeksUntil(deadline: string, now: Date) {
  const deadlineDate = new Date(`${deadline}T23:59:59.999Z`);
  if (Number.isNaN(deadlineDate.getTime())) return 0;
  return Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (DAYS_PER_WEEK * MS_PER_DAY)));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function roundWhole(value: number) {
  return Math.round(value);
}

export function buildCustomerPaceForecast(
  weeks: MetricsWeek[],
  options: CustomerPaceForecastOptions = {},
): CustomerPaceForecast {
  const targetLow = options.targetLow ?? DEFAULT_TARGET_LOW;
  const targetHigh = options.targetHigh ?? DEFAULT_TARGET_HIGH;
  const deadline = options.deadline ?? DEFAULT_DEADLINE;
  const now = options.now ?? new Date();
  const loggedWeeks = weeks.length;
  const paidByWeek = weeks.map(paidForWeek);
  const paidCustomers = paidByWeek.reduce((sum, paid) => sum + paid, 0);
  const weeksWithPaid = paidByWeek.filter((paid) => paid > 0).length;
  const weeksRemaining = weeksUntil(deadline, now);
  const currentWeeklyPace = loggedWeeks > 0 ? paidCustomers / loggedWeeks : 0;
  const currentMonthlyPace = currentWeeklyPace * WEEKS_PER_MONTH;
  const remainingToLow = Math.max(0, targetLow - paidCustomers);
  const remainingToHigh = Math.max(0, targetHigh - paidCustomers);
  const requiredWeeklyLow = weeksRemaining > 0 ? remainingToLow / weeksRemaining : remainingToLow;
  const requiredWeeklyHigh = weeksRemaining > 0 ? remainingToHigh / weeksRemaining : remainingToHigh;
  const requiredMonthlyLow = requiredWeeklyLow * WEEKS_PER_MONTH;
  const requiredMonthlyHigh = requiredWeeklyHigh * WEEKS_PER_MONTH;
  const projectedCustomers = paidCustomers + currentWeeklyPace * weeksRemaining;
  const projectedLowGap = Math.max(0, targetLow - projectedCustomers);
  const projectedHighGap = Math.max(0, targetHigh - projectedCustomers);

  let status: CustomerPaceStatus = "behind";
  if (paidCustomers === 0) status = "no-data";
  else if (projectedCustomers >= targetHigh) status = "high-track";
  else if (projectedCustomers >= targetLow) status = "low-track";

  const evidence = paidCustomers === 0
    ? "No paid customer data logged yet."
    : `Based on ${paidCustomers.toLocaleString()} paid customers across ${loggedWeeks.toLocaleString()} logged weeks, with ${weeksWithPaid.toLocaleString()} paid-signal weeks.`;

  const nextBet = (() => {
    if (status === "no-data") {
      return "Get the first approved creator or paid test live manually, then log paid conversions before calling a winner.";
    }
    if (status === "behind") {
      return `Close the gap to ${Math.ceil(requiredWeeklyLow).toLocaleString()} paid customers/week by prioritizing the strongest weekly report signal.`;
    }
    if (status === "low-track") {
      return `Protect the path to 1,000 and find another ${Math.ceil(requiredWeeklyHigh - currentWeeklyPace).toLocaleString()} paid customers/week for the 2,000-user case.`;
    }
    return "Keep scaling the current winner while watching CAC, activation quality, and creative fatigue.";
  })();

  return {
    targetLow,
    targetHigh,
    deadline,
    paidCustomers,
    loggedWeeks,
    weeksWithPaid,
    weeksRemaining,
    currentWeeklyPace: roundOne(currentWeeklyPace),
    currentMonthlyPace: roundOne(currentMonthlyPace),
    requiredMonthlyLow: roundOne(requiredMonthlyLow),
    requiredMonthlyHigh: roundOne(requiredMonthlyHigh),
    requiredWeeklyLow: roundOne(requiredWeeklyLow),
    requiredWeeklyHigh: roundOne(requiredWeeklyHigh),
    projectedCustomers: roundWhole(projectedCustomers),
    projectedLowGap: roundWhole(projectedLowGap),
    projectedHighGap: roundWhole(projectedHighGap),
    remainingToLow,
    remainingToHigh,
    status,
    evidence,
    nextBet,
  };
}
