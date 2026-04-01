# Influencer Outreach Agent

Last updated: 2026-03-31

## Goal

Turn the existing influencer roster into a semi-autonomous outreach pipeline that still keeps every outbound message human-gated.

## Non-Negotiables

- Email only. No DM automation.
- Flat-fee model only: target $200-$500 per mention.
- No rev-share.
- Every draft requires approval before send.
- Follow-ups draft at day 3 and day 7, but each still requires approval.

## Workflow

1. Discovery
- Create or import a creator record with trade, platform, email, audience size, notes, and channel URL.

2. Qualification
- Score each creator on:
  - audience fit (`owners`, `mixed`, `consumer`)
  - engagement rate
  - sponsor openness signals
  - audience size tier
- Result is a 100-point priority score with `priority`, `review`, or `watch`.

3. Draft generation
- Initial outreach and both follow-up steps use a deterministic template generator.
- Drafts pull from the creator name, trade, flat-fee amount, and research notes.

4. Human approval
- Drafts move to `pending_approval`.
- Approval changes the record to `approved`.
- Rejection moves the record back to `qualified`.

5. Dispatch
- Send is manual and explicit.
- Marking a draft as sent records `sent_at`, updates pipeline status to `contacted`, and queues the next follow-up date.

6. Response handling
- Any reply marks the record as `responded` and clears follow-up cadence.

## Data Fields

Primary workflow fields added to `influencer_pipeline`:

- `contact_email`
- `business_focus`
- `average_views`
- `engagement_rate`
- `sponsor_openness`
- `outreach_stage`
- `draft_status`
- `draft_step`
- `draft_subject`
- `draft_body`
- `approved_at`
- `draft_generated_at`
- `sent_at`
- `follow_up_due_at`
- `last_response_at`

## UI Surface

`/influencer` is now the operating console for:

- qualification scoring
- approval queue
- ready-to-send queue
- follow-up due queue
- manual roster edits

## Integration Notes

- Current implementation is dashboard-native and does not auto-send mail.
- Browser-based dispatch integration should attach at the `approved -> sent` boundary once the browser approval system is ready.
- Paperclip issue workflow can mirror the same stages using the record metadata in this document.
