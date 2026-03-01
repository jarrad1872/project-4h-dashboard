# Lib + Database Review — 2026-03-01

> Reviewed by: subagent (claude-sonnet-4-6)
> Scope: all files in `lib/`, all API routes in `app/api/`, all 6 migration files, component files, scripts

---

## 🔴 Critical

### 1. `creative_variant` column referenced but no migration exists

**File:** `lib/server-utils.ts` → `adToDb()`, `normalizeAd()`

`adToDb()` writes `creative_variant` to the DB:
```ts
creative_variant: ad.creative_variant ?? ad.creativeVariant ?? null,
```
`normalizeAd()` reads it back. But **no migration** adds this column to `ads`. Migrations 001–006 reviewed — none adds `creative_variant`. Any `INSERT` or `UPDATE` via `adToDb()` with `creative_variant` set will fail with `column "creative_variant" does not exist` (Postgres error 42703) unless it was applied manually outside the repo.

**Fix:** Add `ALTER TABLE ads ADD COLUMN IF NOT EXISTS creative_variant INT DEFAULT 1;` as a new migration (007).

---

### 2. `WorkflowStage` type missing `"rejected"` and `"revision_requested"`

**File:** `app/api/approval/route.ts` (PATCH handler, line ~80)

```ts
workflow_stage: payload.status === "approved" ? "approved"
  : payload.status === "rejected" ? "rejected"
  : "revision_requested",
```

`WorkflowStage` in `lib/types.ts` is:
```ts
type WorkflowStage = "concept" | "copy-ready" | "approved" | "creative-brief" | "uploaded" | "live";
```

Neither `"rejected"` nor `"revision_requested"` is valid. This is a **type error** that TypeScript should catch if strict mode is on. At runtime it will write invalid values into `ads.workflow_stage`, corrupting the workflow state for any ad rejected via the approval route.

**Fix:** Add `"rejected"` and `"revision_requested"` to `WorkflowStage`, or map them to valid stages (e.g. `"concept"` for rejected, `"copy-ready"` for revision requested).

---

### 3. `generate/route.ts` has a diverged, incomplete local `TRADE_MAP`

**File:** `app/api/generate/route.ts`

The route defines its **own** `TRADE_MAP` with only **10 trades**:
`saw, rinse, mow, rooter, pipe, pave, haul, coat, grade, wrench`

The canonical `lib/trade-utils.ts` TRADE_MAP has **64 trades**. Any generate request for the 54 unlisted trades silently falls back to `TRADE_MAP.saw` (Saw.City), producing copy for concrete cutting instead of the requested trade.

Additionally, the local map uses different mapping conventions — `pave` maps to `pave.city` but `lib/trade-utils.ts` also has `pave`, so those align, but `coat` in generate maps to `coat.city/painting` while TRADE_MAP has `coat` → `coat.city` (consistent). However, `wrench` in generate maps to `auto repair`, while TRADE_MAP has `wrench` → `Wrench.City` (mechanic/truck diesel). Minor semantic drift.

**Fix:** Remove the local TRADE_MAP; import `TRADE_MAP` from `@/lib/trade-utils` and build the generate-specific enrichment (persona, brand, domain) dynamically from it.

---

### 4. `adToLegacyJson()` omits `image_url` and `creative_variant`

**File:** `lib/server-utils.ts` → `adToLegacyJson()`

This function serializes ads to the JSON fallback file. It does **not** include:
- `image_url`
- `creative_variant`

So when running without Supabase (file-based fallback), any `image_url` set on an ad is **silently dropped** on the next write. Any page that reads from the file fallback after an `image_url` update will show a blank image.

**Fix:** Add `image_url: ad.image_url ?? ad.imageUrl ?? null` and `creative_variant: ad.creative_variant ?? ad.creativeVariant ?? 1` to the returned object.

---

### 5. Migration 004 `UPDATE` for `image_url` population is a no-op

**File:** `supabase/migrations/004_image_url.sql`

```sql
UPDATE ads a
SET image_url = (
  SELECT (t.utm_campaign::jsonb)->>'image_url'
  FROM ad_templates t
  WHERE t.platform = a.platform
    AND t.name LIKE 'saw-%'
    AND (t.utm_campaign::jsonb)->>'image_url' IS NOT NULL
  LIMIT 1
)
WHERE a.image_url IS NULL;
```

`ad_templates.utm_campaign` is a plain string like `"4h_2026-03_activation_missed-calls"` — not JSON. Casting to `::jsonb` will throw a runtime error (or silently produce NULL if cast fails). This UPDATE **has never successfully populated image_url**. The same logic is duplicated in `app/api/migrate/route.ts` with the same bug.

**Fix:** Remove this UPDATE from the migration (it's dead). `image_url` should be populated via the `/api/link-images` route or the `upload-trade-assets.mjs` script, not via template data.

---

### 6. trade_assets slug naming ≠ TRADE_MAP key naming — `getCreativeUrls` produces wrong paths

**Files:** `lib/trade-utils.ts` → `getCreativeUrls()`, `supabase/migrations/005`, `scripts/upload-trade-assets.mjs`

The `trade_assets` table uses **full slug names** as `trade_slug`:
```
auto-repair, mechanic, floor-polishing, paving, demolition, pressure-washing, lawn-care, etc.
```

But `getCreativeUrls(prefix, ...)` is called with the **short TRADE_MAP key** (from `tradeFromAd()`) like:
```
brake, wrench, polish, pave, wreck, rinse, mow, etc.
```

Storage paths were uploaded as `{slug}-hero-a.jpg` (full slug), so:
- `getCreativeUrls('brake', ...)` → looks for `nb2-creatives/brake-c2.jpg`
- Actual file in storage: `trade-heros/nb2/auto-repair-hero-a.jpg`

These paths will **404 for every trade** except possibly `saw` (concrete-cutting), which also has a mismatch (`saw` key vs `concrete-cutting` slug).

**Fix:** Decide on one naming convention. Either: (a) add a `slug` field to TRADE_MAP entries and use it in `getCreativeUrls`, or (b) add a reverse-lookup from short key to full slug.

---

## 🟡 Inconsistencies

### 7. `supabase` (anon client) exported but never used

**File:** `lib/supabase.ts`

```ts
export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackKey);
```

Every file that touches the DB imports `supabaseAdmin`. The browser-safe `supabase` client is **never imported** anywhere in the codebase. It's essentially dead weight — and it silently initializes a client even with fallback values, which could cause confusion.

**Risk:** If the anon key is weak or RLS is misconfigured, the exported anon client could be a security surface. Recommend removing or marking it `@internal`.

---

### 8. `approval/route.ts` constructs an `ApprovalItem` with fields not in the type

**File:** `app/api/approval/route.ts` → `adToApprovalItem()`

Constructs an object with `source`, `campaign_group`, `format`, `created_at` fields and passes it to `normalizeApprovalItem()`. Those fields are **not on `ApprovalItem`** in `lib/types.ts`. They're silently dropped by `normalizeApprovalItem`. If any UI component ever tries to access `item.source` or `item.campaign_group` from an approval item coming from this endpoint, it will get `undefined`.

**Fix:** Either add these fields to `ApprovalItem`, or don't include them in the intermediate object.

---

### 9. `getCreativeUrl` uses only 4 prefixes, returns `null` for all others

**File:** `lib/trade-utils.ts`

```ts
const CREATIVE_PREFIXES = new Set(["saw", "rinse", "mow", "rooter"]);
```

With 64 trades in TRADE_MAP, any call to `getCreativeUrl` for trades outside these 4 returns `null`. The function is used in ad previews. Every other trade renders without a creative image.

This may be intentional (local renders only exist for 4 trades), but it's not documented and the function signature gives no indication — callers must check for null and fall back.

**Minor companion issue:** The LinkedIn format maps to `1200x1200-linkedin` (square), not `1200x628` (the actual LinkedIn landscape spec and what `FORMAT_SPECS["linkedin-single"]` declares as 1200×628). The local creative filename for LinkedIn would need to exist at this square dimension which conflicts with the FORMAT_SPECS spec.

---

### 10. `tradeFromAd()` hard-codes fallback to `"saw"`

**File:** `lib/trade-utils.ts`

```ts
return "saw";  // final fallback
```

Any ad whose `utm_campaign`, `campaign_group`, or `landing_path` doesn't contain a recognizable TRADE_MAP key silently gets the `saw` badge and creative. For the NB2 multi-trade campaign (`nb2_d1_linkedin_saw`, `nb2_d2_li_trowel`, etc.) this works — but if any trade prefix is misspelled or uses the full slug name (e.g. `concrete-cutting` instead of `saw`), it quietly falls through to `saw` with no warning.

---

### 11. Duplicate `TRADE_MAP` / trade lookup logic across files

Three separate places define trade → brand mappings:
- `lib/trade-utils.ts` — the canonical 64-entry TRADE_MAP
- `app/api/generate/route.ts` — local 10-entry TRADE_MAP (not imported from lib)
- `scripts/audit-ads.mjs` — `TRADE_SIGNALS` uses 50+ prefix keys for vocabulary matching

The audit script's `TRADE_SIGNALS` keys (e.g. `mow`, `pest`, `duct`, `detail`) align with TRADE_MAP keys, but it adds `electricians`, `roofrepair`, `disaster` which are in TRADE_MAP — and also includes trades not in TRADE_MAP at all: `bodythop`, `shrink` as separate entries. Minor divergence, but the duplication is a maintenance risk.

---

### 12. `creative_variant` defaults to `1` in `normalizeAd` instead of `null`

**File:** `lib/server-utils.ts`

```ts
creative_variant: (input.creative_variant ?? input.creativeVariant ?? 1) as number,
```

Defaulting to `1` means ads that have never had a `creative_variant` set will appear to use variant 1 (the hero_a image). This is probably the right UX default, but it masks whether the value was explicitly set by the user or auto-defaulted. Could cause issues if the DB column stores `NULL` for "not set" — a `null` → `1` shim at the application layer diverges from DB reality.

---

### 13. `approval_queue` vs `approval` route — two overlapping endpoints

Both `app/api/approval-queue/route.ts` and `app/api/approval/route.ts` serve overlapping purposes:
- Both do `GET` for queue items
- Both do `PATCH`/approve/reject operations
- `approval/route.ts` is the more complete one (also pulls pending ads from `ads` table)
- `approval-queue/route.ts` is narrower (approval_queue table only)

It's unclear which the UI uses. If both are called, data may be inconsistently updated. There's no comment on which is "primary".

---

### 14. `logActivity` in `server-utils.ts` doesn't check for Supabase errors

**File:** `lib/server-utils.ts`

```ts
await supabaseAdmin.from("activity_log").insert(payload);
// error is ignored
```

The `.insert()` result is not destructured. If activity logging fails (table doesn't exist, RLS blocks, etc.), it silently swallows the error. Not critical for business logic, but means the activity log can be silently broken without any indication.

---

### 15. `lib/metrics.ts` exports (`calcActivationRate`, `calcCpaPaid`, `calcCtr`, `calcCpaStart`, `signal`) never imported

**File:** `lib/metrics.ts`

All five exports appear to be unused anywhere in the codebase. These are presumably utility functions for future scorecard/analytics work. Not harmful, but they're dead code.

Same for:
- `api.ts`: `corsHeaders` — exported, never imported
- `server-utils.ts`: `asNumber` — exported, used internally but never imported directly by other files (only via server-utils itself)
- `project-state-data.ts`: `ProjectState` type — exported but never imported (only `getProjectState` is used)

---

## 🟢 Minor

### 16. `buildCreativePrompt` style reference — `STYLE_DESCRIPTIONS` contains `retargeting` key without quotes

**File:** `lib/ai-creative.ts`

```ts
export const STYLE_DESCRIPTIONS: Record<CreativeStyle, string> = {
  ...
  retargeting: "Mood: activating...",   // key without quotes — valid JS but inconsistent
```

All other keys use quoted strings (`"pain-point"`, `"feature-demo"`, `"social-proof"`). Unquoted `retargeting` works fine in TypeScript but is stylistically inconsistent. No functional issue.

---

### 17. `buildCreativePrompt` isometric diorama style is solid but missing one boundary

The prompt explicitly excludes people/faces and text/logos, and the style spec is thorough and well-structured. One gap: the `STRICTLY EXCLUDE` section doesn't mention "no human hands". Several trade scenes (chimney, carpet, bodyshop) might plausibly generate hands-on-tool shots which could drift toward showing partial people. Consider adding `"No human body parts (hands, arms, faces)"` to the exclusion list.

---

### 18. `FORMAT_SPECS` in `ai-creative.ts` and actual image resizing in `app/api/ai-creative/route.ts` are separate

The route uses `FORMAT_SPECS[body.format].width/height` for sharp resizing — this is correct. But the model `gemini-3.1-flash-image-preview` returns a 1:1 image (comment in code: "NB2 returns 1:1 by default"). Resizing a square to 1200×628 (LinkedIn) or 1080×1920 (story) with `fit: "cover"` will significantly crop the generated composition. The prompt's `composition` hint for each format tries to compensate, but the model's actual output aspect ratio means stories and landscape formats will always be centercropped from a square.

This is a fundamental limitation of the current model, not a code bug, but worth documenting.

---

### 19. `WorkflowStage` missing `"live"` from `statusToWorkflowStage`

**File:** `lib/server-utils.ts`

```ts
export function statusToWorkflowStage(status: Ad["status"]): Ad["workflow_stage"] {
  if (status === "approved") return "approved";
  if (status === "paused") return "uploaded";
  if (status === "rejected") return "concept";
  return "copy-ready";
}
```

`WorkflowStage` includes `"live"` and `"creative-brief"` but these are never produced by `statusToWorkflowStage`. This means workflow promotion to `"live"` or `"creative-brief"` can only happen via explicit `workflow_stage` field in a PATCH payload, never automatically from a status change. This is probably intentional design — but if an ad goes `pending → approved`, it jumps to `"approved"` stage, never passing through `"creative-brief"`. The workflow display might show a gap.

---

### 20. `AdTemplate` type is missing `updated_at`

**File:** `lib/types.ts`

The `ad_templates` table schema (migration 003) doesn't include `updated_at`. The `AdTemplate` type also doesn't include it. The `normalizeTemplate()` function doesn't handle it. This means templates have no `updated_at` tracking — minor, but noted as an eventual gap if you want change history.

---

## ✅ Clean

- **Error handling on all primary Supabase queries** — all `GET`/`PATCH`/`POST` routes properly destructure `{ data, error }` and check `error` before accessing `data`. ✓
- **`normalizeAd()` is comprehensive** — handles both camelCase and snake_case inputs correctly via the dual-read pattern (`input.campaign_group ?? input.campaignGroup`). ✓
- **`workflow_stage` column-missing fallback** — the `isWorkflowStageColumnMissing()` check in ads routes gracefully falls back to file-based override if the column doesn't exist yet. ✓
- **`tradeFromAd()` multi-strategy lookup** — checks exact segment match, last segment, second-to-last segment, and landing path before fallback. Robust for NB2 campaign naming patterns. ✓
- **Supabase `isSupabaseConfigured` guard** — `hasSupabase()` is checked consistently in every route before using `supabaseAdmin`. No routes blindly call the DB without this guard. ✓
- **`lib/constants.ts`** — clean, single-source of truth for platform labels/colors/status colors. No duplication found. ✓
- **Migration files are sequential and non-destructive** — no `DROP TABLE`, only `ADD COLUMN IF NOT EXISTS` and `CREATE TABLE IF NOT EXISTS`. Safe to re-run. ✓

---

## 📊 Reconstructed `ads` table schema

Based on all migrations + route code, the `ads` table as it **must exist** in production for the codebase to work:

| Column | Type | Source | Notes |
|--------|------|--------|-------|
| `id` | `TEXT` (PK) | migration 001 | e.g. `"LI-R1"` |
| `platform` | `ad_platform` ENUM | migration 001 | `linkedin\|youtube\|facebook\|instagram` |
| `campaign_group` | `TEXT NOT NULL` | migration 001 | e.g. `"4h_linkedin_problem"` |
| `format` | `TEXT NOT NULL` | migration 001 | e.g. `"static1x1"`, `"video30"`, `"reel9x16"` |
| `primary_text` | `TEXT NOT NULL` | migration 001 | ad body copy |
| `headline` | `TEXT` | migration 001 | nullable |
| `cta` | `TEXT NOT NULL` | migration 001 | e.g. `"Start now"` |
| `landing_path` | `TEXT NOT NULL` | migration 001 | e.g. `"/li"` |
| `utm_source` | `TEXT NOT NULL` | migration 001 | |
| `utm_medium` | `TEXT NOT NULL` | migration 001 | |
| `utm_campaign` | `TEXT NOT NULL` | migration 001 | |
| `utm_content` | `TEXT NOT NULL` | migration 001 | |
| `utm_term` | `TEXT NOT NULL` | migration 001 | |
| `status` | `ad_status` ENUM | migration 001 | `approved\|pending\|paused\|rejected` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | migration 001 | |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | migration 001 | auto-updated via trigger |
| `workflow_stage` | `TEXT NOT NULL DEFAULT 'concept'` | migration 003 | not a proper ENUM — plain text |
| `image_url` | `TEXT` | migration 004 | nullable |
| `creative_variant` | **MISSING** | ❌ no migration | referenced in code but never added to DB |

### Observations on schema vs code:

1. **`workflow_stage` is plain TEXT** in the DB (not an ENUM), while TypeScript treats it as a strict union type. This means the DB will accept invalid values (`"rejected"`, `"revision_requested"`) without error, but the TypeScript type will catch them at compile time only if type checking is strict.

2. **`creative_variant` must be added** — migration 007 needed.

3. **The `ad_status` ENUM** only has `approved | pending | paused | rejected`. The code's `statusToWorkflowStage` maps `paused → uploaded` which makes sense for a workflow (uploaded to platform, now paused). This is correctly handled.

4. **`ad_status_history` table** exists in migration 001 and is queried via `select("*, ad_status_history(*)")` in the ads detail route. The relationship via `ad_id` FK is correct.

---

## Summary of action items by priority

| # | Issue | Severity | File to fix |
|---|-------|----------|-------------|
| 1 | Add `creative_variant` column migration | 🔴 Critical | new `007_creative_variant.sql` |
| 2 | Add `"rejected"` + `"revision_requested"` to `WorkflowStage` | 🔴 Critical | `lib/types.ts` |
| 3 | Delete/fix diverged local TRADE_MAP in generate route | 🔴 Critical | `app/api/generate/route.ts` |
| 4 | Add `image_url` + `creative_variant` to `adToLegacyJson` | 🔴 Critical | `lib/server-utils.ts` |
| 5 | Remove dead UPDATE from migration 004 | 🔴 Critical | `supabase/migrations/004_image_url.sql`, `app/api/migrate/route.ts` |
| 6 | Fix `getCreativeUrls` prefix vs trade_assets slug mismatch | 🔴 Critical | `lib/trade-utils.ts` |
| 7 | Remove or clearly mark `supabase` anon client export | 🟡 | `lib/supabase.ts` |
| 8 | Add extra ApprovalItem fields to type OR remove them | 🟡 | `lib/types.ts` |
| 9 | Document `getCreativeUrl` null for non-4 prefixes | 🟡 | `lib/trade-utils.ts` |
| 10 | Handle `logActivity` error silently swallowed | 🟡 | `lib/server-utils.ts` |
| 11 | Add `"No human body parts"` to isometric prompt exclusions | 🟢 | `lib/ai-creative.ts` |
| 12 | Remove dead exports from `lib/metrics.ts` | 🟢 | `lib/metrics.ts` |
