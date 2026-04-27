export type NavigationStatus = "active" | "support" | "legacy";
export type RouteRetirementRecommendation = "rebuild" | "redirect" | "archive" | "delete";
export type RouteDependencyStatus = "clear" | "blocked" | "support";

export interface NavigationItem {
  href: string;
  label: string;
  status: NavigationStatus;
  purpose: string;
}

export interface LegacyRouteBannerConfig {
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  replacementHref: string;
  replacementLabel: string;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export interface RouteDispositionDecision {
  route: string;
  label: string;
  currentDisposition: "reference shelf" | "direct-link archive" | "support route";
  recommendation: RouteRetirementRecommendation;
  replacementHref: string | null;
  rationale: string;
  nextStep: string;
  destructiveActionAllowed: false;
}

export interface RouteDependencyGuard {
  route: string;
  status: RouteDependencyStatus;
  readyForRedirectOrDelete: boolean;
  activeReferences: string[];
  dataDependencies: string[];
  docOrTestReferences: string[];
  guardrail: string;
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Operating Loops",
    items: [
      { href: "/", label: "Command", status: "active", purpose: "Daily growth command center and queue." },
      { href: "/influencer", label: "Creators", status: "active", purpose: "Creator demo pipeline and approval-gated outreach drafts." },
      { href: "/sales", label: "Sales", status: "active", purpose: "Human field sales CRM, cards, attribution, and rep packets." },
      { href: "/assets", label: "Creative Lab", status: "active", purpose: "ChatGPT Pro image workflow, variants, uploads, and creative fatigue." },
      { href: "/scorecard", label: "Scorecard", status: "active", purpose: "Attribution, weekly learning, decisions, and customer pace." },
    ],
  },
  {
    label: "Launch Governance",
    items: [
      { href: "/approval", label: "Approval", status: "active", purpose: "Internal approval queue and audit coverage." },
      { href: "/launch", label: "Launch", status: "active", purpose: "Launch URLs, bundles, stop screen, and upload-sheet review." },
      { href: "/budget", label: "Budget", status: "support", purpose: "Experiment-level budget planning only." },
    ],
  },
];

export const legacyNavigationItems: NavigationItem[] = [
  { href: "/ads", label: "Ad Archive", status: "legacy", purpose: "Historical ad library; not current launch candidates." },
  { href: "/generate", label: "AI Studio", status: "legacy", purpose: "Legacy Gemini generator retained for reference." },
  { href: "/gtm", label: "Legacy GTM", status: "legacy", purpose: "Original GTM board and route inventory reference." },
  { href: "/settings", label: "Settings", status: "legacy", purpose: "Old source-doc/settings surface." },
];

export const hiddenLegacyRoutes: NavigationItem[] = [
  { href: "/creatives", label: "Creatives", status: "legacy", purpose: "Original asset repository; superseded by Creative Lab." },
  { href: "/workflow", label: "Workflow", status: "legacy", purpose: "Original concept-to-live workflow view; superseded by queue and launch governance." },
  { href: "/templates", label: "Templates", status: "support", purpose: "Message-match, creator, and competitor templates reached from active flows." },
  { href: "/lifecycle", label: "Lifecycle", status: "support", purpose: "Lifecycle follow-up measurement reached from scorecard/learning work." },
];

export const legacyRouteBanners: Record<string, LegacyRouteBannerConfig> = {
  "/ads": {
    route: "/ads",
    eyebrow: "Reference Shelf",
    title: "Ad Archive is historical reference",
    description:
      "Old NB2, imported, and generic Saw.City ads remain visible for audit/history. Current launch candidates should be rebuilt through Launch bundles with current creative, copy, UTMs, and approvals.",
    replacementHref: "/launch",
    replacementLabel: "Use Launch",
  },
  "/generate": {
    route: "/generate",
    eyebrow: "Legacy AI Studio",
    title: "Superseded by Creative Lab",
    description:
      "This Gemini/NB2 generator is retained for reference. The active image workflow is ChatGPT Pro prompt packets and uploads in Creative Lab.",
    replacementHref: "/assets",
    replacementLabel: "Use Creative Lab",
  },
  "/gtm": {
    route: "/gtm",
    eyebrow: "Legacy GTM Board",
    title: "Original GTM board, not the daily command lane",
    description:
      "This page still holds useful product-route inventory and historical GTM context. Daily build direction now starts from Command and the build queue.",
    replacementHref: "/",
    replacementLabel: "Use Command",
  },
  "/settings": {
    route: "/settings",
    eyebrow: "Legacy Settings",
    title: "Original setup references",
    description:
      "This page contains old setup notes and source references. Active launch governance now lives in Approval, Launch, and Budget.",
    replacementHref: "/approval",
    replacementLabel: "Use Approval",
  },
  "/creatives": {
    route: "/creatives",
    eyebrow: "Direct-link Archive",
    title: "Original master asset gallery",
    description:
      "This route is kept for legacy asset lookup. Current creative work happens in Creative Lab with ChatGPT Pro prompts, uploads, lineage, and fatigue tracking.",
    replacementHref: "/assets",
    replacementLabel: "Use Creative Lab",
  },
  "/workflow": {
    route: "/workflow",
    eyebrow: "Legacy Workflow",
    title: "Original ad workflow view",
    description:
      "This old concept-to-live board is retained for reference. Current operations use the build queue, Approval, and Launch governance surfaces.",
    replacementHref: "/launch",
    replacementLabel: "Use Launch",
  },
};

export const routeDispositionDecisions: RouteDispositionDecision[] = [
  {
    route: "/ads",
    label: "Ad Archive",
    currentDisposition: "reference shelf",
    recommendation: "archive",
    replacementHref: "/launch",
    rationale:
      "Historical ad rows are still useful audit evidence, but none should be treated as current launch candidates without a launch bundle rebuild.",
    nextStep: "Keep the archive banner and use Launch bundles for any future current-candidate rebuild.",
    destructiveActionAllowed: false,
  },
  {
    route: "/generate",
    label: "AI Studio",
    currentDisposition: "reference shelf",
    recommendation: "redirect",
    replacementHref: "/assets",
    rationale:
      "The legacy Gemini/NB2 generator is superseded by the ChatGPT Pro Creative Lab and should not remain a daily creative surface.",
    nextStep: "After one more verification pass, redirect to Creative Lab while preserving any reusable prompt notes in docs.",
    destructiveActionAllowed: false,
  },
  {
    route: "/gtm",
    label: "Legacy GTM",
    currentDisposition: "reference shelf",
    recommendation: "archive",
    replacementHref: "/",
    rationale:
      "The route still holds historical GTM and product-route inventory context that can help future audits, but Command owns current execution.",
    nextStep: "Keep direct-link/archive access until the product-route inventory is fully represented in active launch/support data.",
    destructiveActionAllowed: false,
  },
  {
    route: "/settings",
    label: "Settings",
    currentDisposition: "reference shelf",
    recommendation: "delete",
    replacementHref: "/approval",
    rationale:
      "The old settings/source-doc surface is not part of the rebuild and overlaps with docs plus approval/launch governance.",
    nextStep: "Before deletion, verify no active link, API, or operator workflow depends on the page and move any unique notes into SOP/README.",
    destructiveActionAllowed: false,
  },
  {
    route: "/creatives",
    label: "Creatives",
    currentDisposition: "direct-link archive",
    recommendation: "redirect",
    replacementHref: "/assets",
    rationale:
      "The original master asset gallery is superseded by Creative Lab's prompt, upload, lineage, and fatigue workflow.",
    nextStep: "Confirm every needed lookup exists in Creative Lab or docs, then redirect to `/assets`.",
    destructiveActionAllowed: false,
  },
  {
    route: "/workflow",
    label: "Workflow",
    currentDisposition: "direct-link archive",
    recommendation: "redirect",
    replacementHref: "/launch",
    rationale:
      "The old concept-to-live board is superseded by the build queue, Approval, Launch, and external-action stop screen.",
    nextStep: "Confirm no launch-bundle or approval workflow links back to this route, then redirect to Launch.",
    destructiveActionAllowed: false,
  },
  {
    route: "/templates",
    label: "Templates",
    currentDisposition: "support route",
    recommendation: "rebuild",
    replacementHref: "/scorecard",
    rationale:
      "Message-match, creator brief, and competitor research templates remain useful, but should be treated as a support library reached from active loops.",
    nextStep: "Keep as a support page while folding the highest-use brief actions into Launch, Creators, or Scorecard.",
    destructiveActionAllowed: false,
  },
  {
    route: "/lifecycle",
    label: "Lifecycle",
    currentDisposition: "support route",
    recommendation: "rebuild",
    replacementHref: "/scorecard",
    rationale:
      "Lifecycle follow-up measurement belongs inside the learning loop, but the detail page remains useful while the scorecard summary matures.",
    nextStep: "Keep as a support page and gradually move decision-grade lifecycle summaries into Scorecard.",
    destructiveActionAllowed: false,
  },
];

export const routeDependencyGuards: RouteDependencyGuard[] = [
  {
    route: "/ads",
    status: "blocked",
    readyForRedirectOrDelete: false,
    activeReferences: ["Reference Shelf", "/ads/[id] detail links"],
    dataDependencies: ["Historical ad archive view", "Approval/GTM/workflow pages still consume /api/ads data"],
    docOrTestReferences: ["README route table", "route-disposition-plan", "navigation.test"],
    guardrail: "Keep as archive. Do not redirect or delete while ad history remains useful audit evidence.",
  },
  {
    route: "/generate",
    status: "clear",
    readyForRedirectOrDelete: true,
    activeReferences: ["Reference Shelf", "legacy banner only"],
    dataDependencies: ["No active page depends on the /generate UI route"],
    docOrTestReferences: ["README legacy note", "route-disposition-plan", "navigation.test"],
    guardrail: "Candidate for future redirect to /assets after preserving any useful prompt notes.",
  },
  {
    route: "/gtm",
    status: "blocked",
    readyForRedirectOrDelete: false,
    activeReferences: ["Reference Shelf", "legacy banner only"],
    dataDependencies: ["Product-route inventory and historical GTM context still live on the page"],
    docOrTestReferences: ["README", "SOP-WORKFLOW", "product-route-inventory docs", "navigation.test"],
    guardrail: "Keep archived until product-route inventory is fully represented in active launch/support data.",
  },
  {
    route: "/settings",
    status: "blocked",
    readyForRedirectOrDelete: false,
    activeReferences: ["Reference Shelf", "legacy banner only"],
    dataDependencies: ["Old setup/source references have not been fully extracted into docs"],
    docOrTestReferences: ["README route table", "route-disposition-plan", "navigation.test"],
    guardrail: "Do not delete until unique notes are moved into README/SOP and active references are rechecked.",
  },
  {
    route: "/creatives",
    status: "blocked",
    readyForRedirectOrDelete: false,
    activeReferences: ["Direct-link archive", "legacy banner only"],
    dataDependencies: ["public/creatives asset URL convention from trade-utils", "old influencer campaign flow link"],
    docOrTestReferences: ["README route table", "influencer campaign implementation docs", "trade-utils tests"],
    guardrail: "Do not redirect until public asset URLs and old campaign flow references are migrated or explicitly preserved.",
  },
  {
    route: "/workflow",
    status: "blocked",
    readyForRedirectOrDelete: false,
    activeReferences: ["Direct-link archive", "legacy banner only"],
    dataDependencies: ["old influencer campaign flow link", "bulk ad workflow history"],
    docOrTestReferences: ["README route table", "influencer campaign implementation docs", "navigation.test"],
    guardrail: "Do not redirect until old campaign flow references are moved to Launch or Approval.",
  },
  {
    route: "/templates",
    status: "support",
    readyForRedirectOrDelete: false,
    activeReferences: ["Command support summary link", "Scorecard support summary link"],
    dataDependencies: ["Command and Scorecard fetch /api/templates counts", "template detail page holds copy actions"],
    docOrTestReferences: ["README", "SOP-WORKFLOW", "content/template tests", "navigation.test"],
    guardrail: "Keep as a support route while high-use actions are folded into active loops.",
  },
  {
    route: "/lifecycle",
    status: "support",
    readyForRedirectOrDelete: false,
    activeReferences: ["Command support summary link", "Scorecard support summary link"],
    dataDependencies: ["Command and Scorecard fetch /api/lifecycle rows", "lifecycle detail page edits follow-up rows"],
    docOrTestReferences: ["README", "SOP-WORKFLOW", "lifecycle measurement tests", "navigation.test"],
    guardrail: "Keep as a support route while decision-grade lifecycle summaries mature inside Scorecard.",
  },
];

export const allNavigationItems = [
  ...navigationGroups.flatMap((group) => group.items),
  ...legacyNavigationItems,
  ...hiddenLegacyRoutes,
];

export function activeNavigationHrefs() {
  return navigationGroups.flatMap((group) => group.items.map((item) => item.href));
}

export function legacyRouteAuditRows() {
  return [...legacyNavigationItems, ...hiddenLegacyRoutes].map((item) => ({
    route: item.href,
    label: item.label,
    status: item.status,
    disposition: item.status === "legacy" ? "keep as direct-link archive until rebuilt or retired" : "support route, omit from primary nav",
    purpose: item.purpose,
  }));
}

export function getLegacyRouteBanner(route: string) {
  return legacyRouteBanners[route] ?? null;
}

export function routeDispositionSummary() {
  const counts = routeDispositionDecisions.reduce<Record<RouteRetirementRecommendation, number>>(
    (acc, row) => {
      acc[row.recommendation] += 1;
      return acc;
    },
    { rebuild: 0, redirect: 0, archive: 0, delete: 0 },
  );

  return {
    total: routeDispositionDecisions.length,
    counts,
    destructiveActionsAllowed: routeDispositionDecisions.some((row) => row.destructiveActionAllowed),
  };
}

export function routeDependencyGuardSummary() {
  const counts = routeDependencyGuards.reduce<Record<RouteDependencyStatus, number>>(
    (acc, row) => {
      acc[row.status] += 1;
      return acc;
    },
    { clear: 0, blocked: 0, support: 0 },
  );

  return {
    total: routeDependencyGuards.length,
    counts,
    readyForRedirectOrDelete: routeDependencyGuards.filter((row) => row.readyForRedirectOrDelete).length,
  };
}
