# Full Codebase Review — 2026-03-01

Methodology: targeted exec/grep analysis (broad agent approach timed out on large codebase).

---

## 🔴 Critical — Broken Functionality

### 1. `ai-generate-panel.tsx:30` — calls DEAD API route
`AIGeneratePanel` (used in the ads page sidebar) sends requests to `/api/generate`.
That route is **dead** — it has its own local TRADE_MAP of only 10 hardcoded trades and is not called by any active page.
The correct endpoint is `/api/ai-creative`.
**Impact:** Any "Generate" panel usage silently fails or returns wrong data.
**Fix:** Change `fetch("/api/generate"` → `fetch("/api/ai-creative"` in `ai-generate-panel.tsx`

### 2. `app/approval/page.tsx:126-127` — double full-table scan on every load
```js
fetch("/api/ads?status=pending", { cache: "no-store" }),
fetch("/api/ads", { cache: "no-store" }),
```
Fetches the entire ads table TWICE in parallel — once filtered and once unfiltered — then filters client-side anyway.
**Impact:** 2× DB load on every approval page visit (1,000 ads × 2 queries = unnecessary).
**Fix:** Fetch all ads once, split into pending/reviewed client-side.

---

## 🟡 Redundancy / Dead Code

### 3. `components/overview-actions.tsx` — completely dead component
`OverviewActions` is exported but **never imported anywhere** in the app.
The only caller would be the homepage, but it's not there.
Additionally, it calls `/api/actions/pause` which is itself dead.
**Fix:** Delete `components/overview-actions.tsx`

### 4. Dead API routes (confirmed — never called from any active page/component)
| Route | Status |
|---|---|
| `/api/activity` | Never fetched from any page |
| `/api/approval` | Approval page uses `/api/ads` directly |
| `/api/approval-queue` | Same |
| `/api/approval-queue/[id]/approve` | Same |
| `/api/approval-queue/[id]/reject` | Same |
| `/api/actions/pause` | Only called from dead `OverviewActions` |
| `/api/link-images` | Admin utility, no UI trigger |
| `/api/migrate` | One-time migration, no UI trigger |
| `/api/project-state` | Pages import from lib directly |
| `/api/status` | Never called |
| `/api/generate` | `generate/page.tsx` calls `/api/ai-creative` instead |

**Live routes (confirmed called):** `/api/ads`, `/api/ads/[id]`, `/api/ads/bulk-status`, `/api/ai-creative`, `/api/budget`, `/api/campaign-status`, `/api/launch-checklist`, `/api/lifecycle`, `/api/metrics`, `/api/regen-creative`, `/api/templates`, `/api/templates/[id]`, `/api/trade-assets`, `/api/actions/scale`

### 5. `components/ad-preview.tsx:34,51` — hardcoded "Saw.City" brand name
Platform-style ad preview wireframe shows "Saw.City" regardless of which trade the ad is for.
Should receive `appName` or `domain` as a prop.
**Fix:** Add `appName` prop, replace hardcoded string.

### 6. `app/page.tsx:356` — hardcoded list of 20 live trade slugs
```js
{["saw", "rinse", "mow", "rooter", "pipe", ...].map(t => (
```
Should derive from `TRADE_MAP` (filtered by `tier === 1` or a `live: true` flag) to stay in sync.
**Fix:** Replace array literal with `Object.entries(TRADE_MAP).filter(([,v]) => v.tier === 1).map(([slug]) => slug)`

---

## 🟢 Minor / Cleanup

### 7. `lib/server-utils.ts` — `adToDb()` missing `creative_variant`
The `creative_variant` column is read/written in several places but not included in `adToDb()`.
Low impact currently because PATCH operations build their own payload, but INSERT of new ads won't explicitly set `creative_variant` (relies on DB default of 1).
**Fix:** Add `creative_variant: ad.creative_variant ?? ad.creativeVariant ?? 1` to `adToDb()`.

### 8. `normalizeAd` doesn't map `creative_variant` in `adToDb` (see above) — schema drift risk

### 9. Multiple pages independently fetch `/api/ads` with no shared cache
Pages affected: `ads`, `approval`, `gtm`, `workflow`, `templates`, `page` (homepage).
No shared data layer — every navigation re-fetches 1,000 ads from Supabase.
Not critical now, becomes a problem at scale.
**Recommendation:** React Query or SWR with shared cache key `"/api/ads"`.

---

## ✅ Clean / No Issues

- `lib/types.ts` — dual snake/camelCase intentional compatibility shim, well-documented
- `lib/trade-utils.ts` — single source of truth, correctly used by all active pages
- `lib/ai-creative.ts` — prompt updated, TRADE_SCENES complete, style locked
- `lib/supabase.ts` — standard client setup
- `app/ads/[id]/page.tsx` — correctly calls `/api/ads/${id}`
- `app/budget/page.tsx` — correctly calls `/api/actions/scale`
- `app/launch/page.tsx` — clean
- `app/generate/page.tsx` — correctly calls `/api/ai-creative`
- `components/ad-preview-modal.tsx` — new, clean, single-use
- `components/chips.tsx` — clean
- `components/sidebar-shell.tsx` — clean
- `components/ui.tsx` — clean

---

## Priority Fix Order
1. 🔴 Fix `ai-generate-panel.tsx` → `/api/ai-creative` (broken feature)
2. 🔴 Fix approval page double-fetch (wasted DB load)
3. 🟡 Delete 11 dead API routes (~900 lines removed)
4. 🟡 Delete `overview-actions.tsx` (dead component)
5. 🟡 Fix `ad-preview.tsx` hardcoded "Saw.City"
6. 🟡 Fix `app/page.tsx` hardcoded trade list
7. 🟢 Add `creative_variant` to `adToDb()`
