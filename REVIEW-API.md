# API Routes Review — 2026-03-01

Reviewed all 25 route files under `app/api/`. Cross-referenced against:
- `lib/types.ts` — canonical type definitions
- `lib/trade-utils.ts` — authoritative TRADE_MAP (60+ trades)
- `lib/server-utils.ts` — statusToWorkflowStage, normalizers
- `components/` and `app/` pages — to identify dead routes

---

## 🔴 Critical (broken / incorrect behavior)

### 1. `app/api/approval/route.ts:124` — Invalid `workflow_stage` values written to DB

When handling ad approval via `PATCH /api/approval`, the route hardcodes `workflow_stage` directly:

```ts
workflow_stage: payload.status === "approved" ? "approved"
              : payload.status === "rejected"  ? "rejected"
              : "revision_requested",
```

**Both `"rejected"` and `"revision_requested"` are not valid `WorkflowStage` values.**

`lib/types.ts` defines:
```ts
export type WorkflowStage = "concept" | "copy-ready" | "approved" | "creative-brief" | "uploaded" | "live";
```

The canonical mapping in `lib/server-utils.ts:statusToWorkflowStage` maps `"rejected"` → `"concept"`, not `"rejected"`. Every other route that transitions `workflow_stage` calls `statusToWorkflowStage()` — this one doesn't.

**Impact:** DB rows get `workflow_stage = "rejected"` or `workflow_stage = "revision_requested"`. Any UI code that switches on `WorkflowStage` will miss both values silently. This diverges from every other approval path in the codebase.

**Fix:** Replace lines 122-125 with `statusToWorkflowStage(adsStatus)` for the approved/rejected cases, and add `"revision_requested"` to `WorkflowStage` or map it to `"concept"`.

---

### 2. `app/api/generate/route.ts:3-14` — Local `TRADE_MAP` is massively diverged from `lib/trade-utils.ts`

This route defines its own 10-entry `TRADE_MAP`:
```ts
saw, rinse, mow, rooter, pipe, pave, haul, coat, grade, wrench
```

`lib/trade-utils.ts` has 60+ trades, including all 8 **Tier 1** trades (`pipe`, `mow`, `coat`, `duct`, `pest`, `electricians`, `roofrepair`, `disaster`). Missing from `/api/generate`:

- `duct`, `pest`, `electricians`, `roofrepair`, `disaster` — all Tier 1 priorities

**Impact:** Generating ad copy for any unlisted trade silently falls back to `saw` (Saw.City branding, concrete cutting persona). Sending a `trade: "electricians"` request returns Saw.City copy with no error.

**Fix:** Import `TRADE_MAP` from `lib/trade-utils.ts` (or a shared constant) instead of re-defining it locally.

---

### 3. `app/api/generate/route.ts:54,106,115,123` — Error swallowing returns HTTP 200 on Gemini failure

Three failure branches silently return the fallback with `status: 200`:
```ts
if (!apiKey)       return NextResponse.json(generateFallback(...), { status: 200 })   // line 54
if (!geminiRes.ok) return NextResponse.json(generateFallback(...), { status: 200 })   // line 106
if (!jsonMatch)    return NextResponse.json(generateFallback(...), { status: 200 })   // line 115
catch (err)        return NextResponse.json(generateFallback(...), { status: 200 })   // line 123
```

The caller has no way to distinguish a real AI response from a static fallback. The `source: 'fallback'` field exists in the payload but the HTTP status is always 200, so any fetch-based error handling (`.ok` check, try/catch) will see success.

**Fix:** Use `status: 207` (partial) or `status: 503` for fallback responses, or consistently surface an `error` key so the UI can show a degraded-mode warning.

---

### 4. `app/api/actions/scale/route.ts:86-91` and `app/api/budget/route.ts:122-127` — Unguarded final read-back (silent error swallow)

Both routes do an update, then re-fetch to return the full data — but the re-fetch errors are never checked:

```ts
// actions/scale/route.ts:86
const [{ data: budgetRows }, { data: config }] = await Promise.all([
  supabaseAdmin.from("budget").select("*"),
  supabaseAdmin.from("campaign_config").select("*").eq("id", 1).maybeSingle(),
]);
// errors are destructured but IGNORED
return okJson(budgetRowsToData((budgetRows ?? []) as BudgetRow[], ...));
```

If either read fails, the route returns `200 OK` with zero-value budget data, making the UI look like all budget has been cleared.

**Fix:** Destructure and check errors: `const [{ data: budgetRows, error: e1 }, { data: config, error: e2 }] = ...` and return `errorJson` if either fires.

---

### 5. `app/api/regen-creative/route.ts` and `app/api/trade-assets/route.ts` — No auth on write endpoints

- `POST /api/regen-creative` — triggers Gemini image generation (API cost) and uploads to Supabase Storage. Zero auth check. Any client-side fetch to this endpoint runs unchecked.
- `POST /api/trade-assets` — uploads images to Supabase Storage.
- `PATCH /api/trade-assets` — changes asset `status` (approve/reject). No auth check.

All other mutation routes at minimum have the Supabase service-role key as an implicit server-side gate, but since these are Next.js route handlers, they're accessible from the browser. By contrast, routes like `migrate` at least check `MIGRATE_SECRET`.

**Fix:** Add `getServerSession()` or a `CRON_SECRET` / `INTERNAL_KEY` header check to these endpoints.

---

### 6. `app/api/link-images/route.ts` POST handler — N+1 Supabase updates in a loop

The POST handler loops over every ad and issues an individual `UPDATE` per matched ad:

```ts
for (const ad of ads ?? []) {
  // ...
  const { error: pErr } = await supabaseAdmin
    .from("ads")
    .update({ image_url: imageUrl })
    .eq("id", ad.id);   // one DB call per ad
}
```

With 100 ads this is 100 sequential round-trips to Supabase.

**Fix:** Batch by `imageUrl` value — collect IDs per URL in a `Map<string, string[]>`, then do one `UPDATE ads SET image_url = $url WHERE id = ANY($ids)` per distinct URL.

---

## 🟡 Dead Routes (never called)

The following routes have zero callers in `app/` pages or `components/` (confirmed via grep and corroborated by `REFACTOR-NOTES.md`):

| Route | File | Evidence |
|---|---|---|
| `POST /api/actions/pause` | `app/api/actions/pause/route.ts` | Only called from `components/overview-actions.tsx:33`, which is itself never imported by any page. Superseded by `PATCH /api/campaign-status`. |
| `GET /api/activity` | `app/api/activity/route.ts` | No `fetch("/api/activity")` in codebase. No UI feed exists. |
| `GET\|PATCH /api/approval` | `app/api/approval/route.ts` | REFACTOR-NOTES confirms superseded. Approval page uses `/api/ads` directly. |
| `GET /api/approval-queue` | `app/api/approval-queue/route.ts` | Superseded by `/api/approval`. No callers found. |
| `POST /api/approval-queue/[id]/approve` | `app/api/approval-queue/[id]/approve/route.ts` | Superseded. Approval page uses `PATCH /api/ads/:id`. |
| `POST /api/approval-queue/[id]/reject` | `app/api/approval-queue/[id]/reject/route.ts` | Same — unused. |
| `GET\|POST /api/link-images` | `app/api/link-images/route.ts` | Admin utility only. No UI trigger, no page fetches it. |
| `POST /api/migrate` | `app/api/migrate/route.ts` | One-time DDL. Not a live route. |
| `GET /api/project-state` | `app/api/project-state/route.ts` | Pages call `getProjectState()` directly from `lib/project-state-data`. HTTP route unused. |
| `GET /api/status` | `app/api/status/route.ts` | Aggregate status dump. No page fetches it. REFACTOR-NOTES confirms. |

**Recommendation:** Delete the dead routes (except `migrate` — keep for historical reference). They add surface area, maintenance burden, and confuse future readers about which approval flow is canonical.

---

## 🟡 Redundancy / Duplication

### 1. `readWorkflowOverrides` / `writeWorkflowOverride` / `isWorkflowStageColumnMissing` duplicated verbatim

These three helpers appear identically in:
- `app/api/ads/route.ts` lines 21–50
- `app/api/ads/[id]/route.ts` lines 13–31

They should be extracted to `lib/server-utils.ts` or a shared `lib/workflow-utils.ts`.

### 2. Budget default fallback object duplicated 3×

The identical `{ totalBudget: 0, channels: { linkedin:…, youtube:…, facebook:…, instagram:… } }` default appears in:
- `app/api/budget/route.ts` GET (line 16) and PATCH (line 61)
- `app/api/actions/scale/route.ts` (line 25)

Should be a `const DEFAULT_BUDGET_DATA` in `lib/types.ts` or `lib/server-utils.ts`.

### 3. CampaignStatusData defaults duplicated 3×

The `{ status: "pre-launch", startDate: null, linkedinStatus: "ready", … }` default appears in:
- `app/api/campaign-status/route.ts` GET (line 16) and PATCH (line 44)
- `app/api/actions/pause/route.ts` (line 27)

### 4. `approval_queue` GET query duplicated

- `app/api/approval-queue/route.ts` GET queries `approval_queue` with `.order("updated_at", ascending: false)`
- `app/api/approval/route.ts` GET does the exact same query (lines 44–47) then also queries `ads`

Since `approval-queue` is a dead route, this is a delete rather than refactor.

### 5. Template-table-missing guard duplicated verbatim

`isMissingTemplatesTable()` appears identically in:
- `app/api/templates/route.ts` (lines 24–30)
- `app/api/templates/[id]/route.ts` (lines 14–20)

---

## 🟢 Minor

### 1. `app/api/generate/route.ts:39` — No try/catch around `request.json()`

All other routes wrap `request.json()` in a try/catch. This one doesn't — a malformed body will throw an unhandled exception:

```ts
export async function POST(request: Request) {
  const body: GenerateRequest = await request.json()  // ← can throw
```

### 2. `app/api/generate/route.ts:72` — Price hardcoded as string in prompt

```ts
`- Price is $79/mo — never any other number`
```

If the price changes, this won't be caught by any type system or search — should be a shared `APP_PRICE` constant.

### 3. `app/api/ai-creative/route.ts:13` and `app/api/regen-creative/route.ts:10` — Hardcoded model name

```ts
const MODEL_NAME = "gemini-3.1-flash-image-preview";  // ai-creative
const MODEL = "gemini-3.1-flash-image-preview";        // regen-creative
```

Defined independently in both files. Should be a shared `GEMINI_IMAGE_MODEL` constant.

### 4. `app/api/approval/route.ts:102` — Fragile regex-based source detection

```ts
const isAdSource = payload.source === "ads"
  || /^(RINSE|MOW|ROOTER|SAW|LI|YT|FB|IG|META)-/.test(payload.id);
```

This regex will miss any new trade prefixes (`COAT-xxx`, `PIPE-xxx`, `DUCT-xxx` etc.). Since the `approval` route is dead anyway, this is academic — but the pattern is worth flagging as a footgun if the route is ever resurrected.

### 5. `app/api/lifecycle/route.ts` — `updated_at` not set in Supabase update payload

In the Supabase path (lines 80–87), `updatePayload` only includes `channel`, `timing`, `subject`, `message`, `goal`, `status`. The `updated_at` field is never set:

```ts
const updatePayload: Record<string, unknown> = {};
if (payload.channel !== undefined) updatePayload.channel = payload.channel;
// ... no updated_at: isoNow()
```

The file-DB path correctly sets `updated_at: isoNow()` on line 48. Unless there's a Supabase DB trigger, the `updated_at` column won't be updated through this route.

### 6. `app/api/bulk-status/route.ts:42` — `any` type on updatePayload

```ts
const updatePayload: any = {};
```

Should be `Record<string, unknown>` consistent with all other routes.

### 7. `app/api/migrate/route.ts:48` — Auth bypass when `MIGRATE_SECRET` not set

```ts
if (secret !== process.env.MIGRATE_SECRET && process.env.MIGRATE_SECRET) {
```

When `MIGRATE_SECRET` is absent from env, the second clause is falsy, so the check is skipped entirely and anyone can run the migration. This is probably intentional for local dev, but it's an accidental foot-gun if the env var is accidentally omitted from a staging deployment.

### 8. `app/api/migrate/route.ts` — Hardcoded `'saw-%'` template prefix in SQL

```sql
AND t.name LIKE 'saw-%'
```

This was noted in REFACTOR-NOTES.md:77 as a known issue. It only links Saw.City templates to ads, ignoring all other trades.

### 9. `app/api/trade-assets/route.ts` PATCH — Unrestricted field spread

```ts
const { id, ...patch } = body;
// ...
.update({ ...patch, updated_at: new Date().toISOString() })
```

`patch` is typed as `{ status?, image_url?, notes? }` but TypeScript won't enforce this at runtime — any additional JSON key in the request body gets passed directly to Supabase. Consider explicitly building the update object.

### 10. `app/api/approval-queue/[id]/approve/route.ts:27-28` — Duplicate `isoNow()` calls

```ts
updated_at: isoNow(),
updatedAt: isoNow(),
```

Two separate calls to `isoNow()` — they could generate slightly different timestamps (microseconds apart). Should be `const now = isoNow()` with both fields using `now`.

---

## ✅ Clean Routes

These routes had no significant issues found:

- `app/api/ads/route.ts` — GET/POST well-structured; dual camelCase/snake_case handling is thorough; workflow_stage fallback pattern is intentional and consistent.
- `app/api/ads/[id]/route.ts` — GET/PATCH comprehensive; handles `workflow_stage` column-missing gracefully; status history correctly maintained.
- `app/api/budget/route.ts` — GET/PATCH clean (minor: final read-back error unchecked, noted in 🔴 #4 above for PATCH but GET is fine).
- `app/api/campaign-status/route.ts` — GET/PATCH clean; thorough camelCase↔snake_case bridging.
- `app/api/launch-checklist/route.ts` — GET/PATCH clean; `markAll` bulk path is well-implemented.
- `app/api/lifecycle/route.ts` — GET clean; PATCH has the `updated_at` gap noted in 🟢 #5.
- `app/api/metrics/route.ts` — GET/POST clean; dual legacy/row shape handling is clear.
- `app/api/templates/route.ts` — GET/POST clean; graceful `ad_templates` table-missing handling.
- `app/api/templates/[id]/route.ts` — DELETE clean; same graceful fallback.
- `app/api/ai-creative/route.ts` — POST logic clean (auth gap noted in 🔴 #5).
- `app/api/regen-creative/route.ts` — POST logic clean (auth gap noted in 🔴 #5).
- `app/api/trade-assets/route.ts` — GET clean (auth/spread gaps noted above).

---

## Summary Table

| Severity | Count | Top Action |
|---|---|---|
| 🔴 Critical | 6 | Fix `approval/route.ts:124` workflow_stage values immediately; fix `generate` TRADE_MAP divergence |
| 🟡 Dead routes | 10 | Delete 9 of them (keep `migrate` for reference) |
| 🟡 Duplication | 5 | Extract shared helpers for workflow overrides, budget defaults, template-table guard |
| 🟢 Minor | 10 | Quick wins: add try/catch to `generate` body parse, type `any` → `Record`, set `updated_at` in lifecycle PATCH |
