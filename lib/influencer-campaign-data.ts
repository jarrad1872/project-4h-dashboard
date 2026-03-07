export interface CreatorShortlistItem {
  rank: number;
  creator: string;
  trade: string;
  channel: string;
  channelUrl: string;
  estimatedContractorReach: string;
  conversionProbability: string;
  dealPage: string;
}

export interface DealMetric {
  label: string;
  value: string;
  note?: string;
}

export interface DealStructureItem {
  benefit: string;
  details: string;
}

export interface OutreachTemplateData {
  subject: string;
  bodyLines: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  href?: string;
}

export const campaignDealMetrics: DealMetric[] = [
  { label: "Product price", value: "$39/month" },
  { label: "Creator commission", value: "20% recurring (~$8/month)", note: "$39 × 20% = $7.80" },
  { label: "Max commission per referral", value: "$192", note: "24 months × ~$8/month" },
  { label: "Audience offer", value: "30-day free trial" },
];

export const creatorShortlist: CreatorShortlistItem[] = [
  {
    rank: 1,
    creator: "Mike Andes",
    trade: "Lawn Care",
    channel: "youtube.com/@MikeAndes",
    channelUrl: "https://www.youtube.com/@MikeAndes",
    estimatedContractorReach: "80K+ operators",
    conversionProbability: "Very High",
    dealPage: "mow.city/mikeandes",
  },
  {
    rank: 2,
    creator: "Brian's Lawn Maintenance",
    trade: "Lawn Care",
    channel: "youtube.com/@BriansLawnMaintenance",
    channelUrl: "https://www.youtube.com/@BriansLawnMaintenance",
    estimatedContractorReach: "150K+ operators",
    conversionProbability: "High",
    dealPage: "mow.city/brianslawn",
  },
  {
    rank: 3,
    creator: "AC Service Tech LLC",
    trade: "HVAC",
    channel: "youtube.com/@ACServiceTech",
    channelUrl: "https://www.youtube.com/@ACServiceTech",
    estimatedContractorReach: "90K+ techs/owners",
    conversionProbability: "Very High",
    dealPage: "duct.city/acservicetech",
  },
  {
    rank: 4,
    creator: "Blades of Grass Lawn Care",
    trade: "Lawn Care",
    channel: "youtube.com/channel/UCPIZI7...",
    channelUrl: "https://www.youtube.com/channel/UCPIZI7",
    estimatedContractorReach: "300K+ operators",
    conversionProbability: "Medium-High",
    dealPage: "mow.city/bladesofgrass",
  },
  {
    rank: 5,
    creator: "HVAC School (Bryan Orr)",
    trade: "HVAC",
    channel: "youtube.com/@HVACSchool",
    channelUrl: "https://www.youtube.com/@HVACSchool",
    estimatedContractorReach: "60K+ techs/owners",
    conversionProbability: "Very High",
    dealPage: "duct.city/hvacschool",
  },
  {
    rank: 6,
    creator: "Roofing Insights (Dmitry)",
    trade: "Roofing",
    channel: "youtube.com/@RoofingInsights3.0",
    channelUrl: "https://www.youtube.com/@RoofingInsights3.0",
    estimatedContractorReach: "60K+ contractors",
    conversionProbability: "High",
    dealPage: "roofrepair.city/roofinginsights",
  },
  {
    rank: 7,
    creator: "Electrician U (Dustin Stelzer)",
    trade: "Electrical",
    channel: "youtube.com/@ElectricianU",
    channelUrl: "https://www.youtube.com/@ElectricianU",
    estimatedContractorReach: "120K+ electricians",
    conversionProbability: "High",
    dealPage: "electricians.city/electricianu",
  },
  {
    rank: 8,
    creator: "Roger Wakefield",
    trade: "Plumbing",
    channel: "youtube.com/@rogerplumbing",
    channelUrl: "https://www.youtube.com/@rogerplumbing",
    estimatedContractorReach: "120K+ contractor-adjacent",
    conversionProbability: "Medium",
    dealPage: "pipe.city/rogerwakefield",
  },
  {
    rank: 9,
    creator: "King of Pressure Washing",
    trade: "Pressure Washing",
    channel: "youtube.com/@kingofpressurewash",
    channelUrl: "https://www.youtube.com/@kingofpressurewash",
    estimatedContractorReach: "35K+ operators",
    conversionProbability: "Very High",
    dealPage: "rinse.city/kingofpw",
  },
  {
    rank: 10,
    creator: "Painting Business Pro (Barstow)",
    trade: "Painting",
    channel: "youtube.com/@PaintingBusinessPro",
    channelUrl: "https://www.youtube.com/@PaintingBusinessPro",
    estimatedContractorReach: "36K operators",
    conversionProbability: "Very High",
    dealPage: "coat.city/paintingbizpro",
  },
];

export const dealStructure: DealStructureItem[] = [
  { benefit: "Recurring commission", details: "20% recurring per active referral (~$8/month at $39 plan price)." },
  { benefit: "Max per referral", details: "~$192 over 24 months (if subscriber remains active)." },
  { benefit: "No referral cap", details: "Unlimited referrals and recurring payouts while subscriptions stay active." },
  { benefit: "Unique code + UTM", details: "Creator-specific promo code and tracking link attached to each signup." },
  { benefit: "Co-branded landing page", details: "Trade domain page path reserved per creator (example: mow.city/brianslawn)." },
  { benefit: "Monthly payout", details: "Direct deposit or PayPal, net 30 with $50 minimum payout." },
];

export const outreachTemplate: OutreachTemplateData = {
  subject: "Quick question — want to make ~$8/month from every contractor you send our way",
  bodyLines: [
    "I've been watching your channel for a while. You're one of the few creators who talks about running the business, not just doing the work — that's exactly who we built Saw.City for.",
    "Saw.City LITE is an AI that answers your phone for you. $39/month. When a contractor misses a call because they're on a job, the AI picks up, qualifies the lead, takes the message, and books the callback.",
    "The creator deal: 20% recurring (~$8/month) for each referred contractor for up to 24 months (up to ~$192/referral), with a unique code and co-branded trade page.",
    "This is recurring affiliate revenue. If 50 contractors from your audience sign up, that's about $400/month recurring.",
    "Would you be open to trying Saw.City LITE for a month, on us, and seeing if it fits your audience?",
  ],
};

export const outreachChecklist: ChecklistItem[] = [
  { id: "videos", text: "Watch 2–3 recent videos from each creator before outreach." },
  { id: "competitors", text: "Check if they already promote ServiceTitan, Jobber, or direct competitors." },
  { id: "contact", text: "Use direct email from the YouTube About tab when available." },
  { id: "social", text: "Warm the outreach by engaging with recent social posts first." },
  { id: "specific-reference", text: "Reference a specific video so the pitch is clearly not generic." },
  { id: "trial-first", text: "Lead with the free trial offer before discussing longer-term commitments." },
  { id: "cobranded-page", text: "Lead with the co-branded page offer as the differentiator." },
];

export const campaignFlowLinks: ChecklistItem[] = [
  { id: "creatives", text: "Reuse approved campaign visuals and exportable assets.", href: "/creatives" },
  { id: "approval", text: "Queue influencer-facing copy or page edits for approval.", href: "/approval" },
  { id: "assets", text: "Validate trade asset readiness before creator launch.", href: "/assets" },
  { id: "workflow", text: "Track influencer campaign tasks through workflow stages.", href: "/workflow" },
];
