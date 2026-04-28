# SOP: Project 4H Dashboard — Operating Model

**Last updated:** 2026-04-28
**Dashboard:** https://pumpcans.com  
**Repo:** `jarrad1872/project-4h-dashboard`

> **THE MISSION: ANSWERED.CITY / SAW.CITY LITE CUSTOMER GROWTH.**
> Target: 1,000-2,000 paying customers by 2026-12-31. The dashboard exists to make weekly customer-producing loops visible.
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

## Agentic Launch SOPs

4H should be launchable from the app or from agent CLI sessions, but all live external action remains explicitly gated.

- Active UI: `/launch` Agentic Launch Control.
- Active API: `POST /api/launch/orchestrate`.
- Active CLI:
  - `npm run cli -- launch plan --trade pipe.city --platform linkedin --angle missed-call`
  - `npm run cli -- launch prepare --trade pipe.city --platform linkedin --angle missed-call --creative-status approved --copy-status approved --jarrad-status approved`
  - `npm run cli -- launch execute --trade pipe.city --platform linkedin --angle missed-call --creative-status approved --copy-status approved --jarrad-status approved --external-confirmation`
- Shared contract: `lib/agentic-launch-control.ts`.
- The internal agentic path may build URLs, validate readiness, assemble launch bundles, and prepare review-only upload sheets.
- Execute mode currently returns an adapter-gated plan. It does not send outreach, upload ads, launch campaigns, create webhooks, move spend, change billing, or call third-party APIs.
- Future external adapters must require exact action-time Jarrad approval for the specific platform/account/trade/campaign/creative/copy/budget/webhook action before they run.

---

## Customer Proof Sprint SOPs

Q-58 through Q-63 shift the next motion from broad ad launch to first-customer proof.

- Active customer proof UI: `/sales`.
- Active proof packet UI: `/templates`.
- Active learning ledger: `/scorecard`.
- Roadmap doc: `docs/google-maps-pain-signal-roadmap.md`.
- Shared contract: `lib/customer-proof-sprint.ts`.

Operating sequence:

1. Use the Q-58 pain-signal lead finder to identify public review phrases such as "did not answer," "never called back," "left a voicemail," "after hours," and "hard to schedule."
2. Save only internal research hypotheses until a real owner/business row is intentionally created.
3. Use Q-59 founder demo scripts and Q-61 live proof packets to show the missed-call moment, live demo line, captured job summary, and $39/mo trial offer.
4. Use the Q-60 objection bank after real conversations to separate trust, price, AI quality, and "another app" objections.
5. Keep the Q-62 next-10 board focused on named attempts before adding broad paid budget.
6. Use Q-63 channel ledger to compare weekly inputs, success metrics, and kill criteria across review-signal outbound, founder video, field sales, creator demos, and paid social.

Google Maps / review-signal boundaries:

- Manual review and official API/provider paths are allowed planning directions.
- Small human-reviewed batches are acceptable for research and draft preparation.
- Do not solve CAPTCHAs, bypass login or browser safety barriers, rotate proxies, evade rate limits, or build hidden scraping infrastructure.
- Do not send email, SMS, DM, form submissions, creator outreach, ad uploads, webhooks, spend changes, or billing actions without exact action-time approval.
- Do not claim a public review proves lost revenue unless the owner confirms it.

---

## AD COPY SOPs

### Hard Rules (Non-Negotiable)
1. **Price is ALWAYS $39/mo** — never $99, $149, $199, or any other amount.
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

### Constrained AI Generation (replaces NB2 ad copy)

The NB2 2-direction strategy is superseded by the 4-angle system for all new ad copy:

**4 Copy Angles (per trade, per platform):**
| Angle | Strategy | Hook |
|-------|----------|------|
| `pain` | Problem amplification | "Every unanswered call is a job your competitor picks up..." |
| `solution` | Feature-led | "Pipe.City handles your scheduling, dispatch, and follow-ups..." |
| `proof` | Social proof | "Trade businesses using Pipe.City are booking 30% more jobs..." |
| `urgency` | Time pressure | "Peak season is coming. Your competitors are already automating..." |

**Generation flow:**
```
1. 4h ads archive --campaign-group nb2          → Archive 1,040 old ads
2. 4h generate-copy --trades all --angles all   → Generate 320 fresh ads (20 trades x 4 platforms x 4 angles)
3. Visit /approval                              → Review by trade, approve/reject
4. Approved ads ready for platform upload
```

**Validation is automatic.** Every generated ad is checked against hard rules (pricing, trial, domain, char limits, no generic language). Failed validation → auto-retry once → report failure.

**Generated Ad ID Format:**
```
{trade}_{platform}_{angle}_{timestamp}
```
Campaign group: `gen_{trade}_{angle}`
UTM campaign: `gen_2026-03_{trade}_{angle}`

### Historical Ad Archive

- `/ads` separates current launch candidates from historical archive rows. Historical rows remain visible for reference, but they are not launch candidates.
- The archive classifier labels NB2 runs, imported campaign upload-sheet rows, legacy platform landing paths (`/li`, `/yt`, `/fb`, `/ig`), and generic Saw.City copy.
- Archiving is a view-layer label only. Do not delete old ad copy, rewrite historical rows, upload them to ad platforms, or treat an archive badge as approval.
- A historical ad can only become current again by rebuilding it into a launch bundle with trade-specific domain, `$39/mo`, trial language, approved creative, approved copy, tracking URL, and Jarrad approval.

### Legacy Ad ID Format (NB2)
```
NB2-D{1|2}-{LI|FB|IG|YT}-{CODE}{AW|RT}
```
Campaign group: `nb2_d{1|2}_{platform}_{prefix}`
Image URL: points to `trade-heros/nb2/{slug}-hero-a.jpg`

---

## IMAGE GENERATION SOPs

### Active Model: ChatGPT Pro `chatgpt-image-latest`
- `chatgpt-image-latest` is the rebuild's default image creative driver because assets are generated manually here with the Pro plan.
- The app saves prompt concepts, generated image uploads, and lineage metadata only. It does not call the OpenAI image API.
- If an API path is ever revisited, official OpenAI docs currently identify `gpt-image-1.5` as the latest API image model.
- No OpenAI image API env vars are required for this workflow.
- Active UI: `/assets` Creative Lab.
- Active concept API: `GET/POST /api/image-concepts`.
- Prompt briefs live in `lib/image-creative-briefs.ts`.
- Use **Create 20-prompt set** to seed the beachhead queue: `saw`, `pipe`, `mow`, `rinse`, and `lockout` across missed-call, demo-call, owner-agent, and ROI math.
- Use the Creative Lab filters to narrow review by status, trade, angle, or generation state before copying packets or uploading generated images.
- Use **Copy packet** on a prompt card, generate the image here with ChatGPT Pro, then upload the generated image back to the same asset card.
- Q-01's first beachhead review pack is stored in 4H under `public/creative-assets/q01-beachhead-pack` and linked to the 20 Creative Lab prompt cards. These are review assets only until Jarrad approves them.
- Use **Create v2/v3 prompt** when an image needs a replacement. The new prompt keeps the original `prompt_brief_id`, stores `parent_asset_id`, and assigns a deterministic variant ID such as `pipe-missed-call-multi-v2`.
- Use the Q-26 founder video tracker on `/assets` to copy local shoot packets for saw, pipe, mow, rinse, and lockout missed-call/demo-proof clips. These packets are capture guidance only; they do not publish, upload, send outreach, launch ads, create webhooks, move money, or change billing.
- Use the Q-28 fatigue and lineage panel on `/assets` to group image assets by prompt/variant family, compare tracked views against downstream events, and identify replacement candidates. These signals are planning guidance only and do not pause campaigns, upload assets, launch ads, spend money, or change billing.
- Use `docs/claude-design-creative-lab-handoff.md` when handing Creative Lab to Claude Design for UI polish.
- Creative lineage is stored on `creative_assets`: provider, model, prompt brief, prompt text, negative prompt, dimensions, variant ID, parent asset, generation status, storage path, quality, moderation, and response metadata.
- All concepts remain `draft` or `review` until Jarrad approves. No external publishing, upload, webhook, ad launch, or spend happens automatically.

### Legacy Model: Nano Banana 2 (NB2)
NB2/Gemini assets remain historical and may be referenced, but they are not the default creative strategy for the 4H rebuild.

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
| **OG** | `og_nb2` | `trade-ogs/nb2/{slug}-og.jpg` | Link preview banner — domain + "AI answers your calls." + $39/mo |

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
icon of {BRIEF_SCENE}. Far right: '$39/mo' white. Navy background with {BRAND_COLOR} radial glow. 
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
- $39/mo present (not $79, $99, $149, etc.)
- No blank headlines
- Trade vocabulary signals present in copy (not find-and-replace slop)

**Generated ads skip the audit** — they are validated at generation time by `lib/ad-copy-validator.ts`.

If audit fails → fix the flagged ads → re-run → 🟢 → report done.

---

## INFLUENCER OUTREACH SOP

**Deal structure:**
- Creator promotes their trade's `.city` domain to their contractor audience
- Unique referral code + co-branded landing page (e.g. `mow.city/ryanknorr`)
- Outreach drafts use a flat-fee-only creator ask unless Jarrad explicitly approves another structure
- Customer offer in every creator packet: `$39/mo`, `14-day free trial, no credit card required`

**Outreach tone:** Peer-to-peer, operator-to-operator. Never corporate.  
> "We built this for guys like your audience" — not "we'd like to leverage your platform"

**Priority contacts** (see `docs/influencer-outreach.md` for full list + contact info):
1. Mike Andes (lawn care)
2. Brian's Lawn Maintenance (~247K, pure contractor)
3. AC Service Tech LLC (HVAC, ~162K, pure technician audience)

**Start small:** Lawn care + HVAC first. Learn. Then expand to other trades.

**Seed command behavior (`4h influencer seed`):**
- Safe to rerun in production. The command is idempotent: it creates only missing shortlist creators.
- Existing shortlisted creators are matched deterministically (`channel_url` first, then creator/trade/platform) and only canonical identity fields are synced.
- Active workflow fields (`status`, notes, outreach timing) are preserved on existing rows.

**Creator audit labels:**
- Audit the shortlist before drafting outreach. Buckets are `keep`, `maybe`, `needs-research`, and `remove`.
- `remove` means deprioritize for this sprint, not delete the creator. Keep the row, notes, and history intact unless Jarrad explicitly asks for deletion.
- `needs-research` means the creator may fit, but channel, average views, engagement, or audience evidence is incomplete.

**Creator scoring model:**
- Rank creators by trade-owner value, not vanity reach. The six visible factors are owner audience, trade fit, average views, sponsor openness, trust signals, and production value.
- Treat `average_views` as more useful than subscriber count for first-pass outreach priority.
- High score does not authorize outreach by itself. Drafting and sending still follow the approval workflow.

**Creator tracking URLs:**
- Creator URLs are deterministic and include `utm_source`, `utm_medium=creator`, `utm_campaign`, `utm_content`, `utm_term`, `creator`, `creator_id`, `trade`, and `ref`.
- Saving a generated URL/code to `deal_page` and `referral_code` is internal 4H state only. It does not send outreach, launch a campaign, upload to an ad platform, or create an external webhook.
- Use the tracking URL in outreach drafts only after the draft itself has passed Jarrad review.

**Q-07 outreach packet workflow:**
- `/influencer` shows the first outreach packet target, drafted count, approval count, approved count, and sent count.
- The batch draft action creates internal draft copy only. It must never send email, DM creators, create external webhooks, launch ads, upload to ad platforms, move money, or change billing.
- Draft bodies must name the trade `.city` destination and preserve the hard offer: `$39/mo`, `14-day free trial, no credit card required`.
- Q-07 is complete only when 10 creator drafts exist and the sent count is zero.

**Q-29 creator outreach state tracker:**
- `/influencer` groups creators into qualified, approved, sent, follow-up due, replied, contracted, content-live, and paid stages from existing 4H fields.
- The tracker is an internal operating view only. It does not email creators, send follow-ups, publish content, create webhooks, move money, change billing, or authorize external outreach.
- Prioritize follow-up due first, then approved manual-send candidates, replied conversations, and newly qualified creators.

**Q-30 Codex browser flow testing:**
- Permanent creator-flow tests should use the stable `data-testid` hooks on `/influencer`, including `creator-prospect-form`, `creator-form-*`, `creator-row-{id}`, `creator-draft-{id}`, and review-card/action hooks.
- It is acceptable to create fake internal creator rows while testing local or preview flows. Do not commit generated fallback data unless Jarrad explicitly asks for seeded examples.
- Browser tests may draft internal outreach and verify pending approval, but must not send emails, DMs, publish content, create webhooks, upload to ad platforms, launch campaigns, move money, or change billing.

**Content brief templates:**
- `/templates` holds the internal creator brief packets for demo-call video, founder assist, and screenshot-proof assets.
- Every brief must include a hook, shot list, creator talking points, CTA, `$39/mo`, `14-day free trial, no credit card required`, and tracking guidance.
- Copying a packet is drafting support only. It does not approve outreach, send messages, publish assets, or launch ads.

**Human field sales SOP:**
- `/sales` is the internal operating surface for the Arizona founding rep pilot.
- Sales rep cards must include a stable rep code, `utm_medium=field-sales`, `utm_campaign=4h_YYYY-MM_{campaign}`, and a unique card ID in `utm_content`.
- Printed cards must preserve the hard offer: `$39/mo`, `14-day free trial, no credit card required`.
- The default Arizona pilot card points to `answered.city` for broad discovery, while lead-specific CRM rows can carry trade-domain tracking such as `saw.city`, `pipe.city`, `mow.city`, `rinse.city`, or `lockout.city`.
- Business card exports use 3.75 x 2.25 inch bleed artwork at 300 DPI, with key text inside the safe area. The dashboard generates SVG/PNG assets only; it does not place a Vistaprint order or move money.
- CRM stages are internal tracking states: prospect, qualified, visited, card-left, demo-booked, trial-started, activated, paid, and lost.
- Placeholder lead rows are target archetypes unless a real owner is intentionally entered later. Do not represent them as contacted businesses, testers, or customers.
- Q-32 persists sales leads through `/api/sales/leads` and `/api/sales/leads/{id}` with Supabase/file fallback. Real rows can move through contacted/demo/trial stages; archetype rows are blocked from visited, card-left, demo-booked, trial-started, activated, and paid stages.
- Q-33 adds field-sales attribution on `/sales` from `marketing_events` only. The panel filters rep-coded field-sales UTMs or card metadata, then reports card scans, demo calls, signups, trials, activations, paid conversions, and top rep/card/trade buckets.
- Field-sales attribution is measurement only. It must not send outreach, order cards, create webhooks, upload to ad platforms, launch campaigns, move money, change billing, or claim customers from archetype CRM rows.
- Q-34 adds a weekly Arizona rep operating packet on `/sales`. It converts CRM rows and field-sales attribution into touch targets, cards-to-carry guidance, priority rows, daily cadence, and a read-only packet body.
- The Q-34 packet is internal route planning only. It must not send outreach, order cards, create webhooks, upload to ad platforms, launch campaigns, move money, change billing, or treat archetype rows as contacted businesses.
- Sales CRM writes are localhost or authenticated Bob/CLI only. Public dashboard access can read the board but must not be able to mutate CRM rows without the server token.
- Do not reclassify an archetype into a real lead. Create a fresh real row when a real owner/business is intentionally being tracked.
- When testing in the browser, use fake internal lead names only unless Jarrad explicitly authorizes entering real contact/business details into the destination system.
- No external outreach, card ordering, webhooks, ad uploads, spend, billing, or customer claims are authorized by a CRM stage or card export alone.

**Product route inventory:**
- `/gtm` holds the 4H-owned inventory of live product routes copied from read-only sawcity-lite reference files.
- Trade-specific paid and creator traffic should use the trade domain root, such as `pipe.city/`, with UTMs added by the 4H launch URL builder.
- Beachhead demo call CTAs can use the confirmed demo lines for `saw.city`, `pipe.city`, `mow.city`, `rinse.city`, and `lockout.city`.
- `answered.city/` is the broad trade directory, not the preferred destination for trade-specific paid clicks.
- Route/message-match changes for sawcity-lite belong in handoff briefs only. Do not edit sawcity-lite from this repo.

**Launch URL builder:**
- `/launch` generates internal planning URLs only. It does not upload to ad platforms, launch ads, create webhooks, send outreach, or move money.
- Paid-channel UTMs follow AGENTS format: `utm_campaign=4h_YYYY-MM_{campaign}`, `utm_source={platform}`, and `utm_medium=paid-social`.
- Every generated URL should include trade, angle, asset, and optional creator metadata so scorecard attribution can connect click source to creative intent.
- Use trade-specific `.city` domains for paid and creator traffic unless the campaign is intentionally broad directory traffic.

**Launch readiness validator:**
- `/launch` runs an internal preflight validator on the selected launch candidate. It returns blockers and warnings only; it does not launch, upload, send, create webhooks, or spend money.
- A candidate is blocked when the trade domain, UTM source/medium/campaign/content, `$39/mo` offer, `14-day free trial, no credit card required`, creative approval, copy approval, checklist, or Jarrad approval state is missing or wrong.
- Every blocker must include an action and evidence so the next agent can resolve the exact gap before launch bundle review.
- The validator should keep creative, copy, and Jarrad approval as explicit blockers instead of implying that a generated URL or draft bundle alone is launch-ready.

**Launch bundle drafts:**
- `/launch` renders a draft launch bundle from the selected trade, platform, angle, image asset ID, copy/offer/trial fields, launch URL, channel budget, readiness result, and approval states.
- The bundle is an internal planning object only. It does not upload ads, launch campaigns, send outreach, create webhooks, or move money.
- Bundle statuses are `blocked`, `draft`, `review-ready`, and `approved`; `approved` still means the bundle has internal approval state, not that any platform action has happened.

**Q-17 local upload sheets:**
- `/launch` generates copyable/downloadable CSV previews from the selected launch bundle for platform review.
- Sheets are stamped `REVIEW_ONLY_DO_NOT_UPLOAD` and `JARRAD_APPROVAL_REQUIRED_BEFORE_PLATFORM_UPLOAD`.
- The Meta sheet includes Facebook and Instagram rows; platform-specific sheets include the selected platform, YouTube, and LinkedIn as needed for review.
- These CSVs are local handoff artifacts only. Copying or downloading a sheet does not upload to Meta, LinkedIn, YouTube, Instagram, launch a campaign, create webhooks, move money, or change billing.
- Do not use a Q-17 sheet outside 4H until the launch bundle, copy, creative, and Jarrad approval gates are explicitly satisfied.

**External action stop screen:**
- `/launch` stops campaign launch/edit, ad upload, creator outreach send, webhook creation, and spend/billing changes at a visible approval boundary.
- Each stopped action must state the risk, the exact Jarrad approval needed, the blocked mechanism, and the next internal step.
- Jarrad confirmed creator outreach may begin after drafts pass 4H approval, ad accounts and billing remain manual at first, and generated image uploads require Jarrad sign-off before becoming launchable assets.
- The stop screen is a planning surface only. It does not call ad-platform APIs, send messages, upload sheets, create webhooks, change billing, or move money.
- The former launch-status action is not an external launch control. Any real campaign launch remains manual or separately approved by Jarrad.

**Navigation and original-build cleanup:**
- The primary sidebar is for active growth loops and launch governance only: Command, Creators, Sales, Creative Lab, Scorecard, Approval, Launch, and Budget.
- Original-build routes such as `/ads`, `/generate`, `/gtm`, and `/settings` stay in the collapsed Reference Shelf until they are rebuilt, archived, redirected, or retired.
- Direct-link support routes such as `/templates` and `/lifecycle` can stay available without taking primary sidebar space.
- Q-36 legacy route banners must stay visible on `/ads`, `/generate`, `/gtm`, `/settings`, `/creatives`, and `/workflow` until each route is rebuilt, redirected, archived, or retired.
- Q-37 support summaries on Command and Scorecard are the daily home for lifecycle and template status; `/lifecycle` and `/templates` remain detail pages reached from those active loops.
- Q-38 route retirement matrix is advisory only. A recommendation of `redirect` or `delete` does not authorize changing routes, removing files, hiding links, or breaking direct links.
- Before any future route retirement packet, run a dependency guard that checks active pages, docs, tests, and support workflows for links or data dependencies.
- Q-39 dependency guard on Command is the current source of truth for route retirement readiness. A route marked `blocked` or `support` must not be redirected or deleted.
- Q-40 moved creator campaign-flow links off legacy `/creatives` and `/workflow`; future creator guidance should use `/assets`, `/approval`, `/launch`, and `/scorecard`.
- Q-41 separates static `/creatives/*.jpg` asset URLs from the legacy `/creatives` page route. Future `/creatives` redirects must prove those 24 JPEG URLs still return static images.
- Q-42 separates workflow-stage history from the legacy `/workflow` page route. Future `/workflow` redirects must preserve or migrate the six stages, five bulk transitions, local fallback overrides, bulk API contract, and trade breakdown logic.
- Q-43 separates setup/source notes from the legacy `/settings` page route. Future `/settings` delete packets must preserve platform setup pointers, read-only sawcity-lite source doc paths, campaign-status context, placeholder credential handling, and doc-update reminders.
- Q-44 separates product-route inventory from the legacy `/gtm` page route. Future `/gtm` archive-only packets must preserve the 21-route inventory, beachhead demo-line context, launch URL assumptions, and read-only sawcity-lite evidence paths.
- Q-45 separates historical archive context from the legacy `/ads` page route. Future `/ads` archive-only packets must preserve classifier signals, current/historical filters, `/api/ads` history readability, and the no-upload/no-launch boundary.
- Q-46 groups clear candidates into a cleanup packet before implementation. A cleanup packet must show preserved evidence, replacement route, verification requirements, and blocked actions before any redirect, archive-only, or delete-later change.
- Q-47 applies the `/generate` cleanup packet. `/generate` should redirect internally to `/assets`; do not remove `/api/generate`, `/api/ai-creative`, or related legacy API routes without a separate API cleanup packet.
- Q-48 applies the `/gtm` archive-only cleanup packet. `/gtm` should redirect internally to Command; do not remove product-route inventory data/docs or edit sawcity-lite.
- Q-49 applies the `/settings` cleanup packet. `/settings` should redirect internally to Approval; setup/source notes must remain in Command/docs and placeholder credentials must not be rendered.
- Q-50 hardens `/ads` as a read-only archive. Keep historical rows readable, but do not restore create/edit/pause/regenerate controls or `/ads/[id]` editing without a new Launch/Approval ownership decision.
- Q-51 drafts the blocked-route cleanup packets. Do not redirect `/creatives` until public `/creatives/*.jpg` URLs have before/after 200 checks; do not redirect `/workflow` until workflow-history preservation is explicitly verified.
- Q-52 resolves the `/creatives` static URL guard before redirect work. Keep `docs/creative-static-url-guard.md` as the before-check evidence and require all 24 public JPEG URLs to be rechecked after any future `/creatives` page-route redirect.
- Q-53 applies the `/creatives` page-route redirect to `/assets`. Keep all public `/creatives/*.jpg` URLs direct-link accessible and do not move or regenerate static files during page-route cleanup.
- Q-54 resolves the `/workflow` ownership guard before redirect work. Keep `docs/workflow-ownership-guard.md` as the ownership evidence and do not bulk-mutate workflow rows during route cleanup.
- Q-55 applies the `/workflow` page-route redirect to `/launch`. Keep the six-stage workflow history/ownership map on Command/docs and do not reintroduce direct-link bulk mutation UI on `/workflow`.
- Use `docs/route-disposition-plan.md` before deleting, redirecting, or rebuilding any leftover route.

**Experiment budget planner:**
- `/budget` assigns the first paid-test planning budget by experiment, not only by channel.
- Experiment requests are local UI planning state. Editing them does not update billing, ad accounts, Supabase budget rows, webhooks, uploads, campaigns, or spend.
- Allocations are clamped to the current remaining channel budget so a launch plan cannot silently overcommit a platform.
- Use the planner to decide what budget belongs in Q-17 local upload sheet previews after review approval.

**Message-match briefs:**
- `/templates` holds 4H-owned handoff briefs for future sawcity-lite landing work across the five beachhead domains and four creative angles.
- Every brief must include trade domain, angle, ad promise, landing headline promise, hero direction, supporting proof, `$39/mo`, and `14-day free trial, no credit card required`.
- Message-match briefs are handoff artifacts only. They do not approve, edit, or deploy sawcity-lite changes.
- Use the brief that matches the launch URL angle so the first screen answers the promise that made the buyer click.

**Weekly learning report:**
- `/scorecard` ranks trades, creators, images, and angles from `marketing_events` attribution only.
- Rankings use funnel-weighted evidence: paid conversions outrank activations, trials, signups, demo calls, and raw asset views.
- If no paid events exist, the report must say rankings are directional only. If no events exist, it must show empty states instead of recommendations.
- Keep/kill/iterate decisions on `/scorecard` are selected-week local learning notes with timestamps, optional notes, undo, and visible history.
- Decision entries do not pause campaigns, launch ads, upload sheets, send outreach, create webhooks, move money, or change billing.
- The customer pace forecast uses logged weekly paid customer metrics only. It shows the 1,000-2,000 target range, weeks remaining to 2026-12-31, current weekly/monthly pace, required pace, projected gap, and the next internal bet.
- If no paid customer metrics exist, the forecast must say no paid customer data is logged yet. Do not fabricate winners, customer pace, or creative fatigue from placeholder data.
- The trade weekly target calculator splits the remaining required weekly paid-customer pace across the five beachhead domains until real trade-level paid signal is strong enough to reweight. It uses attribution-only `paid` events for weekly and all-time trade counts.
- Trade targets are planning math only. They do not launch campaigns, upload sheets, send outreach, create webhooks, move money, or change billing.
- `/lifecycle` measures after-signup follow-up performance from `marketing_events` only: signup to trial, trial to activation, and activation to paid. It may guide the next lifecycle bet, but it must not send email, SMS, push notifications, webhooks, or external actions.

**Weak YouTube verticals** (use podcasts/trade media instead):
- Pest control — no dominant 100K+ contractor creator
- Painting — thin on YouTube

---

## COMPETITIVE AD RESEARCH SOP

This is read-only market intelligence for 4H creative strategy. It does not touch our ad accounts.

### Rules

1. Validate provider access before automating. Do not assume Meta Ad Library API coverage just because the public library exists.
2. Treat analysis cost as low-but-non-zero when using Claude API directly.
3. Reports must distinguish observed ad patterns from inference.
4. Weekly output must include coverage notes so strategy decisions are not made on hidden blind spots.
5. For US commercial competitors, treat the official Meta API as limited until a real token test proves useful non-political coverage. The manual public Ad Library web UI remains the default source for Q-22 evidence capture.
6. Do not scrape reverse-engineered endpoints, schedule collectors, buy vendor access, or create external webhooks from this repo without explicit approval.

### Foundation Files

- `docs/competitive-ad-research-agent.md`
- `docs/meta-ad-library-access-validation.md`
- `docs/competitor-research-template.md`
- `lib/competitive-ad-research-agent.ts`
- `lib/meta-ad-library-access.ts`
- `lib/competitor-research-template.ts`
- `lib/__tests__/competitive-ad-research-agent.test.ts`
- `lib/__tests__/meta-ad-library-access.test.ts`
- `lib/__tests__/competitor-research-template.test.ts`
- `scripts/competitive-intel-meta.js`

### Build Sequence

1. Validate Meta token coverage against real search terms (`ai receptionist`, `plumber software`, direct competitor brands) with `META_ACCESS_TOKEN=... npm run cli -- competitive-intel validate-meta`.
2. Normalize collected snapshots into the shared internal schema.
3. Run Claude analysis on normalized snapshots only.
4. Generate markdown report for Paperclip and Telegram delivery.
5. Only after validation succeeds should we schedule the workflow or request a dedicated always-on agent.

### Manual competitor research template

- `/templates` includes a copy-ready competitor research report template.
- Every competitor row needs captured date, competitor name, citation URL, source type, country/region, platform, offer, hook, visual pattern, CTA, evidence quality, coverage note, and 4H takeaway.
- Evidence quality must be one of observed, partial, inferred, or unverified. Inferred claims need a validation step; unverified claims cannot drive strategy.
- Do not infer spend, call hooks winners, or treat vendor estimates as official Meta data unless the source directly supports the claim.

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

### Approval Audit Log (pumpcans.com/approval)
- `/approval` shows internal audit coverage for ad copy, creative, outreach, launch bundle, and export approvals.
- Individual and bulk ad copy approval decisions write an `activity_log` note with what changed and why.
- Audit records are internal governance metadata only. The audit view does not send outreach, take ad-platform action, launch campaigns, create webhooks, move money, or change billing.
- Missing rows mean no approval activity has been logged yet, not that an external action is authorized.

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
| Frontend | Next.js 16, TypeScript, Tailwind 4 |
| Backend | Supabase (PostgreSQL + Storage + PostgREST), 23 API routes |
| AI Copy Gen | Gemini 2.0 Flash (`/api/ads/generate` — constrained pipeline with validator) |
| AI Copy Gen (legacy) | Gemini 2.5 Flash (`/api/generate` route) |
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
     creative_variant (INT 1-3, default 1), angle, validation_notes,
     generation_model, created_at, updated_at

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
