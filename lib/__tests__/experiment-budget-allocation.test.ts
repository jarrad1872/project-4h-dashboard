import { describe, expect, it } from "vitest";
import { allocateExperimentBudgets, type ExperimentBudgetInput } from "../experiment-budget-allocation";
import type { BudgetData } from "../types";

const budget: BudgetData = {
  totalBudget: 20000,
  channels: {
    linkedin: { allocated: 500, spent: 200 },
    youtube: { allocated: 500, spent: 0 },
    facebook: { allocated: 250, spent: 50 },
    instagram: { allocated: 0, spent: 0 },
  },
};

const experiments: ExperimentBudgetInput[] = [
  {
    id: "pipe-li",
    label: "Pipe LinkedIn",
    tradeDomain: "pipe.city",
    angle: "missed-call",
    platform: "linkedin",
    requestedBudget: 250,
    priority: 2,
  },
  {
    id: "duct-li",
    label: "Duct LinkedIn",
    tradeDomain: "duct.city",
    angle: "demo-call",
    platform: "linkedin",
    requestedBudget: 200,
    priority: 1,
  },
  {
    id: "mow-ig",
    label: "Mow Instagram",
    tradeDomain: "mow.city",
    angle: "owner-agent",
    platform: "instagram",
    requestedBudget: 100,
    priority: 3,
  },
];

describe("allocateExperimentBudgets", () => {
  it("allocates by priority without exceeding remaining channel budget", () => {
    const plan = allocateExperimentBudgets(budget, experiments);

    expect(plan.allocations.map((allocation) => allocation.id)).toEqual(["duct-li", "pipe-li", "mow-ig"]);
    expect(plan.allocations[0].allocatedBudget).toBe(200);
    expect(plan.allocations[1].allocatedBudget).toBe(100);
    expect(plan.allocations[1].status).toBe("partial");
    expect(plan.byPlatform.linkedin.available).toBe(300);
    expect(plan.byPlatform.linkedin.allocated).toBe(300);
    expect(plan.byPlatform.linkedin.unassigned).toBe(0);
  });

  it("blocks experiments when a platform has no remaining planning budget", () => {
    const plan = allocateExperimentBudgets(budget, experiments);
    const instagram = plan.allocations.find((allocation) => allocation.id === "mow-ig");

    expect(instagram?.allocatedBudget).toBe(0);
    expect(instagram?.status).toBe("blocked");
    expect(instagram?.notes.join(" ")).toContain("no remaining planned budget");
  });

  it("treats non-positive requested budget as a blocked planning row", () => {
    const plan = allocateExperimentBudgets(budget, [
      {
        id: "zero",
        label: "Zero request",
        tradeDomain: "coat.city",
        angle: "roi-math",
        platform: "facebook",
        requestedBudget: -50,
        priority: 1,
      },
    ]);

    expect(plan.allocations[0].requestedBudget).toBe(0);
    expect(plan.allocations[0].status).toBe("blocked");
    expect(plan.totals.blocked).toBe(1);
  });

  it("does not mutate the source budget object", () => {
    const source = structuredClone(budget);
    allocateExperimentBudgets(source, experiments);

    expect(source).toEqual(budget);
  });

  it("returns explicit safety notes for planning-only use", () => {
    const plan = allocateExperimentBudgets(budget, experiments);

    expect(plan.safetyNotes.join(" ")).toContain("planning state only");
    expect(plan.safetyNotes.join(" ")).toContain("does not update billing");
  });
});
