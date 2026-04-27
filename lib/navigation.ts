export type NavigationStatus = "active" | "support" | "legacy";

export interface NavigationItem {
  href: string;
  label: string;
  status: NavigationStatus;
  purpose: string;
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
