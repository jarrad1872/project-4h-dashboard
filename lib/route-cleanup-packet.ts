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
