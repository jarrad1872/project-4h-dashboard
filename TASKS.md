# Project 4H — Task Board

## 🔴 CRITICAL PATH (Next 24–48h)

### TASK-001: Trial Messaging Strategy
**Status:** BLOCKED (Waiting on Jarrad)  
**Effort:** ~5 min  
**Constraint:** Rule #5 (Price ALWAYS $79/mo)  

1,040 NB2 ads generated without "14-day free trial, no credit card required" messaging.
**Options:**
- **A:** Patch existing ads (Bob writes a script to append messaging to primary text).
- **B:** Generate v2 pass (higher quality, baked-in messaging, costs more context/tokens).

---

## 🟡 PENDING JARRAD ACTION

### TASK-002: Approve Trade Ad Variants
**Status:** WAITING ON JARRAD  
**Effort:** ~10 min (using Bulk Approve)  
**Link:** https://pumpcans.com/approval

1,040 NB2 ad variants sitting in approval queue.
Use the new **"Approve All X Pending"** button to sign off on the whole batch at once.

### TASK-003: Ad Account Setup
**Status:** WAITING ON JARRAD  
**Effort:** 30–45 min with Bob  

Ad accounts need to be created:
1. **LinkedIn:** Campaign Manager
2. **Meta:** Ads Manager (Facebook/Instagram)
3. **Google:** YouTube Ads

### TASK-004: Master Asset Review
**Status:** READY FOR REVIEW  
**Effort:** ~5 min  
**Link:** https://pumpcans.com/creatives

All 65 trades now have verified master assets (Hero A/B, OG, C2, C3) staged in the gallery.
Verify visual consistency.

---

## ✅ DONE (Historical)

### Dashboard Overhaul (2026-03-01) 🚀
- [x] **Command Center (Home)** — Live stats, blockers board, platform cards.
- [x] **Ads Manager** — Creative picker, edit modal, pagination, lazy loading.
- [x] **Approval Queue** — Server-side bulk approval (`POST /api/ads/bulk-status`).
- [x] **Budget & Pacing** — Inline edits, burn rate bars, kill/scale thresholds.
- [x] **GTM Strategy** — Live ad counts per trade registry.
- [x] **KPI Scorecard** — Date picker, totals row, all-time summaries.
- [x] **Workflow Pipeline** — Funnel view, bulk advance (50/batch), trade progress table.
- [x] **Lifecycle Messaging** — Card layout, timing stages, active/paused filters.
- [x] **Launch Gate** — Per-platform progress, hard blockers, launch sequence.
- [x] **Asset Staging** — 5 slots (Hero A/B, OG, C2, C3), base64 uploads, storage support.
- [x] **Master Gallery** — High-end verified asset library for all 65 trades.
- [x] **AI Studio** — Nano Banana 2 (Gemini 3.1 Flash) integration, "Push to Assets" button.
- [x] **Backend Infrastructure** — Consolidated `TRADE_MAP`, Base64 storage API, Unified Bulk Update API.

### Infrastructure
- [x] Full Next.js dashboard live at pumpcans.com (GitHub: jarrad1872/project-4h-dashboard)
- [x] Supabase schema + seed applied (ads, ad_templates, marketing_events, lifecycle, checklist, trade_assets)
- [x] Vercel auto-deploy working (GitHub webhook reconnected)
- [x] trade_assets check constraint expanded to allow hero_a, hero_b, og_nb2

### Creative Production (NB2)
- [x] **Hero A + B + OG Pass** — 195/195 images generated + uploaded for all 65 trades.
- [x] **C2 + C3 Pass** — 130/130 images generated + uploaded for all 65 trades.
- [x] **Ad Copy Pass** — 1,040/1,040 ads inserted (65 trades × 2 directions × 8 ads).
- [x] **Anti-slop Audit** — all 1,040 ads passed `audit-ads.mjs`.
