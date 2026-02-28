import type { Ad } from "./types";

export const TRADE_MAP: Record<string, { label: string; color: string; bg: string; domain: string; tier: number }> = {
  // ── Tier 1 — highest TAM / campaign priority ──────────────────────────────
  pipe:          { label: "Pipe.City",          color: "text-cyan-300",    bg: "bg-cyan-900/40",    domain: "pipe.city",          tier: 1 },
  mow:           { label: "Mow.City",           color: "text-green-300",   bg: "bg-green-900/40",   domain: "mow.city",           tier: 1 },
  coat:          { label: "Coat.City",          color: "text-pink-300",    bg: "bg-pink-900/40",    domain: "coat.city",          tier: 1 },
  duct:          { label: "Duct.City",          color: "text-sky-300",     bg: "bg-sky-900/40",     domain: "duct.city",          tier: 1 },
  pest:          { label: "Pest.City",          color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "pest.city",          tier: 1 },
  electricians:  { label: "Electricians.City",  color: "text-yellow-300",  bg: "bg-yellow-900/40",  domain: "electricians.city",  tier: 1 },
  roofrepair:    { label: "Roofrepair.City",    color: "text-rose-300",    bg: "bg-rose-900/40",    domain: "roofrepair.city",    tier: 1 },
  disaster:      { label: "Disaster.City",      color: "text-red-300",     bg: "bg-red-900/40",     domain: "disaster.city",      tier: 1 },
  // ── Tier 2 ────────────────────────────────────────────────────────────────
  saw:           { label: "Saw.City",           color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "saw.city",           tier: 2 },
  rinse:         { label: "Rinse.City",         color: "text-blue-300",    bg: "bg-blue-900/40",    domain: "rinse.city",         tier: 2 },
  rooter:        { label: "Rooter.City",        color: "text-purple-300",  bg: "bg-purple-900/40",  domain: "rooter.city",        tier: 2 },
  pave:          { label: "Pave.City",          color: "text-yellow-300",  bg: "bg-yellow-900/40",  domain: "pave.city",          tier: 2 },
  haul:          { label: "Haul.City",          color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "haul.city",          tier: 2 },
  grade:         { label: "Grade.City",         color: "text-lime-300",    bg: "bg-lime-900/40",    domain: "grade.city",         tier: 2 },
  lockout:       { label: "Lockout.City",       color: "text-violet-300",  bg: "bg-violet-900/40",  domain: "lockout.city",       tier: 2 },
  plow:          { label: "Plow.City",          color: "text-indigo-300",  bg: "bg-indigo-900/40",  domain: "plow.city",          tier: 2 },
  prune:         { label: "Prune.City",         color: "text-emerald-300", bg: "bg-emerald-900/40", domain: "prune.city",         tier: 2 },
  chimney:       { label: "Chimney.City",       color: "text-stone-300",   bg: "bg-stone-900/40",   domain: "chimney.city",       tier: 2 },
  detail:        { label: "Detail.City",        color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "detail.city",        tier: 2 },
  brake:         { label: "Brake.City",         color: "text-red-300",     bg: "bg-red-900/40",     domain: "brake.city",         tier: 2 },
  wrench:        { label: "Wrench.City",        color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "wrench.city",        tier: 2 },
  polish:        { label: "Polish.City",        color: "text-fuchsia-300", bg: "bg-fuchsia-900/40", domain: "polish.city",        tier: 2 },
  wreck:         { label: "Wreck.City",         color: "text-rose-300",    bg: "bg-rose-900/40",    domain: "wreck.city",         tier: 2 },
  drywall:       { label: "Drywall.City",       color: "text-slate-300",   bg: "bg-slate-900/40",   domain: "drywall.city",       tier: 2 },
  excavation:    { label: "Excavation.City",    color: "text-lime-300",    bg: "bg-lime-900/40",    domain: "excavation.city",    tier: 2 },
  housecleaning: { label: "Housecleaning.City", color: "text-sky-300",     bg: "bg-sky-900/40",     domain: "housecleaning.city", tier: 2 },
  insulation:    { label: "Insulation.City",    color: "text-yellow-300",  bg: "bg-yellow-900/40",  domain: "insulation.city",    tier: 2 },
  metalworks:    { label: "Metalworks.City",    color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "metalworks.city",    tier: 2 },
  plank:         { label: "Plank.City",         color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "plank.city",         tier: 2 },
  refrigeration: { label: "Refrigeration.City", color: "text-cyan-300",    bg: "bg-cyan-900/40",    domain: "refrigeration.city", tier: 2 },
  remodels:      { label: "Remodels.City",      color: "text-indigo-300",  bg: "bg-indigo-900/40",  domain: "remodels.city",      tier: 2 },
  renewables:    { label: "Renewables.City",    color: "text-yellow-300",  bg: "bg-yellow-900/40",  domain: "renewables.city",    tier: 2 },
  sentry:        { label: "Sentry.City",        color: "text-violet-300",  bg: "bg-violet-900/40",  domain: "sentry.city",        tier: 2 },
  shrink:        { label: "Shrink.City",        color: "text-teal-300",    bg: "bg-teal-900/40",    domain: "shrink.city",        tier: 2 },
  bodyshop:      { label: "Bodyshop.City",      color: "text-rose-300",    bg: "bg-rose-900/40",    domain: "bodyshop.city",      tier: 2 },
  carpetcleaning:{ label: "Carpetcleaning.City",color: "text-purple-300",  bg: "bg-purple-900/40",  domain: "carpetcleaning.city",tier: 2 },
  mold:          { label: "Mold.City",          color: "text-green-300",   bg: "bg-green-900/40",   domain: "mold.city",          tier: 2 },
  siding:        { label: "Siding.City",        color: "text-blue-300",    bg: "bg-blue-900/40",    domain: "siding.city",        tier: 2 },
  septic:        { label: "Septic.City",        color: "text-lime-300",    bg: "bg-lime-900/40",    domain: "septic.city",        tier: 2 },
  rolloff:       { label: "Rolloff.City",       color: "text-slate-300",   bg: "bg-slate-900/40",   domain: "rolloff.city",       tier: 2 },
  // ── Tier 3 ────────────────────────────────────────────────────────────────
  alignment:     { label: "Alignment.City",     color: "text-indigo-300",  bg: "bg-indigo-900/40",  domain: "alignment.city",     tier: 3 },
  appraisals:    { label: "Appraisals.City",    color: "text-stone-300",   bg: "bg-stone-900/40",   domain: "appraisals.city",    tier: 3 },
  bartender:     { label: "Bartender.City",     color: "text-red-300",     bg: "bg-red-900/40",     domain: "bartender.city",     tier: 3 },
  bookkeeper:    { label: "Bookkeeper.City",    color: "text-blue-300",    bg: "bg-blue-900/40",    domain: "bookkeeper.city",    tier: 3 },
  cater:         { label: "Cater.City",         color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "cater.city",         tier: 3 },
  directional:   { label: "Directional.City",   color: "text-lime-300",    bg: "bg-lime-900/40",    domain: "directional.city",   tier: 3 },
  esthetician:   { label: "Esthetician.City",   color: "text-pink-300",    bg: "bg-pink-900/40",    domain: "esthetician.city",   tier: 3 },
  finish:        { label: "Finish.City",        color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "finish.city",        tier: 3 },
  fireprotection:{ label: "Fireprotection.City",color: "text-red-300",     bg: "bg-red-900/40",     domain: "fireprotection.city",tier: 3 },
  groom:         { label: "Groom.City",         color: "text-pink-300",    bg: "bg-pink-900/40",    domain: "groom.city",         tier: 3 },
  grout:         { label: "Grout.City",         color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "grout.city",         tier: 3 },
  hitch:         { label: "Hitch.City",         color: "text-red-300",     bg: "bg-red-900/40",     domain: "hitch.city",         tier: 3 },
  hydrovac:      { label: "Hydrovac.City",      color: "text-sky-300",     bg: "bg-sky-900/40",     domain: "hydrovac.city",      tier: 3 },
  inspection:    { label: "Inspection.City",    color: "text-green-300",   bg: "bg-green-900/40",   domain: "inspection.city",    tier: 3 },
  lawfirm:       { label: "Lawfirm.City",       color: "text-slate-300",   bg: "bg-slate-900/40",   domain: "lawfirm.city",       tier: 3 },
  locating:      { label: "Locating.City",      color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "locating.city",      tier: 3 },
  nail:          { label: "Nail.City",          color: "text-pink-300",    bg: "bg-pink-900/40",    domain: "nail.city",          tier: 3 },
  pane:          { label: "Pane.City",          color: "text-sky-300",     bg: "bg-sky-900/40",     domain: "pane.city",          tier: 3 },
  poolservice:   { label: "Poolservice.City",   color: "text-cyan-300",    bg: "bg-cyan-900/40",    domain: "poolservice.city",   tier: 3 },
  portrait:      { label: "Portrait.City",      color: "text-violet-300",  bg: "bg-violet-900/40",  domain: "portrait.city",      tier: 3 },
  privatechef:   { label: "Privatechef.City",   color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "privatechef.city",   tier: 3 },
  stamped:       { label: "Stamped.City",       color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "stamped.city",       tier: 3 },
  taxprep:       { label: "Taxprep.City",       color: "text-slate-300",   bg: "bg-slate-900/40",   domain: "taxprep.city",       tier: 3 },
  trowel:        { label: "Trowel.City",        color: "text-stone-300",   bg: "bg-stone-900/40",   domain: "trowel.city",        tier: 3 },
};

export function tradeFromAd(ad: Ad): string {
  const keys = Object.keys(TRADE_MAP);

  // Check utm_campaign and campaign_group — both may contain the trade key
  const candidates = [
    ad.utm_campaign ?? ad.utmCampaign ?? "",
    ad.campaign_group ?? ad.campaignGroup ?? "",
  ].map(s => s.toLowerCase());

  for (const str of candidates) {
    if (!str) continue;
    // 1. Exact segment match: _key_ or _key at end (handles nb2_d2_li_trowel, nb2_2026-03_trowel_d2, etc.)
    for (const key of keys) {
      if (str.includes(`_${key}_`) || str.endsWith(`_${key}`)) return key;
    }
    // 2. Last segment (after final _) in case no leading underscore match
    const lastSeg = str.split("_").pop() ?? "";
    if (TRADE_MAP[lastSeg]) return lastSeg;
    // 3. Second-to-last segment (handles nb2_2026-03_trowel_d2 where last seg = d2)
    const parts = str.split("_");
    if (parts.length >= 2) {
      const secondLast = parts[parts.length - 2];
      if (TRADE_MAP[secondLast]) return secondLast;
    }
  }

  // fallback: landing path
  const lp = (ad.landing_path ?? ad.landingPath ?? "").replace("/", "").toLowerCase();
  if (TRADE_MAP[lp]) return lp;
  for (const key of keys) {
    if (lp.includes(key)) return key;
  }
  return "saw";
}

export function tradeBadge(ad: Ad) {
  const key = tradeFromAd(ad);
  return TRADE_MAP[key] ?? TRADE_MAP.saw;
}
