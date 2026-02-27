export const PLATFORM_LABELS = {
  linkedin: "LinkedIn",
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  meta: "Meta",
  tracking: "Tracking",
  all: "All",
} as const;

export const PLATFORM_COLORS = {
  linkedin: "#0077b5",
  youtube: "#ff0000",
  facebook: "#1877f2",
  instagram: "#e1306c",
  meta: "#8b5cf6",
  tracking: "#14b8a6",
  all: "#64748b",
} as const;

export const STATUS_COLORS: Record<string, string> = {
  approved: "#22c55e",
  pending: "#f59e0b",
  paused: "#6b7280",
  rejected: "#ef4444",
  ready: "#0ea5e9",
  live: "#22c55e",
  "pre-launch": "#f59e0b",
  ended: "#94a3b8",
};

export const CHANNELS = ["linkedin", "youtube", "facebook", "instagram"] as const;
