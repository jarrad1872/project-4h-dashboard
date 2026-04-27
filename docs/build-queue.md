# Project 4H Build Queue

Last updated: 2026-04-27

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

## Ready Queue

| ID | Phase | Lane | Work | Approval | Acceptance |
| --- | --- | --- | --- | --- | --- |
| — | — | — | No ready queue items remain | — | Add the next first-principles build packet before continuing. |

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
