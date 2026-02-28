import { DataFiles, isoNow, readJsonFile, writeJsonFile } from "@/lib/file-db";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import type {
  ActivityLog,
  Ad,
  AdPlatform,
  ApprovalItem,
  BudgetData,
  BudgetRow,
  CampaignConfig,
  AdTemplate,
  CampaignStatusData,
  ChannelMetrics,
  LaunchChecklistItem,
  LifecycleMessage,
  MetricsData,
  MetricsWeek,
  WeeklyMetric,
} from "@/lib/types";

export function hasSupabase() {
  return isSupabaseConfigured;
}

export function readFallback<T>(fileName: string, fallback: T): T {
  try {
    return readJsonFile<T>(fileName);
  } catch {
    return fallback;
  }
}

export function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function logActivity(entry: {
  entity_type: string;
  entity_id: string;
  action: string;
  old_value?: unknown;
  new_value?: unknown;
  note?: string | null;
}) {
  const payload = {
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    action: entry.action,
    old_value: entry.old_value ?? null,
    new_value: entry.new_value ?? null,
    note: entry.note ?? null,
  };

  if (hasSupabase()) {
    await supabaseAdmin.from("activity_log").insert(payload);
    return;
  }

  const current = readFallback<ActivityLog[]>(DataFiles.activity, []);
  current.unshift({
    id: crypto.randomUUID(),
    ...payload,
    created_at: isoNow(),
  });
  writeJsonFile(DataFiles.activity, current.slice(0, 200));
}

function normalizeStatusHistory(input: any): { status: Ad["status"]; at: string; note?: string }[] {
  if (Array.isArray(input?.ad_status_history)) {
    return input.ad_status_history.map((row: any) => ({
      status: row.status,
      at: row.changed_at,
      ...(row.note ? { note: row.note } : {}),
    }));
  }

  if (Array.isArray(input?.statusHistory)) {
    return input.statusHistory.map((row: any) => ({
      status: row.status,
      at: row.at,
      ...(row.note ? { note: row.note } : {}),
    }));
  }

  return [];
}

export function statusToWorkflowStage(status: Ad["status"]): Ad["workflow_stage"] {
  if (status === "approved") return "approved";
  if (status === "paused") return "uploaded";
  if (status === "rejected") return "concept";
  return "copy-ready";
}

export function normalizeAd(input: any): Ad {
  const headline = (input.headline ?? null) as string | null;
  const createdAt = (input.created_at ?? input.createdAt ?? isoNow()) as string;
  const updatedAt = (input.updated_at ?? input.updatedAt ?? createdAt) as string;

  const campaignGroup = (input.campaign_group ?? input.campaignGroup ?? "") as string;
  const primaryText = (input.primary_text ?? input.primaryText ?? "") as string;
  const landingPath = (input.landing_path ?? input.landingPath ?? "") as string;
  const utmSource = (input.utm_source ?? input.utmSource ?? "") as string;
  const utmMedium = (input.utm_medium ?? input.utmMedium ?? "") as string;
  const utmCampaign = (input.utm_campaign ?? input.utmCampaign ?? "") as string;
  const utmContent = (input.utm_content ?? input.utmContent ?? "") as string;
  const utmTerm = (input.utm_term ?? input.utmTerm ?? "") as string;
  const workflowStage = (input.workflow_stage ?? input.workflowStage ?? statusToWorkflowStage(input.status)) as Ad["workflow_stage"];

  return {
    id: String(input.id),
    platform: input.platform as AdPlatform,
    campaign_group: campaignGroup,
    format: String(input.format ?? ""),
    primary_text: primaryText,
    headline,
    cta: String(input.cta ?? ""),
    landing_path: landingPath,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    utm_term: utmTerm,
    status: input.status,
    workflow_stage: workflowStage,
    created_at: createdAt,
    updated_at: updatedAt,

    campaignGroup,
    primaryText,
    landingPath,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    createdAt,
    updatedAt,
    workflowStage,
    imageUrl: (input.image_url ?? input.imageUrl ?? null) as string | null,
    image_url: (input.image_url ?? input.imageUrl ?? null) as string | null,
    statusHistory: normalizeStatusHistory(input),
  };
}

export function adToDb(ad: Partial<Ad>) {
  return {
    id: ad.id,
    platform: ad.platform,
    campaign_group: ad.campaign_group ?? ad.campaignGroup,
    format: ad.format,
    primary_text: ad.primary_text ?? ad.primaryText,
    headline: ad.headline,
    cta: ad.cta,
    landing_path: ad.landing_path ?? ad.landingPath,
    utm_source: ad.utm_source ?? ad.utmSource,
    utm_medium: ad.utm_medium ?? ad.utmMedium,
    utm_campaign: ad.utm_campaign ?? ad.utmCampaign,
    utm_content: ad.utm_content ?? ad.utmContent,
    utm_term: ad.utm_term ?? ad.utmTerm,
    status: ad.status,
    workflow_stage: ad.workflow_stage ?? ad.workflowStage,
    image_url: ad.image_url ?? ad.imageUrl ?? null,
    created_at: ad.created_at ?? ad.createdAt,
    updated_at: ad.updated_at ?? ad.updatedAt,
  };
}

export function adToLegacyJson(ad: Ad) {
  return {
    id: ad.id,
    platform: ad.platform,
    campaignGroup: ad.campaignGroup,
    format: ad.format,
    primaryText: ad.primaryText,
    headline: ad.headline ?? "",
    cta: ad.cta,
    landingPath: ad.landingPath,
    utmSource: ad.utmSource,
    utmMedium: ad.utmMedium,
    utmCampaign: ad.utmCampaign,
    utmContent: ad.utmContent,
    utmTerm: ad.utmTerm,
    status: ad.status,
    workflowStage: ad.workflowStage,
    createdAt: ad.createdAt,
    updatedAt: ad.updatedAt,
    statusHistory: ad.statusHistory ?? [],
  };
}

export function normalizeTemplate(input: any): AdTemplate {
  const primaryText = (input.primary_text ?? input.primaryText ?? "") as string;
  const landingPath = (input.landing_path ?? input.landingPath ?? "") as string;
  const utmCampaign = (input.utm_campaign ?? input.utmCampaign ?? "") as string;
  const createdAt = String(input.created_at ?? input.createdAt ?? isoNow());

  return {
    id: String(input.id),
    name: String(input.name ?? "Untitled template"),
    platform: input.platform,
    format: (input.format ?? null) as string | null,
    primary_text: primaryText || null,
    headline: (input.headline ?? null) as string | null,
    cta: (input.cta ?? null) as string | null,
    landing_path: landingPath || null,
    utm_campaign: utmCampaign || null,
    created_at: createdAt,

    primaryText,
    landingPath,
    utmCampaign,
    createdAt,
  };
}

function emptyChannel(): ChannelMetrics {
  return {
    spend: 0,
    impressions: 0,
    clicks: 0,
    signups: 0,
    activations: 0,
    paid: 0,
  };
}

export function metricsRowsToData(rows: WeeklyMetric[]): MetricsData {
  const byWeek = new Map<string, MetricsWeek>();

  for (const row of rows) {
    const weekStart = String(row.week_start);
    if (!byWeek.has(weekStart)) {
      byWeek.set(weekStart, {
        weekStart,
        linkedin: emptyChannel(),
        youtube: emptyChannel(),
        facebook: emptyChannel(),
        instagram: emptyChannel(),
      });
    }

    const week = byWeek.get(weekStart)!;
    week[row.platform] = {
      spend: asNumber(row.spend),
      impressions: asNumber(row.impressions),
      clicks: asNumber(row.clicks),
      signups: asNumber(row.signups),
      activations: asNumber(row.activations),
      paid: asNumber(row.paid),
    };
  }

  const weeks = [...byWeek.values()].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  return { weeks };
}

export function metricsWeekToRows(week: MetricsWeek) {
  return (["linkedin", "youtube", "facebook", "instagram"] as const).map((platform) => ({
    week_start: week.weekStart,
    platform,
    spend: asNumber(week[platform].spend),
    impressions: asNumber(week[platform].impressions),
    clicks: asNumber(week[platform].clicks),
    signups: asNumber(week[platform].signups),
    activations: asNumber(week[platform].activations),
    paid: asNumber(week[platform].paid),
  }));
}

export function budgetRowsToData(rows: BudgetRow[], config?: CampaignConfig | null): BudgetData {
  const channels: BudgetData["channels"] = {
    linkedin: { allocated: 0, spent: 0 },
    youtube: { allocated: 0, spent: 0 },
    facebook: { allocated: 0, spent: 0 },
    instagram: { allocated: 0, spent: 0 },
  };

  let updatedAt: string | undefined;

  for (const row of rows) {
    channels[row.platform] = {
      allocated: asNumber(row.allocated),
      spent: asNumber(row.spent),
    };
    updatedAt = row.updated_at;
  }

  const sumAllocated = Object.values(channels).reduce((sum, channel) => sum + channel.allocated, 0);

  return {
    totalBudget: config ? asNumber(config.total_budget) : sumAllocated,
    channels,
    updatedAt,
  };
}

export function campaignConfigToData(config: CampaignConfig): CampaignStatusData {
  return {
    status: config.status,
    startDate: config.start_date,
    linkedinStatus: config.linkedin_status as CampaignStatusData["linkedinStatus"],
    youtubeStatus: config.youtube_status as CampaignStatusData["youtubeStatus"],
    facebookStatus: config.facebook_status as CampaignStatusData["facebookStatus"],
    instagramStatus: config.instagram_status as CampaignStatusData["instagramStatus"],
    updatedAt: config.updated_at,
  };
}

export function normalizeLifecycleMessage(input: any): LifecycleMessage {
  return {
    id: String(input.id),
    asset_id: String(input.asset_id ?? input.id),
    channel: input.channel,
    timing: String(input.timing),
    subject: input.subject ?? null,
    message: String(input.message ?? ""),
    goal: String(input.goal ?? ""),
    status: input.status,
    updated_at: String(input.updated_at ?? input.updatedAt ?? isoNow()),
    updatedAt: String(input.updated_at ?? input.updatedAt ?? isoNow()),
  };
}

export function normalizeLaunchChecklistItem(input: any): LaunchChecklistItem {
  const updatedAt = (input.updated_at ?? input.updatedAt ?? null) as string | null;
  return {
    id: String(input.id),
    label: String(input.label ?? ""),
    platform: String(input.platform ?? ""),
    checked: Boolean(input.checked),
    updated_at: updatedAt,
    updatedAt,
  };
}

export function normalizeApprovalItem(input: any): ApprovalItem {
  const updatedAt = String(input.updated_at ?? input.updatedAt ?? isoNow());
  return {
    id: String(input.id),
    type: String(input.type ?? "item"),
    title: String(input.title ?? input.id ?? "Untitled"),
    content: String(input.content ?? ""),
    platform: (input.platform ?? null) as string | null,
    status: input.status,
    note: (input.note ?? null) as string | null,
    updated_at: updatedAt,
    updatedAt,
  };
}
