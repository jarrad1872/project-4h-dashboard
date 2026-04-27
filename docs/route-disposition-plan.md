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

No route deletion happens without an explicit cleanup packet and verification that the active loops do not depend on it.

## Q-38 Decision Matrix

These are recommendations only. No redirect, deletion, route hiding, or file removal is authorized by this matrix.

| Route | Recommendation | Replacement | Rationale | Next required step |
| --- | --- | --- | --- | --- |
| `/ads` | Archive | `/launch` | Historical ads are useful audit evidence, but not current launch candidates. | Keep archive banner; rebuild any future candidate as a Launch bundle. |
| `/generate` | Redirect later | `/assets` | Legacy Gemini/NB2 generation is superseded by ChatGPT Pro Creative Lab. | Preserve reusable prompt notes, then redirect after a dependency check. |
| `/gtm` | Archive | `/` | Historical GTM and product-route inventory context still helps audits. | Keep direct-link access until active launch/support data covers the inventory. |
| `/settings` | Delete later | `/approval` | Old settings/source-doc surface overlaps docs and governance pages. | Move any unique notes into docs and verify no active dependency before deletion. |
| `/creatives` | Redirect later | `/assets` | Original master gallery is superseded by Creative Lab. | Confirm needed lookups exist in Creative Lab or docs, then redirect. |
| `/workflow` | Redirect later | `/launch` | Old concept-to-live board is superseded by queue, Approval, and Launch. | Confirm no launch/approval workflow depends on it, then redirect. |
| `/templates` | Rebuild as support | `/scorecard` | Briefs and research templates remain useful but belong behind active loops. | Keep support route while folding high-use actions into Launch, Creators, or Scorecard. |
| `/lifecycle` | Rebuild as support | `/scorecard` | Lifecycle measurement belongs in the learning loop, with detail available while summaries mature. | Keep support route while moving decision-grade lifecycle summaries into Scorecard. |

## Q-39 Dependency Guard

The Command page now shows a route dependency guard with these current statuses:

| Status | Count | Meaning |
| --- | ---: | --- |
| Blocked | 4 | Do not redirect/delete until active refs, data dependencies, or source notes are migrated. |
| Support | 2 | Keep as detail/support routes reached from active loops. |
| Clear | 2 | Candidate for a future redirect/delete packet after preserving useful notes. |

Current clear routes: `/generate`, `/settings`.

Current blockers to resolve first:

- `/creatives`: 24 static `/creatives/*.jpg` URLs are inventoried; any redirect packet still needs explicit 200-check preservation.
- `/workflow`: six-stage workflow history is inventoried; any redirect packet still needs Launch/Approval migration or explicit preservation.
- `/gtm`: product-route inventory context still needs active-loop coverage before archive-only treatment.
- `/ads`: historical ad archive remains useful audit evidence.

## Q-40 Campaign Flow Link Migration

Creator campaign-flow links now point only at active operating lanes:

| Flow | Route |
| --- | --- |
| Creative Lab | `/assets` |
| Approval | `/approval` |
| Launch readiness | `/launch` |
| Learning loop | `/scorecard` |

Legacy `/creatives` and `/workflow` pages remain reachable by direct link and still carry their disposition banners. Q-40 only changed the internal campaign-flow data; it did not redirect, delete, hide, or break either route.

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
