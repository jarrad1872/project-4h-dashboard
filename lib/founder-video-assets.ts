import { beachheadTrades, imageDriver, rebuildMission } from "./4h-rebuild-data";

export type FounderVideoStatus = "needed" | "scripted" | "filmed" | "edited" | "approved";
export type FounderVideoFormat = "selfie" | "screen-record" | "creator-insert" | "demo-call";

export interface FounderVideoAsset {
  id: string;
  domain: string;
  trade: string;
  format: FounderVideoFormat;
  status: FounderVideoStatus;
  angle: "missed-call" | "demo-proof";
  platformUse: string[];
  hook: string;
  shotList: string[];
  proofMoment: string;
  reviewGate: string;
}

export interface FounderVideoSummary {
  total: number;
  needed: number;
  scripted: number;
  filmed: number;
  edited: number;
  approved: number;
  readyForReview: number;
  remainingToFilm: number;
  nextAsset: FounderVideoAsset | null;
}

function beachheadTrade(domain: string) {
  const trade = beachheadTrades.find((entry) => entry.domain === domain);
  if (!trade) throw new Error(`Unknown founder video trade: ${domain}`);
  return trade;
}

function video(
  id: string,
  domain: string,
  format: FounderVideoFormat,
  status: FounderVideoStatus,
  angle: FounderVideoAsset["angle"],
  platformUse: string[],
  hook: string,
  shotList: string[],
  proofMoment: string,
): FounderVideoAsset {
  const trade = beachheadTrade(domain);

  return {
    id,
    domain,
    trade: trade.trade,
    format,
    status,
    angle,
    platformUse,
    hook,
    shotList,
    proofMoment,
    reviewGate: "Jarrad approval required before a clip can be used in ads, creator packets, or launch bundles.",
  };
}

export const founderVideoAssets: FounderVideoAsset[] = [
  video(
    "fv-pipe-missed-call",
    "pipe.city",
    "selfie",
    "scripted",
    "missed-call",
    ["Meta/Reels cold open", "creator founder insert", "launch bundle proof"],
    "A plumbing owner under a sink cannot answer the emergency call fast enough.",
    [
      "Open in work clothes or truck cab with a ringing phone.",
      "Name the trade-specific loss: emergency plumbing calls go to whoever answers first.",
      "Say pipe.city is $39/mo after a 14-day free trial, no credit card required.",
      "Point viewers to the demo call or creator link for proof.",
    ],
    "Founder says the missed call is not a lead problem; it is an answer-speed problem.",
  ),
  video(
    "fv-pipe-demo-proof",
    "pipe.city",
    "demo-call",
    "needed",
    "demo-proof",
    ["YouTube short", "LinkedIn proof clip", "landing handoff"],
    "Call pipe.city and show the AI capturing the job while the owner is busy.",
    [
      "Start screen recording before the call.",
      "Call the pipe.city demo path and let the AI qualify urgency, timing, and service type.",
      "Show the owner-facing job summary without exposing private customer data.",
      "Close with the 14-day free trial, no credit card required.",
    ],
    "The AI turns a call into a clear plumbing job summary.",
  ),
  video(
    "fv-duct-missed-call",
    "duct.city",
    "selfie",
    "scripted",
    "missed-call",
    ["summer HVAC hook", "Meta/Reels cold open", "creator founder insert"],
    "A no-cool call in July is worth too much to miss.",
    [
      "Open beside an HVAC unit, service van, or thermostat.",
      "Explain that after-hours no-cool calls are high-intent and impatient.",
      "Say duct.city answers and captures the job even when the tech is on another call.",
      "Include $39/mo and the 14-day free trial, no credit card required.",
    ],
    "Founder frames speed-to-lead as the HVAC owner's seasonal advantage.",
  ),
  video(
    "fv-duct-demo-proof",
    "duct.city",
    "screen-record",
    "needed",
    "demo-proof",
    ["YouTube proof", "LinkedIn proof", "launch bundle proof"],
    "Show a no-heat/no-cool intake becoming an owner-ready service request.",
    [
      "Use a clean demo caller scenario: no cool, house is hot, needs callback today.",
      "Record the AI collecting issue, urgency, location, and callback details.",
      "Show the saved summary and next owner action.",
      "End with the trial offer and duct.city domain.",
    ],
    "The clip proves duct.city understands HVAC urgency instead of generic scheduling.",
  ),
  video(
    "fv-mow-missed-call",
    "mow.city",
    "selfie",
    "scripted",
    "missed-call",
    ["creator insert", "Facebook owner hook", "Instagram reel"],
    "A lawn owner on a mower misses estimate calls during the exact hours buyers call.",
    [
      "Open outdoors with a mower, trailer, or route clipboard.",
      "Call out the estimate-call problem while crews are working.",
      "Explain mow.city answers, qualifies, and sends the owner the details.",
      "Say $39/mo after a 14-day free trial, no credit card required.",
    ],
    "Founder ties missed mowing calls to lost weekly route density.",
  ),
  video(
    "fv-mow-demo-proof",
    "mow.city",
    "demo-call",
    "needed",
    "demo-proof",
    ["YouTube short", "creator reaction", "launch bundle proof"],
    "Call mow.city and show a lawn estimate request captured cleanly.",
    [
      "Record the call with a homeowner asking for weekly mowing or cleanup.",
      "Let the AI gather address, lawn size, service type, and preferred time.",
      "Show the owner summary and callback path.",
      "Close with the no-credit-card trial.",
    ],
    "The demo makes mow.city feel like a route-building assistant, not a generic chatbot.",
  ),
  video(
    "fv-pest-missed-call",
    "pest.city",
    "selfie",
    "scripted",
    "missed-call",
    ["Meta urgency hook", "creator insert", "retargeting clip"],
    "When someone sees pests, the first company to answer wins the inspection.",
    [
      "Open with a homeowner-anxiety scenario, not a gross-out visual.",
      "Explain that pest calls need fast qualification: what, where, how urgent.",
      "Say pest.city captures the problem and sends the owner the job details.",
      "Include $39/mo and the 14-day free trial, no credit card required.",
    ],
    "Founder links pest urgency to trust and callback speed.",
  ),
  video(
    "fv-pest-demo-proof",
    "pest.city",
    "screen-record",
    "needed",
    "demo-proof",
    ["YouTube proof", "landing handoff", "launch bundle proof"],
    "Show the AI qualifying a pest issue without making the caller repeat themselves.",
    [
      "Use a demo caller with ants, wasps, rodents, or bed bug concern.",
      "Record AI intake for pest type, location, urgency, and access needs.",
      "Show the owner-ready summary.",
      "Close with pest.city and the trial offer.",
    ],
    "The clip proves pest.city captures urgent details before the lead goes cold.",
  ),
  video(
    "fv-coat-missed-call",
    "coat.city",
    "selfie",
    "scripted",
    "missed-call",
    ["Facebook estimate hook", "Instagram reel", "creator founder insert"],
    "Painting estimate calls disappear when the owner is on a ladder or walkthrough.",
    [
      "Open near paint tools, sample cards, or a job walkthrough.",
      "Name the estimate lag: slow callback makes the customer book someone else.",
      "Explain coat.city answers and captures project details for callback.",
      "Include $39/mo and the 14-day free trial, no credit card required.",
    ],
    "Founder frames follow-up speed as a painting estimate advantage.",
  ),
  video(
    "fv-coat-demo-proof",
    "coat.city",
    "demo-call",
    "needed",
    "demo-proof",
    ["YouTube proof", "LinkedIn proof", "launch bundle proof"],
    "Call coat.city and show an interior/exterior estimate request captured.",
    [
      "Use a caller asking for rooms, exterior repaint, or cabinet painting.",
      "Let the AI collect scope, timeline, property type, and callback preference.",
      "Show the owner summary.",
      "Close with coat.city and the no-credit-card trial.",
    ],
    "The demo proves coat.city captures estimate context before the owner calls back.",
  ),
];

export function summarizeFounderVideoAssets(assets: FounderVideoAsset[] = founderVideoAssets): FounderVideoSummary {
  const counts = assets.reduce(
    (summary, asset) => {
      summary[asset.status] += 1;
      return summary;
    },
    {
      needed: 0,
      scripted: 0,
      filmed: 0,
      edited: 0,
      approved: 0,
    } as Record<FounderVideoStatus, number>,
  );
  const nextAsset =
    assets.find((asset) => asset.status === "needed") ??
    assets.find((asset) => asset.status === "scripted") ??
    assets.find((asset) => asset.status === "filmed") ??
    assets.find((asset) => asset.status === "edited") ??
    null;

  return {
    total: assets.length,
    needed: counts.needed,
    scripted: counts.scripted,
    filmed: counts.filmed,
    edited: counts.edited,
    approved: counts.approved,
    readyForReview: counts.filmed + counts.edited,
    remainingToFilm: counts.needed + counts.scripted,
    nextAsset,
  };
}

export function buildFounderVideoPacket(asset: FounderVideoAsset) {
  return [
    `${asset.id} - ${asset.domain} founder video`,
    "",
    `Status: ${asset.status}`,
    `Format: ${asset.format}`,
    `Angle: ${asset.angle}`,
    `Model support: ${imageDriver.model} for thumbnail/remix frames only`,
    `Offer: ${rebuildMission.price}; ${rebuildMission.trial}`,
    "",
    `Hook: ${asset.hook}`,
    "",
    "Shot list:",
    ...asset.shotList.map((shot, index) => `${index + 1}. ${shot}`),
    "",
    `Proof moment: ${asset.proofMoment}`,
    `Platform use: ${asset.platformUse.join(", ")}`,
    `Approval gate: ${asset.reviewGate}`,
    "",
    "Do not publish, upload, send, launch, create webhooks, or spend from this packet.",
  ].join("\n");
}
