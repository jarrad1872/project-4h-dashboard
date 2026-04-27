import { IMAGE_CREATIVE_ANGLES } from "./image-creative-briefs";
import { getBeachheadProductRoutes, type ProductRouteInventoryItem } from "./product-route-inventory";

export type MessageMatchAngle = (typeof IMAGE_CREATIVE_ANGLES)[number];

export interface MessageMatchBrief {
  id: string;
  tradeSlug: string;
  tradeLabel: string;
  domain: string;
  route: string;
  angle: MessageMatchAngle;
  adPromise: string;
  landingHeadline: string;
  supportingProof: string[];
  heroDirection: string;
  primaryCta: string;
  offer: "$39/mo";
  trial: "14-day free trial, no credit card required";
  handoffNotes: string[];
}

const OFFER = "$39/mo" as const;
const TRIAL = "14-day free trial, no credit card required" as const;

const ANGLE_COPY: Record<MessageMatchAngle, {
  label: string;
  adPromise: string;
  landingHeadline: (route: ProductRouteInventoryItem) => string;
  heroDirection: (route: ProductRouteInventoryItem) => string;
  supportingProof: (route: ProductRouteInventoryItem) => string[];
}> = {
  "missed-call": {
    label: "missed call recovery",
    adPromise: "Stop losing booked jobs when the owner cannot answer the phone.",
    landingHeadline: (route) => `${route.appName} answers ${route.tradeLabel.toLowerCase()} calls before the lead goes cold.`,
    heroDirection: (route) => `Show a ${route.tradeLabel.toLowerCase()} owner in the field with a ringing phone and a captured AI job summary visible.`,
    supportingProof: (route) => [
      `${route.appName} is built for ${route.tradeLabel.toLowerCase()} call intake.`,
      "AI receptionist answers, qualifies, and captures job details 24/7.",
      "Owner gets the lead details instead of a voicemail mystery.",
    ],
  },
  "demo-call": {
    label: "demo call proof",
    adPromise: "Call the trade domain and hear the AI receptionist answer live.",
    landingHeadline: (route) => `Call ${route.domain} and hear the AI handle a real ${route.tradeLabel.toLowerCase()} intake.`,
    heroDirection: (route) => `Make the live demo phone moment obvious: phone speaker, ${route.domain}, and a clean job summary handoff.`,
    supportingProof: (route) => [
      `Confirmed demo line: ${route.demoPhone ?? "demo line needed before launch"}.`,
      "Demo call should create confidence before asking for signup.",
      "Show the next step from call to trial without extra explanation.",
    ],
  },
  "owner-agent": {
    label: "owner agent workflow",
    adPromise: "Run the business from the truck with an AI employee handling the phone.",
    landingHeadline: (route) => `${route.appName} gives ${route.tradeLabel.toLowerCase()} owners an AI employee in their pocket.`,
    heroDirection: (route) => `Show a busy ${route.tradeLabel.toLowerCase()} owner using voice or chat while field work continues around them.`,
    supportingProof: () => [
      "Voice and chat assistant can answer owner questions about calls, jobs, and customers.",
      "Every captured call becomes operational context, not another admin chore.",
      "Keep the workflow practical: schedule, reply, summarize, and follow up.",
    ],
  },
  "roi-math": {
    label: "recovered revenue math",
    adPromise: "One recovered job can pay for the product for a year.",
    landingHeadline: (route) => `${route.appName} costs ${OFFER}. One recovered ${route.tradeLabel.toLowerCase()} job can cover the year.`,
    heroDirection: (route) => `Show simple field math for ${route.tradeLabel.toLowerCase()}: one missed call, one recovered job, ${OFFER}.`,
    supportingProof: () => [
      "Keep the math simple and visible, not spreadsheet-heavy.",
      "Tie value to answered calls and booked jobs, not abstract AI automation.",
      "Make price and trial visible in the first screen.",
    ],
  },
};

function routePrefix(route: ProductRouteInventoryItem) {
  return route.domain.replace(".city", "");
}

export function buildMessageMatchBrief(route: ProductRouteInventoryItem, angle: MessageMatchAngle): MessageMatchBrief {
  const copy = ANGLE_COPY[angle];

  return {
    id: `${routePrefix(route)}-${angle}`,
    tradeSlug: route.tradeSlug,
    tradeLabel: route.tradeLabel,
    domain: route.domain,
    route: route.landingPath,
    angle,
    adPromise: copy.adPromise,
    landingHeadline: copy.landingHeadline(route),
    supportingProof: copy.supportingProof(route),
    heroDirection: copy.heroDirection(route),
    primaryCta: "Start free trial",
    offer: OFFER,
    trial: TRIAL,
    handoffNotes: [
      "4H handoff only; do not edit sawcity-lite from this repo.",
      `Use ${route.domain}${route.landingPath} as the traffic destination unless a future product handoff creates a dedicated path.`,
      `Match the paid/social angle to the first-screen promise: ${copy.label}.`,
    ],
  };
}

export function listMessageMatchBriefs() {
  return getBeachheadProductRoutes().flatMap((route) =>
    IMAGE_CREATIVE_ANGLES.map((angle) => buildMessageMatchBrief(route, angle)),
  );
}

export function buildMessageMatchPacket(brief: MessageMatchBrief) {
  return [
    `${brief.domain} message-match brief (${brief.angle})`,
    "",
    `Ad promise: ${brief.adPromise}`,
    `Landing headline: ${brief.landingHeadline}`,
    `Destination: https://${brief.domain}${brief.route}`,
    `Primary CTA: ${brief.primaryCta}`,
    `Offer: ${brief.offer}`,
    `Trial: ${brief.trial}`,
    "",
    "Supporting proof:",
    ...brief.supportingProof.map((item) => `- ${item}`),
    "",
    "Hero direction:",
    brief.heroDirection,
    "",
    "Handoff notes:",
    ...brief.handoffNotes.map((item) => `- ${item}`),
  ].join("\n");
}
