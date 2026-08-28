# Asset Ave + Dream Blvd Agent Swarm

## Goal
Ship a working operator skeleton for Asset Ave and Dream Blvd with an orchestrator, web dashboard, Slack reporting hooks, shared task/memory contracts, and specialist commerce/growth/ops lanes.

## Command Structure
- Codex / ChatGPT: final integrator, checkpoint owner, cross-lane verification.
- Claude Code: architecture review, interfaces, failure-mode review, security/privacy review.
- Cursor: dashboard implementation, API wiring, integration glue, tests.
- Hermes specialist team: commerce, growth, analytics, operations, content, QA.

## Work Lanes

### Lane A — Claude Code: Architecture + Review
Deliverables:
1. Review proposed orchestrator boundaries and task schema.
2. Define provider-neutral agent adapter interface.
3. Define shared memory/event contracts.
4. Review Slack outbound reporting boundary.
5. Produce failure-mode checklist for duplicate tasks, retries, partial failures, provider outages, and stale memory.
6. Review all integration PRs before merge.

Acceptance:
- No direct business side effects inside planning/reasoning agents.
- External writes are explicit, logged, and approval-gated where appropriate.
- Agent/provider implementation can be swapped without changing business workflows.

### Lane B — Cursor: Dashboard + Integration Code
Deliverables:
1. Agent roster/status screen.
2. Task queue with owner, business, priority, status, timestamps, retries, and result summary.
3. Activity/log stream.
4. Business switcher: Asset Ave / Dream Blvd.
5. Metrics cards for tasks queued/running/completed/failed.
6. API client for orchestrator endpoints.
7. Basic responsive UI and smoke tests.

Acceptance:
- Dashboard loads with seeded/mock data before live providers are connected.
- Failed provider calls surface clearly and never disappear silently.
- No secrets or raw provider credentials appear in UI/logs.

### Lane C — Hermes: Commerce / Catalog / Ops
Asset Ave:
- Catalog quality checks.
- Product availability and listing integrity.
- Shopify-source-of-truth rules.
- Pricing/inventory anomaly reports.
- Customer/order operations suggestions.

Dream Blvd:
- WooCommerce listing/merchandising checks.
- Product/page QA.
- Build/design issue triage.
- Store operations reports.

### Lane D — Hermes: Growth / Content / Analytics
For both businesses:
- SEO backlog.
- Social content queue.
- Email/SMS campaign drafts.
- Campaign performance summaries.
- Product/landing-page conversion observations.
- PostHog/analytics event recommendations.

### Lane E — Hermes: QA / Watchdog
- Detect stuck tasks.
- Validate required output fields.
- Flag hallucinated product facts or unsupported inventory/pricing claims.
- Check that external actions were authorized.
- Generate end-of-run report for Codex/ChatGPT.

## First Milestone
A local runnable skeleton with:
- orchestrator API
- provider-neutral agent registry
- mock agent execution
- dashboard
- task/status persistence
- Slack reporter interface with dry-run mode
- Asset Ave and Dream Blvd seeded specialist roles
- tests for routing, task state transitions, retries, and approval boundaries

## Checkpoint Policy
At every stable milestone create:
- commit
- short status note under `checkpoints/`
- unfinished task list
- exact run/test commands
- known blockers

This keeps the project transferable between Codex, Claude Code, Cursor, and other agents without losing state.
