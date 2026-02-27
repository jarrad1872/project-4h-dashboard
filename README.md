# Project 4H Campaign Dashboard

**Live:** https://pumpcans.com  
**Operating model:** See [`SOP-WORKFLOW.md`](./SOP-WORKFLOW.md) — dashboard is the view layer; Bob is the engine.

Project 4H — Saw.City Campaign Command built with Next.js App Router.

## Local Development

```bash
cd /home/node/.openclaw/workspace/projects/project-4h-dashboard
npm install
npm run dev
```

Open http://localhost:3000.

## Build Verification

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import `project-4h-dashboard`.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`.
5. Output directory: `.next`.
6. Deploy.

## Connect `non.city` Domain

In your DNS provider, add this record:

- **Type:** `CNAME`
- **Name/Host:** `non` (or `@` if apex via ALIAS/ANAME supported)
- **Value/Target:** `cname.vercel-dns.com`
- **TTL:** Auto (or 300 seconds)

Then add `non.city` in Vercel Project → Settings → Domains.

## API Reference

All routes are under `/api` and return JSON with CORS headers.

### Ads
- `GET /api/ads?platform=&status=` — list/filter ads
- `POST /api/ads` — create ad
- `GET /api/ads/:id` — get one ad
- `PATCH /api/ads/:id` — update ad fields/status

### Metrics
- `GET /api/metrics` — all weekly scorecards
- `POST /api/metrics` — create/update week

### Lifecycle
- `GET /api/lifecycle` — list lifecycle assets
- `PATCH /api/lifecycle` — update message/status by `id`

### Launch Checklist
- `GET /api/launch-checklist` — list items
- `PATCH /api/launch-checklist` — toggle item by `id` or `{ markAll: true }`

### Budget
- `GET /api/budget` — budget snapshot
- `PATCH /api/budget` — update spent/allocated

### Campaign Status
- `GET /api/campaign-status`
- `PATCH /api/campaign-status`

### Actions
- `POST /api/actions/pause` — `{ channel }` pauses one/all channels
- `POST /api/actions/scale` — `{ channel, newBudget }`

### Health/Summary
- `GET /api/status` — health and campaign summary

### Approval Queue (supporting route)
- `GET /api/approval`
- `PATCH /api/approval` — approve/revise/reject by id
