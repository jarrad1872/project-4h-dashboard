# Pending Doc Updates

**Created:** 2026-02-28  
**Status:** Proposed — not yet applied  
**Trigger:** Commit `820719f` (TRADE_MAP fix — all 65 prefixes + `tradeFromAd()` upgrade)

These changes were identified as follow-up housekeeping after the TRADE_MAP fix. Jarrad chose to defer applying them and park them here instead.

---

## 1. SOP-WORKFLOW.md — Add TRADE_MAP Maintenance Rule

**File:** `SOP-WORKFLOW.md`  
**Section:** AD COPY SOPs → Hard Rules (after rule 5)

**Proposed addition:**

```
### TRADE_MAP Maintenance Rule
When a new trade is added to the campaign:
1. Add its prefix(es) to `TRADE_MAP` in `lib/trade-utils.ts` **before** deploying any ads for that trade.
2. Verify the entry includes: `domain`, `label`, `color`, `tier`.
3. Verify `tradeFromAd()` can resolve the prefix from both `utm_campaign` and `campaign_group` fields.

Missing TRADE_MAP entries cause the /ads and /approval pages to silently fall back to `saw.city` badges,
making all trades look like concrete-cutting campaigns. This is a silent failure — no error thrown.

**Baseline:** 65 prefixes registered as of commit `820719f` (Feb 28, 2026).
Full list: alignment, appraisals, bartender, bodyshop, bookkeeper, brake, carpetcleaning, cater, chimney,
coat, detail, directional, disaster, drywall, duct, electricians, esthetician, excavation, finish,
fireprotection, grade, groom, grout, haul, hitch, housecleaning, hydrovac, inspection, insulation, lawfirm,
locating, lockout, metalworks, mold, mow, nail, pane, pave, pest, pipe, plank, plow, polish, poolservice,
portrait, privatechef, prune, refrigeration, remodels, renewables, rinse, rolloff, roofrepair, rooter, saw,
sentry, septic, shrink, siding, stamped, taxprep, trowel, wreck, wrench
```

---

## 2. AGENTS.md — Update `lib/trade-utils.ts` Row

**File:** `AGENTS.md`  
**Section:** Wherever `lib/trade-utils.ts` is referenced (likely in the file registry or key files table)

**Proposed addition/update:**

```
lib/trade-utils.ts — TRADE_MAP + tradeFromAd() helper
  - TRADE_MAP must contain ALL active trade prefixes (65 baseline as of Feb 28, 2026).
  - When adding a new trade: add its prefix here FIRST, before pushing any ads.
  - tradeFromAd() checks utm_campaign and campaign_group; handles last-segment,
    second-to-last-segment, and substring patterns. Fallback is `saw` — so missing
    prefixes are invisible failures, not thrown errors.
  - Reference commit: 820719f
```

---

## Why These Weren't Applied Yet

Jarrad decided to defer these docs-only cleanups and park them here instead. No urgency — the code fix (`820719f`) is already live. These are just housekeeping notes so future-Bob knows what the rule should be when maintaining the TRADE_MAP.

Apply when convenient. Both are small, surgical edits — no code changes, docs only.
