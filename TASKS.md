# TASKS.md — Project 4H Active Work

**Updated:** 2026-02-28  
**Mission:** 2,000 users on Saw.City LITE across 20+ trades via 4-channel paid acquisition ($20K budget)

---

## 🟡 PENDING JARRAD ACTION

### TASK-002: Approve Trade Ad Variants
**Status:** WAITING ON JARRAD  
**Effort:** ~10 min  
**Link:** https://pumpcans.com/approval

189 trade ad variants sitting in the approval queue, now sorted Tier 1 first with yellow badges.
Use "Approve All" per trade group. Tier 1 trades (pipe/mow/coat/duct/pest + electricians/roofrepair/disaster) are at the top.

### TASK-003: Ad Account Setup
**Status:** WAITING ON JARRAD  
**Effort:** 30–45 min with Bob  

Create accounts for:
- LinkedIn Campaign Manager
- Meta Ads Manager (Facebook + Instagram)
- Google Ads (YouTube)

Bob walks through each setup guide. Required before any campaign launches.

### TASK-010: Approve Trade Assets
**Status:** WAITING ON JARRAD  
**Effort:** ~15 min  
**Link:** https://pumpcans.com/assets

46 hero + OG images staged for approval (23 trades × 2 image types).  
20 live trades: sourced from Drive originals ✅  
3 Tier 1 upcoming (electricians/roofrepair/disaster): generated via Gemini Nano Banana Pro ✅  
Approve/reject per slot on the /assets page.

---

## 🔴 ACTIVE

### TASK-011: Generate Hero + OG for Remaining Upcoming Trades
**Status:** READY TO RUN  
**Owner:** Bob  
**Priority:** P1

23 trades have assets. Remaining upcoming trades with no hero/OG yet (generate when Jarrad gives the go):

**Tier 2 upcoming:**
- excavation.city (grading/earthwork, $90B, strategic — Kippen's trade)
- remodels.city (remodeling, $500B+)
- siding.city ($15B)
- poolservice.city
- housecleaning.city
- carpetcleaning.city
- mold.city
- septic.city
- rolloff.city
- hydrovac.city
- locating.city

**Tier 3 upcoming:**
- fireprotection.city, taxprep.city, bookkeeper.city, refrigeration.city, windshield.city
- bodyshop.city, metalworks.city, groom.city, nail.city, stamped.city, trowel.city
- plank.city, finish.city, grout.city, directional.city, alignment.city, inspection.city
- pane.city, lawfirm.city, bartender.city, cater.city, portrait.city, privatechef.city
- tattoo.city, shrink.city, sentry.city, hitch.city, drywall.city, insulation.city, gc.city

**Next Action:** Jarrad confirms priority order → Bob batch-generates and uploads

---

## 🟢 DONE (cumulative)

### Infrastructure
- [x] Full Next.js dashboard live at pumpcans.com (GitHub: jarrad1872/project-4h-dashboard)
- [x] Vercel auto-deploy via GitHub webhook (reconnected, verified)
- [x] Supabase schema: ads, ad_templates, marketing_events, lifecycle, checklist, trade_assets
- [x] All 13 pages return 200 and pass visual audit
- [x] `005_trade_assets.sql` migration applied by Jarrad

### Ad Content
- [x] 27 Saw.City branded ads approved (4 platforms + retargeting)
- [x] 81 trade variants: RINSE×27, MOW×27, ROOTER×27 — pending approval
- [x] 108 ads linked to image_url in Supabase Storage
- [x] Tier 1 ad variants generated: pipe×27, coat×27, duct×27, pest×27, mow×27
- [x] Tier 1 upcoming ad copy: electricians×27, roofrepair×27, disaster×27 (placeholder images)
- [x] `workflow_stage` patched: concept for all pending, approved for approved

### Approval UI
- [x] /approval page rebuilt — reads ads table, Approve/Hold/Reject, Bulk Approve All per trade
- [x] Approval sorted by tier (Tier 1 first) with yellow TIER 1 badges
- [x] TRADE_MAP expanded: coat, duct, pest, electricians, roofrepair, disaster all properly labelled

### Creative Assets
- [x] 16 ad creatives (Phase 1) in Supabase Storage
- [x] /creatives page live
- [x] /assets page live — hero + OG staging per trade, approve/reject workflow
- [x] 20 live trade heroes uploaded to Supabase Storage (trade-heros/)
- [x] 20 live trade OG images uploaded to Supabase Storage (trade-ogs/)
- [x] 3 Tier 1 upcoming heroes generated + uploaded (electrical, roofing, disaster-restoration)
- [x] 3 Tier 1 upcoming OG images generated + uploaded
- [x] 46 trade_assets rows live with image_url, status: pending

### GTM Board
- [x] /gtm page: 2,000-user mission banner, TAM-ranked trade registry, action board
- [x] Trade registry: 72 total domains (20 live + 44 upcoming + 5 forwarding + 3 platform)
- [x] excavation.city demoted to Tier 2, $90B TAM (was inflated $200B Tier 1)
- [x] Status column with color-coded badges (LIVE/UPCOMING/→forward/PLATFORM)

### Drive Asset Sources (locked)
- Hero originals: https://drive.google.com/drive/folders/1WjD0Ytf611A_5KLjUBecDS_VssM-12i0
- OG originals: https://drive.google.com/drive/folders/1HwGepsNQZt_QXrs8_2NLQmVPI5hjbFLD
- Local path: projects/sawcity-lite/docs/project-4h/creative-assets/{hero-originals,og-originals}/

---

## 🔵 BACKLOG

### TASK-007: A2P 10DLC Approval
Waiting on TCR. Registered 2026-02-22. ETA: 2–3 weeks.  
Campaign ID: `QE2c6890da8086d771620e9b13fadeba0b`  
SMS lifecycle sequences unblocked after approval.

### TASK-008: Upload-Ready Campaign Packages
Once ad accounts are live and ads approved, package each trade's ads with:
- Creative file + UTM-tagged URLs
- Platform-specific targeting specs
- Upload CSV per platform
- Budget allocation per trade per platform

### TASK-009: Domain Forwarding Setup (GoDaddy)
- mechanic.city → wrench.city
- demolition.city → wreck.city
- bucket.city → excavation.city
- esthetics.city → esthetician.city
- answered.city → receptionist.city

### TASK-012: trade_assets Cleanup
- Remove duplicate `mechanic` slug rows in trade_assets (artifact from early run)
- Fix storage folder name typo `trade-heros` → `trade-heroes` (low priority, URLs work)

---

## Campaign Budget

| Platform | Budget | Status |
|----------|--------|--------|
| LinkedIn | $5,000 | Pending account |
| YouTube  | $5,000 | Pending account |
| Facebook | $5,000 | Pending account |
| Instagram| $5,000 | Pending account |
| **Total**| **$20,000** | Pre-launch |

**Kill/Scale thresholds:** CPL > $40 → kill | CPL < $20 + 5 sign-ups → double | CTR < 0.3% after 1K impressions → pause creative

---

## Key Links

| Resource | URL |
|----------|-----|
| Dashboard | https://pumpcans.com |
| GTM Board | https://pumpcans.com/gtm |
| Approval Queue | https://pumpcans.com/approval |
| Trade Assets | https://pumpcans.com/assets |
| Creatives | https://pumpcans.com/creatives |
| Supabase DB | https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas |
| GitHub | https://github.com/jarrad1872/project-4h-dashboard |
