import { qualifyInfluencer, type InfluencerQualification } from "./influencer-outreach-agent";
import type { Influencer, InfluencerAuditLabel } from "./types";

export interface CreatorAuditResult {
  label: InfluencerAuditLabel;
  reason: string;
  qualification: InfluencerQualification;
}

function hasResearchGaps(influencer: Influencer) {
  return !influencer.channel_url || influencer.average_views === null || influencer.engagement_rate === null;
}

export function auditCreator(influencer: Influencer): CreatorAuditResult {
  const qualification = qualifyInfluencer(influencer);
  const gaps = hasResearchGaps(influencer);

  if (influencer.business_focus === "consumer" && qualification.totalScore < 50) {
    return {
      label: "remove",
      reason: "Consumer-heavy audience and low qualification score; keep history but deprioritize for this trade-owner sprint.",
      qualification,
    };
  }

  if (gaps) {
    return {
      label: "needs-research",
      reason: "Potential fit, but missing channel, average-view, or engagement evidence before outreach drafting.",
      qualification,
    };
  }

  if (qualification.totalScore >= 75) {
    return {
      label: "keep",
      reason: "Strong enough owner/operator fit to keep in the active creator shortlist.",
      qualification,
    };
  }

  if (qualification.totalScore >= 50) {
    return {
      label: "maybe",
      reason: "Moderate fit; keep visible but wait for stronger evidence or a better trade angle.",
      qualification,
    };
  }

  return {
    label: "remove",
    reason: "Weak current fit for the first creator sprint; preserve the row but remove from priority review.",
    qualification,
  };
}

export function summarizeCreatorAudit(influencers: Influencer[]) {
  return influencers.reduce(
    (summary, influencer) => {
      const label = influencer.audit_label ?? auditCreator(influencer).label;
      summary[label] += 1;
      return summary;
    },
    { keep: 0, maybe: 0, remove: 0, "needs-research": 0 } satisfies Record<InfluencerAuditLabel, number>,
  );
}
