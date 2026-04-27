export type NavigationStatus = "active" | "support" | "legacy";

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
