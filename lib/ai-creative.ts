import { TRADE_MAP } from "./trade-utils";

export type CreativeFormat = "linkedin-single" | "meta-square" | "instagram-story" | "youtube-thumb";
export type CreativeStyle = "pain-point" | "feature-demo" | "social-proof" | "retargeting";

export interface TradeDomainEntry {
  slug: string;
  trade: string;
  appName: string;
  domain: string;
  tier: 1 | 2 | 3;
}

export interface FormatSpec {
  width: number;
  height: number;
  label: string;
  note: string;
  composition: string;
}

// Dynamically derive registry from the master TRADE_MAP
export const TRADE_DOMAIN_REGISTRY: TradeDomainEntry[] = Object.entries(TRADE_MAP).map(([slug, info]) => ({
  slug,
  trade: info.label.replace(".City", ""),
  appName: info.label,
  domain: info.domain,
  tier: info.tier as 1 | 2 | 3,
}));

export const FORMAT_SPECS: Record<CreativeFormat, FormatSpec> = {
  "linkedin-single": {
    width: 1200,
    height: 628,
    label: "LinkedIn Single",
    note: "Landscape for feed ads",
    composition: "Landscape composition. Phone mockup slightly right of center, headline cluster on left. Keep safe margins for LinkedIn crop.",
  },
  "meta-square": {
    width: 1080,
    height: 1080,
    label: "Meta Square",
    note: "Facebook/Instagram feed",
    composition: "Square composition. Centered phone mockup with balanced typography zones above and below.",
  },
  "instagram-story": {
    width: 1080,
    height: 1920,
    label: "Instagram Story",
    note: "Vertical Stories/Reels",
    composition: "Vertical composition. Keep key text in center-safe area. Phone should fill lower-middle third with bold top headline.",
  },
  "youtube-thumb": {
    width: 1280,
    height: 720,
    label: "YouTube Thumbnail",
    note: "16:9 thumbnail",
    composition: "Cinematic 16:9 composition with oversized contrast text and a strong focal phone object.",
  },
};

export const STYLE_DESCRIPTIONS: Record<CreativeStyle, string> = {
  "pain-point": "Mood: tension before clarity. The scene is mid-work — something urgent is happening. Sparks fly, activity is intense. The operator is stretched thin. The orange light sources feel like pressure, not comfort.",
  "feature-demo": "Mood: precise and mechanical. Everything in the scene is in perfect order — tools laid out, equipment positioned just right. The scene communicates mastery and automation. Orange LEDs glow steadily, not frantically.",
  "social-proof": "Mood: proven and confident. Scene is organized, clean, at rest — work done well. Equipment is polished. The platform looks established. Orange accent lights glow warmly, suggesting trust and reliability.",
  retargeting: "Mood: activating. Scene is ready-to-launch — everything staged and waiting. The operator knows what comes next. Orange light has a readiness feel — warm, anticipatory.",
};

// Per-trade scene descriptions — used as the core subject in the isometric diorama
export const TRADE_SCENES: Record<string, string> = {
  saw:           "concrete cutting scene — diamond blade wall saw cutting through a concrete slab cross-section, water coolant spray, concrete dust particles catching the light, diamond blades in open case, core drill bits laid out",
  rinse:         "pressure washing scene — commercial pressure washer unit, high-pressure hose reel, surface cleaner attachment on platform, spray arc catching orange backlight, detergent canisters",
  mow:           "lawn care scene — commercial zero-turn mower, edger tool, blower, trimmer, fuel cans in organized layout, grass clippings catching light",
  rooter:        "drain cleaning scene — motorized drain snake machine, camera inspection reel, pipe sections in cross-section cutaway on platform edge, hydro-jetter unit, orange pressure gauge glowing",
  pipe:          "underground pipe work — trench cross-section cut into platform showing soil layers, pipe sections laid out, pipe fusion tool, excavator arm visible, orange welding glow from pipe joint",
  pave:          "asphalt paving scene — small roller compactor, hand rake tools, hot asphalt material pile with infrared glow, traffic cones, crack filler equipment",
  haul:          "hauling scene — dump truck mid-tip position, material pile beneath, wheel loader in background, orange cab warning lights glowing, tire tracks in platform",
  lockout:       "locksmith scene — door cross-section cutaway showing lock cylinder, exploded lock mechanism view, pick set and key tools laid flat, key cutting machine, orange LED on keypad",
  pest:          "pest control scene — technician chemical spray tank, hose reel, house cross-section showing treatment zones with orange glow, spray particles, bait stations",
  chimney:       "chimney sweep scene — brick chimney cross-section, rotary brush system, inspection camera reel, soot particles catching orange fireplace glow from below",
  duct:          "HVAC duct scene — sheet metal duct sections, flex duct coil, register/diffuser boxes arranged flat, crimper and cutter tools, orange system indicator light glowing",
  detail:        "auto detailing scene — low-profile car in isometric view, orbital polisher with orange pad glow, detailing bucket, microfiber cloths in folded stack, clay bar kit",
  plow:          "snow plow scene — truck with front-mounted plow blade, salt spreader in bed, orange road hazard lights glowing, snow accumulation on platform surface, ice melt bags",
  grade:         "grading scene — small motor grader with blade down, cut/fill cross-section at platform edge showing soil layers, grade stakes, laser level beam in orange",
  coat:          "floor coating scene — squeegee applicator, roller frame, open epoxy coating cans, wet floor showing orange glow reflection, masking tape edge detail",
  brake:         "brake repair scene — car on isometric lift, brake rotor and caliper exploded view on platform, socket set laid out on shop rag, orange work light overhead glow",
  wrench:        "auto repair scene — car on isometric lift at full extension, socket set and torque wrench on shop rag, oil drain pan, orange work light glow from above",
  polish:        "floor polishing scene — floor buffer machine, cleaning solution bottles, mop and bucket in catalog layout, polished floor with orange glow reflection, buffing pads in stack",
  wreck:         "demolition scene — mini excavator at work, organized rubble pile, dust particles catching orange cab lamp light, jackhammer and demo tools on platform",
  prune:         "tree trimming scene — aerial lift bucket near isometric tree, chainsaw, wood chipper in foreground, cut branches, orange hazard lights on lift",
  drywall:       "drywall installation scene — drywall panels, stilts, mud tray and tools, screw gun, joint tape rolls, orange work light from above",
  excavation:    "excavation scene — mini excavator, trench cross-section showing soil layers, shoring panels, utility lines exposed, orange excavator cab lights",
  housecleaning: "house cleaning scene — vacuum, mop and bucket, caddy with cleaning supplies, microfiber stack, orange indicator light on equipment",
  insulation:    "insulation scene — blower machine with hose, batt insulation rolls stacked, wall cross-section cutaway, protective gear, orange warning light on blower",
  metalworks:    "metal fabrication scene — welding table with metal workpiece, MIG welder, angle grinder with orange sparks, clamps and tools laid out, weld sparks arcing",
  plank:         "flooring scene — plank flooring being installed, floor nailer, pull bar, rubber mallet, stacked planks, orange laser level line on floor",
  refrigeration: "refrigeration repair scene — commercial refrigeration unit open, refrigerant manifold gauge set, copper tubing, recovery cylinder, orange compressor glow",
  remodels:      "remodel scene — partial wall demo revealing structure, new framing, tile saw, paint cans, measuring tools, orange work light",
  renewables:    "solar/renewables scene — solar panel array on isometric roof section, inverter unit, conduit, meter, orange terminal indicator lights",
  sentry:        "security installation scene — camera mounting, alarm panel, conduit and wire, monitor display, orange armed LED indicator glowing",
  shrink:        "shrink wrap/packaging scene — wrapping machine, stretch wrap roll, packaging station, heat gun, orange sealing element glow",
  bodyshop:      "auto body scene — car panel with spray gun mid-paint, masking tape sections, paint mixing cups, orange drying lamp glow, body filler tools",
  carpetcleaning:"carpet cleaning scene — truck-mounted carpet extractor with hose reel, wand tool, carpet cross-section showing deep clean, orange machine status lights",
  mold:          "mold remediation scene — negative air machine, containment barrier, HEPA vacuum, moisture meter, orange pump light, mold treatment sprayer",
  siding:        "siding installation scene — fiber cement planks, pneumatic nailer, j-channel trim pieces, level tool, orange saw cutting siding panel",
  septic:        "septic service scene — pumping truck with hose, tank cross-section cutaway in platform, inspection camera, orange hazard lights on truck",
  rolloff:       "roll-off dumpster scene — roll-off container being placed from truck, debris being loaded, orange truck hydraulic light glowing",
  alignment:     "wheel alignment scene — car on alignment rack, laser alignment targets on wheels, computer terminal, orange rack status light",
  appraisals:    "appraisal scene — home cross-section with measurement tools, clipboard, camera, laser measuring device, orange status indicator",
  bartender:     "bartender scene — isometric bar setup, bottles in organized rack, cocktail tools laid flat, shaker, orange bar backlight glow",
  bookkeeper:    "bookkeeping scene — desk with ledger, calculator, stacked files, laptop with spreadsheet, orange desk lamp glow",
};

// Fallback scene for any trade not in TRADE_SCENES
const DEFAULT_SCENE = "trade service scene — professional equipment for the trade laid out on the platform in an organized catalog arrangement, primary tool or machine as hero element, supporting tools in open cases, orange accent lights from equipment LEDs";

export function styleLabel(style: CreativeStyle) {
  return style
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTradeBySlug(slug: string) {
  return TRADE_DOMAIN_REGISTRY.find((entry) => entry.slug === slug);
}

interface PromptInput {
  trade: string;
  domain: string;
  appName: string;
  format: CreativeFormat;
  style: CreativeStyle;
  customPrompt?: string;
}

export function buildCreativePrompt(input: PromptInput) {
  if (input.customPrompt?.trim()) {
    return input.customPrompt.trim();
  }

  const scene = TRADE_SCENES[input.trade] ?? DEFAULT_SCENE;
  const formatSpec = FORMAT_SPECS[input.format];

  return [
    "Generate an isometric diorama illustration. Match this exact visual style:",
    "",
    "PROJECTION & PERSPECTIVE:",
    "True 30-degree isometric projection, elevated 3/4 bird's-eye view. Strict parallel projection — no vanishing point, no perspective distortion. Platform offset to the LEFT, approximately 35% negative dark space on the RIGHT side of the frame.",
    "",
    "ART STYLE:",
    "Digitally illustrated semi-realistic — NOT photographic, NOT cartoon, NOT Pixar. Detailed vector illustration with painterly shading and volumetric light. Miniature diorama quality. Clean crisp outlines. Objects have technical accuracy.",
    "",
    "BACKGROUND:",
    "Very dark navy-charcoal void (#1A1E2E). No environment, no sky, no landscape. Faint circuit-board trace grid patterns (#2A3050) receding into darkness. Subtle geometric grid lines on the ground plane. No sunlight, no skylight.",
    "",
    "PLATFORM:",
    "Raised concrete slab floating in the void. Cool medium grey (#6B7080 to #9EA3B0). Thick front-facing edge showing depth. Tools and equipment arranged in organized catalog style on the platform surface.",
    "",
    "COLOR PALETTE — MANDATORY:",
    "Background void: #1A1E2E (dominant, ~60% of frame). Objects/platform: cool steel grey #7A8090 to #9AA0B0 — no warm tones on object surfaces. Orange accent #F5A623 ONLY from practical light sources within the scene: equipment LEDs, sparks, work lights, warning indicators — zero ambient warm light, orange appears only as localized glow pools and spark effects. Highlight whites #B5BBC8 on metallic edges only.",
    "",
    "LIGHTING — CRITICAL:",
    "Low-key cinematic lighting. NO directional sunlight. NO warm ambient fill from above. ALL illumination from light sources within the scene itself (equipment headlights, sparks, work lamps, LED indicators). Deep rich shadows (5:1 dark-to-light ratio). Soft gaussian bloom around orange light sources. Atmospheric haze around sparks.",
    "",
    `SCENE SUBJECT: ${scene}`,
    "",
    `MOOD: ${STYLE_DESCRIPTIONS[input.style]}`,
    "",
    "COMPOSITION:",
    `${formatSpec.composition}`,
    "",
    "STRICTLY EXCLUDE:",
    "No people or faces. No text or logos anywhere in the image. No UI overlays or smartphone screens. No bright daylight or sunlit scenes. No photorealistic rendering. No cartoonish or Pixar-style aesthetics.",
  ].join("\n");
}