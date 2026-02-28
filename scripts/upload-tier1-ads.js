#!/usr/bin/env node
/**
 * upload-tier1-ads.js
 * Tier 1 Pivot — 108 ads across 4 trades: pipe/coat/duct/pest
 * Uploads to Supabase `ads` table; PATCH on conflict.
 */

const SUPABASE_URL = 'https://vzawlfitqnjhypnkguas.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YXdsZml0cW5qaHlwbmtndWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwOTU2NywiZXhwIjoyMDg3Nzg1NTY3fQ.P8qFx_7hYBA0h8ri6b3dGfM5JqBjLP-ej8zVeodMLa0';

// ─── AD DEFINITIONS ──────────────────────────────────────────────────────────

const ads = [

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPE.CITY — Plumbing ($191B TAM, 130K businesses)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── LinkedIn (LI-P1 to LI-P6) ──────────────────────────────────────────────
  {
    id: 'LI-P1',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pipe',
    headline: 'Every missed call costs you a job. Plumbers lose thousands when the phone goes to voicemail.',
    primary_text: `You're in the crawlspace finishing a rough-in. Your phone rings. By the time you surface, they've already called the next plumber.

That job is gone.

Pipe.City answers every call while you work — 24/7, fully scripted for plumbing emergencies, scheduling, and estimates. No call center. No per-minute billing.

$79/mo. No contracts. Set up in 20 minutes.

Your AI employee for plumbing.`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'LI-P1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-P2',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pipe',
    headline: '$79/mo = one booked job. Pipe.City pays for itself the first week.',
    primary_text: `What's your average plumbing job worth? A water heater swap? $600. An emergency burst pipe on a Saturday? $1,200+.

Pipe.City answers every call you miss — scheduling jobs, triaging emergencies, and keeping your calendar full while you're under a house finishing rough-in work.

One booked job covers 3+ months. The math isn't complicated.

$79/mo flat. Your AI employee for plumbing.`,
    cta: 'Try free — pipe.city',
    landing_path: '/pipe',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_roi',
    utm_content: 'LI-P2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-P3',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pipe',
    headline: "You're sweating a rough-in. Your phone rings. You can't answer. That customer just hired your competitor.",
    primary_text: `Plumbing doesn't wait. A burst supply line. A main stack backup. AC gone, water heater out, toilet overflowing — whatever it is, your customer is calling everyone until someone picks up.

You're not answering. You're working.

Pipe.City is your AI answering employee. It picks up, asks the right questions, schedules emergency dispatches, and books jobs while your hands are full of pipe wrench and primer.

$79/mo. Cancel anytime. Start free at pipe.city.`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_pain-point',
    utm_content: 'LI-P3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-P4',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pipe_retarget',
    headline: "You checked out Pipe.City. Still losing calls to voicemail?",
    primary_text: `You were curious enough to visit. Here's the truth: every day without it, you're leaving jobs on the table.

Plumbers using Pipe.City report booking 3-5 jobs per week they'd have otherwise missed — emergency calls captured while they were on-site, after-hours leads converted instead of lost.

Start free. No credit card required. See it work in 20 minutes.

pipe.city`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'LI-P4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-P5',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pipe_retarget',
    headline: "You know the problem. Pipe.City is the fix.",
    primary_text: `62% of plumbing service calls go unanswered. You've probably felt it — a voicemail from a potential customer who already booked someone else.

Pipe.City handles your calls while you handle the drain-waste-vent work. Pricing questions. Emergency triage. Scheduling and confirmation. All automatic. All for $79/mo.

No complicated setup. No long-term contract. Ready when you are.`,
    cta: 'Try free — pipe.city',
    landing_path: '/pipe',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-engaged',
    utm_content: 'LI-P5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-P6',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pipe_retarget',
    headline: "You started signing up for Pipe.City. Finish in 3 minutes.",
    primary_text: `Your AI employee is almost ready.

Finish setup and Pipe.City starts answering calls today — capturing jobs while you're on-site, after hours, or elbows-deep in a drain.

One missed emergency call already cost more than $79. Don't let the next one walk.

pipe.city — $79/mo`,
    cta: 'Finish signup — pipe.city',
    landing_path: '/pipe',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'LI-P6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── YouTube (YT-P1 to YT-P7) ───────────────────────────────────────────────
  {
    id: 'YT-P1',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_pipe',
    headline: "Your phone rang. You were in the crawlspace. That job just called the next plumber.",
    primary_text: `[0-3s: HOOK] Your phone's ringing. You're under the house on a rough-in.
[3-8s: PROBLEM] That customer? Gone. Called someone who picked up first.
[8-13s: SOLUTION] Pipe.City answers every call. Books the job. Keeps you working.
[13-15s: CTA] Start free at pipe.city.`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'YT-P1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-P2',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_pipe',
    headline: "The call you missed at 4PM on Tuesday cost you $1,200. Pipe.City prevents that.",
    primary_text: `[0-5s: HOOK] You finished a rough-in at 4PM. Three missed calls. One voicemail: "Hi, we have water coming through the ceiling..."
[5-15s: PROBLEM] By the time you call back, they've got a plumber on the way. Emergency rate. Weekend job. Gone to the guy who answered.
[15-25s: SOLUTION] Pipe.City is your AI employee. Answers every call. Schedules emergency dispatches. Books jobs automatically while you're on the tools.
[25-30s: CTA] $79 a month. No call center. Start free at pipe.city.`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'YT-P2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-P3',
    platform: 'youtube',
    format: 'video60',
    campaign_group: '4h_youtube_pipe',
    headline: "Why plumbers with 3 employees out-earn plumbers with 10 — they never miss a call.",
    primary_text: `[0-8s: HOOK] There are two kinds of plumbing businesses. Ones that answer every call. And ones that wonder why they're always chasing work.

[8-25s: PAIN] You know the math. Emergency call. Burst pipe. Sunday afternoon. Customer dials four plumbers. First to answer wins a $1,500 job. You're the fourth. You were finishing a water heater rough-in. Your phone was in your truck.

[25-45s: TRANSFORMATION] Pipe.City is your AI employee. It answers 24/7. It knows plumbing — supply lines, drain-waste-vent, PRV replacement, emergency shutoff procedures. It asks the right questions, books the job, and texts you the details. You focus on the work.

[45-60s: CTA] You don't need more people on the payroll. You need one that never sleeps. $79/mo. Start free today at pipe.city. Your AI employee for plumbing.`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_transformation',
    utm_content: 'YT-P3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-P4',
    platform: 'youtube',
    format: 'bumper6',
    campaign_group: '4h_youtube_pipe',
    headline: "Pipe.City — Never miss a plumbing call again.",
    primary_text: `Pipe rings. Pipe.City answers. You get the job. pipe.city`,
    cta: 'pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'YT-P4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-P5',
    platform: 'youtube',
    format: 'discovery',
    campaign_group: '4h_youtube_pipe',
    headline: "Plumbing answering service | $79/mo | Pipe.City",
    primary_text: `Pipe.City is the AI answering employee built for plumbers. Answers calls 24/7, schedules emergency dispatches, captures leads, and books jobs while you're on-site.

No call center. No per-minute billing. $79/mo flat.

Built for owner-operators with 1-10 employees. Setup in 20 minutes. Start free.`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_search-intent',
    utm_content: 'YT-P5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-P6',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_pipe_retarget',
    headline: "You checked out Pipe.City. Your competitors didn't wait.",
    primary_text: `[0-4s] You looked at Pipe.City. Smart move.
[4-11s] While you're still thinking, a plumber in your market just started answering every call you're missing.
[11-15s] Start free today — pipe.city`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'YT-P6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-P7',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_pipe_retarget',
    headline: "Still losing calls? Here's what Pipe.City does while you're working.",
    primary_text: `[0-5s] Every missed call is money. You know this already.
[5-20s] Pipe.City answers before the second ring. Asks: "Is this an emergency or a scheduled appointment?" Books the job. Sends you a text. Customer gets a confirmation.
[20-27s] Plumbers using Pipe.City average 4+ extra booked jobs per month. That's $1,500-$5,000 in recovered revenue — for $79.
[27-30s] Start free today — pipe.city`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-proof',
    utm_content: 'YT-P7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Facebook (FB-P1 to FB-P7) ──────────────────────────────────────────────
  {
    id: 'FB-P1',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pipe',
    headline: "You're mid rough-in. Phone rings. Customer's gone by the time you surface.",
    primary_text: `62% of plumbing calls go unanswered. Emergency customers don't wait — they call the next plumber on the list.

Pipe.City is your AI employee. Answers every call, 24/7, in plumbing language. Schedules jobs. Books emergency dispatches. Captures leads.

$79/mo. One job pays for 3 months. Start free at pipe.city.`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'FB-P1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-P2',
    platform: 'facebook',
    format: 'video9x16',
    campaign_group: '4h_facebook_pipe',
    headline: "The moment you can't answer is the moment they find another plumber.",
    primary_text: `[Story format — video script]

It's 5:45 PM. Mike's finishing a main stack replacement. Phone buzzes. Can't reach it. Customer leaves a voicemail — burst supply line, water everywhere.

By the time Mike calls back at 6:20, they've got someone else on the way.

Mike started using Pipe.City last month. Now every call gets answered — even when he's elbows-deep. Emergency dispatches get booked automatically.

$79/mo. Try free — pipe.city`,
    cta: 'Try Free',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'FB-P2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-P3',
    platform: 'facebook',
    format: 'carousel',
    campaign_group: '4h_facebook_pipe',
    headline: "3 reasons plumbers lose jobs every single day",
    primary_text: `Swipe through the 3 silent revenue killers for plumbing businesses — and how Pipe.City fixes each one.

→ Frame 1: Unanswered calls (62% go to voicemail) → Pipe.City answers 24/7
→ Frame 2: After-hours emergencies → Pipe.City books emergency dispatches automatically
→ Frame 3: Slow callbacks → Pipe.City responds in seconds, not hours

$79/mo. Start free at pipe.city`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'FB-P3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-P4',
    platform: 'facebook',
    format: 'lead-gen',
    campaign_group: '4h_facebook_pipe',
    headline: "How many plumbing calls did you miss this week? (The number will cost you.)",
    primary_text: `Most owner-operator plumbers miss 8-12 calls per week. At an average job value of $450, that's $3,600-$5,400 walking out the door — every single week.

Pipe.City answers every call for $79/mo.

Fill out the form below to see exactly how much missed revenue you're leaving on the table.`,
    cta: 'Calculate My Missed Revenue',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lead-gen',
    utm_content: 'FB-P4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-P5',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pipe_retarget',
    headline: "You visited Pipe.City. Here's exactly what you'd get for $79/mo.",
    primary_text: `✅ 24/7 AI call answering (knows plumbing terminology — rough-in, PRV, DWV, water heater, main stack)
✅ Emergency dispatch scheduling
✅ Automatic job booking + customer confirmation
✅ Missed-call text-back
✅ Text/CRM notification to you

Start free. No credit card. First call answered within 20 minutes of setup.

pipe.city`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'FB-P5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-P6',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pipe_retarget',
    headline: "You almost signed up for Pipe.City. Finish in 3 minutes.",
    primary_text: `Your AI plumbing employee is ready.

Setup takes 3 minutes. Your first call gets answered within 20 minutes.

You'll never hear "I called and nobody answered" from a lost customer again.

pipe.city — $79/mo. No contract.`,
    cta: 'Finish Signup',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'FB-P6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-P7',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pipe',
    headline: "Plumbers are quietly adding $2K+/mo using this AI answering tool.",
    primary_text: `Pipe.City is the AI employee that answers every call plumbers can't pick up — mid-job, after hours, weekends, and emergencies.

It books appointments, handles emergency dispatches, and knows the difference between a PRV replacement and a full repiping estimate.

$79/mo flat. No per-minute billing. No call center markup.

Start free at pipe.city — Your AI employee for plumbing.`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'FB-P7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Instagram (IG-P1 to IG-P7) ─────────────────────────────────────────────
  {
    id: 'IG-P1',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_pipe',
    headline: "You're in the crawlspace. Phone's ringing. That job just left.",
    primary_text: `[0-3s: HOOK] Phone rings. You're under a slab, sweating a rough-in.
[3-8s: PROBLEM] Customer calls 3 plumbers. First to answer wins the emergency job. You're not first.
[8-13s: SOLUTION] Pipe.City answers every call while you work — 24/7.
[13-15s: CTA] $79/mo — Start free at pipe.city`,
    cta: 'Start free at pipe.city',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'IG-P1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-P2',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_pipe',
    headline: "3 things Pipe.City does while you're on a job",
    primary_text: `[Frame 1] 📞 Answers every call — 24/7, in real plumbing language
[Frame 2] 📅 Books the job — emergency, scheduled, or estimate request
[Frame 3] 💰 $79/mo — pays for itself with one booked emergency call

Your AI employee for plumbing. Start free at pipe.city`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_features',
    utm_content: 'IG-P2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-P3',
    platform: 'instagram',
    format: 'static4x5',
    campaign_group: '4h_instagram_pipe',
    headline: "Your AI plumbing employee — $79/mo",
    primary_text: `Answers calls. Books jobs. Never sleeps.

Pipe.City is built for plumbers who are too busy working to answer the phone.

Start free — pipe.city`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'IG-P3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-P4',
    platform: 'instagram',
    format: 'carousel',
    campaign_group: '4h_instagram_pipe',
    headline: "Swipe to see what happens every time your phone goes to voicemail →",
    primary_text: `[Card 1] ☎️ You miss a call while finishing rough-in work.
[Card 2] Customer calls 3 plumbers. First to answer wins.
[Card 3] That's a $600-$1,200 emergency job — gone.
[Card 4] Pipe.City answers while you work. $79/mo.
[Card 5] Start free at pipe.city — Your AI employee for plumbing.`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'IG-P4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-P5',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_pipe_retarget',
    headline: "You saw Pipe.City. Still thinking about it?",
    primary_text: `[0-4s] You looked at Pipe.City. Smart move.
[4-10s] Every day you wait = more calls going to voicemail = more jobs going to competitors.
[10-15s] Start free today — pipe.city`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'IG-P5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-P6',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_pipe_retarget',
    headline: "You started signing up. Finish now — takes 3 minutes.",
    primary_text: `[Frame 1] You were this close to never missing a plumbing call again.
[Frame 2] Finish setup → Pipe.City answers your first call TODAY.
[Frame 3] $79/mo. Tap to finish → pipe.city`,
    cta: 'Finish Signup',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'IG-P6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-P7',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_pipe',
    headline: "Plumbers with Pipe.City book 4+ extra jobs a month on average.",
    primary_text: `Owner-operators using Pipe.City report:
✅ 4+ extra booked jobs/month
✅ Zero missed emergency calls
✅ More time on the tools, less time chasing leads

$79/mo. Your AI employee for plumbing.

Start free — pipe.city`,
    cta: 'Start Free',
    landing_path: '/pipe',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'IG-P7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COAT.CITY — Painting ($28B TAM, 220K businesses)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── LinkedIn (LI-C1 to LI-C6) ──────────────────────────────────────────────
  {
    id: 'LI-C1',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_coat',
    headline: "You're cutting in a ceiling. Phone rings. That exterior job just hired another painter.",
    primary_text: `Spring surge is the busiest time of year. Every painting contractor is slammed, and customers are calling down their list until someone picks up.

You're on the brush. You can't stop mid-cut.

Coat.City answers every call while you're working — 24/7, in painter language. Quotes, scheduling, color consultations, and estimate requests — all handled automatically.

$79/mo. Your AI employee for painting.`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'LI-C1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-C2',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_coat',
    headline: "$79/mo = one booked exterior job. Coat.City pays for itself before your first coat dries.",
    primary_text: `What's an exterior repaint worth to you? $2,000? $4,500? A deck + trim package?

Coat.City answers every call you miss — scheduling estimates, handling color questions, and booking jobs while you're loading the van or rolling a second coat.

One job. One month covered. The math works.

$79/mo flat. Your AI employee for painting.`,
    cta: 'Try free — coat.city',
    landing_path: '/coat',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_roi',
    utm_content: 'LI-C2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-C3',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_coat',
    headline: "You're on the brush. Phone rings. You can't put the roller down. Customer moves on.",
    primary_text: `Painting season doesn't slow down for phone calls. Spring through summer, customers are calling 3-4 painters and booking the first one who responds.

You're cutting in trim. You're mid-spray on a cabinet job. You're on a ladder three stories up.

Coat.City is your AI answering employee. It picks up, captures the lead, schedules estimates, and keeps your pipeline full — while you stay focused on the finish work.

$79/mo. Cancel anytime. Start free at coat.city.`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_pain-point',
    utm_content: 'LI-C3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-C4',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_coat_retarget',
    headline: "You checked out Coat.City. Painting season's starting — still losing leads?",
    primary_text: `You were curious enough to look. Here's the reality: spring is when most painters lose the most work — not because they're bad, but because they're too busy painting to answer the phone.

Coat.City captures those leads automatically, 24/7.

Start free. No credit card. See your first call handled in 20 minutes.

coat.city`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'LI-C4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-C5',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_coat_retarget',
    headline: "You know the problem. Coat.City is how painters fix it.",
    primary_text: `Peak season. More jobs than you can handle — and still losing leads because you can't answer while you're working.

Coat.City answers every call while you cut in, roll, spray, or prep. Estimates, scheduling, lead capture — all handled automatically.

$79/mo. Ready when you are.`,
    cta: 'Try free — coat.city',
    landing_path: '/coat',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-engaged',
    utm_content: 'LI-C5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-C6',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_coat_retarget',
    headline: "You started signing up for Coat.City. Finish before peak season hits.",
    primary_text: `Your AI painting employee is almost ready.

Finish setup in 3 minutes. Coat.City starts answering calls today — capturing jobs while you're on-site, spraying cabinets, or cutting in a 10-foot ceiling.

Don't lose spring to voicemail.

coat.city — $79/mo`,
    cta: 'Finish signup — coat.city',
    landing_path: '/coat',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'LI-C6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── YouTube (YT-C1 to YT-C7) ───────────────────────────────────────────────
  {
    id: 'YT-C1',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_coat',
    headline: "You're mid-cut on a ceiling. Phone rings. That exterior job just hired someone else.",
    primary_text: `[0-3s: HOOK] You're cutting in a ceiling. Phone buzzes.
[3-8s: PROBLEM] Customer wanted a quote. Called two other painters. One picked up.
[8-13s: SOLUTION] Coat.City answers every call while you work. Books the estimate. Keeps your calendar full.
[13-15s: CTA] Start free at coat.city.`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'YT-C1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-C2',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_coat',
    headline: "Spring surge is the busiest season. It's also when painters lose the most leads.",
    primary_text: `[0-5s: HOOK] April through July — every painter is booked solid. Jobs lined up. But the calls never stop.
[5-15s: PROBLEM] You can't answer mid-roller. Customer wants an exterior quote. They call three painters. First to respond wins a $3,500 job.
[15-25s: SOLUTION] Coat.City is your AI employee for painting. Answers every call. Books estimates. Handles color questions. Works while you're on the brush.
[25-30s: CTA] $79/mo. Start free at coat.city.`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'YT-C2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-C3',
    platform: 'youtube',
    format: 'video60',
    campaign_group: '4h_youtube_coat',
    headline: "The painters who grow aren't better — they just never miss a call.",
    primary_text: `[0-8s: HOOK] Why do some painters have a 6-week wait list while others are scrambling for work? It's not skill. It's not price. It's who answers the phone.

[8-25s: PAIN] You're mid-coat on a 3,000 sq ft exterior. Phone rings. You can't stop — you're on a wet edge. Customer wants a quote by end of day. They call the next painter. He answered on the second ring. He's booked a $4,200 job while you were finishing your current one.

[25-45s: TRANSFORMATION] Coat.City is your AI employee for painting. It answers 24/7 in painter language — cut in, primer coat, sheen levels, VOC questions, interior vs exterior prep. It books estimates, captures leads, and sends you a summary of every call.

[45-60s: CTA] You're already the best painter on the job. Now be the one who always picks up. $79/mo. Start free today at coat.city. Your AI employee for painting.`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_transformation',
    utm_content: 'YT-C3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-C4',
    platform: 'youtube',
    format: 'bumper6',
    campaign_group: '4h_youtube_coat',
    headline: "Coat.City — Never miss a painting lead again.",
    primary_text: `Brush down. Coat.City picks up. You get the job. coat.city`,
    cta: 'coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'YT-C4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-C5',
    platform: 'youtube',
    format: 'discovery',
    campaign_group: '4h_youtube_coat',
    headline: "Painting contractor answering service | $79/mo | Coat.City",
    primary_text: `Coat.City is the AI answering employee built for painting contractors. Answers calls 24/7, books estimate appointments, captures leads, and handles color/product questions while you're on the job.

No call center fees. No per-minute billing. $79/mo flat.

Built for solo painters and small crews. Setup in 20 minutes. Start free.`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_search-intent',
    utm_content: 'YT-C5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-C6',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_coat_retarget',
    headline: "You looked at Coat.City. Spring season is now. Your leads aren't waiting.",
    primary_text: `[0-4s] You checked out Coat.City. Good instinct.
[4-11s] Every day you wait is another lead going to the painter who picked up.
[11-15s] Start free before painting season peaks — coat.city`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'YT-C6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-C7',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_coat_retarget',
    headline: "Still losing painting leads? Here's what Coat.City does on every missed call.",
    primary_text: `[0-5s] Every missed call during peak season is a job that's probably not coming back.
[5-20s] Coat.City answers before the second ring. Books the estimate. Asks about scope — interior, exterior, how many rooms, sheen preference. Sends you a lead summary by text.
[20-27s] Painting contractors using Coat.City book 5+ extra estimate appointments per month. That's thousands in added revenue.
[27-30s] Start free today — coat.city`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-proof',
    utm_content: 'YT-C7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Facebook (FB-C1 to FB-C7) ──────────────────────────────────────────────
  {
    id: 'FB-C1',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_coat',
    headline: "You're cutting in. Phone rings. That estimate just booked with another painter.",
    primary_text: `Spring surge hits and your phone blows up. Problem is — you're on the brush, up a ladder, or spraying cabinets.

Customers don't wait. They call until someone answers.

Coat.City is your AI employee for painting. Answers 24/7. Books estimates. Captures leads while you focus on the finish.

$79/mo. Start free at coat.city.`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'FB-C1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-C2',
    platform: 'facebook',
    format: 'video9x16',
    campaign_group: '4h_facebook_coat',
    headline: "Peak painting season. Phone ringing. Can't answer. Watch what happens next.",
    primary_text: `[Story format — video script]

Sarah runs a 3-person painting crew. April through July, the phone never stops. Problem — she's always on-site, rolling a second coat or cutting in trim.

Last spring she missed 14 estimate calls in one week. She estimates that cost her $18,000 in booked jobs.

This spring Sarah uses Coat.City. Every call gets answered. Every estimate gets booked. She stays on the brush.

$79/mo. Try free — coat.city`,
    cta: 'Try Free',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'FB-C2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-C3',
    platform: 'facebook',
    format: 'carousel',
    campaign_group: '4h_facebook_coat',
    headline: "3 moments painters lose jobs every week",
    primary_text: `Swipe through the 3 peak-season revenue killers — and how Coat.City solves each one.

→ Frame 1: Missed calls mid-job → Coat.City answers 24/7
→ Frame 2: No one to handle estimate requests → Coat.City books appointments automatically
→ Frame 3: Leads going cold overnight → Coat.City responds instantly, even at 11 PM

$79/mo. Start free at coat.city`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'FB-C3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-C4',
    platform: 'facebook',
    format: 'lead-gen',
    campaign_group: '4h_facebook_coat',
    headline: "How much painting revenue are you losing to voicemail? (Calculate it free)",
    primary_text: `Most painting contractors miss 10-15 calls per week during peak season. At an average job value of $2,500, that's $25,000-$37,500 in lost revenue per season.

Coat.City answers every call for $79/mo.

Fill out the form below to see your missed-revenue estimate.`,
    cta: 'Calculate My Missed Revenue',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lead-gen',
    utm_content: 'FB-C4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-C5',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_coat_retarget',
    headline: "You visited Coat.City. Here's exactly what you'd get for $79/mo.",
    primary_text: `✅ 24/7 AI call answering (knows painting — cut in, primer, sheen, VOC, prep, cabinet finish)
✅ Estimate appointment booking
✅ Lead capture with job scope questions
✅ Instant text notification to you
✅ Missed-call follow-up

Start free. No credit card. First call answered in 20 minutes.

coat.city`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'FB-C5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-C6',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_coat_retarget',
    headline: "You almost signed up for Coat.City. Spring is here. Finish in 3 minutes.",
    primary_text: `Your AI painting employee is ready.

Setup takes 3 minutes. Coat.City starts answering calls today — capturing estimate requests and leads while you're on the job.

$79/mo. No contract. Don't lose peak season to voicemail.

coat.city`,
    cta: 'Finish Signup',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'FB-C6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-C7',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_coat',
    headline: "Painting contractors are quietly adding $5K+/season using this AI answering tool.",
    primary_text: `Coat.City is the AI employee that answers every call painters can't pick up — mid-coat, on a ladder, during peak season.

It books estimate appointments, handles color and product questions, and keeps your pipeline full while you stay on the brush.

$79/mo flat. No call center. No per-minute fees.

Start free at coat.city — Your AI employee for painting.`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'FB-C7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Instagram (IG-C1 to IG-C7) ─────────────────────────────────────────────
  {
    id: 'IG-C1',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_coat',
    headline: "You're cutting in a ceiling. Phone's ringing. That estimate just went to another painter.",
    primary_text: `[0-3s: HOOK] Mid-cut. Wet edge. Phone rings.
[3-8s: PROBLEM] Customer wants a quote on an exterior. Calls 3 painters. First one to answer books the job.
[8-13s: SOLUTION] Coat.City answers every call while you're on the brush.
[13-15s: CTA] $79/mo — coat.city`,
    cta: 'Start free at coat.city',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'IG-C1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-C2',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_coat',
    headline: "3 things Coat.City does during painting season",
    primary_text: `[Frame 1] 📞 Answers every call — 24/7, speaks painter (cut in, primer, sheen, prep)
[Frame 2] 📅 Books estimate appointments automatically — interior, exterior, cabinet jobs
[Frame 3] 💰 $79/mo — one booked exterior covers 10+ months

Your AI employee for painting. Start free at coat.city`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_features',
    utm_content: 'IG-C2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-C3',
    platform: 'instagram',
    format: 'static4x5',
    campaign_group: '4h_instagram_coat',
    headline: "Your AI painting employee — $79/mo",
    primary_text: `Answers calls. Books estimates. Never misses a lead.

Coat.City is built for painters who are too busy on the brush to answer the phone.

Start free — coat.city`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'IG-C3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-C4',
    platform: 'instagram',
    format: 'carousel',
    campaign_group: '4h_instagram_coat',
    headline: "Swipe to see what painters lose every time the phone goes to voicemail →",
    primary_text: `[Card 1] 🎨 You miss a call while cutting in trim.
[Card 2] Customer calls 3 painting contractors.
[Card 3] First to answer books a $3,500 exterior job.
[Card 4] Coat.City answers while you work. $79/mo.
[Card 5] Start free — coat.city. Your AI employee for painting.`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'IG-C4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-C5',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_coat_retarget',
    headline: "You saw Coat.City. Peak season is here. Still thinking?",
    primary_text: `[0-4s] You checked out Coat.City.
[4-10s] Every day you wait = more estimate calls going to voicemail = more jobs going to competitors.
[10-15s] Start free before your busiest weeks — coat.city`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'IG-C5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-C6',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_coat_retarget',
    headline: "You started signing up. Finish before peak season.",
    primary_text: `[Frame 1] You were this close to never missing a painting lead again.
[Frame 2] Finish setup → Coat.City answers calls TODAY.
[Frame 3] $79/mo. Tap to finish → coat.city`,
    cta: 'Finish Signup',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'IG-C6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-C7',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_coat',
    headline: "Painting contractors with Coat.City book 5+ extra estimates a month on average.",
    primary_text: `Painters using Coat.City report:
✅ 5+ extra booked estimates/month
✅ Zero lost leads during peak season
✅ More time painting, less time on the phone

$79/mo. Your AI employee for painting.

Start free — coat.city`,
    cta: 'Start Free',
    landing_path: '/coat',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'IG-C7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DUCT.CITY — HVAC ($30B TAM, 105K businesses)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── LinkedIn (LI-D1 to LI-D6) ──────────────────────────────────────────────
  {
    id: 'LI-D1',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_duct',
    headline: "You're in the attic pulling duct. Phone rings. That AC emergency just called another HVAC tech.",
    primary_text: `AC out in the middle of July. Customer is panicking. They call four HVAC contractors. First to answer gets a $1,800 emergency repair call.

You're in the attic. Phone's in your van.

Duct.City answers every call 24/7 — triages emergencies, schedules dispatches, and books service calls while you're up in the air handler or under the house chasing refrigerant lines.

$79/mo. Your AI employee for HVAC.`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'LI-D1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-D2',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_duct',
    headline: "$79/mo = one service call. Duct.City pays for itself on the first emergency dispatch.",
    primary_text: `An AC emergency call in July. A furnace that won't fire in January. What does that service call pay you — $800? $2,000?

Duct.City answers every HVAC call you miss — triaging emergencies, scheduling tune-ups, and booking installs while you're on a rooftop unit or in a crawlspace pulling linesets.

One call covers months. Simple math.

$79/mo flat. Your AI employee for HVAC.`,
    cta: 'Try free — duct.city',
    landing_path: '/duct',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_roi',
    utm_content: 'LI-D2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-D3',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_duct',
    headline: "You're in an attic at 104°F. Phone rings. You physically cannot answer. HVAC emergency goes to the next tech.",
    primary_text: `HVAC emergencies don't wait. Customer's AC is out, it's 95 degrees, they have a newborn — they're calling every contractor in a 20-mile radius until someone picks up.

You're sweating through a return plenum replacement. You're diagnosing a compressor on a rooftop unit. You can't stop.

Duct.City is your AI answering employee. It triages emergencies, schedules dispatches, answers tonnage and system questions, and keeps your service board full — 24/7.

$79/mo. Cancel anytime. Start free at duct.city.`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_pain-point',
    utm_content: 'LI-D3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-D4',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_duct_retarget',
    headline: "You checked out Duct.City. Still losing HVAC emergency calls to voicemail?",
    primary_text: `You were curious enough to visit. Here's the reality: HVAC emergency season is zero-tolerance for missed calls.

Customers with no AC in a heat wave aren't leaving voicemails. They're calling the next number on the list.

Duct.City captures every one of those calls automatically.

Start free. No credit card. See your first call handled in 20 minutes.

duct.city`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'LI-D4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-D5',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_duct_retarget',
    headline: "You know the problem. Duct.City is how HVAC contractors fix it.",
    primary_text: `Peak summer. Your service board is overflowing — and you're still losing emergency calls because you can't answer while you're on the job.

Duct.City answers every call while you're running refrigerant, swapping air handlers, or diagnosing a condenser. Triage. Dispatch. Scheduling. All automatic.

$79/mo. Ready when you are.`,
    cta: 'Try free — duct.city',
    landing_path: '/duct',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-engaged',
    utm_content: 'LI-D5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-D6',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_duct_retarget',
    headline: "You started signing up for Duct.City. Finish before the next emergency call goes to voicemail.",
    primary_text: `Your AI HVAC employee is almost ready.

Finish setup in 3 minutes. Duct.City starts answering calls today — triaging emergencies, scheduling dispatches, and capturing jobs while you're on a rooftop unit at 2 PM in August.

duct.city — $79/mo. No contract.`,
    cta: 'Finish signup — duct.city',
    landing_path: '/duct',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'LI-D6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── YouTube (YT-D1 to YT-D7) ───────────────────────────────────────────────
  {
    id: 'YT-D1',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_duct',
    headline: "You're in the attic. Phone rings. That AC emergency just hired the tech who answered.",
    primary_text: `[0-3s: HOOK] You're pulling duct in a 110-degree attic. Phone rings.
[3-8s: PROBLEM] Customer's AC is out. Heat wave. Calls four techs. First to answer wins the job.
[8-13s: SOLUTION] Duct.City answers every HVAC call while you work — 24/7.
[13-15s: CTA] Start free at duct.city.`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'YT-D1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-D2',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_duct',
    headline: "The 3 PM AC emergency you missed cost you $2,200. Duct.City prevents that.",
    primary_text: `[0-5s: HOOK] Three missed calls while you were on a 5-ton replacement. One voicemail: "Our AC is out. It's 97 degrees. We have a baby."
[5-15s: PROBLEM] You call back at 4:30. They have someone coming. You just lost a $2,200 emergency dispatch. To the tech who picked up at 3:15.
[15-25s: SOLUTION] Duct.City is your AI HVAC employee. Answers every call. Triages emergencies. Schedules service and installs. Works 24/7 — especially when you can't.
[25-30s: CTA] $79/mo. Start free at duct.city.`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'YT-D2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-D3',
    platform: 'youtube',
    format: 'video60',
    campaign_group: '4h_youtube_duct',
    headline: "HVAC contractors who answer every call grow faster. Here's the system.",
    primary_text: `[0-8s: HOOK] In HVAC, timing is everything. A heat wave breaks on a Friday. Every homeowner with a failing system is calling at once. The techs who answer those calls book their entire next week before Saturday morning.

[8-25s: PAIN] You're diagnosing a condenser in someone's backyard. Phone's in your van. You miss three calls. Three emergency jobs — probably $6,000 in dispatch and repair revenue — gone to the contractors who were sitting by their phones. You weren't sitting. You were working. That's the trap.

[25-45s: TRANSFORMATION] Duct.City is your AI employee for HVAC. It answers every call — triages emergencies ("Is the system completely out or just not cooling properly?"), schedules dispatches, books tune-ups and seasonal maintenance, and handles tonnage questions and system age inquiries. You get a text summary for every call. Nothing falls through.

[45-60s: CTA] Stop choosing between doing the work and answering the phone. $79/mo. Start free at duct.city. Your AI employee for HVAC.`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_transformation',
    utm_content: 'YT-D3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-D4',
    platform: 'youtube',
    format: 'bumper6',
    campaign_group: '4h_youtube_duct',
    headline: "Duct.City — Never miss an HVAC emergency call again.",
    primary_text: `AC out. Duct.City answers. You get the dispatch. duct.city`,
    cta: 'duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'YT-D4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-D5',
    platform: 'youtube',
    format: 'discovery',
    campaign_group: '4h_youtube_duct',
    headline: "HVAC answering service | $79/mo | Duct.City",
    primary_text: `Duct.City is the AI answering employee built for HVAC contractors. Answers calls 24/7, triages emergencies, schedules service calls and installs, and captures leads while you're on the job.

No call center fees. No per-minute billing. $79/mo flat.

Built for owner-operators with 1-10 techs. Setup in 20 minutes. Start free.`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_search-intent',
    utm_content: 'YT-D5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-D6',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_duct_retarget',
    headline: "You checked out Duct.City. Summer's coming. Your emergency calls aren't waiting.",
    primary_text: `[0-4s] You looked at Duct.City. Smart timing.
[4-11s] Every missed emergency call this summer is a job your competitor booked. Don't let that keep happening.
[11-15s] Start free today — duct.city`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'YT-D6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-D7',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_duct_retarget',
    headline: "Still losing HVAC emergency calls? Here's what Duct.City does while you're on the job.",
    primary_text: `[0-5s] Every missed emergency call is revenue gone. You already know this.
[5-20s] Duct.City answers before the second ring. Asks: "Is this a no-cool or complete system failure?" Dispatches or schedules based on urgency. Texts you every lead with job details.
[20-27s] HVAC contractors using Duct.City capture an average of 5+ emergency calls per month they'd have otherwise missed. That's $5,000-$12,000 in recovered revenue.
[27-30s] Start free today — duct.city`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-proof',
    utm_content: 'YT-D7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Facebook (FB-D1 to FB-D7) ──────────────────────────────────────────────
  {
    id: 'FB-D1',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_duct',
    headline: "You're pulling duct in the attic. Phone rings. That AC emergency just hired another HVAC tech.",
    primary_text: `Summer heat wave. Customer's system is down. They call four HVAC contractors. First to answer gets the emergency dispatch.

You're in a 110° attic. Phone's in the van.

Duct.City is your AI HVAC employee. Answers 24/7. Triages emergencies. Books dispatches and service calls — automatically.

$79/mo. Start free at duct.city.`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'FB-D1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-D2',
    platform: 'facebook',
    format: 'video9x16',
    campaign_group: '4h_facebook_duct',
    headline: "AC out. Heat wave. 4 HVAC contractors called. You weren't first. Here's the fix.",
    primary_text: `[Story format — video script]

It's July. Tony's replacing an air handler. Phone's in his truck. Three missed calls.

One was a family with a 3-year-old and no AC. Outside temp: 101°F.

By the time Tony called back, they had a tech coming. $1,800 emergency job. Gone.

Tony uses Duct.City now. Every emergency gets answered. Every dispatch gets booked. Even when he's 15 feet up in a tight attic.

$79/mo. Try free — duct.city`,
    cta: 'Try Free',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'FB-D2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-D3',
    platform: 'facebook',
    format: 'carousel',
    campaign_group: '4h_facebook_duct',
    headline: "3 HVAC emergency calls that go unanswered every week",
    primary_text: `Swipe through the 3 times HVAC contractors lose emergency revenue — and how Duct.City captures every one.

→ Frame 1: Mid-job system diagnosis → Duct.City answers and triages
→ Frame 2: After-hours no-cool emergency → Duct.City schedules dispatch automatically
→ Frame 3: Saturday morning system failures → Duct.City books your entire day while you sleep

$79/mo. Start free at duct.city`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'FB-D3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-D4',
    platform: 'facebook',
    format: 'lead-gen',
    campaign_group: '4h_facebook_duct',
    headline: "How many HVAC emergency calls are you missing? (Calculate your lost revenue)",
    primary_text: `Most HVAC owner-operators miss 5-8 emergency calls per week during peak season. At an average emergency dispatch of $800-$2,000, that's $4,000-$16,000 per week walking out the door.

Duct.City answers every call for $79/mo.

Fill out the form to calculate your missed-revenue number.`,
    cta: 'Calculate My Missed Revenue',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lead-gen',
    utm_content: 'FB-D4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-D5',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_duct_retarget',
    headline: "You visited Duct.City. Here's what you'd get for $79/mo.",
    primary_text: `✅ 24/7 AI call answering (knows HVAC — tonnage, refrigerant type, no-cool vs no-heat, filter size, system age)
✅ Emergency dispatch triage and scheduling
✅ Tune-up and seasonal maintenance booking
✅ Instant text notification with call summary
✅ Lead capture and follow-up

Start free. No credit card. First call answered in 20 minutes.

duct.city`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'FB-D5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-D6',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_duct_retarget',
    headline: "You almost signed up for Duct.City. Summer's here. Finish in 3 minutes.",
    primary_text: `Your AI HVAC employee is ready.

Setup takes 3 minutes. Duct.City starts answering emergency calls today — while you're on the job, in the attic, or under the house.

$79/mo. No contract. Don't lose peak season emergencies to voicemail.

duct.city`,
    cta: 'Finish Signup',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'FB-D6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-D7',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_duct',
    headline: "HVAC contractors are quietly booking more emergency dispatches with this AI answering tool.",
    primary_text: `Duct.City is the AI employee that answers every call HVAC contractors can't pick up — mid-job, in the attic, after hours, or during peak-season overload.

It triages emergencies, books dispatches, and handles seasonal maintenance scheduling — all for $79/mo flat.

No call center markup. No per-minute billing. Just more jobs booked.

Start free at duct.city — Your AI employee for HVAC.`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'FB-D7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Instagram (IG-D1 to IG-D7) ─────────────────────────────────────────────
  {
    id: 'IG-D1',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_duct',
    headline: "You're in the attic. Phone's ringing. That AC emergency just hired someone else.",
    primary_text: `[0-3s: HOOK] You're pulling duct in a 110° attic. Phone rings.
[3-8s: PROBLEM] Customer's no-cool emergency. Calls 4 HVAC techs. First to answer wins.
[8-13s: SOLUTION] Duct.City answers every call while you're on the job — 24/7.
[13-15s: CTA] $79/mo — duct.city`,
    cta: 'Start free at duct.city',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'IG-D1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-D2',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_duct',
    headline: "3 things Duct.City does while you're on a job",
    primary_text: `[Frame 1] 🌡️ Answers every call — 24/7, knows HVAC (tonnage, refrigerant, no-cool, filter size)
[Frame 2] 🚨 Triages emergencies and schedules dispatches automatically
[Frame 3] 💰 $79/mo — one emergency dispatch pays for months

Your AI employee for HVAC. Start free at duct.city`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_features',
    utm_content: 'IG-D2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-D3',
    platform: 'instagram',
    format: 'static4x5',
    campaign_group: '4h_instagram_duct',
    headline: "Your AI HVAC employee — $79/mo",
    primary_text: `Answers calls. Triages emergencies. Books dispatches. Never sleeps.

Duct.City is built for HVAC contractors who are too busy on the job to answer every call.

Start free — duct.city`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'IG-D3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-D4',
    platform: 'instagram',
    format: 'carousel',
    campaign_group: '4h_instagram_duct',
    headline: "Swipe to see what happens every time an HVAC emergency hits voicemail →",
    primary_text: `[Card 1] 🌡️ AC out. Family calls 4 HVAC contractors.
[Card 2] First to answer books a $1,800 emergency dispatch.
[Card 3] You called back 45 minutes later. Job's taken.
[Card 4] Duct.City answers every call while you work. $79/mo.
[Card 5] Start free — duct.city. Your AI employee for HVAC.`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'IG-D4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-D5',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_duct_retarget',
    headline: "You saw Duct.City. Peak HVAC season is here.",
    primary_text: `[0-4s] You checked out Duct.City. Smart.
[4-10s] Every missed emergency call this summer is money in a competitor's pocket.
[10-15s] Start free today — duct.city`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'IG-D5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-D6',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_duct_retarget',
    headline: "You started signing up. Finish before the next emergency.",
    primary_text: `[Frame 1] You were this close to never missing an HVAC emergency call again.
[Frame 2] Finish setup → Duct.City answers your first call TODAY.
[Frame 3] $79/mo. Tap to finish → duct.city`,
    cta: 'Finish Signup',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'IG-D6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-D7',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_duct',
    headline: "HVAC contractors with Duct.City capture 5+ emergency dispatches a month they'd have missed.",
    primary_text: `HVAC owners using Duct.City report:
✅ 5+ emergency dispatches captured/month
✅ Zero missed no-cool calls during heat waves
✅ More time on the job, less chasing missed leads

$79/mo. Your AI employee for HVAC.

Start free — duct.city`,
    cta: 'Start Free',
    landing_path: '/duct',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'IG-D7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PEST.CITY — Pest Control ($26B TAM, 33K businesses)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── LinkedIn (LI-PE1 to LI-PE6) ────────────────────────────────────────────
  {
    id: 'LI-PE1',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pest',
    headline: "You're in a crawlspace treating for termites. Phone rings. That bed bug call just hired another exterminator.",
    primary_text: `Pest control calls are urgent. Bed bugs. Termites. Roaches in a restaurant. Customers call 3 companies — first to answer wins the job.

You're in a crawlspace. You're on a route. You can't answer.

Pest.City answers every call 24/7 — identifies pest type, triages urgency, and schedules treatments while you're doing the work that actually pays.

$79/mo. Your AI employee for pest control.`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'LI-PE1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-PE2',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pest',
    headline: "$79/mo = one termite inspection. Pest.City pays for itself before your next route.",
    primary_text: `What's your average termite treatment worth? $800? $2,500? A full fumigation?

Pest.City answers every call you miss — identifying pest type, scheduling inspections, and triaging urgent infestations while you're running your route or doing a subterranean baiting job.

One inspection. Multiple months covered.

$79/mo flat. Your AI employee for pest control.`,
    cta: 'Try free — pest.city',
    landing_path: '/pest',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_roi',
    utm_content: 'LI-PE2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-PE3',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pest',
    headline: "You're in a crawlspace treating for subterranean termites. Phone rings. That's a $3,000 job you just missed.",
    primary_text: `Pest calls are different from other trades. When someone has bed bugs or a termite swarm, they call until they reach a live voice. They don't leave voicemails. They move to the next number.

You're mid-route. You're under a house in a respirator. You can't stop.

Pest.City is your AI answering employee. It identifies the pest, asks the right questions, schedules inspections and treatments, and keeps your route calendar full — without you stopping the job.

$79/mo. Cancel anytime. Start free at pest.city.`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_pain-point',
    utm_content: 'LI-PE3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-PE4',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pest_retarget',
    headline: "You checked out Pest.City. Still losing pest control calls to competitors who pick up?",
    primary_text: `You were curious enough to look. Here's the fact: in pest control, the company that answers first almost always gets the job.

Termite swarms. Bed bug discoveries. Rodent infestations. These customers don't wait for callbacks.

Pest.City captures every one of those calls automatically.

Start free. No credit card. pest.city`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'LI-PE4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-PE5',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pest_retarget',
    headline: "You know the problem. Pest.City is how exterminators fix it.",
    primary_text: `You're running routes solo. Calls come in while you're in a crawlspace or attic. You can't answer in a respirator.

Pest.City answers every call while you work — pest ID, urgency triage, inspection scheduling. All automatic.

$79/mo. Ready when you are.`,
    cta: 'Try free — pest.city',
    landing_path: '/pest',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-engaged',
    utm_content: 'LI-PE5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'LI-PE6',
    platform: 'linkedin',
    format: 'static1x1',
    campaign_group: '4h_linkedin_pest_retarget',
    headline: "You started signing up for Pest.City. Finish before your next route.",
    primary_text: `Your AI pest control employee is almost ready.

Finish setup in 3 minutes. Pest.City starts answering calls today — capturing bed bug calls, termite inquiries, and rodent jobs while you're on route or in a crawlspace.

pest.city — $79/mo. No contract.`,
    cta: 'Finish signup — pest.city',
    landing_path: '/pest',
    utm_source: 'linkedin',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'LI-PE6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── YouTube (YT-PE1 to YT-PE7) ─────────────────────────────────────────────
  {
    id: 'YT-PE1',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_pest',
    headline: "You're in a crawlspace. Phone rings. That termite job just called another exterminator.",
    primary_text: `[0-3s: HOOK] You're treating for subterranean termites in a crawlspace. Phone rings.
[3-8s: PROBLEM] Customer found a bed bug. Called 3 exterminators. First to answer wins.
[8-13s: SOLUTION] Pest.City answers every call while you work — 24/7.
[13-15s: CTA] Start free at pest.city.`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'YT-PE1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-PE2',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_pest',
    headline: "The termite call you missed on Tuesday cost you $2,800. Pest.City prevents that.",
    primary_text: `[0-5s: HOOK] Mid-route. Three missed calls. One voicemail: "We found what looks like a termite swarm in our garage..."
[5-15s: PROBLEM] By the time you call back, they've scheduled an inspection with another company. Full treatment job. Gone to the exterminator who answered at 11:23 AM.
[15-25s: SOLUTION] Pest.City is your AI employee for pest control. Answers every call. Identifies pest type. Schedules inspections. Books treatments while you're running your route.
[25-30s: CTA] $79/mo. Start free at pest.city.`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'YT-PE2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-PE3',
    platform: 'youtube',
    format: 'video60',
    campaign_group: '4h_youtube_pest',
    headline: "Pest control is a first-to-answer business. Here's how to always be first.",
    primary_text: `[0-8s: HOOK] Ask any exterminator what their biggest revenue problem is. It's not competition. It's not pricing. It's the calls they can't answer because they're under a house in a respirator.

[8-25s: PAIN] Bed bugs. Termite swarms. Rodent infestations. These are panic calls. Customers don't leave voicemails — they call three companies and book the first one who answers. While you're treating a subterranean colony or doing a bait station inspection, that call is going to your competitor.

[25-45s: TRANSFORMATION] Pest.City is your AI employee for pest control. It answers 24/7. It knows the work — termite species, subterranean vs drywood, bed bug treatment protocols, rodent exclusion, fumigation vs spot treatment. It asks the right questions, identifies urgency, schedules inspections, and sends you a lead summary by text.

[45-60s: CTA] You're already the best tech on the route. Now be the one who always picks up. $79/mo. Start free today at pest.city. Your AI employee for pest control.`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_transformation',
    utm_content: 'YT-PE3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-PE4',
    platform: 'youtube',
    format: 'bumper6',
    campaign_group: '4h_youtube_pest',
    headline: "Pest.City — Never miss a pest control call again.",
    primary_text: `Bug call comes in. Pest.City answers. You get the job. pest.city`,
    cta: 'pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'YT-PE4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-PE5',
    platform: 'youtube',
    format: 'discovery',
    campaign_group: '4h_youtube_pest',
    headline: "Pest control answering service | $79/mo | Pest.City",
    primary_text: `Pest.City is the AI answering employee built for pest control operators. Answers calls 24/7, identifies pest type, triages urgency, and schedules inspections and treatments while you're on route.

No call center fees. No per-minute billing. $79/mo flat.

Built for owner-operators running solo or small crews. Setup in 20 minutes. Start free.`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_search-intent',
    utm_content: 'YT-PE5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-PE6',
    platform: 'youtube',
    format: 'video15',
    campaign_group: '4h_youtube_pest_retarget',
    headline: "You checked out Pest.City. Every day you wait is a termite job you're giving away.",
    primary_text: `[0-4s] You looked at Pest.City. Right instinct.
[4-11s] In pest control, the first company to answer wins. Every day you wait, that's your competitors winning.
[11-15s] Start free today — pest.city`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'YT-PE6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'YT-PE7',
    platform: 'youtube',
    format: 'video30',
    campaign_group: '4h_youtube_pest_retarget',
    headline: "Still losing pest control jobs to the exterminator who picks up first?",
    primary_text: `[0-5s] In pest control, first-to-answer wins almost every time. You already know this.
[5-20s] Pest.City answers before the second ring. Identifies the pest. Asks about severity and timeline. Schedules the inspection. Texts you the lead details.
[20-27s] Pest control operators using Pest.City capture an average of 6+ booked inspections per month they'd have otherwise missed.
[27-30s] Start free today — pest.city`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'youtube',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-proof',
    utm_content: 'YT-PE7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Facebook (FB-PE1 to FB-PE7) ────────────────────────────────────────────
  {
    id: 'FB-PE1',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pest',
    headline: "You're in a crawlspace. Phone rings. That termite job just called your competitor.",
    primary_text: `Pest control calls are urgent. Customers with termites, bed bugs, or an active rodent infestation call everyone until someone picks up.

You're on route. You're in a crawlspace. You're wearing a respirator.

Pest.City is your AI employee for pest control. Answers 24/7. Identifies pest type. Schedules inspections and treatments automatically.

$79/mo. Start free at pest.city.`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'FB-PE1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-PE2',
    platform: 'facebook',
    format: 'video9x16',
    campaign_group: '4h_facebook_pest',
    headline: "Termite swarm. Three exterminators called. One picked up. You weren't that one.",
    primary_text: `[Story format — video script]

Dave runs a solo pest control operation. Tuesday morning, mid-route. Phone rings. Can't answer — he's in an attic doing a rodent exclusion.

Customer found a termite swarm in their wood pile and fence. Called three companies. The one that answered booked a $2,800 subterranean treatment.

Dave started using Pest.City. Now every call gets answered — termite swarm, bed bug, roach, rodent, whatever it is. His route calendar is always full.

$79/mo. Try free — pest.city`,
    cta: 'Try Free',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_story',
    utm_content: 'FB-PE2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-PE3',
    platform: 'facebook',
    format: 'carousel',
    campaign_group: '4h_facebook_pest',
    headline: "3 pest control calls that go to your competitor every week",
    primary_text: `Swipe through the 3 urgent pest calls exterminators miss — and how Pest.City captures each one.

→ Frame 1: Mid-route termite call → Pest.City answers, identifies species, schedules inspection
→ Frame 2: Bed bug discovery call → Pest.City triages urgency, books treatment
→ Frame 3: Restaurant roach infestation → Pest.City schedules commercial inspection immediately

$79/mo. Start free at pest.city`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'FB-PE3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-PE4',
    platform: 'facebook',
    format: 'lead-gen',
    campaign_group: '4h_facebook_pest',
    headline: "How much pest control revenue are you losing to the exterminator who picks up first?",
    primary_text: `Most pest control operators miss 6-10 calls per week. At an average job value of $400-$2,800 depending on treatment type, that's thousands walking out the door every week.

Pest.City answers every call for $79/mo.

Fill out the form to calculate your missed revenue.`,
    cta: 'Calculate My Missed Revenue',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lead-gen',
    utm_content: 'FB-PE4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-PE5',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pest_retarget',
    headline: "You visited Pest.City. Here's what you'd get for $79/mo.",
    primary_text: `✅ 24/7 AI call answering (knows pest control — termite species, bed bug protocol, rodent exclusion, fumigation, IPM)
✅ Pest identification and urgency triage
✅ Inspection and treatment scheduling
✅ Instant text notification with call summary
✅ Route calendar integration

Start free. No credit card. First call answered in 20 minutes.

pest.city`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'FB-PE5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-PE6',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pest_retarget',
    headline: "You almost signed up for Pest.City. Finish in 3 minutes.",
    primary_text: `Your AI pest control employee is ready.

Setup takes 3 minutes. Pest.City starts answering calls today — bed bugs, termites, rodents, commercial accounts — while you're on route or in a crawlspace.

$79/mo. No contract. Stop losing first-to-answer jobs.

pest.city`,
    cta: 'Finish Signup',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'FB-PE6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'FB-PE7',
    platform: 'facebook',
    format: 'static4x5',
    campaign_group: '4h_facebook_pest',
    headline: "Pest control operators are quietly winning more first-to-answer jobs with this AI tool.",
    primary_text: `Pest.City is the AI employee that answers every call pest control operators can't pick up — mid-route, in a crawlspace, wearing a respirator.

It identifies pest type, triages urgency, and books inspections and treatments automatically — for $79/mo flat.

No call center. No per-minute billing. Just more booked jobs.

Start free at pest.city — Your AI employee for pest control.`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'facebook',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'FB-PE7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },

  // ── Instagram (IG-PE1 to IG-PE7) ───────────────────────────────────────────
  {
    id: 'IG-PE1',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_pest',
    headline: "You're in a crawlspace. Phone's ringing. That termite job just hired another exterminator.",
    primary_text: `[0-3s: HOOK] You're in a crawlspace treating subterranean termites. Phone rings.
[3-8s: PROBLEM] Customer found bed bugs. Calls 3 exterminators. First to answer wins.
[8-13s: SOLUTION] Pest.City answers every call while you're on route — 24/7.
[13-15s: CTA] $79/mo — pest.city`,
    cta: 'Start free at pest.city',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_missed-calls',
    utm_content: 'IG-PE1',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-PE2',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_pest',
    headline: "3 things Pest.City does while you're on a route",
    primary_text: `[Frame 1] 🪲 Answers every call — 24/7, knows pest control (termites, bed bugs, rodents, IPM, fumigation)
[Frame 2] 🗓️ Identifies pest type and schedules inspections automatically
[Frame 3] 💰 $79/mo — one termite treatment pays for the whole year

Your AI employee for pest control. Start free at pest.city`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_features',
    utm_content: 'IG-PE2',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-PE3',
    platform: 'instagram',
    format: 'static4x5',
    campaign_group: '4h_instagram_pest',
    headline: "Your AI pest control employee — $79/mo",
    primary_text: `Answers calls. IDs the pest. Books the inspection. Never misses a job.

Pest.City is built for pest control operators who are too busy on route to answer every call.

Start free — pest.city`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_brand',
    utm_content: 'IG-PE3',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-PE4',
    platform: 'instagram',
    format: 'carousel',
    campaign_group: '4h_instagram_pest',
    headline: "Swipe to see what pest control operators lose every time a call hits voicemail →",
    primary_text: `[Card 1] 🪲 Customer finds a termite swarm. Calls 3 exterminators.
[Card 2] First to answer schedules a $2,800 subterranean treatment.
[Card 3] You called back an hour later. Job's taken.
[Card 4] Pest.City answers every call while you work. $79/mo.
[Card 5] Start free — pest.city. Your AI employee for pest control.`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_carousel-pain',
    utm_content: 'IG-PE4',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-PE5',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_pest_retarget',
    headline: "You saw Pest.City. First-to-answer still wins every time.",
    primary_text: `[0-4s] You checked out Pest.City. Smart.
[4-10s] Every call you miss is a job your competitor books. In pest control, first to answer wins.
[10-15s] Start free today — pest.city`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-visit',
    utm_content: 'IG-PE5',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-PE6',
    platform: 'instagram',
    format: 'story9x16',
    campaign_group: '4h_instagram_pest_retarget',
    headline: "You started signing up. Finish before your next missed termite call.",
    primary_text: `[Frame 1] You were this close to never missing a pest control call again.
[Frame 2] Finish setup → Pest.City answers your first call TODAY.
[Frame 3] $79/mo. Tap to finish → pest.city`,
    cta: 'Finish Signup',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_retarget-signup',
    utm_content: 'IG-PE6',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
  {
    id: 'IG-PE7',
    platform: 'instagram',
    format: 'reel9x16',
    campaign_group: '4h_instagram_pest',
    headline: "Pest control operators with Pest.City book 6+ extra inspections a month on average.",
    primary_text: `Pest control operators using Pest.City report:
✅ 6+ extra booked inspections/month
✅ Zero lost first-to-answer jobs
✅ More time on route, less chasing missed calls

$79/mo. Your AI employee for pest control.

Start free — pest.city`,
    cta: 'Start Free',
    landing_path: '/pest',
    utm_source: 'instagram',
    utm_medium: 'paid-social',
    utm_campaign: '4h_2026-03_lookalike',
    utm_content: 'IG-PE7',
    utm_term: 'owners_1-10',
    status: 'pending',
    workflow_stage: 'concept',
  },
];

// ─── UPLOAD LOGIC ─────────────────────────────────────────────────────────────

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

async function upsertAd(ad) {
  // Try POST first
  const postRes = await fetch(`${SUPABASE_URL}/rest/v1/ads`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(ad),
  });

  if (postRes.ok || postRes.status === 201) {
    return { id: ad.id, action: 'inserted', status: postRes.status };
  }

  // If conflict (409), PATCH instead
  if (postRes.status === 409 || postRes.status === 422) {
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=eq.${encodeURIComponent(ad.id)}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify(ad),
    });
    if (patchRes.ok || patchRes.status === 204) {
      return { id: ad.id, action: 'updated', status: patchRes.status };
    }
    const errBody = await patchRes.text();
    return { id: ad.id, action: 'error', status: patchRes.status, error: errBody };
  }

  const errBody = await postRes.text();
  return { id: ad.id, action: 'error', status: postRes.status, error: errBody };
}

async function main() {
  console.log(`\n🚀 Uploading ${ads.length} Tier 1 ads to Supabase...\n`);

  const results = { inserted: [], updated: [], errors: [] };
  const failed = [];

  for (const ad of ads) {
    const result = await upsertAd(ad);
    process.stdout.write(`  ${result.action === 'error' ? '❌' : '✅'} ${ad.id} — ${result.action} (${result.status})\n`);

    if (result.action === 'inserted') results.inserted.push(ad.id);
    else if (result.action === 'updated') results.updated.push(ad.id);
    else {
      results.errors.push({ id: ad.id, error: result.error });
      failed.push(ad);
    }
  }

  console.log('\n─── SUMMARY ─────────────────────────────────────────────────');
  console.log(`✅ Inserted: ${results.inserted.length}`);
  console.log(`🔄 Updated:  ${results.updated.length}`);
  console.log(`❌ Errors:   ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(e => console.log(`  ${e.id}: ${e.error}`));
    // Write failed ads to disk for retry
    const fs = await import('fs');
    fs.writeFileSync('/home/node/.openclaw/workspace/projects/project-4h-dashboard/scripts/failed-tier1-ads.json', JSON.stringify(failed, null, 2));
    console.log('\n⚠️  Failed ads written to scripts/failed-tier1-ads.json for retry.');
  }

  console.log('\n─── VERIFICATION ────────────────────────────────────────────');
  // Verify counts per trade
  const trades = [
    { label: 'pipe.city (P)', pattern: 'LI-P,YT-P,FB-P,IG-P' },
    { label: 'coat.city (C)', pattern: 'LI-C,YT-C,FB-C,IG-C' },
    { label: 'duct.city (D)', pattern: 'LI-D,YT-D,FB-D,IG-D' },
    { label: 'pest.city (PE)', pattern: 'LI-PE,YT-PE,FB-PE,IG-PE' },
  ];

  for (const { label, pattern } of trades) {
    const prefixes = pattern.split(',');
    const count = ads.filter(a => prefixes.some(p => a.id.startsWith(p))).length;
    console.log(`  ${label}: ${count} ads defined`);
  }

  console.log('\n─── LIVE VERIFICATION ───────────────────────────────────────');
  // Query Supabase for each trade group
  for (const { prefix, label } of [
    { prefix: 'LI-P', label: 'LinkedIn Plumbing (LI-P*)' },
    { prefix: 'LI-C', label: 'LinkedIn Painting (LI-C*)' },
    { prefix: 'LI-D', label: 'LinkedIn HVAC (LI-D*)' },
    { prefix: 'LI-PE', label: 'LinkedIn Pest (LI-PE*)' },
  ]) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ads?id=like.${prefix}*&select=id`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    console.log(`  ${label}: ${Array.isArray(data) ? data.length : '?'} records in DB`);
  }

  console.log('\n✅ Done.\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
