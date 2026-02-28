# Project 4H — Launch Checklist

> Complete every item before going live. No partial launches.
> Campaign: Saw.City LITE Paid Acquisition | Budget: $20K | Target: 2,000 users

---

## Phase 1 — Account Setup

- [ ] **1.** LinkedIn Campaign Manager account created + billing added
- [ ] **2.** Meta Business Manager account created + billing added
- [ ] **3.** Google Ads account created + billing added
- [ ] **4.** LinkedIn Insight Tag installed on all `.city` landing pages
- [ ] **5.** Meta Pixel installed on all `.city` landing pages
- [ ] **6.** Google Tag Manager / Google Ads conversion tag installed on all `.city` landing pages

---

## Phase 2 — Creative Upload

- [ ] **7.** `linkedin-upload.csv` uploaded to LinkedIn Campaign Manager
  - Verify: 289 rows imported, no errors
- [ ] **8.** `meta-upload.csv` uploaded to Meta Ads Manager
  - Verify: 504 rows imported (256 Facebook + 248 Instagram), no errors
- [ ] **9.** `youtube-upload.csv` uploaded to Google Ads
  - Verify: 204 rows imported, no errors
- [ ] **10.** All image creatives confirmed accessible at their `image_url` paths
- [ ] **11.** YouTube video assets produced for Tier 1 trade scripts (at minimum)

---

## Phase 3 — Tracking & Conversion Setup

- [ ] **12.** Conversion events configured on all platforms:
  - Sign-up (primary)
  - Trial start (secondary)
  - Page view (top-funnel signal)
- [ ] **13.** UTM parameters verified end-to-end:
  - Click ad → land on correct `.city` page → UTMs appear in analytics
- [ ] **14.** Google Analytics 4 (or equivalent) connected to all `.city` domains
- [ ] **15.** Attribution window set to 7-day click / 1-day view (recommended for SaaS)

---

## Phase 4 — Campaign Configuration

- [ ] **16.** A/B test structure confirmed (2–3 creative variants per trade per platform)
- [ ] **17.** Daily budget caps set:
  - LinkedIn: $166/day
  - Meta (Facebook + Instagram combined): $166/day
  - YouTube: $166/day
- [ ] **18.** Kill/scale rules documented and shared with whoever manages campaigns:
  - Kill: CPL > $40 after $500 spend
  - Scale: CPL < $20 AND 5+ sign-ups → double budget
  - Pause creative: CTR < 0.3% after 1,000 impressions
- [ ] **19.** Audience segments created:
  - LinkedIn: company size 1–10, job titles (Owner/Founder/Operator), industries
  - Meta: interest + behavioral targeting per `targeting-specs.md`
  - YouTube: keyword targeting + in-market audiences per `targeting-specs.md`
- [ ] **20.** Retargeting audiences configured (will be seeded during weeks 1–2)

---

## Phase 5 — Final QA

- [ ] **21.** All destination URLs tested (click each landing page, confirm load correctly)
- [ ] **22.** Sign-up flow tested end-to-end (ad → landing page → sign-up → confirmation)
- [ ] **23.** Mobile rendering verified for all ad formats
- [ ] **24.** Ad copy reviewed for compliance (no misleading claims, no prohibited content)
- [ ] **25.** Billing confirmed on all 3 platforms (credit card charged successfully)

---

## Phase 6 — Launch & Monitor

- [ ] **26.** Notification emails configured for campaign alerts (spend thresholds, disapprovals)
- [ ] **27.** First-week review scheduled — **7 days post-launch**
  - Attendees: [add names]
  - Agenda: CPL by platform, CTR by creative, budget pacing
- [ ] **28.** 30-day rebalance review scheduled
- [ ] **29.** Campaigns set to **ACTIVE** on all 3 platforms simultaneously
- [ ] **30.** Launch confirmed ✅ — Record launch date: _______________

---

## Post-Launch Cadence

| Day | Action |
|-----|--------|
| Day 1 | Check for disapprovals, confirm impressions flowing |
| Day 3 | First CPL data available; flag any outliers |
| Day 7 | Week 1 review — kill underperformers, identify early winners |
| Day 14 | Activate retargeting campaigns (pixel pools seeded) |
| Day 21 | Budget rebalance #1 — shift up to $1,000 to best platform |
| Day 30 | Full performance report — kill/scale/pivot decision |

---

*Last updated: 2026-02-28*
