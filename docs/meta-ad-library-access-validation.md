# Meta Ad Library Access Validation

Last updated: 2026-04-27

## Verdict

Official Meta access is useful for manual competitor review and limited API validation, but it is not production-safe for automated US commercial competitor monitoring without a token smoke test and coverage proof.

## Official Findings

- Meta documents the Ad Library API for two broad scopes: social, election, or political ads delivered globally during the last seven years; and ads of any type delivered to the UK or European Union during the past year.
- Meta directs researchers who want all currently running ads across Meta technologies to use the public Ad Library web experience.
- Meta says ads that did not reach any EU location only return through the API when they are social, election, or political ads. That is the key gap for 4H's US home-service SaaS competitor monitoring.
- API authorization requires identity and location confirmation, a Meta for Developers account, an app, and an access token.
- Spend and impression ranges are available for political and issue ads. UK/EU ads expose estimated reach and transparency fields. Exact commercial spend should not be inferred from official API output.
- Ad snapshot URLs and individual creative downloads can support analysis, but Meta says batch creative downloads are not currently available and storage/use must comply with its terms.
- Meta Content Library provides UI/API access for researchers through secure computing environments. It is not a ready commercial growth workflow for 4H.

## Assumptions To Validate

- Assume the official API will miss or under-return US commercial ads until a real token test proves useful non-political coverage for `smith.ai`, `ai receptionist`, `plumber software`, and `jobber`.
- Treat broader commercial-ad APIs as separate vendor decisions. They may solve coverage, but require legal, budget, retention, and source-quality review before automation.
- Use the public Meta Ad Library web UI for human-reviewed snapshots, citations, and creative observations until programmatic coverage is proven.

## Recommended 4H Path

1. Use Q-22 to create a manual-first competitor research template with source URL, captured date, country, platform, offer, hook, visual pattern, and evidence-quality fields.
2. Keep `scripts/competitive-intel-meta.js` as the official-token smoke test for `/ads_archive`, but run it only with an authorized token and record zero-result terms as coverage evidence.
3. Do not schedule a Meta collector, hire a research agent, or rely on API counts until token tests separate UK/EU coverage, political/issue coverage, and US commercial gaps.
4. If recurring competitive monitoring becomes important, compare a compliant third-party provider against the same template before storing snapshots.

## Blocked Automation

- No scraping or reverse-engineered endpoints from this repo.
- No scheduled Meta collector until authorized token coverage is proven.
- No external webhook, ad-platform upload, outreach send, launch action, or spend change.

## Sources

- Meta Ad Library API: https://www.facebook.com/ads/library/api/
- SOMAR Meta Content Library: https://www.icpsr.umich.edu/sites/somar/meta-content-library
