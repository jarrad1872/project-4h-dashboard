# SOP: Project 4H Dashboard — Operating Model

**Last updated:** 2026-02-28  
**Dashboard:** https://pumpcans.com  
**Repo:** `jarrad1872/project-4h-dashboard`

> **⚠️ THE MISSION: 2,000 USERS ON SAW.CITY LITE.**  
> Not 1,000. Not "customers." 2,000 users. This number never changes without Jarrad explicitly saying so.  
> **65 trades, each marketed under its own `.city` domain independently.**

---

## Core Principle

> **The dashboard is the view layer. Bob is the engine.**

```
Jarrad (Telegram) → Bob → generates/updates → pumpcans.com shows result
```

Jarrad issues commands in plain language. Bob does the work. Dashboard reflects state.

---

## Operating Model

| Who | Role |
|-----|------|
| Jarrad | Commands via Telegram, approves at pumpcans.com |
| Bob (AI) | Generates copy/images, uploads to DB, populates dashboard |
| Dashboard | Read-only view of campaign state — not a work tool |

---

## AD COPY SOPs

### Hard Rules (Non-Negotiable)
1. **Price is ALWAYS $79/mo** — never $99, $149, $199, or any other amount.
2. **"14-day free trial, no credit card required"** must appear in every ad in some form.
3. **Trade-authentic copy only** — mechanical find-and-replace fails the anti-slop audit. Each trade needs its own vocabulary.
4. **Never use "Saw.City" as a catch-all brand** — ads use the trade-specific `.city` domain (rinse.city, mow.city, etc.).
5. **UTM format:** `utm_campaign=nb2_d{1|2}_{platform}_{prefix}`, `utm_source={platform}`, `utm_medium=paid-social`

### The 2-Direction Strategy
Every trade gets ad copy in 2 directions:
- **D1 — Pain/Urgency:** Missed call = lost job. The specific moment a contractor can't answer (mid-cut, mid-pour, mid-pick). Hook is the pain of that missed call.
- **D2 — Aspiration/Social Proof:** Transformation. "Contractors using X.city are booking more." Before/after angle. Hook is what winning looks like.

27 variants per direction → 54 ads per trade in the full library.  
Current NB2 run: 8 variants per direction → 16 ads per trade (1,040 total).

### Platform Breakdown (per direction)
| Platform | Format | Variants |
|----------|--------|---------|
| LinkedIn | static 1x1 awareness + retargeting | 3 awareness + 3 retarget |
| LinkedIn | video | 2 |
| Facebook | static 4x5 awareness + retargeting | 5 awareness + 2 retarget |
| Instagram | square awareness + retargeting | 5 awareness + 2 retarget |
| YouTube | video | 5 |
| **Total** | | **27 per direction** |

### Ad ID Format
```
NB2-D{1|2}-{LI|FB|IG|YT}-{CODE}{AW|RT}
```
Campaign group: `nb2_d{1|2}_{platform}_{prefix}`  
Image URL: points to `trade-heros/nb2/{slug}-hero-a.jpg`

---

## IMAGE GENERATION SOPs

### Model: Nano Banana 2 (NB2)
- **Model ID:** `gemini-3.1-flash-image-preview`
- Released Feb 26, 2026. Replaces `gemini-3-pro-image-preview` for all new generation.
- Output: ~1.4–1.9MB JPEG, higher quality + faster than Pro model.
- Install: `npm install @google/genai`

### 3-Image Structure Per Trade
Every trade gets exactly 3 NB2 images:

| Type | asset_type | Storage Path | Use |
|------|-----------|--------------|-----|
| **Hero A** | `hero_a` | `trade-heros/nb2/{slug}-hero-a.jpg` | Ads / scroll-stoppers — zoomed-in hands-on scene |
| **Hero B** | `hero_b` | `trade-heros/nb2/{slug}-hero-b.jpg` | Landing page backdrop — wide bird's-eye top-down view |
| **OG** | `og_nb2` | `trade-ogs/nb2/{slug}-og.jpg` | Link preview banner — domain + "AI answers your calls." + $79/mo |

### Image Prompt Templates

**Hero A (zoomed-in ad hero):**
```
Professional isometric 3D illustration, Blender-quality render. {CLOSE_UP_SCENE}. 
Style: Pixar-inspired isometric diorama. Rich saturated colors. Deep dark navy #0f172a background. 
Three-point studio lighting. Detailed textures: {TEXTURES}. No text. No logos. 
Centered square composition. High resolution.
```

**Hero B (wide top-down landing page backdrop):**
```
Professional isometric 3D illustration, Blender-quality render. Wide-angle elevated bird's-eye 
isometric view of {WIDE_SCENE} — full business operation with multiple crew, vehicles, equipment. 
Style: Pixar-inspired. Rich saturated colors. Deep dark navy #0f172a background. 
Overhead cinematic lighting. No text. No logos. High resolution.
```

**OG (link preview banner):**
```
Clean professional marketing banner, landscape wider than tall. Left: large bold '{DOMAIN}' white 
on dark navy #0f172a. Below: 'AI answers your calls.' in {BRAND_COLOR}. Right: small isometric 
icon of {BRIEF_SCENE}. Far right: '$79/mo' white. Navy background with {BRAND_COLOR} radial glow. 
Modern minimal tech brand.
```

### Upload Spec
```
POST /storage/v1/object/ad-creatives/{path}
Headers: Content-Type: image/jpeg, x-upsert: true, Authorization: Bearer {SERVICE_KEY}
```

### trade_assets Upsert
```
POST /rest/v1/trade_assets
Prefer: resolution=merge-duplicates,return=minimal
Body: { trade_slug, asset_type, image_url, status: "pending" }
```

### ⚠️ Creative Workflow for Upcoming Trades
Upcoming trades have NO landing pages → cannot build real isometric creatives using app screenshots.

**Sequence:**
1. Frank/dev builds trade landing page in sawcity-lite
2. Screenshot the landing page
3. Feed screenshot + NB2 prompt → isometric hero
4. Upload to Supabase Storage (replaces placeholder)
5. Update trade_assets row
6. Campaign launch

**Rule:** Upcoming-trade ads are copy-ready only until step 4 is complete.

---

## TRADE_MAP — Maintenance Rule

**File:** `lib/trade-utils.ts` → `TRADE_MAP`

The TRADE_MAP is the single source of truth for trade badge rendering on `/ads`, `/approval`, and any page that calls `tradeBadge()`. If a trade prefix is missing, **all ads for that trade show `saw.city` as the badge — a silent, confusing bug.**

### Hard Rule: Keep TRADE_MAP in sync with every new trade added
Whenever a new trade is added to the campaign (new ads inserted, new `.city` domain registered), the corresponding prefix **must** be added to TRADE_MAP in the same commit. No exceptions.

### Current state (2026-02-28, commit `820719f`): **65 trade prefixes registered**
```
alignment, appraisals, bartender, bodyshop, bookkeeper, brake, carpetcleaning,
cater, chimney, coat, detail, directional, disaster, drywall, duct, electricians,
esthetician, excavation, finish, fireprotection, grade, groom, grout, haul, hitch,
housecleaning, hydrovac, inspection, insulation, lawfirm, locating, lockout,
metalworks, mold, mow, nail, pane, pave, pest, pipe, plank, plow, polish,
poolservice, portrait, privatechef, prune, refrigeration, remodels, renewables,
rinse, rolloff, roofrepair, rooter, saw, sentry, septic, shrink, siding, stamped,
taxprep, trowel, wreck, wrench
```

### How `tradeFromAd()` works (as of Feb 28):
1. Checks `utm_campaign` and `campaign_group` fields
2. For each: looks for `_key_` in the middle OR `_key` at the end
3. Fallback: checks last segment after `_`, then second-to-last (handles `nb2_2026-03_trowel_d2`)
4. Final fallback: checks `landing_path`
5. Returns `"saw"` only if genuinely no match found

---

## ANTI-SLOP AUDIT GATE

**Rule:** Run `scripts/audit-ads.mjs` before reporting ANY generation batch as done.  
Never say "done" without 🟢 output from the audit.

```bash
node scripts/audit-ads.mjs
```

Checks:
- image_url slug matches trade slug
- landing_path matches domain prefix
- $79/mo present (not $99, $149, etc.)
- No blank headlines
- Trade vocabulary signals present in copy (not find-and-replace slop)

If audit fails → fix the flagged ads → re-run → 🟢 → report done.

---

## INFLUENCER OUTREACH SOP

**Deal structure:**
- Creator promotes their trade's `.city` domain to their contractor audience
- Unique referral code + co-branded landing page (e.g. `mow.city/ryanknorr`)
- Commission: $10/mo per referred contractor × up to 24 months ($240 max per referral)
- Optional closer for top-tier creators: lifetime uncapped + flat $15/signup bonus

**Outreach tone:** Peer-to-peer, operator-to-operator. Never corporate.  
> "We built this for guys like your audience" — not "we'd like to leverage your platform"

**Priority contacts** (see `docs/influencer-outreach.md` for full list + contact info):
1. Mike Andes (lawn care)
2. Brian's Lawn Maintenance (~247K, pure contractor)
3. AC Service Tech LLC (HVAC, ~162K, pure technician audience)

**Start small:** Lawn care + HVAC first. Learn. Then expand to other trades.

**Weak YouTube verticals** (use podcasts/trade media instead):
- Pest control — no dominant 100K+ contractor creator
- Painting — thin on YouTube

---

## APPROVAL WORKFLOW

### Trade Assets (pumpcans.com/assets)
1. Bob generates → uploads to Supabase Storage → upserts trade_assets row (status: pending)
2. Jarrad reviews at /assets — sees image, approves or rejects per slot
3. Bob notes approved assets for ad creative reference

### Ad Copy (pumpcans.com/approval)
1. Bob generates + inserts to ads table (status: pending, workflow_stage: concept)
2. Jarrad reviews at /approval — sorted by tier (Tier 1 first, yellow badge)
3. Bulk Approve All per trade group — or individually reject problem ads
4. Approved ads move to workflow_stage: approved

### Nothing Goes Live Until:
- [ ] Trade assets approved (pumpcans.com/assets)
- [ ] Ad copy approved (pumpcans.com/approval)
- [ ] Ad accounts set up (LinkedIn CM, Meta, Google)
- [ ] 14-day trial messaging confirmed in all copy
- [ ] Jarrad explicitly says "launch"

---

## TECH STACK

| Layer | What |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Storage + PostgREST), 13 API routes |
| AI Copy Gen | Gemini 2.5 Flash (`/api/generate` route) |
| AI Image Gen | Gemini 3.1 Flash Image — Nano Banana 2 (`gemini-3.1-flash-image-preview`) |
| Domain | pumpcans.com (GoDaddy DNS → Vercel) |
| Deploy | Vercel — auto-deploy on push to `main` in `jarrad1872/project-4h-dashboard` |
| Campaign DB | Supabase project `vzawlfitqnjhypnkguas` |
| Storage bucket | `ad-creatives` (public) |

---

## CAMPAIGN SCOPE

| Tier | Trades | Status |
|------|--------|--------|
| **Tier 1** | concrete-cutting, pressure-washing, lawn-care, drain-cleaning, plumbing, pest-control, hvac, painting + electrical, roofing, disaster-restoration | NB2 images ✅, copy ✅, ads pending approval |
| **Tier 2** | auto-body, drywall, excavation, house-cleaning, insulation, welding, flooring, refrigeration, remodeling, solar, security-alarms, therapy + 9 more | NB2 images ✅, copy ✅, no landing pages yet |
| **Tier 3** | 23 remaining trades (esthetics, finish-carpentry, towing, hydrovac, etc.) | NB2 images ✅, copy ✅, no landing pages yet |

**Total: 65 trades, 195 NB2 images, 1,040 NB2 ads — all pending approval**

---

## CREATIVE VARIANTS SYSTEM

Each trade has **3 swappable isometric ad images** on `/ads`. Every ad card has a 3-slot thumbnail picker + a pencil ✏️ edit button per slot.

| Slot | Type | Storage Path | Description |
|------|------|-------------|-------------|
| **C1** | Hands-on zoom | `trade-heros/nb2/{slug}-hero-a.jpg` | Existing hero_a — tight on hands/tool/moment |
| **C2** | Company overview | `nb2-creatives/{prefix}-c2.jpg` | Shop, trucks, equipment, staff — bird's-eye |
| **C3** | On-site action wide | `nb2-creatives/{prefix}-c3.jpg` | Full job site, multiple workers, equipment in use |

**Swapping:** Click any C1/C2/C3 thumbnail on an ad card → persists to DB (`creative_variant` column, INT 1-3).

**Editing a bad image:**
1. Go to `/ads`, find an ad for the trade
2. Click ✏️ on the offending slot
3. Type a full description of the correct image (describe the scene from scratch for best results)
4. Hit **Generate** (~15-30 sec Gemini NB2)
5. Preview → **Use This** → overwrites Supabase Storage permanently, updates card live

**Prompt tips:**
- Describe the full scene, not just the fix: "painter on extension ladder brushing house siding, window glass is clean and unpainted, water-based paint, morning light"
- The style suffix is auto-appended: isometric 3D, Pixar-inspired, dark navy background — don't add it yourself
- If still wrong: regenerate again with more specific constraints

**API:** `POST /api/regen-creative` — `{ storagePath, prompt, label? }` → `{ url }` (cache-busted)

**TRADE_MAP maintenance rule:** When adding a new trade, its prefix must be in `TRADE_MAP` in `lib/trade-utils.ts` AND it must have C2/C3 images generated before going live. Baseline: 65 prefixes (commit `820719f`).

---

## DB SCHEMA QUICK REF

```sql
ads: id, platform, campaign_group, format, primary_text, headline, cta, 
     landing_path, utm_*, status, workflow_stage, image_url, 
     creative_variant (INT 1-3, default 1), created_at, updated_at

trade_assets: id, trade_slug, asset_type (hero|og|hero_a|hero_b|og_nb2), 
              image_url, status (pending|approved|rejected), notes, created_at

ad_templates: id, name, platform, format, primary_text, headline, cta, landing_path, utm_*
```

---

## COMMAND EXAMPLES (Telegram → Bob)

```
"Generate 3 new Facebook ads for mow.city, D1 direction, pain angle"
"Show me the scorecard this week"
"Pause LinkedIn — CPL is over threshold"
"Approve all Tier 1 assets"
"What's the status on the influencer outreach doc?"
"Run the audit on the new ad batch"
"Mark checklist item 4 complete"
"Regenerate the C2 image for coat.city — painter is painting the window glass, fix it"
"Generate C2 and C3 for [new trade prefix]"
```
