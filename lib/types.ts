export type AdStatus = "approved" | "pending" | "paused" | "rejected";
export type AdPlatform = "linkedin" | "youtube" | "facebook" | "instagram";
export type CampaignStatus = "pre-launch" | "live" | "paused" | "ended";
export type WorkflowStage = "concept" | "copy-ready" | "approved" | "creative-brief" | "uploaded" | "live";

export interface Ad {
  id: string;
  platform: AdPlatform;
  campaign_group: string;
  format: string;
  primary_text: string;
  headline: string | null;
  cta: string;
  landing_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  status: AdStatus;
  workflow_stage: WorkflowStage;
  created_at: string;
  updated_at: string;

  // Compatibility fields for existing UI/request payloads.
  campaignGroup: string;
  primaryText: string;
  landingPath: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  createdAt: string;
  updatedAt?: string;
  workflowStage: WorkflowStage;
  imageUrl?: string | null;
  image_url?: string | null;
  creative_variant?: number | null;  // 1 = hands-on zoom (c1/hero_a), 2 = company overview, 3 = on-site action wide
  creativeVariant?: number | null;
  statusHistory?: StatusHistoryItem[];
}

export interface AdTemplate {
  id: string;
  name: string;
  platform: AdPlatform;
  format: string | null;
  primary_text: string | null;
  headline: string | null;
  cta: string | null;
  landing_path: string | null;
  utm_campaign: string | null;
  created_at: string;

  // Compatibility fields for existing UI/request payloads.
  primaryText: string;
  landingPath: string;
  utmCampaign: string;
  createdAt: string;
}

export interface WeeklyMetric {
  id: string;
  week_start: string;
  platform: AdPlatform;
  spend: number;
  impressions: number;
  clicks: number;
  signups: number;
  activations: number;
  paid: number;
}

export interface LifecycleMessage {
  id: string;
  asset_id: string;
  channel: "email" | "sms";
  timing: string;
  subject: string | null;
  message: string;
  goal: string;
  status: "active" | "paused";
  updated_at: string;

  // Compatibility field for existing UI.
  updatedAt?: string;
}

export interface LaunchChecklistItem {
  id: string;
  label: string;
  platform: string;
  checked: boolean;
  updated_at: string | null;

  // Compatibility field for existing UI.
  updatedAt?: string | null;
}

export interface BudgetRow {
  platform: AdPlatform;
  allocated: number;
  spent: number;
  updated_at: string;
}

export interface CampaignConfig {
  id: number;
  status: CampaignStatus;
  start_date: string | null;
  linkedin_status: string;
  youtube_status: string;
  facebook_status: string;
  instagram_status: string;
  total_budget: number;
  updated_at: string;
}

export interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  content: string;
  platform: string | null;
  status: "pending" | "approved" | "rejected" | "revise";
  note: string | null;
  updated_at: string;

  // Compatibility field for existing UI.
  updatedAt?: string;
}

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: any;
  new_value: any;
  note: string | null;
  created_at: string;
}

// ─── Compatibility Types used by existing UI components ───────────────────────

export type Platform = AdPlatform | "meta" | "tracking" | "all";
export type CampaignLifecycle = CampaignStatus;
export type ChannelRunStatus = "ready" | "live" | "paused" | "ended";

export interface StatusHistoryItem {
  status: AdStatus;
  at: string;
  note?: string;
}

export interface ChannelMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  signups: number;
  activations: number;
  paid: number;
}

export interface MetricsWeek {
  weekStart: string;
  linkedin: ChannelMetrics;
  youtube: ChannelMetrics;
  facebook: ChannelMetrics;
  instagram: ChannelMetrics;
  updatedAt?: string;
}

export interface MetricsData {
  weeks: MetricsWeek[];
}

export interface BudgetData {
  totalBudget: number;
  channels: {
    linkedin: { allocated: number; spent: number };
    youtube: { allocated: number; spent: number };
    facebook: { allocated: number; spent: number };
    instagram: { allocated: number; spent: number };
  };
  updatedAt?: string;
}

export interface CampaignStatusData {
  status: CampaignLifecycle;
  startDate: string | null;
  linkedinStatus: ChannelRunStatus;
  youtubeStatus: ChannelRunStatus;
  facebookStatus: ChannelRunStatus;
  instagramStatus: ChannelRunStatus;
  updatedAt?: string;
}
