import { getBeachheadProductRoutes } from "@/lib/product-route-inventory";

export type ProofSprintQueueId =
  | "Q-58"
  | "Q-59"
  | "Q-60"
  | "Q-61"
  | "Q-62"
  | "Q-63"
  | "Q-64"
  | "Q-65"
  | "Q-66"
  | "Q-67"
  | "Q-68"
  | "Q-69"
  | "Q-70"
  | "Q-71"
  | "Q-72";
export type ProofSprintChannel =
  | "direct-install"
  | "review-signal-outbound"
  | "founder-video"
  | "field-sales"
  | "creator-demo"
  | "paid-social";
export type EvidenceStrength = "strong" | "medium" | "weak";
export type BeachheadRole = "primary-scale" | "founder-proof" | "content-lab" | "urgency-test" | "deferred-scale";
export type PipeProofSprintStage =
  | "research"
  | "qualified"
  | "demo-target"
  | "demo-completed"
  | "trial-started"
  | "phone-connected"
  | "real-call-handled"
  | "job-captured"
  | "paid";

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
  importWorkflow: string[];
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
  priority: number;
  hypothesis: string;
  weeklyInputs: string[];
  successMetric: string;
  killCriteria: string;
  evidenceStrength: EvidenceStrength;
  gate: string;
}

export interface BeachheadPriority {
  domain: string;
  trade: string;
  role: BeachheadRole;
  label: string;
  priority: number;
  directive: string;
  reason: string;
}

export interface ActivationDefinition {
  name: string;
  shortLabel: string;
  requiredSignals: string[];
  notEnough: string[];
  ownerValueMoment: string;
}

export interface WeeklyCustomerMachineMetric {
  label: string;
  source: string;
  whyItMatters: string;
}

export interface PipeProofSprintStageDefinition {
  id: PipeProofSprintStage;
  label: string;
  intent: string;
  proofRequired: string;
}

export interface PipeProofSprintRow {
  id: string;
  businessName: string;
  cityState: string;
  stage: PipeProofSprintStage;
  source: ProofSprintChannel;
  ownerProfile: string;
  painSignal: string;
  objectionToLearn: string;
  nextAction: string;
  proofNeeded: string;
}

export interface PipeProofSprint {
  domain: "pipe.city";
  trade: "Plumbing";
  icp: string;
  timebox: string;
  targetQualifiedDemoCalls: string;
  targetActivatedTrials: string;
  stages: PipeProofSprintStageDefinition[];
  rows: PipeProofSprintRow[];
  approvalBoundary: string;
}

export interface OutreachDraftPacket {
  id: string;
  title: string;
  source: ProofSprintChannel;
  useCase: string;
  subject: string;
  body: string;
  approvalGate: string;
}

export interface DeepResearchVerdict {
  positioning: string;
  preferredOption: string;
  alternativeOption: string;
  verdict: string;
  startDoing: string[];
  stopDoing: string[];
  keepDoing: string[];
  killCriteria: string[];
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
  {
    id: "Q-64",
    title: "Strategy reset packet",
    lane: "Deep research reset",
    route: "/",
    status: "complete",
    acceptance: "Active surfaces stop presenting all five beachheads as co-equal and declare pipe.city the scale lane.",
    evidence: "Command, docs, and shared strategy contract show the plumbing-first urgent-call wedge.",
  },
  {
    id: "Q-65",
    title: "Activation definition hardening",
    lane: "Learning",
    route: "/scorecard",
    status: "complete",
    acceptance: "Activation means phone connected, one real handled call, owner summary, lead/job captured, and no immediate turnoff.",
    evidence: "Scorecard and docs expose the stricter activated-trial definition.",
  },
  {
    id: "Q-66",
    title: "Pipe.City 30-day proof sprint board",
    lane: "Sales focus",
    route: "/sales",
    status: "complete",
    acceptance: "Sales shows the pipe.city solo-owner sprint board with 50-100 demo-call target capacity and stage tracking.",
    evidence: "The board tracks research through paid proof without sending outreach.",
  },
  {
    id: "Q-67",
    title: "Pipe.City demo proof pack",
    lane: "Demo proof",
    route: "/templates",
    status: "complete",
    acceptance: "Templates promotes the pipe.city founder script, proof packet, call prompt, and screenshot checklist.",
    evidence: "The exact pipe.city demo can be run without inventing copy.",
  },
  {
    id: "Q-68",
    title: "Approval-ready outreach draft packets",
    lane: "Outreach review",
    route: "/templates",
    status: "complete",
    acceptance: "Review-signal, field-sales, and founder follow-up drafts exist as internal copy packets only.",
    evidence: "Draft packets have approval gates and no send action.",
  },
  {
    id: "Q-69",
    title: "Weekly customer machine scorecard",
    lane: "Learning",
    route: "/scorecard",
    status: "complete",
    acceptance: "Scorecard leads with paid customers, activated trials, CAC/activated trial, demo calls, and activation quality.",
    evidence: "Weekly customer machine metrics are visible before channel/editorial reporting.",
  },
  {
    id: "Q-70",
    title: "Channel priority recut",
    lane: "Learning",
    route: "/scorecard",
    status: "complete",
    acceptance: "Direct proof and install motion outrank creators and paid until proof gates are met.",
    evidence: "Paid social is last and explicitly gated by proof assets.",
  },
  {
    id: "Q-71",
    title: "Google Maps review-signal import plan",
    lane: "Research",
    route: "/sales",
    status: "complete",
    acceptance: "Review-signal capture supports manual/API/provider rows with source URL, quote, confidence, and compliance gates.",
    evidence: "Roadmap blocks scraper, CAPTCHA bypass, proxy rotation, and automated outreach paths.",
  },
  {
    id: "Q-72",
    title: "Deep Research verdict shelf",
    lane: "Strategy",
    route: "/",
    status: "complete",
    acceptance: "The report's two options, preferred lane, kill criteria, and stop/start/keep guidance are visible in-app.",
    evidence: "Command and Templates expose the concise Deep Research verdict.",
  },
];

export const beachheadPriorities: BeachheadPriority[] = [
  {
    domain: "pipe.city",
    trade: "Plumbing",
    role: "primary-scale",
    label: "Primary scale lane",
    priority: 1,
    directive: "Run the 30-day urgent-call proof sprint here first.",
    reason: "High emergency intent, obvious missed-call pain, and the clearest path from demo call to activated trial.",
  },
  {
    domain: "saw.city",
    trade: "Concrete cutting",
    role: "founder-proof",
    label: "Founder-proof lane",
    priority: 2,
    directive: "Use for credibility, origin story, and founder-led proof.",
    reason: "The product is believable here because it came from the trade, but the market is too small to be the scale thesis.",
  },
  {
    domain: "rinse.city",
    trade: "Pressure washing",
    role: "content-lab",
    label: "Creator/content lab",
    priority: 3,
    directive: "Use for visual proof and creator demos after the pipe.city message is tight.",
    reason: "Highly visual before/after work helps content, but it should amplify proof rather than lead GTM.",
  },
  {
    domain: "lockout.city",
    trade: "Locksmith",
    role: "urgency-test",
    label: "Urgency experiment",
    priority: 4,
    directive: "Run as a focused speed-to-answer test with extra trust controls.",
    reason: "Missed lockout calls vanish fast, but the category needs very clean trust proof.",
  },
  {
    domain: "mow.city",
    trade: "Lawn care",
    role: "deferred-scale",
    label: "Deferred scale lane",
    priority: 5,
    directive: "Keep the route and assets available, but do not treat it as co-equal for this sprint.",
    reason: "Large market, but lower urgent-call fit and more operational software noise than plumbing.",
  },
];

export const activationDefinition: ActivationDefinition = {
  name: "Activated trial",
  shortLabel: "Handled real call + captured job",
  requiredSignals: [
    "phone is connected or forwarded",
    "at least one real inbound call is handled by the AI",
    "owner receives the summary/text",
    "a lead or job is created",
    "owner does not immediately turn it off",
  ],
  notEnough: ["trial signup alone", "demo call alone", "phone connected without a real handled call", "AI image/ad engagement"],
  ownerValueMoment: "The owner sees that a real job was captured while they were still working.",
};

export const weeklyCustomerMachineMetrics: WeeklyCustomerMachineMetric[] = [
  {
    label: "Paid customers",
    source: "metrics + marketing_events paid",
    whyItMatters: "This is the year-end target, so it stays first.",
  },
  {
    label: "Activated trials",
    source: "marketing_events activated",
    whyItMatters: "The trial only counts when the phone handled a real call and captured a job.",
  },
  {
    label: "CAC per activated trial",
    source: "weekly spend / activated trials",
    whyItMatters: "At $39/mo, paid channels need early payback discipline.",
  },
  {
    label: "Demo calls",
    source: "marketing_events demo_call",
    whyItMatters: "The live demo is the fastest trust builder for skeptical owners.",
  },
  {
    label: "Trial-to-activation",
    source: "activated / trial_started",
    whyItMatters: "This exposes setup friction before spend scales.",
  },
  {
    label: "Time to first value",
    source: "manual sprint notes until product events exist",
    whyItMatters: "The wedge fails if a solo owner cannot see value inside 72 hours.",
  },
  {
    label: "Activation-to-paid",
    source: "paid / activated",
    whyItMatters: "Proof only matters if activated owners stay through the $39/mo conversion.",
  },
  {
    label: "Owner conversations",
    source: "sales CRM and approved call notes",
    whyItMatters: "Objection quality matters more than broad TAM math in this phase.",
  },
];

export const pipeProofSprint: PipeProofSprint = {
  domain: "pipe.city",
  trade: "Plumbing",
  icp: "Solo plumbing owner-operator who misses calls while under a sink, in a crawlspace, driving, or already on a service call.",
  timebox: "30 days",
  targetQualifiedDemoCalls: "50-100 qualified demo-call targets",
  targetActivatedTrials: "30 activated trials from the first 100 qualified demo calls",
  approvalBoundary: "Rows, scripts, and drafts are internal. Outreach/send, paid boost, platform upload, webhook, billing, or sawcity-lite edits require Jarrad approval.",
  stages: [
    {
      id: "research",
      label: "Research",
      intent: "Find a public missed-call or callback pain signal.",
      proofRequired: "Source URL, quote/pain phrase, trade fit, and confidence score.",
    },
    {
      id: "qualified",
      label: "Qualified",
      intent: "Solo-owner fit is plausible and the pain maps to pipe.city.",
      proofRequired: "Owner-operated signal, Arizona or target metro, and no enterprise/franchise mismatch.",
    },
    {
      id: "demo-target",
      label: "Demo target",
      intent: "Ready for a Jarrad-approved one-to-one demo invite.",
      proofRequired: "Approved draft packet and matching demo line.",
    },
    {
      id: "demo-completed",
      label: "Demo completed",
      intent: "Owner heard or watched a realistic pipe.city call.",
      proofRequired: "Demo date, objection heard, and next action.",
    },
    {
      id: "trial-started",
      label: "Trial started",
      intent: "Owner began the 14-day no-card trial.",
      proofRequired: "Trial source and trade-domain UTM.",
    },
    {
      id: "phone-connected",
      label: "Phone connected",
      intent: "Forwarding or phone setup is complete.",
      proofRequired: "Phone setup confirmation; this alone is not activation.",
    },
    {
      id: "real-call-handled",
      label: "Real call handled",
      intent: "The AI handled a real inbound customer call.",
      proofRequired: "Handled-call event or owner-confirmed call summary.",
    },
    {
      id: "job-captured",
      label: "Job captured",
      intent: "The call produced a lead or job record the owner can act on.",
      proofRequired: "Masked job/lead summary and owner acknowledgement.",
    },
    {
      id: "paid",
      label: "Paid",
      intent: "Activated owner converts to the $39/mo plan.",
      proofRequired: "Paid conversion event; no billing action from 4H.",
    },
  ],
  rows: [
    {
      id: "pipe-001",
      businessName: "Phoenix emergency plumbing owner",
      cityState: "Phoenix, AZ",
      stage: "research",
      source: "review-signal-outbound",
      ownerProfile: "Solo or small crew owner answering calls from the truck.",
      painSignal: "Public review mentions no answer, voicemail, or slow callback.",
      objectionToLearn: "$39 sounds too cheap to trust.",
      nextAction: "Capture public source URL and draft a one-to-one review-signal note for approval.",
      proofNeeded: "Live Pipe.City demo plus masked job summary.",
    },
    {
      id: "pipe-002",
      businessName: "Mesa water heater repair owner",
      cityState: "Mesa, AZ",
      stage: "qualified",
      source: "field-sales",
      ownerProfile: "Owner performs jobs and cannot answer while on-site.",
      painSignal: "Emergency water heater calls are high value and time-sensitive.",
      objectionToLearn: "I need to answer my own calls.",
      nextAction: "Use the AZ rep card to invite a live call simulation after approval.",
      proofNeeded: "Owner receives summary text immediately after demo call.",
    },
    {
      id: "pipe-003",
      businessName: "Scottsdale drain cleaning owner",
      cityState: "Scottsdale, AZ",
      stage: "demo-target",
      source: "direct-install",
      ownerProfile: "Solo operator with repeat urgent drain calls.",
      painSignal: "Calls arrive while hands are dirty or equipment is running.",
      objectionToLearn: "I do not want another app.",
      nextAction: "Run the no-dashboard pitch: AI answers and texts the owner first.",
      proofNeeded: "SMS-style summary and lead/job capture screenshot.",
    },
    {
      id: "pipe-004",
      businessName: "Tempe after-hours plumber",
      cityState: "Tempe, AZ",
      stage: "demo-completed",
      source: "founder-video",
      ownerProfile: "Owner cares about after-hours jobs but hates software setup.",
      painSignal: "After-hours callers will call the next plumber.",
      objectionToLearn: "AI sounds fake.",
      nextAction: "Compare the demo reaction to the objection bank and decide if trial invite is worth approval.",
      proofNeeded: "Recorded demo reaction and voice-quality note.",
    },
    {
      id: "pipe-005",
      businessName: "Gilbert leak repair solo owner",
      cityState: "Gilbert, AZ",
      stage: "trial-started",
      source: "review-signal-outbound",
      ownerProfile: "One-person shop with no dispatcher.",
      painSignal: "Callback complaints create a concrete before/after story.",
      objectionToLearn: "Setup friction.",
      nextAction: "Track whether phone connection happens inside 72 hours.",
      proofNeeded: "Phone setup confirmation and first handled call.",
    },
  ],
};

export const outreachDraftPackets: OutreachDraftPacket[] = [
  {
    id: "pipe-review-signal-draft",
    title: "Pipe.City review-signal demo invite",
    source: "review-signal-outbound",
    useCase: "One-to-one note after manual/API/provider research finds a public callback pain signal.",
    subject: "Quick Pipe.City demo for missed plumbing calls",
    body:
      "Saw a public callback/phone-friction signal for your plumbing shop. Pipe.City is a $39/mo AI phone rep built for solo owners who are already on a job. It answers, qualifies, texts you the summary, and can open the job. 14-day free trial, no credit card required. I can show the live demo line first if you want to hear it before trying anything.",
    approvalGate: "Jarrad approval is required for the exact recipient set and message before any email, SMS, DM, call, or form send.",
  },
  {
    id: "pipe-field-sales-follow-up",
    title: "AZ rep card follow-up",
    source: "field-sales",
    useCase: "Follow-up copy after a real in-person touch or card handoff.",
    subject: "The Pipe.City demo from the card",
    body:
      "Good meeting you. The simple version: Pipe.City catches the plumbing calls you miss while you are on another job, then texts you the job summary. It is $39/mo after a 14-day free trial with no credit card. The next useful step is just calling the demo line and deciding if it would help or embarrass you.",
    approvalGate: "Internal draft only; send requires action-time approval and a real opted/contextual recipient.",
  },
  {
    id: "pipe-founder-follow-up",
    title: "Founder demo follow-up",
    source: "founder-video",
    useCase: "Follow-up after an owner watches or hears the pipe.city founder demo.",
    subject: "That missed-call demo in Pipe.City",
    body:
      "The whole pitch is the moment you just saw: you are under a sink, the phone rings, and Pipe.City catches enough detail to create the next job. If the demo call felt real enough, the next test is connecting your phone and waiting for one real inbound call. We only count it as activated after that call gets handled and a lead/job is captured.",
    approvalGate: "Review-only copy packet; Jarrad approval required before any send, and no auto-send, webhook, CRM sync, or sequence is created.",
  },
];

export const deepResearchVerdict: DeepResearchVerdict = {
  positioning:
    "Answered.City is the phone-answering system for owner-operators in the trades: it answers the call, qualifies the lead, texts you, and opens the job while you keep working.",
  preferredOption: "Urgent-call wedge: plumbing first, locksmith second, pressure washing as proof-content lab.",
  alternativeOption: "Creator-led visual wedge: pressure washing first, lawn care second, plumbing retained as conversion benchmark.",
  verdict:
    "The product thesis is real, but 4H must stop acting like a broad planning surface and become a narrow proof-to-install customer engine.",
  startDoing: [
    "Sell the missed-call moment.",
    "Measure activation as connected phone plus real handled call plus captured job.",
    "Run one metro, one script, one trade before broad paid scale.",
  ],
  stopDoing: [
    "Treating all five beachheads as equal.",
    "Leading with broad AI receptionist plus owner-agent plus job-management language.",
    "Letting internal dashboard work outrun customer throughput.",
  ],
  keepDoing: [
    "Keep sawcity-lite read-only.",
    "Keep $39/mo with 14-day free trial and no credit card.",
    "Keep human approval for spend, outreach, uploads, webhooks, and billing.",
  ],
  killCriteria: [
    "Fewer than 30 activated trials from the first 100 qualified demo calls.",
    "Trial-to-paid below 20% on activated accounts.",
    "Time to first value consistently above 72 hours.",
    "More than 7 days from ready-to-test to live approved test because of approval bottlenecks.",
  ],
};

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
  importWorkflow: [
    "Manual row: human reviews Google Maps/public pages and enters only business facts, source URL, quote, review date, confidence, and next permitted action.",
    "Official API row: Google Places API or an approved provider supplies the business/source metadata; a human still verifies the pain signal before drafting.",
    "Provider row: imported from a compliant vendor list only after source terms and data fields are reviewed.",
    "Approval row: any draft outreach, enrichment, or repeatable collection job stops for Jarrad approval before transmission or automation.",
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
    id: "exp-direct-install",
    channel: "direct-install",
    title: "Pipe.City direct install motion",
    priority: 1,
    hypothesis: "A solo plumbing owner who hears the live demo is more likely to activate than broad paid traffic.",
    weeklyInputs: ["50-100 qualified demo targets", "15 owner conversations", "5 phone-connection assists"],
    successMetric: "30 activated trials from the first 100 qualified demo calls.",
    killCriteria: "Fewer than 30 activated trials from 100 qualified demos, or time to first value above 72 hours.",
    evidenceStrength: "strong",
    gate: "Run before creator scale or paid launch.",
  },
  {
    id: "exp-review-signal",
    channel: "review-signal-outbound",
    title: "Review-signal lead finder",
    priority: 2,
    hypothesis: "Owners with public callback complaints are more likely to take a live demo than cold TAM lists.",
    weeklyInputs: ["25 manually reviewed businesses", "10 qualified rows", "5 approved one-to-one drafts"],
    successMetric: "Two demo conversations or one trial start from a qualified review-signal batch.",
    killCriteria: "No replies or demos after 30 approved, personalized attempts.",
    evidenceStrength: "strong",
    gate: "Manual/API/provider research only; no automated sends.",
  },
  {
    id: "exp-founder-video",
    channel: "founder-video",
    title: "Founder proof shorts",
    priority: 3,
    hypothesis: "Real trade demo clips beat polished SaaS creative for owner-operators.",
    weeklyInputs: ["5 scripts", "3 recorded clips", "1 clip per beachhead queued for approval"],
    successMetric: "Three owner conversations, creator replies, or demo calls attributed to founder proof.",
    killCriteria: "No demo clicks, replies, or qualitative pull after 10 clips.",
    evidenceStrength: "strong",
    gate: "Use to amplify pipe.city proof first.",
  },
  {
    id: "exp-field-sales",
    channel: "field-sales",
    title: "Arizona rep card pilot",
    priority: 4,
    hypothesis: "In-person trust plus a live demo line converts earlier than scaled paid traffic.",
    weeklyInputs: ["35 planned touches", "20 cards carried", "10 real CRM rows"],
    successMetric: "Five scans, two demos, or one trial start in a week.",
    killCriteria: "No scans after 50 relevant card handoffs and verified QR path.",
    evidenceStrength: "medium",
    gate: "Micro-pilot only; do not pretend field sales is scalable until close math is known.",
  },
  {
    id: "exp-creator-demo",
    channel: "creator-demo",
    title: "Creator calls the AI on camera",
    priority: 5,
    hypothesis: "Trade audiences trust a creator testing the demo line more than a brand ad.",
    weeklyInputs: ["10 qualified creators", "5 approved drafts", "2 demo briefs"],
    successMetric: "One creator agreement or three serious replies from approved sends.",
    killCriteria: "No replies after 20 properly matched creator attempts.",
    evidenceStrength: "medium",
    gate: "Amplification layer after a proof asset converts.",
  },
  {
    id: "exp-paid-social",
    channel: "paid-social",
    title: "Small paid proof boost",
    priority: 6,
    hypothesis: "Paid works after a proof clip exists, not before the winning message is known.",
    weeklyInputs: ["1 approved proof clip", "3 platform variants", "one $50-$150 test budget proposal"],
    successMetric: "Demo-call or signup intent at a payback path that can beat three to four months.",
    killCriteria: "Spend produces clicks without demo calls, signups, or useful owner objections.",
    evidenceStrength: "weak",
    gate: "Blocked until a proof clip or direct-install script produces demo/activation signal.",
  },
];

export function summarizeProofSprint() {
  return {
    queueItems: proofSprintQueue.length,
    resetQueueItems: proofSprintQueue.filter((item) => ["Q-64", "Q-65", "Q-66", "Q-67", "Q-68", "Q-69", "Q-70", "Q-71", "Q-72"].includes(item.id)).length,
    painSignals: googleMapsLeadFinderRoadmap.painSignals.length,
    founderScripts: founderDemoScripts.length,
    objections: objectionBank.length,
    proofPackets: liveProofPackets.length,
    firstCustomerRows: tenCustomerSprintRows.length,
    pipeSprintRows: pipeProofSprint.rows.length,
    channelExperiments: channelExperimentLedger.length,
    strongestChannels: channelExperimentLedger.filter((experiment) => experiment.evidenceStrength === "strong").length,
    primaryLane: beachheadPriorities.find((item) => item.role === "primary-scale")?.domain ?? "pipe.city",
    activationShortLabel: activationDefinition.shortLabel,
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
  return [...experiments].sort((a, b) => a.priority - b.priority || strengthRank[b.evidenceStrength] - strengthRank[a.evidenceStrength]);
}

export function getPrimaryBeachheadPriority() {
  return beachheadPriorities.find((priority) => priority.role === "primary-scale") ?? beachheadPriorities[0];
}

export function getPipeFounderScript() {
  return founderDemoScripts.find((script) => script.domain === "pipe.city") ?? founderDemoScripts[0];
}

export function getPipeProofPacket() {
  return liveProofPackets.find((packet) => packet.domain === "pipe.city") ?? liveProofPackets[0];
}
