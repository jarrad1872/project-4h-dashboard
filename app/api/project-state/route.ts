import { NextResponse } from 'next/server'

export async function GET() {
  const state = {
    lastUpdated: '2026-02-27',
    version: '2.7.0',

    product: {
      name: 'Saw.City LITE',
      headline: 'AI phone receptionist + owner agent + job management for trades',
      url: 'https://sawcity-lite.vercel.app',
      status: 'production',
      summary: 'One codebase, 20 .city domains. AI answers the phone, texts the owner, and lets them manage jobs by voice. $79/mo, no demo, self-serve.',

      readiness: [
        { label: 'AI Receptionist (20 trades)', status: 'done', note: 'Answers calls, qualifies leads, creates jobs, texts owner' },
        { label: 'Owner Agent (voice + text)', status: 'done', note: '23 tools — scheduling, estimates, briefings, email, notes' },
        { label: 'Mobile PWA', status: 'done', note: 'Jobs, customers, calls, photos, billing. Works offline.' },
        { label: '20 Trade Domains Live', status: 'done', note: 'saw.city, rinse.city, pipe.city, lockout.city, mow.city + 15 more' },
        { label: 'Onboarding Interview', status: 'done', note: 'Voice-powered business config extraction on first login' },
        { label: 'Email Integration (Resend)', status: 'done', note: '20 .city domains verified, branded HTML templates' },
        { label: 'TCPA / SMS Compliance', status: 'done', note: 'Opt-out handling, consent tracking, privacy/terms pages live' },
        { label: 'Stripe Billing ($79/mo)', status: 'done', note: 'Single tier, no feature gating. Trial → paid flow.' },
        { label: 'Admin Panel', status: 'done', note: '10 pages — tenants, trades, logs, health, demo funnel, changelog' },
        { label: 'A2P 10DLC Campaign', status: 'in-review', note: 'TCR campaign under review (~2-3 weeks). SMS unblocked after approval.' },
        { label: 'Per-trade tool customization', status: 'pending', note: 'Different tool sets per trade (e.g. locksmith vs concrete cutter)' },
        { label: 'Job map view', status: 'pending', note: 'Plot active jobs on Google Map — post-launch P1' },
        { label: 'Route optimization', status: 'pending', note: 'Reorder daily jobs by optimal driving route — P2' },
      ],

      metrics: {
        backend_tests: 467,
        frontend_tests: 343,
        total_tests: 810,
        api_endpoints: 71,
        trade_domains: 20,
        monthly_price: 79,
        gross_margin_pct: '77–86%',
      },
    },

    campaign: {
      name: 'Project 4H',
      budget_total: 20000,
      channels: ['LinkedIn', 'YouTube', 'Facebook', 'Instagram'],
      status: 'pre-launch',
      dashboard: 'https://pumpcans.com',

      readiness: [
        { label: 'Strategy + Operating Pack', status: 'done', note: 'Kill/scale thresholds, UTM schema, weekly cadence defined' },
        { label: 'Ad Copy (27 ads)', status: 'done', note: '6 LinkedIn, 7 YouTube, 4 Facebook, 4 Instagram, 6 retargeting — all approved' },
        { label: 'Lifecycle Messaging (Day 0/1/3)', status: 'done', note: 'Email + SMS sequences approved' },
        { label: 'Landing Page Blocks', status: 'done', note: '/li /yt /fb /ig variants + section blocks approved' },
        { label: 'Upload-ready CSVs', status: 'done', note: 'CAMPAIGN-UPLOAD-SHEET-v2.csv — 27 rows, all platforms' },
        { label: 'Platform Setup Guides', status: 'done', note: 'LinkedIn, Meta, YouTube step-by-step upload guides ready' },
        { label: 'Creative Briefs (6 retargeting)', status: 'done', note: 'Image + video specs, messaging, visual direction per ad' },
        { label: 'Tracking SQL migration', status: 'pending', note: 'Apply 021_marketing_events.sql + 003_dashboard_v2.sql in Supabase SQL editor' },
        { label: 'Ad creative assets', status: 'pending', note: 'Images + video files not yet produced — briefs ready in APPROVAL-BATCH-003' },
        { label: 'Ad account / pixel setup', status: 'pending', note: 'LinkedIn Campaign Manager, Meta Ads, Google/YouTube Ads' },
        { label: 'Launch gate (10 items)', status: 'in-progress', note: '1/10 checklist items complete' },
        { label: 'A2P SMS approval', status: 'blocked', note: 'Lifecycle SMS blocked until TCR campaign approved (~2-3 weeks)' },
      ],
    },

    actions: [
      {
        priority: 1,
        label: 'Apply Supabase migrations',
        effort: '5 min',
        owner: 'Jarrad',
        detail: 'Run 003_dashboard_v2.sql + 021_marketing_events.sql in Supabase SQL editor. SQL in SOP-WORKFLOW.md.',
        link: 'https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas/editor',
      },
      {
        priority: 2,
        label: 'Produce ad creative assets',
        effort: '1–2 days',
        owner: 'Jarrad / designer',
        detail: '6 retargeting creative briefs ready. Need images + video cuts matching specs in APPROVAL-BATCH-003-CREATIVE-BRIEFS.md.',
        link: null,
      },
      {
        priority: 3,
        label: 'Set up ad accounts + pixels',
        effort: '2–3 hrs',
        owner: 'Jarrad + Bob',
        detail: 'LinkedIn Campaign Manager, Meta Ads Manager, Google Ads. Bob will walk through setup guides step-by-step.',
        link: null,
      },
      {
        priority: 4,
        label: 'Upload approved ads',
        effort: '1–2 hrs',
        owner: 'Bob',
        detail: '27 ads in CAMPAIGN-UPLOAD-SHEET-v2.csv, platform guides ready. Bob uploads when accounts are set up.',
        link: null,
      },
      {
        priority: 5,
        label: 'Complete launch gate checklist',
        effort: '30 min',
        owner: 'Bob',
        detail: '9 items remaining. Most blocked on ad accounts being live.',
        link: 'https://pumpcans.com/launch-gate',
      },
      {
        priority: 6,
        label: 'A2P 10DLC approval',
        effort: 'Waiting',
        owner: 'TCR (auto)',
        detail: 'SMS lifecycle blocked until approved. Campaign registered 2026-02-22. ETA: ~2-3 weeks.',
        link: null,
      },
      {
        priority: 7,
        label: 'Merge tracking PR → sawcity-lite',
        effort: '15 min',
        owner: 'Bob',
        detail: 'feat/project-4h-tracking branch ready. Deploy analytics events to saw.city production.',
        link: 'https://github.com/jarrad1872/sawcity-lite/pulls',
      },
    ],

    keyLinks: [
      { label: 'Saw.City LITE (prod)', url: 'https://sawcity-lite.vercel.app' },
      { label: 'Campaign Dashboard', url: 'https://pumpcans.com' },
      { label: 'GitHub — sawcity-lite', url: 'https://github.com/jarrad1872/sawcity-lite' },
      { label: 'GitHub — dashboard', url: 'https://github.com/jarrad1872/project-4h-dashboard' },
      { label: 'Supabase DB', url: 'https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas' },
      { label: 'Vercel Projects', url: 'https://vercel.com/jarrad-kippens-projects' },
      { label: 'Campaign docs', url: 'https://github.com/jarrad1872/sawcity-lite/tree/master/docs/project-4h' },
    ],
  }

  return NextResponse.json(state)
}
