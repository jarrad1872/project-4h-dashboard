import { describe, expect, it } from "vitest";
import {
  settingsDependencyNotes,
  settingsDocUpdateLog,
  settingsSetupGuides,
  settingsSourceDocs,
  settingsSourceNoteSummary,
} from "../settings-source-notes";

describe("settings source notes", () => {
  it("preserves legacy setup guide notes outside the settings page", () => {
    expect(settingsSetupGuides.map((guide) => guide.platform)).toEqual(["LinkedIn", "Meta", "YouTube"]);
    expect(settingsSetupGuides.every((guide) => guide.activeHome === "/launch")).toBe(true);
  });

  it("preserves read-only sawcity-lite source doc paths", () => {
    expect(settingsSourceDocs).toHaveLength(4);
    expect(settingsSourceDocs.every((doc) => doc.sourceProject === "sawcity-lite")).toBe(true);
    expect(settingsSourceDocs.every((doc) => doc.access === "read-only reference")).toBe(true);
    expect(settingsSourceDocs.map((doc) => doc.id)).toEqual([
      "campaign-upload-sheet-v2",
      "lifecycle-messaging-v1",
      "approval-batch-002",
      "platform-launch-gate-v1",
    ]);
  });

  it("records settings dependencies without authorizing external action", () => {
    expect(settingsDependencyNotes.map((note) => note.surface)).toEqual([
      "/api/campaign-status",
      "Bob API key display",
      "Project 4H source doc links",
      "Settings doc update log",
    ]);
    expect(settingsDependencyNotes.every((note) => note.externalActionAllowed === false)).toBe(true);
  });

  it("summarizes source-note preservation for route retirement", () => {
    expect(settingsSourceNoteSummary()).toEqual({
      route: "/settings",
      replacement: "/approval",
      setupGuideCount: 3,
      sourceDocCount: 4,
      dependencyCount: 4,
      docLogCount: 2,
      preservationRule:
        "Preserve setup notes, read-only source doc paths, campaign-status context, and doc-update reminders before any /settings delete work.",
    });
    expect(settingsDocUpdateLog.map((item) => item.status)).toEqual(["applied", "pending"]);
  });
});
