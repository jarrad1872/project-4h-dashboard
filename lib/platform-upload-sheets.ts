import type { LaunchBundle } from "./launch-bundles";
import type { LaunchPlatform } from "./launch-url-builder";

export type PlatformUploadSheetKind = LaunchPlatform | "meta";

export interface PlatformUploadSheet {
  kind: PlatformUploadSheetKind;
  label: string;
  filename: string;
  columns: string[];
  rows: Record<string, string>[];
  csv: string;
  safetyNote: string;
}

const REVIEW_ONLY_STATUS = "REVIEW_ONLY_DO_NOT_UPLOAD";
const REQUIRED_APPROVAL = "JARRAD_APPROVAL_REQUIRED_BEFORE_PLATFORM_UPLOAD";

const BASE_COLUMNS = [
  "review_status",
  "required_approval",
  "platform",
  "campaign",
  "ad_group",
  "ad_name",
  "trade_domain",
  "angle",
  "landing_url",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "headline",
  "primary_text",
  "cta",
  "creative_asset_id",
  "creative_status",
  "image_url",
  "budget_planning_only",
  "safety_note",
] as const;

const PLATFORM_LABELS: Record<PlatformUploadSheetKind, string> = {
  linkedin: "LinkedIn Campaign Manager",
  facebook: "Meta Facebook Ads",
  instagram: "Meta Instagram Ads",
  youtube: "YouTube / Google Ads",
  meta: "Meta combined upload review",
};

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function rowsToCsv(columns: readonly string[], rows: Record<string, string>[]) {
  const header = columns.map(csvCell).join(",");
  const body = rows.map((row) => columns.map((column) => csvCell(row[column] ?? "")).join(","));
  return [header, ...body].join("\n");
}

function urlParam(url: string, key: string) {
  try {
    return new URL(url).searchParams.get(key) ?? "";
  } catch {
    return "";
  }
}

function adGroupName(bundle: LaunchBundle, platform: LaunchPlatform) {
  return [bundle.tradeSlug, platform, bundle.angle, "owners_1-10"].join("_");
}

function adName(bundle: LaunchBundle, platform: LaunchPlatform) {
  return [bundle.tradeSlug, platform, bundle.angle, bundle.creative.assetId].join("_");
}

function buildRow(bundle: LaunchBundle, platform: LaunchPlatform): Record<string, string> {
  return {
    review_status: REVIEW_ONLY_STATUS,
    required_approval: REQUIRED_APPROVAL,
    platform,
    campaign: bundle.campaign,
    ad_group: adGroupName(bundle, platform),
    ad_name: adName(bundle, platform),
    trade_domain: bundle.tradeDomain,
    angle: bundle.angle,
    landing_url: bundle.url,
    utm_source: platform,
    utm_medium: urlParam(bundle.url, "utm_medium"),
    utm_campaign: urlParam(bundle.url, "utm_campaign"),
    utm_content: urlParam(bundle.url, "utm_content"),
    utm_term: urlParam(bundle.url, "utm_term"),
    headline: bundle.copy.headline,
    primary_text: bundle.copy.primaryText,
    cta: bundle.copy.cta,
    creative_asset_id: bundle.creative.assetId,
    creative_status: bundle.creative.status,
    image_url: bundle.creative.imageUrl ?? "",
    budget_planning_only: String(bundle.budget.suggestedTestBudget),
    safety_note: "Local planning export only. Do not upload, launch, send, create webhooks, spend, or change billing without explicit Jarrad approval.",
  };
}

function sheetFilename(bundle: LaunchBundle, kind: PlatformUploadSheetKind) {
  return `q17-${bundle.tradeSlug}-${kind}-${bundle.angle}-review-upload-sheet.csv`;
}

export function buildPlatformUploadSheet(bundle: LaunchBundle, kind: PlatformUploadSheetKind): PlatformUploadSheet {
  const rows = kind === "meta"
    ? [buildRow(bundle, "facebook"), buildRow(bundle, "instagram")]
    : [buildRow(bundle, kind)];

  const columns = [...BASE_COLUMNS];
  return {
    kind,
    label: PLATFORM_LABELS[kind],
    filename: sheetFilename(bundle, kind),
    columns,
    rows,
    csv: rowsToCsv(columns, rows),
    safetyNote: "Review/download sheet only; this function does not call ad-platform APIs or upload anything.",
  };
}

export function buildPlatformUploadSheets(bundle: LaunchBundle): PlatformUploadSheet[] {
  return [
    buildPlatformUploadSheet(bundle, bundle.platform),
    buildPlatformUploadSheet(bundle, "meta"),
    buildPlatformUploadSheet(bundle, "youtube"),
    buildPlatformUploadSheet(bundle, "linkedin"),
  ].filter((sheet, index, sheets) => sheets.findIndex((candidate) => candidate.kind === sheet.kind) === index);
}
