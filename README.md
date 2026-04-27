# Project 4H — Growth Command Center

**Live:** https://pumpcans.com  
**GitHub:** `jarrad1872/project-4h-dashboard`  
**Stack:** Next.js 16 · TypeScript · Tailwind · Supabase · Vercel · Gemini

---

## The Mission

### Rebuild Direction (2026-04-27)

4H is now being rebuilt as the **Answered.City acquisition OS**. The product reference is `sawcity-lite`, and that repo is read-only. The dashboard is the working surface for creator outreach, ChatGPT Pro `chatgpt-image-latest` creative production, approvals, and customer attribution.

The year-end target is **1,000-2,000 paying customers by 2026-12-31**. That means 125-250 net new customers per month for the next eight months, so the dashboard must make weekly customer-producing loops visible instead of only storing generated ads.

Primary loops:
- Creator demo loop: trade creators call live demo lines and show the result.
- Human field sales loop: rep-coded business cards and local SMB trade touches create early tester signal.
- Image creative loop: ChatGPT Pro `chatgpt-image-latest` generates trade-specific proof visuals and platform variants.
- Demo funnel loop: every asset tracks trade, creator, image variant, UTM, demo call, signup, activation, and paid conversion.
- Approval loop: nothing external goes live without Jarrad approval.

> **2,000 users on Saw.City LITE. Not 1,000. Not "customers." 2,000 users.**

Project 4H is a 4-channel paid acquisition campaign (LinkedIn, YouTube, Facebook, Instagram) targeting owner-operators across **65 trade communities** — each marketed independently under its own `.city` domain. $20,000 total budget. No demos. Fully self-serve.

**Current state (as of 2026-02-28):**
- 195 NB2 images generated (65 trades × Hero A + Hero B + OG) — pending Jarrad approval
- 1,040 NB2 ad variants generated (65 trades × 2 directions × 8 ads) — pending approval
- 20 trades live in Saw.City LITE app; 45 upcoming (need landing pages before ads launch)

---

## How This Works

**The dashboard is a view layer. Bob is the engine.**

| Who | Role |
|-----|------|
| Jarrad | Commands via Telegram, approves at pumpcans.com |
| Bob (AI) | Generates ad copy, creatives, uploads to DB, populates dashboard |
| Dashboard | Read-only view of campaign state for Jarrad |

Nothing goes external (ad accounts, live campaigns) without Jarrad's explicit approval.

### Current Cleanup Notes (2026-03-30)

- `/approval` now loads its initial ads snapshot server-side to avoid the duplicate client-mount fetch against `/api/ads`
- `/generate` is now a legacy reference route; active creative production happens in `/assets` with the ChatGPT Pro workflow
- `/api/drive-backup/export` is archived from the active dashboard flow and now returns `410 Gone`

---

## Trade Strategy

Each `.city` domain is a **separate trade community** — not "Saw.City" marketed generically to everyone. We market `rinse.city` to pressure washers, `pipe.city` to plumbers, etc.

### Tier 1 Campaign Trades (TAM-Ranked, launch priority)

| Domain | Trade | US TAM | Businesses |
|--------|-------|--------|------------|
| `pipe.city` | Plumbing | $191B | 130K |
| `mow.city` | Lawn Care | $60B | 500K+ |
| `duct.city` | HVAC | $30B | 105K |
| `coat.city` | Painting | $28B | 220K |
| `pest.city` | Pest Control | $26B | 33K |
| `electricians.city` | Electrical | $202B | 75K |
| `roofrepair.city` | Roofing | $56B | 100K |
| `disaster.city` | Disaster Restoration | $210B | 30K |

**Total: 65 trades across 3 tiers.** Full domain portfolio: 72 domains (incl. forwarding aliases).  
See GTM board at `/gtm` for full registry, TAM ranking, and status per trade.

---

## Pages

| Page | URL | Purpose |
|------|-----|---------|
| Overview | `/` | Growth command center: active loops, queue, targets, creative pipeline, creator pipeline, field sales, metrics, budget |
| GTM Board | `/gtm` | Full mission brief, product state, trade registry, product route inventory, action board |
| Ads | `/ads` | Current ad candidates plus historical archive labels for old generated ads |
| Approval | `/approval` | Approve/Hold/Reject pending ads and review the internal approval audit trail |
| Creatives | `/creatives` | Generated ad creative thumbnails |
| Assets | `/assets` | AI UGC creative asset tracking, founder video shoot packets, creative fatigue/lineage tracking, and draft/review/approved/live workflow |
| Workflow | `/workflow` | Pipeline stages (concept → approved → uploaded → live) |
| Lifecycle | `/lifecycle` | Day 0/1/3 email + SMS sequences plus attribution-only follow-up measurement |
| Scorecard | `/scorecard` | Weekly performance metrics, learning rankings, trade weekly targets, local keep/kill/iterate decisions, and customer pace forecast |
| Budget | `/budget` | Spend allocation per platform plus local experiment-level budget planning |
| Launch | `/launch` | Launch URL builder, bundle draft model, Q-17 local upload-sheet exports, readiness validator, external-action stop screen, and pre-launch gate checklist |
| Templates | `/templates` | Meta Ad Library access validation, competitor research template, message-match handoff briefs, creator content packets, and ad template library |
| Generate | `/generate` | Legacy AI copy + creative generation (Gemini) |
| Influencer | `/influencer` | Semi-autonomous creator outreach: audit labels, scoring, pipeline state tracker, browser-test hooks, approvals, ready-to-send, and follow-up drafting |
| Sales | `/sales` | Arizona human sales rep pilot, persistent mini CRM stages, rep-coded field-sales URLs, print-ready business card exports, field-sales attribution, and weekly rep packet |
| Settings | `/settings` | Campaign configuration |

Primary sidebar navigation now shows only active growth loops and launch governance. Original-build pages such as `/ads`, `/generate`, `/gtm`, and `/settings` sit in the collapsed Reference Shelf until each route is rebuilt, folded into an active loop, archived, or retired. See `docs/route-disposition-plan.md`.

---

## Local Development

```bash
cd /home/node/.openclaw/workspace/projects/project-4h-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

Build check:
```bash
npm run build
```

TypeScript check:
```bash
npx tsc --noEmit
```

---

## Deploy

**Auto-deploy:** Push to `main` → Vercel builds and deploys automatically.

```bash
git add -A
git commit -m "your message"
git push origin main
```

**Manual fallback:**
```bash
bash deploy.sh
# or:
npx vercel --prod --token 'ask-bob-or-check-vercel-dashboard' --yes
```

---

## Architecture

### Data Flow
```
Supabase DB (vzawlfitqnjhypnkguas)
    ↑ Bob writes via REST API
    ↓ Next.js /api/* routes read/write
        ↓ React pages render
            ↓ Jarrad views at pumpcans.com
```

### State Management
- **Static/strategic data:** `lib/project-state-data.ts` — edit this file to update GTM board, trade registry, action items
- **Live campaign data:** Supabase tables (ads, ad_templates, marketing_events, metrics, lifecycle)
- **Creatives:** Supabase Storage bucket `ad-creatives` (public)

### Key Tables
- `ads` — all ad variants with status, platform, copy, image_url
- `ad_templates` — creative briefs with copy, model, prompt metadata
- `marketing_events` — UTM attribution from Saw.City LITE signups
- `weekly_metrics` — scorecard data per week per channel
- `lifecycle_messages` — Day 0/1/3 email + SMS sequences
- `launch_checklist` — pre-launch gate items
- `influencer_pipeline` — creator qualification, draft approval, and send/follow-up state

---

## Ad Conventions

### UTM Format
```
utm_source={platform}&utm_medium=paid-social&utm_campaign=4h_2026-03_{theme}&utm_content={asset_id}&utm_term=owners_1-10
```

### Ad ID Format
- Phase 1 Saw.City branded: `LI-01`, `YT-02`, etc.
- Trade variants: `LI-R1` (Rinse), `FB-M3` (Mow), `YT-RO2` (Rooter)
- Tier 1 pivot trades: `LI-P1` (Pipe), `LI-C1` (Coat), `LI-D1` (Duct), `LI-PE1` (Pest)
- **NB2 format (current):** `NB2-D{1|2}-{LI|FB|IG|YT}-{CODE}{AW|RT}`
  - D1 = pain/urgency direction; D2 = aspiration/social proof direction
  - Campaign group: `nb2_d{1|2}_{platform}_{prefix}`

### Image Assets
The active rebuild path uses ChatGPT Pro `chatgpt-image-latest` prompt concepts in `/assets` and `/api/image-concepts`. Phase 2 stores prompt/model/variant lineage on `creative_assets`; generated image files are uploaded back into 4H for review and approval. Creative Lab filters narrow the queue by status, trade, angle, and generation state without a reload, and replacement prompts create deterministic v2/v3 variant IDs with parent/child lineage. The first Q-01 beachhead review pack stores 20 generated PNG assets under `public/creative-assets/q01-beachhead-pack` for five trades x four angles; they remain review assets until Jarrad approves. Q-26 adds founder-shot video packets for the same beachhead trades so missed-call and demo-proof clips can be captured before they become ad or creator assets. No OpenAI image API hookup is required.

Legacy NB2/Gemini images still exist for historical campaign assets:
- **Hero A** (`hero_a`): `ad-creatives/trade-heros/nb2/{slug}-hero-a.jpg` — zoomed-in scene, for ads
- **Hero B** (`hero_b`): `ad-creatives/trade-heros/nb2/{slug}-hero-b.jpg` — wide top-down, for landing pages
- **OG** (`og_nb2`): `ad-creatives/trade-ogs/nb2/{slug}-og.jpg` — link preview banner
- Tracked in `trade_assets` table (status: pending → approved → rejected)

### Kill/Scale Rules
- **Kill:** CPL > $40 after $500 spend on a platform
- **Scale:** CPL < $20 AND 5+ sign-ups → double budget
- **Pause creative:** CTR < 0.3% after 1,000 impressions
- **Experiment planner:** `/budget` can locally assign test budgets by experiment and clamps requests to remaining channel budget. This is planning state only and does not update billing, ad accounts, webhooks, Supabase budget rows, or spend.

---

## For Agents

See **[AGENTS.md](./AGENTS.md)** for full operating instructions, credentials, and constraints.  
See **[TASKS.md](./TASKS.md)** for active tasks and backlog.  
See **[SOP-WORKFLOW.md](./SOP-WORKFLOW.md)** for the campaign operating SOP.
See **[docs/claude-design-creative-lab-handoff.md](./docs/claude-design-creative-lab-handoff.md)** for the Creative Lab design handoff packet.

---

## Key Links

| Resource | URL |
|----------|-----|
| Live Dashboard | https://pumpcans.com |
| Saw.City LITE (product) | https://sawcity-lite.vercel.app |
| Supabase DB | https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas |
| Supabase Storage | https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/ |
| GitHub Repo | https://github.com/jarrad1872/project-4h-dashboard |
| Vercel Project | https://vercel.com/jarrad-kippens-projects/project-4h-dashboard |

---

### Growth Command Center Notes (2026-03-31)

- `/` now focuses on the live plumbing pilot (`pipe.city`) with launch countdown, influencer pipeline, creative pipeline, channel placeholders, and budget tracking
- `/gtm` now includes a read-only product route inventory copied from sawcity-lite reference files: 21 routes, 20 live demo lines, and the five beachhead domains ready for creator/ad planning
- `/launch` now builds deterministic trade-domain launch URLs with AGENTS-format paid-social UTMs, angle, asset, and optional creator metadata
- `/launch` now runs an internal readiness validator that returns actionable blockers for domain, UTM, offer, trial, checklist, creative approval, copy approval, and Jarrad approval state
- `/launch` now renders an internal launch bundle draft that connects trade, angle, image asset, copy, URL, budget, readiness, and approvals without any external action
- `/launch` now generates Q-17 local review-only CSV upload sheets for the selected launch bundle; the sheets can be copied or downloaded but are stamped do-not-upload until Jarrad approves
- `/launch` now shows an external-action stop screen for campaign launch/edit, ad upload, creator outreach send, webhook creation, and spend changes; it explains the exact approval needed and performs no external API action
- `/budget` now includes an experiment-level budget planner for the first paid tests; it is local planning state only and cannot change billing or platform spend
- `/scorecard` now includes a weekly learning report that ranks trades, creators, images, and angles from attribution events while clearly labeling zero-data and no-paid-signal states
- `/scorecard` now includes local keep/kill/iterate decisions with notes, timestamps, undo, and visible history; this does not pause, launch, upload, or spend
- `/scorecard` now includes a customer pace forecast that shows logged paid customers, current weekly/monthly pace, projected gap to 1,000/2,000 by 2026-12-31, and an evidence-based next bet
- `/scorecard` now includes a trade weekly target calculator that splits the required 1,000-2,000 customer pace across pipe, duct, mow, pest, and coat until trade-level paid signal justifies reweighting
- `/lifecycle` now measures signup-to-trial, trial-to-activation, and activation-to-paid movement from logged attribution events while staying read-only for sends and webhooks
- `/assets` now includes creative fatigue and variant lineage tracking that groups prompt families, shows views/downstream signal, and flags replacement-variant candidates without pausing or launching anything
- `/approval` now includes an internal audit view that classifies approval activity across ad copy, creative, outreach, launch bundle, and export gates; the audit view is metadata only and does not send outreach, take ad-platform action, launch, create webhooks, spend, or change billing
- `/ads` now labels legacy NB2, imported, and generic Saw.City rows as historical archive entries so they stay visible without looking launch-ready
- `/templates` now includes 20 message-match handoff briefs for the five beachhead domains across missed-call, demo-call, owner-agent, and ROI-math angles
- `/influencer` now supports the semi-autonomous outreach agent workflow: qualification scoring, pending-approval drafts, ready-to-send review, and day-3/day-7 follow-up drafting
- `/influencer` now shows the Q-07 outreach packet counter and can generate the first 10 internal creator drafts for review without sending outreach
- `/influencer` now audits the creator shortlist into keep/maybe/remove/needs-research buckets; `remove` deprioritizes while preserving creator history
- `/influencer` now ranks creators with a trade-owner scoring model: owner audience, trade fit, average views, sponsor openness, trust signals, and production value
- `/influencer` now builds deterministic creator UTM/referral URLs and can save the generated URL/code back to each creator row without sending outreach
- `/influencer` now tracks Q-29 creator outreach states from existing rows: qualified, approved, sent, follow-up due, replied, contracted, content-live, and paid; this is internal state only and sends nothing
- `/influencer` now exposes Q-30 Codex browser flow hooks so permanent tests can create a fake internal creator, locate the exact row, draft outreach, and verify pending approval without brittle text matching or external sends
- `/sales` now adds the Q-31 human field sales pilot for Arizona: rep tracking, CRM stages, QR-backed business card exports, and field-sales UTMs without ordering cards or sending outreach
- `/sales` now adds Q-32 persistent sales CRM rows with guarded create/update actions; archetype rows are separated from real leads and cannot be marked contacted, demo-booked, activated, or paid
- `/sales` now adds Q-33 field-sales attribution from `marketing_events`: card scans, demo calls, signups, trials, activations, paid conversions, and top rep/card/trade buckets; this is measurement only and performs no external action
- `/sales` now adds Q-34 weekly Arizona rep operating packets with touch targets, cards to carry, priority rows, daily cadence, and explicit no-external-action boundaries
- Sidebar navigation now adds Q-35 route cleanup: active growth loops stay primary, original-build leftovers move into a collapsed Reference Shelf, and `docs/route-disposition-plan.md` records the route-by-route plan
- Q-36 adds legacy route banners to `/ads`, `/generate`, `/gtm`, `/settings`, `/creatives`, and `/workflow` so direct-link visitors see the active replacement lane and no-external-action boundary
- Q-37 folds `/lifecycle` and `/templates` support signals into Command and Scorecard so daily learning work can see follow-up coverage, message-match briefs, creator templates, saved ad templates, and manual competitor-research status without giving those support pages primary nav space
- Q-38 adds a route retirement decision matrix on Command and in `docs/route-disposition-plan.md`; it recommends rebuild, redirect, archive, or delete-later outcomes but authorizes no route deletion, redirect, hiding, or file removal
- `/templates` now includes copy-ready creator content brief packets for demo-call video, founder assist, and screenshot-proof formats
- `/templates` now includes Meta Ad Library access validation that separates official API limits from assumptions before competitor monitoring is automated
- `/templates` now includes a copy-ready competitor research template for capturing offers, hooks, visuals, platforms, citations, evidence quality, coverage notes, and blocked overclaims
- `docs/meta-ad-library-access-validation.md` records the manual-first Meta competitor research path and blocks scraping, scheduled collectors, and external actions
- `docs/competitor-research-template.md` records the manual-first competitor capture fields and evidence-quality rules for Q-22 research
- `docs/product-route-inventory.md` records the landing route and demo phone findings without touching sawcity-lite
- `4h influencer seed` is now idempotent for production reruns: it creates missing shortlist creators and only updates canonical identity fields on existing rows (no duplicate row fan-out)
- `/assets` now tracks ChatGPT Pro image concepts, generated creative assets, and prompt/model/variant lineage
- `/assets` now has the first Q-01 beachhead image pack generated and in review: pipe, duct, mow, pest, and coat across missed-call, demo-call, owner-agent, and ROI-math angles
- `/assets` includes Creative Lab filters for status, trade, angle, and generation state
- `/assets` can create replacement v2/v3 prompts while preserving parent/child creative lineage
- `/assets` now tracks founder-shot video packets for pipe, duct, mow, pest, and coat across missed-call and demo-proof angles; packets are copyable planning assets and cannot publish or launch anything
- `docs/claude-design-creative-lab-handoff.md` gives Claude Design the Creative Lab UX goals, data model, routes, screenshot checklist, and constraints
- `supabase/migrations/009_growth_command_center.sql` adds `creative_assets` plus richer influencer fields for persistent production storage
- `supabase/migrations/010_influencer_outreach_agent.sql` adds the email-only outreach state model for human-gated creator approvals
- `supabase/migrations/011_marketing_events_attribution.sql` adds asset-to-paid-customer attribution fields
- `supabase/migrations/012_creative_asset_lineage.sql` self-heals `creative_assets` if needed and adds image lineage fields
- `supabase/migrations/013_influencer_audit_labels.sql` adds creator audit labels, reasons, and audit timestamps
- `supabase/migrations/014_sales_rep_pipeline.sql` adds persistent `sales_leads` rows for the Arizona field-sales CRM

### Competitive Intelligence Foundation (2026-04-01)

- `docs/competitive-ad-research-agent.md` documents the corrected architecture for H-16 after verifying Meta access assumptions against official sources
- `lib/competitive-ad-research-agent.ts` provides provider-agnostic keyword seeds, Meta payload normalization, Claude prompt generation, and weekly markdown report generation
- `lib/__tests__/competitive-ad-research-agent.test.ts` locks the shared snapshot/report contract before any live Meta collector is wired in
- `scripts/competitive-intel-meta.js` adds a token-based Meta `ads_archive` validation helper with redacted request logging and markdown summary output
- Meta Ad Library should be treated as a validated dependency, not a given: public search exists, but automated access still requires token-based verification before we schedule or hire a dedicated agent

*Last updated: 2026-04-27 Q-38 route retirement matrix | v4.4.7*

---

## CLI Usage

The 4H CLI lets agents and developers operate the campaign without using the dashboard UI.

### Setup

```bash
export PUMPCANS_TOKEN=your_token_here        # if auth is enabled
export PUMPCANS_BASE_URL=https://pumpcans.com  # default
```

### Examples

```bash
node scripts/4h-cli.js report daily
node scripts/4h-cli.js ads list --status pending --table
node scripts/4h-cli.js ads approve --all
node scripts/4h-cli.js campaign status
node scripts/4h-cli.js creative gen --trade saw --format hero_a --style pain-point --push
node scripts/4h-cli.js alerts list
META_ACCESS_TOKEN=... node scripts/4h-cli.js competitive-intel validate-meta --out data/competitive-intel/meta-validation.md
npm run cli -- influencer seed

# Via npm:
npm run cli -- report daily
npm run cli -- ads list --table
```

### Auth

Set `PUMPCANS_API_TOKEN` on the server to enable auth. Set `PUMPCANS_TOKEN` in your CLI environment to authenticate. When `PUMPCANS_API_TOKEN` is not set on the server, auth is disabled (backwards-compatible).

### New Endpoints (feat/cli-auth)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/report/daily` | GET | Structured JSON daily summary |
| `/api/creative/batch` | POST | Batch AI creative generation |
| `/api/alerts` | GET/POST/DELETE | CRUD for threshold alert rules |
