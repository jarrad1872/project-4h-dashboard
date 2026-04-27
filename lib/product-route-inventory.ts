export type ProductRouteStatus = "ready" | "watch" | "missing";

export interface ProductRouteInventoryItem {
  tradeSlug: string;
  tradeLabel: string;
  appName: string;
  domain: string;
  canonicalUrl: string;
  landingPath: "/";
  signupPath: "/login?mode=signup";
  demoLineApiPath: string;
  demoAuthPath: "/api/auth/demo";
  demoPhone: string | null;
  heroImagePath: string;
  status: ProductRouteStatus;
  campaignUse: "platform-directory" | "beachhead" | "live-reference";
  notes: string;
  sourceFiles: string[];
}

export const productRouteInventorySources = [
  "sawcity-lite/demo-lines.json",
  "sawcity-lite/frontend/src/lib/tradeConfig.js",
  "sawcity-lite/frontend/src/App.jsx",
  "sawcity-lite/frontend/src/pages/LandingPage.jsx",
  "sawcity-lite/frontend/src/pages/TradeDirectoryPage.jsx",
  "sawcity-lite/api/index.js",
  "sawcity-lite/routes/auth.js",
] as const;

const sharedSourceFiles = [
  "sawcity-lite/demo-lines.json",
  "sawcity-lite/frontend/src/lib/tradeConfig.js",
  "sawcity-lite/frontend/src/App.jsx",
  "sawcity-lite/frontend/src/pages/LandingPage.jsx",
  "sawcity-lite/api/index.js",
  "sawcity-lite/routes/auth.js",
] as const;

const liveTradeRoutes = [
  {
    tradeSlug: "plumbing",
    tradeLabel: "Plumbing",
    appName: "Pipe.City",
    domain: "pipe.city",
    demoPhone: "(385) 475-3881",
    campaignUse: "beachhead",
    notes: "Tier 1 beachhead. Landing page, click-to-call demo line, demo auth, and pipe hero image are present.",
  },
  {
    tradeSlug: "hvac",
    tradeLabel: "HVAC",
    appName: "Duct.City",
    domain: "duct.city",
    demoPhone: "(385) 458-3456",
    campaignUse: "beachhead",
    notes: "Tier 1 beachhead. Uses the shared trade landing route with HVAC-specific service catalog and demo line.",
  },
  {
    tradeSlug: "lawn-care",
    tradeLabel: "Lawn care",
    appName: "Mow.City",
    domain: "mow.city",
    demoPhone: "(385) 458-9028",
    campaignUse: "beachhead",
    notes: "Tier 1 beachhead. Creator-friendly demo line is present for call-on-camera briefs.",
  },
  {
    tradeSlug: "pest-control",
    tradeLabel: "Pest control",
    appName: "Pest.City",
    domain: "pest.city",
    demoPhone: "(385) 354-6514",
    campaignUse: "beachhead",
    notes: "Tier 1 beachhead. Landing route and demo phone are confirmed for urgent homeowner-call angles.",
  },
  {
    tradeSlug: "painting",
    tradeLabel: "Painting",
    appName: "Coat.City",
    domain: "coat.city",
    demoPhone: "(385) 334-5577",
    campaignUse: "beachhead",
    notes: "Tier 1 beachhead. Landing route and demo phone are confirmed for estimate-intake angles.",
  },
  {
    tradeSlug: "concrete-cutting",
    tradeLabel: "Concrete cutting",
    appName: "Saw.City",
    domain: "saw.city",
    demoPhone: "(385) 475-6437",
    campaignUse: "live-reference",
    notes: "Original trade reference. Useful for product proof, but not the default beachhead in the current 4H plan.",
  },
  {
    tradeSlug: "pressure-washing",
    tradeLabel: "Pressure washing",
    appName: "Rinse.City",
    domain: "rinse.city",
    demoPhone: "(385) 378-6326",
    campaignUse: "live-reference",
    notes: "Live trade route with demo line. Keep available for later proof and comparison assets.",
  },
  {
    tradeSlug: "drain-cleaning",
    tradeLabel: "Drain cleaning",
    appName: "Rooter.City",
    domain: "rooter.city",
    demoPhone: "(385) 595-5804",
    campaignUse: "live-reference",
    notes: "Live trade route with demo line. Adjacent to plumbing but not part of the five beachhead domains.",
  },
  {
    tradeSlug: "auto-detailing",
    tradeLabel: "Auto detailing",
    appName: "Detail.City",
    domain: "detail.city",
    demoPhone: "(385) 206-3062",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset; use after first beachhead learning loop.",
  },
  {
    tradeSlug: "auto-repair",
    tradeLabel: "Auto repair",
    appName: "Brake.City",
    domain: "brake.city",
    demoPhone: "(385) 360-4963",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "chimney-sweep",
    tradeLabel: "Chimney sweep",
    appName: "Chimney.City",
    domain: "chimney.city",
    demoPhone: "(385) 438-3357",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "demolition",
    tradeLabel: "Demolition",
    appName: "Wreck.City",
    domain: "wreck.city",
    demoPhone: "(385) 438-6739",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "floor-polishing",
    tradeLabel: "Floor polishing",
    appName: "Polish.City",
    domain: "polish.city",
    demoPhone: "(385) 475-2966",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "grading",
    tradeLabel: "Grading",
    appName: "Grade.City",
    domain: "grade.city",
    demoPhone: "(385) 338-6542",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "hauling",
    tradeLabel: "Hauling",
    appName: "Haul.City",
    domain: "haul.city",
    demoPhone: "(385) 360-2023",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "locksmith",
    tradeLabel: "Locksmith",
    appName: "Lockout.City",
    domain: "lockout.city",
    demoPhone: "(385) 481-5772",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "mechanic",
    tradeLabel: "Mechanic",
    appName: "Wrench.City",
    domain: "wrench.city",
    demoPhone: "(385) 503-4576",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "paving",
    tradeLabel: "Paving",
    appName: "Pave.City",
    domain: "pave.city",
    demoPhone: "(385) 469-2630",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "snow-removal",
    tradeLabel: "Snow removal",
    appName: "Plow.City",
    domain: "plow.city",
    demoPhone: "(385) 442-7588",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
  {
    tradeSlug: "tree-service",
    tradeLabel: "Tree service",
    appName: "Prune.City",
    domain: "prune.city",
    demoPhone: "(385) 474-4347",
    campaignUse: "live-reference",
    notes: "Live route with demo line and hero asset.",
  },
] satisfies Array<Omit<
  ProductRouteInventoryItem,
  "canonicalUrl" | "landingPath" | "signupPath" | "demoLineApiPath" | "demoAuthPath" | "heroImagePath" | "status" | "sourceFiles"
>>;

export const productRouteInventory: ProductRouteInventoryItem[] = [
  {
    tradeSlug: "custom",
    tradeLabel: "Platform directory",
    appName: "Answered.City",
    domain: "answered.city",
    canonicalUrl: "https://answered.city/",
    landingPath: "/",
    signupPath: "/login?mode=signup",
    demoLineApiPath: "/api/demo-line/custom",
    demoAuthPath: "/api/auth/demo",
    demoPhone: null,
    heroImagePath: "/hero/answered-hero.jpg",
    status: "watch",
    campaignUse: "platform-directory",
    notes: "Answered.City root renders the trade directory instead of a single trade landing page. Use for broad proof, not trade-specific paid clicks.",
    sourceFiles: [
      "sawcity-lite/trades/custom.json",
      "sawcity-lite/frontend/src/lib/tradeConfig.js",
      "sawcity-lite/frontend/src/App.jsx",
      "sawcity-lite/frontend/src/pages/TradeDirectoryPage.jsx",
    ],
  },
  ...liveTradeRoutes.map((route) => ({
    ...route,
    canonicalUrl: `https://${route.domain}/`,
    landingPath: "/" as const,
    signupPath: "/login?mode=signup" as const,
    demoLineApiPath: `/api/demo-line/${route.tradeSlug}`,
    demoAuthPath: "/api/auth/demo" as const,
    heroImagePath: `/hero/${route.domain.replace(".city", "")}-hero.jpg`,
    status: "ready" as const,
    sourceFiles: [...sharedSourceFiles],
  })),
];

export function getBeachheadProductRoutes() {
  return productRouteInventory.filter((route) => route.campaignUse === "beachhead");
}

export function summarizeProductRouteInventory(routes = productRouteInventory) {
  const ready = routes.filter((route) => route.status === "ready").length;
  const beachhead = routes.filter((route) => route.campaignUse === "beachhead").length;
  const demoLines = routes.filter((route) => route.demoPhone).length;

  return {
    total: routes.length,
    ready,
    watch: routes.filter((route) => route.status === "watch").length,
    missing: routes.filter((route) => route.status === "missing").length,
    beachhead,
    demoLines,
  };
}

export function productRouteRetirementDependencySummary() {
  const summary = summarizeProductRouteInventory();

  return {
    route: "/gtm",
    inventoryCount: summary.total,
    readyRoutes: summary.ready,
    beachheadRoutes: summary.beachhead,
    demoLines: summary.demoLines,
    sourceCount: productRouteInventorySources.length,
    readOnlyReference: "sawcity-lite",
    preservationRule:
      "Preserve domain, landing, signup, demo-line, demo-auth, hero, and read-only source evidence before any /gtm archive-only work.",
  };
}
