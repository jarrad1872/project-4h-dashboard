# Creative Static URL Guard

Last updated: 2026-04-27

Q-52 resolves the `/creatives` blocker without redirecting the route. The purpose is to prove the public static creative URLs are independent of the legacy `/creatives` page route before any future page-route redirect packet.

## Evidence

Local production server: `http://127.0.0.1:3106`

| Check | Result |
| --- | --- |
| `/creatives` page route | `200 text/html; charset=utf-8` |
| Public static JPEG URLs checked | 24 / 24 |
| Static URL status | All returned `200` |
| Static URL content type | All returned `image/jpeg` |
| Redirect implemented | No |
| Static file moved/renamed/deleted | No |
| External action | No upload, launch, webhook, spend, billing, outreach, external API call, or sawcity-lite change |

## Checked URLs

| URL | Status | Content type |
| --- | ---: | --- |
| `/creatives/saw-1200x628-facebook.jpg` | 200 | `image/jpeg` |
| `/creatives/saw-1080x1080-meta.jpg` | 200 | `image/jpeg` |
| `/creatives/saw-1080x1920-instagram.jpg` | 200 | `image/jpeg` |
| `/creatives/saw-1200x1200-linkedin.jpg` | 200 | `image/jpeg` |
| `/creatives/saw-1200x1200-linkedin-sq.jpg` | 200 | `image/jpeg` |
| `/creatives/saw-1280x720-youtube.jpg` | 200 | `image/jpeg` |
| `/creatives/rinse-1200x628-facebook.jpg` | 200 | `image/jpeg` |
| `/creatives/rinse-1080x1080-meta.jpg` | 200 | `image/jpeg` |
| `/creatives/rinse-1080x1920-instagram.jpg` | 200 | `image/jpeg` |
| `/creatives/rinse-1200x1200-linkedin.jpg` | 200 | `image/jpeg` |
| `/creatives/rinse-1200x1200-linkedin-sq.jpg` | 200 | `image/jpeg` |
| `/creatives/rinse-1280x720-youtube.jpg` | 200 | `image/jpeg` |
| `/creatives/mow-1200x628-facebook.jpg` | 200 | `image/jpeg` |
| `/creatives/mow-1080x1080-meta.jpg` | 200 | `image/jpeg` |
| `/creatives/mow-1080x1920-instagram.jpg` | 200 | `image/jpeg` |
| `/creatives/mow-1200x1200-linkedin.jpg` | 200 | `image/jpeg` |
| `/creatives/mow-1200x1200-linkedin-sq.jpg` | 200 | `image/jpeg` |
| `/creatives/mow-1280x720-youtube.jpg` | 200 | `image/jpeg` |
| `/creatives/rooter-1200x628-facebook.jpg` | 200 | `image/jpeg` |
| `/creatives/rooter-1080x1080-meta.jpg` | 200 | `image/jpeg` |
| `/creatives/rooter-1080x1920-instagram.jpg` | 200 | `image/jpeg` |
| `/creatives/rooter-1200x1200-linkedin.jpg` | 200 | `image/jpeg` |
| `/creatives/rooter-1200x1200-linkedin-sq.jpg` | 200 | `image/jpeg` |
| `/creatives/rooter-1280x720-youtube.jpg` | 200 | `image/jpeg` |

## Next Packet

`/creatives` is now eligible for a future page-route redirect packet only. That future packet must prove these same 24 static URLs still return `200 image/jpeg` after the page route redirects to `/assets`.
