# Project 4H — Task Board

**Last updated:** 2026-03-12

---

## BLOCKED — Waiting on Jarrad

### TASK-002: Approve Generated Ad Variants
Generate 320 ads (`4h generate-copy --trades all --angles all`), then review at https://pumpcans.com/approval.
Ads now show angle badges (pain/solution/proof/urgency) and validation warnings.

### TASK-010: Archive Old NB2 Ads
Run `4h ads archive --campaign-group nb2` to archive the 1,040 old NB2 ads before generating replacements.

### TASK-003: Ad Account Setup
Create accounts: LinkedIn Campaign Manager, Meta Ads Manager, Google/YouTube Ads.

### TASK-004: Master Asset Review
https://pumpcans.com/creatives — verify visual consistency across 65 trades.

---

## READY TO DO

### ~~TASK-005: Apply Pending Doc Updates~~ (Done 2026-03-12)
Both items already covered by existing sections. AGENTS.md key files entry updated with fallback warning.

### TASK-006: Influencer Outreach
10 priority creators identified in `docs/influencer-outreach.md`. Outreach not started.
Start with lawn care (Mike Andes, Brian's Lawn) + HVAC (AC Service Tech, HVAC School).
Pipeline now trackable: `4h influencer seed` then `4h influencer list|update`.

### TASK-007: Seed Influencer Pipeline
Run `4h influencer seed` to populate the 10 creators from the shortlist into Supabase.
Then verify at https://pumpcans.com/influencer.

---

## DONE

### Security Hardening (2026-03-11)
- [x] CORS restricted to pumpcans.com (was wildcard)
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- [x] Error responses no longer leak AI prompts/model details
- [x] CSV formula injection fixed in both export functions
- [x] Rate limiting on AI endpoints (10/min single, 5/min batch)
- [x] Input validation with length limits on ad text fields
- [x] RLS enabled on all 11 tables, anon key read-only
- [x] DB indexes on workflow_stage, campaign_group, trade_slug, status
- [x] Vitest set up with 74 tests (lib/ coverage)
- [x] sharp added to package.json
- [x] .env.local.example updated with all used vars
- [x] CLAUDE.md created, CC memory system initialized
- [x] Migration 007 applied to production Supabase

### Dashboard Overhaul (2026-03-01)
- [x] All 15 pages built and live
- [x] 18 API routes operational
- [x] Bulk approval, creative picker, AI Studio, workflow pipeline

### Creative Production (NB2)
- [x] 195 NB2 images (Hero A/B/OG) for 65 trades
- [x] 130 additional images (C2/C3) for 65 trades
- [x] 1,040 ads inserted (65 trades x 2 directions x 8 variants)
- [x] Anti-slop audit passed on all 1,040 ads

### Ad Copy Generation Pipeline (2026-03-12)
- [x] TASK-001 resolved: new pipeline replaces NB2 ads with validated, trade-authentic copy
- [x] Trade copy context for 20 live trades (lib/trade-copy-context.ts)
- [x] Prompt templates for 4 angles x 4 platforms (lib/ad-copy-prompts.ts)
- [x] Ad copy validator with hard rules + soft warnings (lib/ad-copy-validator.ts)
- [x] Generation API endpoint POST /api/ads/generate (Gemini 2.0 Flash)
- [x] CLI commands: generate-copy, ads archive, context generate
- [x] Approval page: angle badges + validation warning display
- [x] DB columns: angle, validation_notes, generation_model added to ads table
- [x] Price updated: $79/mo → $39/mo across all docs and code
- [x] 40 new validator tests (136 total)

### Automation Engine (2026-03-12)
- [x] Telegram notifications (lib/telegram.ts, lib/notification-templates.ts)
- [x] Metrics batch endpoint + CLI ingest/import commands
- [x] Alert engine: Supabase tables, engine-logic.ts, VPS engine script
- [x] Weekly report endpoint + Telegram delivery (--send flag)
- [x] Morning command (4h morning) — single daily workflow check
- [x] Influencer pipeline: API, Kanban dashboard, CLI commands
- [x] Dynamic blockers + engine status on homepage
- [x] Migration 008 applied (alert_rules, engine_runs, influencer_pipeline)
- [x] 4h-engine.js deployed on Bob's VPS with cron (6h evaluate, daily/weekly reports)
- [x] 96 tests passing (22 new for engine-logic + notification-templates)
- [x] CLI expanded: notify, metrics ingest/import, engine, signals, morning, influencer, budget recommend

### Infrastructure
- [x] Next.js dashboard live at pumpcans.com
- [x] Supabase schema + seed (migrations 001-008)
- [x] Vercel auto-deploy on push to main
