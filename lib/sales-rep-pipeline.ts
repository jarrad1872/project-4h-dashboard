export type SalesStage =
  | "prospect"
  | "qualified"
  | "visited"
  | "card-left"
  | "demo-booked"
  | "trial-started"
  | "activated"
  | "paid"
  | "lost";

export interface SalesRep {
  id: string;
  name: string;
  region: string;
  state: string;
  code: string;
  role: string;
  weeklyTouchTarget: number;
  focusTrades: string[];
  notes: string;
}

export interface SalesLead {
  id: string;
  repId: string;
  businessName: string;
  city: string;
  state: string;
  tradeDomain: string;
  stage: SalesStage;
  leadType: "archetype" | "real";
  ownerProfile: string;
  painSignal: string;
  nextAction: string;
  lastTouchedAt: string | null;
  trackingCode: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesCardVariant {
  id: string;
  repId: string;
  label: string;
  campaignMonth: string;
  campaignName: string;
  destination: "answered-city" | "trade-domain";
  primaryTradeDomain: string | null;
  frontHeadline: string;
  frontSubhead: string;
  backHeadline: string;
  backBullets: string[];
  offer: string;
  price: string;
  callout: string;
}

export interface SalesTrackingUrlInput {
  rep: SalesRep;
  cardVariant: SalesCardVariant;
  tradeDomain?: string | null;
  physicalCardId?: string | null;
  leadTrackingCode?: string | null;
}

export interface SalesTrackingUrlResult {
  url: string;
  campaign: string;
  contentId: string;
  source: string;
  medium: typeof FIELD_SALES_UTM_MEDIUM;
  term: string;
}

export interface SalesPipelineSummary {
  totalLeads: number;
  realLeads: number;
  archetypeLeads: number;
  activeLeads: number;
  weeklyTouchTarget: number;
  bookedDemos: number;
  trialStarts: number;
  paidCustomers: number;
  byStage: Record<SalesStage, number>;
  nextAction: string;
  evidence: string;
}

export const advancedSalesStages: SalesStage[] = ["visited", "card-left", "demo-booked", "trial-started", "activated", "paid"];

export const FIELD_SALES_UTM_MEDIUM = "field-sales";
export const FIELD_SALES_CAMPAIGN = "4h_2026-04_az_field_sales";
export const SALES_CARD_PRICE = "$39/mo";
export const SALES_CARD_TRIAL = "14-day free trial, no credit card required";

export const salesStages: { id: SalesStage; label: string; intent: string }[] = [
  { id: "prospect", label: "Prospect", intent: "Local owner looks like a fit, but no touch yet." },
  { id: "qualified", label: "Qualified", intent: "Trade, region, and missed-call pain are confirmed enough for a visit." },
  { id: "visited", label: "Visited", intent: "Rep had a real-world touchpoint or attempted a visit." },
  { id: "card-left", label: "Card left", intent: "Printed card was handed over or left with front desk/crew." },
  { id: "demo-booked", label: "Demo booked", intent: "Owner agreed to a call, walkthrough, or live demo." },
  { id: "trial-started", label: "Trial started", intent: "Owner started the 14-day trial." },
  { id: "activated", label: "Activated", intent: "Owner completed a meaningful product setup step." },
  { id: "paid", label: "Paid", intent: "Owner converted to the $39/mo plan." },
  { id: "lost", label: "Lost", intent: "Not a fit, no response, or explicit decline." },
];

export const salesReps: SalesRep[] = [
  {
    id: "rep-az-founding",
    name: "Arizona founding rep",
    region: "Phoenix metro",
    state: "AZ",
    code: "AZFOUNDING",
    role: "Human field sales pilot",
    weeklyTouchTarget: 35,
    focusTrades: ["pipe.city", "duct.city", "mow.city", "pest.city", "coat.city"],
    notes:
      "Friend-led Arizona pilot. Use local trust, quick demos, and rep-coded cards to find early tester signal before scaling paid spend.",
  },
];

export const salesCardVariants: SalesCardVariant[] = [
  {
    id: "az-founding-card-a",
    repId: "rep-az-founding",
    label: "AZ tester card A",
    campaignMonth: "2026-04",
    campaignName: "az field sales",
    destination: "answered-city",
    primaryTradeDomain: null,
    frontHeadline: "Never miss the call that becomes the next job.",
    frontSubhead: "Answered.City is an AI phone rep for busy trade owners.",
    backHeadline: "Built for Arizona owner-operators",
    backBullets: [
      "Scan the card and hear the AI answer.",
      "Try it on your trade's .city domain.",
      "Start the 14-day trial with no credit card.",
    ],
    offer: SALES_CARD_TRIAL,
    price: SALES_CARD_PRICE,
    callout: "Early tester route for plumbers, HVAC, lawn, pest, and painters.",
  },
];

export const salesLeads: SalesLead[] = [
  {
    id: "az-plumbing-owner-001",
    repId: "rep-az-founding",
    businessName: "Phoenix plumbing owner target",
    city: "Phoenix",
    state: "AZ",
    tradeDomain: "pipe.city",
    stage: "qualified",
    leadType: "archetype",
    ownerProfile: "2-8 truck plumbing shop with emergency and after-hours call leakage.",
    painSignal: "High-value calls hit while the owner or dispatcher is already on another job.",
    nextAction: "Visit during office hours, leave tester card, and invite a same-day demo call.",
    lastTouchedAt: null,
    trackingCode: "AZ-P-001",
    notes: "Internal archetype. Replace with a real owner row before marking contacted.",
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "az-hvac-owner-001",
    repId: "rep-az-founding",
    businessName: "Mesa HVAC owner target",
    city: "Mesa",
    state: "AZ",
    tradeDomain: "duct.city",
    stage: "qualified",
    leadType: "archetype",
    ownerProfile: "Seasonal HVAC operator with urgent no-cool demand and fast response pressure.",
    painSignal: "Peak-season callers keep shopping if nobody answers in the first minute.",
    nextAction: "Confirm owner name, then offer a live no-cool call simulation.",
    lastTouchedAt: null,
    trackingCode: "AZ-D-001",
    notes: "Internal archetype. Replace with a real owner row before marking contacted.",
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "az-lawn-owner-001",
    repId: "rep-az-founding",
    businessName: "Chandler lawn care owner target",
    city: "Chandler",
    state: "AZ",
    tradeDomain: "mow.city",
    stage: "prospect",
    leadType: "archetype",
    ownerProfile: "Owner-led crew that misses calls while crews are mowing or driving routes.",
    painSignal: "Estimate requests stack up during route hours, then go cold by evening.",
    nextAction: "Bring a card to the yard or trailer after the owner is confirmed.",
    lastTouchedAt: null,
    trackingCode: "AZ-M-001",
    notes: "Internal archetype. Replace with a real owner row before marking contacted.",
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "az-pest-owner-001",
    repId: "rep-az-founding",
    businessName: "Scottsdale pest control owner target",
    city: "Scottsdale",
    state: "AZ",
    tradeDomain: "pest.city",
    stage: "prospect",
    leadType: "archetype",
    ownerProfile: "Small pest operator with urgent homeowner calls and tight routing windows.",
    painSignal: "Anxious homeowners call multiple pest companies when they see activity.",
    nextAction: "Confirm owner name, qualify route density, then plan a first card drop.",
    lastTouchedAt: null,
    trackingCode: "AZ-PE-001",
    notes: "Internal archetype. Replace with a real owner row before marking contacted.",
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "az-paint-owner-001",
    repId: "rep-az-founding",
    businessName: "Tempe painting owner target",
    city: "Tempe",
    state: "AZ",
    tradeDomain: "coat.city",
    stage: "qualified",
    leadType: "archetype",
    ownerProfile: "Estimate-heavy painter that needs clean intake before the owner calls back.",
    painSignal: "Slow follow-up turns estimate requests into ghosted leads.",
    nextAction: "Ask for one test estimate call and track whether a demo gets booked.",
    lastTouchedAt: null,
    trackingCode: "AZ-C-001",
    notes: "Internal archetype. Replace with a real owner row before marking contacted.",
    createdAt: "2026-04-27T00:00:00.000Z",
    updatedAt: "2026-04-27T00:00:00.000Z",
  },
];

export const businessCardPrintSpec = {
  trimInches: { width: 3.5, height: 2 },
  bleedInches: { width: 3.75, height: 2.25 },
  safeInches: { width: 3.25, height: 1.75 },
  dpi: 300,
  pixelSize: { width: 1125, height: 675 },
  trimPixelSize: { width: 1050, height: 600 },
  safePixelSize: { width: 975, height: 525 },
  bleedPixelsPerSide: 38,
  safeMarginPixelsFromBleed: 75,
  recommendedFormats: ["PNG", "PDF"],
};

export function slugifySalesValue(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export function isAdvancedSalesStage(stage: SalesStage) {
  return advancedSalesStages.includes(stage);
}

export function canUseSalesStage(leadType: SalesLead["leadType"], stage: SalesStage) {
  return leadType === "real" || !isAdvancedSalesStage(stage);
}

export function canReclassifySalesLead(previousType: SalesLead["leadType"], nextType: SalesLead["leadType"]) {
  return previousType === nextType || previousType === "real";
}

export function normalizeSalesStage(value: unknown): SalesStage {
  return salesStages.some((stage) => stage.id === value) ? (value as SalesStage) : "prospect";
}

export function normalizeSalesLead(input: Partial<SalesLead> & Record<string, unknown>): SalesLead {
  const now = new Date().toISOString();
  const leadType = input.leadType === "real" || input.lead_type === "real" ? "real" : "archetype";
  const requestedStage = normalizeSalesStage(input.stage);
  const stage = canUseSalesStage(leadType, requestedStage) ? requestedStage : "qualified";
  const trackingSeed = String(input.trackingCode ?? input.tracking_code ?? input.id ?? crypto.randomUUID()).toUpperCase();

  return {
    id: String(input.id ?? crypto.randomUUID()),
    repId: String(input.repId ?? input.rep_id ?? salesReps[0]?.id ?? "rep-az-founding"),
    businessName: String(input.businessName ?? input.business_name ?? "Untitled sales lead"),
    city: String(input.city ?? "Phoenix"),
    state: String(input.state ?? "AZ").toUpperCase(),
    tradeDomain: normalizeTradeDomain(String(input.tradeDomain ?? input.trade_domain ?? "pipe.city")) ?? "pipe.city",
    stage,
    leadType,
    ownerProfile: String(input.ownerProfile ?? input.owner_profile ?? ""),
    painSignal: String(input.painSignal ?? input.pain_signal ?? ""),
    nextAction: String(input.nextAction ?? input.next_action ?? ""),
    lastTouchedAt: (input.lastTouchedAt ?? input.last_touched_at ?? null) as string | null,
    trackingCode: trackingSeed,
    notes: (input.notes ?? null) as string | null,
    createdAt: String(input.createdAt ?? input.created_at ?? now),
    updatedAt: String(input.updatedAt ?? input.updated_at ?? now),
  };
}

export function salesLeadToDb(lead: SalesLead) {
  return {
    id: lead.id,
    rep_id: lead.repId,
    business_name: lead.businessName,
    city: lead.city,
    state: lead.state,
    trade_domain: lead.tradeDomain,
    stage: lead.stage,
    lead_type: lead.leadType,
    owner_profile: lead.ownerProfile,
    pain_signal: lead.painSignal,
    next_action: lead.nextAction,
    last_touched_at: lead.lastTouchedAt,
    tracking_code: lead.trackingCode,
    notes: lead.notes,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

export function salesLeadToJson(lead: SalesLead) {
  return {
    id: lead.id,
    repId: lead.repId,
    businessName: lead.businessName,
    city: lead.city,
    state: lead.state,
    tradeDomain: lead.tradeDomain,
    stage: lead.stage,
    leadType: lead.leadType,
    ownerProfile: lead.ownerProfile,
    painSignal: lead.painSignal,
    nextAction: lead.nextAction,
    lastTouchedAt: lead.lastTouchedAt,
    trackingCode: lead.trackingCode,
    notes: lead.notes,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function normalizeTradeDomain(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  return cleaned.endsWith(".city") ? cleaned : `${slugifySalesValue(cleaned, "answered")}.city`;
}

export function buildSalesTrackingUrl({
  rep,
  cardVariant,
  tradeDomain,
  physicalCardId,
  leadTrackingCode,
}: SalesTrackingUrlInput): SalesTrackingUrlResult {
  const normalizedTrade = normalizeTradeDomain(tradeDomain ?? cardVariant.primaryTradeDomain);
  const destination =
    cardVariant.destination === "trade-domain" && normalizedTrade
      ? `https://${normalizedTrade}/`
      : "https://answered.city/";
  const url = new URL(destination);
  const campaign = `4h_${cardVariant.campaignMonth}_${slugifySalesValue(cardVariant.campaignName, "field-sales").replace(/-/g, "_")}`;
  const source = slugifySalesValue(rep.code, rep.id).replace(/-/g, "_");
  const uniqueCardId = slugifySalesValue(leadTrackingCode ?? physicalCardId ?? `${cardVariant.id}-master`, cardVariant.id);
  const contentId = `${slugifySalesValue(rep.code, "rep")}_${cardVariant.id}_${uniqueCardId}`;
  const term = `${slugifySalesValue(rep.region, "region").replace(/-/g, "_")}_trade_smb`;

  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", FIELD_SALES_UTM_MEDIUM);
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", contentId);
  url.searchParams.set("utm_term", term);
  url.searchParams.set("rep", rep.code);
  url.searchParams.set("rep_id", rep.id);
  url.searchParams.set("card", cardVariant.id);
  url.searchParams.set("card_id", uniqueCardId);
  url.searchParams.set("region", slugifySalesValue(rep.region, "region"));
  url.searchParams.set("offer", "14-day-free-trial-no-credit-card");
  if (normalizedTrade) url.searchParams.set("trade_domain", normalizedTrade);

  return {
    url: url.toString(),
    campaign,
    contentId,
    source,
    medium: FIELD_SALES_UTM_MEDIUM,
    term,
  };
}

export function getSalesRep(repId: string) {
  return salesReps.find((rep) => rep.id === repId) ?? null;
}

export function getSalesCardVariant(variantId: string) {
  return salesCardVariants.find((variant) => variant.id === variantId) ?? null;
}

export function getPrimarySalesCard() {
  return salesCardVariants[0];
}

export function validateSalesCardVariant(variant: SalesCardVariant) {
  const text = [
    variant.frontHeadline,
    variant.frontSubhead,
    variant.backHeadline,
    ...variant.backBullets,
    variant.offer,
    variant.price,
    variant.callout,
  ].join(" ");

  return {
    hasPrice: text.includes(SALES_CARD_PRICE),
    hasTrial: text.toLowerCase().includes("14-day free trial"),
    hasNoCreditCard: text.toLowerCase().includes("no credit card"),
    hasAnsweredCity: text.includes("Answered.City"),
  };
}

export function summarizeSalesPipeline(leads: SalesLead[] = salesLeads, reps: SalesRep[] = salesReps): SalesPipelineSummary {
  const byStage = Object.fromEntries(salesStages.map((stage) => [stage.id, 0])) as Record<SalesStage, number>;

  for (const lead of leads) {
    byStage[lead.stage] += 1;
  }

  const realLeads = leads.filter((lead) => lead.leadType === "real");
  const archetypeLeads = leads.filter((lead) => lead.leadType === "archetype").length;
  const activeLeads = realLeads.filter((lead) => lead.stage !== "lost" && lead.stage !== "paid").length;
  const weeklyTouchTarget = reps.reduce((sum, rep) => sum + rep.weeklyTouchTarget, 0);
  const bookedDemos = realLeads.filter((lead) => ["demo-booked", "trial-started", "activated", "paid"].includes(lead.stage)).length;
  const trialStarts = realLeads.filter((lead) => ["trial-started", "activated", "paid"].includes(lead.stage)).length;
  const paidCustomers = realLeads.filter((lead) => lead.stage === "paid").length;
  const nextBucket =
    salesStages.find((stage) => byStage[stage.id] > 0 && !["paid", "lost"].includes(stage.id)) ?? salesStages[0];

  return {
    totalLeads: leads.length,
    realLeads: realLeads.length,
    archetypeLeads,
    activeLeads,
    weeklyTouchTarget,
    bookedDemos,
    trialStarts,
    paidCustomers,
    byStage,
    nextAction:
      nextBucket.id === "prospect"
        ? "Qualify the next Arizona owner list, then hand cards only to trades with obvious missed-call pain."
        : `Work the ${nextBucket.label.toLowerCase()} bucket before adding more cold targets.`,
    evidence: `${realLeads.length} real AZ pilot leads, ${archetypeLeads} archetypes, ${reps.length} field rep, ${weeklyTouchTarget} planned weekly touches, no external outreach sent by 4H.`,
  };
}
