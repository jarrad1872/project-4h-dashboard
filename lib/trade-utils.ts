import type { Ad } from "./types";

export const TRADE_MAP: Record<string, { label: string; color: string; bg: string; domain: string; tier: number }> = {
  // Tier 1 — highest TAM / campaign priority
  pipe:          { label: "Pipe.City",         color: "text-cyan-300",    bg: "bg-cyan-900/40",    domain: "pipe.city",          tier: 1 },
  mow:           { label: "Mow.City",          color: "text-green-300",   bg: "bg-green-900/40",   domain: "mow.city",           tier: 1 },
  coat:          { label: "Coat.City",         color: "text-pink-300",    bg: "bg-pink-900/40",    domain: "coat.city",          tier: 1 },
  duct:          { label: "Duct.City",         color: "text-sky-300",     bg: "bg-sky-900/40",     domain: "duct.city",          tier: 1 },
  pest:          { label: "Pest.City",         color: "text-amber-300",   bg: "bg-amber-900/40",   domain: "pest.city",          tier: 1 },
  electricians:  { label: "Electricians.City", color: "text-yellow-300",  bg: "bg-yellow-900/40",  domain: "electricians.city",  tier: 1 },
  roofrepair:    { label: "Roofrepair.City",   color: "text-rose-300",    bg: "bg-rose-900/40",    domain: "roofrepair.city",    tier: 1 },
  disaster:      { label: "Disaster.City",     color: "text-red-300",     bg: "bg-red-900/40",     domain: "disaster.city",      tier: 1 },
  // Tier 2
  rinse:         { label: "Rinse.City",        color: "text-blue-300",    bg: "bg-blue-900/40",    domain: "rinse.city",         tier: 2 },
  rooter:        { label: "Rooter.City",       color: "text-purple-300",  bg: "bg-purple-900/40",  domain: "rooter.city",        tier: 2 },
  pave:          { label: "Pave.City",         color: "text-yellow-300",  bg: "bg-yellow-900/40",  domain: "pave.city",          tier: 2 },
  haul:          { label: "Haul.City",         color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "haul.city",          tier: 2 },
  grade:         { label: "Grade.City",        color: "text-lime-300",    bg: "bg-lime-900/40",    domain: "grade.city",         tier: 2 },
  // Tier 3 / base
  saw:           { label: "Saw.City",          color: "text-orange-300",  bg: "bg-orange-900/40",  domain: "saw.city",           tier: 3 },
};

export function tradeFromAd(ad: Ad): string {
  const utm = (ad.utm_campaign ?? ad.utmCampaign ?? "").toLowerCase();
  for (const key of Object.keys(TRADE_MAP)) {
    if (utm.includes(`_${key}_`) || utm.endsWith(`_${key}`)) return key;
  }
  // fallback: landing path
  const lp = (ad.landing_path ?? ad.landingPath ?? "").toLowerCase();
  for (const key of Object.keys(TRADE_MAP)) {
    if (lp.includes(key)) return key;
  }
  return "saw";
}

export function tradeBadge(ad: Ad) {
  const key = tradeFromAd(ad);
  return TRADE_MAP[key] ?? TRADE_MAP.saw;
}
