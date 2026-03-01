# REFACTOR NOTES — Project 4H Dashboard

Generated: 2026-02-28 (feat/approval-creative-wire branch)

---

## ✅ Changes Made in This Pass

### 1. Creative Images Wired to Approval Queue
- Copied 24 rendered ad creatives to `public/creatives/` (4 trades × 6 formats)
- Added `getCreativeUrl(domain, platform, format)` helper to `lib/trade-utils.ts`
  - Maps domain+platform+format → `/creatives/{prefix}-{dimensions}-{platform}.jpg`
  - Returns `null` for trades without local renders (most of the 65+ trades for now)
  - Available prefixes: `saw`, `rinse`, `mow`, `rooter`
- Updated `app/approval/page.tsx`:
  - AdCard now shows creative image at the top using Next.js `<Image>` with `fill`
  - Falls back to `ad.image_url` (Supabase storage URL) if no local creative
  - Shows domain placeholder text if neither is available
  - Retains all existing copy/CTA/UTM/action buttons below the image

---

## 🔴 Dead API Routes (Not Called from Any UI Page)

These routes exist in `app/api/` but are not fetched by any page or component.
They were **not deleted** — some serve admin/migration purposes or may be needed for future external integrations.

| Route | File | Verdict |
|---|---|---|
| `POST /api/actions/pause` | `app/api/actions/pause/route.ts` | Superseded — campaign pause handled via `PATCH /api/campaign-status` |
| `GET /api/activity` | `app/api/activity/route.ts` | No UI consumer. Could be exposed as a feed or deleted. |
| `GET|PATCH /api/approval` | `app/api/approval/route.ts` | Older wrapper that merged `approval_queue` + `ads`. Approval page now uses `/api/ads` directly. |
| `GET /api/approval-queue` | `app/api/approval-queue/route.ts` | Slim GET-only version; superseded by the above. |
| `POST /api/approval-queue/[id]/approve` | `app/api/approval-queue/[id]/approve/route.ts` | RESTful approve; approval page uses `PATCH /api/ads/:id` instead. |
| `POST /api/approval-queue/[id]/reject` | `app/api/approval-queue/[id]/reject/route.ts` | Same — unused. |
| `POST /api/generate` | `app/api/generate/route.ts` | AI copy generator; `app/generate/page.tsx` calls `/api/ai-creative` instead. |
| `GET|POST /api/link-images` | `app/api/link-images/route.ts` | Admin utility to back-fill `image_url` on ads. No UI trigger. |
| `POST /api/migrate` | `app/api/migrate/route.ts` | One-time DDL migration. Keep as historical reference; not a live route. |
| `GET /api/project-state` | `app/api/project-state/route.ts` | Pages import `getProjectState()` from lib directly; HTTP version unused. |
| `GET /api/status` | `app/api/status/route.ts` | Aggregate status dump; no page fetches it. |

**Recommendation:** Delete all 11 in a separate cleanup PR once confirmed safe. Combined these add ~800 lines of dead server code and inflate Vercel function count.

---

## 🟡 Duplicate TRADE_MAP Definitions

| Location | Shape | Status |
|---|---|---|
| `lib/trade-utils.ts` | `{ label, color, bg, domain, tier }` | **Source of truth** — 65+ trades |
| `app/api/generate/route.ts` | `{ brand, domain, trade, persona }` | **Dead** (route is unused). Only 10 trades hardcoded. |

`lib/ai-creative.ts` already correctly derives `TRADE_DOMAIN_REGISTRY` from the main TRADE_MAP — this is the right pattern.

**Recommendation:** If `/api/generate` is ever revived, extend the main TRADE_MAP shape with `persona` and `trade` fields instead of maintaining a separate mini-map.

---

## 🟡 Pages — Potential Overlap

| Page | Purpose | Overlap? |
|---|---|---|
| `app/approval/page.tsx` | Approve/reject pending ads in queue | Minor overlap with `/ads` status editing |
| `app/ads/page.tsx` | Full ad management, creative variants, status | Minor overlap with `/approval` |
| `app/assets/page.tsx` | Stage and approve trade hero/OG images (DB) | Complementary to `/creatives` |
| `app/creatives/page.tsx` | Read-only gallery of approved master assets | Complementary to `/assets` |
| `app/workflow/page.tsx` | Workflow stage tracking per trade | Distinct — no overlap |

**Verdict:** No consolidation needed. Pages have clearly differentiated purposes despite shared data sources.

---

## 🟡 Stale Hardcoded Data

1. **`app/api/generate/route.ts`** — Local TRADE_MAP only covers 10 trades (`saw`, `rinse`, `mow`, `rooter`, `pipe`, `pave`, `haul`, `coat`, `grade`, `wrench`). Campaign covers 65+. Route is dead so no runtime impact, but if revived it would silently default unknown trades to `saw`. Fix: import from `lib/trade-utils.ts`.

2. **`app/api/migrate/route.ts`** — Migration SQL references hardcoded `'saw-%'` template prefix filter. One-time use, but worth noting if migrations are added in the future.

3. **`app/creatives/page.tsx`** — Footer says "March 2026" — update when campaign timeline shifts.

---

## ✅ Correctly Structured (No Action Needed)

- `lib/trade-utils.ts` — single source of truth for TRADE_MAP, all pages import from here
- `lib/ai-creative.ts` — derives `TRADE_DOMAIN_REGISTRY` from TRADE_MAP, not a separate definition
- `lib/constants.ts` — `CHANNELS`, `PLATFORM_LABELS/COLORS`, `STATUS_COLORS` — clean, no duplication found
- `lib/types.ts` — dual snake_case/camelCase fields are intentional compatibility shim, not dead code
- All active pages use `@/lib/trade-utils` TRADE_MAP consistently

---

## 📋 Recommended Next Cleanup PR

1. Delete the 11 dead API routes listed above
2. Extend `TRADE_MAP` entries with `persona` + `trade` fields if AI copy generation is revived
3. Add more trade creatives to `public/creatives/` as renders complete (currently only 4 of 65 trades)
