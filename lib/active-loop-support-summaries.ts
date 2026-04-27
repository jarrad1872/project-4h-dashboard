import { CONTENT_BRIEF_TEMPLATES } from "./content-brief-templates";
import { buildLifecycleFollowupMeasurement } from "./lifecycle-followup-measurement";
import { listMessageMatchBriefs } from "./message-match-briefs";
import { META_AD_LIBRARY_ACCESS_REPORT } from "./meta-ad-library-access";
import type { LifecycleMessage, MarketingEventSummary } from "./types";

export const EMPTY_MARKETING_EVENT_SUMMARY: MarketingEventSummary = {
  total: 0,
  byType: {
    asset_view: 0,
    demo_call: 0,
    signup: 0,
    trial_started: 0,
    activated: 0,
    paid: 0,
  },
  byPlatform: {},
  byTrade: {},
  byAngle: {},
  dimensions: {
    trades: {},
    creators: {},
    creativeAssets: {},
    angles: {},
  },
  paidValueCents: 0,
};

export interface ActiveLoopSupportSummary {
  lifecycle: {
    activeMessages: number;
    pausedMessages: number;
    measuredMessages: number;
    signups: number;
    trialStarts: number;
    activations: number;
    paid: number;
    nextAction: string;
    evidence: string;
  };
  templates: {
    contentBriefs: number;
    messageMatchBriefs: number;
    messageMatchDomains: number;
    savedAdTemplates: number;
    competitorResearchStatus: string;
    nextAction: string;
    evidence: string;
  };
}

export function buildActiveLoopSupportSummary({
  lifecycleMessages,
  marketingSummary,
  savedAdTemplates,
}: {
  lifecycleMessages: LifecycleMessage[];
  marketingSummary: MarketingEventSummary;
  savedAdTemplates: number;
}): ActiveLoopSupportSummary {
  const lifecycle = buildLifecycleFollowupMeasurement(lifecycleMessages, marketingSummary);
  const messageMatchBriefs = listMessageMatchBriefs();
  const messageMatchDomains = new Set(messageMatchBriefs.map((brief) => brief.domain)).size;

  return {
    lifecycle: {
      activeMessages: lifecycle.activeMessages,
      pausedMessages: lifecycle.pausedMessages,
      measuredMessages: lifecycle.measuredMessages,
      signups: lifecycle.signups,
      trialStarts: lifecycle.trialStarts,
      activations: lifecycle.activations,
      paid: lifecycle.paid,
      nextAction: lifecycle.nextAction,
      evidence: lifecycle.evidence,
    },
    templates: {
      contentBriefs: CONTENT_BRIEF_TEMPLATES.length,
      messageMatchBriefs: messageMatchBriefs.length,
      messageMatchDomains,
      savedAdTemplates,
      competitorResearchStatus: META_AD_LIBRARY_ACCESS_REPORT.status,
      nextAction:
        "Use creator briefs, message-match handoffs, and manual competitor notes when a launch bundle or creator packet needs context.",
      evidence:
        "Template support is internal and manual-first. It does not edit sawcity-lite, send outreach, scrape competitors, launch ads, upload to platforms, create webhooks, or spend money.",
    },
  };
}
