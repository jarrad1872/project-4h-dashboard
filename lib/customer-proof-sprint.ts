import { getBeachheadProductRoutes } from "@/lib/product-route-inventory";

export type ProofSprintQueueId = "Q-58" | "Q-59" | "Q-60" | "Q-61" | "Q-62" | "Q-63";
export type ProofSprintChannel =
  | "review-signal-outbound"
  | "founder-video"
  | "field-sales"
  | "creator-demo"
  | "paid-social";
export type EvidenceStrength = "strong" | "medium" | "weak";

export interface ProofSprintQueueItem {
  id: ProofSprintQueueId;
  title: string;
  lane: string;
  route: string;
  status: "complete";
  acceptance: string;
  evidence: string;
}

export interface PainSignalPhrase {
  phrase: string;
  intent: "missed-call" | "slow-callback" | "no-show" | "after-hours" | "admin-overload";
  whyItMatters: string;
}

export interface GoogleMapsLeadFinderRoadmap {
  status: "roadmap";
  principle: string;
  targetQueries: string[];
  captureFields: string[];
  painSignals: PainSignalPhrase[];
  compliantPath: string[];
  aggressiveButHumanPath: string[];
  blockedTactics: string[];
  scoringRubric: string[];
  reviewRequiredBefore: string[];
}

export interface FounderDemoScript {
  id: string;
  domain: string;
  trade: string;
  demoPhone: string;
  title: string;
  hook: string;
  beats: string[];
  proofShot: string;
  cta: string;
}

export interface ObjectionBankEntry {
  objection: string;
  whatItMeans: string;
  response: string;
  proofNeeded: string;
}

export interface LiveProofPacket {
  id: string;
  domain: string;
  trade: string;
  demoPhone: string;
  callPrompt: string;
  aiCapture: string[];
  screenshotChecklist: string[];
  trackingPath: string;
  closeLine: string;
}

export interface TenCustomerSprintRow {
  id: string;
  tradeDomain: string;
  source: ProofSprintChannel;
  status: "research" | "qualified" | "demo-target" | "trial-target";
  ownerHypothesis: string;
  painSignal: string;
  nextMove: string;
}

export interface ChannelExperiment {
  id: string;
  channel: ProofSprintChannel;
  title: string;
  hypothesis: string;
  weeklyInputs: string[];
  successMetric: string;
  killCriteria: string;
  evidenceStrength: EvidenceStrength;
}

export const proofSprintQueue: ProofSprintQueueItem[] = [
  {
    id: "Q-58",
    title: "Pain-signal lead finder",
    lane: "Customer proof",
    route: "/sales",
    status: "complete",
    acceptance:
      "4H documents the review-signal prospecting workflow, capture fields, scoring, and guardrails without scraping, sending outreach, or bypassing Google controls.",
    evidence: "Google Maps roadmap, pain phrases, blocked tactics, and scoring rubric are visible in Sales and docs.",
  },
  {
    id: "Q-59",
    title: "Founder demo script factory",
    lane: "Founder proof",
    route: "/templates",
    status: "complete",
    acceptance: "Each beachhead trade has a 30-60 second founder video script tied to the live demo line and hard offer.",
    evidence: "Templates exposes copy-ready scripts for saw.city, pipe.city, mow.city, rinse.city, and lockout.city.",
  },
  {
    id: "Q-60",
    title: "Objection bank",
    lane: "Sales learning",
    route: "/sales",
    status: "complete",
    acceptance: "Common buyer objections are mapped to what they mean, the field response, and proof needed.",
    evidence: "Sales shows the internal objection bank before any outreach or call follow-up automation.",
  },
  {
    id: "Q-61",
    title: "Live proof packet",
    lane: "Demo proof",
    route: "/templates",
    status: "complete",
    acceptance: "Each beachhead has a demo phone, call prompt, AI capture checklist, screenshot checklist, and tracked signup path.",
    evidence: "Templates exposes proof packets that can be copied for founder, creator, or rep demo prep.",
  },
  {
    id: "Q-62",
    title: "10-customer sprint board",
    lane: "Pipeline focus",
    route: "/sales",
    status: "complete",
    acceptance: "4H tracks the next 10 customer attempts as internal targets, not broad TAM math.",
    evidence: "Sales and Command show 10 first-customer rows with source, pain signal, and next move.",
  },
  {
    id: "Q-63",
    title: "Channel experiment ledger",
    lane: "Learning",
    route: "/scorecard",
    status: "complete",
    acceptance: "Weekly learning compares field sales, founder video, creator demos, review-signal outbound, and paid social by conversion intent.",
    evidence: "Scorecard shows input targets, success metrics, kill criteria, and evidence strength by channel.",
  },
];

export const googleMapsLeadFinderRoadmap: GoogleMapsLeadFinderRoadmap = {
  status: "roadmap",
  principle:
    "Use Google Maps as a pain-signal research surface, not as a blind spam cannon. Prefer official Places API, manual review, and user-entered rows before any scale motion.",
  targetQueries: [
    "plumber Phoenix AZ reviews did not answer phone",
    "lawn care Phoenix hard to reach owner reviews",
    "pressure washing Scottsdale no call back reviews",
    "locksmith Tempe voicemail reviews",
    "concrete cutting Mesa estimate callback reviews",
  ],
  captureFields: [
    "business name",
    "trade domain fit",
    "city/state",
    "source URL",
    "review quote or pain phrase",
    "review date",
    "rating context",
    "owner/contact page URL when public",
    "human confidence score",
    "next permitted action",
  ],
  painSignals: [
    {
      phrase: "did not answer",
      intent: "missed-call",
      whyItMatters: "Direct signal that a caller tried to buy and the phone path failed.",
    },
    {
      phrase: "never called back",
      intent: "slow-callback",
      whyItMatters: "Good fit for 24/7 capture plus owner SMS summary.",
    },
    {
      phrase: "left a voicemail",
      intent: "missed-call",
      whyItMatters: "Voicemail is a conversion leak that a live AI receptionist can replace.",
    },
    {
      phrase: "after hours",
      intent: "after-hours",
      whyItMatters: "High-fit for plumbers, locksmiths, and emergency service owners.",
    },
    {
      phrase: "hard to schedule",
      intent: "admin-overload",
      whyItMatters: "Indicates job-management and follow-up pain beyond just call answering.",
    },
  ],
  compliantPath: [
    "Start manual: search one trade/city, capture only public business facts and review snippets needed for qualification.",
    "Use official Google Places API or approved data providers before any repeatable collection job.",
    "Store source URL, query, review date, and confidence so every prospect can be audited.",
    "Create internal 4H rows only; do not send outreach until Jarrad approves the exact message and recipient set.",
    "Let the Arizona rep validate whether the pain is real before adding paid budget.",
  ],
  aggressiveButHumanPath: [
    "Use a human researcher or agent-assisted browser session to inspect public results and paste qualified rows into 4H.",
    "Prioritize businesses with recent public reviews mentioning phone/callback friction.",
    "Personalize every draft around the visible pain signal and the matching trade demo line.",
    "Batch in small sets of 10-25 for approval, not hundreds of automated sends.",
  ],
  blockedTactics: [
    "No CAPTCHA solving, login bypass, proxy rotation, rate-limit evasion, or hidden scraping infrastructure.",
    "No copying private contact data, browser history, or personal data into 4H.",
    "No automated outreach from this finder; any outreach draft from manual/API/provider research rows requires action-time approval.",
    "No claims that a review proves a business is losing revenue unless the owner confirms it.",
  ],
  scoringRubric: [
    "+3 recent review says did not answer, voicemail, no callback, or hard to reach.",
    "+2 emergency/high-intent trade where speed matters: plumbing, locksmith, concrete cutting.",
    "+2 owner-operated visual signals: small crew, direct owner phone, no obvious dispatcher.",
    "+1 Arizona proximity for the current rep pilot.",
    "-3 enterprise/franchise/large dispatcher operation.",
    "-2 weak or stale review evidence older than 18 months.",
  ],
  reviewRequiredBefore: [
    "saving any real personal contact details",
    "sending email, SMS, DM, or form submissions",
    "running any repeatable extractor",
    "connecting paid enrichment tools",
  ],
};

const routeByDomain = Object.fromEntries(getBeachheadProductRoutes().map((route) => [route.domain, route]));

const demoPhoneFor = (domain: string) => routeByDomain[domain]?.demoPhone ?? "Demo line missing";
const tradeFor = (domain: string) => routeByDomain[domain]?.tradeLabel ?? domain.replace(".city", "");

export const founderDemoScripts: FounderDemoScript[] = [
  {
    id: "pipe-founder-missed-call",
    domain: "pipe.city",
    trade: tradeFor("pipe.city"),
    demoPhone: demoPhoneFor("pipe.city"),
    title: "The under-the-sink call",
    hook: "If you are under a sink when the emergency call comes in, Pipe.City answers before the next plumber gets it.",
    beats: [
      "Open on a noisy plumbing repair scene and show the owner ignoring a ringing phone because both hands are busy.",
      `Call ${demoPhoneFor("pipe.city")} on speaker and ask for help with a leaking water heater.`,
      "Show the AI collecting service, address, urgency, and callback details.",
      "Cut to the owner getting the job summary text and saying exactly what they would do next.",
    ],
    proofShot: "Phone screen with the captured plumbing job summary, no private caller data.",
    cta: "Try Pipe.City for $39/mo. Start the 14-day free trial with no credit card.",
  },
  {
    id: "mow-founder-route-call",
    domain: "mow.city",
    trade: tradeFor("mow.city"),
    demoPhone: demoPhoneFor("mow.city"),
    title: "The mowing-route estimate",
    hook: "Most lawn owners get estimate calls while they are mowing. Mow.City keeps the lead warm until the route is done.",
    beats: [
      "Show a mower/truck route moment where the owner cannot safely answer.",
      `Call ${demoPhoneFor("mow.city")} and ask for weekly mowing plus edging.`,
      "Show the AI capturing address, lawn size clues, frequency, and timeline.",
      "Show the owner reviewing the lead after the job without digging through voicemail.",
    ],
    proofShot: "Captured mowing estimate summary with trade-specific fields visible.",
    cta: "Try Mow.City for $39/mo. 14-day free trial, no credit card required.",
  },
  {
    id: "rinse-founder-before-after",
    domain: "rinse.city",
    trade: tradeFor("rinse.city"),
    demoPhone: demoPhoneFor("rinse.city"),
    title: "The driveway quote call",
    hook: "Pressure washing leads are visual and impatient. Rinse.City answers while the wand is running.",
    beats: [
      "Open on a loud driveway wash or before/after frame.",
      `Call ${demoPhoneFor("rinse.city")} and ask for a driveway and patio quote.`,
      "Show the AI gathering surfaces, photos/description, address, and preferred timing.",
      "End with the owner getting a clean estimate-ready summary.",
    ],
    proofShot: "Before/after visual plus the AI's captured pressure-washing scope.",
    cta: "Start Rinse.City free for 14 days. No credit card. $39/mo after trial.",
  },
  {
    id: "lockout-founder-emergency",
    domain: "lockout.city",
    trade: tradeFor("lockout.city"),
    demoPhone: demoPhoneFor("lockout.city"),
    title: "The emergency lockout",
    hook: "A lockout caller will not wait for voicemail. Lockout.City answers instantly and gets the details.",
    beats: [
      "Open with a caller locked out near a car or front door.",
      `Call ${demoPhoneFor("lockout.city")} and describe an urgent lockout.`,
      "Show the AI collecting location, lock type, safety concern, and callback number.",
      "Show the owner receiving the emergency summary immediately.",
    ],
    proofShot: "Emergency summary showing location and lock type, with any personal data masked.",
    cta: "Try Lockout.City for $39/mo. 14-day free trial, no credit card required.",
  },
  {
    id: "saw-founder-noisy-jobsite",
    domain: "saw.city",
    trade: tradeFor("saw.city"),
    demoPhone: demoPhoneFor("saw.city"),
    title: "The saw-running estimate",
    hook: "Concrete cutting owners miss calls because the jobsite is loud. Saw.City turns the call into an estimate-ready lead.",
    beats: [
      "Open on a loud saw-cutting or slab-marking scene.",
      `Call ${demoPhoneFor("saw.city")} and ask about a wall or slab cutting estimate.`,
      "Show the AI collecting cut type, material, access, schedule, and location.",
      "Show the owner reading a job summary instead of listening to a vague voicemail.",
    ],
    proofShot: "Captured concrete cutting estimate scope with no private customer data.",
    cta: "Start Saw.City free for 14 days. No credit card. $39/mo after trial.",
  },
];

export const objectionBank: ObjectionBankEntry[] = [
  {
    objection: "I already use Jobber or Housecall Pro.",
    whatItMeans: "They may not need full FSM replacement, but they still may miss calls before jobs enter the system.",
    response: "Keep your current tools. Answered.City is the phone layer that captures the job before it becomes admin work.",
    proofNeeded: "Demo call that ends in a clean job summary and optional handoff notes.",
  },
  {
    objection: "AI sounds fake.",
    whatItMeans: "Trust and voice quality are the buying barrier, not feature comprehension.",
    response: "Call the trade demo line first. If it would embarrass you with a real customer, do not use it.",
    proofNeeded: "Live demo line recording or in-person call on speaker.",
  },
  {
    objection: "$39/mo seems too cheap.",
    whatItMeans: "Low price can create credibility doubt even while reducing friction.",
    response: "It is priced for owner-operators, not enterprise dispatch teams. One captured job can cover the year.",
    proofNeeded: "ROI math with one missed job and clear trial terms.",
  },
  {
    objection: "I do not want another app.",
    whatItMeans: "The product must feel like phone-first relief, not a dashboard chore.",
    response: "Start with the receptionist and SMS summaries. Use the app only when the lead is worth tracking.",
    proofNeeded: "SMS/job summary screenshot and two-tap next action.",
  },
  {
    objection: "I need to answer my own calls.",
    whatItMeans: "They fear losing relationship quality or job control.",
    response: "Answered.City catches the calls you cannot answer, then texts you the lead so you stay in control.",
    proofNeeded: "Missed-call scenario where owner receives the summary immediately.",
  },
];

export const liveProofPackets: LiveProofPacket[] = founderDemoScripts.map((script) => ({
  id: script.id.replace("founder", "proof"),
  domain: script.domain,
  trade: script.trade,
  demoPhone: script.demoPhone,
  callPrompt: `Call ${script.demoPhone} and ask for a realistic ${script.trade.toLowerCase()} job while the owner is busy.`,
  aiCapture: [
    "caller name and callback path",
    "service type and urgency",
    "job address or service area",
    "schedule preference",
    "owner-ready summary",
  ],
  screenshotChecklist: [
    "mask caller personal data",
    "show the trade-specific domain",
    "show the $39/mo and 14-day trial offer nearby",
    "capture the job summary or lead card",
  ],
  trackingPath: `https://${script.domain}/?utm_source=founder&utm_medium=proof&utm_campaign=4h_2026-04_customer_proof&utm_content=${script.id}`,
  closeLine: script.cta,
}));

export const tenCustomerSprintRows: TenCustomerSprintRow[] = [
  {
    id: "first-001",
    tradeDomain: "pipe.city",
    source: "review-signal-outbound",
    status: "research",
    ownerHypothesis: "Small emergency plumbing shop with public callback complaints.",
    painSignal: "Review mentions no answer, voicemail, or slow callback.",
    nextMove: "Find one public review-signal row, save source URL, and draft a Jarrad-approved one-to-one message.",
  },
  {
    id: "first-002",
    tradeDomain: "pipe.city",
    source: "field-sales",
    status: "qualified",
    ownerHypothesis: "Phoenix plumbing owner who answers from the truck.",
    painSignal: "After-hours and emergency calls are too valuable to miss.",
    nextMove: "Arizona rep validates whether a live Pipe.City call is interesting enough for a trial.",
  },
  {
    id: "first-003",
    tradeDomain: "mow.city",
    source: "founder-video",
    status: "demo-target",
    ownerHypothesis: "Lawn owner who misses estimate calls during route hours.",
    painSignal: "Estimate requests go cold by evening.",
    nextMove: "Publish or review the mowing-route founder script before any paid boost.",
  },
  {
    id: "first-004",
    tradeDomain: "rinse.city",
    source: "creator-demo",
    status: "demo-target",
    ownerHypothesis: "Pressure washing creator audience includes solo operators with quote friction.",
    painSignal: "Visual quote calls arrive while the wand is running.",
    nextMove: "Match a creator demo brief to the Rinse.City proof packet.",
  },
  {
    id: "first-005",
    tradeDomain: "lockout.city",
    source: "field-sales",
    status: "qualified",
    ownerHypothesis: "Locksmith owner knows missed lockout calls are instantly lost.",
    painSignal: "Emergency caller will not leave voicemail and wait.",
    nextMove: "Run a live lockout call simulation before discussing trial.",
  },
  {
    id: "first-006",
    tradeDomain: "saw.city",
    source: "founder-video",
    status: "demo-target",
    ownerHypothesis: "Concrete cutting owner believes the product because it came from the trade.",
    painSignal: "Noisy jobs make missed estimate calls unavoidable.",
    nextMove: "Record the saw-running estimate demo with KCC credibility.",
  },
  {
    id: "first-007",
    tradeDomain: "mow.city",
    source: "review-signal-outbound",
    status: "research",
    ownerHypothesis: "Lawn care company has public complaints around scheduling or callbacks.",
    painSignal: "Hard-to-schedule reviews indicate admin overload.",
    nextMove: "Capture source evidence and route into the objection bank if subscription fatigue appears.",
  },
  {
    id: "first-008",
    tradeDomain: "rinse.city",
    source: "paid-social",
    status: "research",
    ownerHypothesis: "Pressure washers respond to simple before/after proof more than generic AI claims.",
    painSignal: "Quote requests arrive mid-job.",
    nextMove: "Hold paid spend until one organic/founder proof clip has response signal.",
  },
  {
    id: "first-009",
    tradeDomain: "lockout.city",
    source: "review-signal-outbound",
    status: "research",
    ownerHypothesis: "Locksmith reviews expose speed and phone reliability pain.",
    painSignal: "Caller could not reach a locksmith in an urgent moment.",
    nextMove: "Manual source capture only; no automated scraping or send.",
  },
  {
    id: "first-010",
    tradeDomain: "answered.city",
    source: "creator-demo",
    status: "trial-target",
    ownerHypothesis: "A non-beachhead trade owner enters through broad Answered.City proof.",
    painSignal: "Wants an AI phone rep without caring about the domain portfolio.",
    nextMove: "Use only if trade-specific paths do not explain the buyer's business.",
  },
];

export const channelExperimentLedger: ChannelExperiment[] = [
  {
    id: "exp-review-signal",
    channel: "review-signal-outbound",
    title: "Review-signal lead finder",
    hypothesis: "Owners with public callback complaints are more likely to take a live demo than cold TAM lists.",
    weeklyInputs: ["25 manually reviewed businesses", "10 qualified rows", "5 approved one-to-one drafts"],
    successMetric: "Two demo conversations or one trial start from a qualified review-signal batch.",
    killCriteria: "No replies or demos after 30 approved, personalized attempts.",
    evidenceStrength: "strong",
  },
  {
    id: "exp-founder-video",
    channel: "founder-video",
    title: "Founder proof shorts",
    hypothesis: "Real trade demo clips beat polished SaaS creative for owner-operators.",
    weeklyInputs: ["5 scripts", "3 recorded clips", "1 clip per beachhead queued for approval"],
    successMetric: "Three owner conversations, creator replies, or demo calls attributed to founder proof.",
    killCriteria: "No demo clicks, replies, or qualitative pull after 10 clips.",
    evidenceStrength: "strong",
  },
  {
    id: "exp-field-sales",
    channel: "field-sales",
    title: "Arizona rep card pilot",
    hypothesis: "In-person trust plus a live demo line converts earlier than scaled paid traffic.",
    weeklyInputs: ["35 planned touches", "20 cards carried", "10 real CRM rows"],
    successMetric: "Five scans, two demos, or one trial start in a week.",
    killCriteria: "No scans after 50 relevant card handoffs and verified QR path.",
    evidenceStrength: "medium",
  },
  {
    id: "exp-creator-demo",
    channel: "creator-demo",
    title: "Creator calls the AI on camera",
    hypothesis: "Trade audiences trust a creator testing the demo line more than a brand ad.",
    weeklyInputs: ["10 qualified creators", "5 approved drafts", "2 demo briefs"],
    successMetric: "One creator agreement or three serious replies from approved sends.",
    killCriteria: "No replies after 20 properly matched creator attempts.",
    evidenceStrength: "medium",
  },
  {
    id: "exp-paid-social",
    channel: "paid-social",
    title: "Small paid proof boost",
    hypothesis: "Paid works after a proof clip exists, not before the winning message is known.",
    weeklyInputs: ["1 approved proof clip", "3 platform variants", "one $50-$150 test budget proposal"],
    successMetric: "Demo-call or signup intent at a payback path that can beat three to four months.",
    killCriteria: "Spend produces clicks without demo calls, signups, or useful owner objections.",
    evidenceStrength: "weak",
  },
];

export function summarizeProofSprint() {
  return {
    queueItems: proofSprintQueue.length,
    painSignals: googleMapsLeadFinderRoadmap.painSignals.length,
    founderScripts: founderDemoScripts.length,
    objections: objectionBank.length,
    proofPackets: liveProofPackets.length,
    firstCustomerRows: tenCustomerSprintRows.length,
    channelExperiments: channelExperimentLedger.length,
    strongestChannels: channelExperimentLedger.filter((experiment) => experiment.evidenceStrength === "strong").length,
    safetyBoundary:
      "Research, scripts, proof prep, and internal scoring only. No scraping evasion, outreach send, upload, launch, webhook, spend, billing, or sawcity-lite edits.",
  };
}

export function buildFounderDemoScriptPacket(script: FounderDemoScript) {
  return [
    `${script.domain} founder demo script`,
    `Trade: ${script.trade}`,
    `Demo line: ${script.demoPhone}`,
    "",
    `Hook: ${script.hook}`,
    "",
    "Beats:",
    ...script.beats.map((beat, index) => `${index + 1}. ${beat}`),
    "",
    `Proof shot: ${script.proofShot}`,
    `CTA: ${script.cta}`,
  ].join("\n");
}

export function buildLiveProofPacketCopy(packet: LiveProofPacket) {
  return [
    `${packet.domain} live proof packet`,
    `Trade: ${packet.trade}`,
    `Demo phone: ${packet.demoPhone}`,
    `Call prompt: ${packet.callPrompt}`,
    "",
    "AI should capture:",
    ...packet.aiCapture.map((item) => `- ${item}`),
    "",
    "Screenshot checklist:",
    ...packet.screenshotChecklist.map((item) => `- ${item}`),
    "",
    `Tracking path: ${packet.trackingPath}`,
    `Close: ${packet.closeLine}`,
  ].join("\n");
}

export function rankChannelExperiments(experiments = channelExperimentLedger) {
  const strengthRank: Record<EvidenceStrength, number> = { strong: 3, medium: 2, weak: 1 };
  return [...experiments].sort((a, b) => strengthRank[b.evidenceStrength] - strengthRank[a.evidenceStrength]);
}
