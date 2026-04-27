import type { Ad } from "./types";

export type AdArchiveBucket = "current" | "historical";

export interface AdArchiveState {
  bucket: AdArchiveBucket;
  label: string;
  reason: string;
  reasons: string[];
  guidance: string;
}

const LEGACY_PLATFORM_PATHS = new Set(["/li", "/yt", "/fb", "/ig"]);

function normalizedText(ad: Ad) {
  return [
    ad.id,
    ad.campaignGroup,
    ad.utmCampaign,
    ad.utmContent,
    ad.landingPath,
    ad.headline ?? "",
    ad.primaryText,
    ad.generation_model ?? "",
    ...(ad.statusHistory ?? []).map((item) => item.note ?? ""),
  ].join(" ").toLowerCase();
}

export function getAdArchiveState(ad: Ad): AdArchiveState {
  const text = normalizedText(ad);
  const reasons: string[] = [];

  if (/(\b|_)nb2([-_]|$)/i.test(text) || ad.id.startsWith("NB2-")) {
    reasons.push("NB2 historical creative/copy run");
  }

  if (LEGACY_PLATFORM_PATHS.has(ad.landingPath)) {
    reasons.push("legacy saw.city platform landing path");
  }

  if (text.includes("imported from campaign-upload-sheet")) {
    reasons.push("imported upload-sheet record");
  }

  if (/\bsaw\.city\b/i.test(ad.primaryText) || /\bsaw\.city\b/i.test(ad.headline ?? "")) {
    reasons.push("generic Saw.City brand copy");
  }

  const historical = reasons.length > 0;

  if (!historical) {
    return {
      bucket: "current",
      label: "Current candidate",
      reason: "No historical archive signals detected",
      reasons: ["No historical archive signals detected"],
      guidance: "Can move into launch-bundle review only after creative, copy, URL, and Jarrad approvals are attached.",
    };
  }

  return {
    bucket: "historical",
    label: "Historical archive",
    reason: reasons[0],
    reasons,
    guidance: "Reference only. Do not treat as a current launch candidate without rebuilding the copy, asset, URL, and approvals.",
  };
}

export function summarizeAdArchive(ads: Ad[]) {
  const summary = {
    total: ads.length,
    current: 0,
    historical: 0,
  };

  for (const ad of ads) {
    const state = getAdArchiveState(ad);
    summary[state.bucket] += 1;
  }

  return summary;
}
