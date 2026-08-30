# Q Commerce Command Handoff

## Current Goal
Build Q Commerce Command as the supervised multi-agent operating system for Asset Ave and Dream Blvd, with owner reporting through Slack and a future visual headquarters showing every agent, task, approval, metric, and system-health state.

## Current Branch
`q-commerce-command`

## Draft Pull Request
PR #1: `Q Commerce Command control-plane foundation`

## Completed
- Created a dedicated implementation branch.
- Added a 26-role commerce agent registry in `examples/q-commerce-team.example.yaml`.
- Added architecture spec at `docs/superpowers/specs/2026-08-28-q-commerce-command-design.md`.
- Added implementation plan at `docs/superpowers/plans/2026-08-28-q-commerce-command.md`.
- Created private Slack channels: `executive-command`, `ceo-approvals`, `asset-ave-ops`, `dream-blvd-ops`, `agent-activity`.
- Seeded Slack reporting and approval rules.
- Added `src/commerce/team-schema.ts` and `tests/commerce-team-schema.test.ts` for supervised commerce-team validation.

## Architecture Decisions
- Keep `codex-plus-hermes-team` as the agent registry/routing control plane, not the storefront.
- Q Chief of Staff is the single owner-facing orchestrator.
- Asset Ave and Dream Blvd each have their own General Manager.
- Default external action policy is `external_side_effects_need_approval`.
- Normalize operational activity into commerce events before routing to Slack, workflows, analytics, or the future UI.
- Store-specific integrations live behind adapters.
- n8n handles workflow automation; NATS/A2A are optional event/agent transport layers.
- OmniRouter is the preferred future model-routing layer because it exposes one API and is explicitly designed for dynamic model switching and cost/performance routing.
- The visual Q Commerce Command application should be a separate Next.js/Supabase app consuming stable control-plane APIs/read models.

## Next Tasks, In Order
1. Finish `src/commerce/events.ts` and add event tests.
2. Add owner approval policy engine and tests.
3. Add logical Slack channel routing and deterministic executive/approval message formatting.
4. Add Asset Ave and Dream Blvd store-adapter contracts and safe shells.
5. Add transport-neutral workflow publisher for n8n, with NATS/A2A adapters later.
6. Add Chief of Staff executive brief synthesis.
7. Add agent-performance telemetry.
8. Add fail-closed kill switches and system-health evaluation.
9. Define the visual HQ API/data models.
10. Add a supervised end-to-end commerce scenario using fake external adapters.
11. Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check` before marking the PR ready.

## Model / Token Continuity Strategy
- Use OmniRouter as the model abstraction rather than binding workers to one provider.
- Persist task state, outputs, decisions, and evidence outside model context windows.
- Every durable agent task should have a task ID, correlation ID, input summary, output summary, status, and artifacts.
- Handoffs must reference repo branch/commit, task ID, current blocker, completed tests, and next command/action.
- Model context is disposable; repository state and structured task state are authoritative.

## Safety Boundaries
- No unrestricted autonomous spending.
- No unrestricted customer messaging or public publishing.
- No credentials or customer data in git.
- External side effects remain approval-gated unless the owner later creates a bounded standing policy.
- Retriable external actions require idempotency keys.
- Add kill switches at system, brand, integration, campaign, and agent level.

## For the Next AI
Read these files before changing code:
1. `docs/q-commerce/HANDOFF.md`
2. `docs/superpowers/specs/2026-08-28-q-commerce-command-design.md`
3. `docs/superpowers/plans/2026-08-28-q-commerce-command.md`
4. `examples/q-commerce-team.example.yaml`
5. `src/commerce/team-schema.ts`
6. existing repository `README.md`, `src/types.ts`, `src/config.ts`, and tests.

Continue on `q-commerce-command`. Do not implement on `main`. Keep PR #1 as the integration review point.