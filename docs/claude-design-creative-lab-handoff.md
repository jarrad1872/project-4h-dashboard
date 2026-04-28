# Claude Design Handoff - Creative Lab

Last updated: 2026-04-27

## Assignment

Polish the Project 4H Creative Lab at `/assets` so Jarrad can work through the ChatGPT Pro image workflow quickly: copy a prompt packet, generate the image manually with `chatgpt-image-latest`, upload the result, create replacement variants, and move assets into review.

This is a design handoff only. Do not launch ads, send outreach, create webhooks, upload to ad platforms, change billing, or touch `sawcity-lite`.

## Product Context

Project 4H is the acquisition operating system for Answered.City. The current target is 1,000-2,000 paying customers by 2026-12-31 using creator demos, trade-specific image creative, approved launch bundles, and attribution.

The active image workflow is manual ChatGPT Pro generation:

- Model label in 4H: `chatgpt-image-latest`
- Provider label: `chatgpt-pro`
- API model reference if ever needed later: `gpt-image-1.5`
- Current beachhead trades: `saw.city`, `pipe.city`, `mow.city`, `rinse.city`, `lockout.city`
- Offer rules: `$39/mo`, `14-day free trial`, `no credit card required`

## UX Goals

Make Creative Lab feel like a working production desk, not a database table.

- The next image to generate should be obvious.
- The 20-prompt beachhead pack should be easy to scan by trade, angle, and generation state.
- Every card should make lineage clear: root concept, parent asset, variant ID, and source image.
- Copying a packet should feel confident because it includes model, provider, trade, prompt, avoid list, output rule, and source image when present.
- Uploading a generated image should clearly move an asset toward review without implying external publication.
- Replacement variants should feel reversible and low-risk: v2/v3 prompt creation only, no generated image until Jarrad/Codex manually uses ChatGPT Pro.

## Current Routes To Inspect

Inspect these in order:

1. `/assets` - primary Creative Lab workflow.
2. `/` - Autonomous build queue summary, should show Q-01 and Q-05+ as next ready work after Q-04.
3. `/approval` - approval tone and status language reference.
4. `/scorecard` - performance/zero-data tone reference.

## Screenshots To Capture

Capture desktop and mobile screenshots for these states:

- `/assets` unfiltered, with the 20-prompt pack visible.
- `/assets` filtered to one trade and one angle.
- `/assets` with generation filter set to `Needs image`.
- A single root prompt card showing copy, upload, and variant controls.
- A replacement variant card showing parent ID, source image, and v2/v3 prompt context.
- Empty filter state.
- `/` command page queue showing Q-04 no longer ready.

## Data Model Reference

Creative assets are stored in `creative_assets` and surfaced through:

- `GET /api/creative-assets`
- `POST /api/creative-assets`
- `PATCH /api/creative-assets/[id]`
- `POST /api/image-concepts`

Important fields:

| Field | Purpose |
| --- | --- |
| `id` | Asset row ID. |
| `trade_slug` | Trade key such as `saw`, `pipe`, `mow`, `rinse`, or `lockout`. |
| `title` | Human-readable concept or asset title. |
| `angle` | `missed-call`, `demo-call`, `owner-agent`, or `roi-math` for the beachhead pack. |
| `provider` | Usually `chatgpt-pro`. |
| `model` | Usually `chatgpt-image-latest`. |
| `prompt_brief_id` | Stable root prompt family, such as `pipe-missed-call-multi`. |
| `prompt_text` | Generation prompt copied into ChatGPT Pro. |
| `negative_prompt` | Avoid list copied into ChatGPT Pro. |
| `source_image_url` | Parent/reference image for replacement variants. |
| `dimensions` | Target crop such as `1024x1024`. |
| `variant_id` | Stable variant ID such as `pipe-missed-call-multi-v2`. |
| `parent_asset_id` | Parent creative asset for v2/v3 prompts. |
| `generation_status` | `brief`, `generated`, or manual status labels. |
| `status` | `draft`, `review`, `approved`, or `live`. |
| `asset_url` | Uploaded generated image URL. |
| `thumbnail_url` | Preview image URL. |

## Current Controls

Creative Lab currently includes:

- Queue filters: status, trade, angle, generation state.
- Q-01 progress panel.
- Prompt brief creator.
- 20-prompt beachhead seeder.
- Manual generated image upload.
- Per-card status controls.
- Per-card copy packet.
- Per-card replacement variant prompt creator.
- Parent lineage display.

## Design Constraints

- Keep the dashboard dense, scannable, and work-focused.
- Avoid marketing-landing-page styling.
- Do not use ornamental gradients, decorative blobs, or card-inside-card clutter.
- Keep cards at 8px radius or less unless a local component already defines otherwise.
- Text must fit on mobile; long IDs should wrap or truncate gracefully.
- Use familiar controls for workflows: selects for filters, buttons for commands, inputs/textareas for editable metadata.
- Make destructive actions visually secondary. Delete still requires confirmation.
- Do not imply anything is live externally until Jarrad approves it.
- Do not add instructions that tell agents to touch `sawcity-lite`.

## Suggested Improvements

- Add a compact sticky filter bar on desktop.
- Add badges for `Root`, `v2`, `v3`, `Needs image`, and `Review-ready`.
- Visually group packet, upload, and variant controls as a single production sequence.
- Improve card hierarchy so prompt text is useful but not visually dominant.
- Add clearer lineage chips: `root -> v2 -> v3`.
- Add source-image preview or link treatment for replacement variants.
- Improve mobile spacing around file upload and status controls.

## Non-Goals

- No OpenAI API integration.
- No ad-platform upload.
- No creator outreach send.
- No paid campaign launch.
- No production product changes in `sawcity-lite`.
- No changes to pricing or trial language.

## Acceptance Checklist

- A designer can understand the Creative Lab workflow without reading the whole repo.
- The handoff names the exact route, data fields, UI states, and constraints.
- The packet includes the screenshots Claude Design should inspect.
- The packet reinforces approval boundaries and the `sawcity-lite` read-only rule.
