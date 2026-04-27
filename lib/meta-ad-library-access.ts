export type MetaAccessFindingKind = "available" | "limit" | "assumption" | "decision";

export interface MetaAccessFinding {
  kind: MetaAccessFindingKind;
  title: string;
  detail: string;
  sourceLabel?: string;
  sourceUrl?: string;
}

export interface MetaAdLibraryAccessReport {
  id: string;
  generatedAt: string;
  status: "validated-limited";
  verdict: string;
  officialFindings: MetaAccessFinding[];
  assumptionsToValidate: MetaAccessFinding[];
  recommendedPath: string[];
  blockedAutomation: string[];
}

export const META_AD_LIBRARY_ACCESS_REPORT: MetaAdLibraryAccessReport = {
  id: "q21-meta-ad-library-access",
  generatedAt: "2026-04-27",
  status: "validated-limited",
  verdict:
    "Official Meta access is useful for manual competitor review and limited API validation, but it is not production-safe for automated US commercial competitor monitoring without a token smoke test and coverage proof.",
  officialFindings: [
    {
      kind: "available",
      title: "Public web library covers active ads",
      detail:
        "Meta says all currently running ads across Meta technologies should be searched in the public Ad Library web experience.",
      sourceLabel: "Meta Ad Library API",
      sourceUrl: "https://www.facebook.com/ads/library/api/",
    },
    {
      kind: "limit",
      title: "API scope is not broad US commercial monitoring",
      detail:
        "The official API is documented for social, election, or political ads delivered globally during the last seven years, plus ads of any type delivered to the UK or EU during the past year.",
      sourceLabel: "Meta Ad Library API",
      sourceUrl: "https://www.facebook.com/ads/library/api/",
    },
    {
      kind: "limit",
      title: "Non-EU commercial delivery is the hard gap",
      detail:
        "Meta notes that ads that did not reach any EU location only return from the API when they are social, election, or political ads. That makes US home-service SaaS competitor coverage uncertain through the official API.",
      sourceLabel: "Meta Ad Library API",
      sourceUrl: "https://www.facebook.com/ads/library/api/",
    },
    {
      kind: "available",
      title: "API requires account and app setup",
      detail:
        "Authorization requires identity and location confirmation, a Meta for Developers account, an app, and an access token before making Graph API requests.",
      sourceLabel: "Meta Ad Library API",
      sourceUrl: "https://www.facebook.com/ads/library/api/",
    },
    {
      kind: "limit",
      title: "Spend and impression fields are constrained",
      detail:
        "Spend and impression ranges are available for political and issue ads, while UK/EU ads expose estimated reach and transparency fields. Exact commercial spend should not be inferred from official API output.",
      sourceLabel: "Meta Ad Library API",
      sourceUrl: "https://www.facebook.com/ads/library/api/",
    },
    {
      kind: "limit",
      title: "Creative snapshots are analysis-only",
      detail:
        "Meta exposes ad snapshot URLs and individual creative downloads for analysis, but says batch creative downloads are not currently available and use must comply with data storage terms.",
      sourceLabel: "Meta Ad Library API",
      sourceUrl: "https://www.facebook.com/ads/library/api/",
    },
    {
      kind: "limit",
      title: "Content Library is researcher-gated",
      detail:
        "Meta Content Library has UI and API access for researchers through secure computing environments. It is not a ready commercial growth workflow for 4H.",
      sourceLabel: "SOMAR Meta Content Library",
      sourceUrl: "https://www.icpsr.umich.edu/sites/somar/meta-content-library",
    },
  ],
  assumptionsToValidate: [
    {
      kind: "assumption",
      title: "US commercial competitor coverage",
      detail:
        "Assume the official API will miss or under-return US commercial ads until a real token test proves useful non-political coverage for terms like smith.ai, ai receptionist, plumber software, and jobber.",
    },
    {
      kind: "assumption",
      title: "Third-party ad intelligence vendors",
      detail:
        "Treat broader commercial-ad APIs as separate vendor decisions. They may solve coverage, but require legal, budget, retention, and source-quality review before automation.",
    },
    {
      kind: "assumption",
      title: "Manual web research remains viable",
      detail:
        "Use the public Meta Ad Library web UI for human-reviewed snapshots, citations, and creative observations until programmatic coverage is proven.",
    },
  ],
  recommendedPath: [
    "Use Q-22 to create a manual-first competitor research template with source URL, captured date, country, platform, offer, hook, visual pattern, and evidence-quality fields.",
    "Keep `scripts/competitive-intel-meta.js` as the official-token smoke test for `/ads_archive`, but run it only with an authorized token and record zero-result terms as coverage evidence.",
    "Do not schedule a Meta collector, hire a research agent, or rely on API counts until token tests separate UK/EU coverage, political/issue coverage, and US commercial gaps.",
    "If recurring competitive monitoring becomes important, compare a compliant third-party provider against the same template before storing snapshots.",
  ],
  blockedAutomation: [
    "No scraping or reverse-engineered endpoints from this repo.",
    "No scheduled Meta collector until authorized token coverage is proven.",
    "No external webhook, ad-platform upload, outreach send, launch action, or spend change.",
  ],
};

export function findingsByKind(report: MetaAdLibraryAccessReport, kind: MetaAccessFindingKind) {
  return [...report.officialFindings, ...report.assumptionsToValidate].filter((finding) => finding.kind === kind);
}

export function buildMetaAccessMarkdown(report: MetaAdLibraryAccessReport = META_AD_LIBRARY_ACCESS_REPORT) {
  const official = report.officialFindings
    .map((finding) => {
      const source = finding.sourceUrl ? ` Source: ${finding.sourceUrl}` : "";
      return `- [${finding.kind}] ${finding.title}: ${finding.detail}${source}`;
    })
    .join("\n");

  const assumptions = report.assumptionsToValidate
    .map((finding) => `- ${finding.title}: ${finding.detail}`)
    .join("\n");

  const recommended = report.recommendedPath.map((step, index) => `${index + 1}. ${step}`).join("\n");
  const blocked = report.blockedAutomation.map((item) => `- ${item}`).join("\n");

  return [
    `# Meta Ad Library Access Validation (${report.generatedAt})`,
    "",
    `Status: ${report.status}`,
    "",
    `Verdict: ${report.verdict}`,
    "",
    "## Official Findings",
    official,
    "",
    "## Assumptions To Validate",
    assumptions,
    "",
    "## Recommended 4H Path",
    recommended,
    "",
    "## Blocked Automation",
    blocked,
  ].join("\n");
}
