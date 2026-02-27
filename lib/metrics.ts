import type { ChannelMetrics } from "@/lib/types";

export function calcCtr(metrics: ChannelMetrics) {
  if (!metrics.impressions) return 0;
  return (metrics.clicks / metrics.impressions) * 100;
}

export function calcCpaStart(metrics: ChannelMetrics) {
  if (!metrics.signups) return 0;
  return metrics.spend / metrics.signups;
}

export function calcActivationRate(metrics: ChannelMetrics) {
  if (!metrics.signups) return 0;
  return (metrics.activations / metrics.signups) * 100;
}

export function calcCpaPaid(metrics: ChannelMetrics) {
  if (!metrics.paid) return 0;
  return metrics.spend / metrics.paid;
}

export function signal(metrics: ChannelMetrics): "scale" | "watch" | "kill" {
  const ctr = calcCtr(metrics);
  const cpaPaid = calcCpaPaid(metrics);
  const activationRate = calcActivationRate(metrics);

  if (metrics.spend >= 300 && (ctr < 0.9 || activationRate < 20 || cpaPaid > 600)) {
    return "kill";
  }

  if (ctr >= 1.6 && activationRate >= 35 && (cpaPaid === 0 || cpaPaid <= 350)) {
    return "scale";
  }

  return "watch";
}
