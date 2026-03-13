# Project 4H — Task Board

**Last updated:** 2026-03-13

---

## BLOCKED — Waiting on Jarrad

### TASK-002: Approve Generated Ad Variants
320 ads generated and pending at https://pumpcans.com/approval (20 trades x 4 platforms x 4 angles).
All copy describes the AI call-answering product (not generic business software). coat.city correctly says "Painting".
Ads show angle badges (pain/solution/proof/urgency) and validation warnings.

### TASK-003: Ad Account Setup
Create accounts: LinkedIn Campaign Manager, Meta Ads Manager, Google/YouTube Ads.

### TASK-004: Master Asset Review
https://pumpcans.com/creatives — verify visual consistency across 65 trades.

### TASK-019: Founder Video Content (Jarrad)
Record 3-5 short videos for paid social. One 60s founder story on a job site ("I built this because I was missing calls") is worth more than 100 generated text ads. Research shows UGC/founder talking-head is 36.8% of top-performing ads in 2026.
**Needed:**
- Phone-ringing pattern interrupt (5-15s) — phone screen shows incoming call, nobody answers, $$$ disappears, then AI answers
- Founder talking head (30-60s) — Jarrad on a job site explaining why he built this
- Screen recording demo (15-30s) — call comes in, AI answers, text notification arrives, job created
- Split-screen day-in-the-life (15-30s) — WITHOUT vs WITH: left side misses call, right side AI books it
- UGC testimonial (15-30s) — real contractor showing text notification of a booked job

### TASK-020: Angle-Specific Landing Pages (sawcity-lite)
Research shows message match between ad and landing page can increase conversion up to 212%. Currently all ad angles land on the same generic trade page. Need dynamic hero headline that matches ad angle (at minimum, URL params that swap the hero text).
- Missed-call angle → "Stop Losing $260K/Year to Missed Calls"
- Voice-boss angle → "Run Your Business by Voice. From Your Truck."
- Demo-call angle → "Call This Number. Hear Your AI Employee Answer."
- Math angle → "74% of Your Calls Go Unanswered. Do the Math."

---

## READY TO DO

### TASK-011: Update Stats to Real Research Numbers
Current ads use "62% of calls go unanswered." Actual data is stronger:
- **74.1%** of trade calls go completely unanswered (NextPhone)
- **85%** of callers who reach voicemail hang up and call the next guy (NextPhone)
- **78%** of customers book with whoever answers first (NextPhone)
- **$1,200** average revenue per missed call (Invoca)
- **Less than 3%** of callers leave a voicemail (Invoca)
- **60x less likely** to close a lead after waiting 1 day (multiple sources)
**Changes:** Update `lib/trade-copy-context.ts` stats references, `lib/ad-copy-prompts.ts` proof angle to use 74.1%, and validator proof pattern to match new numbers.

### TASK-012: Add Owner Agent to Ad Copy Pipeline
The Owner Agent (voice-controlled business management) is the #1 competitive differentiator — no competitor has it. Zero current ads mention it.
**Changes:**
- Add `ownerAgentScenarios` field to `TradeCopyContext` (e.g., "Schedule Mike for Thursday at seven", "Mark ACME complete for $750", "Text the customer I'm on my way")
- Add "voice-boss" angle to `CopyAngle` type and `ANGLE_PROMPTS`
- Add Owner Agent to the immutable product description block in prompts
- Update validator to accept "voice", "text", "manage" as product-mention terms for voice-boss angle

### TASK-013: Add New Ad Angles (7 total)
Current 4 angles (pain/solution/proof/urgency) are really 4 ways of saying "missed calls." Meta's Andromeda algorithm punishes creative sameness. Need radically different concepts.
**New angles to add:**
- `ai-employee` — "Like hiring a receptionist for $39/mo" (familiar comparison, not tech-scary)
- `voice-boss` — "Run your business by voice from your truck" (Owner Agent feature, our unique moat)
- `math` — "74% unanswered x $1,200/call = $260K/year gone" (pure numbers, undeniable ROI)
- `junk-shield` — "Stop spam from cluttering your day" (different pain point entirely)
- `demo-call` — "Call this number right now. Hear it yourself." (instant proof, zero friction)
- `competitor` — keep current urgency, rename for clarity
- `missed-call` — keep current pain, rename for clarity
**Changes:** `lib/trade-copy-context.ts` (new CopyAngle values), `lib/ad-copy-prompts.ts` (new angle prompts), `lib/ad-copy-validator.ts` (angle term patterns), tests.

### TASK-014: Add Demo Phone CTA to Ads
Every trade in sawcity-lite has a provisioned Twilio demo number. Landing pages feature "Call [PHONE] — Live Demo" prominently. Zero ads use this.
**Why it's powerful:** Instant proof, zero commitment, memorable, pattern interrupt — no other SaaS ad asks them to call a number and hear the product work.
**Changes:** Need to source demo numbers per trade from sawcity-lite config, add to trade context, create demo-call angle that includes the number. Facebook ads with "Call Now" CTA are supported natively.

### TASK-015: Add Social Proof to Ad Copy
Zero current ads mention user counts, results, or peer validation. Research: peer proof is #1 trust signal for trade owners.
**Options (even directional helps):**
- "Built by a concrete cutter who was tired of missing calls"
- "Serving 20+ trades from plumbing to painting"
- "One answered call pays for a year of service"
- Founder credibility: "Built by the owner of a $5M concrete cutting company"
**Changes:** Add `socialProof` field to prompt context, update prompt template.

### TASK-016: Reweight Platform Allocation
Current: equal 25% per platform. Research shows blue-collar trade owners are 70.4% Facebook, ~60% Instagram, ~70% YouTube, only 28.3% LinkedIn.
**New allocation:** Facebook 40%, Instagram 30%, YouTube 20%, LinkedIn 10%.
**Changes:** Update generation commands/defaults. Consider platform-specific creative strategies (vertical video for IG/YT, carousel for FB, professional copy for LI targeting larger operations).

### TASK-017: Add Junk Call Screening + Repeat Caller to Ad Copy
Two product features with real emotional resonance that aren't in any ads:
- **Junk call screening:** "Stop spam, robocalls, and dead-air dials from cluttering your day"
- **Repeat caller recognition:** "Hello again, Mike" — AI greets returning customers by name
**Changes:** Add to product description block in prompts, create junk-shield angle, add repeat-caller mention to solution/ai-employee angles.

### TASK-018: Improve Copy Diversity in Generation
Current ads are formulaic: `[busy moment]. [missed call]. [domain] answers. $39/mo. Trial.` After seeing 3, they become wallpaper.
**Missing emotional beats:**
- Guilt of checking voicemail at dinner and seeing 3 missed leads
- Frustration of paying for Google Ads then missing the calls they generate
- Embarrassment when a customer says "I called you three times"
- Relief of waking up to a text saying "3 jobs booked while you slept"
**Changes:** Add `emotionalScenarios` to trade context, update prompts with explicit diversity instructions ("Do NOT use the pattern [busy moment + missed call + domain answers]"), add more example tones per angle.

### ~~TASK-005: Apply Pending Doc Updates~~ (Done 2026-03-12)
Both items already covered by existing sections. AGENTS.md key files entry updated with fallback warning.

### TASK-006: Influencer Outreach
10 priority creators identified in `docs/influencer-outreach.md`. Outreach not started.
Start with lawn care (Mike Andes, Brian's Lawn) + HVAC (AC Service Tech, HVAC School).
Pipeline now trackable: `4h influencer seed` then `4h influencer list|update`.

### TASK-007: Seed Influencer Pipeline
Run `4h influencer seed` to populate the 10 creators from the shortlist into Supabase.
Then verify at https://pumpcans.com/influencer.

### TASK-010: Archive Old NB2 Ads
Run `4h ads archive --campaign-group nb2` to archive the 1,040 old NB2 ads before generating replacements.

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
- [x] Content rewrite: trade context, prompts, and validator rewritten to describe AI call-answering product
  - New interface: callScenarios, missedCallCost, busyMoment (replaces services/painPoints/tools)
  - Immutable product definition in prompt ("AI employee that answers calls 24/7")
  - New hard rule: copy must mention call/answer/phone/AI employee
  - Tighter char limits (250/80/40) to prevent truncation
  - coat.city fixed from "Epoxy" to "Painting"
- [x] 320 ads generated (old gen_ ads archived), all pending approval
- [x] 45 validator tests (141 total)

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
