import {
  routeDependencyGuards,
  routeDispositionDecisions,
  type RouteDependencyGuard,
  type RouteRetirementRecommendation,
} from "./navigation";

export interface ClearRouteCleanupEntry {
  route: string;
  label: string;
  recommendation: RouteRetirementRecommendation;
  replacementHref: string | null;
  packetIntent: string;
  preservedEvidence: string[];
  requiredVerification: string[];
  implementationAllowed: false;
}

export interface AppliedRouteCleanupEntry {
  route: string;
  appliedIn: string;
  outcome: string;
  verification: string[];
  externalActionAllowed: false;
}

export interface BlockedRouteCleanupEntry {
  route: string;
  label: string;
  recommendation: RouteRetirementRecommendation;
  replacementHref: string | null;
  blockingDependency: string;
  packetIntent: string;
  preservedEvidence: string[];
  requiredVerification: string[];
  implementationAllowed: false;
}

export const appliedRouteCleanupPackets: AppliedRouteCleanupEntry[] = [
  {
    route: "/generate",
    appliedIn: "Q-47",
    outcome: "Internal page route redirects to /assets while legacy generation API routes remain unchanged.",
    verification: ["/generate redirects to /assets", "/assets loads Creative Lab", "/api/generate is not removed"],
    externalActionAllowed: false,
  },
  {
    route: "/gtm",
    appliedIn: "Q-48",
    outcome: "Internal page route redirects to Command while product-route inventory remains preserved in Command/docs.",
    verification: ["/gtm redirects to /", "Command loads product-route inventory map", "sawcity-lite remains read-only"],
    externalActionAllowed: false,
  },
  {
    route: "/settings",
    appliedIn: "Q-49",
    outcome: "Internal page route redirects to Approval while setup/source notes remain preserved in Command/docs.",
    verification: ["/settings redirects to /approval", "Approval route loads", "placeholder credentials are not rendered"],
    externalActionAllowed: false,
  },
  {
    route: "/ads",
    appliedIn: "Q-50",
    outcome: "Ad archive remains readable while create/edit/pause/regenerate controls are removed and detail editor routes redirect back to archive.",
    verification: ["/ads shows read-only guard", "/ads/[id] redirects to /ads", "historical rows remain readable"],
    externalActionAllowed: false,
  },
];

function intentForRecommendation(recommendation: RouteRetirementRecommendation) {
  switch (recommendation) {
    case "archive":
      return "Draft archive-only treatment after preserving historical access and active replacement paths.";
    case "redirect":
      return "Draft redirect treatment to the active replacement lane after preserving any unique reference data.";
    case "delete":
      return "Draft delete-later treatment after proving the active system no longer depends on the route.";
    case "rebuild":
      return "Keep as a support/rebuild surface until the active loop fully owns the workflow.";
  }
}

function verificationForGuard(guard: RouteDependencyGuard) {
  return [
    `${guard.route} still loads before the packet is implemented`,
    "Command route guard shows clear",
    "Docs and tests name the preserved dependency",
    "No redirect, deletion, upload, launch, webhook, spend, or external action occurs in the packet draft",
  ];
}

function blockedVerificationForGuard(guard: RouteDependencyGuard) {
  if (guard.route === "/creatives") {
    return [
      "/creatives page route still returns 200 before implementation",
      "All inventoried /creatives/*.jpg static URLs return 200 before and after any future page-route redirect",
      "Creative Lab /assets remains the active replacement route",
      "No public asset file is moved, deleted, renamed, or regenerated in this packet draft",
      "No redirect, deletion, upload, launch, webhook, spend, billing, or sawcity-lite action occurs in Q-51",
    ];
  }

  if (guard.route === "/workflow") {
    return [
      "/workflow page route still returns 200 before implementation",
      "Workflow history map still exposes six stages, five transitions, and fallback/API dependencies",
      "Launch /approval replacement surfaces remain reachable for current workflow ownership",
      "No bulk workflow mutation, ad upload, campaign launch, webhook, spend, or billing action occurs in this packet draft",
      "No redirect, deletion, upload, launch, webhook, spend, billing, or sawcity-lite action occurs in Q-51",
    ];
  }

  return verificationForGuard(guard);
}

export const clearRouteCleanupPacket: ClearRouteCleanupEntry[] = routeDependencyGuards
  .filter((guard) => guard.status === "clear" && guard.readyForRedirectOrDelete)
  .map((guard) => {
    const decision = routeDispositionDecisions.find((row) => row.route === guard.route);

    if (!decision) {
      throw new Error(`Missing route disposition decision for ${guard.route}`);
    }

    return {
      route: guard.route,
      label: decision.label,
      recommendation: decision.recommendation,
      replacementHref: decision.replacementHref,
      packetIntent: intentForRecommendation(decision.recommendation),
      preservedEvidence: [...guard.dataDependencies, ...guard.docOrTestReferences],
      requiredVerification: verificationForGuard(guard),
      implementationAllowed: false,
    };
  });

export const blockedRouteCleanupPacket: BlockedRouteCleanupEntry[] = routeDependencyGuards
  .filter((guard) => guard.status === "blocked")
  .map((guard) => {
    const decision = routeDispositionDecisions.find((row) => row.route === guard.route);

    if (!decision) {
      throw new Error(`Missing route disposition decision for ${guard.route}`);
    }

    return {
      route: guard.route,
      label: decision.label,
      recommendation: decision.recommendation,
      replacementHref: decision.replacementHref,
      blockingDependency: guard.guardrail,
      packetIntent: "Draft the dependency-preserving implementation packet before this blocked route can move to a redirect candidate.",
      preservedEvidence: [...guard.dataDependencies, ...guard.docOrTestReferences],
      requiredVerification: blockedVerificationForGuard(guard),
      implementationAllowed: false,
    };
  });

export function clearRouteCleanupPacketSummary() {
  const counts = clearRouteCleanupPacket.reduce<Record<RouteRetirementRecommendation, number>>(
    (acc, entry) => {
      acc[entry.recommendation] += 1;
      return acc;
    },
    { rebuild: 0, redirect: 0, archive: 0, delete: 0 },
  );

  return {
    total: clearRouteCleanupPacket.length,
    routes: clearRouteCleanupPacket.map((entry) => entry.route),
    appliedRoutes: appliedRouteCleanupPackets.map((entry) => entry.route),
    counts,
    appliedCount: appliedRouteCleanupPackets.length,
    implementationAllowed: clearRouteCleanupPacket.some((entry) => entry.implementationAllowed),
    blockedActions: ["route redirect", "route deletion", "ad upload", "campaign launch", "webhook creation", "spend change"],
    preservationRule:
      "This is a draft packet only: group clear candidates and verification requirements before any route implementation work.",
  };
}

export function blockedRouteCleanupPacketSummary() {
  return {
    total: blockedRouteCleanupPacket.length,
    routes: blockedRouteCleanupPacket.map((entry) => entry.route),
    replacements: blockedRouteCleanupPacket.map((entry) => entry.replacementHref),
    implementationAllowed: blockedRouteCleanupPacket.some((entry) => entry.implementationAllowed),
    staticChecksRequired: blockedRouteCleanupPacket.some((entry) =>
      entry.requiredVerification.some((verification) => verification.includes("return 200")),
    ),
    blockedActions: [
      "route redirect",
      "route deletion",
      "static asset move",
      "ad upload",
      "campaign launch",
      "outreach send",
      "external API call",
      "webhook creation",
      "spend change",
      "billing change",
      "sawcity-lite change",
    ],
    preservationRule:
      "Q-51 is a blocked-route draft packet: preserve static assets and workflow history before any future redirect work.",
  };
}
