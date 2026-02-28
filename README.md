# Project 4H — Campaign Command Center

**Live:** https://pumpcans.com  
**GitHub:** `jarrad1872/project-4h-dashboard`  
**Stack:** Next.js 15 · TypeScript · Tailwind · Supabase · Vercel · Gemini NB2 (image gen)

---

## The Mission

> **2,000 users on Saw.City LITE. Not 1,000. Not "customers." 2,000 users.**

Project 4H is a 4-channel paid acquisition campaign (LinkedIn, YouTube, Facebook, Instagram) targeting owner-operators across **65 trade communities** — each marketed independently under its own `.city` domain. $20,000 total budget. No demos. Fully self-serve.

**Current state (as of 2026-02-28):**
- 195 NB2 images generated (65 trades × Hero A + Hero B + OG) — pending Jarrad approval
- 1,040 NB2 ad variants generated (65 trades × 2 directions × 8 ads) — pending approval
- 20 trades live in Saw.City LITE app; 45 upcoming (need landing pages before ads launch)

---

## How This Works

**The dashboard is a view layer. Bob is the engine.**

| Who | Role |
|-----|------|
| Jarrad | Commands via Telegram, approves at pumpcans.com |
| Bob (AI) | Generates ad copy, creatives, uploads to DB, populates dashboard |
| Dashboard | Read-only view of campaign state for Jarrad |

Nothing goes external (ad accounts, live campaigns) without Jarrad's explicit approval.

---

## Trade Strategy

Each `.city` domain is a **separate trade community** — not "Saw.City" marketed generically to everyone. We market `rinse.city` to pressure washers, `pipe.city` to plumbers, etc.

### Tier 1 Campaign Trades (TAM-Ranked, launch priority)

| Domain | Trade | US TAM | Businesses |
|--------|-------|--------|------------|
| `pipe.city` | Plumbing | $191B | 130K |
| `mow.city` | Lawn Care | $60B | 500K+ |
| `duct.city` | HVAC | $30B | 105K |
| `coat.city` | Painting | $28B | 220K |
| `pest.city` | Pest Control | $26B | 33K |
| `electricians.city` | Electrical | $202B | 75K |
| `roofrepair.city` | Roofing | $56B | 100K |
| `disaster.city` | Disaster Restoration | $210B | 30K |

**Total: 65 trades across 3 tiers.** Full domain portfolio: 72 domains (incl. forwarding aliases).  
See GTM board at `/gtm` for full registry, TAM ranking, and status per trade.

---

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Overview | `/` | Campaign snapshot, metrics, quick actions |
| GTM Board | `/gtm` | Full mission brief, product state, trade registry, action board |
| Ads | `/ads` | All ads with status, images, pause/unpause |
| Approval | `/approval` | Approve/Hold/Reject pending ads — Bulk Approve All per trade |
| Creatives | `/creatives` | Generated ad creative thumbnails |
| Assets | `/assets` | NB2 hero + OG image staging, approve/reject per trade |
| Workflow | `/workflow` | Pipeline stages (concept → approved → uploaded → live) |
| Lifecycle | `/lifecycle` | Day 0/1/3 email + SMS sequences |
| Scorecard | `/scorecard` | Weekly performance metrics |
| Budget | `/budget` | Spend allocation per platform |
| Launch | `/launch` | Pre-launch gate checklist |
| Templates | `/templates` | Creative briefs + ad template library |
| Generate | `/generate` | AI copy + creative generation (Gemini) |
| Settings | `/settings` | Campaign configuration |

---

## Local Development

```bash
cd /home/node/.openclaw/workspace/projects/project-4h-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

Build check:
```bash
npm run build
```

TypeScript check:
```bash
npx tsc --noEmit
```

---

## Deploy

**Auto-deploy:** Push to `main` → Vercel builds and deploys automatically.

```bash
git add -A
git commit -m "your message"
git push origin main
```

**Manual fallback:**
```bash
bash deploy.sh
# or:
npx vercel --prod --token 'ask-bob-or-check-vercel-dashboard' --yes
```

---

## Architecture

### Data Flow
```
Supabase DB (vzawlfitqnjhypnkguas)
    ↑ Bob writes via REST API
    ↓ Next.js /api/* routes read/write
        ↓ React pages render
            ↓ Jarrad views at pumpcans.com
```

### State Management
- **Static/strategic data:** `lib/project-state-data.ts` — edit this file to update GTM board, trade registry, action items
- **Live campaign data:** Supabase tables (ads, ad_templates, marketing_events, metrics, lifecycle)
- **Creatives:** Supabase Storage bucket `ad-creatives` (public)

### Key Tables
- `ads` — all ad variants with status, platform, copy, image_url
- `ad_templates` — creative briefs with copy, model, prompt metadata
- `marketing_events` — UTM attribution from Saw.City LITE signups
- `weekly_metrics` — scorecard data per week per channel
- `lifecycle_messages` — Day 0/1/3 email + SMS sequences
- `launch_checklist` — pre-launch gate items

---

## Ad Conventions

### UTM Format
```
utm_source={platform}&utm_medium=paid-social&utm_campaign=4h_2026-03_{theme}&utm_content={asset_id}&utm_term=owners_1-10
```

### Ad ID Format
- Phase 1 Saw.City branded: `LI-01`, `YT-02`, etc.
- Trade variants: `LI-R1` (Rinse), `FB-M3` (Mow), `YT-RO2` (Rooter)
- Tier 1 pivot trades: `LI-P1` (Pipe), `LI-C1` (Coat), `LI-D1` (Duct), `LI-PE1` (Pest)
- **NB2 format (current):** `NB2-D{1|2}-{LI|FB|IG|YT}-{CODE}{AW|RT}`
  - D1 = pain/urgency direction; D2 = aspiration/social proof direction
  - Campaign group: `nb2_d{1|2}_{platform}_{prefix}`

### Image Assets (NB2 Standard)
All images via Gemini 3.1 Flash Image (`gemini-3.1-flash-image-preview` = Nano Banana 2):
- **Hero A** (`hero_a`): `ad-creatives/trade-heros/nb2/{slug}-hero-a.jpg` — zoomed-in scene, for ads
- **Hero B** (`hero_b`): `ad-creatives/trade-heros/nb2/{slug}-hero-b.jpg` — wide top-down, for landing pages
- **OG** (`og_nb2`): `ad-creatives/trade-ogs/nb2/{slug}-og.jpg` — link preview banner
- Tracked in `trade_assets` table (status: pending → approved → rejected)

### Kill/Scale Rules
- **Kill:** CPL > $40 after $500 spend on a platform
- **Scale:** CPL < $20 AND 5+ sign-ups → double budget
- **Pause creative:** CTR < 0.3% after 1,000 impressions

---

## For Agents

See **[AGENTS.md](./AGENTS.md)** for full operating instructions, credentials, and constraints.  
See **[TASKS.md](./TASKS.md)** for active tasks and backlog.  
See **[SOP-WORKFLOW.md](./SOP-WORKFLOW.md)** for the campaign operating SOP.

---

## Key Links

| Resource | URL |
|----------|-----|
| Live Dashboard | https://pumpcans.com |
| Saw.City LITE (product) | https://sawcity-lite.vercel.app |
| Supabase DB | https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas |
| Supabase Storage | https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/ |
| GitHub Repo | https://github.com/jarrad1872/project-4h-dashboard |
| Vercel Project | https://vercel.com/jarrad-kippens-projects/project-4h-dashboard |

---

*Last updated: 2026-02-28 post-NB2 | v4.0.0*
