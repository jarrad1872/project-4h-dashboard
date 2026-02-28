export type CreativeFormat = "linkedin-single" | "meta-square" | "instagram-story" | "youtube-thumb";
export type CreativeStyle = "pain-point" | "feature-demo" | "social-proof" | "retargeting";

export interface TradeDomainEntry {
  slug: string;
  trade: string;
  appName: string;
  domain: string;
  tier: 1 | 2 | 3;
}

export interface FormatSpec {
  width: number;
  height: number;
  label: string;
  note: string;
  composition: string;
}

export const TRADE_DOMAIN_REGISTRY: TradeDomainEntry[] = [
  { slug: "concrete-cutting", trade: "Concrete Cutting", appName: "Saw.City", domain: "saw.city", tier: 1 },
  { slug: "pressure-washing", trade: "Pressure Washing", appName: "Rinse.City", domain: "rinse.city", tier: 1 },
  { slug: "lawn-care", trade: "Lawn Care", appName: "Mow.City", domain: "mow.city", tier: 1 },
  { slug: "drain-cleaning", trade: "Drain Cleaning", appName: "Rooter.City", domain: "rooter.city", tier: 1 },
  { slug: "locksmith", trade: "Locksmith", appName: "Lockout.City", domain: "lockout.city", tier: 2 },
  { slug: "pest-control", trade: "Pest Control", appName: "Pest.City", domain: "pest.city", tier: 2 },
  { slug: "hvac", trade: "HVAC", appName: "Duct.City", domain: "duct.city", tier: 2 },
  { slug: "auto-detailing", trade: "Auto Detailing", appName: "Detail.City", domain: "detail.city", tier: 2 },
  { slug: "snow-removal", trade: "Snow Removal", appName: "Plow.City", domain: "plow.city", tier: 3 },
  { slug: "tree-service", trade: "Tree Service", appName: "Prune.City", domain: "prune.city", tier: 3 },
  { slug: "chimney-sweep", trade: "Chimney Sweep", appName: "Chimney.City", domain: "chimney.city", tier: 3 },
  { slug: "hauling", trade: "Hauling", appName: "Haul.City", domain: "haul.city", tier: 3 },
  { slug: "grading", trade: "Grading", appName: "Grade.City", domain: "grade.city", tier: 3 },
  { slug: "painting", trade: "Painting", appName: "Coat.City", domain: "coat.city", tier: 3 },
  { slug: "auto-repair", trade: "Auto Repair", appName: "Brake.City", domain: "brake.city", tier: 3 },
  { slug: "mechanic", trade: "Mechanic", appName: "Wrench.City", domain: "wrench.city", tier: 3 },
  { slug: "floor-polishing", trade: "Floor Polishing", appName: "Polish.City", domain: "polish.city", tier: 3 },
  { slug: "paving", trade: "Paving", appName: "Pave.City", domain: "pave.city", tier: 3 },
  { slug: "demolition", trade: "Demolition", appName: "Wreck.City", domain: "wreck.city", tier: 3 },
  { slug: "plumbing", trade: "Plumbing", appName: "Pipe.City", domain: "pipe.city", tier: 3 },
];

export const FORMAT_SPECS: Record<CreativeFormat, FormatSpec> = {
  "linkedin-single": {
    width: 1200,
    height: 628,
    label: "LinkedIn Single",
    note: "Landscape for feed ads",
    composition: "Landscape composition. Phone mockup slightly right of center, headline cluster on left. Keep safe margins for LinkedIn crop.",
  },
  "meta-square": {
    width: 1080,
    height: 1080,
    label: "Meta Square",
    note: "Facebook/Instagram feed",
    composition: "Square composition. Centered phone mockup with balanced typography zones above and below.",
  },
  "instagram-story": {
    width: 1080,
    height: 1920,
    label: "Instagram Story",
    note: "Vertical Stories/Reels",
    composition: "Vertical composition. Keep key text in center-safe area. Phone should fill lower-middle third with bold top headline.",
  },
  "youtube-thumb": {
    width: 1280,
    height: 720,
    label: "YouTube Thumbnail",
    note: "16:9 thumbnail",
    composition: "Cinematic 16:9 composition with oversized contrast text and a strong focal phone object.",
  },
};

export const STYLE_DESCRIPTIONS: Record<CreativeStyle, string> = {
  "pain-point": "Pain-point angle: show chaos-to-clarity. Emphasize missed calls and lost jobs turning into organized booked revenue.",
  "feature-demo": "Feature-demo angle: clearly showcase the AI receptionist workflow and call handling automation in action.",
  "social-proof": "Social-proof angle: trust and adoption. Make the product feel proven, reliable, and widely used by operators.",
  retargeting: "Retargeting angle: assume audience already knows the product. Focus on confidence, speed to value, and easy activation.",
};

export function styleLabel(style: CreativeStyle) {
  return style
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTradeBySlug(slug: string) {
  return TRADE_DOMAIN_REGISTRY.find((entry) => entry.slug === slug);
}

interface PromptInput {
  trade: string;
  domain: string;
  appName: string;
  format: CreativeFormat;
  style: CreativeStyle;
  customPrompt?: string;
}

export function buildCreativePrompt(input: PromptInput) {
  if (input.customPrompt?.trim()) {
    return input.customPrompt.trim();
  }

  const formatSpec = FORMAT_SPECS[input.format];
  const cleanTrade = input.trade.replace(/-/g, " ").toLowerCase();
  const normalizedTrade = cleanTrade
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const revenueByStyle: Record<CreativeStyle, string> = {
    "pain-point": "$2,840",
    "feature-demo": "$5,460",
    "social-proof": "$7,120",
    retargeting: "$4,390",
  };

  return [
    `Create a premium paid-social ad creative for ${input.appName} (${input.domain}) for ${normalizedTrade} operators.`,
    `Output size: exactly ${formatSpec.width}x${formatSpec.height} pixels. Current date is 2026.`,
    "Style: photorealistic 3D smartphone mockup, professional studio lighting, crisp typography, modern SaaS aesthetic.",
    "Color palette: dark navy background #0F172A with orange accents #F97316, subtle depth shadows, high contrast readability.",
    "Brand text rules:",
    `- Top-left text: \"${input.appName}\" in bold sans-serif, non-italic, prominent and highly readable.`,
    `- Supporting headline: \"Your AI employee for ${cleanTrade}\".`,
    "- NO in-image CTA button text (do not include \"Try Free\", \"Get Started\", or any CTA button copy).",
    "Phone UI rules (minimal UI, only 3 large readable elements on screen):",
    "1) Green \"Call Answered\" notification",
    `2) One bold revenue figure: ${revenueByStyle[input.style]}`,
    `3) Domain name text: ${input.domain}`,
    `- Small social proof line: \"Trusted by 500+ ${cleanTrade} operators\".`,
    STYLE_DESCRIPTIONS[input.style],
    formatSpec.composition,
    "Avoid visual clutter, avoid tiny illegible text, avoid gibberish lettering, avoid extra logos, avoid people.",
    "Final result must look like a high-converting ad creative for LinkedIn/Meta quality standards.",
  ].join("\n");
}
