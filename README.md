# Project 4H — Campaign Command Center

**Live:** https://pumpcans.com  
**GitHub:** `jarrad1872/project-4h-dashboard`  
**Stack:** Next.js 15 · TypeScript · Tailwind · Supabase · Vercel

---

## The Mission

> **2,000 users on Saw.City LITE. Not 1,000. Not "customers." 2,000 users.**

Project 4H is a 4-channel paid acquisition campaign (LinkedIn, YouTube, Facebook, Instagram) targeting owner-operators across **20+ trade communities** — each marketed independently under its own `.city` domain. $20,000 total budget. No demos. Fully self-serve.

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

### Tier 1 Campaign Trades (TAM-Ranked)

| Domain | Trade | US TAM | Businesses |
|--------|-------|--------|------------|
| `pipe.city` | Plumbing | $191B | 130K |
| `mow.city` | Lawn Care | $60B | 500K+ |
| `coat.city` | Painting | $28B | 220K |
| `duct.city` | HVAC | $30B | 105K |
| `pest.city` | Pest Control | $26B | 33K |

**Total trade domain portfolio: 72 domains** (20 live in app, 45+ upcoming). See GTM board for full registry.

---

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Overview | `/` | Campaign snapshot, metrics, quick actions |
| GTM Board | `/gtm` | Full mission brief, product state, trade registry, action board |
| Ads | `/ads` | All ads with status, images, pause/unpause |
| Approval | `/approval` | Approve/Hold/Reject pending ads — Bulk Approve All per trade |
| Creatives | `/creatives` | Generated ad creative thumbnails |
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

*Last updated: 2026-02-28 | v3.0.0*
