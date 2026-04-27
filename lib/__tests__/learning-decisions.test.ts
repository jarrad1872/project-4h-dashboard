import { describe, expect, it } from "vitest";
import {
  addLearningDecision,
  currentLearningDecisions,
  decisionTargetFromRankedItem,
  reverseLatestDecision,
  type LearningDecisionEntry,
} from "../learning-decisions";
import type { LearningRankedItem } from "../weekly-learning-report";

const rankedItem: LearningRankedItem = {
  key: "pipe",
  label: "pipe.city",
  rank: 1,
  score: 120,
  conversionRate: 0.1,
  signal: "winner",
  evidence: "1 paid conversion",
  total: 3,
  asset_view: 10,
  demo_call: 1,
  signup: 1,
  trial_started: 1,
  activated: 1,
  paid: 1,
  paidValueCents: 3900,
};

describe("learning decisions", () => {
  it("creates stable decision targets from ranked learning items", () => {
    const target = decisionTargetFromRankedItem("trades", rankedItem);

    expect(target).toEqual({
      id: "trade:pipe",
      type: "trade",
      label: "pipe.city",
      evidence: "1 paid conversion",
    });
  });

  it("adds timestamped decisions and records the previous state", () => {
    const target = decisionTargetFromRankedItem("trades", rankedItem);
    const first = addLearningDecision([], "2026-04-20", target, "keep", "Needs more volume", "2026-04-27T11:00:00.000Z");
    const second = addLearningDecision(first, "2026-04-20", target, "iterate", "Paid signal needs one more variant", "2026-04-27T12:00:00.000Z");
    const current = currentLearningDecisions(second);

    expect(second[0].note).toBe("Needs more volume");
    expect(second[0].weekStart).toBe("2026-04-20");
    expect(second[1].previousDecision).toBe("keep");
    expect(current["trade:pipe"].decision).toBe("iterate");
    expect(current["trade:pipe"].decidedAt).toBe("2026-04-27T12:00:00.000Z");
  });

  it("reverses the latest active decision while preserving history", () => {
    const target = decisionTargetFromRankedItem("trades", rankedItem);
    const history = addLearningDecision(
      addLearningDecision([], "2026-04-20", target, "keep", "", "2026-04-27T11:00:00.000Z"),
      "2026-04-20",
      target,
      "iterate",
      "",
      "2026-04-27T12:00:00.000Z",
    );

    const reversed = reverseLatestDecision(history, "2026-04-20", target.id, "2026-04-27T13:00:00.000Z");
    const current = currentLearningDecisions(reversed);

    expect(reversed).toHaveLength(2);
    expect(reversed[1].reversedAt).toBe("2026-04-27T13:00:00.000Z");
    expect(current["trade:pipe"].decision).toBe("keep");
  });

  it("leaves unrelated history unchanged when there is no active target decision", () => {
    const history: LearningDecisionEntry[] = [];

    expect(reverseLatestDecision(history, "2026-04-20", "trade:pipe", "2026-04-27T13:00:00.000Z")).toBe(history);
  });

  it("keeps current decisions scoped to the selected week", () => {
    const target = decisionTargetFromRankedItem("trades", rankedItem);
    const weekOne = addLearningDecision([], "2026-04-20", target, "keep", "", "2026-04-27T11:00:00.000Z");
    const weekTwo = addLearningDecision(weekOne, "2026-04-27", target, "kill", "", "2026-04-27T12:00:00.000Z");

    expect(currentLearningDecisions(weekTwo.filter((entry) => entry.weekStart === "2026-04-20"))["trade:pipe"].decision).toBe("keep");
    expect(currentLearningDecisions(weekTwo.filter((entry) => entry.weekStart === "2026-04-27"))["trade:pipe"].decision).toBe("kill");
  });
});
