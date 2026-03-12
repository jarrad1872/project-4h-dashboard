# AGENTS.md — Project 4H Dashboard

This file is the operating manual for any AI agent (Bob, Codex, sub-Bob) working in this codebase.

---

## What This Repo Is

**pumpcans.com** — the campaign command center for Project 4H.

Project 4H is a 4-channel paid acquisition campaign (LinkedIn, YouTube, Facebook, Instagram) targeting **2,000 users** across **20+ trades** on Saw.City LITE. The dashboard is the **view layer only** — Bob generates content and populates data via Telegram commands. Jarrad reviews and approves. Nothing launches without approval.

**Live URL:** https://pumpcans.com  
**GitHub:** `jarrad1872/project-4h-dashboard`  
**Stack:** Next.js 16, TypeScript, Tailwind 4, Supabase, Gemini AI
**Deployment:** Vercel (auto-deploys on push to `main`)

---

## Hard Rules

1. **`/home/node/.openclaw/workspace/projects/sawcity-lite` is READ-ONLY.** Never commit, PR, merge, or modify anything in that repo. It is a different project.
2. **Never push to a branch other than `main`** in this repo — Vercel webhook is wired to `main`.
3. **Nothing goes live externally without Jarrad's approval** — no new ad accounts, no live campaigns, no external webhooks.
4. **Verify before reporting done.** If you push code, confirm Vercel deployed. If you update DB, confirm the row exists. Show evidence.
5. **Update relevant .md files before every commit.** If the work affects how the system works, what's been built, or what's pending — update TASKS.md, SOP-WORKFLOW.md, or README.md in the same commit. Never push code that leaves the docs stale. The .md files are the system's memory.
6. **Never move money or modify billing** in any system.

### TRADE_MAP Hard Rule
**Every new trade added to the campaign MUST have its prefix added to `lib/trade-utils.ts → TRADE_MAP` in the same commit.**
Missing entries silently fall back to `saw.city` badge on every page — this is a user-visible bug.
Current: 65 prefixes registered as of commit `820719f` (Feb 28, 2026).

### Ad Copy Hard Rules
- **Price is ALWAYS $39/mo** — never $79, $99, $149, or any other amount.
- **14-day free trial, no credit card required** — include this in ALL future ad copy. It's a key conversion hook and must appear in some form in every ad (primary text, headline, or CTA).
- **Trade-authentic copy only** — mechanical find-and-replace fails the anti-slop audit. Use trade-specific vocabulary.
- **No generic brand name** — ads always use the trade-specific `.city` domain (rinse.city, mow.city, etc.), never "Saw.City" as a catch-all.
- **UTM format:** `utm_campaign=4h_YYYY-MM_{campaign}`, `utm_source={platform}`, `utm_medium=paid-social`.

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
- **Ad copy generation:** `/api/ads/generate` route (Gemini 2.0 Flash) — constrained pipeline with validation
- **Text copy (legacy):** `/api/generate` route (Gemini 2.5 Flash)
- **Image gen:** `/api/ai-creative` route (model: `gemini-3.1-flash-image-preview`)
- **OpenAI:** QUOTA EXHAUSTED — do not use

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/project-state-data.ts` | Single source of truth for GTM board data — edit this to update all dashboard state |
| `lib/types.ts` | TypeScript types for Ad, AdStatus, etc. |
| `lib/trade-utils.ts` | TRADE_MAP (65 prefixes) and tradeFromAd() helper — **keep in sync with all trades** |
| `lib/server-utils.ts` | normalizeAd(), adToDb() — DB↔API field mapping |
| `app/gtm/page.tsx` | GTM Action Board — mission, product readiness, trade registry, actions |
| `app/approval/page.tsx` | Approval queue — reads ads table, Approve/Hold/Reject per ad |
| `app/api/ads/route.ts` | Ads CRUD API |
| `app/api/ads/generate/route.ts` | Ad copy generation pipeline (Gemini + validator) |
| `app/api/generate/route.ts` | Legacy AI copy generation (Gemini) |
| `app/api/ai-creative/route.ts` | Image creative generation (Gemini) |
| `lib/trade-copy-context.ts` | Per-trade context data for 20 live trades |
| `lib/ad-copy-prompts.ts` | Prompt templates (4 angles x 4 platforms) |
| `lib/ad-copy-validator.ts` | Hard rule validation + soft warnings |
| `supabase/migrations/` | SQL migrations — apply via Supabase SQL editor |
| `TASKS.md` | Active tasks and backlog |
| `BOB.md` | Full operating manual for Bob agent — CLI reference + ad system ops |

---

## Database Schema (Key Tables)

```sql
ads (
  id TEXT PRIMARY KEY,           -- e.g. "LI-01", "pipe_linkedin_pain_1741..."
  platform ad_platform,          -- linkedin | youtube | facebook | instagram
  format TEXT,
  headline TEXT,
  primary_text TEXT,
  cta TEXT,
  utm_campaign TEXT,
  status ad_status,              -- pending | approved | paused | rejected | uploaded
  workflow_stage TEXT,           -- concept | approved | uploaded | live | paused
  image_url TEXT,                -- Supabase Storage URL for creative
  creative_variant INT,          -- 1 = C1, 2 = C2, 3 = C3
  angle TEXT,                    -- pain | solution | proof | urgency (generated ads)
  validation_notes TEXT,         -- soft warnings from ad copy validator
  generation_model TEXT,         -- AI model used (e.g. "gemini-2.0-flash")
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

## Ad Copy Generation Pipeline

The generation pipeline replaces the old NB2 ad copy with constrained AI-generated copy. It produces trade-authentic, validated ads across 4 angles and 4 platforms.

### Copy Angles (4 per trade)
| Angle | Strategy |
|-------|----------|
| `pain` | Problem amplification — missed calls, lost revenue, chaos |
| `solution` | Feature-led — what the app does, how it works |
| `proof` | Social proof — results, trust, industry adoption |
| `urgency` | Time pressure — seasonal demand, competitive advantage |

### Pipeline Flow
```
Trade context → Prompt (angle + platform + trade) → Gemini 2.0 Flash → Validator → DB insert
```

### Validation Rules (Hard — blocks save)
- Price must be "$39/mo"
- Must include "14-day free trial" and "no credit card"
- Must use trade's .city domain, never "saw.city" (unless trade IS saw)
- Character limits: primary_text ≤ 2000, headline ≤ 300, cta ≤ 200
- No generic language ("trade business", "small business software")

### CLI Commands
```bash
4h generate-copy --trades all --platforms all --angles all     # Full run: 320 ads
4h generate-copy --trades pipe,mow --platforms linkedin --angles pain  # Targeted
4h generate-copy --trades pipe --dry-run                       # Preview without saving
4h ads archive --campaign-group nb2                            # Archive old NB2 ads
```

### Key Files
| File | Purpose |
|------|---------|
| `lib/trade-copy-context.ts` | Context data for 20 trades (services, pain points, tools, persona) |
| `lib/ad-copy-prompts.ts` | Builds structured Gemini prompts per angle×platform |
| `lib/ad-copy-validator.ts` | Validates generated copy against hard rules |
| `app/api/ads/generate/route.ts` | POST endpoint — orchestrates the full pipeline |

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
