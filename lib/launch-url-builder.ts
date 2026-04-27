import { productRouteInventory, type ProductRouteInventoryItem } from "./product-route-inventory";

export const LAUNCH_UTM_MEDIUM = "paid-social";

export const launchPlatforms = ["linkedin", "facebook", "instagram", "youtube"] as const;
export type LaunchPlatform = (typeof launchPlatforms)[number];

export const launchAngles = ["missed-call", "demo-call", "owner-agent", "roi-math"] as const;
export type LaunchAngle = (typeof launchAngles)[number];

export type LaunchDestination = "landing" | "signup";

export interface LaunchUrlInput {
  trade: string;
  platform: LaunchPlatform;
  angle: LaunchAngle | string;
  assetId?: string | null;
  creatorSlug?: string | null;
  creatorId?: string | null;
  campaignName?: string | null;
  campaignMonth?: string | null;
  utmTerm?: string | null;
  destination?: LaunchDestination;
}

export interface LaunchUrlResult {
  url: string;
  domain: string;
  route: ProductRouteInventoryItem;
  campaign: string;
  contentId: string;
  source: LaunchPlatform;
  medium: typeof LAUNCH_UTM_MEDIUM;
  tradeSlug: string;
  angleSlug: string;
  destination: LaunchDestination;
}

export function slugifyLaunchValue(value: string | null | undefined, fallback: string) {
  const slug = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function getCurrentCampaignMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function campaignPart(value: string | null | undefined, fallback: string) {
  return slugifyLaunchValue(value, fallback).replace(/-/g, "_");
}

export function findLaunchRoute(trade: string) {
  const needle = slugifyLaunchValue(trade.replace(/\.city$/i, ""), "");
  const domain = trade.trim().toLowerCase().replace(/^https?:\/\//, "").split(/[/?#]/)[0] ?? "";

  return productRouteInventory.find((route) => {
    const domainPrefix = route.domain.replace(".city", "");
    return (
      route.tradeSlug === trade ||
      route.tradeSlug === needle ||
      route.domain === trade ||
      route.domain === domain ||
      domainPrefix === needle
    );
  });
}

export function defaultLaunchAssetId(trade: string, angle: string) {
  const route = findLaunchRoute(trade);
  const tradeSlug = route
    ? slugifyLaunchValue(route.domain.replace(".city", ""), "trade")
    : slugifyLaunchValue(trade, "trade");
  const angleSlug = slugifyLaunchValue(angle, "angle");

  return `${tradeSlug}-${angleSlug}-multi-v1`;
}

export function buildLaunchUrl(input: LaunchUrlInput): LaunchUrlResult {
  const route = findLaunchRoute(input.trade);
  if (!route) throw new Error(`Unknown launch route: ${input.trade}`);

  const destination = input.destination ?? "landing";
  const baseUrl = destination === "signup"
    ? new URL(route.signupPath, route.canonicalUrl)
    : new URL(route.landingPath, route.canonicalUrl);
  const angleSlug = slugifyLaunchValue(input.angle, "angle");
  const tradeSlug = slugifyLaunchValue(route.domain.replace(".city", ""), route.tradeSlug);
  const assetSlug = slugifyLaunchValue(input.assetId, defaultLaunchAssetId(route.domain, angleSlug));
  const creatorSlug = slugifyLaunchValue(input.creatorSlug, "");
  const campaignMonth = input.campaignMonth ?? getCurrentCampaignMonth();
  if (!/^\d{4}-\d{2}$/.test(campaignMonth)) throw new Error("campaignMonth must use YYYY-MM");

  const campaign = `4h_${campaignMonth}_${campaignPart(input.campaignName, angleSlug)}`;
  const contentId = [
    tradeSlug,
    input.platform,
    angleSlug,
    assetSlug,
    creatorSlug,
  ].filter(Boolean).join("_");

  baseUrl.searchParams.set("utm_source", input.platform);
  baseUrl.searchParams.set("utm_medium", LAUNCH_UTM_MEDIUM);
  baseUrl.searchParams.set("utm_campaign", campaign);
  baseUrl.searchParams.set("utm_content", contentId);
  baseUrl.searchParams.set("utm_term", input.utmTerm ?? "owners_1-10");
  baseUrl.searchParams.set("trade", route.tradeSlug);
  baseUrl.searchParams.set("angle", angleSlug);
  baseUrl.searchParams.set("asset", assetSlug);

  if (creatorSlug) baseUrl.searchParams.set("creator", creatorSlug);
  if (input.creatorId) baseUrl.searchParams.set("creator_id", input.creatorId);

  return {
    url: baseUrl.toString(),
    domain: route.domain,
    route,
    campaign,
    contentId,
    source: input.platform,
    medium: LAUNCH_UTM_MEDIUM,
    tradeSlug,
    angleSlug,
    destination,
  };
}
