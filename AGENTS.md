# AGENTS.md — Project 4H Dashboard

This file is the operating manual for any AI agent (Bob, Codex, sub-Bob) working in this codebase.

---

## What This Repo Is

**pumpcans.com** — the campaign command center for Project 4H.

Project 4H is a 4-channel paid acquisition campaign (LinkedIn, YouTube, Facebook, Instagram) targeting **2,000 users** across **20+ trades** on Saw.City LITE. The dashboard is the **view layer only** — Bob generates content and populates data via Telegram commands. Jarrad reviews and approves. Nothing launches without approval.

**Live URL:** https://pumpcans.com  
**GitHub:** `jarrad1872/project-4h-dashboard`  
**Stack:** Next.js 15, TypeScript, Tailwind, Supabase  
**Deployment:** Vercel (auto-deploys on push to `main`)

---

## Hard Rules

1. **`/home/node/.openclaw/workspace/projects/sawcity-lite` is READ-ONLY.** Never commit, PR, merge, or modify anything in that repo. It is a different project.
2. **Never push to a branch other than `main`** in this repo — Vercel webhook is wired to `main`.
3. **Nothing goes live externally without Jarrad's approval** — no new ad accounts, no live campaigns, no external webhooks.
4. **Verify before reporting done.** If you push code, confirm Vercel deployed. If you update DB, confirm the row exists. Show evidence.
5. **Never move money or modify billing** in any system.

---

## Environment

### VPS (where Bob lives)
- **Path:** `/home/node/.openclaw/workspace/projects/project-4h-dashboard`
- **Node:** v22.22.0
- **npm:** Run `npm install` if node_modules is missing

### Supabase (4H Database)
- **Project:** `vzawlfitqnjhypnkguas`
- **URL:** `https://vzawlfitqnjhypnkguas.supabase.co`
- **Service Role Key:** `[supabase-service-role-key--ask-bob]`
- **Direct DB:** Firewalled — use REST API or Supabase SQL editor for DDL
- **Storage bucket:** `ad-creatives` (public)

### Tokens
- **Vercel:** `ask-bob-or-check-vercel-dashboard` (scope: `jarrad-kippens-projects`)
- **Vercel project ID:** `prj_fkFt0sVL5Sab3s48JeGYB6L9oIOP`
- **GitHub:** `ask-bob-or-check-github-settings`
- **Gemini API:** `ask-bob-or-check-env` (use for copy gen + image gen)

### AI Generation
- **Text copy:** `/api/generate` route (Gemini 2.5 Flash) — trade-aware TRADE_MAP inside
- **Image gen:** `/api/ai-creative` route (model: `gemini-3-pro-image-preview`)
- **Node.js generator:** `/tmp/genai-test/gen-tier1-ads.mjs` on VPS
- **OpenAI:** QUOTA EXHAUSTED — do not use

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/project-state-data.ts` | Single source of truth for GTM board data — edit this to update all dashboard state |
| `lib/types.ts` | TypeScript types for Ad, AdStatus, etc. |
| `lib/trade-utils.ts` | TRADE_MAP and tradeFromAd() helper |
| `lib/server-utils.ts` | normalizeAd(), adToDb() — DB↔API field mapping |
| `app/gtm/page.tsx` | GTM Action Board — mission, product readiness, trade registry, actions |
| `app/approval/page.tsx` | Approval queue — reads ads table, Approve/Hold/Reject per ad |
| `app/api/ads/route.ts` | Ads CRUD API |
| `app/api/generate/route.ts` | AI copy generation (Gemini) |
| `app/api/ai-creative/route.ts` | Image creative generation (Gemini) |
| `supabase/migrations/` | SQL migrations — apply via Supabase SQL editor |
| `deploy.sh` | Manual deploy fallback if auto-deploy fails |
| `TASKS.md` | Active tasks and backlog |

---

## Database Schema (Key Tables)

```sql
ads (
  id TEXT PRIMARY KEY,           -- e.g. "LI-01", "YT-R2"
  platform ad_platform,          -- linkedin | youtube | facebook | instagram
  format TEXT,
  headline TEXT,
  primary_text TEXT,
  cta TEXT,
  utm_campaign TEXT,
  status ad_status,              -- pending | approved | paused | rejected | uploaded
  workflow_stage TEXT,           -- concept | approved | uploaded | live | paused
  image_url TEXT,                -- Supabase Storage URL for creative
  created_at TIMESTAMPTZ
)

ad_templates (
  id UUID PRIMARY KEY,
  name TEXT,                     -- trade slug (e.g. "rinse-linkedin-cold")
  headline TEXT,                 -- trade label
  primary_text TEXT,             -- ad copy
  cta TEXT,                      -- model name used
  landing_path TEXT,             -- hero image URL
  utm_campaign JSONB             -- metadata blob including image_url
)

marketing_events (
  id UUID PRIMARY KEY,
  tenant_id TEXT,
  event_type TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMPTZ
)
```

---

## Deploy Process

**Auto-deploy (preferred):** Push to `main` → Vercel builds automatically.

```bash
cd /home/node/.openclaw/workspace/projects/project-4h-dashboard
git add -A
git commit -m "your message"
git push origin main
```

**Manual fallback:**
```bash
bash /home/node/.openclaw/workspace/projects/project-4h-dashboard/deploy.sh
```
Or: `npx vercel --prod --token 'ask-bob-or-check-vercel-dashboard' --yes`

---

## Ad Data Conventions

### ID Format
- Phase 1 (Saw.City branded): `LI-01` through `LI-09`, `YT-01` etc.
- Trade variants: `{PLATFORM}-{TRADE_PREFIX}{N}` e.g. `LI-R1` (Rinse LinkedIn 1), `FB-M3` (Mow Facebook 3)
- New Tier 1 trades: `LI-P{N}` (Pipe), `LI-C{N}` (Coat), `LI-D{N}` (Duct), `LI-PE{N}` (Pest)

### UTM Format
```
utm_source={platform}&utm_medium=paid-social&utm_campaign=4h_2026-03_{theme}&utm_content={asset_id}&utm_term=owners_1-10
```

### Trade Prefixes (for ad IDs)
| Trade | Prefix | Domain |
|-------|--------|--------|
| Pipe (plumbing) | P | pipe.city |
| Mow (lawn care) | M | mow.city |
| Coat (painting) | C | coat.city |
| Duct (HVAC) | D | duct.city |
| Pest (pest control) | PE | pest.city |
| Crimp (electrical) | CR | crimp.city |
| Eave (roofing) | EV | eave.city |
| Excavation | EX | excavation.city |
| Disaster (restoration) | DS | disaster.city |

---

## Tier 1 Campaign Trades (Current Pivot — Feb 2026)

The campaign is pivoting from saw/rinse/mow/rooter to the **TAM-ranked Tier 1 trades**:

| Domain | Trade | US TAM | Priority |
|--------|-------|--------|----------|
| `pipe.city` | Plumbing | $191B | 1 |
| `mow.city` | Lawn Care | $60B | 2 |
| `coat.city` | Painting | $28B | 3 |
| `duct.city` | HVAC | $30B | 4 |
| `pest.city` | Pest Control | $26B | 5 |

Note: crimp/eave/excavation/disaster are Tier 1 by TAM but are `status: "upcoming"` in the app — campaigns for those come in Phase 2 once they're built.

---

## Two-Failure Rule

If the same approach fails twice, change something meaningful before retrying — different prompt, smaller scope, more context, different model. Blind retries are forbidden.

---

## Memory Sync

This repo's state should stay in sync with:
- VPS: `/home/node/.openclaw/workspace/MEMORY.md` (Bob's long-term memory)
- VPS: `/home/node/.openclaw/workspace/memory/YYYY-MM-DD.md` (Bob's daily notes)
- VPS: `/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/TRADE-DOMAIN-REGISTRY.md`

When making significant decisions (trade tier changes, new domain acquisitions, campaign pivots), update `lib/project-state-data.ts` AND note it in VPS memory.
