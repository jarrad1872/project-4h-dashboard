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
    "fv-saw-missed-call",
    "saw.city",
    "selfie",
    "scripted",
    "missed-call",
    ["Meta/Reels cold open", "creator founder insert", "launch bundle proof"],
    "A saw-cutting owner cannot hear the phone while the saw is running.",
    [
      "Open near a slab mark, saw, truck, or PPE setup.",
      "Explain that concrete cutting calls need fast scope capture before the contractor calls someone else.",
      "Say saw.city answers and captures the job even when the operator is on a noisy site.",
      "Include $39/mo and the 14-day free trial, no credit card required.",
    ],
    "Founder frames missed calls as a job-site noise and availability problem.",
  ),
  video(
    "fv-saw-demo-proof",
    "saw.city",
    "screen-record",
    "needed",
    "demo-proof",
    ["YouTube proof", "LinkedIn proof", "launch bundle proof"],
    "Show a concrete cutting estimate request becoming an owner-ready job summary.",
    [
      "Use a clean demo caller scenario: slab cutting, timeline, location, and access details.",
      "Record the AI collecting scope, measurements, timing, and callback details.",
      "Show the saved summary and next owner action.",
      "End with the trial offer and saw.city domain.",
    ],
    "The clip proves saw.city captures concrete cutting context instead of generic scheduling.",
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
    "fv-rinse-missed-call",
    "rinse.city",
    "selfie",
    "scripted",
    "missed-call",
    ["Meta estimate hook", "creator insert", "retargeting clip"],
    "Pressure washing estimate calls arrive while the owner is wet, loud, and working.",
    [
      "Open beside a hose reel, surface cleaner, trailer, or wet driveway.",
      "Explain that pressure washing buyers often call while comparing quick estimates.",
      "Say rinse.city captures the job details and sends the owner the summary.",
      "Include $39/mo and the 14-day free trial, no credit card required.",
    ],
    "Founder links answer speed to booked estimate volume.",
  ),
  video(
    "fv-rinse-demo-proof",
    "rinse.city",
    "screen-record",
    "needed",
    "demo-proof",
    ["YouTube proof", "landing handoff", "launch bundle proof"],
    "Show the AI qualifying a pressure washing estimate without making the caller repeat themselves.",
    [
      "Use a demo caller asking for driveway, patio, house wash, or commercial cleanup.",
      "Record AI intake for surface type, square footage, photos, timing, and access needs.",
      "Show the owner-ready summary.",
      "Close with rinse.city and the trial offer.",
    ],
    "The clip proves rinse.city captures estimate details before the lead goes cold.",
  ),
  video(
    "fv-lockout-missed-call",
    "lockout.city",
    "selfie",
    "scripted",
    "missed-call",
    ["Facebook urgency hook", "Instagram reel", "creator founder insert"],
    "A lockout caller almost never waits for a callback.",
    [
      "Open in or near a locksmith van with keys, lock tools, or an emergency-call setup.",
      "Name the urgency: if nobody answers, the caller books the next locksmith.",
      "Explain lockout.city answers and captures the emergency details for callback or dispatch.",
      "Include $39/mo and the 14-day free trial, no credit card required.",
    ],
    "Founder frames answer speed as the difference between winning and losing an emergency job.",
  ),
  video(
    "fv-lockout-demo-proof",
    "lockout.city",
    "demo-call",
    "needed",
    "demo-proof",
    ["YouTube proof", "LinkedIn proof", "launch bundle proof"],
    "Call lockout.city and show an emergency lockout request captured.",
    [
      "Use a caller locked out of a home, car, or business with time pressure.",
      "Let the AI collect location, access issue, urgency, callback number, and safety context.",
      "Show the owner summary.",
      "Close with lockout.city and the no-credit-card trial.",
    ],
    "The demo proves lockout.city captures urgent context before the caller gives up.",
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
