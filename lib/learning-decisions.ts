import type { MarketingEventDimension } from "./types";
import type { LearningRankedItem } from "./weekly-learning-report";

export type LearningDecisionAction = "keep" | "kill" | "iterate";
export type LearningDecisionTargetType = "trade" | "creator" | "image" | "angle";

export interface LearningDecisionTarget {
  id: string;
  type: LearningDecisionTargetType;
  label: string;
  evidence: string;
}

export interface LearningDecisionEntry {
  id: string;
  weekStart: string;
  targetId: string;
  targetType: LearningDecisionTargetType;
  targetLabel: string;
  decision: LearningDecisionAction;
  previousDecision: LearningDecisionAction | null;
  note: string;
  decidedAt: string;
  reversedAt: string | null;
}

export type LearningDecisionCurrentState = Record<string, LearningDecisionEntry>;

const DIMENSION_TO_TARGET_TYPE: Record<MarketingEventDimension, LearningDecisionTargetType> = {
  trades: "trade",
  creators: "creator",
  creativeAssets: "image",
  angles: "angle",
};

export const LEARNING_DECISIONS_STORAGE_KEY = "4h.learningDecisions.v1";

export function decisionTargetFromRankedItem(
  dimension: MarketingEventDimension,
  item: LearningRankedItem,
): LearningDecisionTarget {
  const type = DIMENSION_TO_TARGET_TYPE[dimension];
  return {
    id: `${type}:${item.key}`,
    type,
    label: item.label,
    evidence: item.evidence,
  };
}

export function currentLearningDecisions(history: LearningDecisionEntry[]): LearningDecisionCurrentState {
  return history.reduce((current, entry) => {
    if (entry.reversedAt) return current;
    current[entry.targetId] = entry;
    return current;
  }, {} as LearningDecisionCurrentState);
}

export function addLearningDecision(
  history: LearningDecisionEntry[],
  weekStart: string,
  target: LearningDecisionTarget,
  decision: LearningDecisionAction,
  note: string,
  decidedAt: string,
): LearningDecisionEntry[] {
  const scopedHistory = history.filter((entry) => entry.weekStart === weekStart);
  const current = currentLearningDecisions(scopedHistory)[target.id] ?? null;
  const entry: LearningDecisionEntry = {
    id: `${weekStart}:${target.id}:${decidedAt}`,
    weekStart,
    targetId: target.id,
    targetType: target.type,
    targetLabel: target.label,
    decision,
    previousDecision: current?.decision ?? null,
    note: note.trim(),
    decidedAt,
    reversedAt: null,
  };

  return [...history, entry];
}

export function reverseLatestDecision(
  history: LearningDecisionEntry[],
  weekStart: string,
  targetId: string,
  reversedAt: string,
): LearningDecisionEntry[] {
  const index = history.findLastIndex((entry) => entry.weekStart === weekStart && entry.targetId === targetId && !entry.reversedAt);
  if (index < 0) return history;

  return history.map((entry, entryIndex) =>
    entryIndex === index ? { ...entry, reversedAt } : entry,
  );
}
