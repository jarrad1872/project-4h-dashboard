# Project 4H - Build Plan

**Last updated:** 2026-04-28
**Owner:** Jarrad + Bob/Codex
**Live app:** https://pumpcans.com
**Product reference:** Answered.City / `sawcity-lite`
**Hard rule:** `sawcity-lite` is read-only. Do not edit, commit, push, migrate, or deploy it from this project.

---

## Mission

Build Project 4H into the acquisition operating system that gets Answered.City to **1,000-2,000 paying customers by 2026-12-31**.

That means 125-250 net new customers per month for the next eight months. 4H should not merely store ads. It should run the weekly growth loops that produce customers. After the 2026-04-28 Deep Research reset, the operating default is plumbing-first:

- `pipe.city` is the primary scale lane.
- ICP is the solo plumbing owner-operator answering calls from the jobsite.
- Activation means phone connected or forwarded, one real inbound call handled, owner summary/text received, lead/job captured, and the owner has not turned it off.
- `saw.city`, `rinse.city`, `lockout.city`, and `mow.city` stay available as supporting lanes, not co-equal launch priorities.

Weekly loops now prioritize:

- Direct install and founder demo loop
- Human field sales micro-pilot loop
- Creator proof amplification loop
- ChatGPT Pro image creative loop
- Demo-call and signup funnel loop
- Approval and launch governance loop
- Measurement and learning loop

Core offer rules:

- Price is always `$39/mo`.
- Trial is always `14-day free trial, no credit card required`.
- Ads use the trade-specific `.city` domain, not generic Saw.City branding.
- Nothing external launches without Jarrad approval.

---

## Current State

4H has useful infrastructure, but the system is not yet a customer machine.

- Dashboard exists and deploys on Vercel.
- Supabase APIs exist for ads, creators, creative assets, metrics, launch checklist, and budget.
- 1,000+ historical ads exist, but they are an archive until the new creative strategy proves signal.
- Creator pipeline exists, but it is now proof amplification behind direct pipe.city owner conversations.
- Creative asset tracking exists, but the new driver is ChatGPT Pro `chatgpt-image-latest`, not the older Gemini/NB2 flow.
- Metrics currently show no spend-to-customer signal.
- Deep Research reset is now encoded in `lib/customer-proof-sprint.ts`, Command, Sales, Templates, Scorecard, and this task board.

---

## Phased Build Approach

### Phase 0 - Rebase The Operating Surface

**Goal:** Make the dashboard tell every future agent what 4H is now.

**Exit gate:** Home page, nav, docs, and task board all point at the same strategy.

- [x] Rebuild `/` as the Answered.City acquisition command center.
- [x] Make `sawcity-lite` an explicit read-only reference.
- [x] Add first-principles rebuild state in `lib/4h-rebuild-data.ts`.
- [x] Simplify primary nav around Command, Creators, Creative Lab, Scorecard, Approval, Launch.
- [x] Document the rebuild direction in `README.md`.
- [x] Replace historical `TASKS.md` with this phased build plan.
- [x] Verify `npm test` and `npm run build`.

### Phase 1 - Instrument The Customer Funnel

**Goal:** Track the path from asset to paid customer before spending money.

**Exit gate:** Every approved external asset can be attributed to demo call, signup, activation, and paid conversion.

- [x] Define the event contract for `asset_view`, `demo_call`, `signup`, `trial_started`, `activated`, `paid`.
- [x] Add `creator_id`, `creative_asset_id`, `trade_slug`, `angle`, `platform`, `utm_content`, and `variant_id` to the attribution model.
- [x] Decide whether existing `marketing_events` is enough or whether 4H needs a new `growth_events` table.
- [x] Create Supabase migration for missing attribution fields/tables.
- [x] Add `/api/events` ingestion endpoint with validation and rate limits.
- [x] Update `/scorecard` to show demo calls, signups, activations, paid customers, CAC, and payback.
- [x] Add tests for event validation and scorecard aggregation.
- [x] Apply `011_marketing_events_attribution.sql` to linked Supabase project `vzawlfitqnjhypnkguas`.
- [ ] Verify with seeded local/test data before touching production rows.

### Phase 2 - Build The ChatGPT Pro Image Creative Factory

**Goal:** Make `chatgpt-image-latest` the production workflow for trade-specific visual creative.

**Exit gate:** Jarrad can generate, review, approve, and reuse image concepts without leaving 4H.

- [x] Create `lib/image-creative-briefs.ts` with reusable prompt briefs for the top five beachhead trades.
- [x] Cover four initial angles: missed-call, demo-call, owner-agent, and ROI math.
- [x] Add a strict prompt format: trade scene, owner context, visible proof, platform crop, forbidden elements.
- [x] Remove OpenAI image API hookup from the plan; use manual ChatGPT Pro generation instead.
- [x] Add an internal route for image concept briefs that saves metadata before asset upload.
- [x] Extend `creative_assets` for provider, model, prompt, source image, dimensions, and variant lineage.
- [x] Add a Creative Lab view for concept queue, variant sets, approval status, and launch readiness.
- [x] Keep all generated assets draft/review until Jarrad approves.
- [x] Add tests for prompt construction, validation, and save payloads.
- [x] Apply `012_creative_asset_lineage.sql` to linked Supabase project `vzawlfitqnjhypnkguas`.
- [x] Add storage upload path for generated image assets.
- [x] Add and seed the 20-prompt beachhead set: 5 trades x 4 angles, platform `multi`.
- [x] Add copy-ready generation packets for manual ChatGPT Pro image runs.
- [x] Add Q-01 image-pack progress bar and per-card generated image upload workflow.
- [x] Add Creative Lab filters for status, trade, angle, and generation state.
- [x] Add replacement variant workflow with parent/child lineage and stable v2/v3 IDs.
- [x] Add Claude Design handoff packet for Creative Lab UX polish.
- [x] Generate and upload the first complete beachhead image set.
- [x] Add founder-shot video asset tracker and copyable shoot packets.

### Phase 3 - Creator Demo Engine

**Goal:** Turn creators into the first scalable acquisition channel.

**Exit gate:** 30 qualified creators, 10 approved outreach drafts, 3 live creator tests, all tracked.

- [x] Audit the current creator shortlist and label weak/non-trade matches without deleting history.
- [x] Add creator scoring fields that matter for trades: owner audience, average views, sponsor openness, trust level, trade fit, and production value.
- [x] Generate outreach drafts tied to a specific trade demo and offer.
- [x] Add Jarrad approval controls for outreach copy.
- [x] Track outreach states: qualified, approved, sent, follow-up due, replied, contracted, content live, paid.
- [x] Add creator-specific UTM/referral code generation.
- [x] Add content brief templates for demo-call videos, founder-assisted creator posts, and screenshot-proof assets.
- [x] Add Arizona human sales rep pilot with rep-coded cards, field-sales UTMs, and mini CRM stages.
- [x] Persist human sales CRM rows with real-vs-archetype safeguards.
- [ ] Verify that every live creator asset lands in the scorecard.

### Phase 4 - Landing And Trial Path Alignment

**Goal:** Ensure traffic sees the same promise that made them click.

**Exit gate:** 4H can generate approved launch URLs and message-match briefs without editing sawcity-lite.

- [x] Inventory the live trade domains and demo phone numbers from read-only sawcity-lite reference files.
- [x] Create 4H-owned launch URL builder with UTM and angle metadata.
- [x] Create message-match briefs for each angle that Jarrad can hand to the sawcity-lite project later.
- [ ] Do not edit sawcity-lite landing pages from this repo.
- [x] Add a launch-readiness check that blocks assets missing trade domain, price, trial, UTM, or approval.
- [x] Add tests for URL generation and hard-rule validation.

### Phase 5 - Paid Channel Launch System

**Goal:** Launch only the smallest paid tests that can teach us what converts.

**Exit gate:** First controlled paid tests are approved, prepared through the shared app/CLI launch contract, launched only after exact approval, and tracked end to end.

- [x] Archive or label historical ads so they cannot be mistaken for current launch candidates.
- [x] Create launch bundles: trade, angle, image, copy, creator/proof asset, URL, budget, approval.
- [x] Add budget allocation by experiment, not only by platform.
- [x] Add preflight checks for price, trial, domain, UTM, creative approval, and Jarrad approval.
- [x] Add import/export format for Meta, YouTube, LinkedIn, and Instagram upload sheets.
- [x] Add an agentic launch control contract usable from the app, Codex, or Claude Code CLI.
- [ ] Wire external ad/outreach/webhook/spend adapters only after Jarrad approves the exact platform/account/action.

### Phase 6 - Weekly Learning Loop

**Goal:** Make 4H tell us what to do next every week.

**Exit gate:** Weekly report recommends keep/kill/scale decisions from real data.

- [x] Update weekly report to rank trades, creators, images, and angles by paid conversion.
- [x] Add experiment notes and decision status: keep, kill, iterate.
- [x] Add creative fatigue and variant lineage tracking.
- [x] Add competitor/ad-library research only after Meta access is validated.
- [x] Add a simple forecast: customers needed this month, current pace, gap, and next bets.
- [x] Add trade-level weekly target calculator for the five beachhead domains.
- [x] Add lifecycle follow-up measurement after signup.

---

## Active Sprint

### Sprint 1 - Foundation For Real Signal

**Target:** Finish the instrumentation and creative factory foundation before any campaign launch.

- [x] Rebuilt command homepage.
- [x] Added rebuild data model.
- [x] Updated docs and task board.
- [x] Design attribution schema for events and scorecard.
- [x] Implement event ingestion and scorecard aggregation.
- [x] Add ChatGPT Pro `chatgpt-image-latest` creative brief module.
- [x] Add Creative Lab fields for prompt/model/variant lineage.
- [x] Write tests for event validation.
- [x] Write tests for image prompt validation.

### Standing Queue

The majority rebuild queue now lives in `docs/build-queue.md` and is mirrored on the command page. Future agents should pick the first ready item that does not require Jarrad approval, complete it, verify it, update docs, and keep moving.

- [x] Queue phases 2-6 as ordered work packets.
- [x] Mark approval-gated items so agents stop before external actions.
- [x] Surface the next ready work on `/`.
- [x] Work through Q-01 through Q-24 governance/build queue items. Current: Q-01 through Q-24 complete; no ready queue item remains.
- [x] Start the next first-principles queue with Q-25 trade weekly targets on `/scorecard`.
- [x] Add Q-26 founder video asset tracking on `/assets`.
- [x] Add Q-27 lifecycle follow-up measurement on `/lifecycle`.
- [x] Add Q-28 creative fatigue and variant lineage tracking on `/assets`.
- [x] Add Q-29 creator outreach state tracking on `/influencer`.
- [x] Add Q-30 Codex browser flow hooks on `/influencer`.
- [x] Add Q-31 human sales rep pipeline and print-ready business cards on `/sales`.
- [x] Add Q-32 persistent sales CRM lead creation/update on `/sales`.
- [x] Add Q-33 field-sales attribution measurement on `/sales`.
- [x] Add Q-34 weekly Arizona rep operating packet on `/sales`.
- [x] Add Q-35 primary nav cleanup and route disposition plan.
- [x] Add Q-36 legacy/superseded banners to archived original-build routes.
- [x] Add Q-37 lifecycle/template support summaries to Command and Scorecard.
- [x] Add Q-38 route retirement decision matrix before any route deletion or redirect.
- [x] Add Q-39 route retirement dependency guard before any redirect/delete packet.
- [x] Add Q-40 campaign-flow link migration off `/creatives` and `/workflow`.
- [x] Add Q-41 public creative URL dependency map before `/creatives` redirect work.
- [x] Add Q-42 bulk workflow history dependency map before `/workflow` redirect work.
- [x] Add Q-43 legacy settings source-note extraction before `/settings` delete work.
- [x] Add Q-44 legacy GTM product-route inventory preservation before `/gtm` archive-only work.
- [x] Add Q-45 historical ad archive audit map before `/ads` archive-only work.
- [x] Add Q-46 clear-route cleanup packet before any redirect/delete/archive-only implementation.
- [x] Add Q-47 legacy AI Studio redirect packet from `/generate` to `/assets`.
- [x] Add Q-48 legacy GTM archive-only packet.
- [x] Add Q-49 legacy Settings cleanup packet.
- [x] Add Q-50 Ad Archive read-only hardening.
- [x] Add Q-51 blocked-route cleanup packet drafts.
- [x] Add Q-52 Creatives static URL guard resolution packet.
- [x] Add Q-53 Creatives page redirect packet with after-checks.
- [x] Add Q-54 Workflow ownership guard resolution packet.
- [x] Add Q-55 Workflow page redirect packet.
- [x] Add Q-56 launch operating decisions.
- [x] Add Q-57 agentic launch control for app/CLI orchestration.
- [x] Add Q-58 pain-signal lead finder roadmap on `/sales`.
- [x] Add Q-59 founder demo script factory on `/templates`.
- [x] Add Q-60 objection bank on `/sales`.
- [x] Add Q-61 live proof packets on `/templates`.
- [x] Add Q-62 first-10 customer sprint board on `/sales` and Command.
- [x] Add Q-63 channel experiment ledger on `/scorecard`.
- [x] Add Q-64 strategy reset packet: Command, README, TASKS, SOP, and build queue now point at the plumbing-first urgent-call wedge.
- [x] Add Q-65 activation hardening: activation requires phone connected/forwarded, real call handled, owner summary/text, lead/job captured, and owner retention.
- [x] Add Q-66 pipe.city 30-day proof sprint board on `/sales` with target rows, stages, objections, next actions, and proof status.
- [x] Add Q-67 pipe.city demo proof pack on `/templates` and Command.
- [x] Add Q-68 approval-ready outreach draft packets as review-only copy with no send path.
- [x] Add Q-69 weekly customer machine scorecard around paid customers, activated trials, CAC per activated trial, demo calls, activation quality, and owner conversations.
- [x] Add Q-70 channel priority recut so direct install outranks creator and paid until proof gates are met.
- [x] Add Q-71 Google Maps review-signal import plan with manual/API/provider workflow and compliance gates.
- [x] Add Q-72 Deep Research verdict shelf on Command/Templates.
- [x] Add Dustin Bouwhuis pipe.city business-card proof set with three print-ready Jobsite-design concepts, full-bleed pipe.city hero backgrounds, `DUSTINAZ` tracking, demo line `(385) 475-3881`, and AI Agent positioning.
- [x] Promote the approved Dustin business-card direction on `/sales` as a front/back proof board so the app view matches the print exports rather than showing a disconnected chat-only concept.
- [x] Add the creative source-of-truth rule: generated image artifacts are the finished creative for ads, proof sheets, business cards, creator frames, and campaign mockups; coded recreations are wireframes or legacy utilities only.
- [x] Add Dustin Field Mode: limited rep access-code support, mobile quick-add CRM fields, fast stage buttons, tracked card scan route, and public demo landing page without outreach, billing, webhooks, ads, or money movement.
- [x] Add Vistaprint-ready Dustin card files: six 2172x1272 high-resolution PNGs plus a downloadable print-pack ZIP, so uploads contain crisp text/QR/demo details baked into the artwork.

---

## Blocked Or Requires Jarrad

- [x] Confirm which five trades are the first launch beachhead: `saw.city`, `pipe.city`, `mow.city`, `rinse.city`, `lockout.city`.
- [x] Confirm creator outreach can begin after drafts are approved in 4H.
- [x] Confirm ad accounts and billing remain manual at first.
- [x] Confirm final approval workflow for generated image uploads: Jarrad sign-off.
- [ ] Approve any external campaign, creator send, ad upload, webhook, or spend.

---

## Backlog

- [x] Claude Design handoff packet for Creative Lab UI once data model is stable.
- [x] Competitive research agent using validated Meta Ad Library access.
- [x] Competitive research report template.
- [x] Launch bundle exporter for platform upload sheets.
- [x] Experiment-level budget planner for first paid tests.
- [x] Founder video asset tracker.
- [x] Trade-level weekly target calculator.
- [x] Lifecycle follow-up measurement after signup.
- [x] Approval audit log for external launch decisions.
- [x] External-action stop screen for launch, upload, outreach send, webhook, and spend actions.
- [x] Agentic launch control contract for app, Codex, and Claude Code.
- [x] Customer proof sprint for Q-58 through Q-63.
- [x] Detailed Google Maps/manual review-signal lead finder roadmap.
- [x] Founder demo script factory for the five beachhead domains.
- [x] Live proof packets tied to demo phones, screenshot checklist, and tracked paths.
- [x] First-10 customer attempt board.
- [x] Channel experiment ledger for review-signal outbound, founder video, field sales, creator demos, and paid social.
- [x] Plumbing-first Deep Research reset for Q-64 through Q-72.
- [x] Strict activated-trial definition shared by Command, Sales, Scorecard, Lifecycle docs, and tests.
- [x] Pipe.city 30-day proof sprint board with 50-100 target capacity.
- [x] Approval-ready outreach draft packets that cannot send.
- [x] Channel priority recut that keeps paid social gated until proof exists.
- [x] Weekly learning report rankings for trades, creators, images, and angles.
- [x] Local reversible keep/kill/iterate decision board.
- [x] Creator outreach state tracker.
- [x] Codex browser flow hooks for permanent creator testing.
- [x] Human sales rep pipeline and business card print assets.
- [x] Persistent field-sales CRM with archetype safeguards.
- [x] Field-sales attribution panel for scans, demos, trials, and paid signal.
- [x] Weekly field-sales operating packet for route planning and follow-up cadence.
- [x] Primary nav cleanup with original-build routes moved to a Reference Shelf.
- [x] Add legacy/superseded banners to archived original-build routes.
- [x] Fold lifecycle/template summaries into active Command or Scorecard loops.
- [x] Create route retirement decision matrix for remaining archive/support routes.
- [x] Add route dependency guard for future redirect/delete decisions.
- [x] Migrate stale campaign-flow links from legacy routes to active lanes.
- [x] Preserve public `/creatives/*.jpg` URL dependency map before route retirement.
- [x] Preserve bulk `/workflow` history dependencies before route retirement.
- [x] Preserve unique `/settings` source notes before route retirement.
- [x] Preserve legacy `/gtm` product-route inventory context before route retirement.
- [x] Preserve historical `/ads` audit context before route retirement.
- [x] Draft clear-route cleanup packet for legacy route candidates.
- [x] Apply first clear-route cleanup packet for `/generate`.
- [x] Apply archive-only cleanup packet for `/gtm`.
- [x] Apply cleanup packet for `/settings`.
- [x] Harden `/ads` as archive-only reference.
- [x] Draft blocked cleanup packets for `/creatives` and `/workflow`.
- [x] Run and document all-public-creative-URL 200 checks before any `/creatives` redirect.
- [x] Redirect `/creatives` page route to `/assets` and re-check all static URLs.
- [x] Document workflow ownership before any `/workflow` redirect.
- [x] Redirect `/workflow` page route to `/launch` after ownership guard resolution.

---

## Historical Work Already Done

Keep this compact. Detailed history exists in git.

- Dashboard shell, APIs, and Vercel deployment exist.
- Supabase migrations 001-010 exist.
- Ad copy generation, validator, approval queue, metrics import, budget, launch checklist, and Telegram reporting exist.
- Creator pipeline and influencer seed idempotency work exists.
- Competitive research foundation exists, but live Meta access still needs validation.
- Historical NB2/Gemini creative and ad libraries exist, but they are not the default strategy for this rebuild.

---

## Verification Rules

Before reporting a task done:

- Run `npm test`.
- Run `npm run build`.
- If DB changes were made, verify rows/schema in Supabase or through the API.
- If deployment happens, verify Vercel deployment and production route health.
- If docs or operating behavior changed, update `README.md`, `TASKS.md`, or `SOP-WORKFLOW.md` in the same commit.
