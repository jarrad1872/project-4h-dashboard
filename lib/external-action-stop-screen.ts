export type ExternalActionKind =
  | "launch_campaign"
  | "upload_ads"
  | "send_outreach"
  | "create_webhook"
  | "change_spend";

export interface ExternalActionStopItem {
  id: ExternalActionKind;
  label: string;
  shortLabel: string;
  route: string;
  risk: string;
  exactApprovalNeeded: string;
  blockedMechanism: string;
  nextInternalStep: string;
  performsExternalApiAction: false;
}

export const externalActionStops: ExternalActionStopItem[] = [
  {
    id: "launch_campaign",
    label: "Launch or edit a paid campaign",
    shortLabel: "Launch",
    route: "/launch",
    risk: "Could make ads visible, start delivery, or change campaign state in an ad account.",
    exactApprovalNeeded:
      "Jarrad must approve the exact trade, platform, campaign name, daily budget, launch date, landing URL, creative asset, copy, and UTM set.",
    blockedMechanism:
      "4H shows the launch bundle and readiness result only. It does not call LinkedIn, Meta, Google, YouTube, Instagram, or campaign-management APIs.",
    nextInternalStep: "Copy the bundle summary for human review, then wait for explicit launch approval outside automation.",
    performsExternalApiAction: false,
  },
  {
    id: "upload_ads",
    label: "Upload ads or platform sheets",
    shortLabel: "Upload",
    route: "/launch",
    risk: "Could create draft or live ads inside a third-party ad platform.",
    exactApprovalNeeded:
      "Jarrad must approve the destination ad account, platform, sheet file, trade set, creative IDs, copy IDs, budget fields, and upload timing.",
    blockedMechanism:
      "4H may prepare local review data, but this stop screen does not upload files or call ad-platform import APIs.",
    nextInternalStep: "Prepare a local/download-only sheet under a review-required queue item, then stop before platform upload.",
    performsExternalApiAction: false,
  },
  {
    id: "send_outreach",
    label: "Send creator outreach",
    shortLabel: "Send",
    route: "/influencer",
    risk: "Could contact a third party and represent Jarrad or Answered.City.",
    exactApprovalNeeded:
      "Jarrad must approve the exact creator, channel, message body, subject line, tracking URL, offer, and send time.",
    blockedMechanism:
      "4H can draft and review messages, but this stop screen does not send email, DMs, SMS, Telegram, or platform messages.",
    nextInternalStep: "Keep the message as a draft for Jarrad review; sending remains manual or separately approved.",
    performsExternalApiAction: false,
  },
  {
    id: "create_webhook",
    label: "Create external webhook or integration",
    shortLabel: "Webhook",
    route: "/launch",
    risk: "Could transmit future user, lead, campaign, or attribution data to a third-party endpoint.",
    exactApprovalNeeded:
      "Jarrad must approve the destination service, endpoint URL, payload fields, secret handling, retry behavior, and data retention assumptions.",
    blockedMechanism:
      "4H does not create external webhooks, background collectors, scheduled syncs, or third-party integrations from this screen.",
    nextInternalStep: "Document the integration plan and security details, then wait for explicit implementation approval.",
    performsExternalApiAction: false,
  },
  {
    id: "change_spend",
    label: "Move money or change billing/spend",
    shortLabel: "Spend",
    route: "/budget",
    risk: "Could affect billing, platform spend, account budgets, or payment obligations.",
    exactApprovalNeeded:
      "Jarrad must approve the exact platform, account, campaign, amount, date range, payment/billing impact, and rollback plan.",
    blockedMechanism:
      "4H budget tools are planning state only. This stop screen does not update billing, payment methods, ad-account budgets, or live spend.",
    nextInternalStep: "Use the budget planner as an internal estimate, then wait for manual billing or spend action approval.",
    performsExternalApiAction: false,
  },
];

export function getExternalActionStop(id: ExternalActionKind) {
  return externalActionStops.find((item) => item.id === id) ?? externalActionStops[0];
}

export function externalActionStopSummary(item: ExternalActionStopItem) {
  return [
    `Stopped action: ${item.label}`,
    `Risk: ${item.risk}`,
    `Approval needed: ${item.exactApprovalNeeded}`,
    `Blocked mechanism: ${item.blockedMechanism}`,
  ].join("\n");
}
