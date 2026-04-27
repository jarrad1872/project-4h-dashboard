import { qualifyInfluencer } from "./influencer-outreach-agent";
import type { Influencer } from "./types";

export type CreatorOutreachPipelineStage =
  | "qualified"
  | "approved"
  | "sent"
  | "follow_up_due"
  | "replied"
  | "contracted"
  | "content_live"
  | "paid";

export interface CreatorOutreachPipelineBucket {
  stage: CreatorOutreachPipelineStage;
  label: string;
  count: number;
  creators: Influencer[];
  nextAction: string;
}

export interface CreatorOutreachPipelineSummary {
  totalTracked: number;
  readyForApproval: number;
  activeConversations: number;
  liveOrPaid: number;
  buckets: CreatorOutreachPipelineBucket[];
  nextBucket: CreatorOutreachPipelineBucket | null;
  evidence: string;
}

const STAGE_LABELS: Record<CreatorOutreachPipelineStage, string> = {
  qualified: "Qualified",
  approved: "Approved",
  sent: "Sent",
  follow_up_due: "Follow-up due",
  replied: "Replied",
  contracted: "Contracted",
  content_live: "Content live",
  paid: "Paid",
};

const STAGE_NEXT_ACTIONS: Record<CreatorOutreachPipelineStage, string> = {
  qualified: "Draft or review the outreach packet before any external contact.",
  approved: "Ready for Jarrad to send manually with the exact approved creator, copy, URL, and timing.",
  sent: "Watch for reply or wait until the saved follow-up due date.",
  follow_up_due: "Draft the next follow-up for review; do not send from 4H.",
  replied: "Review reply quality, fit, fee, and next creative brief needs.",
  contracted: "Track content package, creator URL, and launch-bundle readiness.",
  content_live: "Confirm events are landing in the scorecard before calling a winner.",
  paid: "Compare paid creator outcomes against CAC and customer target pace.",
};

export const CREATOR_OUTREACH_PIPELINE_ORDER: CreatorOutreachPipelineStage[] = [
  "qualified",
  "approved",
  "sent",
  "follow_up_due",
  "replied",
  "contracted",
  "content_live",
  "paid",
];

function isDue(dateValue: string | null, now: Date) {
  if (!dateValue) return false;
  const dueAt = new Date(dateValue);
  return Number.isFinite(dueAt.getTime()) && dueAt.getTime() <= now.getTime();
}

export function getCreatorOutreachPipelineStage(
  influencer: Influencer,
  now = new Date(),
): CreatorOutreachPipelineStage | null {
  if (influencer.audit_label === "remove" || influencer.status === "declined") return null;
  if (influencer.status === "paid") return "paid";
  if (influencer.status === "content_live") return "content_live";
  if (influencer.status === "contracted" || influencer.outreach_stage === "closed") return "contracted";
  if (influencer.last_response_at || influencer.outreach_stage === "responded" || influencer.status === "negotiating") {
    return "replied";
  }
  if (
    influencer.outreach_stage === "follow_up_due" ||
    (influencer.draft_status === "sent" && isDue(influencer.follow_up_due_at, now) && !influencer.last_response_at)
  ) {
    return "follow_up_due";
  }
  if (influencer.draft_status === "sent" || influencer.outreach_stage === "sent" || influencer.status === "contacted") {
    return "sent";
  }
  if (influencer.draft_status === "approved" || influencer.outreach_stage === "approved") return "approved";
  if (
    influencer.outreach_stage === "qualified" ||
    influencer.audit_label === "keep" ||
    qualifyInfluencer(influencer).totalScore >= 70
  ) {
    return "qualified";
  }

  return null;
}

export function buildCreatorOutreachPipelineSummary(
  influencers: Influencer[],
  now = new Date(),
): CreatorOutreachPipelineSummary {
  const grouped = CREATOR_OUTREACH_PIPELINE_ORDER.reduce(
    (accumulator, stage) => {
      accumulator[stage] = [];
      return accumulator;
    },
    {} as Record<CreatorOutreachPipelineStage, Influencer[]>,
  );

  for (const influencer of influencers) {
    const stage = getCreatorOutreachPipelineStage(influencer, now);
    if (stage) grouped[stage].push(influencer);
  }

  const buckets = CREATOR_OUTREACH_PIPELINE_ORDER.map((stage) => {
    const creators = [...grouped[stage]].sort((a, b) => a.creator_name.localeCompare(b.creator_name));
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: creators.length,
      creators,
      nextAction: STAGE_NEXT_ACTIONS[stage],
    } satisfies CreatorOutreachPipelineBucket;
  });

  const nextBucket =
    buckets.find((bucket) => bucket.stage === "follow_up_due" && bucket.count > 0) ??
    buckets.find((bucket) => bucket.stage === "approved" && bucket.count > 0) ??
    buckets.find((bucket) => bucket.stage === "replied" && bucket.count > 0) ??
    buckets.find((bucket) => bucket.stage === "qualified" && bucket.count > 0) ??
    null;

  const totalTracked = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return {
    totalTracked,
    readyForApproval: grouped.qualified.length + grouped.approved.length,
    activeConversations: grouped.sent.length + grouped.follow_up_due.length + grouped.replied.length,
    liveOrPaid: grouped.content_live.length + grouped.paid.length,
    buckets,
    nextBucket,
    evidence:
      "Q-29 is internal outreach state tracking only: it does not email creators, send follow-ups, create webhooks, publish content, or move money.",
  };
}
