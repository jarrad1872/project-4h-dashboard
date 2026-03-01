import { TRADE_MAP } from "./trade-utils";

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

// Dynamically derive registry from the master TRADE_MAP
export const TRADE_DOMAIN_REGISTRY: TradeDomainEntry[] = Object.entries(TRADE_MAP).map(([slug, info]) => ({
  slug,
  trade: info.label.replace(".City", ""),
  appName: info.label,
  domain: info.domain,
  tier: info.tier as 1 | 2 | 3,
}));

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
    "--- PIXAR-INSPIRED ISOMETRIC 3D DESIGN SYSTEM ---",
    "Style: high-end isometric 3D render (Octane/Cycles style), Pixar-quality character design (but no people), bright vibrant colors against a dark backdrop.",
    `Subject: a premium tech ecosystem for ${normalizedTrade} operators.`,
    `Trade Focus: ${normalizedTrade}. App: ${input.appName} (${input.domain}).`,
    "Composition: isometric bird's-eye view. Floating clean 3D elements representing the trade (tools, equipment, icons).",
    "Color palette: deep navy background #0F172A, neon orange #F97316 highlights, emerald green #10B981 success accents.",
    "Central Object: a glowing, floating smartphone with a simplified, highly readable 3D UI.",
    "Smartphone UI elements (3D, embossed, glowing):",
    `- A giant green \"CHECKMARK\" or \"INCOMING CALL\" icon.`,
    `- The revenue figure \"${revenueByStyle[input.style]}\" in oversized white 3D font.`,
    `- The trade domain \"${input.domain}\" clearly visible on the screen.`,
    "Atmosphere: professional, magical, high-tech but grounded in trade work. Volumetric lighting, soft shadows, sharp focus.",
    STYLE_DESCRIPTIONS[input.style],
    formatSpec.composition,
    "Strictly avoid: people, faces, extra text, gibberish letters, messy logos, cluttered backgrounds.",
    "The image must feel like a high-budget 3D movie still or a premium Apple-style product launch visual.",
  ].join("\n");
}