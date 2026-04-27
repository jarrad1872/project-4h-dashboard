# Agent Review And Browser Workflow

Use this workflow for every Project 4H phase. The goal is to build methodically, avoid drift, and keep `sawcity-lite` read-only.

## Non-Negotiables

- Work only in the 4H repo unless Jarrad explicitly opens another workspace.
- Treat `sawcity-lite` as read-only reference material.
- Do not launch campaigns, send creator outreach, create webhooks, or move spend without Jarrad approval.
- Update `TASKS.md` when phase status changes.
- Verify with tests, build, and the in-app browser before calling work complete.

## Phase Loop

Every phase follows the same sequence:

1. Scope
   - Re-read the phase in `TASKS.md`.
   - Identify the smallest shippable slice and its exit gate.
   - List files expected to change.

2. Reconnaissance
   - Spawn a read-only explorer subagent for codebase mapping.
   - Ask for specific risks, existing patterns, and recommended files to touch.
   - Continue local work while the explorer runs.

3. Implementation
   - Make scoped changes in 4H only.
   - Prefer existing API, Supabase, validation, and test patterns.
   - Add or update docs in the same pass.

4. Review
   - Spawn a read-only review subagent after implementation.
   - Ask it to look for bugs, missing tests, scope drift, and hard-rule violations.
   - Integrate fixes or document accepted residual risk.

5. Verification
   - Run `npm test`.
   - Run `npm run build`.
   - Start or reuse the local dev server.
   - Use the Codex in-app browser against `http://127.0.0.1:3000`.
   - Check the changed routes visually and inspect browser console errors.

6. Closeout
   - Update `TASKS.md` checkboxes.
   - Summarize changed files, verification evidence, and next phase.
   - Do not push unless Jarrad asks.

## Subagent Roles

Use subagents only for bounded work:

- Explorer: read-only codebase reconnaissance before implementation.
- Reviewer: read-only review after implementation.
- Worker: only for disjoint code edits when the write scope is clear.

Subagent prompts must include:

- Phase number and goal.
- Read-only or write ownership.
- `sawcity-lite` is read-only and out of scope.
- Expected output format.

## Browser Gate

For each phase, the browser pass should verify:

- Page loads with no blank screen.
- Primary changed route is reachable from the sidebar or direct URL.
- New visible text is accurate and does not imply external launch.
- No obvious text overlap or broken layout on desktop width.
- Browser console has no new errors from the changed route.

For Phase 1 specifically, verify:

- `/scorecard` loads.
- Mission progress remains visible.
- Growth funnel event totals render even with zero events.
- Sidebar still reaches Command, Creators, Creative Lab, Scorecard, Approval, and Launch.
