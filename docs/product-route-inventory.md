# Product Route Inventory

Last updated: 2026-04-27

This inventory is copied into 4H from read-only sawcity-lite reference files. It is a campaign planning artifact only. It does not edit, migrate, deploy, or change sawcity-lite.

## Findings

- sawcity-lite resolves trade landing pages from the request hostname. Each trade domain uses `/` as the public landing path.
- `answered.city` resolves to the trade directory, not a single trade landing page.
- Trade-specific landing pages render price and trial language in the product UI: `$39/mo`, `14-day free trial`, and no credit card language.
- Click-to-call demo phone numbers are served from `GET /api/demo-line/:trade`.
- The demo app session is started through `POST /api/auth/demo` with the trade slug.
- The five 4H beachhead domains all have landing routes, hero assets, demo phone numbers, and demo auth assumptions available for creator/ad planning.

## Beachhead Routes

| Domain | Trade | Landing | Signup | Demo phone | Demo API |
| --- | --- | --- | --- | --- | --- |
| `pipe.city` | Plumbing | `/` | `/login?mode=signup` | `(385) 475-3881` | `/api/demo-line/plumbing` |
| `duct.city` | HVAC | `/` | `/login?mode=signup` | `(385) 458-3456` | `/api/demo-line/hvac` |
| `mow.city` | Lawn care | `/` | `/login?mode=signup` | `(385) 458-9028` | `/api/demo-line/lawn-care` |
| `pest.city` | Pest control | `/` | `/login?mode=signup` | `(385) 354-6514` | `/api/demo-line/pest-control` |
| `coat.city` | Painting | `/` | `/login?mode=signup` | `(385) 334-5577` | `/api/demo-line/painting` |

## Planning Implications

- The Q-11 launch URL builder creates URLs against the domain root by default, not path variants, unless a future sawcity-lite handoff intentionally adds route-level message-match pages.
- Q-12 message-match briefs are handoff docs only. They describe desired product/landing changes, but 4H must not apply them to sawcity-lite.
- Creator briefs should keep using demo-call CTAs for beachhead trades because all five have confirmed phone numbers.
- Broad Answered.City traffic can use `answered.city/`, but trade-specific paid clicks should use the relevant `.city` domain for message match.

## Read-only Source Evidence

- `sawcity-lite/demo-lines.json`
- `sawcity-lite/frontend/src/lib/tradeConfig.js`
- `sawcity-lite/frontend/src/App.jsx`
- `sawcity-lite/frontend/src/pages/LandingPage.jsx`
- `sawcity-lite/frontend/src/pages/TradeDirectoryPage.jsx`
- `sawcity-lite/api/index.js`
- `sawcity-lite/routes/auth.js`

The structured inventory used by `/gtm` lives in `lib/product-route-inventory.ts`.
