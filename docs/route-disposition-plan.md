# Project 4H Route Disposition Plan

Last updated: 2026-04-27

Q-35 cleans up the leftover original-build surface without deleting useful history. The rule is simple: the sidebar should show the current Answered.City growth operating system, while old pages stay reachable by direct link until they are rebuilt, folded into a current loop, or intentionally retired.

## Primary Navigation

These are the active operating lanes:

| Route | Label | Role |
| --- | --- | --- |
| `/` | Command | Daily growth command center and build queue. |
| `/influencer` | Creators | Creator demo pipeline and approval-gated outreach drafts. |
| `/sales` | Sales | Human field sales CRM, cards, attribution, and rep packets. |
| `/assets` | Creative Lab | ChatGPT Pro image workflow, variants, uploads, and creative fatigue. |
| `/scorecard` | Scorecard | Attribution, weekly learning, decisions, and customer pace. |
| `/approval` | Approval | Internal approval queue and audit coverage. |
| `/launch` | Launch | Launch URLs, bundles, stop screen, and upload-sheet review. |
| `/budget` | Budget | Experiment-level budget planning only. |

## Reference Shelf

These routes are not active operating lanes. They remain available from the collapsed Reference Shelf or direct links while we decide whether to retire, redirect, or rebuild them.

| Route | Current disposition | Why |
| --- | --- | --- |
| `/ads` | Keep as archive | Historical ads are useful, but not current launch candidates. |
| `/generate` | Legacy reference | Old AI Studio/Gemini flow is superseded by ChatGPT Pro Creative Lab. |
| `/gtm` | Legacy reference | Original GTM board and route inventory; current command surface is `/`. |
| `/settings` | Legacy reference | Old source-doc/settings view; not part of weekly growth operation. |
| `/creatives` | Direct-link archive | Original asset repository, superseded by `/assets`. |
| `/workflow` | Direct-link archive | Old concept-to-live workflow, superseded by queue and launch governance. |
| `/templates` | Support route | Still useful for handoff templates; summarized from Command and Scorecard after Q-37. |
| `/lifecycle` | Support route | Still useful for lifecycle measurement; summarized from Command and Scorecard after Q-37. |

## Cleanup Sequence

1. Q-35: Move legacy routes out of primary nav and document disposition.
2. Q-36: Add legacy banners to old pages so no one mistakes them for active lanes. Complete for `/ads`, `/generate`, `/gtm`, `/settings`, `/creatives`, and `/workflow`.
3. Q-37: Fold useful template/lifecycle summaries into Command or Scorecard. Complete for Command and Scorecard.
4. Q-38: Decide route-by-route: rebuild, redirect, archive, or delete. Do not delete or redirect routes in the decision packet.
5. Q-39: Add dependency guard before any route retirement packet. Complete on Command with active refs, data deps, docs/tests, and guardrails.
6. Q-40: Migrate stale creator campaign-flow links off `/creatives` and `/workflow`. Complete; no redirects or deletions.
7. Q-41: Inventory static `/creatives/*.jpg` URLs separately from the `/creatives` page route. Complete; no redirects, deletions, or asset moves.
8. Q-42: Inventory legacy `/workflow` bulk history separately from the `/workflow` page route. Complete; no redirects, deletions, or external actions.
9. Q-43: Extract legacy `/settings` source/setup notes into active data/docs. Complete; no redirects, deletions, campaign-status changes, or external actions.
10. Q-44: Preserve legacy `/gtm` product-route inventory in active data/docs. Complete; no redirects, deletions, or sawcity-lite writes.
11. Q-45: Preserve historical `/ads` archive signals and dependencies in active data/docs. Complete; no redirects, deletions, uploads, launches, or external actions.
12. Q-46: Draft the clear-route cleanup packet for `/ads`, `/generate`, `/gtm`, and `/settings`. Complete; no redirects, deletions, uploads, launches, or external actions.
13. Q-47: Apply the legacy AI Studio redirect packet. Complete; `/generate` redirects internally to `/assets` and legacy API routes remain untouched.
14. Q-48: Apply the legacy GTM archive-only packet. Complete; `/gtm` redirects internally to Command and product-route inventory remains preserved in Command/docs.
15. Q-49: Apply the legacy Settings cleanup packet. Complete; `/settings` redirects internally to Approval and setup/source notes remain preserved in Command/docs.
16. Q-50: Harden `/ads` as read-only archive reference. Complete; create/edit/pause/regenerate controls are removed and `/ads/[id]` redirects back to `/ads`.
17. Q-51: Draft blocked-route cleanup packets. Complete; `/creatives` and `/workflow` now have explicit pre-redirect requirements for static 200 checks and workflow-history preservation.
18. Q-52: Resolve `/creatives` static URL guard. Complete; `/creatives` plus all 24 public JPEG URLs returned 200 before any page-route redirect work.
19. Q-53: Apply `/creatives` page redirect. Complete; `/creatives` redirects to `/assets` and all 24 public JPEG URLs still return 200 after the redirect.

No route deletion happens without an explicit cleanup packet and verification that the active loops do not depend on it.

## Q-38 Decision Matrix

These were the Q-38 recommendations before implementation packets. Later sections record which recommendations have now been applied; no deletion, route hiding, file removal, or external action is authorized by this matrix.

| Route | Recommendation | Replacement | Rationale | Next required step |
| --- | --- | --- | --- | --- |
| `/ads` | Archive | `/launch` | Historical ads are useful audit evidence, but not current launch candidates. | Keep archive banner; rebuild any future candidate as a Launch bundle. |
| `/generate` | Redirect later | `/assets` | Legacy Gemini/NB2 generation is superseded by ChatGPT Pro Creative Lab. | Preserve reusable prompt notes, then redirect after a dependency check. |
| `/gtm` | Archive | `/` | Historical GTM and product-route inventory context still helps audits. | Keep direct-link access until active launch/support data covers the inventory. |
| `/settings` | Delete later | `/approval` | Old settings/source-doc surface overlaps docs and governance pages. | Move any unique notes into docs and verify no active dependency before deletion. |
| `/creatives` | Redirect applied Q-53 | `/assets` | Original master gallery is superseded by Creative Lab, and static creative URLs remain preserved. | Keep after-check evidence in `docs/creative-static-url-guard.md`. |
| `/workflow` | Redirect later | `/launch` | Old concept-to-live board is superseded by queue, Approval, and Launch. | Confirm no launch/approval workflow depends on it, then redirect. |
| `/templates` | Rebuild as support | `/scorecard` | Briefs and research templates remain useful but belong behind active loops. | Keep support route while folding high-use actions into Launch, Creators, or Scorecard. |
| `/lifecycle` | Rebuild as support | `/scorecard` | Lifecycle measurement belongs in the learning loop, with detail available while summaries mature. | Keep support route while moving decision-grade lifecycle summaries into Scorecard. |

## Q-39 Dependency Guard

The Command page now shows a route dependency guard with these current statuses:

| Status | Count | Meaning |
| --- | ---: | --- |
| Blocked | 1 | Do not redirect/delete until active refs, data dependencies, or source notes are migrated. |
| Support | 2 | Keep as detail/support routes reached from active loops. |
| Clear | 5 | Candidate or already-applied route cleanup after preserving useful notes. |

Current pending clear routes: none. Applied clear routes: `/generate`, `/gtm`, `/settings`, `/ads`, `/creatives`.

Current blockers to resolve first:

- `/workflow`: six-stage workflow history is inventoried; any redirect packet still needs Launch/Approval migration or explicit preservation.

## Q-40 Campaign Flow Link Migration

Creator campaign-flow links now point only at active operating lanes:

| Flow | Route |
| --- | --- |
| Creative Lab | `/assets` |
| Approval | `/approval` |
| Launch readiness | `/launch` |
| Learning loop | `/scorecard` |

At Q-40, legacy `/creatives` and `/workflow` pages remained reachable by direct link and carried disposition banners. Q-53 later redirected only the `/creatives` page route to `/assets`; `/workflow` remains reachable while its ownership guard is resolved.

## Q-41 Public Creative URL Map

The `/creatives` page route and static `/creatives/*.jpg` asset URLs are separate dependencies. Q-41 preserves the static URL contract in `lib/trade-utils.ts` and surfaces the map on Command before any future redirect packet.

| Source | Count | Preservation rule |
| --- | ---: | --- |
| `public/creatives/*.jpg` | 24 | Must continue returning static images even if the legacy page route is later redirected. |
| Trade prefixes | 4 | `saw`, `rinse`, `mow`, and `rooter` are the only prefixes with local rendered images today. |
| Platform formats | 6 | Facebook feed, Instagram square, Instagram story/reel, LinkedIn feed, LinkedIn square alt, YouTube in-stream. |

Q-41 did not redirect `/creatives`, move files, delete assets, alter image URLs, or change external systems. Any future redirect packet must prove the static URLs still return 200 responses.

## Q-42 Bulk Workflow History Map

The `/workflow` page route and the workflow data it displays are separate dependencies. Q-42 preserves the workflow-stage contract in `lib/workflow-history.ts` and surfaces the map on Command before any future redirect packet.

| Source | Count | Preservation rule |
| --- | ---: | --- |
| Workflow stages | 6 | Preserve `concept`, `copy-ready`, `approved`, `creative-brief`, `uploaded`, and `live` stage meanings. |
| Bulk transitions | 5 | Preserve concept-to-copy-ready through uploaded-to-live movement before removing the old UI. |
| Dependencies | 5 | Preserve `ads.workflow_stage`, `data/workflow-stages.json`, `/api/ads/bulk-status`, `/workflow`, and trade breakdown logic. |

Q-42 did not redirect `/workflow`, delete the old page, bulk-move ads, call the bulk API, upload to ad platforms, or change external systems. Any future redirect packet must prove this history is moved into Launch/Approval or intentionally preserved.

## Q-43 Settings Source Note Extraction

The `/settings` page route and the setup/source notes it displayed are separate dependencies. Q-43 preserves those notes in `lib/settings-source-notes.ts` and surfaces the map on Command before any future delete packet.

| Source | Count | Preservation rule |
| --- | ---: | --- |
| Platform setup notes | 3 | Preserve LinkedIn, Meta, and YouTube setup checklist pointers under Launch/governance context. |
| Read-only source docs | 4 | Preserve sawcity-lite Project 4H doc paths as read-only references only. |
| Settings dependencies | 4 | Preserve campaign-status context, placeholder credential handling, source doc links, and doc-update reminders. |

Q-43 did not delete `/settings`, redirect it, change campaign status, write to sawcity-lite, expose a real secret, or change external systems. The route is now a candidate for a future delete packet after one more explicit cleanup decision.

## Q-44 GTM Product Route Inventory Preservation

The `/gtm` page route and the product-route inventory it displayed are separate dependencies. Q-44 preserves the route inventory in `lib/product-route-inventory.ts`, `docs/product-route-inventory.md`, and Command before any future archive-only packet.

| Source | Count | Preservation rule |
| --- | ---: | --- |
| Product routes | 21 | Preserve domain, landing, signup, demo-line, demo-auth, hero, and campaign-use context. |
| Ready routes | 20 | Preserve confirmed trade route assumptions without writing to sawcity-lite. |
| Beachhead routes | 5 | Preserve pipe, duct, mow, pest, and coat landing/demo-line context for Launch and creator work. |
| Read-only source files | 7 | Preserve sawcity-lite evidence paths as reference only. |

Q-44 did not redirect `/gtm`, delete the old page, change launch URLs, change product code, write to sawcity-lite, or change external systems. The route is now a candidate for future archive-only treatment after one more explicit cleanup decision.

## Q-45 Historical Ad Archive Audit Map

The `/ads` page route and the historical archive classifier it uses are separate dependencies. Q-45 preserves the classifier signals and archive dependencies in `lib/ad-archive.ts` and surfaces them on Command before any future archive-only packet.

| Source | Count | Preservation rule |
| --- | ---: | --- |
| Historical signals | 4 | Preserve NB2, legacy platform path, imported upload-sheet, and generic Saw.City copy detection. |
| Archive dependencies | 4 | Preserve classifier behavior, `/api/ads` history rows, archive filters, and no-launch guidance. |
| Route status | 1 | `/ads` is now clear for a future archive-only packet, not for deletion of history. |

Q-45 did not redirect `/ads`, delete the old page, edit ads, upload to ad platforms, launch campaigns, create webhooks, spend money, or change external systems. Any future archive-only packet must keep historical rows readable and prove Launch/Approval still own current-candidate action.

## Q-46 Clear Route Cleanup Packet

Q-46 groups only clear route candidates into an explicit packet before implementation. This is a draft/control surface, not permission to change routes by itself.

| Route | Packet recommendation | Replacement | Preserved evidence |
| --- | --- | --- | --- |
| `/ads` | Archive-only later | `/launch` | Ad archive audit map and classifier tests. |
| `/generate` | Redirect later | `/assets` | Legacy generator notes and Creative Lab replacement path. |
| `/gtm` | Archive-only later | `/` | Product-route inventory and sawcity-lite read-only evidence. |
| `/settings` | Delete later | `/approval` | Source-note map and setup-doc references. |

Q-46 did not redirect a route, delete a page, edit ads, upload to ad platforms, launch campaigns, create webhooks, spend money, or change external systems. The first implementation candidate is Q-47: internally redirect `/generate` to `/assets` while preserving the legacy API and docs.

## Q-47 Legacy AI Studio Redirect Packet

Q-47 applies the first clear-route cleanup packet: the `/generate` page route now redirects internally to `/assets`. This only changes the page route. The legacy `/api/generate`, `/api/ai-creative`, and related data routes remain available until a separate API cleanup packet exists.

Q-47 did not generate copy or images, remove API routes, delete files outside the page route, upload to ad platforms, launch campaigns, create webhooks, spend money, change billing, or touch sawcity-lite. Browser verification must confirm `/generate` lands on `/assets` and Creative Lab loads.

## Q-48 Legacy GTM Archive-Only Packet

Q-48 applies the second clear-route cleanup packet: the `/gtm` page route now redirects internally to Command. Product-route inventory remains preserved in `lib/product-route-inventory.ts`, `docs/product-route-inventory.md`, and the Command GTM product-route map.

Q-48 did not change launch URLs, remove product-route data, edit sawcity-lite, upload to ad platforms, launch campaigns, create webhooks, spend money, or change billing. Browser verification must confirm `/gtm` lands on `/` and the Command GTM product-route map still loads.

## Q-49 Legacy Settings Cleanup Packet

Q-49 applies the third clear-route cleanup packet: the `/settings` page route now redirects internally to `/approval`. Setup/source notes remain preserved in `lib/settings-source-notes.ts`, Command, SOP, and this route disposition plan.

Q-49 did not expose credentials, change campaign status, remove source-note data, create webhooks, upload to ad platforms, launch campaigns, spend money, change billing, or touch sawcity-lite. Browser verification must confirm `/settings` lands on `/approval` and Approval loads.

## Q-50 Ad Archive Read-Only Hardening

Q-50 applies the final clear-route cleanup packet: `/ads` remains available as a readable archive reference, while create, edit, pause/unpause, creative-regeneration, and ad-detail editor affordances are removed. `/ads/[id]` redirects back to `/ads`.

Q-50 did not delete ad rows, edit ad copy, upload to ad platforms, launch campaigns, create webhooks, spend money, change billing, or touch sawcity-lite. Browser verification must confirm the read-only guard is visible, no old mutable action labels are rendered, archive rows remain readable, and `/ads/[id]` returns to `/ads`.

## Q-51 Blocked Route Cleanup Packets

Q-51 drafts the blocked-route cleanup packets for `/creatives` and `/workflow`; it does not implement either redirect. `/creatives` cannot move until the page route has a before-check and every inventoried public `/creatives/*.jpg` URL has before/after 200 checks. `/workflow` cannot move until the six-stage workflow history, five transition pairs, fallback file, `/api/ads/bulk-status`, and Launch/Approval ownership are verified.

Q-51 did not redirect or delete a route, move static creative files, mutate workflow rows, upload to ad platforms, launch campaigns, create webhooks, spend money, change billing, or touch sawcity-lite. Browser verification must confirm Command renders the blocked packet, `/creatives` still loads, `/workflow` still loads, and Q-52 is framed as all 24 public static creative URL 200 checks before any redirect packet.

## Q-52 Creative Static URL Guard

Q-52 resolves the `/creatives` blocker without redirecting the route. Browser/local HTTP verification against `http://127.0.0.1:3106` confirmed `/creatives` returned `200 text/html; charset=utf-8`, and all 24 inventoried public `/creatives/*.jpg` URLs returned `200 image/jpeg`. Evidence is recorded in `docs/creative-static-url-guard.md` and `lib/static-creative-url-guard.ts`.

Q-52 did not redirect or delete `/creatives`, move static creative files, regenerate assets, upload to ad platforms, launch campaigns, create webhooks, send outreach, call external APIs, spend money, change billing, or touch sawcity-lite. `/creatives` is now clear only for a future page-route redirect packet, and that future packet must recheck all 24 public JPEG URLs after redirect implementation.

## Q-53 Creatives Page Redirect

Q-53 applies the `/creatives` page-route redirect to `/assets`. This redirects only the page route; it does not move, delete, rename, or regenerate files under `public/creatives`.

Browser/local HTTP verification against `http://127.0.0.1:3106` confirmed `/creatives` lands on `/assets`, and all 24 inventoried public `/creatives/*.jpg` URLs still return `200 image/jpeg` after the redirect. Q-53 did not upload to ad platforms, launch campaigns, create webhooks, send outreach, call external APIs, spend money, change billing, or touch sawcity-lite.
