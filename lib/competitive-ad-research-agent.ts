export type CompetitiveKeywordCategory = "direct" | "trade_saas" | "adjacent";

export type CompetitiveCreativeType = "video" | "image" | "carousel" | "text" | "unknown";

export interface CompetitiveKeywordSeed {
  category: CompetitiveKeywordCategory;
  term: string;
  rationale: string;
}

export interface CompetitiveResearchSource {
  label: string;
  url: string;
  note: string;
}

export interface CompetitiveAdSnapshot {
  id: string;
  source: "meta_ad_library";
  searchTerm: string;
  category: CompetitiveKeywordCategory;
  advertiserName: string;
  advertiserPageId: string | null;
  creativeType: CompetitiveCreativeType;
  primaryText: string | null;
  headline: string | null;
  cta: string | null;
  landingUrl: string | null;
  adSnapshotUrl: string | null;
  platforms: string[];
  status: "active" | "inactive" | "unknown";
  startedRunningAt: string | null;
  capturedAt: string;
  notes: string[];
}

export interface CompetitiveAnalysisPromptInput {
  objectiveTrade: string;
  periodLabel: string;
  coverageNotes?: string[];
  ads: CompetitiveAdSnapshot[];
}

export interface CompetitiveAdvertiserSummary {
  advertiserName: string;
  adsActive: number;
  primaryAngle: string;
  creativeMix: string;
  ctaPattern: string;
  notes?: string | null;
}

export interface CompetitiveWeeklyReportInput {
  periodLabel: string;
  providerSummary: string;
  coverageNotes?: string[];
  advertisers: CompetitiveAdvertiserSummary[];
  marketFindings: string[];
  recommendations: string[];
  notableAds?: Array<{
    advertiserName: string;
    reason: string;
    url?: string | null;
  }>;
}

export const BASE_COMPETITIVE_KEYWORDS: CompetitiveKeywordSeed[] = [
  {
    category: "direct",
    term: "smith.ai",
    rationale: "Direct receptionist/answering competitor with strong SMB positioning.",
  },
  {
    category: "direct",
    term: "ruby receptionists",
    rationale: "Established virtual receptionist competitor with recognizable ad language.",
  },
  {
    category: "direct",
    term: "nexa",
    rationale: "Contractor-focused answering service competitor.",
  },
  {
    category: "direct",
    term: "answerconnect",
    rationale: "24/7 answering service competitor worth monitoring for positioning overlap.",
  },
  {
    category: "adjacent",
    term: "ai receptionist",
    rationale: "Core pain/solution phrasing used across direct and adjacent competitors.",
  },
  {
    category: "adjacent",
    term: "virtual receptionist",
    rationale: "Legacy market phrasing still used by incumbents.",
  },
  {
    category: "adjacent",
    term: "missed calls contractor",
    rationale: "Problem-led positioning closer to our call-answering message.",
  },
  {
    category: "trade_saas",
    term: "plumber software",
    rationale: "High-relevance trade-SaaS adjacency for `pipe.city`.",
  },
  {
    category: "trade_saas",
    term: "hvac software",
    rationale: "High-volume adjacent category with similar owner-operator pains.",
  },
  {
    category: "trade_saas",
    term: "jobber",
    rationale: "Major home-service SaaS competitor for messaging comparison.",
  },
  {
    category: "trade_saas",
    term: "housecall pro",
    rationale: "Large trade-SaaS advertiser with broad category coverage.",
  },
  {
    category: "trade_saas",
    term: "servicetitan",
    rationale: "Category leader with strong creative scale and budget signal.",
  },
];

export const COMPETITIVE_RESEARCH_SOURCES: CompetitiveResearchSource[] = [
  {
    label: "Meta Ad Library overview",
    url: "https://about.fb.com/wp-content/uploads/sites/10/2020/09/Facebook_Response_European_Democracy_Action_Plan_2020.09.15.pdf",
    note: "Meta says Ad Library includes all currently active ads across Facebook apps and services.",
  },
  {
    label: "Meta Radlibrary setup",
    url: "https://facebookresearch.github.io/Radlibrary/articles/Radlibrary.html",
    note: "Meta's own research tooling docs require a developer account, token retrieval, and identity/location verification.",
  },
  {
    label: "Anthropic pricing",
    url: "https://platform.claude.com/docs/en/about-claude/pricing",
    note: "Claude API is usage-priced, so analysis cost should be treated as low-but-non-zero unless covered internally.",
  },
];

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => readString(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function createSnapshotId(input: Record<string, unknown>, searchTerm: string) {
  const parts = [
    readString(input.id),
    readString(input.ad_archive_id),
    readString(input.ad_snapshot_url),
    readString(input.page_id),
    searchTerm,
  ].filter((part): part is string => Boolean(part));

  return parts.join("::");
}

function inferCreativeType(input: Record<string, unknown>): CompetitiveCreativeType {
  const explicitType = readString(input.creative_type)?.toLowerCase();
  if (explicitType === "video" || explicitType === "image" || explicitType === "carousel" || explicitType === "text") {
    return explicitType;
  }

  if (readString(input.video_hd_url) || readString(input.video_sd_url)) return "video";

  const cards = Array.isArray(input.cards) ? input.cards : [];
  if (cards.length > 1) return "carousel";

  const images = Array.isArray(input.images) ? input.images : [];
  if (images.length > 0 || readString(input.image_url)) return "image";

  const body = readString(input.ad_creative_body);
  const headline = readString(input.ad_creative_link_title);
  if (body || headline) return "text";

  return "unknown";
}

function inferStatus(input: Record<string, unknown>) {
  const explicitStatus = readString(input.status)?.toLowerCase();
  if (explicitStatus === "active" || explicitStatus === "inactive") return explicitStatus;

  const activeStatus = readString(input.ad_active_status)?.toUpperCase();
  if (activeStatus === "ACTIVE") return "active" as const;
  if (activeStatus === "INACTIVE") return "inactive" as const;

  return "unknown" as const;
}

function inferPlatforms(input: Record<string, unknown>) {
  const direct = readStringArray(input.publisher_platforms);
  if (direct.length > 0) return direct;

  const single = readString(input.publisher_platform);
  return single ? [single] : [];
}

export function normalizeMetaAdSnapshot(
  input: Record<string, unknown>,
  context: {
    searchTerm: string;
    category: CompetitiveKeywordCategory;
    capturedAt?: string;
  },
): CompetitiveAdSnapshot {
  const advertiserName = readString(input.page_name) ?? "Unknown advertiser";
  const notes: string[] = [];

  if (!readString(input.page_name)) {
    notes.push("Missing advertiser name in source payload.");
  }

  if (!readString(input.link_url) && !readString(input.landing_url)) {
    notes.push("Landing URL missing from source payload.");
  }

  const id = createSnapshotId(input, context.searchTerm);

  return {
    id: id || `${context.category}::${context.searchTerm}::${advertiserName}`,
    source: "meta_ad_library",
    searchTerm: context.searchTerm,
    category: context.category,
    advertiserName,
    advertiserPageId: readString(input.page_id),
    creativeType: inferCreativeType(input),
    primaryText: readString(input.ad_creative_body),
    headline: readString(input.ad_creative_link_title),
    cta: readString(input.cta_text),
    landingUrl: readString(input.link_url) ?? readString(input.landing_url),
    adSnapshotUrl: readString(input.ad_snapshot_url),
    platforms: inferPlatforms(input),
    status: inferStatus(input),
    startedRunningAt: readString(input.ad_delivery_start_time) ?? readString(input.start_date),
    capturedAt: context.capturedAt ?? new Date().toISOString(),
    notes,
  };
}

export function buildCompetitiveAnalysisPrompt(input: CompetitiveAnalysisPromptInput) {
  const coverageNotes = input.coverageNotes && input.coverageNotes.length > 0
    ? input.coverageNotes.map((note) => `- ${note}`).join("\n")
    : "- No additional coverage caveats supplied.";

  return [
    `Analyze the following competitor ad snapshots for ${input.objectiveTrade}.`,
    "",
    `Period: ${input.periodLabel}`,
    "Coverage notes:",
    coverageNotes,
    "",
    "Return markdown with these sections:",
    "1. Observed market angles",
    "2. Creative-format patterns",
    "3. CTA and landing-page patterns",
    "4. Gaps we can exploit",
    "5. Three concrete recommendations for the next 4H ad batch",
    "",
    "Rules:",
    "- Separate observation from inference.",
    "- If coverage is incomplete, say so plainly.",
    "- Prefer trade-owner/operator insights over generic SaaS commentary.",
    "- Do not invent spend data if it is not present in the snapshots.",
    "",
    "Normalized snapshots:",
    JSON.stringify(input.ads, null, 2),
  ].join("\n");
}

export function buildCompetitiveWeeklyReport(input: CompetitiveWeeklyReportInput) {
  const coverageNotes = input.coverageNotes ?? [];
  const notableAds = input.notableAds ?? [];

  const advertiserRows = input.advertisers.length
    ? input.advertisers
        .map(
          (advertiser) =>
            `| ${advertiser.advertiserName} | ${advertiser.adsActive} | ${advertiser.primaryAngle} | ${advertiser.creativeMix} | ${advertiser.ctaPattern} |`,
        )
        .join("\n")
    : "| None captured | 0 | n/a | n/a | n/a |";

  const marketFindings = input.marketFindings.length
    ? input.marketFindings.map((finding) => `- ${finding}`).join("\n")
    : "- No market findings recorded.";

  const recommendations = input.recommendations.length
    ? input.recommendations.map((recommendation, index) => `${index + 1}. ${recommendation}`).join("\n")
    : "1. No recommendations recorded.";

  const coverageBlock = coverageNotes.length
    ? coverageNotes.map((note) => `- ${note}`).join("\n")
    : "- Coverage matched the planned collection scope for this run.";

  const notableBlock = notableAds.length
    ? notableAds
        .map((ad) =>
          ad.url
            ? `- ${ad.advertiserName}: ${ad.reason} (${ad.url})`
            : `- ${ad.advertiserName}: ${ad.reason}`,
        )
        .join("\n")
    : "- No notable ads highlighted this week.";

  return [
    `## Competitive Ad Intelligence - ${input.periodLabel}`,
    "",
    `Provider summary: ${input.providerSummary}`,
    "",
    "### Coverage Notes",
    coverageBlock,
    "",
    "### Active Competitor Summary",
    "| Advertiser | Ads Active | Primary Angle | Creative Mix | CTA Pattern |",
    "| --- | ---: | --- | --- | --- |",
    advertiserRows,
    "",
    "### Messaging Landscape",
    marketFindings,
    "",
    "### Recommendations for 4H",
    recommendations,
    "",
    "### Notable Ads",
    notableBlock,
  ].join("\n");
}
