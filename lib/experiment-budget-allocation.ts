import type { AdPlatform, BudgetData } from "./types";

export type ExperimentBudgetStatus = "allocated" | "partial" | "blocked";

export interface ExperimentBudgetInput {
  id: string;
  label: string;
  tradeDomain: string;
  angle: string;
  platform: AdPlatform;
  requestedBudget: number;
  priority: number;
}

export interface ExperimentBudgetAllocation extends ExperimentBudgetInput {
  allocatedBudget: number;
  channelRemainingBefore: number;
  channelRemainingAfter: number;
  status: ExperimentBudgetStatus;
  notes: string[];
}

export interface ExperimentBudgetPlan {
  allocations: ExperimentBudgetAllocation[];
  totals: {
    requested: number;
    allocated: number;
    blocked: number;
    partial: number;
  };
  byPlatform: Record<AdPlatform, {
    requested: number;
    allocated: number;
    available: number;
    unassigned: number;
  }>;
  safetyNotes: string[];
}

const platforms: AdPlatform[] = ["linkedin", "youtube", "facebook", "instagram"];

export const seedExperimentBudgets: ExperimentBudgetInput[] = [
  {
    id: "pipe-linkedin-missed-call-v1",
    label: "Plumber missed-call proof",
    tradeDomain: "pipe.city",
    angle: "missed-call",
    platform: "linkedin",
    requestedBudget: 300,
    priority: 1,
  },
  {
    id: "duct-youtube-demo-call-v1",
    label: "HVAC demo-call clip",
    tradeDomain: "duct.city",
    angle: "demo-call",
    platform: "youtube",
    requestedBudget: 300,
    priority: 2,
  },
  {
    id: "mow-instagram-owner-agent-v1",
    label: "Lawn owner-agent reel",
    tradeDomain: "mow.city",
    angle: "owner-agent",
    platform: "instagram",
    requestedBudget: 250,
    priority: 3,
  },
  {
    id: "pest-facebook-missed-call-v1",
    label: "Pest emergency lead test",
    tradeDomain: "pest.city",
    angle: "missed-call",
    platform: "facebook",
    requestedBudget: 250,
    priority: 4,
  },
  {
    id: "coat-facebook-roi-math-v1",
    label: "Painter estimate math",
    tradeDomain: "coat.city",
    angle: "roi-math",
    platform: "facebook",
    requestedBudget: 200,
    priority: 5,
  },
];

function availableByPlatform(budget: BudgetData): Record<AdPlatform, number> {
  return platforms.reduce((memo, platform) => {
    const row = budget.channels[platform];
    memo[platform] = Math.max(0, (row?.allocated ?? 0) - (row?.spent ?? 0));
    return memo;
  }, {} as Record<AdPlatform, number>);
}

function cleanRequestedBudget(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function allocateExperimentBudgets(
  budget: BudgetData,
  experiments: ExperimentBudgetInput[],
): ExperimentBudgetPlan {
  const remaining = availableByPlatform(budget);
  const ordered = [...experiments].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  const allocations = ordered.map((experiment) => {
    const requestedBudget = cleanRequestedBudget(experiment.requestedBudget);
    const channelRemainingBefore = remaining[experiment.platform] ?? 0;
    const allocatedBudget = Math.min(requestedBudget, channelRemainingBefore);
    remaining[experiment.platform] = channelRemainingBefore - allocatedBudget;
    const channelRemainingAfter = remaining[experiment.platform];

    const notes: string[] = [];
    let status: ExperimentBudgetStatus = "allocated";

    if (requestedBudget === 0) {
      status = "blocked";
      notes.push("Add a positive planning amount before this experiment can receive budget.");
    } else if (allocatedBudget === 0) {
      status = "blocked";
      notes.push(`${experiment.platform} has no remaining planned budget.`);
    } else if (allocatedBudget < requestedBudget) {
      status = "partial";
      notes.push(`Capped at remaining ${experiment.platform} budget.`);
    } else {
      notes.push("Fully covered by current channel budget.");
    }

    return {
      ...experiment,
      requestedBudget,
      allocatedBudget,
      channelRemainingBefore,
      channelRemainingAfter,
      status,
      notes,
    };
  });

  const totals = allocations.reduce(
    (memo, allocation) => {
      memo.requested += allocation.requestedBudget;
      memo.allocated += allocation.allocatedBudget;
      if (allocation.status === "blocked") memo.blocked += 1;
      if (allocation.status === "partial") memo.partial += 1;
      return memo;
    },
    { requested: 0, allocated: 0, blocked: 0, partial: 0 },
  );

  const byPlatform = platforms.reduce((memo, platform) => {
    const rows = allocations.filter((allocation) => allocation.platform === platform);
    const available = Math.max(0, (budget.channels[platform]?.allocated ?? 0) - (budget.channels[platform]?.spent ?? 0));
    const allocated = rows.reduce((sum, row) => sum + row.allocatedBudget, 0);
    memo[platform] = {
      requested: rows.reduce((sum, row) => sum + row.requestedBudget, 0),
      allocated,
      available,
      unassigned: Math.max(0, available - allocated),
    };
    return memo;
  }, {} as ExperimentBudgetPlan["byPlatform"]);

  return {
    allocations,
    totals,
    byPlatform,
    safetyNotes: [
      "Experiment allocation is planning state only.",
      "Changing these rows does not update billing, ad accounts, Supabase budget rows, or platform spend.",
      "External launch, upload, webhook, or spend still requires explicit Jarrad approval.",
    ],
  };
}
