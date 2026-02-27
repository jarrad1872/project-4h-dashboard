export type Platform = "linkedin" | "youtube" | "facebook" | "instagram" | "meta" | "tracking" | "all";
export type AdStatus = "approved" | "pending" | "paused" | "rejected";
export type CampaignLifecycle = "pre-launch" | "live" | "paused" | "ended";
export type ChannelRunStatus = "ready" | "live" | "paused";

export interface StatusHistoryItem {
  status: AdStatus;
  at: string;
  note?: string;
}

export interface Ad {
  id: string;
  platform: Exclude<Platform, "meta" | "tracking" | "all">;
  campaignGroup: string;
  format: string;
  primaryText: string;
  headline: string;
  cta: string;
  landingPath: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  status: AdStatus;
  createdAt: string;
  statusHistory?: StatusHistoryItem[];
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

export interface LifecycleMessage {
  id: string;
  asset_id: string;
  channel: "email" | "sms";
  timing: "day0" | "day1" | "day3" | string;
  subject: string;
  message: string;
  goal: string;
  status: "active" | "paused" | string;
  updatedAt?: string;
}

export interface LaunchChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  platform: Platform;
  updatedAt?: string | null;
}

export interface BudgetChannel {
  allocated: number;
  spent: number;
}

export interface BudgetData {
  totalBudget: number;
  channels: {
    linkedin: BudgetChannel;
    youtube: BudgetChannel;
    facebook: BudgetChannel;
    instagram: BudgetChannel;
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

export interface ApprovalItem {
  id: string;
  type: "retargeting_ad" | "lp_block" | "lifecycle_message" | "asset";
  content: string;
  status: "pending" | "approved" | "revise" | "rejected";
  updatedAt?: string;
}
