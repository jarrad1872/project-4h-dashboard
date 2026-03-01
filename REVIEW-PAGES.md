# Pages Review — 2026-03-01

> Reviewer: Bob (subagent code review)
> Scope: All `app/**/page.tsx`, `app/layout.tsx`, all `components/*.tsx`
> Method: Full file reads + cross-reference against `lib/trade-utils.ts`, `lib/project-state-data.ts`, `lib/constants.ts`, `lib/types.ts`, `lib/ai-creative.ts`

---

## 🔴 Critical (breaks functionality or causes data errors)

### Data Integrity

- **`lib/trade-utils.ts` TRADE_MAP — 7 wrong tiers**
  `saw`, `rinse`, `grade`, `chimney`, `detail`, `polish`, `wrench` are all **Tier 2** in `TRADE_MAP` but **Tier 3** in `lib/project-state-data.ts` (the canonical GTM record). This affects sort order in the approval queue, workflow pipeline, GTM trade table, and any other view that sorts/groups by `TRADE_MAP[trade]?.tier`. Specifically:
  - `app/approval/page.tsx:178-181` — approval trade filter sorts by `TRADE_MAP` tier → these 7 trades appear higher priority than they are
  - `app/workflow/page.tsx:206-208, 261-263` — trade breakdown table shows wrong tier labels
  - `app/gtm/page.tsx:271` — `TRADE_MAP[prefix]` tier lookup shows wrong tier badge
  - `app/creatives/page.tsx:165` — `TRADE_MAP[trade.slug]` fallback for tradeInfo
  - `lib/ai-creative.ts:23-29` — `TRADE_DOMAIN_REGISTRY` is dynamically derived from `TRADE_MAP`, so all 64 entries inherit the wrong tiers into the AI Studio page

- **`TRADE_MAP` has 64 entries; `project-state-data.ts` claims 65 trades**
  The `app/page.tsx:100`, `app/page.tsx:335`, `app/workflow/page.tsx:231` all hardcode "65 trades". TRADE_MAP has exactly 64 (T1:8, T2:32, T3:24). The missing/extra trade may be `gc.city` (general-contracting, listed in project-state-data at line 86 with tier 2 but absent from TRADE_MAP). Pages/components that use `Object.keys(TRADE_MAP).length` for counts will be off by 1.

- **`app/ads/[id]/page.tsx:82` — hardcoded `saw.city` domain in UTM URL**
  ```ts
  const utmUrl = `https://saw.city${form.landingPath ?? ad.landingPath}?utm_source=...`
  ```
  Every ad's "Full UTM URL" display uses `saw.city` as the base regardless of the trade. An ad for `mow.city` will show a UTM pointing to `saw.city`. The copy URL button copies a broken link. This is a silent data error that could propagate wrong UTMs into ad platforms.

### Missing Error Handling / Loading States

- **`app/page.tsx:39-47` — Promise.all with no `.catch()`**
  If either `GET /api/ads` or `GET /api/campaign-status` fails, `setLoading(false)` is never called → the "Loading command center…" spinner renders forever with no error message.

- **`app/ads/[id]/page.tsx:73-74` — 404/error shows as infinite "Loading ad…"**
  When `loadAd()` returns `!res.ok` it early-returns without setting any error state. If the ad doesn't exist, the page shows `<p>Loading ad…</p>` indefinitely.

- **`app/approval/page.tsx:123-133` — Double full-table fetch on every load**
  Two concurrent fetches: `GET /api/ads?status=pending` AND `GET /api/ads` (all ads). The second is only used to filter `status !== "pending"`. At 1040 ads, this is 2× the payload on every load and every approve/reject action. Should fetch all once and split client-side.

- **`app/approval/page.tsx:123-133` — No error handling**
  `load()` has no try/catch. If either fetch throws (network error, 500), `setLoading` stays `true` and `loading` never becomes `false`. No error UI is shown.

- **`app/lifecycle/page.tsx:39` — No loading or error state**
  `load()` fetches `/api/lifecycle` but there's no `loading` state and no `.catch()`. If the fetch fails, `rows` stays `[]` with no user feedback.

- **`app/settings/page.tsx:38` — Shows "Loading settings…" as plain `<p>` with no error path**
  If `/api/campaign-status` fails, the page stays permanently at the loading text. No error boundary.

---

## 🟡 Redundancy / Duplication

### Duplicate Fetch Patterns (No Shared Hook)

- **`/api/ads` fetched independently in 5 pages**: `app/page.tsx:40`, `app/approval/page.tsx:127`, `app/ads/page.tsx:137`, `app/workflow/page.tsx:42`, `app/gtm/page.tsx:51`
  Each page re-fetches all 1040 ads on mount with no shared cache or hook. A `useAds()` hook would eliminate the redundancy and make the fetch pattern consistent.

- **`/api/campaign-status` fetched in 3 pages**: `app/page.tsx:41`, `app/settings/page.tsx:21`, `app/launch/page.tsx:30`
  Same pattern — no shared hook.

- **`/api/trade-assets` fetched in 2 pages**: `app/assets/page.tsx:183`, `app/creatives/page.tsx:83`
  Both fetch all trade assets and build an in-memory map. The `approvedMap` logic in `creatives/page.tsx:92-99` duplicates the `assetMap` logic in `assets/page.tsx:184-190`.

### Duplicate Component Definitions

- **`TradeAsset` interface defined in two pages with different shapes**
  - `app/creatives/page.tsx:7-13`: `asset_type: "hero_a" | "hero_b" | "og_nb2"` (3 types, no `notes`)
  - `app/assets/page.tsx:9-16`: `asset_type: "hero" | "og" | "hero_a" | "hero_b" | "og_nb2"` (5 types, includes `notes`)
  Neither matches `lib/types.ts` (which doesn't define `TradeAsset` at all). The DB type is the authority here; both should import a shared type.

- **`AssetCard` component defined locally in `app/creatives/page.tsx:23-70`**
  Essentially duplicates display logic for trade asset cards, similar to the `AssetSlot` component in `app/assets/page.tsx:38-133`. Different enough to not be a direct copy, but the image display, overlay, copy/open pattern could be a shared `<TradeAssetCard>` component.

- **Workflow stage `<select>` inline in two places**
  - `app/ads/[id]/page.tsx:139-151`: 6-option workflow stage select
  - `app/ads/page.tsx` (create ad modal): same 6 stages with same values
  Should be a shared `<WorkflowStageSelect>` component or at minimum a `WORKFLOW_STAGE_OPTIONS` constant in `lib/constants.ts`.

- **`StatusPill` component defined locally in `app/gtm/page.tsx:31-34`**
  Functionally similar to `StatusChip` from `components/chips.tsx` but with different styling (border vs background). Should either reuse `StatusChip` or be moved to `components/`.

### Duplicate Logic vs `lib/`

- **`app/gtm/page.tsx:57-68` — Manual `campaign_group` prefix parsing**
  ```ts
  const parts = cg.split("_");
  const prefix = parts.length >= 4 ? parts[parts.length - 1] : "";
  ```
  This duplicates (partially) the logic in `lib/trade-utils.ts:tradeFromAd()` which already parses `campaign_group` to derive the trade prefix. `tradeFromAd(ad)` should be called instead, but `gtm/page.tsx` only has raw data without a full `Ad` object shape at that point. Still — the parsing format should be documented and centralized.

- **`app/scorecard/page.tsx:23-39` — `sumChannels()` function duplicates logic in `lib/metrics.ts`**
  `lib/metrics.ts` exports `calcCtr`, `calcCpaStart`, `calcActivationRate`, `calcCpaPaid`, `signal`. The `sumChannels` helper in scorecard is local and not exported, but it performs the same kind of aggregate math the metrics lib is intended for. Consider adding `sumChannels` to `lib/metrics.ts`.

- **Hardcoded `BLOCKERS_BEFORE_LAUNCH` in `app/launch/page.tsx:15-21`**
  Contains `"pumpcans.com/approval"` (line 18) — a dead/old domain. The dashboard is not on pumpcans.com. Should reference an internal route like `/approval` or at minimum the correct public URL.

- **`app/launch/page.tsx:213` — Hardcoded launch sequence with `done: false` on every step**
  The entire launch sequence array at lines 212-229 always has `done: false`. These never change state visually regardless of real checklist progress. Either wire to real data or remove the `done` prop.

### Stale/Wrong Hardcoded Data

- **`app/page.tsx:343-345` — Wrong tier counts**
  ```ts
  { tier: "Tier 2", count: 32 }  // TRADE_MAP has 32, but that's only because 7 T3 trades are misclassified
  { tier: "Tier 3", count: 25 }  // Actual T3 is 24 in TRADE_MAP
  ```
  Correct counts per `TRADE_MAP`: T1=8, T2=32, T3=24, total=64. Stated in UI: T1=8, T2=32, T3=25 (off by 1). These are hardcoded instead of derived from `TRADE_MAP`.

- **`app/page.tsx:313` — "Review Assets (325 pending)" hardcoded**
  The "Browse Ad Library" button shows "325 pending" as a hardcoded string, while the ad counts earlier in the page are dynamically derived from the API. This will be wrong the moment any asset is approved.

- **`app/ads/page.tsx:302-304` — UTM URL preview with hardcoded `saw.city`** *(also flagged 🔴)*
  Same bug pattern as `app/ads/[id]/page.tsx:82` — the URL preview in the ad library uses `saw.city` as base.

- **`app/settings/page.tsx:10-13` — Absolute filesystem paths in `sourceDocs`**
  ```ts
  "/home/node/.openclaw/workspace/projects/sawcity-lite/docs/project-4h/..."
  ```
  These are rendered as `file://` links (line 97). File protocol links never work in a browser (blocked by same-origin policy). These are dev-machine paths that will be broken for anyone not running the dashboard on Bob's host.

- **`app/settings/page.tsx:7` — Demo API key exposed in client bundle**
  ```ts
  const BOB_API_KEY = "bob_project4h_sk_live_7f4a2ca5_demo";
  ```
  Hardcoded in a `"use client"` component — this string ends up in the browser JS bundle. Even as a demo key it sets a bad precedent. Should be in an env var or moved to a server component.

- **`app/gtm/page.tsx:126` — `tier1_trades` accessed via `any` cast from `state.campaign`**
  ```ts
  {(state.campaign as any).tier1_trades?.map(...)}
  ```
  This bypasses TypeScript. If the shape of `project-state-data.ts` changes, this silently renders nothing. Should be typed.

- **`app/creatives/page.tsx:169-170` — Hardcoded Supabase bucket URLs**
  ```ts
  url: approvedMap[trade.slug]?.hero_b || `https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/${trade.slug}-hero-b.jpg`
  ```
  The Supabase bucket URL is hardcoded inline. `lib/trade-utils.ts:getCreativeUrls()` already abstracts this but is only partially used here. `hero_b` and `og_nb2` fallbacks bypass it.

---

## 🟢 Minor / Cleanup

- **`components/overview-actions.tsx` — Dead component, never imported**
  `OverviewActions` is defined and exported but grep across all `app/` and `components/` finds zero imports. Can be deleted or the homepage should use it (it duplicates the campaign status toggle logic from `app/page.tsx:49-60`).

- **`components/ai-generate-panel.tsx:68-78` — Always-disabled platform `<select>`**
  The platform selector is `disabled` with no label explaining why. A user sees a dropdown they can't interact with. Should be `read-only` text or removed; the `disabled` attribute on a `<select>` is confusing UX.

- **`components/ai-generate-panel.tsx:69-77` — Hardcoded platform options instead of `PLATFORM_LABELS`**
  Same 4 platforms (linkedin, youtube, facebook, instagram) are listed inline instead of iterating `PLATFORM_LABELS` from `lib/constants.ts`.

- **`components/ad-preview.tsx:34, 51` — Hardcoded "Saw.City" brand in all platform previews**
  The Facebook/Instagram and LinkedIn previews always show "Saw.City" as the account name. Trade-specific ads (e.g. `mow.city`, `pipe.city`) will always preview as Saw.City. Should accept a `domain` prop.

- **`app/ads/page.tsx:164` — Potential null crash on `campaignGroup.toLowerCase()`**
  ```ts
  : ad.campaignGroup.toLowerCase().includes("retarget")
  ```
  If an ad has `campaignGroup: null` or `undefined` (the `Ad` type shows both `campaignGroup` and `campaign_group`), this throws. Should be `(ad.campaignGroup ?? "").toLowerCase()`.

- **`app/approval/page.tsx:161` — `useState` called inside render function body (wrong order)**
  `const [approveAllLoading, setApproveAllLoading] = useState(false);` at line 161 is declared after other hooks and after `useMemo`. While React doesn't error on this (hooks are still at the component top level), it's unconventional and should be moved with the other state declarations at lines 115-121.

- **`app/ads/[id]/page.tsx:29-30` — `useEffect` missing `loadAd` dependency**
  ```ts
  useEffect(() => {
    if (id) void loadAd();
  }, [id]);
  ```
  `loadAd` is defined inside the component and changes on every render. ESLint exhaustive-deps would flag this. Should either be wrapped in `useCallback` or moved outside the component.

- **`app/assets/page.tsx:160` — `alert()` used for clipboard confirmation**
  ```ts
  onClick={() => { void navigator.clipboard.writeText(url); alert("Storage URL copied!"); }}
  ```
  `alert()` is synchronous, blocks the UI, and looks terrible on mobile. Should use the same `copied` state pattern already implemented in `app/creatives/page.tsx:23-29`.

- **`app/generate/page.tsx:123-126` — Stale model display name**
  UI shows `"Model: NB2 (Gemini 3.1 Flash)"`. The comment in code says "Nano Banana 2" but the model string should be verified against `lib/ai-creative.ts` or the actual API route to ensure it's current.

- **`app/workflow/page.tsx:231` — Hardcoded "All 65 trades × 16 ads" comment in visible UI**
  This is in a `<p>` tag visible to users. If the trade count changes, this comment is wrong without a code change.

- **`app/lifecycle/page.tsx:99` — `grid-cols-4` will break at mobile**
  The stats row uses `grid-cols-4` with no responsive breakpoint modifier. At narrow mobile widths, 4 columns will overflow. Should be `grid-cols-2 sm:grid-cols-4`.

- **`app/ads/page.tsx:7` — `tradeBadge` imported but not used**
  ```ts
  import { tradeBadge, TRADE_MAP, ... } from "@/lib/trade-utils";
  ```
  `tradeBadge` doesn't appear anywhere in `app/ads/page.tsx`. Unused import.

- **`app/gtm/page.tsx:72-75` — `(state.campaign as any).all_trades` used in two places**
  Same `as any` cast with `all_trades` access appears in `app/creatives/page.tsx:80` and `app/assets/page.tsx:179`. This pattern is repeated across 3 files. The `ProjectState` type should be extended to include `all_trades` so these casts aren't needed.

- **`app/creatives/page.tsx:219` — Duplicate "Footer Footer" comment**
  ```html
  {/* Footer Footer */}
  ```
  Typo/duplicate in comment.

- **`components/ad-preview-modal.tsx:26-71` — `DOMAIN_TAGLINES` only covers 34 of 65 trades**
  Trades added in T2/T3 expansion (e.g. `drywall`, `excavation`, `housecleaning`, `siding`, `septic`, `rolloff`, `bodyshop`, `carpetcleaning`, `mold`, `metalworks`, `plank`, etc.) fall through to the default `"on the job."` tagline. Not a crash, but all missing trades show the generic fallback.

- **`app/templates/page.tsx:40-44` — No error handling after DELETE**
  If `fetch(DELETE)` fails, `busyId` stays set to the deleted template's ID, locking both buttons on that card permanently (until page refresh). No `.catch()` or reset in error path.

---

## ✅ Clean (no issues found)

- `app/layout.tsx` — Minimal, correct, imports `SidebarShell` and sets metadata.
- `components/ui.tsx` — Simple, correct, no issues. `Button`, `Card`, `GhostButton` are well-abstracted.
- `components/chips.tsx` — Correct. Properly uses constants from `lib/constants.ts`.
- `components/sidebar-shell.tsx` — Clean. Mobile/desktop layout correct, uses `usePathname` for active state.
- `app/scorecard/page.tsx` — Well-structured. Correct use of `lib/metrics.ts` functions. Loading state handled. Minor: `sumChannels` should move to `lib/metrics.ts`.
- `app/lifecycle/page.tsx` — Logic is clean (except missing loading/error state on fetch).
- `app/budget/page.tsx` — Clean. Uses `CHANNELS` from constants, good loading state.
- `app/launch/page.tsx` — Solid structure. Issues flagged above are data/content problems, not logic bugs.
- `app/workflow/page.tsx` — Good use of `useMemo`, `tradeFromAd`, `TRADE_MAP`. Tier sort is correct logic, wrong data (tier source).
- `app/templates/page.tsx` — Simple, clean. Minor error handling gap on DELETE.

---

## Summary Table

| Category | Count |
|---|---|
| 🔴 Critical | 6 |
| 🟡 Redundancy/Duplication | 14 |
| 🟢 Minor/Cleanup | 14 |

## Top 3 Things to Fix First

1. **TRADE_MAP tier mismatch** — 7 trades have wrong tiers. Fix `lib/trade-utils.ts` to match `lib/project-state-data.ts`. Affects sort order everywhere.
2. **Hardcoded `saw.city` UTM base** — `app/ads/[id]/page.tsx:82` and `app/ads/page.tsx:302`. Wrong UTM URLs shown/copied for all non-saw trades.
3. **Missing error handling on `app/page.tsx` and `app/approval/page.tsx`** — A single network hiccup locks the entire command center in a permanent loading state.
