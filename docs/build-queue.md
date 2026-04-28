# Project 4H Build Queue

Last updated: 2026-04-28

This is the standing queue for Codex/Bob work. Pick the first ready item that does not require Jarrad approval, complete it end to end, update docs, run tests/build/browser verification, then continue to the next ready item.

## Rules

- Do not edit `sawcity-lite`; use it only as read-only reference.
- Do not send outreach, launch ads, upload to ad platforms, create webhooks, or spend money.
- If an item says `review-required`, build the draft/review surface but stop before the external action.
- Keep generated image work in the ChatGPT Pro workflow using `chatgpt-image-latest`; no OpenAI image API hookup.
- Preserve offer rules: `$39/mo`, `14-day free trial, no credit card required`, and trade-specific `.city` domains.

## Completed Queue Items

| ID | Phase | Lane | Work | Completed | Evidence |
| --- | --- | --- | --- | --- | --- |
| Q-01 | Phase 2 | Creative | Generate first beachhead image pack | 2026-04-27 | `/assets` shows 20/20 beachhead prompt cards generated and in review, with deployable Q-01 PNG assets for five trades x four angles. |
| Q-02 | Phase 2 | Creative | Add Creative Lab filters | 2026-04-27 | `/assets` filters by status, trade, angle, and generation state without reload. |
| Q-03 | Phase 2 | Creative | Add variant replacement workflow | 2026-04-27 | `/assets` can create v2/v3 replacement prompts with parent/child lineage and stable variant IDs. |
| Q-04 | Phase 2 | Creative | Create Claude Design handoff packet | 2026-04-27 | `docs/claude-design-creative-lab-handoff.md` captures UX goals, data model, routes, screenshots, and constraints. |
| Q-05 | Phase 3 | Creators | Audit creator shortlist | 2026-04-27 | `/influencer` labels creators as keep/maybe/remove/needs-research without deleting history. |
| Q-06 | Phase 3 | Creators | Upgrade creator scoring model | 2026-04-27 | `/influencer` renders owner audience, trade fit, average views, trust, sponsor, and production value scores. |
| Q-07 | Phase 3 | Creators | Draft creator outreach packets | 2026-04-27 | `/influencer` shows the Q-07 outreach packet counter and 10 internal creator drafts queued for review; no email or external send action is performed. |
| Q-08 | Phase 3 | Creators | Add creator UTM builder | 2026-04-27 | `/influencer` builds deterministic creator referral URLs with creator, trade, platform, campaign, and content IDs. |
| Q-09 | Phase 3 | Creators | Build content brief templates | 2026-04-27 | `/templates` includes demo-call, founder assist, and screenshot-proof packets with hook, shots, CTA, offer, and tracking guidance. |
| Q-10 | Phase 4 | Landing | Inventory read-only product routes | 2026-04-27 | `/gtm` shows 21 copied product routes, including five beachhead domains with landing root, signup path, and demo phone numbers. |
| Q-11 | Phase 4 | Landing | Create launch URL builder | 2026-04-27 | `/launch` builds deterministic trade/domain URLs with AGENTS-format paid-social UTMs plus creator, asset, and angle metadata. |
| Q-12 | Phase 4 | Landing | Create message-match briefs | 2026-04-27 | `/templates` includes 20 beachhead handoff briefs across five domains and four angles with headline promise, proof, offer, and trial. |
| Q-13 | Phase 4 | Landing | Add launch readiness validator | 2026-04-27 | `/launch` returns actionable preflight blockers for URL, domain, UTM, offer, trial, checklist, creative approval, copy approval, and Jarrad approval state. |
| Q-14 | Phase 5 | Launch | Archive historical ad library | 2026-04-27 | `/ads` separates current candidates from historical archive rows, labels old NB2/imported/Saw.City ads, and preserves copy without deletion. |
| Q-15 | Phase 5 | Launch | Build launch bundle model | 2026-04-27 | `/launch` shows an internal bundle draft tying trade, angle, image asset, copy, URL, budget, readiness, and approvals without launching. |
| Q-16 | Phase 5 | Launch | Add experiment budget allocation | 2026-04-27 | `/budget` allocates local planning budgets by experiment, clamps to remaining channel budget, and does not update billing, ad accounts, webhooks, or stored spend. |
| Q-17 | Phase 5 | Launch | Create platform upload sheets | 2026-04-27 | `/launch` generates local review-only CSV previews/downloads for the selected bundle, including Meta, LinkedIn, YouTube, and Instagram rows; no platform API upload happens. |
| Q-18 | Phase 6 | Learning | Upgrade weekly report | 2026-04-27 | `/scorecard` ranks trades, creators, images, and angles from attribution events, with explicit zero-data states when paid signal is missing. |
| Q-19 | Phase 6 | Learning | Add keep/kill/iterate decisions | 2026-04-27 | `/scorecard` records local keep/kill/iterate decisions with timestamps, notes, undo, and visible history without external actions. |
| Q-20 | Phase 6 | Learning | Add customer pace forecast | 2026-04-27 | `/scorecard` shows target range, logged paid customers, current pace, projected gap to 1,000/2,000, and a next bet based only on real paid rows. |
| Q-21 | Phase 6 | Research | Validate Meta Ad Library access | 2026-04-27 | `/templates` shows official Meta API limits, assumptions to validate, and the manual-first competitor research path without scraping or scheduling collectors. |
| Q-22 | Phase 6 | Research | Create competitor research template | 2026-04-27 | `/templates` includes a copyable manual-first competitor research template with offers, hooks, visuals, platforms, evidence quality, citations, and blocked overclaim rules. |
| Q-23 | Governance | Safety | Add approval audit log | 2026-04-27 | `/approval` shows internal audit coverage for ad copy, creative, outreach, launch bundle, and export approvals with recent who/when/what/why activity. |
| Q-24 | Governance | Safety | Add external-action stop screen | 2026-04-27 | `/launch` shows a stop screen for launch, upload, outreach send, webhook, and spend actions with exact approval requirements and no external API action. |
| Q-25 | Phase 6 | Learning | Add trade weekly target calculator | 2026-04-27 | `/scorecard` turns the 1,000-2,000 customer deadline into weekly low/high paid-customer targets for the five beachhead domains using attribution-only paid counts. |
| Q-26 | Phase 2 | Creative | Add founder video asset tracker | 2026-04-27 | `/assets` tracks 10 founder-shot proof clips for five beachhead domains across missed-call and demo-proof angles with copyable shoot packets and approval gates. |
| Q-27 | Phase 6 | Learning | Add lifecycle follow-up measurement | 2026-04-27 | `/lifecycle` measures signup-to-trial, trial-to-activation, and activation-to-paid movement from attribution events with no send or webhook action. |
| Q-28 | Phase 6 | Learning | Add creative fatigue and variant lineage tracking | 2026-04-27 | `/assets` groups image assets into prompt/variant families and flags high-view, low-signal creative fatigue from attribution events only. |
| Q-29 | Phase 3 | Creators | Add creator outreach state tracker | 2026-04-27 | `/influencer` groups creators into qualified, approved, sent, follow-up due, replied, contracted, content-live, and paid stages without sending messages or moving money. |
| Q-30 | Governance | Testing | Add Codex browser flow test hooks | 2026-04-27 | `/influencer` exposes stable browser selectors for creator form fields, rows, cards, and draft actions so permanent flows can be tested by creating internal fake rows only. |
| Q-31 | Phase 3 | Field Sales | Add human sales rep pipeline and print-ready cards | 2026-04-27 | `/sales` shows the Arizona founding rep pilot, CRM stages, rep-coded field-sales URLs, and QR-backed SVG/PNG business card exports without ordering cards or sending outreach. |
| Q-32 | Phase 3 | Field Sales | Persist sales CRM leads with archetype safeguards | 2026-04-27 | `/sales` can create/update internal sales leads through guarded API routes; archetypes are visibly separated and cannot be marked contacted, demo-booked, activated, or paid. |
| Q-33 | Phase 3 | Field Sales | Add field-sales attribution measurement | 2026-04-27 | `/sales` reads `marketing_events` for rep-coded field-sales UTMs and card metadata, then shows scans, demos, trials, paid signal, and top rep/card/trade buckets without sending outreach or taking external action. |
| Q-34 | Phase 3 | Field Sales | Add weekly AZ rep operating packet | 2026-04-27 | `/sales` turns CRM rows and field-sales attribution into a weekly rep packet with touch targets, cards to carry, priority rows, daily cadence, and explicit no-external-action boundaries. |
| Q-35 | Governance | Navigation | Clean primary nav and route disposition plan | 2026-04-27 | Sidebar now shows active growth loops and launch governance first, moves original-build pages into a collapsed Reference Shelf, and documents route disposition in `docs/route-disposition-plan.md`. |
| Q-36 | Governance | Navigation | Add legacy banners to old pages | 2026-04-27 | `/ads`, `/generate`, `/gtm`, `/settings`, `/creatives`, and `/workflow` now show a route disposition banner with active replacement links and no-external-action boundaries. |
| Q-37 | Phase 6 | Learning | Fold lifecycle/template summaries into active loops | 2026-04-27 | Command and Scorecard now expose lifecycle follow-up status plus template/message-match support signals, while `/lifecycle` and `/templates` remain direct-link support routes. |
| Q-38 | Governance | Navigation | Create route retirement decision matrix | 2026-04-27 | Command and `docs/route-disposition-plan.md` now classify leftover routes as rebuild, redirect, archive, or delete-later recommendations with no destructive action allowed. |
| Q-39 | Governance | Navigation | Add route retirement dependency guard | 2026-04-27 | Command now shows dependency status for each leftover route; after Q-51, the guard has 2 blocked, 2 support, and 4 already-applied clear routes with active refs, data deps, docs/tests, and guardrails before any redirect/delete packet. |
| Q-40 | Governance | Navigation | Migrate stale campaign-flow links off legacy routes | 2026-04-27 | Creator campaign-flow data now points to `/assets`, `/approval`, `/launch`, and `/scorecard` instead of legacy `/creatives` and `/workflow`, without redirecting or deleting those pages. |
| Q-41 | Governance | Navigation | Preserve public creative URL dependency map | 2026-04-27 | Command now shows the 24 static `/creatives/*.jpg` URL dependencies separately from the legacy `/creatives` page route, with tests confirming the files still exist. |
| Q-42 | Governance | Navigation | Preserve bulk workflow history before redirect work | 2026-04-27 | Command now shows the six-stage `/workflow` history map, five bulk transitions, API/fallback dependencies, and no-external-action boundaries before any redirect work. |
| Q-43 | Governance | Navigation | Extract legacy settings source notes | 2026-04-27 | Command now shows `/settings` setup notes, read-only source doc paths, campaign-status context, and doc-update reminders outside the legacy page before delete-later work. |
| Q-44 | Governance | Navigation | Preserve legacy GTM product-route inventory | 2026-04-27 | Command now shows `/gtm` product-route inventory context, beachhead demo lines, and read-only sawcity-lite evidence outside the legacy GTM board. |
| Q-45 | Governance | Navigation | Preserve historical ad archive audit map | 2026-04-27 | Command now shows `/ads` archive classifier signals, current/historical row counts, dependencies, and no-external-action boundaries before archive-only work. |
| Q-46 | Governance | Navigation | Draft clear-route cleanup packet | 2026-04-27 | Command now groups `/ads`, `/generate`, `/gtm`, and `/settings` into a draft cleanup packet with preservation evidence and blocked actions before route implementation work. |
| Q-47 | Governance | Navigation | Apply legacy AI Studio redirect packet | 2026-04-27 | `/generate` now redirects internally to `/assets`; legacy API routes stay untouched and no external action is performed. |
| Q-48 | Governance | Navigation | Apply legacy GTM archive-only packet | 2026-04-27 | `/gtm` now redirects internally to Command; product-route inventory remains preserved on Command/docs and sawcity-lite is untouched. |
| Q-49 | Governance | Navigation | Apply legacy Settings cleanup packet | 2026-04-27 | `/settings` now redirects internally to Approval; setup/source notes remain preserved and placeholder credentials no longer render on the page. |
| Q-50 | Governance | Navigation | Harden Ad Archive as read-only reference | 2026-04-27 | `/ads` now displays archive rows as read-only reference, removes create/edit/pause/regenerate affordances, and redirects `/ads/[id]` back to the archive. |
| Q-51 | Governance | Navigation | Draft blocked-route cleanup packets | 2026-04-27 | Command now shows blocked-route packet drafts for `/creatives` and `/workflow`, including static 200 checks and workflow-history preservation requirements before any future redirect work. |
| Q-52 | Governance | Navigation | Resolve Creatives static URL guard | 2026-04-27 | `/creatives` plus all 24 public `/creatives/*.jpg` URLs returned 200 locally, evidence is documented, and `/creatives` is clear for a future page-route redirect packet. |
| Q-53 | Governance | Navigation | Apply Creatives page redirect packet | 2026-04-27 | `/creatives` now redirects internally to `/assets`, and all 24 public `/creatives/*.jpg` URLs still return 200 as static JPEGs. |
| Q-54 | Governance | Navigation | Resolve Workflow ownership guard | 2026-04-27 | `/workflow` ownership is documented across Approval, Launch, bulk-status API, fallback data, and workflow-history; no redirect or bulk mutation happened. |
| Q-55 | Governance | Navigation | Apply Workflow page redirect packet | 2026-04-27 | `/workflow` now redirects internally to `/launch`, while Command keeps the workflow history/ownership map and the direct-link bulk mutation UI is no longer reachable from `/workflow`. |
| Q-56 | Governance | Launch | Lock launch operating decisions | 2026-04-27 | First launch beachheads are `saw.city`, `pipe.city`, `mow.city`, `rinse.city`, and `lockout.city`; creator outreach drafts can move after approval, but sends still need action-time approval; billing stays manual at first; generated image uploads require Jarrad sign-off. |
| Q-57 | Phase 5 | Launch | Add agentic launch control | 2026-04-28 | `/launch`, `/api/launch/orchestrate`, and `npm run cli -- launch plan/prepare/execute` now share one launch contract for app, Codex, and Claude Code. Internal bundle/sheet prep is agentic; external adapters remain approval-gated and unconfigured. |
| Q-58 | Customer Proof | Research | Add pain-signal lead finder | 2026-04-28 | `/sales` and `docs/google-maps-pain-signal-roadmap.md` now document manual/API-first Google Maps review-signal prospecting, capture fields, scoring, and blocked scraping/evasion tactics. |
| Q-59 | Customer Proof | Founder Proof | Add founder demo script factory | 2026-04-28 | `/templates` now has copy-ready founder demo scripts for the five beachhead domains and live demo lines, with no publishing action. |
| Q-60 | Customer Proof | Sales Learning | Add objection bank | 2026-04-28 | `/sales` now shows buyer objections, what they mean, field responses, and proof needed without triggering follow-up sends. |
| Q-61 | Customer Proof | Demo Proof | Add live proof packets | 2026-04-28 | `/templates` now exposes live proof packets with demo phone, call prompt, AI capture checklist, screenshot checklist, and tracked proof path. |
| Q-62 | Customer Proof | Pipeline Focus | Add 10-customer sprint board | 2026-04-28 | `/sales` and Command now focus the next motion on ten internal customer-attempt hypotheses before broad paid scale. |
| Q-63 | Customer Proof | Learning | Add channel experiment ledger | 2026-04-28 | `/scorecard` now compares review-signal outbound, founder video, field sales, creator demos, and paid social by weekly inputs, success metric, kill criteria, and evidence strength. |

## Ready Queue

| ID | Phase | Lane | Work | Approval | Acceptance |
| --- | --- | --- | --- | --- | --- |
| _None_ | - | - | Queue clear after Q-63 | - | Pick the next first-principles build item only after adding it to this queue with acceptance criteria. |

## Stop Conditions

Stop and ask Jarrad before:

- Sending a creator message or email.
- Uploading to an ad platform.
- Launching or editing a campaign.
- Creating an external webhook.
- Moving money or changing billing.
- Editing `sawcity-lite`.

## Verification

Every completed item needs:

- `npm test`
- `npm run build`
- `git diff --check`
- In-app browser check on the changed route
- TASKS/SOP/README update if behavior changed
