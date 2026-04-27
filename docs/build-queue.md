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
| Q-02 | Phase 2 | Creative | Add Creative Lab filters | 2026-04-27 | `/assets` filters by status, trade, angle, and generation state without reload. |
| Q-03 | Phase 2 | Creative | Add variant replacement workflow | 2026-04-27 | `/assets` can create v2/v3 replacement prompts with parent/child lineage and stable variant IDs. |
| Q-04 | Phase 2 | Creative | Create Claude Design handoff packet | 2026-04-27 | `docs/claude-design-creative-lab-handoff.md` captures UX goals, data model, routes, screenshots, and constraints. |
| Q-05 | Phase 3 | Creators | Audit creator shortlist | 2026-04-27 | `/influencer` labels creators as keep/maybe/remove/needs-research without deleting history. |
| Q-06 | Phase 3 | Creators | Upgrade creator scoring model | 2026-04-27 | `/influencer` renders owner audience, trade fit, average views, trust, sponsor, and production value scores. |
| Q-08 | Phase 3 | Creators | Add creator UTM builder | 2026-04-27 | `/influencer` builds deterministic creator referral URLs with creator, trade, platform, campaign, and content IDs. |
| Q-09 | Phase 3 | Creators | Build content brief templates | 2026-04-27 | `/templates` includes demo-call, founder assist, and screenshot-proof packets with hook, shots, CTA, offer, and tracking guidance. |
| Q-10 | Phase 4 | Landing | Inventory read-only product routes | 2026-04-27 | `/gtm` shows 21 copied product routes, including five beachhead domains with landing root, signup path, and demo phone numbers. |
| Q-11 | Phase 4 | Landing | Create launch URL builder | 2026-04-27 | `/launch` builds deterministic trade/domain URLs with AGENTS-format paid-social UTMs plus creator, asset, and angle metadata. |
| Q-12 | Phase 4 | Landing | Create message-match briefs | 2026-04-27 | `/templates` includes 20 beachhead handoff briefs across five domains and four angles with headline promise, proof, offer, and trial. |
| Q-13 | Phase 4 | Landing | Add launch readiness validator | 2026-04-27 | `/launch` returns actionable preflight blockers for URL, domain, UTM, offer, trial, checklist, creative approval, copy approval, and Jarrad approval state. |
| Q-14 | Phase 5 | Launch | Archive historical ad library | 2026-04-27 | `/ads` separates current candidates from historical archive rows, labels old NB2/imported/Saw.City ads, and preserves copy without deletion. |
| Q-15 | Phase 5 | Launch | Build launch bundle model | 2026-04-27 | `/launch` shows an internal bundle draft tying trade, angle, image asset, copy, URL, budget, readiness, and approvals without launching. |

## Ready Queue

| ID | Phase | Lane | Work | Approval | Acceptance |
| --- | --- | --- | --- | --- | --- |
| Q-01 | Phase 2 | Creative | Generate first beachhead image pack | None | In progress. Production desk, progress bar, copy packets, and per-card upload are ready. Finish by generating and uploading all 20 images. |
| Q-07 | Phase 3 | Creators | Draft creator outreach packets | Review required | 10 drafts exist, but nothing is sent. |
| Q-16 | Phase 5 | Launch | Add experiment budget allocation | None | Planning state only; no billing changes. |
| Q-17 | Phase 5 | Launch | Create platform upload sheets | Review required | Local/download exports only; no platform upload. |
| Q-18 | Phase 6 | Learning | Upgrade weekly report | None | Ranks trades, creators, images, and angles with honest zero-data states. |
| Q-19 | Phase 6 | Learning | Add keep/kill/iterate decisions | None | Decisions are visible, reversible, and timestamped. |
| Q-20 | Phase 6 | Learning | Add customer pace forecast | None | Shows target, current pace, gap, and next bet using real paid data when available. |
| Q-21 | Phase 6 | Research | Validate Meta Ad Library access | None | Report separates official API limits from assumptions. |
| Q-22 | Phase 6 | Research | Create competitor research template | None | Template captures offers, hooks, visuals, platforms, evidence quality, and citation fields. |
| Q-23 | Governance | Safety | Add approval audit log | None | Audit covers creative, outreach, launch bundle, and export approvals. |
| Q-24 | Governance | Safety | Add external-action stop screen | None | UI explains exact approval needed and performs no external API action. |

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
