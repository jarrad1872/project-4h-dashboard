# Competitor Research Template

Last updated: 2026-04-27

## Purpose

Use this template for manual-first competitor ad research after Q-21 validated that the official Meta Ad Library API is limited for US commercial competitor monitoring.

The goal is to capture observed market patterns without pretending that incomplete ad-library data proves winners.

## Capture Fields

| Field | Required | Guidance |
| --- | --- | --- |
| Captured date | Yes | Date the ad or competitor page was observed. |
| Advertiser / competitor | Yes | Page, brand, or product name exactly as observed. |
| Citation URL | Yes | Meta Ad Library URL, landing page URL, screenshot reference, or vendor report URL. |
| Source type | Yes | Public Ad Library, landing page, organic post, third-party report, or previously approved token-test result. |
| Country / delivery region | Yes | Country selected in the source view. Use unknown if the source does not expose it. |
| Platforms | Yes | Facebook, Instagram, Threads, YouTube, LinkedIn, TikTok, or unknown. |
| Offer | Yes | Trial, demo, discount, consult, price, guarantee, or no clear offer. |
| Primary hook | Yes | The first promise or pain point the ad leads with. |
| Visual pattern | Yes | UGC, founder talking head, product screenshot, jobsite proof, text card, testimonial, or other visible format. |
| CTA | Yes | Button or implied next action, such as book demo, start trial, learn more, call now. |
| Landing message | No | First-screen promise or destination message if observed. |
| Evidence quality | Yes | Observed, partial, inferred, or unverified. |
| Coverage note | Yes | Limits such as country filter, active-only view, missing creative, API zero result, or third-party estimate. |
| 4H takeaway | Yes | One action this should inform, or `no action` if evidence is weak. |

## Evidence Quality

| Quality | Meaning | Allowed use |
| --- | --- | --- |
| Observed | Source URL, ad creative, offer, hook, platform, and capture date are directly visible. | Can support a direct pattern note or creative test idea. |
| Partial | Some fields are visible, but platform, region, landing page, or creative detail is missing. | Can support a question or weak signal, not a confident recommendation. |
| Inferred | The conclusion depends on interpretation, a third-party summary, or a non-primary source. | Must be labeled as inference and paired with a validation step. |
| Unverified | No durable source URL or screenshot reference is available. | Do not use for strategy decisions. |

## Report Sections

1. Coverage notes
2. Observed offers
3. Hook patterns
4. Visual patterns
5. Platform mix
6. Landing-page match
7. Evidence gaps
8. 4H recommendations

## Blocked Claims

- Do not infer competitor spend from Meta Ad Library unless the source exposes official ranges.
- Do not call a hook a winner without conversion evidence.
- Do not treat third-party vendor estimates as official Meta data.
- Do not scrape or use reverse-engineered endpoints from this repo.
