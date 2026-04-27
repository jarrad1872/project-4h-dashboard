import type { CreativeAssetAngle, CreativeAssetPlatform } from "@/lib/types";

export const CHATGPT_IMAGE_MODEL = "chatgpt-image-latest";
export const OPENAI_API_IMAGE_MODEL = "gpt-image-1.5";
export const IMAGE_CREATIVE_PROVIDER = "chatgpt-pro";

export const IMAGE_CREATIVE_ANGLES = ["missed-call", "demo-call", "owner-agent", "roi-math"] as const satisfies readonly CreativeAssetAngle[];

export const IMAGE_CREATIVE_PLATFORMS = ["multi", "facebook", "instagram", "youtube", "linkedin"] as const satisfies readonly CreativeAssetPlatform[];

export const BEACHHEAD_IMAGE_TRADES = [
  {
    slug: "pipe",
    domain: "pipe.city",
    label: "Plumbing",
    ownerScene: "a plumbing owner in a service van between emergency calls",
    proofObject: "a phone screen showing an AI answered call and a booked job summary",
    fieldDetails: "wet floor, copper pipe, tool bag, invoice clipboard",
  },
  {
    slug: "duct",
    domain: "duct.city",
    label: "HVAC",
    ownerScene: "an HVAC owner beside an outdoor condenser during a busy service day",
    proofObject: "a phone screen showing an after-hours no-cool call handled by AI",
    fieldDetails: "gauges, refrigerant hoses, condenser fan, service ladder",
  },
  {
    slug: "mow",
    domain: "mow.city",
    label: "Lawn care",
    ownerScene: "a lawn care owner loading mowers while the crew is already moving",
    proofObject: "a phone screen showing a new mowing estimate captured by AI",
    fieldDetails: "zero-turn mower, grass clippings, route sheet, trailer ramp",
  },
  {
    slug: "pest",
    domain: "pest.city",
    label: "Pest control",
    ownerScene: "a pest control owner at a truck preparing for an urgent homeowner call",
    proofObject: "a phone screen showing pest issue details summarized by AI",
    fieldDetails: "sprayer, inspection light, sealed bait station, gloves",
  },
  {
    slug: "coat",
    domain: "coat.city",
    label: "Painting",
    ownerScene: "a painting owner on a job site while a new estimate call comes in",
    proofObject: "a phone screen showing a paint estimate request captured by AI",
    fieldDetails: "drop cloth, paint fan deck, ladder, masked trim",
  },
] as const;

export interface ImageCreativeBrief {
  id: string;
  trade_slug: string;
  trade_label: string;
  domain: string;
  angle: (typeof IMAGE_CREATIVE_ANGLES)[number];
  title: string;
  prompt: string;
  negative_prompt: string;
  dimensions: string;
  platform: CreativeAssetPlatform;
}

const ANGLE_STRATEGY: Record<(typeof IMAGE_CREATIVE_ANGLES)[number], string> = {
  "missed-call": "Show the cost of a missed call without using fear-mongering or fake dashboards.",
  "demo-call": "Make the viewer understand they can call the trade domain and hear the AI answer.",
  "owner-agent": "Show the owner using the AI employee as a practical field operator, not a chatbot.",
  "roi-math": "Make the money leak tangible with simple visual proof, not a spreadsheet-heavy ad.",
};

const PLATFORM_DIMENSIONS: Record<CreativeAssetPlatform, string> = {
  multi: "1024x1024",
  facebook: "1080x1080",
  instagram: "1080x1350",
  youtube: "1280x720",
  linkedin: "1200x628",
};

export function buildImageCreativePrompt(input: {
  trade_slug: string;
  angle: (typeof IMAGE_CREATIVE_ANGLES)[number];
  platform?: CreativeAssetPlatform;
}) {
  const trade = BEACHHEAD_IMAGE_TRADES.find((item) => item.slug === input.trade_slug);
  if (!trade) {
    throw new Error(`Unknown image creative trade: ${input.trade_slug}`);
  }

  const platform = input.platform ?? "multi";
  const dimensions = PLATFORM_DIMENSIONS[platform] ?? PLATFORM_DIMENSIONS.multi;

  return [
    `Create a realistic paid-social ad image for ${trade.domain} (${trade.label}).`,
    `Scene: ${trade.ownerScene}.`,
    `Visible proof: ${trade.proofObject}.`,
    `Trade details: ${trade.fieldDetails}.`,
    `Angle: ${ANGLE_STRATEGY[input.angle]}.`,
    `Composition: authentic job-site photo, clear owner/operator subject, readable phone proof, natural light, practical trade context.`,
    `Crop: ${dimensions} for ${platform}. Leave room for short overlay copy, but do not render fake UI text blocks or tiny unreadable text.`,
    `Offer context: $39/mo, 14-day free trial, no credit card required.`,
  ].join("\n");
}

export function getImageCreativeBrief(input: {
  trade_slug: string;
  angle: (typeof IMAGE_CREATIVE_ANGLES)[number];
  platform?: CreativeAssetPlatform;
}): ImageCreativeBrief {
  const trade = BEACHHEAD_IMAGE_TRADES.find((item) => item.slug === input.trade_slug);
  if (!trade) {
    throw new Error(`Unknown image creative trade: ${input.trade_slug}`);
  }

  const platform = input.platform ?? "multi";
  return {
    id: `${trade.slug}-${input.angle}-${platform}`,
    trade_slug: trade.slug,
    trade_label: trade.label,
    domain: trade.domain,
    angle: input.angle,
    title: `${trade.domain} ${input.angle} concept`,
    prompt: buildImageCreativePrompt({ trade_slug: trade.slug, angle: input.angle, platform }),
    negative_prompt: "No generic SaaS dashboards, stock-photo smiles, fake badges, brand confusion, distorted hands, unreadable tiny text, or Saw.City catch-all branding.",
    dimensions: PLATFORM_DIMENSIONS[platform] ?? PLATFORM_DIMENSIONS.multi,
    platform,
  };
}

export function listImageCreativeBriefs(filters: {
  trade_slug?: string | null;
  angle?: string | null;
  platform?: CreativeAssetPlatform | null;
} = {}) {
  const trades = filters.trade_slug
    ? BEACHHEAD_IMAGE_TRADES.filter((trade) => trade.slug === filters.trade_slug)
    : BEACHHEAD_IMAGE_TRADES;
  const angles = filters.angle && IMAGE_CREATIVE_ANGLES.includes(filters.angle as (typeof IMAGE_CREATIVE_ANGLES)[number])
    ? [filters.angle as (typeof IMAGE_CREATIVE_ANGLES)[number]]
    : IMAGE_CREATIVE_ANGLES;
  const platforms = filters.platform ? [filters.platform] : (["multi"] as const);

  return trades.flatMap((trade) =>
    angles.flatMap((angle) =>
      platforms.map((platform) => getImageCreativeBrief({ trade_slug: trade.slug, angle, platform })),
    ),
  );
}
