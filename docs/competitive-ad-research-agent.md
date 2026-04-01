# Competitive Ad Research Agent

Last updated: 2026-04-01

## Goal

Build a repeatable, read-only competitive-intelligence workflow that captures relevant home-service ads, analyzes messaging patterns, and turns them into concrete creative recommendations for `pipe.city` and the wider 4H campaign.

## Verified Constraints

This foundation is based on official-source verification completed on 2026-04-01.

- Meta states that Ad Library is a public, searchable collection of all currently active ads across Facebook apps and services, with political ads archived for seven years.
- Meta's own `Radlibrary` documentation also states that programmatic access requires a Facebook developer account, an access token from Graph API Explorer, and identity/location verification.
- Because Meta's surfaced documentation mixes public-library messaging with token-gated API setup guidance, do not assume that weekly automated commercial-ad collection is production-safe until we validate coverage using our own token and real search terms.
- Anthropic API usage is metered. Claude can still be the analysis layer, but H-16 should not be described as guaranteed `$0/mo` unless analysis runs on an already-budgeted internal account and we accept that incremental API usage is non-zero.

Official sources used:

- Meta public Ad Library overview: https://about.fb.com/wp-content/uploads/sites/10/2020/09/Facebook_Response_European_Democracy_Action_Plan_2020.09.15.pdf
- Meta `Radlibrary` setup and token requirements: https://facebookresearch.github.io/Radlibrary/articles/Radlibrary.html
- Anthropic pricing: https://platform.claude.com/docs/en/about-claude/pricing

## Architecture Decision

Use a provider-agnostic pipeline instead of binding the system to a single assumption about Meta API access.

### Provider Layer

Implement the collector against a normalized internal schema with two provider modes:

1. `meta_api`
- Preferred path once we have a verified token and confirmed result coverage for our search set.

2. `meta_public_library`
- Fallback/manual validation path if the token route proves too narrow or too brittle for the target keywords.

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

These files are intentionally provider-agnostic so they remain usable whether the collection layer ends up as authenticated API access, public-library scraping, or a hybrid workflow.
