export const confirmedLaunchBeachheads = ["saw.city", "pipe.city", "mow.city", "rinse.city", "lockout.city"] as const;

export const launchOperatingDecisions = {
  confirmedAt: "2026-04-27",
  beachheadDomains: confirmedLaunchBeachheads,
  creatorOutreachDraftsMayProceedAfter4HApproval: true,
  creatorOutreachSendRequiresActionTimeApproval: true,
  adAccountsAndBilling: "manual-at-first",
  generatedImageApproval: "Jarrad sign-off required before generated image uploads become launchable assets.",
  externalActionApproval:
    "External sends, uploads, launches, webhooks, spend, and billing changes still require action-time approval for the exact action.",
} as const;

export function launchOperatingDecisionSummary() {
  return {
    beachheadCount: launchOperatingDecisions.beachheadDomains.length,
    beachheadDomains: [...launchOperatingDecisions.beachheadDomains],
    creatorOutreachDraftsMayProceedAfter4HApproval:
      launchOperatingDecisions.creatorOutreachDraftsMayProceedAfter4HApproval,
    creatorOutreachSendRequiresActionTimeApproval:
      launchOperatingDecisions.creatorOutreachSendRequiresActionTimeApproval,
    billingMode: launchOperatingDecisions.adAccountsAndBilling,
    imageApproval: launchOperatingDecisions.generatedImageApproval,
    externalActionApproval: launchOperatingDecisions.externalActionApproval,
  };
}
