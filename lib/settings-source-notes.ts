export interface SettingsSourceDoc {
  id: string;
  label: string;
  path: string;
  purpose: string;
  sourceProject: "sawcity-lite";
  access: "read-only reference";
}

export interface SettingsSetupGuide {
  id: string;
  platform: string;
  note: string;
  activeHome: string;
}

export interface SettingsDependencyNote {
  id: string;
  surface: string;
  preserves: string;
  activeHome: string;
  externalActionAllowed: false;
}

export interface SettingsDocUpdateLogItem {
  id: string;
  status: "applied" | "pending";
  target: string;
  note: string;
}

export const settingsSetupGuides: SettingsSetupGuide[] = [
  {
    id: "linkedin-insight-tag",
    platform: "LinkedIn",
    note: "LinkedIn Insight Tag: saw.city/li landing instrumentation checklist.",
    activeHome: "/launch",
  },
  {
    id: "meta-pixel-events",
    platform: "Meta",
    note: "Meta Pixel events: saw.city/fb and saw.city/ig launch package.",
    activeHome: "/launch",
  },
  {
    id: "youtube-google-tag",
    platform: "YouTube",
    note: "YouTube / Google Tag config: saw.city/yt campaign setup.",
    activeHome: "/launch",
  },
];

export const settingsSourceDocs: SettingsSourceDoc[] = [
  {
    id: "campaign-upload-sheet-v2",
    label: "Campaign upload sheet v2",
    path: "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/CAMPAIGN-UPLOAD-SHEET-v2.csv",
    purpose: "Historical upload-sheet shape for platform launch review.",
    sourceProject: "sawcity-lite",
    access: "read-only reference",
  },
  {
    id: "lifecycle-messaging-v1",
    label: "Lifecycle messaging v1",
    path: "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/LIFECYCLE-MESSAGING-v1.csv",
    purpose: "Original lifecycle messaging source for follow-up support work.",
    sourceProject: "sawcity-lite",
    access: "read-only reference",
  },
  {
    id: "approval-batch-002",
    label: "Approval batch 002 customer-facing copy",
    path: "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/APPROVAL-BATCH-002-CUSTOMER-FACING.md",
    purpose: "Historical customer-facing approval source for copy audits.",
    sourceProject: "sawcity-lite",
    access: "read-only reference",
  },
  {
    id: "platform-launch-gate-v1",
    label: "Platform launch gate v1",
    path: "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/PLATFORM-LAUNCH-GATE-v1.md",
    purpose: "Original launch-gate checklist source for approval/launch governance.",
    sourceProject: "sawcity-lite",
    access: "read-only reference",
  },
];

export const settingsDependencyNotes: SettingsDependencyNote[] = [
  {
    id: "campaign-status-control",
    surface: "/api/campaign-status",
    preserves: "Legacy status control for pre-launch, live, paused, and ended campaign states.",
    activeHome: "/launch",
    externalActionAllowed: false,
  },
  {
    id: "bob-api-key-placeholder",
    surface: "Bob API key display",
    preserves: "Legacy placeholder credential display only; real secrets belong in environment/config, not docs.",
    activeHome: "SOP-WORKFLOW.md",
    externalActionAllowed: false,
  },
  {
    id: "source-doc-links",
    surface: "Project 4H source doc links",
    preserves: "Read-only sawcity-lite source paths needed for audit context.",
    activeHome: "docs/route-disposition-plan.md",
    externalActionAllowed: false,
  },
  {
    id: "doc-update-log",
    surface: "Settings doc update log",
    preserves: "TRADE_MAP maintenance note plus pending AGENTS.md row-update reminder.",
    activeHome: "SOP-WORKFLOW.md",
    externalActionAllowed: false,
  },
];

export const settingsDocUpdateLog: SettingsDocUpdateLogItem[] = [
  {
    id: "sop-trade-map-rule",
    status: "applied",
    target: "SOP-WORKFLOW.md",
    note: "TRADE_MAP maintenance rule applied under the creative variants system. Baseline note referenced 65 prefixes at commit 820719f.",
  },
  {
    id: "agents-trade-utils-row-update",
    status: "pending",
    target: "AGENTS.md",
    note: "Record that TRADE_MAP must contain all active prefixes and that tradeFromAd checks utm_campaign plus campaign_group before silently falling back to saw.",
  },
];

export function settingsSourceNoteSummary() {
  return {
    route: "/settings",
    replacement: "/approval",
    setupGuideCount: settingsSetupGuides.length,
    sourceDocCount: settingsSourceDocs.length,
    dependencyCount: settingsDependencyNotes.length,
    docLogCount: settingsDocUpdateLog.length,
    preservationRule:
      "Preserve setup notes, read-only source doc paths, campaign-status context, and doc-update reminders before any /settings delete work.",
  };
}
