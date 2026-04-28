# Workflow Ownership Guard

Last updated: 2026-04-27

Q-54 resolves the `/workflow` blocker without redirecting the route. The goal is to prove the legacy six-stage workflow behavior is preserved and that active ownership exists before any future page-route redirect packet.

## Evidence

Local production server: `http://127.0.0.1:3106`

| Check | Result |
| --- | --- |
| `/workflow` page route | `200 text/html; charset=utf-8` |
| Workflow stages preserved | 6 / 6 |
| Transition pairs preserved | 5 / 5 |
| Historical dependencies documented | 5 / 5 |
| Ownership surfaces documented | 6 |
| Redirect implemented | No |
| Bulk workflow mutation | No mutation performed by Q-54; the legacy `/workflow` direct-link page still owns bulk-advance UI until Q-55 redirects it |
| External action | No upload, launch, webhook, spend, billing, outreach, external API call, or sawcity-lite change |

## Ownership Surfaces

| Surface | Ownership |
| --- | --- |
| `/workflow` | Legacy direct-link six-stage board and bulk-advance UI until Q-55 redirects the page route. |
| `/approval` | Human approval decisions and bulk ad status changes through the existing guarded API route. |
| `/launch` | Current launch readiness, bundles, stop screens, and review-only upload sheets. |
| `/api/ads/bulk-status` | Server-side status/workflow-stage updates when a human-approved surface explicitly calls it. |
| `data/workflow-stages.json` | Local fallback workflow-stage overrides when the database workflow_stage column is unavailable. |
| `lib/workflow-history.ts` | Six-stage historical stage order, transition pairs, and dependency inventory for route retirement. |

## Preserved Stage Order

`concept -> copy-ready -> approved -> creative-brief -> uploaded -> live`

## Next Packet

`/workflow` is now eligible for a future page-route redirect packet only. That future packet must prove `/workflow` lands on `/launch` and the Command workflow history map still exposes the six stages, five transitions, fallback file, and bulk-status API dependency.
