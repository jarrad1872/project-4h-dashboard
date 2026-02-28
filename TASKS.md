# TASKS.md — Project 4H Active Work

**Updated:** 2026-02-28  
**Mission:** 2,000 users on Saw.City LITE across 20+ trades via 4-channel paid acquisition ($20K budget)

---

## 🔴 ACTIVE

### TASK-001: Tier 1 Campaign Pivot
**Status:** IN PROGRESS  
**Owner:** Bob (sub-agent)  
**Priority:** P0

The campaign is pivoting from saw/rinse/mow/rooter to TAM-ranked Tier 1 trades: **pipe, mow, coat, duct, pest**.

**Definition of Done:**
- [ ] 27 ad variants generated for pipe.city (6 LinkedIn, 7 YouTube, 4 Facebook, 4 Instagram, 6 retargeting)
- [ ] 27 ad variants generated for coat.city
- [ ] 27 ad variants generated for duct.city
- [ ] 27 ad variants generated for pest.city
- [ ] mow.city already has 27 variants — review existing vs. regenerating
- [ ] All variants uploaded to Supabase `ads` table with status `pending`
- [ ] Creative briefs seeded into `ad_templates` table
- [ ] All appear in `/approval` page for Jarrad review

**Next Action:** Generate pipe.city ad variants (27 ads × 4 platforms)

**Trade Context:**
- pipe.city → Plumbing → $191B US market, 130K businesses, emergency calls 24/7
- coat.city → Painting → $28B US market, 220K businesses (largest operator count)
- duct.city → HVAC → $30B US market, 105K businesses, emergency demand
- pest.city → Pest Control → $26B US market, 33K businesses, recurring revenue

---

## 🟡 PENDING JARRAD ACTION

### TASK-002: Approve Trade Ad Variants
**Status:** WAITING ON JARRAD  
**Effort:** ~10 min  
**Link:** https://pumpcans.com/approval

78 trade ad variants (Rinse/Mow/Rooter) sitting in the approval queue. These are the original Phase 1 trade variants — still valid for those trades even after the pivot. Use "Approve All" per trade group.

---

### TASK-003: Ad Account Setup
**Status:** WAITING ON JARRAD  
**Effort:** 30–45 min with Bob  

Create accounts for:
- LinkedIn Campaign Manager
- Meta Ads Manager (Facebook + Instagram)
- Google Ads (YouTube)

Bob walks through each setup guide. Required before any campaign launches.

---

## 🟢 DONE

- [x] Core strategy + operating pack v1
- [x] 27 Saw.City branded ads approved (6 LI, 7 YT, 4 FB, 4 IG, 6 retargeting)
- [x] 81 trade variants uploaded (RINSE×27, MOW×27, ROOTER×27) — pending approval
- [x] Supabase schema live (ads, ad_templates, marketing_events, lifecycle, checklist)
- [x] 16 ad creatives generated (Tier 1 Phase 1) — in Supabase Storage
- [x] `/approval` page rebuilt — reads ads table, Approve/Hold/Reject, Bulk Approve All per trade
- [x] `/creatives` page live — shows all 16 creative thumbnails
- [x] `/gtm` page live — 2,000-user mission banner, product state, trade registry, action board
- [x] Trade registry expanded to 72 domains (20 live + 45 upcoming + 5 forwarding + 3 platform)
- [x] Trade tier re-ranking — TAM-based, Tier 1 = pipe/mow/coat/duct/pest
- [x] `image_url` column added to ads table, 108 ads linked to creatives
- [x] Vercel auto-deploy fixed — GitHub webhook reconnected
- [x] `workflow_stage` patched: 78 concept + 27 approved + 3 uploaded
- [x] Pause toggle working on /ads page
- [x] marketing_events table live in 4H Supabase DB
- [x] AGENTS.md, TASKS.md, README.md created
- [x] `003_dashboard_v2.sql` migration applied

---

## 🔵 BACKLOG

### TASK-004: Phase 2 Creative Generation
Generate ad creatives (images) for the new Tier 1 trades using Nano Banana Pro (Gemini):
- pipe.city creative (4 platform sizes)
- coat.city creative (4 platform sizes)
- duct.city creative (4 platform sizes)
- pest.city creative (4 platform sizes)

### TASK-005: Phase 2 Upcoming Trades (crimp/eave/excavation/disaster)
Once these trades are live in the sawcity-lite app, generate full 27-ad campaigns for each.
- crimp.city → Electrical ($220B)
- eave.city → Roofing ($56B)
- excavation.city → Excavation ($200B)
- disaster.city → Disaster Restoration ($210B)

### TASK-006: Fix Vercel Auto-Deploy (low priority)
GitHub webhook was reconnected but monitor for reliability. Fallback: `bash deploy.sh`.

### TASK-007: A2P 10DLC Approval
Waiting on TCR. Registered 2026-02-22. ETA: 2-3 weeks. SMS lifecycle unblocked after approval.
Campaign ID: `QE2c6890da8086d771620e9b13fadeba0b`

### TASK-008: Upload-Ready Campaign Packages
Once ad accounts are live and ads approved, package each trade's ads with:
- Creative file + UTM-tagged URLs
- Platform-specific targeting specs
- Upload CSV per platform
- Budget allocation per trade per platform

### TASK-009: Domain Forwarding Setup
Configure DNS forwarding for duplicate/variant domains:
- mechanic.city → wrench.city
- demolition.city → wreck.city
- bucket.city → excavation.city
- esthetics.city → esthetician.city
- answered.city → receptionist.city

---

## Campaign Budget Allocation (Current)

| Platform | Budget | Status |
|----------|--------|--------|
| LinkedIn | $5,000 | Pending account |
| YouTube | $5,000 | Pending account |
| Facebook | $5,000 | Pending account |
| Instagram | $5,000 | Pending account |
| **Total** | **$20,000** | Pre-launch |

### Kill/Scale Thresholds (from Operating Pack v1)
- **Kill:** CPL > $40 after $500 spend on a platform
- **Scale:** CPL < $20 AND 5+ sign-ups → double budget
- **Pause creative:** CTR < 0.3% after 1,000 impressions

---

## Key Links

| Resource | URL |
|----------|-----|
| Dashboard | https://pumpcans.com |
| GTM Board | https://pumpcans.com/gtm |
| Approval Queue | https://pumpcans.com/approval |
| Creatives | https://pumpcans.com/creatives |
| Workflow | https://pumpcans.com/workflow |
| Supabase DB | https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas |
| Saw.City LITE (prod) | https://sawcity-lite.vercel.app |
| GitHub | https://github.com/jarrad1872/project-4h-dashboard |
