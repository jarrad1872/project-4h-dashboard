# Competitive Ad Research Agent

Last updated: 2026-04-01

## Goal

Build a repeatable, read-only competitive-intelligence workflow that captures relevant home-service ads, analyzes messaging patterns, and turns them into concrete creative recommendations for `pipe.city` and the wider 4H campaign.

## Verified Constraints

This foundation was updated with official-source verification on 2026-04-27.

- Meta documents the Ad Library API for social, election, or political ads delivered globally during the last seven years, plus ads of any type delivered to the UK or European Union during the past year.
- Meta directs researchers who want all currently running ads across Meta technologies to use the public Ad Library web experience.
- Meta says ads that did not reach any EU location only return through the API if they are social, election, or political ads. Do not assume US commercial competitor coverage from the official API.
- API setup requires identity and location confirmation, a Meta for Developers account, an app, and an access token.
- Spend and impression ranges are available for political and issue ads; UK/EU ads expose estimated reach/transparency fields. Do not infer exact commercial spend.
- Meta Content Library API is researcher-gated through secure computing environments and is not a ready commercial growth workflow for 4H.
- Anthropic API usage is metered. Claude can still be the analysis layer, but H-16 should not be described as guaranteed `$0/mo` unless analysis runs on an already-budgeted internal account and we accept that incremental API usage is non-zero.

Official sources used:

- Meta Ad Library API: https://www.facebook.com/ads/library/api/
- SOMAR Meta Content Library: https://www.icpsr.umich.edu/sites/somar/meta-content-library
- Anthropic pricing: https://platform.claude.com/docs/en/about-claude/pricing

## Architecture Decision

Use a provider-agnostic pipeline instead of binding the system to a single assumption about Meta API access.

### Provider Layer

Implement the collector against a normalized internal schema with two provider modes:

1. `meta_api`
- Preferred path once we have a verified token and confirmed result coverage for our search set.

2. `meta_public_library`
- Manual validation path for currently active commercial ads, especially US competitors that the official API may not return.

### Pipeline

1. Search term generation
- Direct competitors: `smith.ai`, `ruby receptionists`, `nexa`, `answerconnect`
- Problem framing: `ai receptionist`, `virtual receptionist`, `missed calls contractor`
- Trade SaaS adjacency: `plumber software`, `hvac software`, `jobber`, `housecall pro`, `servicetitan`

2. Snapshot normalization
- Convert raw provider rows into a consistent structure: advertiser, creative type, CTA, headline, body, landing URL, source link, platform list, active state, and capture timestamp.

3. Analysis prompt build
- Feed only normalized snapshots plus explicit coverage notes into Claude.
- Require output to distinguish observed patterns from inference.

4. Weekly report generation
- Produce markdown for Paperclip comments and Telegram delivery.
- Always include coverage caveats so the board understands what the crawl did and did not see.

## Shipping Sequence

### Phase 0: Access validation

- Use a real Meta token.
- Run test queries for `ai receptionist`, `plumber software`, and `smith.ai`.
- Confirm whether the returned inventory is useful enough for weekly monitoring.

### Phase 1: Repo foundation

- Add keyword seeds.
- Add normalization helpers.
- Add Claude prompt builder.
- Add weekly markdown report builder.

### Phase 2: Operationalization

- Wire the validated provider into scheduled execution.
- Persist snapshots to `data/competitive-intel/` or Supabase once the access path is proven stable.
- Add Paperclip comment delivery and optional Telegram notification.

### Phase 3: Dedicated agent

- CEO approval is required before hiring a new always-on Paperclip agent.
- Do not request the hire until Phase 0 confirms the Meta access path is viable.

## Repo Outputs

The repo foundation for this work lives in:

- `lib/competitive-ad-research-agent.ts`
- `lib/__tests__/competitive-ad-research-agent.test.ts`
- `lib/competitor-research-template.ts`
- `lib/__tests__/competitor-research-template.test.ts`
- `docs/competitor-research-template.md`

These files are intentionally provider-agnostic so they remain usable whether the evidence source is manual public-library capture, an already-approved token validation run, or a later approved provider workflow.
