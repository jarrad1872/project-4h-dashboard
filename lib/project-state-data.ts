// Shared project state — imported directly by both the API route and the GTM page.
// No HTTP self-fetch needed. Update this file to refresh all GTM board data.

export function getProjectState() {
  return {
    lastUpdated: '2026-02-28',
    version: '2.8.0',

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
      mission: '2,000 USERS — this is the number. Not 1,000. Not "customers." 2,000 users on Saw.City LITE.',
      target_users: 2000,
      budget_total: 20000,
      channels: ['LinkedIn', 'YouTube', 'Facebook', 'Instagram'],
      status: 'pre-launch',
      dashboard: 'https://pumpcans.com',
      tier1_trades: [
        { domain: 'saw.city', slug: 'concrete-cutting', appName: 'Saw.City', trade: 'Concrete Cutting' },
        { domain: 'rinse.city', slug: 'pressure-washing', appName: 'Rinse.City', trade: 'Pressure Washing' },
        { domain: 'mow.city', slug: 'lawn-care', appName: 'Mow.City', trade: 'Lawn Care' },
        { domain: 'rooter.city', slug: 'drain-cleaning', appName: 'Rooter.City', trade: 'Drain Cleaning' },
      ],
      all_trades: [
        { domain: 'saw.city', slug: 'concrete-cutting', appName: 'Saw.City', tier: 1 },
        { domain: 'rinse.city', slug: 'pressure-washing', appName: 'Rinse.City', tier: 1 },
        { domain: 'mow.city', slug: 'lawn-care', appName: 'Mow.City', tier: 1 },
        { domain: 'rooter.city', slug: 'drain-cleaning', appName: 'Rooter.City', tier: 1 },
        { domain: 'lockout.city', slug: 'locksmith', appName: 'Lockout.City', tier: 2 },
        { domain: 'pest.city', slug: 'pest-control', appName: 'Pest.City', tier: 2 },
        { domain: 'duct.city', slug: 'hvac', appName: 'Duct.City', tier: 2 },
        { domain: 'detail.city', slug: 'auto-detailing', appName: 'Detail.City', tier: 2 },
        { domain: 'plow.city', slug: 'snow-removal', appName: 'Plow.City', tier: 3 },
        { domain: 'prune.city', slug: 'tree-service', appName: 'Prune.City', tier: 3 },
        { domain: 'chimney.city', slug: 'chimney-sweep', appName: 'Chimney.City', tier: 3 },
        { domain: 'haul.city', slug: 'hauling', appName: 'Haul.City', tier: 3 },
        { domain: 'grade.city', slug: 'grading', appName: 'Grade.City', tier: 3 },
        { domain: 'coat.city', slug: 'painting', appName: 'Coat.City', tier: 3 },
        { domain: 'brake.city', slug: 'auto-repair', appName: 'Brake.City', tier: 3 },
        { domain: 'wrench.city', slug: 'mechanic', appName: 'Wrench.City', tier: 3 },
        { domain: 'polish.city', slug: 'floor-polishing', appName: 'Polish.City', tier: 3 },
        { domain: 'pave.city', slug: 'paving', appName: 'Pave.City', tier: 3 },
        { domain: 'wreck.city', slug: 'demolition', appName: 'Wreck.City', tier: 3 },
        { domain: 'pipe.city', slug: 'plumbing', appName: 'Pipe.City', tier: 3 },
      ],

      readiness: [
        { label: 'Strategy + Operating Pack', status: 'done', note: 'Kill/scale thresholds, UTM schema, weekly cadence defined' },
        { label: 'Ad Copy (27 ads approved)', status: 'done', note: '6 LinkedIn, 7 YouTube, 4 Facebook, 4 Instagram, 6 retargeting — all approved' },
        { label: '16 Ad Creatives (Tier 1)', status: 'done', note: '4 trades × 4 platforms — Nano Banana Pro generated, at pumpcans.com/creatives' },
        { label: 'Creative Briefs + Prompts', status: 'done', note: 'Every creative has full prompt/model/asset brief logged for iteration' },
        { label: 'Lifecycle Messaging (Day 0/1/3)', status: 'done', note: 'Email + SMS sequences approved' },
        { label: 'Landing Page Blocks', status: 'done', note: '/li /yt /fb /ig variants + section blocks approved' },
        { label: 'Upload-ready CSVs', status: 'done', note: 'CAMPAIGN-UPLOAD-SHEET-v2.csv — 27 rows, all platforms' },
        { label: 'Platform Setup Guides', status: 'done', note: 'LinkedIn, Meta, YouTube step-by-step upload guides ready' },
        { label: 'Ad approval queue', status: 'in-progress', note: '81 trade-specific copy variants pending review at pumpcans.com/approval' },
        { label: 'Conversion tracking (4H DB)', status: 'done', note: 'marketing_events table live in 4H Supabase — UTM attribution ready' },
        { label: 'Ad account + pixel setup', status: 'pending', note: 'LinkedIn Campaign Manager, Meta Ads, Google/YouTube Ads — Jarrad initiates' },
        { label: 'A2P SMS approval', status: 'blocked', note: 'Lifecycle SMS blocked until TCR campaign approved (~2-3 weeks)' },
      ],
    },

    actions: [
      {
        priority: 1,
        label: 'Review ad copy at pumpcans.com/approval',
        effort: '10 min',
        owner: 'Jarrad',
        detail: '81 trade-specific copy variants (Rinse/Mow/Rooter) pending approve/revise/reject. Nothing uploads without your sign-off.',
        link: 'https://pumpcans.com/approval',
      },
      {
        priority: 2,
        label: 'Add image_url column to ads table',
        effort: '30 sec',
        owner: 'Jarrad',
        detail: 'Run: ALTER TABLE ads ADD COLUMN IF NOT EXISTS image_url TEXT; — in 4H Supabase SQL editor. Unlocks creative thumbnails on /ads.',
        link: 'https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas/editor',
      },
      {
        priority: 3,
        label: 'Set up ad accounts + pixels',
        effort: '2–3 hrs',
        owner: 'Jarrad + Bob',
        detail: 'LinkedIn Campaign Manager, Meta Ads Manager, Google Ads. Bob walks through each setup guide step-by-step.',
        link: null,
      },
      {
        priority: 4,
        label: 'Upload creatives + launch campaigns',
        effort: '1–2 hrs',
        owner: 'Bob',
        detail: '16 creatives ready at pumpcans.com/creatives. Bob packages per-platform with UTMs + targeting specs once accounts are live.',
        link: 'https://pumpcans.com/creatives',
      },
      {
        priority: 5,
        label: 'A2P 10DLC approval',
        effort: 'Waiting',
        owner: 'TCR (auto)',
        detail: 'SMS lifecycle blocked until approved. Campaign registered 2026-02-22. ETA: ~2-3 weeks from TCR.',
        link: null,
      },
    ],

    keyLinks: [
      { label: 'Ad Creatives', url: 'https://pumpcans.com/creatives' },
      { label: 'Approval Queue', url: 'https://pumpcans.com/approval' },
      { label: 'Campaign Dashboard', url: 'https://pumpcans.com' },
      { label: 'GTM Board', url: 'https://pumpcans.com/gtm' },
      { label: 'Saw.City LITE (prod)', url: 'https://sawcity-lite.vercel.app' },
      { label: 'Supabase DB (4H)', url: 'https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas' },
    ],
  };
}

export type ProjectState = ReturnType<typeof getProjectState>;
