/**
 * Per-trade context data for AI-generated ad copy.
 * Covers the 20 live trades (8 tier 1 + 12 tier 2).
 * Domains sourced from TRADE_MAP in lib/trade-utils.ts.
 */

export type CopyAngle = "pain" | "solution" | "proof" | "urgency";

export interface TradeCopyContext {
  trade: string;           // Human-readable trade name
  domain: string;          // From TRADE_MAP (e.g., "pipe.city")
  services: string[];      // 3 core services
  painPoints: string[];    // 3 trade-specific pain points
  tools: string[];         // 3 trade-specific tools/equipment
  persona: string;         // Target buyer persona
  seasonality: string;     // When demand peaks
}

export const TRADE_COPY_CONTEXT: Record<string, TradeCopyContext> = {
  // ── Tier 1 ──────────────────────────────────────────────────────────────────

  pipe: {
    trade: "Plumbing",
    domain: "pipe.city",
    services: ["Residential re-pipes", "Commercial rough-ins", "Water heater installs"],
    painPoints: [
      "Emergency calls at 2 AM with no dispatcher on duty",
      "Losing jobs because you can't answer the phone while your hands are in a trench",
      "Spending Sunday nights quoting instead of resting before Monday's 6 AM start",
    ],
    tools: ["Pipe fusion machine", "PEX crimping tool", "Inspection camera"],
    persona: "Licensed master plumber running a 3-8 truck operation, doing $800K-$2M/year, drowning in callbacks and dispatch chaos",
    seasonality: "Year-round with spikes in winter (burst pipes, water heater failures) and spring (remodel season)",
  },

  mow: {
    trade: "Lawn Care",
    domain: "mow.city",
    services: ["Weekly mowing routes", "Fertilization programs", "Spring/fall cleanups"],
    painPoints: [
      "Crews sitting idle because the route sheet is a mess and stops overlap",
      "Customers canceling because you missed their service window two weeks in a row",
      "Spending all winter chasing receivables instead of pre-selling spring contracts",
    ],
    tools: ["Commercial zero-turn mower", "Backpack blower", "String trimmer"],
    persona: "Lawn care operator with 2-5 crews, 80-200 weekly accounts, fighting tight margins and high crew turnover every season",
    seasonality: "March through November in most markets; spring signup surge is make-or-break",
  },

  coat: {
    trade: "Epoxy & Floor Coating",
    domain: "coat.city",
    services: ["Garage floor epoxy", "Commercial floor coatings", "Concrete polishing"],
    painPoints: [
      "Weather delays blowing your install schedule when humidity kills cure times",
      "Homeowners ghosting after the estimate because they found a cheaper DIY kit online",
      "One bad review about peeling floors tanking your lead flow for weeks",
    ],
    tools: ["Diamond floor grinder", "Squeegee applicator", "Moisture meter"],
    persona: "Floor coating contractor doing 5-15 installs/month, competing against big-box DIY kits and lowball competitors",
    seasonality: "Peak in spring and fall when garage temps are ideal for cure; summer heat and winter cold shrink the install window",
  },

  duct: {
    trade: "HVAC & Duct Cleaning",
    domain: "duct.city",
    services: ["Residential duct cleaning", "Dryer vent cleaning", "HVAC maintenance plans"],
    painPoints: [
      "Seasonal feast-or-famine — slammed in summer, dead in shoulder months",
      "Competing against $99 Groupon outfits that trash-talk real duct cleaning",
      "Techs upselling poorly and leaving money on the table at every service call",
    ],
    tools: ["Truck-mounted vacuum system", "HEPA air scrubber", "Rotary brush system"],
    persona: "HVAC/duct cleaning business owner with 2-6 techs, tired of racing to the bottom on price against coupon competitors",
    seasonality: "Summer AC season and fall furnace season are peak; indoor air quality concerns drive year-round demand",
  },

  pest: {
    trade: "Pest Control",
    domain: "pest.city",
    services: ["General pest treatment", "Termite inspection & treatment", "Wildlife exclusion"],
    painPoints: [
      "Callbacks eating your margins because the first treatment didn't hold",
      "Losing recurring customers to national chains undercutting on quarterly plans",
      "Techs driving 45 minutes between stops because your routing is a whiteboard",
    ],
    tools: ["Backpack sprayer", "Termite bait station system", "Inspection flashlight"],
    persona: "Independent pest control operator with 3-10 trucks, building a recurring revenue base but leaking customers to national brands",
    seasonality: "Spring and summer are peak (ants, mosquitoes, termite swarms); rodent calls spike in fall as temps drop",
  },

  electricians: {
    trade: "Electrical",
    domain: "electricians.city",
    services: ["Panel upgrades", "EV charger installs", "Commercial wiring"],
    painPoints: [
      "Turning down work because you can't find licensed journeymen to hire",
      "Spending hours on permit paperwork that doesn't generate a dime of revenue",
      "Emergency calls going to voicemail on weekends — straight to your competitor",
    ],
    tools: ["Wire fish tape", "Multimeter", "Conduit bender"],
    persona: "Licensed electrical contractor running 3-12 trucks, juggling residential service, new construction, and the EV charger boom",
    seasonality: "Year-round with surges in summer (AC load upgrades) and new-construction peaks in spring/fall",
  },

  roofrepair: {
    trade: "Roofing",
    domain: "roofrepair.city",
    services: ["Storm damage repair", "Full roof replacement", "Commercial roof maintenance"],
    painPoints: [
      "Storm chasers flooding your market and undercutting with shoddy work after every hail event",
      "Insurance supplement fights dragging out payment for 90+ days",
      "Burning cash on door-knocking crews that no-show half the time",
    ],
    tools: ["Roofing nailer", "Tear-off shovel", "Magnetic nail sweeper"],
    persona: "Roofing company owner doing $1M-$5M/year, balancing storm work with retail re-roofs and trying to build a year-round pipeline",
    seasonality: "Storm-driven spikes are unpredictable; spring and fall are steady retail seasons; winter is slow in northern markets",
  },

  disaster: {
    trade: "Disaster Restoration",
    domain: "disaster.city",
    services: ["Water damage mitigation", "Fire & smoke restoration", "Mold remediation"],
    painPoints: [
      "Insurance adjusters slow-playing your invoices while you carry $50K in drying equipment on site",
      "Missing the first-call from a property manager because your after-hours line goes to voicemail",
      "Crews sitting on standby burning payroll waiting for the next catastrophe",
    ],
    tools: ["Commercial dehumidifier", "Thermal imaging camera", "Air mover"],
    persona: "Restoration company owner running 24/7 emergency response with 5-20 techs, fighting for TPA program spots and insurance referrals",
    seasonality: "Storm and freeze events drive spikes; water damage claims are year-round; fire season varies by region",
  },

  // ── Tier 2 (first 12) ──────────────────────────────────────────────────────

  saw: {
    trade: "Concrete Cutting",
    domain: "saw.city",
    services: ["Wall sawing", "Core drilling", "Slab sawing"],
    painPoints: [
      "GCs calling at 5 PM needing a cut at 6 AM — and your phone is already off",
      "Diamond blade costs eating margins when crews burn blades on rebar they weren't told about",
      "Losing repeat GC accounts because your estimate turnaround is slower than the new guy's",
    ],
    tools: ["Diamond blade wall saw", "Core drill rig", "Hydraulic power pack"],
    persona: "Concrete cutting operator with 1-4 rigs, selling to general contractors and plumbing subs who need openings cut yesterday",
    seasonality: "Follows commercial construction — busiest spring through fall; winter slows in freeze-prone markets",
  },

  rinse: {
    trade: "Pressure Washing",
    domain: "rinse.city",
    services: ["House washing", "Concrete cleaning", "Commercial fleet washing"],
    painPoints: [
      "Underbidding jobs because you eyeball square footage instead of measuring",
      "Customers booking, then canceling same-day because it rained",
      "Spending more time driving between jobs than actually washing because your schedule is chaos",
    ],
    tools: ["Hot water pressure washer", "Surface cleaner", "Soft-wash pump system"],
    persona: "Pressure washing business owner with 1-3 rigs, building a route-based commercial book while still chasing residential one-offs",
    seasonality: "Spring is the biggest booking surge; commercial contracts run year-round; winter is dead in cold climates",
  },

  rooter: {
    trade: "Drain Cleaning",
    domain: "rooter.city",
    services: ["Drain snaking", "Hydro-jetting", "Sewer camera inspection"],
    painPoints: [
      "Emergency drain calls coming in at midnight with no tech on call",
      "Quoting a simple snake job and finding a collapsed line — now the customer thinks you're upselling",
      "Losing the big commercial maintenance contracts to national franchise rooter brands",
    ],
    tools: ["Motorized drain snake", "Hydro-jetter", "Sewer camera system"],
    persona: "Drain cleaning operator with 2-6 trucks, handling residential emergencies and trying to lock in commercial maintenance accounts",
    seasonality: "Year-round demand; rain season and holiday cooking spikes (Thanksgiving to New Year) drive emergency volume",
  },

  pave: {
    trade: "Asphalt Paving",
    domain: "pave.city",
    services: ["Parking lot paving", "Driveway resurfacing", "Crack sealing & sealcoat"],
    painPoints: [
      "Hot mix plants closing for the season before you finish your backlog",
      "Property managers slow-paying 90-day net terms while your material costs are due on delivery",
      "Losing bids because you can't get accurate measurements to the estimator fast enough",
    ],
    tools: ["Asphalt roller", "Plate compactor", "Crack fill pour pot"],
    persona: "Paving contractor doing $500K-$3M/year in commercial lot work and residential driveways, racing the weather window every season",
    seasonality: "Strictly seasonal — April through November in most markets; plant shutdowns end the season hard",
  },

  haul: {
    trade: "Hauling & Trucking",
    domain: "haul.city",
    services: ["Material delivery", "Equipment hauling", "Debris removal"],
    painPoints: [
      "Trucks running half-empty on return trips because you can't fill backhauls fast enough",
      "Fuel costs spiking with no way to pass the increase to locked-in contract rates",
      "Dispatching 6 trucks with a whiteboard and a cell phone — and losing loads",
    ],
    tools: ["Dump truck", "Wheel loader", "Flatbed trailer"],
    persona: "Hauling company owner with 4-15 trucks, running material for contractors and fighting thin margins on every load",
    seasonality: "Follows construction season — spring through fall is peak; winter work depends on snow removal pivots",
  },

  grade: {
    trade: "Earthwork & Grading",
    domain: "grade.city",
    services: ["Site grading", "Land clearing", "Erosion control"],
    painPoints: [
      "Rain delays pushing your schedule back and stacking jobs on top of each other",
      "Mobilizing heavy equipment to a site only to find the survey stakes are wrong",
      "GCs squeezing your bid on every phase because they think dirt work is commodity labor",
    ],
    tools: ["Motor grader", "Laser level", "Compact track loader"],
    persona: "Grading and earthwork contractor with 2-8 machines, doing site prep for builders and developers on tight timelines",
    seasonality: "Spring through fall when ground conditions allow; frozen ground shuts down winter work in northern markets",
  },

  lockout: {
    trade: "Locksmith",
    domain: "lockout.city",
    services: ["Emergency lockouts", "Lock rekeying", "Commercial access control"],
    painPoints: [
      "Scam locksmith ads outbidding you on Google and then bait-and-switching customers with $300 charges",
      "Driving 30 minutes to a lockout call only to have the customer say they got in already",
      "Inventory costs piling up with 200 lock SKUs sitting in the van that rarely move",
    ],
    tools: ["Key cutting machine", "Lock pick set", "Automotive lockout tool kit"],
    persona: "Independent locksmith running 1-4 vans, fighting fake-listing scammers on Google while building a commercial access control book",
    seasonality: "Year-round with spikes in summer (more people locked out) and holiday break (office rekeying, move-ins)",
  },

  plow: {
    trade: "Snow Plowing",
    domain: "plow.city",
    services: ["Commercial lot plowing", "Salting & de-icing", "Sidewalk clearing"],
    painPoints: [
      "Seasonal contracts locked in October but no snow until January — crews and equipment idle",
      "Insurance premiums doubling because slip-and-fall claims are out of control",
      "Scrambling at 3 AM to deploy 12 trucks with no dispatch system beyond group texts",
    ],
    tools: ["Truck-mounted plow blade", "Tailgate salt spreader", "Skid steer with snow pusher"],
    persona: "Snow removal operator with 5-20 trucks, managing commercial contracts and praying for enough events to hit breakeven",
    seasonality: "November through March; revenue is 100% weather-dependent — no snow means no income",
  },

  prune: {
    trade: "Tree Trimming",
    domain: "prune.city",
    services: ["Tree trimming & pruning", "Tree removal", "Stump grinding"],
    painPoints: [
      "One bad drop on a removal job and your insurance premium jumps $15K",
      "Storm damage calls flooding in all at once with no way to triage and schedule crews",
      "Customers balking at $2K removal quotes because they don't understand the liability and equipment cost",
    ],
    tools: ["Chainsaw", "Wood chipper", "Aerial lift bucket truck"],
    persona: "Arborist or tree service owner with 2-5 crews, balancing high-risk removal work with steady maintenance contracts",
    seasonality: "Year-round; storm cleanup is unpredictable; dormant-season pruning (winter) is ideal for many species",
  },

  chimney: {
    trade: "Chimney Sweep",
    domain: "chimney.city",
    services: ["Chimney sweeping", "Flue inspection & relining", "Chimney cap install"],
    painPoints: [
      "Entire revenue compressed into a 4-month fall window — rest of the year is crickets",
      "Customers don't think about their chimney until the first cold night, then everyone calls at once",
      "Upselling liner replacements is hard when the homeowner thinks a sweep is all they need",
    ],
    tools: ["Rotary chimney brush system", "Chimney inspection camera", "HEPA vacuum"],
    persona: "Chimney sweep business owner with 1-4 techs, trying to build year-round revenue beyond the fall rush",
    seasonality: "September through December is 70% of annual revenue; spring inspections are a growth opportunity",
  },

  detail: {
    trade: "Auto Detailing",
    domain: "detail.city",
    services: ["Full exterior detail", "Interior deep clean", "Ceramic coating"],
    painPoints: [
      "No-shows killing your schedule — customer books Monday, ghosts by Wednesday",
      "Racing to upsell ceramic coatings before the customer drives off with just a wash",
      "Mobile setup means weather cancellations wipe out a full day of revenue with zero notice",
    ],
    tools: ["Dual-action orbital polisher", "Steam cleaner", "Ceramic coating kit"],
    persona: "Mobile or shop-based detailer doing 15-40 vehicles/month, building recurring fleet accounts to escape the one-off grind",
    seasonality: "Spring and early summer are peak (pollen, road salt cleanup); winter slows mobile ops in cold climates",
  },

  brake: {
    trade: "Auto Repair & Brake",
    domain: "brake.city",
    services: ["Brake pad & rotor replacement", "Brake line repair", "General auto repair"],
    painPoints: [
      "Bays sitting empty mid-week because your appointment book has gaps you can't fill",
      "Parts markup getting squeezed by customers who price-check everything on RockAuto",
      "Techs leaving for dealership jobs because you can't match benefits on independent shop margins",
    ],
    tools: ["Hydraulic lift", "Brake lathe", "Torque wrench"],
    persona: "Independent auto repair shop owner with 3-8 bays, competing against dealer service departments and quick-lube chains for brake and maintenance work",
    seasonality: "Year-round with slight bumps before winter (brake checks) and spring (post-winter inspections)",
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
