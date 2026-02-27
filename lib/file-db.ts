import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

export function readJsonFile<T>(fileName: string): T {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function writeJsonFile<T>(fileName: string, data: T): void {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export function isoNow() {
  return new Date().toISOString();
}

export const DataFiles = {
  ads: "ads.json",
  metrics: "metrics.json",
  lifecycle: "lifecycle.json",
  launchChecklist: "launch-checklist.json",
  budget: "budget.json",
  campaignStatus: "campaign-status.json",
  approvalQueue: "approval-queue.json",
} as const;
