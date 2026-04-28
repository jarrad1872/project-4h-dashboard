# Google Maps Pain-Signal Lead Finder Roadmap

Last updated: 2026-04-28

This roadmap supports Q-58 and Q-71 in the customer proof sprint. It turns public review pain into a research queue for 4H, without sending outreach, bypassing controls, scraping at scale, or treating public complaints as verified customer-loss claims.

## Goal

Find local trade businesses with visible phone/callback friction, then decide whether they deserve a manual demo attempt.

Best-fit signals:

- "did not answer"
- "never called back"
- "left a voicemail"
- "after hours"
- "hard to schedule"

## Manual-First Workflow

1. Search one trade and one city at a time, starting with Phoenix metro beachhead trades.
2. Capture only public business facts and the minimum review context needed to score fit.
3. Store source URL, query, review date, pain phrase, trade/domain fit, and confidence.
4. Create internal 4H rows only after human review.
5. Draft any message for Jarrad review; do not send from the finder.

## Official/API Path

Use Google Places API or an approved data provider before any repeatable collection job.

Required capture fields:

- business name
- trade-domain fit
- city/state
- source URL
- review quote or pain phrase
- review date
- rating context
- owner/contact page URL when public
- human confidence score
- next permitted action

## Q-71 Import Workflow

The import plan has three allowed paths. All three produce review-only rows until Jarrad approves any real outreach.

| Path | Use When | Required Evidence | Compliance Gate |
|------|----------|-------------------|-----------------|
| Manual paste | Founder or rep reviews a few businesses by hand | source URL, query, review quote, confidence score, next action | human review before row creation |
| Official API | We need repeatable collection from Google Places or another licensed source | provider name, request scope, source URL/place ID, review excerpt allowed by provider terms | confirm API terms and rate limits before running |
| Approved provider | We buy or receive a compliant prospect file | provider, license/terms note, source URL or evidence field, contact provenance | no upload until provenance is documented |

Minimum import fields:

- `business_name`
- `trade_slug`, defaulting this sprint to `pipe`
- `city_state`
- `source_url`
- `source_query`
- `review_quote`
- `review_date`
- `pain_signal`
- `confidence_score`
- `evidence_quality`
- `owner_operator_fit`
- `contact_public_source`
- `next_action`
- `compliance_gate`
- `outreach_status`, defaulting to `draft_only`

Rows must not include scraped private data, inferred mobile numbers, hidden emails, personal social profiles, or any contact detail whose source cannot be explained.

## Aggressive But Human Path

This is the edge case we can evaluate later:

1. A human researcher or agent-assisted browser session reviews public search results.
2. Qualified rows are pasted into 4H in small batches.
3. Every row must include source evidence and a reason the business fits the missed-call thesis.
4. Every outbound draft is personalized to the visible pain signal and matching demo line.
5. Batches stay small, roughly 10-25 rows, until reply/demo/trial signal proves the motion.

## Blocked Tactics

- No CAPTCHA solving.
- No login bypass.
- No proxy rotation.
- No rate-limit evasion.
- No hidden scraping infrastructure.
- No automated Google Maps scraping job, headless browser collector, or background extractor without separate approval and terms review.
- No copying private contact data, browser history, or personal data into 4H.
- No automated outreach from researched rows without action-time approval.
- No claim that a review proves revenue loss unless the owner confirms it.

## Scoring Rubric

- `+3` recent review says did not answer, voicemail, no callback, or hard to reach.
- `+2` emergency/high-intent trade where speed matters: plumbing, locksmith, concrete cutting.
- `+2` owner-operated visual signals: small crew, direct owner phone, no obvious dispatcher.
- `+1` Arizona proximity for the current rep pilot.
- `-3` enterprise/franchise/large dispatcher operation.
- `-2` weak or stale review evidence older than 18 months.

## Stop Conditions

Ask Jarrad before:

- saving any real personal contact details
- sending email, SMS, DM, or form submissions
- running any repeatable extractor
- connecting paid enrichment tools
- adding a third-party webhook or automation

## How This Fits 4H

- `/sales` shows the Q-58 roadmap, pain phrases, blocked tactics, and first 10 customer attempts.
- `/scorecard` compares review-signal outbound against founder videos, field sales, creator demos, and paid social.
- `/templates` turns live demo lines into founder/creator proof packets.

The finder exists to feed better conversations, not to create a spam machine.
