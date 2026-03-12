/**
 * Engine evaluation logic.
 * Runs signal() per platform, evaluates alert rules, generates recommendations.
 * Used by both the VPS engine script and CLI dry-run.
 */

import type { ChannelMetrics, MetricsWeek, AdPlatform } from "@/lib/types";
import { signal, calcCtr, calcCpaPaid, calcActivationRate } from "@/lib/metrics";
import type { SignalData, AlertFiredData } from "@/lib/notification-templates";

export interface AlertRule {
  id: string;
  metric: string;
  platform: string;
  operator: string;
  threshold: number;
  action: string;
}

export interface EngineResult {
  signals: SignalData[];
  alerts_fired: AlertFiredData[];
  recommendations: string[];
}

const PLATFORMS: AdPlatform[] = ["linkedin", "youtube", "facebook", "instagram"];

function metricValue(metrics: ChannelMetrics, metric: string): number {
  switch (metric) {
    case "spend":
      return metrics.spend;
    case "ctr":
      return calcCtr(metrics);
    case "cac":
    case "cpa":
      return calcCpaPaid(metrics);
    case "signups":
      return metrics.signups;
    case "activations":
      return metrics.activations;
    case "impressions":
      return metrics.impressions;
    case "clicks":
      return metrics.clicks;
    case "paid":
      return metrics.paid;
    default:
      return 0;
  }
}

/** Evaluate signals for each platform in the latest week. */
export function evaluateSignals(latestWeek: MetricsWeek): SignalData[] {
  const results: SignalData[] = [];

  for (const platform of PLATFORMS) {
    const ch = latestWeek[platform];
    if (!ch || (ch.spend === 0 && ch.impressions === 0)) continue;

    const sig = signal(ch);
    results.push({
      platform,
      signal: sig,
      ctr: calcCtr(ch),
      cpa_paid: calcCpaPaid(ch),
      activation_rate: calcActivationRate(ch),
      spend: ch.spend,
    });
  }

  return results;
}

/** Evaluate alert rules against current metrics. */
export function evaluateAlerts(
  rules: AlertRule[],
  latestWeek: MetricsWeek,
): AlertFiredData[] {
  const fired: AlertFiredData[] = [];

  for (const rule of rules) {
    const platforms = rule.platform === "all" ? PLATFORMS : [rule.platform as AdPlatform];

    for (const platform of platforms) {
      const ch = latestWeek[platform];
      if (!ch) continue;

      const current = metricValue(ch, rule.metric);
      let triggered = false;

      if (rule.operator === "gt" && current > rule.threshold) triggered = true;
      if (rule.operator === "lt" && current < rule.threshold) triggered = true;

      if (triggered) {
        fired.push({
          id: rule.id,
          metric: rule.metric,
          platform,
          operator: rule.operator,
          threshold: rule.threshold,
          action: rule.action,
          current_value: Math.round(current * 100) / 100,
        });
      }
    }
  }

  return fired;
}

/** Generate actionable recommendations from signals and alerts. */
export function generateRecommendations(
  signals: SignalData[],
  alerts: AlertFiredData[],
): string[] {
  const recs: string[] = [];

  for (const s of signals) {
    if (s.signal === "kill") {
      recs.push(`PAUSE ${s.platform.toUpperCase()} — CTR ${s.ctr.toFixed(1)}%, CPA $${s.cpa_paid.toFixed(0)}, Activation ${s.activation_rate.toFixed(0)}%`);
    } else if (s.signal === "scale") {
      recs.push(`INCREASE ${s.platform.toUpperCase()} budget by 50% — CTR ${s.ctr.toFixed(1)}%, CPA $${s.cpa_paid.toFixed(0)}, Activation ${s.activation_rate.toFixed(0)}%`);
    }
  }

  for (const a of alerts) {
    if (a.action === "kill") {
      recs.push(`PAUSE ${a.platform.toUpperCase()} — ${a.metric} ${a.operator === "gt" ? "above" : "below"} ${a.threshold} (current: ${a.current_value})`);
    } else if (a.action === "scale") {
      recs.push(`SCALE ${a.platform.toUpperCase()} — ${a.metric} hit target (current: ${a.current_value})`);
    } else {
      recs.push(`CHECK ${a.platform.toUpperCase()} — ${a.metric} alert: ${a.current_value} ${a.operator === "gt" ? ">" : "<"} ${a.threshold}`);
    }
  }

  return recs;
}

/** Run the full evaluation loop. Returns structured result. */
export function runEvaluation(
  latestWeek: MetricsWeek,
  alertRules: AlertRule[],
): EngineResult {
  const signals = evaluateSignals(latestWeek);
  const alerts_fired = evaluateAlerts(alertRules, latestWeek);
  const recommendations = generateRecommendations(signals, alerts_fired);
  return { signals, alerts_fired, recommendations };
}
