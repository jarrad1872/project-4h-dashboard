/**
 * Per-trade context data for AI-generated ad copy.
 * Covers the 20 live trades (8 tier 1 + 12 tier 2).
 * Domains sourced from TRADE_MAP in lib/trade-utils.ts.
 *
 * Every field is designed to force Gemini to write about
 * THE PHONE RINGING — not generic business software.
 */

export type CopyAngle = "pain" | "solution" | "proof" | "urgency";

export interface TradeCopyContext {
  trade: string;            // Human-readable trade name
  domain: string;           // From TRADE_MAP (e.g., "pipe.city")
  callScenarios: string[];  // WHO calls and WHY — "homeowner wants exterior quote"
  missedCallCost: string;   // "$3K exterior job gone to the next painter"
  busyMoment: string;       // "up on a ladder cutting in trim"
}

export const TRADE_COPY_CONTEXT: Record<string, TradeCopyContext> = {
  // ── Tier 1 ──────────────────────────────────────────────────────────────────

  pipe: {
    trade: "Plumbing",
    domain: "pipe.city",
    callScenarios: [
      "homeowner with a burst pipe at 2 AM",
      "property manager needing a water heater quote",
      "GC requesting a rough-in bid for new construction",
    ],
    missedCallCost: "$2K water heater install gone to the next plumber",
    busyMoment: "under a house fixing a leak with both hands on a torch",
  },

  mow: {
    trade: "Lawn Care",
    domain: "mow.city",
    callScenarios: [
      "homeowner wanting a weekly mowing quote",
      "property manager needing spring cleanup for 12 units",
      "HOA looking for a new landscape maintenance contract",
    ],
    missedCallCost: "$5K annual mowing contract gone to the next crew",
    busyMoment: "on a zero-turn in the middle of a 2-acre lot",
  },

  coat: {
    trade: "Painting",
    domain: "coat.city",
    callScenarios: [
      "homeowner wanting an exterior paint quote",
      "realtor needing a quick interior repaint before listing",
      "commercial property manager requesting a bid on office suites",
    ],
    missedCallCost: "$3K exterior job gone to the next painter",
    busyMoment: "up on a ladder cutting in trim two stories up",
  },

  duct: {
    trade: "HVAC & Duct Cleaning",
    domain: "duct.city",
    callScenarios: [
      "homeowner whose AC died in July",
      "business owner needing duct cleaning for a health inspection",
      "property manager requesting HVAC maintenance bids for 20 units",
    ],
    missedCallCost: "$1,500 AC repair call gone to the next tech",
    busyMoment: "in an attic swapping out a blower motor in 130-degree heat",
  },

  pest: {
    trade: "Pest Control",
    domain: "pest.city",
    callScenarios: [
      "homeowner who just found termite damage",
      "restaurant manager needing emergency pest service before inspection",
      "property manager wanting quarterly pest contracts for 30 units",
    ],
    missedCallCost: "$800 termite treatment gone to the national chain",
    busyMoment: "crawling under a house doing a termite inspection",
  },

  electricians: {
    trade: "Electrical",
    domain: "electricians.city",
    callScenarios: [
      "homeowner needing an EV charger installed",
      "business owner with a panel that keeps tripping",
      "GC requesting a wiring bid for a new build",
    ],
    missedCallCost: "$2,500 panel upgrade gone to the next electrician",
    busyMoment: "pulling wire through a commercial ceiling on a tight deadline",
  },

  roofrepair: {
    trade: "Roofing",
    domain: "roofrepair.city",
    callScenarios: [
      "homeowner with a leak after last night's storm",
      "insurance adjuster scheduling a damage inspection",
      "property manager needing a full roof replacement bid",
    ],
    missedCallCost: "$8K roof replacement gone to the storm chaser who answered first",
    busyMoment: "three stories up tearing off shingles in the heat",
  },

  disaster: {
    trade: "Disaster Restoration",
    domain: "disaster.city",
    callScenarios: [
      "homeowner with 3 inches of water in their basement",
      "insurance agent needing immediate mitigation response",
      "property manager with fire damage in a tenant unit",
    ],
    missedCallCost: "$10K water mitigation job gone to whoever answered first",
    busyMoment: "running dehumidifiers on a flood job across town",
  },

  // ── Tier 2 ──────────────────────────────────────────────────────────────────

  saw: {
    trade: "Concrete Cutting",
    domain: "saw.city",
    callScenarios: [
      "GC needing a wall saw cut at 6 AM tomorrow",
      "plumbing sub requesting core drilling for a waste line",
      "demolition crew needing slab cuts before teardown",
    ],
    missedCallCost: "$1,200 core drilling job gone to the next cutter",
    busyMoment: "running a wall saw on a concrete pour with water everywhere",
  },

  rinse: {
    trade: "Pressure Washing",
    domain: "rinse.city",
    callScenarios: [
      "homeowner wanting their driveway and house washed",
      "restaurant owner needing grease removal from the parking lot",
      "property manager requesting fleet washing for 15 trucks",
    ],
    missedCallCost: "$500 house wash gone to the guy who picked up",
    busyMoment: "on a ladder soft-washing a two-story vinyl house",
  },

  rooter: {
    trade: "Drain Cleaning",
    domain: "rooter.city",
    callScenarios: [
      "homeowner with a backed-up sewer at midnight",
      "restaurant manager with a grease-clogged drain during dinner rush",
      "property manager needing camera inspection on a main line",
    ],
    missedCallCost: "$600 emergency drain call gone to the franchise",
    busyMoment: "running a snake through a main line in a crawlspace",
  },

  pave: {
    trade: "Asphalt Paving",
    domain: "pave.city",
    callScenarios: [
      "property manager wanting a parking lot resurfaced",
      "homeowner needing a driveway replaced",
      "GC requesting paving bids for a new commercial site",
    ],
    missedCallCost: "$15K parking lot job gone to the paver who answered",
    busyMoment: "rolling hot asphalt on a commercial lot before it cools",
  },

  haul: {
    trade: "Hauling & Trucking",
    domain: "haul.city",
    callScenarios: [
      "GC needing 20 yards of gravel delivered by morning",
      "contractor requesting equipment transport to a job site",
      "demolition crew needing debris hauled same-day",
    ],
    missedCallCost: "$800 material delivery gone to the next trucker",
    busyMoment: "behind the wheel making a delivery run across town",
  },

  grade: {
    trade: "Earthwork & Grading",
    domain: "grade.city",
    callScenarios: [
      "builder needing a lot graded before foundation pour",
      "developer requesting land clearing bids for 5 acres",
      "GC needing emergency erosion control after a rain event",
    ],
    missedCallCost: "$5K site grading job gone to the next operator",
    busyMoment: "in the cab of a motor grader cutting a pad to grade",
  },

  lockout: {
    trade: "Locksmith",
    domain: "lockout.city",
    callScenarios: [
      "driver locked out of their car at 11 PM",
      "business owner needing locks rekeyed after firing an employee",
      "property manager requesting access control for a new building",
    ],
    missedCallCost: "$150 lockout call gone to the scam listing",
    busyMoment: "picking a commercial lock across town on another call",
  },

  plow: {
    trade: "Snow Plowing",
    domain: "plow.city",
    callScenarios: [
      "property manager needing a lot plowed before 6 AM opening",
      "HOA wanting sidewalks cleared after overnight snowfall",
      "business owner requesting emergency salting for icy conditions",
    ],
    missedCallCost: "$1,500 seasonal plowing contract gone to the next plow",
    busyMoment: "plowing a commercial lot at 3 AM in a whiteout",
  },

  prune: {
    trade: "Tree Trimming",
    domain: "prune.city",
    callScenarios: [
      "homeowner with a tree on their roof after a storm",
      "city arborist needing hazard tree removal bids",
      "property manager requesting annual pruning for a subdivision",
    ],
    missedCallCost: "$2K tree removal gone to the crew that answered",
    busyMoment: "40 feet up in a bucket truck cutting a widow-maker",
  },

  chimney: {
    trade: "Chimney Sweep",
    domain: "chimney.city",
    callScenarios: [
      "homeowner wanting a sweep before winter",
      "realtor needing a chimney inspection for a home sale",
      "insurance adjuster requiring a flue assessment after a chimney fire",
    ],
    missedCallCost: "$400 sweep-and-inspect gone to the next sweep",
    busyMoment: "on a steep roof running a brush down a flue",
  },

  detail: {
    trade: "Auto Detailing",
    domain: "detail.city",
    callScenarios: [
      "car owner wanting a full detail before a road trip",
      "dealership needing 10 trade-ins prepped for the lot",
      "fleet manager requesting monthly detailing for company vehicles",
    ],
    missedCallCost: "$300 ceramic coating job gone to the detailer who picked up",
    busyMoment: "elbow-deep in a paint correction with a DA polisher",
  },

  brake: {
    trade: "Auto Repair & Brake",
    domain: "brake.city",
    callScenarios: [
      "driver hearing grinding brakes on their morning commute",
      "parent needing brake pads replaced before their kid drives to college",
      "fleet manager wanting brake inspections on 8 work vans",
    ],
    missedCallCost: "$600 brake job gone to the dealership down the road",
    busyMoment: "under a lift replacing rotors with a line of cars waiting",
  },
};

/**
 * Returns the copy context for a given trade slug, or undefined if not found.
 */
export function getTradeContext(slug: string): TradeCopyContext | undefined {
  return TRADE_COPY_CONTEXT[slug];
}

/**
 * Returns the slugs for all 20 live trades that have copy context.
 */
export function getLiveTradeSlugs(): string[] {
  return Object.keys(TRADE_COPY_CONTEXT);
}
