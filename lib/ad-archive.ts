import type { Ad } from "./types";

export type AdArchiveBucket = "current" | "historical";

export interface AdArchiveState {
  bucket: AdArchiveBucket;
  label: string;
  reason: string;
  reasons: string[];
  guidance: string;
}

export interface AdArchiveHistoricalSignal {
  id: string;
  label: string;
  detector: string;
}

export interface AdArchiveDependency {
  id: string;
  surface: string;
  preserves: string;
  activeHome: string;
  externalActionAllowed: false;
}

const LEGACY_PLATFORM_PATHS = new Set(["/li", "/yt", "/fb", "/ig"]);

export const adArchiveHistoricalSignals: AdArchiveHistoricalSignal[] = [
  {
    id: "nb2-run",
    label: "NB2 historical creative/copy run",
    detector: "id, campaign group, campaign UTM, or related text contains NB2; IDs starting NB2- are archived.",
  },
  {
    id: "legacy-platform-path",
    label: "legacy saw.city platform landing path",
    detector: "landingPath is one of /li, /yt, /fb, or /ig.",
  },
  {
    id: "imported-upload-sheet",
    label: "imported upload-sheet record",
    detector: "status-history notes or ad text include imported from campaign-upload-sheet.",
  },
  {
    id: "generic-saw-city-copy",
    label: "generic Saw.City brand copy",
    detector: "primary text or headline mentions saw.city instead of a trade-specific .city domain.",
  },
];

export const adArchiveDependencies: AdArchiveDependency[] = [
  {
    id: "archive-classifier",
    surface: "getAdArchiveState()",
    preserves: "Current vs historical labels, archive reasons, and launch-candidate guidance for every ad row.",
    activeHome: "/ads archive plus Command audit map",
    externalActionAllowed: false,
  },
  {
    id: "ads-api-history",
    surface: "/api/ads history rows",
    preserves: "Historical ad rows for audit, approval history, and future rebuild reference without treating them as live candidates.",
    activeHome: "Approval, Launch, and archive review surfaces",
    externalActionAllowed: false,
  },
  {
    id: "archive-filters",
    surface: "current / historical / all filters",
    preserves: "Operator ability to separate rebuilt trade-domain candidates from old NB2/imported/generic Saw.City rows.",
    activeHome: "/ads direct-link archive",
    externalActionAllowed: false,
  },
  {
    id: "no-launch-boundary",
    surface: "Historical archive guidance",
    preserves: "The rule that archived ads cannot be uploaded, launched, or revived without a new launch bundle and Jarrad approval.",
    activeHome: "Launch governance and external-action stop screen",
    externalActionAllowed: false,
  },
];

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
    reasons.push(adArchiveHistoricalSignals[0].label);
  }

  if (LEGACY_PLATFORM_PATHS.has(ad.landingPath)) {
    reasons.push(adArchiveHistoricalSignals[1].label);
  }

  if (text.includes("imported from campaign-upload-sheet")) {
    reasons.push(adArchiveHistoricalSignals[2].label);
  }

  if (/\bsaw\.city\b/i.test(ad.primaryText) || /\bsaw\.city\b/i.test(ad.headline ?? "")) {
    reasons.push(adArchiveHistoricalSignals[3].label);
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

export function adArchiveAuditDependencySummary(ads: Ad[] = []) {
  const archiveSummary = summarizeAdArchive(ads);

  return {
    route: "/ads",
    totalRows: archiveSummary.total,
    currentRows: archiveSummary.current,
    historicalRows: archiveSummary.historical,
    signalCount: adArchiveHistoricalSignals.length,
    dependencyCount: adArchiveDependencies.length,
    externalActionsAllowed: adArchiveDependencies.some((dependency) => dependency.externalActionAllowed),
    replacement: "/launch",
    preservationRule:
      "Preserve archive classification, reason labels, filters, and read-only ad history before any /ads archive-only route treatment.",
  };
}
