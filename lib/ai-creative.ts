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
    composition: "Landscape 1200×628. Diorama offset slightly right of center, leaving left side for text overlay. Keep safe margins for LinkedIn crop.",
  },
  "meta-square": {
    width: 1080,
    height: 1080,
    label: "Meta Square",
    note: "Facebook/Instagram feed",
    composition: "Square 1080×1080. Diorama centered, with balanced space in upper and lower thirds for text overlay.",
  },
  "instagram-story": {
    width: 1080,
    height: 1920,
    label: "Instagram Story",
    note: "Vertical Stories/Reels",
    composition: "Vertical 1080×1920. Diorama fills center of frame. Keep upper and lower 20% clear for text overlay safe zones.",
  },
  "youtube-thumb": {
    width: 1280,
    height: 720,
    label: "YouTube Thumbnail",
    note: "16:9 thumbnail",
    composition: "Cinematic 1280×720. Diorama fills right 60% of frame, strong visual contrast, clear focal point. Left side open for text.",
  },
};

// NB2 style mood modifiers — applied as narrative framing only, visual style stays consistent
export const STYLE_DESCRIPTIONS: Record<CreativeStyle, string> = {
  "pain-point":   "Show peak-activity chaos: multiple workers stretched thin, one figure on the phone while operating equipment, jobs piling up visually (multiple work zones active simultaneously). The scene feels like too much work for too few people.",
  "feature-demo": "Show peak efficiency: every worker has a clear role, equipment is perfectly staged, a small phone or tablet is visible on a workbench or mounted to a van showing a call being handled automatically. The operation looks effortlessly organized.",
  "social-proof": "Show a thriving, established operation: the lot is full of branded vans, all equipment is polished, workers look confident and in control. Small detail: one van has a star rating decal. The scene communicates 'this business is winning'.",
  retargeting:    "Show a single operator at rest — end of a successful day. One figure leaning against a van, job board or phone visible showing completed work. Tools are stowed. The scene communicates 'the hard work is done, the system handled it'.",
};

// NB2 trade scenes — dense, character-driven, PBR isometric diorama style
// Each scene MUST include: figurine workers (3-6), white/blue branded vans, named tools (15+), active work
export const TRADE_SCENES: Record<string, string> = {
  saw:           "A professional concrete cutting business yard viewed isometrically. A cutaway concrete slab in the foreground shows a diamond blade wall saw mid-cut with water coolant spray arcing. 4-5 figurine-style workers in blue coveralls: one operating the wall saw, one guiding a core drill rig, one loading diamond blades into a labeled case, one operating a handheld angle grinder. White and blue branded vans with equipment racks. Ground level: stacked core drill bits (various diameters), slab saw on trailer, ring saw, hydraulic power pack, water tank, wet-dry vac, orange safety cones, concrete dust on ground, core hole plugs. Chain-link perimeter with small trees at edges.",
  rinse:         "A pressure washing company yard viewed isometrically. 4-5 figurine-style workers in blue uniforms: one operating a surface cleaner on a driveway, one with a pressure wand on a building wall, one loading hose reels onto a white branded van, one operating a hot water unit. White and blue vans with roof-mounted hose reels. Ground: commercial hot/cold pressure washer units, hose reel carts, rotary surface cleaners, downstream injector bottles, chemical barrels (blue), extension wands, trigger guns, quick-connect fittings, flat surface cleaner, soft-wash pump system, safety goggles hung on equipment rack.",
  mow:           "A lawn care business yard viewed isometrically. 4-5 figurine-style workers in blue polos and caps: one on a commercial zero-turn mower, one operating a string trimmer along an edge, one using a backpack blower, one loading equipment onto a trailer. White and blue branded trucks with enclosed trailers. Ground: commercial zero-turn mowers (2), walk-behind mower, string trimmers (3), hedge trimmer, backpack blowers, edgers, fuel cans, oil jugs, spare blades in labeled rack, grass clippings visible on ground, landscape trailer with ramp down.",
  rooter:        "A drain cleaning and plumbing service yard. Cutaway cross-section of a house showing drain lines and sewer laterals. 4-5 figurine workers in blue uniforms: one operating motorized drain snake, one holding inspection camera down a cleanout, one operating hydro-jetter with high-pressure hose, one on laptop reviewing camera footage. White and blue vans with ladder racks. Ground: electric drain snake machines (2 sizes), hydro-jetter trailer, sewer camera inspection system on cart, pipe sectional augers, cable drums, cleanout plugs, PVC pipe sections, pipe wrenches, locator wand, access covers.",
  pipe:          "A plumbing and pipe work company yard with a cutaway residential lot. Cross-section reveals underground sewer lines, water mains, and gas lines at different depths. 5 figurine workers in blue coveralls: one in a trench installing pipe, one operating a pipe fusion machine, one controlling a mini excavator, one working on copper rough-in inside a cutaway wall, one at a van pulling out pipe from roof rack. White and blue vans with pipe racks. Ground: copper pipe stacks, PVC/ABS pipe, PEX coils (red and blue), pipe bender, soldering kit, pipe threading machine, gate valves, ball valves, pipe wrenches, trench shoring panels.",
  pave:          "An asphalt paving company yard. 5 figurine workers in blue reflective vests: one operating a walk-behind roller compactor, one raking hot asphalt with a lute, one running a plate compactor, one loading asphalt from a truck, one applying crack filler with a pour pot. White and blue branded trucks. Ground: asphalt roller (ride-on), walk-behind compactor, plate compactor, asphalt rakes, lute tools, crack fill pour pots, hot-applied crack filler kettle, crack routing saw, infrared heater panel, asphalt sealer buckets, brush applicators, traffic cones.",
  haul:          "A hauling and trucking company yard. 4 figurine workers in blue gear: one in a dump truck cab, one directing a load with hand signals, one operating a wheel loader, one chaining down equipment on a flatbed. Fleet of white and blue branded dump trucks, flatbeds, and a wheel loader. Ground: material pile (gravel/soil), tire tracks, load chains and binders, wheel chocks, tie-down straps, scale ticket board, fuel tanks, grease rack, spare tires.",
  lockout:       "A locksmith company van and service yard. 4 figurine workers in blue uniforms: one at a door cross-section picking a lock, one at a key cutting machine, one installing a deadbolt in a door cutaway, one at the van inventory. White and blue service vans with logo decals. Ground: lock pick sets in open case, key cutting machine, key blank inventory rack, deadbolts and door hardware display, automotive lockout tools, slim jims, air wedge kit, bump keys, code machine, safe cracking tools.",
  pest:          "A pest control company yard with a cutaway house cross-section showing treatment zones. 4-5 figurine workers in blue uniforms: one spray-treating a baseboard with a pump sprayer, one setting bait stations along a perimeter, one operating a fumigation tent setup, one in the attic with a dust applicator. White and blue branded vans with equipment. Ground: chemical spray tanks (backpack and wheeled), bait station boxes, termite treatment drill and rods, rodent traps, fumigation tarps, label binders, PPE rack, insecticide barrels.",
  chimney:       "A chimney sweep and fireplace service yard with a brick chimney cross-section showing flue liner. 4 figurine workers in blue uniforms: one on a roof beside the chimney crown, one inside the fireplace with brushes, one operating a HEPA vacuum connected to the chimney, one inspecting with a camera monitor. White service vans. Ground: rotary chimney brush system with rods, inspection camera on cart with monitor, HEPA vacuum units, chimney liner sections, flashing materials, crown coat buckets, chimney caps in various sizes.",
  duct:          "An HVAC and duct cleaning service yard. 4-5 figurine workers in blue uniforms: one operating a truck-mounted duct cleaning system, one in a cutaway attic installing flex duct, one sealing ducts with mastic, one at an air handler unit. White and blue service vans. Ground: sheet metal duct sections, flex duct coils, truck-mounted vacuum unit, HEPA air scrubber, access panel cutter, duct sealing mastic buckets, foil tape rolls, duct register boxes, balancing dampers, manometer gauges.",
  detail:        "An auto detailing company yard. 4-5 figurine workers in blue polo shirts: one using an orbital polisher on a sedan hood, one steam cleaning an interior, one applying ceramic coating, one using a pressure washer on a wheel well, one wiping down a van with microfiber. White and blue branded vans and a detail trailer. Ground: orbital polishers (2), dual-action buffer, steam cleaner, ceramic coating bottles, paint decontamination clay bars, polishing pads in labeled rack, microfiber towels stacked, foam cannon, water softener system, glass coating kit.",
  plow:          "A snow plowing company yard in winter setting. 4-5 figurine workers in blue winter gear: one in a plow truck cab, one salting a lot, one operating a skid steer with snow pusher, one loading salt bags. Fleet of white and blue trucks with front-mounted plow blades. Ground: salt spreaders (tailgate and hopper), pallet of bagged salt/calcium, snow shovels, ice scrapers, skid steer, snow stakes bundled, plow edge blades as spares, truck toolboxes, antifreeze jugs.",
  grade:         "An earthwork and grading company yard. 4-5 figurine workers in blue reflective vests: one operating a motor grader, one on a compact track loader, one checking grade with a laser level, one driving a water truck, one reading plans. White and blue branded trucks. Ground: motor grader, compact track loader, laser level on tripod, grade stakes, measuring wheel, total station survey equipment, soil compaction tester, fuel tank, grease gun.",
  coat:          "An epoxy and floor coating company yard with a cutaway garage floor cross-section showing layers. 4 figurine workers in blue coveralls: one applying epoxy base coat with a squeegee, one rolling a topcoat, one grinding the floor with a diamond grinder, one masking edges. White service vans. Ground: floor grinder, squeegee applicators, roller frames and sleeves, epoxy part A/B cans, flake broadcast container, concrete sealer buckets, mixing drill and paddles, masking tape rolls, plastic sheeting.",
  brake:         "An auto repair and brake service shop cross-section. 4-5 figurine workers in blue shop shirts: one under a lifted car on a hydraulic lift, one replacing a brake rotor, one bleeding brake lines, one at a brake lathe, one at a parts counter. White and blue branded vans. Ground: hydraulic lifts (2), brake lathe, parts washer, rotor and caliper sets on bench, socket set organized in chest, torque wrench, brake line flare tool, caliper piston tool, bleeder kit.",
  wrench:        "An automotive repair shop cross-section. 5 figurine workers in blue mechanic shirts: one under a vehicle on a lift, one replacing an alternator, one at a diagnostic computer, one doing an oil change, one at the parts counter. White and blue branded service trucks. Ground: hydraulic floor jacks, jack stands, OBD2 scanner, engine hoist, oil drain cart, socket sets, torque wrench set, timing light, compression tester, shop press.",
  polish:        "A commercial floor polishing and cleaning company yard. 4 figurine workers in blue uniforms: one riding a commercial floor scrubber, one operating a rotary burnisher, one applying floor finish with a flat mop, one stripping old finish with a swing machine. White and blue service vans. Ground: ride-on scrubber, rotary burnisher, swing machine, wet-dry vacuums, floor finish buckets, floor stripper chemical, clean mop buckets, microfiber pads in labeled rack, caution signs.",
  wreck:         "A demolition company yard. 5 figurine workers in blue reflective vests: one operating a mini excavator, one with a jackhammer, one loading rubble into a dumpster, one cutting rebar, one consulting plans. White and blue trucks. Ground: mini excavator, jackhammer and bits, concrete saw, rebar cutter/bender, roll-off dumpster, sledgehammers, wrecking bars, pipe breaker, chipping hammer, safety fencing.",
  prune:         "A tree trimming and arborist company yard. 4-5 figurine workers in blue gear and harnesses: one in an aerial lift bucket trimming branches, one on a rope system in a tree, one operating a wood chipper, one chucking brush. White and blue branded trucks and chip trucks. Ground: aerial lift, wood chipper, chainsaw (multiple), stump grinder, brush chipper, arborist climbing gear, throw lines, rigging ropes, hard hats.",
  drywall:       "A drywall installation company yard with a cutaway wall cross-section. 4-5 figurine workers in blue denim: one on stilts hanging drywall, one applying joint compound, one taping seams, one sanding. White and blue vans with lumber racks. Ground: drywall panels stacked, drywall lifter, stilts, mud hawk and trowels, automatic taper, corner bead rolls, screw guns, sanding pole, mixing drill, compound buckets.",
  excavation:    "An excavation company yard. 5 figurine workers in blue reflective vests: one in a mini excavator, one running a skid steer, one with a hand tamper in a trench, one setting shoring, one reading plans. White and blue equipment haulers. Ground: mini excavator, skid steer, trench shoring system, hand tamper, plate compactor, laser level, grade stakes, utility locator wand, ground disturbance flags.",
  housecleaning: "A residential cleaning company yard. 4-5 figurine workers in blue scrubs: one vacuuming a room cutaway, one cleaning a bathroom, one mopping a kitchen floor, one wiping windows. White and blue branded vans. Ground: commercial vacuums (2), steam mop, caddy of cleaning supplies, microfiber carts, bucket and wringer system, window squeegees, extension pole, HEPA air purifier, uniform rack.",
  insulation:    "An insulation installation company yard with a cutaway wall cross-section. 4-5 figurine workers in blue Tyvek suits: one operating a blow-in insulation machine, one in an attic with batts, one spray-foaming a rim joist, one sealing penetrations. White and blue vans. Ground: blow-in insulation machine with hose, batt insulation stacks, spray foam gun and canisters, blower door test kit, moisture meter, thermal camera, caulk guns, safety respirators on rack.",
  metalworks:    "A metal fabrication shop cross-section. 5 figurine workers in blue welding gear: one MIG welding a steel frame, one operating a plasma cutter, one at a metal brake press, one grinding welds, one at a metal lathe. White and blue shop trucks. Ground: MIG welders (2), plasma cutter, brake press, metal lathe, angle grinders, clamps and vises, steel stock rack, weld table, slag hammer, wire brush.",
  plank:         "A hardwood and plank flooring company yard. 4-5 figurine workers in blue knee pads and polos: one nailing planks with a flooring nailer, one operating a drum sander, one cutting planks with a miter saw, one applying finish with a roller. White and blue vans. Ground: flooring nailer, drum sander, edge sander, miter saw, moisture meter, stacked plank boxes, pull bar, rubber mallet, floor finish buckets, respirators.",
  refrigeration: "A commercial refrigeration service yard. 4-5 figurine workers in blue uniforms: one diagnosing a walk-in cooler cutaway, one with a refrigerant manifold gauge set, one soldering copper lines, one replacing a compressor. White and blue service vans. Ground: refrigerant recovery machine, manifold gauge set, vacuum pump, refrigerant cylinders (multiple), electronic leak detector, flaring tool, pipe cutter, soldering torch kit, digital thermometer.",
  remodels:      "A home remodel company yard with a cutaway house showing kitchen and bathroom renovation. 5 figurine workers in blue polos: one framing a wall, one installing tile, one operating a reciprocating saw, one hanging cabinets, one painting. White and blue vans and trucks. Ground: tile saw, reciprocating saw, miter saw, framing nailer, cabinet clamps, level set, paint trays and rollers, tile layout tools, subfloor adhesive, permit board.",
  renewables:    "A solar and renewables installation company yard with a cutaway roof section. 4-5 figurine workers in blue uniforms and harnesses: one mounting solar panels on roof, one running conduit, one at an inverter panel, one on a laptop checking monitoring. White and blue branded trucks. Ground: solar panel stack, aluminum racking system, inverter units, conduit bender, wire fish tapes, multimeter, battery storage units, torque wrench for mounting.",
  sentry:        "A security system installation company yard. 4-5 figurine workers in blue shirts: one mounting cameras on a wall cutaway, one wiring an alarm panel, one at a monitoring station, one installing a smart lock, one running conduit. White and blue service vans. Ground: camera mounting hardware, alarm control panels, motion sensors, keypad units, wire reel carts, conduit bender, cable tester, drill and bit set, ladder.",
  shrink:        "A shrink wrap and packaging service yard. 4-5 figurine workers in blue uniforms: one operating a rotary arm stretch wrapper, one heat-shrinking pallet wrap, one labeling wrapped units, one on a forklift. White and blue branded vans and a small warehouse unit. Ground: rotary arm wrapper, heat gun, stretch film rolls (multiple), shrink wrap labels, pallet jack, strapping tool and materials, tape dispenser.",
  bodyshop:      "An auto body repair shop cross-section. 5 figurine workers in blue shop suits: one spraying a car panel with a spray gun, one doing body filler work, one sanding a panel, one masking a car for paint, one doing a color match. White and blue branded trucks. Ground: spray booth area, spray guns (2), body filler and mixing board, DA sander and pads, masking paper rolls, paint mixing station, color spectrophotometer, infrared drying lamp.",
  carpetcleaning:"A carpet and upholstery cleaning company yard. 4-5 figurine workers in blue polo shirts: one operating a truck-mount carpet extractor wand, one pre-spraying a room cutaway, one cleaning upholstery, one loading hose from van. White and blue branded vans with roof-mounted exhaust. Ground: truck-mount extraction machine, carpet wand (2), upholstery tool, pre-spray pump sprayers, pH tester kit, stain treatment bottles, carpet rakes, drying fans.",
  mold:          "A mold remediation company yard with a cutaway wall showing mold growth. 4-5 figurine workers in blue Tyvek suits with respirators: one setting up containment barrier, one spraying antimicrobial, one bagging contaminated materials, one running a negative air machine. White and blue service vans. Ground: negative air machine with HEPA filter, containment barriers and poles, antimicrobial spray tanks, moisture meters, thermal imaging camera, HEPA vacuums, disposal bags, air quality monitor.",
  siding:        "A siding installation company yard with a cutaway house exterior. 4-5 figurine workers in blue polos: one installing fiber cement siding planks, one nailing J-channel trim, one cutting planks with a shear, one caulking seams. White and blue vans with ladder racks. Ground: fiber cement siding stacks, pneumatic nailer, fiber cement shear, j-channel trim coils, caulk guns, house wrap rolls, level, snap line chalk, starter strips.",
  septic:        "A septic service company yard with a cutaway yard showing septic tank and drain field cross-section. 4-5 figurine workers in blue overalls: one pumping a tank with a hose, one doing a camera inspection, one installing a baffle, one locating the system. White and blue vacuum trucks with tanks. Ground: vacuum hose reel, camera inspection system, baffle materials, locating equipment, effluent filter replacements, risers and lids.",
  rolloff:       "A roll-off dumpster rental and hauling yard. 4-5 figurine workers in blue gear: one operating the hook-lift truck placing a container, one loading debris into a dumpster, one sorting recyclables, one driving a roll-off. Blue and white branded hook-lift trucks and dumpster containers. Ground: multiple dumpster containers (various sizes), hook-lift mechanism, scale system, material tarps, debris sorting bins.",
  alignment:     "An auto alignment and tire shop cross-section. 4-5 figurine workers in blue shop shirts: one operating alignment equipment on a car on a rack, one mounting a tire on a machine, one doing a wheel balance, one at a computer checking specs. White and blue branded service trucks. Ground: wheel alignment rack, tire mounting machine, wheel balancer, torque wrench, alignment sensors and targets, tire stacks, hydraulic floor jack.",
  appraisals:    "A property appraisal and inspection company yard with a cutaway house cross-section. 4-5 figurine workers in blue polo shirts: one measuring interior room dimensions with laser measure, one photographing a foundation, one at a laptop entering data, one checking an electrical panel, one on the roof. White and blue branded trucks and cars. Ground: laser measuring devices, camera and tripod, moisture reader, thermal camera, clipboard with forms, measuring tape.",
  bartender:     "A private bartending service yard with an isometric bar setup. 4-5 figurine workers in blue vest uniforms: one mixing a cocktail at the bar, one loading bottles into a van, one setting up a portable bar station, one polishing glasses. White and blue branded service vans. Ground: portable bar unit, cocktail shaker sets, bottle displays, glassware rack, ice bin, garnish trays, cocktail tool set, portable coolers.",
  bookkeeper:    "A bookkeeping and accounting service office yard. 4-5 figurine workers in blue button-downs: one at a desk with monitor showing spreadsheets, one filing folders, one reviewing a printed report, one on a phone. White and blue branded compact cars. Ground: filing cabinets, desktop computers, receipt scanners, document shredder, printer, stacks of binders, calculator, desk organizers.",
};

// Fallback scene for any trade not in TRADE_SCENES
const DEFAULT_SCENE = "A professional trades business yard viewed isometrically. 4-5 figurine workers in blue uniforms actively performing their trade. White and blue branded vans with equipment. Ground level dense with 15-20 named trade-specific tools and equipment. Chain-link perimeter, small trees at edges.";

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
    "Generate a hyper-detailed isometric 3D diorama render in the NB2 style. Match this exact visual system:",
    "",
    "PROJECTION & PERSPECTIVE:",
    "True isometric projection — strict parallel lines, no vanishing point, no perspective convergence. Camera elevated approximately 45 degrees, rotated 30-45 degrees from the primary face of the scene. The diorama floats as an isolated island/lot with clean-cut edges against the void.",
    "",
    "ART STYLE — CRITICAL:",
    "Hyper-detailed miniature diorama with tilt-shift / scale model aesthetic. Photorealistic PBR (physically-based rendering) materials — realistic surface textures for concrete, metal, rubber hoses, wood, plastic, fabric. Think Octane Render or Blender Cycles quality. Objects have correct proportions and technical accuracy. The overall feel is 'precious miniature world you could pick up and hold' — NOT cartoon, NOT flat illustration, NOT painterly. High-fidelity like a product shot of a scale model.",
    "",
    "BACKGROUND:",
    "Solid dark navy void (#0D1B2A to #1B2838) — pure, featureless, infinite dark blue-black space. No environment, no ground plane, no gradient. The diorama floats in this void like a product photograph. Very subtle ambient glow/occlusion glow where the diorama base meets the void. No stars, no grid, no texture in the background.",
    "",
    "LIGHTING — CRITICAL:",
    "Studio product photography lighting — soft, even, diffused overhead illumination. Warm-neutral color temperature (~5500K). Generous fill light — shadow areas are lifted so detail is visible everywhere. NO dramatic falloff, NO moody shadows, NO cinematic low-key lighting. Subtle specular highlights on metallic surfaces and wet/polished surfaces. Ambient occlusion visible in corners and under objects. The scene interior is BRIGHT and INVITING — like a well-photographed architectural model.",
    "",
    "COLOR PALETTE:",
    "Dominant: medium blues (#2B5C8A, #3A7BD5, #1E3A5F) for vehicles, uniforms, barrels, equipment accents. White and light grey for vans, walls, PVC, concrete surfaces. Warm neutrals for ground (concrete #B8A99A, earth #8B6E4E, wood #C4A46B). Green foliage accents at perimeter edges. Small pops of orange/yellow for safety gear and equipment details (#E8A020). NO dark steel grey palette. NO orange glow as the primary light source.",
    "",
    "CHARACTERS — REQUIRED:",
    "Include 4-6 miniature figurine-style human workers actively performing trade-specific tasks. Style: high-quality architectural model figures or Preiser HO-scale style — proportioned realistically but slightly simplified, NOT photoscanned humans, NOT cartoon. All workers wear consistent blue uniforms (coveralls, polos, or work shirts) with occasional safety gear (hard hats, safety vests). Every figure performs a distinct, identifiable trade task. Workers are essential — they provide scale, narrative, and brand identity.",
    "",
    "VEHICLES — REQUIRED:",
    "Include at least 2 white and/or blue branded service vans or trucks appropriate to the trade. Vans may have rear doors open showing organized equipment shelving. Vehicles reinforce the professional business identity.",
    "",
    `SCENE: ${scene}`,
    "",
    `NARRATIVE FRAMING: ${STYLE_DESCRIPTIONS[input.style]}`,
    "",
    "DENSITY:",
    "The diorama should be extremely dense with trade-specific detail. Every area of the scene contains identifiable objects — tools, containers, equipment, materials. No large empty zones within the diorama itself (only the void background is empty).",
    "",
    "COMPOSITION:",
    `${formatSpec.composition}`,
    "",
    "STRICTLY EXCLUDE:",
    "No text or logos anywhere in the image. No UI overlays, no phone screens, no smartphone mockups. No cartoon or Pixar aesthetics. No photographic realism of actual humans. No bright sky or outdoor environment backgrounds — only the navy void.",
  ].join("\n");
}