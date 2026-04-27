import type { LifecycleMessage, MarketingEventSummary } from "./types";

export interface LifecycleFollowupRate {
  label: string;
  from: number;
  to: number;
  rate: number | null;
  note: string;
}

export interface LifecycleStageCoverage {
  timing: string;
  active: number;
  paused: number;
  channelCount: number;
}

export interface LifecycleFollowupMeasurement {
  signups: number;
  trialStarts: number;
  activations: number;
  paid: number;
  activeMessages: number;
  pausedMessages: number;
  measuredMessages: number;
  rates: LifecycleFollowupRate[];
  coverage: LifecycleStageCoverage[];
  nextAction: string;
  evidence: string;
}

const FOLLOWUP_TIMINGS = ["day_1", "day_3", "day_7", "day_10", "day_13", "conversion", "post_conversion"] as const;

function pct(from: number, to: number) {
  if (from <= 0) return null;
  return to / from;
}

function rateNote(from: number, to: number, label: string) {
  if (from <= 0) return `No ${label} base is logged yet.`;
  if (to <= 0) return `No downstream ${label} conversions are logged yet.`;
  return `${to.toLocaleString()} of ${from.toLocaleString()} reached the next lifecycle step.`;
}

export function buildLifecycleFollowupMeasurement(
  messages: LifecycleMessage[],
  summary: MarketingEventSummary,
): LifecycleFollowupMeasurement {
  const signups = summary.byType.signup;
  const trialStarts = summary.byType.trial_started;
  const activations = summary.byType.activated;
  const paid = summary.byType.paid;
  const followupMessages = messages.filter((message) => FOLLOWUP_TIMINGS.includes(message.timing as (typeof FOLLOWUP_TIMINGS)[number]));
  const activeMessages = followupMessages.filter((message) => message.status === "active").length;
  const pausedMessages = followupMessages.filter((message) => message.status === "paused").length;
  const coverage = FOLLOWUP_TIMINGS.map((timing) => {
    const timingRows = followupMessages.filter((message) => message.timing === timing);
    return {
      timing,
      active: timingRows.filter((message) => message.status === "active").length,
      paused: timingRows.filter((message) => message.status === "paused").length,
      channelCount: new Set(timingRows.map((message) => message.channel)).size,
    };
  }).filter((row) => row.active + row.paused > 0);

  const rates: LifecycleFollowupRate[] = [
    {
      label: "Signup to trial",
      from: signups,
      to: trialStarts,
      rate: pct(signups, trialStarts),
      note: rateNote(signups, trialStarts, "signup"),
    },
    {
      label: "Trial to activation",
      from: trialStarts,
      to: activations,
      rate: pct(trialStarts, activations),
      note: rateNote(trialStarts, activations, "trial"),
    },
    {
      label: "Activation to paid",
      from: activations,
      to: paid,
      rate: pct(activations, paid),
      note: rateNote(activations, paid, "activation"),
    },
  ];

  let nextAction = "Log the first signup, trial, activation, and paid events before judging lifecycle copy.";
  if (signups > 0 && trialStarts === 0) {
    nextAction = "Audit the day-1 and day-3 follow-ups before adding more top-of-funnel traffic.";
  } else if (trialStarts > 0 && activations === 0) {
    nextAction = "Use follow-ups to push trial users toward first captured job or demo proof.";
  } else if (activations > 0 && paid === 0) {
    nextAction = "Tighten conversion follow-ups around the $39/mo trial-to-paid handoff.";
  } else if (paid > 0) {
    nextAction = "Compare lifecycle cohorts by trade and keep the follow-up path that produces paid conversions.";
  }

  return {
    signups,
    trialStarts,
    activations,
    paid,
    activeMessages,
    pausedMessages,
    measuredMessages: followupMessages.length,
    rates,
    coverage,
    nextAction,
    evidence:
      summary.total === 0
        ? "No marketing events are logged yet; lifecycle measurement is waiting for real signup and conversion data."
        : "Lifecycle measurement uses marketing_events funnel counts only. It does not send email, SMS, push, webhooks, or external actions.",
  };
}
