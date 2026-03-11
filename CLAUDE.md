# CLAUDE.md — Project 4H Dashboard

## What This Is

Marketing campaign command center for **sawcity-lite** (a separate repo at `~/projects/sawcity-lite`). Manages a 4-channel paid acquisition campaign targeting 2,000 users across 65 trade communities, each with its own `.city` domain. Deployed at **pumpcans.com**.

**This project is intentionally kept separate from sawcity-lite.** Only connection point is the `marketing_events` table (UTM attribution from signups).

## Quick Reference

- **Live:** https://pumpcans.com
- **Repo:** `jarrad1872/project-4h-dashboard`
- **Stack:** Next.js 16, TypeScript, Tailwind 4, Supabase, Gemini AI
- **Deploy:** Vercel auto-deploys on push to `main`
- **DB:** Supabase project `vzawlfitqnjhypnkguas`
- **Operating docs:** See `AGENTS.md` for full rules, `SOP-WORKFLOW.md` for processes, `TASKS.md` for active work

## Development Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build (sharp fails locally on Windows — works on Vercel)
npm test             # Vitest — 74 tests covering lib/ functions
npm run lint         # ESLint
```

## Hard Rules

1. **Never modify sawcity-lite.** It's a different project.
2. **Only push to `main`** — Vercel webhook is wired to `main`.
3. **Nothing goes live externally without Jarrad's approval.**
4. **Price is ALWAYS $79/mo** in ad copy.
5. **"14-day free trial, no credit card required"** in all ad copy.
6. **Trade-authentic copy only** — use trade-specific `.city` domains, never generic "Saw.City".
7. **TRADE_MAP rule:** New trades must be added to `lib/trade-utils.ts → TRADE_MAP` in the same commit. Missing entries silently fall back to `saw.city` badge.
8. **Verify before reporting done** — confirm deploys and DB changes with evidence.
9. **Run `npm test` before committing** code changes to lib/ files.

## Key Files

| File | Purpose |
|------|---------|
| `lib/types.ts` | Canonical TypeScript types |
| `lib/trade-utils.ts` | TRADE_MAP (64 trades), `tradeFromAd()` |
| `lib/server-utils.ts` | `normalizeAd()`, `adToDb()`, DB↔API mapping |
| `lib/api.ts` | CORS (restricted to pumpcans.com), response helpers |
| `lib/auth.ts` | Bearer token auth for API routes |
| `lib/rate-limit.ts` | In-memory rate limiter for AI endpoints |
| `lib/metrics.ts` | KPI calculations, scale/watch/kill signal |
| `lib/project-state-data.ts` | GTM board state (single source of truth) |
| `app/api/*/route.ts` | 18 API routes |
| `app/*/page.tsx` | 15 pages |
| `supabase/migrations/` | SQL migrations (run via Supabase SQL Editor or pg) |
| `lib/__tests__/` | Vitest test suites |

## Database

- **Connection:** `db.vzawlfitqnjhypnkguas.supabase.co:5432` (postgres)
- **Migrations:** Run in order via Supabase SQL Editor. Current: 001–007.
- **RLS:** Enabled on all tables (migration 007). Service role bypasses RLS.
- **Storage:** `ad-creatives` bucket (public)
- **Fallback:** JSON files in `/data/` when Supabase is unavailable (dev mode)

## Architecture Notes

- API routes use `okJson()`/`errorJson()` from `lib/api.ts` — CORS is handled there
- All routes call `requireAuth()` — auth passes through when no Bearer header (dashboard calls)
- AI endpoints (`/api/ai-creative`, `/api/creative/batch`, `/api/regen-creative`) are rate-limited
- `normalizeAd()` handles bidirectional snake_case ↔ camelCase
- Non-blocking side effects: Drive backup and activity logging use fire-and-forget pattern
