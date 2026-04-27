import { describe, expect, it } from "vitest";
import {
  adArchiveAuditDependencySummary,
  adArchiveDependencies,
  adArchiveHistoricalSignals,
  getAdArchiveState,
  summarizeAdArchive,
} from "../ad-archive";
import type { Ad } from "../types";

function ad(overrides: Partial<Ad> = {}): Ad {
  return {
    id: "pipe_linkedin_missed-call_001",
    platform: "linkedin",
    campaign_group: "gen_pipe_missed-call",
    campaignGroup: "gen_pipe_missed-call",
    format: "static1x1",
    primary_text: "Pipe.City answers plumbing calls. $39/mo. 14-day free trial, no credit card required.",
    primaryText: "Pipe.City answers plumbing calls. $39/mo. 14-day free trial, no credit card required.",
    headline: "Pipe.City answers plumbing calls",
    cta: "Start free trial",
    landing_path: "https://pipe.city/",
    landingPath: "https://pipe.city/",
    utm_source: "linkedin",
    utmSource: "linkedin",
    utm_medium: "paid-social",
    utmMedium: "paid-social",
    utm_campaign: "4h_2026-04_missed_call",
    utmCampaign: "4h_2026-04_missed_call",
    utm_content: "pipe_linkedin_missed-call_pipe-missed-call-multi-v1",
    utmContent: "pipe_linkedin_missed-call_pipe-missed-call-multi-v1",
    utm_term: "owners_1-10",
    utmTerm: "owners_1-10",
    status: "pending",
    workflow_stage: "copy-ready",
    workflowStage: "copy-ready",
    created_at: "2026-04-27T12:00:00Z",
    createdAt: "2026-04-27T12:00:00Z",
    updated_at: "2026-04-27T12:00:00Z",
    updatedAt: "2026-04-27T12:00:00Z",
    statusHistory: [],
    ...overrides,
  };
}

describe("getAdArchiveState", () => {
  it("keeps rebuilt trade-domain ads in the current bucket", () => {
    const state = getAdArchiveState(ad());

    expect(state.bucket).toBe("current");
    expect(state.label).toBe("Current candidate");
  });

  it("labels NB2 and legacy platform rows as historical archive", () => {
    const state = getAdArchiveState(ad({
      id: "NB2-D1-LI-PIPEAW",
      campaign_group: "nb2_d1_linkedin_pipe",
      campaignGroup: "nb2_d1_linkedin_pipe",
      utm_campaign: "nb2_2026-03_pipe_d1",
      utmCampaign: "nb2_2026-03_pipe_d1",
    }));

    expect(state.bucket).toBe("historical");
    expect(state.reasons).toContain("NB2 historical creative/copy run");
  });

  it("labels imported generic Saw.City platform-path ads as historical", () => {
    const state = getAdArchiveState(ad({
      id: "LI-R1",
      primary_text: "Saw.City helps small trade businesses capture missed calls.",
      primaryText: "Saw.City helps small trade businesses capture missed calls.",
      landing_path: "/li",
      landingPath: "/li",
      campaign_group: "4h_linkedin_problem",
      campaignGroup: "4h_linkedin_problem",
      created_at: "2026-02-20T09:00:00Z",
      createdAt: "2026-02-20T09:00:00Z",
      statusHistory: [
        {
          status: "approved",
          at: "2026-02-20T09:00:00Z",
          note: "Imported from CAMPAIGN-UPLOAD-SHEET-v2.csv",
        },
      ],
    }));

    expect(state.bucket).toBe("historical");
    expect(state.reasons).toEqual(expect.arrayContaining([
      "legacy saw.city platform landing path",
      "imported upload-sheet record",
      "generic Saw.City brand copy",
    ]));
  });

  it("does not archive current trade IDs by ID pattern alone", () => {
    const state = getAdArchiveState(ad({
      id: "LI-P1",
      campaign_group: "gen_pipe_missed-call",
      campaignGroup: "gen_pipe_missed-call",
      landing_path: "https://pipe.city/",
      landingPath: "https://pipe.city/",
    }));

    expect(state.bucket).toBe("current");
  });
});

describe("summarizeAdArchive", () => {
  it("counts current and historical rows without mutating ads", () => {
    const rows = [
      ad(),
      ad({ id: "LI-R1", landing_path: "/li", landingPath: "/li" }),
      ad({ id: "NB2-D1-FB-PIPEAW" }),
    ];

    expect(summarizeAdArchive(rows)).toEqual({
      total: 3,
      current: 1,
      historical: 2,
    });
  });
});

describe("adArchiveAuditDependencySummary", () => {
  it("preserves the historical signal and dependency map for route cleanup work", () => {
    const summary = adArchiveAuditDependencySummary([
      ad(),
      ad({ id: "LI-R1", landing_path: "/li", landingPath: "/li" }),
      ad({ id: "NB2-D1-FB-PIPEAW" }),
    ]);

    expect(adArchiveHistoricalSignals.map((signal) => signal.label)).toEqual([
      "NB2 historical creative/copy run",
      "legacy saw.city platform landing path",
      "imported upload-sheet record",
      "generic Saw.City brand copy",
    ]);
    expect(adArchiveDependencies.every((dependency) => dependency.externalActionAllowed === false)).toBe(true);
    expect(summary).toEqual({
      route: "/ads",
      totalRows: 3,
      currentRows: 1,
      historicalRows: 2,
      signalCount: 4,
      dependencyCount: 4,
      externalActionsAllowed: false,
      replacement: "/launch",
      preservationRule:
        "Preserve archive classification, reason labels, filters, and read-only ad history before any /ads archive-only route treatment.",
    });
  });
});
