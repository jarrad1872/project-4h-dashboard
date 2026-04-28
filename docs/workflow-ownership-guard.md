# Workflow Ownership Guard

Last updated: 2026-04-27

Q-54 resolved the `/workflow` blocker without redirecting the route. Q-55 then redirected the page route internally to `/launch` after proving the legacy six-stage workflow behavior is preserved and active ownership exists.

## Evidence

Local production server: `http://127.0.0.1:3106`

| Check | Result |
| --- | --- |
| `/workflow` page route after Q-55 | `307` internal redirect to `/launch` |
| Workflow stages preserved | 6 / 6 |
| Transition pairs preserved | 5 / 5 |
| Historical dependencies documented | 5 / 5 |
| Ownership surfaces documented | 6 |
| Redirect implemented | Yes |
| Bulk workflow mutation | No mutation performed by Q-54/Q-55; the legacy bulk-advance UI is no longer reachable from `/workflow` |
| External action | No upload, launch, webhook, spend, billing, outreach, external API call, or sawcity-lite change |

## Ownership Surfaces

| Surface | Ownership |
| --- | --- |
| `/workflow` | Redirect-only legacy page route; the old six-stage board and bulk-advance UI were removed from this direct-link surface in Q-55. |
| `/approval` | Human approval decisions and bulk ad status changes through the existing guarded API route. |
| `/launch` | Current launch readiness, bundles, stop screens, and review-only upload sheets. |
| `/api/ads/bulk-status` | Server-side status/workflow-stage updates when a human-approved surface explicitly calls it. |
| `data/workflow-stages.json` | Local fallback workflow-stage overrides when the database workflow_stage column is unavailable. |
| `lib/workflow-history.ts` | Six-stage historical stage order, transition pairs, and dependency inventory for route retirement. |

## Preserved Stage Order

`concept -> copy-ready -> approved -> creative-brief -> uploaded -> live`

## Next Packet

Q-55 completed the page-route redirect packet. `/workflow` lands on `/launch`, and the Command workflow history map still exposes the six stages, five transitions, fallback file, and bulk-status API dependency.
