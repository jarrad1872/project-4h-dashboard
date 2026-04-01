import type {
  Influencer,
  InfluencerBusinessFocus,
  InfluencerOutreachDraftStep,
  InfluencerSponsorOpenness,
} from "@/lib/types";

export interface InfluencerQualification {
  totalScore: number;
  audienceFitScore: number;
  engagementScore: number;
  sponsorScore: number;
  sizeScore: number;
  sizeTier: "micro" | "emerging" | "established" | "reach";
  recommendation: "priority" | "review" | "watch";
}

export interface OutreachDraft {
  step: InfluencerOutreachDraftStep;
  subject: string;
  body: string;
}

const AUDIENCE_FIT_SCORES: Record<InfluencerBusinessFocus, number> = {
  owners: 40,
  mixed: 24,
  consumer: 8,
};

const SPONSOR_OPENNESS_SCORES: Record<InfluencerSponsorOpenness, number> = {
  low: 8,
  medium: 16,
  high: 24,
};

const SIZE_TIER_SCORES = {
  micro: 10,
  emerging: 16,
  established: 22,
  reach: 18,
} as const;

function safeLower(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toDisplayTrade(trade: string) {
  if (!trade.trim()) return "trade";
  if (trade.includes(".city")) return trade;
  return trade;
}

function toFeeRange(influencer: Influencer) {
  if (typeof influencer.flat_fee_amount === "number" && influencer.flat_fee_amount > 0) {
    return `$${Math.round(influencer.flat_fee_amount)}`;
  }

  return "$200-$500";
}

function firstName(creatorName: string) {
  return creatorName.trim().split(/\s+/)[0] ?? creatorName.trim();
}

function summarizeNote(notes: string | null | undefined) {
  if (!notes) return null;
  const cleaned = notes.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
}

function engagementScore(rate: number | null | undefined) {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) return 8;
  if (rate >= 8) return 14;
  if (rate >= 5) return 12;
  if (rate >= 3) return 10;
  if (rate >= 1.5) return 8;
  return 5;
}

export function getAudienceSizeTier(audienceSize: number | null | undefined): InfluencerQualification["sizeTier"] {
  if (!audienceSize || audienceSize < 10000) return "micro";
  if (audienceSize < 50000) return "emerging";
  if (audienceSize < 150000) return "established";
  return "reach";
}

export function qualifyInfluencer(influencer: Pick<Influencer, "business_focus" | "engagement_rate" | "sponsor_openness" | "audience_size">) {
  const sizeTier = getAudienceSizeTier(influencer.audience_size);
  const audienceFitScore = AUDIENCE_FIT_SCORES[influencer.business_focus ?? "mixed"];
  const engagement = engagementScore(influencer.engagement_rate);
  const sponsorScore = SPONSOR_OPENNESS_SCORES[influencer.sponsor_openness ?? "medium"];
  const sizeScore = SIZE_TIER_SCORES[sizeTier];
  const totalScore = audienceFitScore + engagement + sponsorScore + sizeScore;

  return {
    totalScore,
    audienceFitScore,
    engagementScore: engagement,
    sponsorScore,
    sizeScore,
    sizeTier,
    recommendation: totalScore >= 70 ? "priority" : totalScore >= 50 ? "review" : "watch",
  } satisfies InfluencerQualification;
}

export function getNextDraftStep(influencer: Pick<Influencer, "draft_step" | "draft_status" | "follow_up_due_at" | "last_response_at">, now = new Date()) {
  if (influencer.last_response_at) return null;

  if (influencer.draft_status === "sent" && influencer.follow_up_due_at) {
    const followUpDue = new Date(influencer.follow_up_due_at);
    if (followUpDue.getTime() <= now.getTime()) {
      if (influencer.draft_step === "initial") return "follow_up_1" as const;
      if (influencer.draft_step === "follow_up_1") return "follow_up_2" as const;
    }
  }

  if (influencer.draft_status === "not_started" || influencer.draft_status === "rejected") {
    return "initial" as const;
  }

  return null;
}

export function getNextFollowUpDate(step: InfluencerOutreachDraftStep, now = new Date()) {
  const due = new Date(now);

  if (step === "initial") {
    due.setDate(due.getDate() + 3);
    return due.toISOString();
  }

  if (step === "follow_up_1") {
    due.setDate(due.getDate() + 4);
    return due.toISOString();
  }

  return null;
}

export function generateOutreachDraft(influencer: Influencer, step: InfluencerOutreachDraftStep): OutreachDraft {
  const creatorFirstName = firstName(influencer.creator_name);
  const tradeLabel = toDisplayTrade(influencer.trade);
  const feeRange = toFeeRange(influencer);
  const noteSummary = summarizeNote(influencer.notes);
  const channel = safeLower(influencer.platform);
  const subjectTrade = tradeLabel === "trade" ? "Project 4H" : tradeLabel;

  if (step === "follow_up_1") {
    return {
      step,
      subject: `${creatorFirstName}, checking in on ${subjectTrade}`,
      body: [
        `Hi ${creatorFirstName},`,
        "",
        "Following up in case my first note got buried.",
        `We still have room for one ${tradeLabel} creator partner in this launch wave. The structure is simple: flat fee only (${feeRange}), no rev-share, and a co-branded page with a 14-day free trial for your audience.`,
        "If that is in range, reply and I'll send the one-page brief plus the exact talking points.",
        "",
        "Jarrad",
      ].join("\n"),
    };
  }

  if (step === "follow_up_2") {
    return {
      step,
      subject: `Last follow-up for ${subjectTrade}`,
      body: [
        `Hi ${creatorFirstName},`,
        "",
        `Last follow-up from me. We are locking the first round of ${tradeLabel} creator partners this week.`,
        `If you want me to hold a slot at the ${feeRange} flat-fee range, reply with a yes and I'll send the brief. If timing is off, no problem.`,
        "",
        "Jarrad",
      ].join("\n"),
    };
  }

  const introLine =
    noteSummary
      ? `What stood out in research: ${noteSummary}`
      : `You stood out because your ${channel || "creator"} audience looks much closer to business owners than DIY viewers.`;

  return {
    step,
    subject: `${creatorFirstName} x ${subjectTrade}`,
    body: [
      `Hi ${creatorFirstName},`,
      "",
      `I've been reviewing ${tradeLabel} creators for our launch list and wanted to reach out directly.`,
      introLine,
      `We're building around trade-owner workflows, and I think there is a fit for a simple sponsored mention to your audience. The structure is flat-fee only (${feeRange}), no rev-share, with a co-branded page and a 14-day free trial for your audience.`,
      "If you're open, I'll send the brief, launch timing, and the exact email-safe talking points before anything goes live.",
      "",
      "Jarrad",
    ].join("\n"),
  };
}
