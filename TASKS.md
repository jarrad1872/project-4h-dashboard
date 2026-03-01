# TASKS.md — Project 4H Active Work

**Updated:** 2026-03-01 (3-creative swap system + prompt-based regen)  
**Mission:** 2,000 users on Saw.City LITE across 65+ trades via 4-channel paid acquisition ($20K budget)

---

## 🟡 PENDING JARRAD ACTION

### TASK-002: Approve Trade Ad Variants
**Status:** WAITING ON JARRAD  
**Effort:** ~15 min  
**Link:** https://pumpcans.com/approval

1,040 NB2 ad variants (65 trades × 2 directions × 8 ads) sitting in approval queue.
Sorted Tier 1 first with yellow badges. Use "Approve All" per trade group.
- **Direction 1 (D1):** Pain/urgency — missed call = lost job
- **Direction 2 (D2):** Aspiration/social proof — contractors using X.city are booking more

> ⚠️ Note: These ads do NOT yet include "14-day free trial, no credit card required" messaging.
> Jarrad's call: approve as-is and patch later, or request a v2 pass first.

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
**Effort:** ~20 min  
**Link:** https://pumpcans.com/assets

**195 NB2 images staged for approval** across all 65 trades:
- Hero A (zoomed-in, ad use): `trade-heros/nb2/{slug}-hero-a.jpg`
- Hero B (wide top-down, landing page backdrop): `trade-heros/nb2/{slug}-hero-b.jpg`
- OG (link preview banner): `trade-ogs/nb2/{slug}-og.jpg`

All status: `pending`. Approve per slot on /assets page.

---

## 🔴 ACTIVE

### TASK-013: Add 14-Day Free Trial to Ad Copy
**Status:** READY TO RUN  
**Owner:** Bob  
**Priority:** P1

All 1,040 NB2 ads are missing "14-day free trial, no credit card required" — the key conversion hook.  
**Options:**
- A) Patch existing ads: update CTAs/primary_text to include trial messaging
- B) Generate v2 pass with trial messaging baked in from the start

**Next Action:** Jarrad chooses A or B → Bob executes

### TASK-014: Influencer Outreach — Start Top 3 Creators
**Status:** RESEARCH DONE, OUTREACH PENDING  
**Owner:** Jarrad (initiates), Bob (drafts messages)  
**Doc:** `docs/influencer-outreach.md`

Top 3 to cold-outreach immediately:
1. **Mike Andes** — lawn care, operator-focused audience
2. **Brian's Lawn Maintenance** — ~247K subs, pure contractor content
3. **AC Service Tech LLC** — HVAC, ~162K subs, pure technician audience

Deal: $10/mo per referral × up to 24 months ($240 max) + co-branded landing page (e.g. mow.city/ryanknorr)

**Bob's recommended additions:**
- Add flat $15 signup bonus on top of recurring (closes deals faster)
- Start with only 2-3 trades, not all 8 simultaneously
- Consider uncapped lifetime deal for top 3 as a closer

---

## 🔵 BACKLOG

### TASK-004: Domain Forwarding Setup (GoDaddy)
Configure forwarding at GoDaddy for duplicate/variant domains:
- `mechanic.city` → `wrench.city`
- `demolition.city` → `wreck.city`
- `bucket.city` → `excavation.city`
- `esthetics.city` → `esthetician.city`
- `answered.city` → `receptionist.city`

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

### TASK-015: Landing Pages for Upcoming Trades
Before upcoming-trade ads can go live, landing pages must exist:
1. Build landing page in sawcity-lite for the trade (Frank/dev)
2. Screenshot → feed to Nano Banana 2 for updated isometric creative
3. Replace placeholder hero with production hero
4. Campaign launch

Priority order: electrical → roofing → disaster-restoration → Tier 2 trades

### TASK-012: trade_assets Cleanup (Low Priority)
- Remove duplicate `mechanic` slug rows in trade_assets (artifact from early run)
- Storage folder name `trade-heros` (typo — `trade-heroes` would be correct), but URLs work, low priority

---

## 🟢 DONE (cumulative)

### Infrastructure
- [x] Full Next.js dashboard live at pumpcans.com (GitHub: jarrad1872/project-4h-dashboard)
- [x] Vercel auto-deploy via GitHub webhook (reconnected, verified)
- [x] Supabase schema: ads, ad_templates, marketing_events, lifecycle, checklist, trade_assets
- [x] All 13 pages return 200 and pass visual audit
- [x] `005_trade_assets.sql` migration applied
- [x] trade_assets check constraint expanded (hero_a, hero_b, og_nb2 now allowed)
- [x] /ads page paginated (30/page) + lazy loading — fixes browser choke on large dataset
- [x] Ad copy hard rules documented in AGENTS.md

### NB2 Creative Variants (C1/C2/C3) — 3 Swappable Images per Trade 🔄
- [x] **3-slot creative picker** on /ads page — click C1/C2/C3 thumbnail to swap; auto-saves `creative_variant` to DB
- [x] **`creative_variant` column** added to ads table (INT DEFAULT 1, CHECK IN (1,2,3)) — Jarrad ran SQL 2026-03-01
- [x] **Prompt-based regen modal** — pencil icon ✏️ on each slot → edit modal with Gemini NB2 → overwrite in Storage → live preview → "Use This"
- [x] **`/api/regen-creative`** endpoint — POST `{storagePath, prompt}` → Gemini NB2 → Supabase Storage upsert → returns cache-busted URL
- [x] **`getCreativeUrls(prefix, heroAUrl)`** helper in `lib/trade-utils.ts` — returns `{c1, c2, c3}` URLs per trade
- [x] **`creativeUrlOverrides`** state — C2/C3 updates after regen apply immediately to card without full reload
- [ ] **130 new images generating** — C2 (company overview) + C3 (on-site action wide shot) for all 65 trades → ~34/130 done at time of writing (sub-agent running, auto-announces on completion)

**Creative types:**
- **C1** = hands-on zoomed-in scene (= existing `hero_a`, no regeneration needed)
- **C2** = company overview — shop, trucks, equipment, office, staff — bird's-eye isometric
- **C3** = on-site action wide shot — full job site, multiple workers, equipment in use

**Storage paths:**
- C1: `trade-heros/nb2/{slug}-hero-a.jpg` (existing)
- C2: `nb2-creatives/{prefix}-c2.jpg`
- C3: `nb2-creatives/{prefix}-c3.jpg`

**How to edit a bad image:** Go to /ads → find any ad for that trade → click ✏️ on the offending slot → describe the fix → Generate → Use This. Overwrites storage permanently.

### NB2 Image Generation — All 65 Trades ✅
- [x] Image Agent A: 60/60 images for 20 live trades (hero_a + hero_b + og_nb2)
- [x] Image Agent B: 66/66 images for 22 upcoming Tier 1+2 trades
- [x] Image Agent C: 69/69 images for 23 Tier 3 trades
- [x] **195 total NB2 images** in Supabase Storage, 195 trade_assets rows registered
- [x] Model: `gemini-3.1-flash-image-preview` (Nano Banana 2)
- [x] Storage paths: `trade-heros/nb2/` (hero_a/b) and `trade-ogs/nb2/` (og_nb2)
- [x] trade_assets asset_types: `hero_a`, `hero_b`, `og_nb2` for all 65 trades

### NB2 Ad Copy Generation — All 65 Trades ✅
- [x] 1,040 NB2 ads inserted: 65 trades × 2 directions × 8 ads
- [x] D1 (pain/urgency): missed call = lost job, trade-specific moment of unavailability
- [x] D2 (aspiration/social proof): transformation, before/after, "contractors using X.city are booking more"
- [x] Trade-authentic vocabulary (no mechanical substitution — audited)
- [x] $79/mo throughout, correct landing_path, image_url → hero_a URL
- [x] Campaign group format: `nb2_d{1|2}_{platform}_{prefix}`
- [x] Anti-slop audit script at `scripts/audit-ads.mjs` — must pass 🟢 before any batch is done

### Influencer Outreach Research ✅
- [x] `docs/influencer-outreach.md` — 386 lines, 40+ channels researched, 8 Tier 1 trades covered
- [x] Outreach email template (peer-to-peer tone, not corporate)
- [x] Deal structure one-pager
- [x] Priority hit list: top 10 creators ranked by contractor audience × reach × conversion

### Earlier Milestones
- [x] 27 Saw.City branded seed ads (4 platforms + retargeting)
- [x] 81 trade variants: RINSE×27, MOW×27, ROOTER×27
- [x] Core strategy doc, operating pack, approval ledgers, lifecycle messaging
- [x] /approval page: Approve/Hold/Reject, Bulk Approve, tier-sorted, per-trade stats
- [x] /assets page: hero + OG staging, approve/reject per slot
- [x] /gtm page: 2,000-user mission, TAM-ranked trade registry, action board
- [x] /ads page: full library view + pagination
- [x] excavation.city demoted to Tier 2 ($90B, not $200B — corrected bias)
- [x] 72-domain trade registry in project-state-data.ts
- [x] Drive asset originals: 20 live trade hero + OG sourced + uploaded to Storage
- [x] Tier 1 upcoming (electrical/roofing/disaster): Nano Banana Pro heroes approved by Jarrad
- [x] TRADE_MAP expanded with all Tier 1-3 trades + tier field
- [x] **TRADE_MAP complete — all 65 trade prefixes registered** (commit `820719f`, Feb 28 2026)
  - All prefixes: alignment, appraisals, bartender, bodyshop, bookkeeper, brake, carpetcleaning, cater, chimney, coat, detail, directional, disaster, drywall, duct, electricians, esthetician, excavation, finish, fireprotection, grade, groom, grout, haul, hitch, housecleaning, hydrovac, inspection, insulation, lawfirm, locating, lockout, metalworks, mold, mow, nail, pane, pave, pest, pipe, plank, plow, polish, poolservice, portrait, privatechef, prune, refrigeration, remodels, renewables, rinse, rolloff, roofrepair, rooter, saw, sentry, septic, shrink, siding, stamped, taxprep, trowel, wreck, wrench
  - `tradeFromAd()` upgraded: checks utm_campaign + campaign_group, handles last-segment and second-to-last-segment patterns — no more saw.city fallback for unrecognized trades

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
| Ad Library | https://pumpcans.com/ads |
| Creatives | https://pumpcans.com/creatives |
| Influencer Research | `docs/influencer-outreach.md` |
| Supabase DB | https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas |
| GitHub | https://github.com/jarrad1872/project-4h-dashboard |
| Audit Script | `scripts/audit-ads.mjs` |
