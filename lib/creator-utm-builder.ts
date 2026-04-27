import type { Influencer } from "./types";

export const DEFAULT_CREATOR_CAMPAIGN = "4h_2026-04_creator_demo";
export const CREATOR_UTM_MEDIUM = "creator";

function slugify(value: string | null | undefined, fallback: string) {
  const slug = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function tradeDomain(trade: string | null | undefined) {
  const raw = (trade ?? "").trim().toLowerCase();
  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  const cleaned = withoutProtocol.split(/[/?#]/)[0] ?? "";
  if (!cleaned) return "pipe.city";
  if (/^[a-z0-9-]+\.city$/.test(cleaned)) return cleaned;
  return `${slugify(cleaned, "pipe")}.city`;
}

export function buildCreatorReferralCode(influencer: Pick<Influencer, "creator_name" | "trade" | "platform">) {
  const creatorSlug = slugify(influencer.creator_name, "creator");
  const tradeSlug = slugify(tradeDomain(influencer.trade).replace(".city", ""), "trade");
  const platformSlug = slugify(influencer.platform, "platform");
  return `${tradeSlug}-${creatorSlug}-${platformSlug}`.slice(0, 80);
}

export interface CreatorUtmUrlOptions {
  campaign?: string;
  contentId?: string;
}

export function buildCreatorUtmUrl(
  influencer: Pick<Influencer, "id" | "creator_name" | "trade" | "platform">,
  options: CreatorUtmUrlOptions = {},
) {
  const domain = tradeDomain(influencer.trade);
  const creatorSlug = slugify(influencer.creator_name, "creator");
  const platformSlug = slugify(influencer.platform, "platform");
  const tradeSlug = slugify(domain.replace(".city", ""), "trade");
  const campaign = options.campaign ?? DEFAULT_CREATOR_CAMPAIGN;
  const creatorIdSlug = slugify(influencer.id, "creator-id");
  const contentId = options.contentId ?? `creator_${tradeSlug}_${creatorSlug}_${platformSlug}_${creatorIdSlug}`;
  const referralCode = buildCreatorReferralCode(influencer);
  const url = new URL(`https://${domain}/`);

  url.searchParams.set("utm_source", platformSlug);
  url.searchParams.set("utm_medium", CREATOR_UTM_MEDIUM);
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", contentId);
  url.searchParams.set("utm_term", tradeSlug);
  url.searchParams.set("creator", creatorSlug);
  url.searchParams.set("creator_id", influencer.id);
  url.searchParams.set("trade", tradeSlug);
  url.searchParams.set("ref", referralCode);

  return {
    url: url.toString(),
    referralCode,
    campaign,
    contentId,
    creatorSlug,
    tradeSlug,
    platformSlug,
  };
}
