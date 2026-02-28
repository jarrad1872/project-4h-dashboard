import type { Ad } from "./types";

export const TRADE_MAP: Record<string, { label: string; color: string; bg: string; domain: string }> = {
  rinse:  { label: "Rinse.City",  color: "text-blue-300",   bg: "bg-blue-900/40",   domain: "rinse.city" },
  mow:    { label: "Mow.City",    color: "text-green-300",  bg: "bg-green-900/40",  domain: "mow.city" },
  rooter: { label: "Rooter.City", color: "text-purple-300", bg: "bg-purple-900/40", domain: "rooter.city" },
  saw:    { label: "Saw.City",    color: "text-orange-300", bg: "bg-orange-900/40", domain: "saw.city" },
  pipe:   { label: "Pipe.City",   color: "text-cyan-300",   bg: "bg-cyan-900/40",   domain: "pipe.city" },
  pave:   { label: "Pave.City",   color: "text-yellow-300", bg: "bg-yellow-900/40", domain: "pave.city" },
  haul:   { label: "Haul.City",   color: "text-red-300",    bg: "bg-red-900/40",    domain: "haul.city" },
  grade:  { label: "Grade.City",  color: "text-lime-300",   bg: "bg-lime-900/40",   domain: "grade.city" },
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
