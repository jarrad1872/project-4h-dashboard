# SOP: Project 4H Dashboard — Operating Model

**Last updated:** 2026-02-27  
**Dashboard:** https://pumpcans.com  
**Campaign docs:** `projects/sawcity-lite/docs/project-4h/`

---

## Core Principle

> **The dashboard is the view layer. Bob is the engine.**

Jarrad never needs to interact directly with the dashboard to trigger work. Everything flows through Telegram commands. The dashboard reflects state — it does not create it.

```
Jarrad (Telegram) → Bob → generates/updates → pumpcans.com shows result
```

---

## How It Works

### What Jarrad Does
- **Issues commands in Telegram** — plain language ("generate 3 new LinkedIn ads for the retargeting set", "pause the YouTube campaign", "show me this week's scorecard")
- **Reviews outputs** — in Telegram or at pumpcans.com, whichever is easier
- **Approves/rejects** — says yes/no in chat; Bob records the decision and updates the dashboard

### What Bob Does
- Generates ad copy, lifecycle messages, creative briefs, and campaign updates
- Calls the pumpcans.com REST API to push state changes
- Monitors performance metrics and surfaces kill/scale signals
- Records all approvals in `APPROVAL-DECISIONS-*.md`
- Keeps the dashboard current without Jarrad touching it

### What the Dashboard Is For
- **Visual status check** — at a glance: budget, ad states, launch progress
- **Approval queue** — see what's pending; Bob handles the mechanics
- **Scorecard** — weekly KPIs, kill/scale thresholds from `OPERATING-PACK-v1.md`
- **Launch gate** — checklist progress toward go-live
- **Reference** — not the source of truth for commands; that's Telegram

---

## REST API (Bob's Interface)

All endpoints at `https://pumpcans.com/api`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/status` | GET | Campaign health summary |
| `/api/ads` | GET | All 27 ads + status |
| `/api/ads/:id` | GET | Single ad detail |
| `/api/metrics` | GET | Weekly KPI data |
| `/api/lifecycle` | GET | Lifecycle message states |
| `/api/launch-checklist` | GET | Launch gate progress |
| `/api/budget` | GET | Budget allocation + spend |
| `/api/approval-queue` | GET | Pending approvals |
| `/api/activity` | GET | Recent activity log |
| `/api/actions/pause` | POST | Pause a platform or ad |
| `/api/actions/scale` | POST | Scale budget up/down |
| `/api/generate` | POST | AI-generate ad variations |
| `/api/campaign-status` | GET | Full campaign state object |

Bob calls these directly. No manual API calls needed from Jarrad.

---

## Command Examples (Telegram → Bob)

```
"Generate 3 new Facebook ads targeting weekend readers, pain angle"
"Pause LinkedIn — CPL is over threshold"
"What's the scorecard look like this week?"
"Mark checklist item 4 complete"
"Show me the retargeting approval queue"
"Scale YouTube budget 20% — CPL is good"
```

---

## Approval Gate Rule

**No customer-facing asset goes live without Jarrad's explicit approval.**

- Bob generates → presents in Telegram → Jarrad approves/rejects
- Bob records decisions in `APPROVAL-DECISIONS-YYYY-MM-DD.md`
- Bob updates dashboard status via API (`status: approved | rejected`)
- Asset is never uploaded to ad platforms until `status = approved`

---

## Supabase Migration (One-Time Pending Task)

The dashboard runs on fallback overlays until this SQL is applied. Run once in the [Supabase SQL Editor](https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas/editor):

```sql
ALTER TABLE ads ADD COLUMN IF NOT EXISTS workflow_stage text NOT NULL DEFAULT 'concept';

UPDATE ads SET workflow_stage = CASE
  WHEN status = 'approved' THEN 'approved'
  WHEN status = 'paused' THEN 'uploaded'
  WHEN status = 'rejected' THEN 'concept'
  ELSE 'copy-ready'
END;

CREATE TABLE IF NOT EXISTS ad_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  platform text NOT NULL,
  format text,
  primary_text text,
  headline text,
  cta text,
  landing_path text,
  utm_campaign text,
  created_at timestamptz DEFAULT now()
);
```

After this runs, workflow stage changes and saved templates persist in the database.

---

## Tech Stack Reference

| Layer | What |
|-------|------|
| Frontend | Next.js 14, Tailwind CSS, deployed on Vercel |
| Backend | Supabase (PostgreSQL via PostgREST), 11 API routes |
| AI Generation | Gemini 2.0 Flash (via `GEMINI_API_KEY`) |
| Domain | pumpcans.com (GoDaddy DNS → Vercel) |
| Repo | `jarrad1872/project-4h-dashboard` |
| Campaign docs | `jarrad1872/sawcity-lite` → `docs/project-4h/` |

---

## What This Is NOT

- ❌ Not a place to manually enter ads or copy
- ❌ Not the source of truth for approvals (those live in `APPROVAL-DECISIONS-*.md`)
- ❌ Not a platform for uploading to LinkedIn/Meta/YouTube (use upload CSVs for that)
- ❌ Not Bob's work queue (that's Telegram + task files)
