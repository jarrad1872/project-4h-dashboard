import {
  buildSalesTrackingUrl,
  getPrimarySalesCard,
  salesReps,
  type SalesCardVariant,
  type SalesLead,
  type SalesRep,
  type SalesStage,
} from "@/lib/sales-rep-pipeline";
import type { FieldSalesAttributionSummary } from "@/lib/field-sales-attribution";

export interface FieldSalesPriorityLead {
  id: string;
  businessName: string;
  cityState: string;
  tradeDomain: string;
  stage: SalesStage;
  leadType: SalesLead["leadType"];
  trackingCode: string;
  trackingUrl: string;
  contentId: string;
  recommendedMove: string;
  priorityReason: string;
}

export interface FieldSalesDailyPlan {
  label: string;
  focus: string;
  targetTouches: number;
}

export interface FieldSalesOperatingPacket {
  repName: string;
  weekLabel: string;
  plannedTouches: number;
  dailyTouchTarget: number;
  cardsToCarry: number;
  realLeadCount: number;
  archetypeCount: number;
  priorityLeads: FieldSalesPriorityLead[];
  dailyPlan: FieldSalesDailyPlan[];
  prepChecklist: string[];
  safetyBoundary: string;
  nextAction: string;
  evidence: string;
  copyText: string;
}

const STAGE_PRIORITY: Record<SalesStage, number> = {
  "demo-booked": 100,
  "trial-started": 95,
  activated: 90,
  "card-left": 80,
  visited: 70,
  qualified: 60,
  prospect: 40,
  paid: 10,
  lost: 0,
};

function weekLabel(now: Date) {
  return `Week of ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
}

function stageMove(lead: SalesLead, attribution: FieldSalesAttributionSummary) {
  if (lead.leadType === "archetype") {
    return "Research only: replace with a real owner/business row before any visit, card drop, demo, or customer claim.";
  }

  if (lead.stage === "prospect") return "Qualify owner fit and missed-call pain before making a first field touch.";
  if (lead.stage === "qualified") return "Plan a first visit, confirm the owner path, and leave a tracked card only after a real conversation or appropriate front-desk handoff.";
  if (lead.stage === "visited") return "Log the visit outcome, then decide whether a card-left or demo-booked update is earned.";
  if (lead.stage === "card-left") {
    return attribution.cardScans > 0
      ? "Watch for a matching scan/demo event and prepare a manual same-day demo follow-up."
      : "Confirm the QR scans correctly before adding more cards to the same motion.";
  }
  if (lead.stage === "demo-booked") return "Run the demo, capture the trade-specific objection, and record whether the 14-day trial starts.";
  if (lead.stage === "trial-started") return "Check activation quality before trying to convert the owner to the $39/mo plan.";
  if (lead.stage === "activated") return "Confirm whether activation produced enough value to ask for paid conversion.";
  if (lead.stage === "paid") return "Do not route for outreach; use as learning signal after the customer claim is verified.";
  return "Keep closed-lost context for learning, but do not route this row for active field work.";
}

function priorityReason(lead: SalesLead, attribution: FieldSalesAttributionSummary) {
  if (lead.leadType === "archetype") return "Archetype row: useful for route research, not contact activity.";
  if (["demo-booked", "trial-started", "activated"].includes(lead.stage)) return "Downstream intent exists; protect the conversion path.";
  if (lead.stage === "card-left" && attribution.cardScans === 0) return "Card was left, but no scan is logged yet.";
  if (lead.stage === "qualified") return "Qualified missed-call pain with no first field touch logged.";
  return "Active real lead still needs a clear next field step.";
}

function buildPriorityLeads(
  leads: SalesLead[],
  rep: SalesRep,
  cardVariant: SalesCardVariant,
  attribution: FieldSalesAttributionSummary,
) {
  return [...leads]
    .filter((lead) => lead.stage !== "paid" && lead.stage !== "lost")
    .sort((a, b) => {
      const realDelta = Number(b.leadType === "real") - Number(a.leadType === "real");
      if (realDelta !== 0) return realDelta;
      const stageDelta = STAGE_PRIORITY[b.stage] - STAGE_PRIORITY[a.stage];
      if (stageDelta !== 0) return stageDelta;
      return a.city.localeCompare(b.city) || a.businessName.localeCompare(b.businessName);
    })
    .slice(0, 6)
    .map((lead) => {
      const tracking = buildSalesTrackingUrl({
        rep,
        cardVariant: { ...cardVariant, destination: "trade-domain" },
        tradeDomain: lead.tradeDomain,
        leadTrackingCode: lead.trackingCode,
      });

      return {
        id: lead.id,
        businessName: lead.businessName,
        cityState: `${lead.city}, ${lead.state}`,
        tradeDomain: lead.tradeDomain,
        stage: lead.stage,
        leadType: lead.leadType,
        trackingCode: lead.trackingCode,
        trackingUrl: tracking.url,
        contentId: tracking.contentId,
        recommendedMove: stageMove(lead, attribution),
        priorityReason: priorityReason(lead, attribution),
      };
    });
}

function buildDailyPlan(dailyTouchTarget: number, attribution: FieldSalesAttributionSummary): FieldSalesDailyPlan[] {
  const measurementFocus =
    attribution.cardScans === 0
      ? "Verify one QR scan path before scaling card drops."
      : "Review scans, demo calls, and trial starts before adding new cold touches.";

  return [
    { label: "Mon", focus: "Qualify or refresh the highest-priority real rows.", targetTouches: dailyTouchTarget },
    { label: "Tue", focus: "Run clustered first visits and card-left handoffs.", targetTouches: dailyTouchTarget },
    { label: "Wed", focus: measurementFocus, targetTouches: dailyTouchTarget },
    { label: "Thu", focus: "Push demo-booked or trial-started rows toward the next logged milestone.", targetTouches: dailyTouchTarget },
    { label: "Fri", focus: "Clean the CRM, replace archetypes with real rows, and write the learning note.", targetTouches: dailyTouchTarget },
  ];
}

function buildCopyText(packet: Omit<FieldSalesOperatingPacket, "copyText">) {
  const leadLines = packet.priorityLeads.length
    ? packet.priorityLeads.map((lead, index) => `${index + 1}. ${lead.businessName} (${lead.cityState}, ${lead.tradeDomain}) - ${lead.recommendedMove}`).join("\n")
    : "No active rows. Add real owner leads before field activity.";

  return [
    `${packet.weekLabel} - ${packet.repName}`,
    `Target: ${packet.plannedTouches} touches (${packet.dailyTouchTarget}/day), carry ${packet.cardsToCarry} tracked cards.`,
    `Evidence: ${packet.evidence}`,
    "",
    "Priority rows:",
    leadLines,
    "",
    "Daily cadence:",
    ...packet.dailyPlan.map((day) => `${day.label}: ${day.targetTouches} touches - ${day.focus}`),
    "",
    "Boundary:",
    packet.safetyBoundary,
  ].join("\n");
}

export function buildFieldSalesOperatingPacket({
  leads,
  attribution,
  rep = salesReps[0],
  cardVariant = getPrimarySalesCard(),
  now = new Date(),
}: {
  leads: SalesLead[];
  attribution: FieldSalesAttributionSummary;
  rep?: SalesRep;
  cardVariant?: SalesCardVariant;
  now?: Date;
}): FieldSalesOperatingPacket {
  const activeLeads = leads.filter((lead) => lead.stage !== "paid" && lead.stage !== "lost");
  const realLeadCount = activeLeads.filter((lead) => lead.leadType === "real").length;
  const archetypeCount = activeLeads.filter((lead) => lead.leadType === "archetype").length;
  const plannedTouches = rep.weeklyTouchTarget;
  const dailyTouchTarget = Math.ceil(plannedTouches / 5);
  const cardsToCarry = Math.max(10, dailyTouchTarget * 2);
  const priorityLeads = buildPriorityLeads(activeLeads, rep, cardVariant, attribution);
  const dailyPlan = buildDailyPlan(dailyTouchTarget, attribution);
  const safetyBoundary =
    "Internal route planning only. Do not send outreach, order cards, create webhooks, upload ads, launch campaigns, move money, change billing, or treat archetypes as contacted businesses.";
  const nextAction =
    realLeadCount === 0
      ? "Create the first real Arizona owner row before counting any field touch."
      : priorityLeads[0]?.recommendedMove ?? "Review the active board and choose the next real row.";
  const evidence = `${realLeadCount} active real rows, ${archetypeCount} archetypes, ${attribution.cardScans} card scans, ${attribution.demoCalls} demo calls, ${attribution.trialStarts} trials, ${attribution.paidCustomers} paid customers.`;
  const withoutCopy = {
    repName: rep.name,
    weekLabel: weekLabel(now),
    plannedTouches,
    dailyTouchTarget,
    cardsToCarry,
    realLeadCount,
    archetypeCount,
    priorityLeads,
    dailyPlan,
    prepChecklist: [
      "Carry only the current rep-coded card variant.",
      "Check that the QR URL includes utm_medium=field-sales, rep, card, and card_id.",
      "Use fake/internal rows for practice; enter real businesses only when intentionally tracking a real owner.",
      "Review attribution before adding more card drops.",
    ],
    safetyBoundary,
    nextAction,
    evidence,
  };

  return {
    ...withoutCopy,
    copyText: buildCopyText(withoutCopy),
  };
}
