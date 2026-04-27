export type CompetitorEvidenceQuality = "observed" | "partial" | "inferred" | "unverified";

export interface CompetitorResearchField {
  key: string;
  label: string;
  guidance: string;
  required: boolean;
}

export interface CompetitorEvidenceRule {
  quality: CompetitorEvidenceQuality;
  label: string;
  meaning: string;
  allowedUse: string;
}

export interface CompetitorResearchTemplate {
  id: string;
  title: string;
  sourceRule: string;
  fields: CompetitorResearchField[];
  evidenceRules: CompetitorEvidenceRule[];
  reportSections: string[];
  blockedClaims: string[];
}

export const COMPETITOR_RESEARCH_TEMPLATE: CompetitorResearchTemplate = {
  id: "manual-competitor-ad-snapshot",
  title: "Manual competitor ad snapshot",
  sourceRule:
    "Use one source URL per observed ad or competitor page. If the source is unavailable, mark the row unverified and do not turn it into a recommendation.",
  fields: [
    {
      key: "captured_at",
      label: "Captured date",
      guidance: "Date the ad or competitor page was observed.",
      required: true,
    },
    {
      key: "competitor",
      label: "Advertiser / competitor",
      guidance: "Page, brand, or product name exactly as observed.",
      required: true,
    },
    {
      key: "source_url",
      label: "Citation URL",
      guidance: "Meta Ad Library URL, landing page URL, screenshot reference, or vendor report URL.",
      required: true,
    },
    {
      key: "source_type",
      label: "Source type",
      guidance: "Public Ad Library, landing page, organic post, third-party report, or previously approved token-test result.",
      required: true,
    },
    {
      key: "country",
      label: "Country / delivery region",
      guidance: "Country selected in the source view. Use unknown if the source does not expose it.",
      required: true,
    },
    {
      key: "platforms",
      label: "Platforms",
      guidance: "Facebook, Instagram, Threads, YouTube, LinkedIn, TikTok, or unknown.",
      required: true,
    },
    {
      key: "offer",
      label: "Offer",
      guidance: "Trial, demo, discount, consult, price, guarantee, or no clear offer.",
      required: true,
    },
    {
      key: "hook",
      label: "Primary hook",
      guidance: "The first promise or pain point the ad leads with.",
      required: true,
    },
    {
      key: "visual_pattern",
      label: "Visual pattern",
      guidance: "UGC, founder talking head, product screenshot, jobsite proof, text card, testimonial, or other visible format.",
      required: true,
    },
    {
      key: "cta",
      label: "CTA",
      guidance: "Button or implied next action, such as book demo, start trial, learn more, call now.",
      required: true,
    },
    {
      key: "landing_message",
      label: "Landing message",
      guidance: "First-screen promise or destination message if observed.",
      required: false,
    },
    {
      key: "evidence_quality",
      label: "Evidence quality",
      guidance: "Observed, partial, inferred, or unverified.",
      required: true,
    },
    {
      key: "coverage_note",
      label: "Coverage note",
      guidance: "Limits such as country filter, active-only view, missing creative, API zero result, or third-party estimate.",
      required: true,
    },
    {
      key: "4h_takeaway",
      label: "4H takeaway",
      guidance: "One action this should inform, or 'no action' if evidence is weak.",
      required: true,
    },
  ],
  evidenceRules: [
    {
      quality: "observed",
      label: "Observed",
      meaning: "Source URL, ad creative, offer, hook, platform, and capture date are directly visible.",
      allowedUse: "Can support a direct pattern note or creative test idea.",
    },
    {
      quality: "partial",
      label: "Partial",
      meaning: "Some fields are visible, but platform, region, landing page, or creative detail is missing.",
      allowedUse: "Can support a question or weak signal, not a confident recommendation.",
    },
    {
      quality: "inferred",
      label: "Inferred",
      meaning: "The conclusion depends on interpretation, a third-party summary, or a non-primary source.",
      allowedUse: "Must be labeled as inference and paired with a validation step.",
    },
    {
      quality: "unverified",
      label: "Unverified",
      meaning: "No durable source URL or screenshot reference is available.",
      allowedUse: "Do not use for strategy decisions.",
    },
  ],
  reportSections: [
    "Coverage notes",
    "Observed offers",
    "Hook patterns",
    "Visual patterns",
    "Platform mix",
    "Landing-page match",
    "Evidence gaps",
    "4H recommendations",
  ],
  blockedClaims: [
    "Do not infer competitor spend from Meta Ad Library unless the source exposes official ranges.",
    "Do not call a hook a winner without conversion evidence.",
    "Do not treat third-party vendor estimates as official Meta data.",
    "Do not scrape or use reverse-engineered endpoints from this repo.",
  ],
};

export function requiredCompetitorResearchFields(template: CompetitorResearchTemplate = COMPETITOR_RESEARCH_TEMPLATE) {
  return template.fields.filter((field) => field.required);
}

export function buildCompetitorResearchPacket(template: CompetitorResearchTemplate = COMPETITOR_RESEARCH_TEMPLATE) {
  const fields = template.fields
    .map((field) => `- ${field.label}${field.required ? " (required)" : ""}: ${field.guidance}`)
    .join("\n");

  const evidence = template.evidenceRules
    .map((rule) => `- ${rule.label}: ${rule.meaning} Allowed use: ${rule.allowedUse}`)
    .join("\n");

  const sections = template.reportSections.map((section, index) => `${index + 1}. ${section}`).join("\n");
  const blocked = template.blockedClaims.map((claim) => `- ${claim}`).join("\n");

  return [
    `# ${template.title}`,
    "",
    `Source rule: ${template.sourceRule}`,
    "",
    "## Capture Fields",
    fields,
    "",
    "## Evidence Quality",
    evidence,
    "",
    "## Report Sections",
    sections,
    "",
    "## Blocked Claims",
    blocked,
  ].join("\n");
}
