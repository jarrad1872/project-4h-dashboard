import type {
  Influencer,
  InfluencerBusinessFocus,
  InfluencerOutreachDraftStep,
  InfluencerSponsorOpenness,
} from "@/lib/types";
import { TRADE_MAP } from "@/lib/trade-utils";

export interface InfluencerQualification {
  totalScore: number;
  ownerAudienceScore: number;
  tradeFitScore: number;
  averageViewsScore: number;
  trustScore: number;
  productionValueScore: number;
  audienceFitScore: number;
  engagementScore: number;
  sponsorScore: number;
  sizeScore: number;
  sizeTier: "micro" | "emerging" | "established" | "reach";
  recommendation: "priority" | "review" | "watch";
  scoreSignals: string[];
}

export interface OutreachDraft {
  step: InfluencerOutreachDraftStep;
  subject: string;
  body: string;
}

export interface OutreachPacketSummary {
  target: number;
  drafted: number;
  pendingApproval: number;
  approved: number;
  sent: number;
  remaining: number;
  complete: boolean;
}

export const OUTREACH_PACKET_TARGET = 10;
const OFFER_LINE = "$39/mo, 14-day free trial, no credit card required";

const OWNER_AUDIENCE_SCORES: Record<InfluencerBusinessFocus, number> = {
  owners: 25,
  mixed: 15,
  consumer: 5,
};

const SPONSOR_OPENNESS_SCORES: Record<InfluencerSponsorOpenness, number> = {
  low: 5,
  medium: 10,
  high: 15,
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

function scoreText(influencer: Pick<Influencer, "creator_name" | "channel_url" | "notes" | "platform">) {
  return [influencer.creator_name, influencer.channel_url, influencer.notes, influencer.platform].map(safeLower).join(" ");
}

function toDisplayTrade(trade: string) {
  if (!trade.trim()) return "trade";
  if (trade.includes(".city")) return trade;
  return trade;
}

function domainFromDealPage(dealPage: string | null | undefined) {
  if (!dealPage) return null;
  try {
    const url = new URL(dealPage);
    return url.hostname.endsWith(".city") ? url.hostname.toLowerCase() : null;
  } catch {
    const match = dealPage.toLowerCase().match(/[a-z0-9-]+\.city/);
    return match?.[0] ?? null;
  }
}

export function resolveInfluencerTradeDomain(
  influencer: Pick<Influencer, "trade" | "deal_page">,
): string | null {
  const explicitDealDomain = domainFromDealPage(influencer.deal_page);
  if (explicitDealDomain) return explicitDealDomain;

  const trade = influencer.trade;
  const normalized = safeLower(trade).replace(".city", "").replace(/[^a-z0-9]+/g, " ").trim();
  const domainMap: Record<string, string> = {
    plumbing: "pipe",
    plumber: "pipe",
    "lawn care": "mow",
    lawn: "mow",
    landscaping: "mow",
    hvac: "duct",
    painting: "coat",
    painter: "coat",
    roofing: "roofrepair",
    roof: "roofrepair",
    electrical: "electricians",
    electrician: "electricians",
    "pressure washing": "rinse",
    wash: "rinse",
  };

  if (safeLower(trade).includes(".city")) return safeLower(trade);
  const tradeKey = domainMap[normalized] ?? normalized.replace(/\s+/g, "");
  return TRADE_MAP[tradeKey]?.domain ?? null;
}

export function canGenerateOutreachDraft(influencer: Pick<Influencer, "trade" | "deal_page">) {
  return Boolean(resolveInfluencerTradeDomain(influencer));
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
  if (rate === null || rate === undefined || !Number.isFinite(rate)) return 3;
  if (rate >= 8) return 10;
  if (rate >= 5) return 8;
  if (rate >= 3) return 6;
  if (rate >= 1.5) return 4;
  return 2;
}

function averageViewsScore(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 5;
  if (value >= 40000) return 15;
  if (value >= 15000) return 12;
  if (value >= 5000) return 9;
  if (value >= 1000) return 6;
  return 3;
}

const TRADE_KEYWORDS: Record<string, string[]> = {
  pipe: ["plumb", "drain", "sewer", "water heater", "leak", "pipe"],
  duct: ["hvac", "heating", "cooling", "air conditioning", "refrigerant", "technician"],
  mow: ["lawn", "landscape", "mow", "grass", "turf", "yard"],
  pest: ["pest", "termite", "mosquito", "rodent", "exterminator"],
  coat: ["paint", "painter", "painting", "coating", "drywall"],
};

function tradeSlug(trade: string | null | undefined) {
  return safeLower(trade).replace(".city", "").replace(/[^a-z0-9]+/g, "");
}

function tradeFitScore(influencer: Pick<Influencer, "trade" | "creator_name" | "channel_url" | "notes" | "platform" | "business_focus">) {
  const slug = tradeSlug(influencer.trade);
  const text = scoreText(influencer);
  const keywords = TRADE_KEYWORDS[slug] ?? [slug].filter(Boolean);
  const hasTradeLanguage = keywords.some((keyword) => keyword && text.includes(keyword));
  const hasTradeDomain = safeLower(influencer.trade).endsWith(".city");
  const baseline = hasTradeDomain ? 10 : 6;
  const ownerBoost = influencer.business_focus === "owners" ? 4 : influencer.business_focus === "mixed" ? 2 : 0;
  const languageBoost = hasTradeLanguage ? 6 : 0;
  return Math.min(20, baseline + ownerBoost + languageBoost);
}

function trustScore(influencer: Pick<Influencer, "engagement_rate" | "contact_email" | "channel_url" | "notes">) {
  const engagement = engagementScore(influencer.engagement_rate);
  const contact = influencer.contact_email ? 3 : 0;
  const channel = influencer.channel_url ? 2 : 0;
  const notes = influencer.notes ? 2 : 0;
  return Math.min(15, engagement + contact + channel + notes);
}

function productionValueScore(influencer: Pick<Influencer, "platform" | "average_views" | "channel_url" | "notes">) {
  const platform = safeLower(influencer.platform);
  const visualPlatform = ["youtube", "instagram", "tiktok"].includes(platform) ? 4 : 2;
  const viewSignal = typeof influencer.average_views === "number" && influencer.average_views >= 15000 ? 3 : 0;
  const text = scoreText({
    creator_name: "",
    channel_url: influencer.channel_url,
    notes: influencer.notes,
    platform: influencer.platform,
  });
  const productionSignal = /video|demo|sponsor|review|business|operator|crew/.test(text) ? 2 : 0;
  const channelSignal = influencer.channel_url ? 1 : 0;
  return Math.min(10, visualPlatform + viewSignal + productionSignal + channelSignal);
}

export function getAudienceSizeTier(audienceSize: number | null | undefined): InfluencerQualification["sizeTier"] {
  if (!audienceSize || audienceSize < 10000) return "micro";
  if (audienceSize < 50000) return "emerging";
  if (audienceSize < 150000) return "established";
  return "reach";
}

export function qualifyInfluencer(
  influencer: Pick<
    Influencer,
    | "business_focus"
    | "engagement_rate"
    | "sponsor_openness"
    | "audience_size"
    | "average_views"
    | "trade"
    | "creator_name"
    | "channel_url"
    | "notes"
    | "platform"
    | "contact_email"
  >,
) {
  const sizeTier = getAudienceSizeTier(influencer.audience_size);
  const ownerAudienceScore = OWNER_AUDIENCE_SCORES[influencer.business_focus ?? "mixed"];
  const averageViews = averageViewsScore(influencer.average_views);
  const tradeFit = tradeFitScore(influencer);
  const trust = trustScore(influencer);
  const sponsorScore = SPONSOR_OPENNESS_SCORES[influencer.sponsor_openness ?? "medium"];
  const productionValue = productionValueScore(influencer);
  const engagement = engagementScore(influencer.engagement_rate);
  const sizeScore = SIZE_TIER_SCORES[sizeTier];
  const totalScore = ownerAudienceScore + tradeFit + averageViews + sponsorScore + trust + productionValue;
  const scoreSignals = [
    ownerAudienceScore >= 20 ? "owner-heavy audience" : ownerAudienceScore >= 15 ? "mixed owner/DIY audience" : "consumer-heavy audience",
    tradeFit >= 16 ? "clear trade fit" : tradeFit >= 12 ? "assigned trade fit" : "weak trade fit",
    averageViews >= 12 ? "strong average views" : averageViews >= 9 ? "usable average views" : "thin average-view signal",
    sponsorScore >= 15 ? "high sponsor openness" : sponsorScore >= 10 ? "some sponsor history" : "low sponsor signal",
    trust >= 12 ? "trusted contact signals" : trust >= 8 ? "moderate trust signals" : "needs trust research",
    productionValue >= 8 ? "strong production value" : productionValue >= 5 ? "usable production value" : "low production confidence",
  ];

  return {
    totalScore,
    ownerAudienceScore,
    tradeFitScore: tradeFit,
    averageViewsScore: averageViews,
    trustScore: trust,
    productionValueScore: productionValue,
    audienceFitScore: ownerAudienceScore,
    engagementScore: engagement,
    sponsorScore,
    sizeScore,
    sizeTier,
    recommendation: totalScore >= 70 ? "priority" : totalScore >= 50 ? "review" : "watch",
    scoreSignals,
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

export function summarizeOutreachPackets(influencers: Influencer[], target = OUTREACH_PACKET_TARGET): OutreachPacketSummary {
  const drafted = influencers.filter((influencer) => Boolean(influencer.draft_subject && influencer.draft_body)).length;
  const pendingApproval = influencers.filter((influencer) => influencer.draft_status === "pending_approval").length;
  const approved = influencers.filter((influencer) => influencer.draft_status === "approved").length;
  const sent = influencers.filter((influencer) => influencer.draft_status === "sent" || influencer.outreach_stage === "sent").length;

  return {
    target,
    drafted,
    pendingApproval,
    approved,
    sent,
    remaining: Math.max(0, target - drafted),
    complete: drafted >= target && sent === 0,
  };
}

export function generateOutreachDraft(influencer: Influencer, step: InfluencerOutreachDraftStep): OutreachDraft {
  const creatorFirstName = firstName(influencer.creator_name);
  const tradeLabel = toDisplayTrade(influencer.trade);
  const tradeDomain = resolveInfluencerTradeDomain(influencer);
  if (!tradeDomain) {
    throw new Error(`A trade-specific .city domain is required before drafting outreach for ${influencer.creator_name}`);
  }
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
        `We still have room for one ${tradeLabel} creator partner in this launch wave. The structure is simple: flat fee only (${feeRange}), no rev-share, and a ${tradeDomain} demo page with ${OFFER_LINE} for your audience.`,
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
        `If you want me to hold a slot at the ${feeRange} flat-fee range, reply with a yes and I'll send the ${tradeDomain} brief. The offer stays ${OFFER_LINE}. If timing is off, no problem.`,
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
      `We're building around trade-owner workflows, and I think there is a fit for a simple sponsored mention to your audience. The structure is flat-fee only (${feeRange}), no rev-share, with a ${tradeDomain} demo page and ${OFFER_LINE}.`,
      "If you're open, I'll send the brief, launch timing, and the exact email-safe talking points before anything goes live.",
      "",
      "Jarrad",
    ].join("\n"),
  };
}
