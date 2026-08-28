# Q Commerce Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reliable multi-agent operating spine for Asset Ave and Dream Blvd, with typed events, owner approvals, Slack reporting, store integration contracts, executive synthesis, and a clean handoff to the visual Q Commerce Command application.

**Architecture:** Keep `codex-plus-hermes-team` focused on registry/routing and add commerce-specific contracts beside it instead of turning the MCP bridge into a storefront. External systems connect through adapters and normalized events; the Chief of Staff consumes those events and durable task results to produce owner-level reports. The visual headquarters remains a separate Next.js/Supabase application consuming this control plane.

**Tech Stack:** TypeScript, Node.js 20+, Zod, MCP, Hermes Agent, Slack, n8n, NATS/A2A integration contracts, Vitest or the repository's existing test runner.

**Spec:** `docs/superpowers/specs/2026-08-28-q-commerce-command-design.md`

## Global Constraints

- Default side-effect policy is `external_side_effects_need_approval`.
- No API keys, customer data, Hermes memories, private absolute paths, or Slack credentials are committed.
- Store-specific behavior is isolated behind adapters.
- Every external side effect has an attributable task/event and approval record when required.
- Retriable commerce actions require an idempotency key.
- Owner-facing channels receive summaries and approvals, not routine worker chatter.
- The system supports Asset Ave and Dream Blvd from the first release and can add brands without changing agent role logic.

---

### Task 1: Commerce Team Registry and Validation

**Files:**
- Modify: `examples/q-commerce-team.example.yaml`
- Create: `src/commerce/team-schema.ts`
- Create: `src/commerce/team-schema.test.ts`

**Interfaces:**
- Consumes: the repository's existing team configuration loading path.
- Produces: `CommerceTeamConfig`, `CommerceAgentRole`, and `validateCommerceTeamConfig(input)`.

- [ ] **Step 1: Write failing tests for required executive roles and duplicate profiles**

Test that a valid fixture contains exactly one Chief of Staff, both brand GMs, unique profiles, and the approval-safe default policy. Test that duplicate profiles or a missing GM fail with a descriptive validation result.

- [ ] **Step 2: Run the focused test and verify failure**

Run the repository test command against `src/commerce/team-schema.test.ts`. Expected: FAIL because the commerce schema module does not exist yet.

- [ ] **Step 3: Implement the schema and validation**

Use Zod or the repository's established validation dependency. Export typed role/category fields and return actionable validation errors rather than throwing opaque parser errors.

- [ ] **Step 4: Run focused and full tests**

Expected: commerce schema tests PASS and existing tests remain green.

- [ ] **Step 5: Commit**

```bash
git add examples/q-commerce-team.example.yaml src/commerce/team-schema.ts src/commerce/team-schema.test.ts
git commit -m "feat: validate Q Commerce team configuration"
```

### Task 2: Normalized Commerce Event Contract

**Files:**
- Create: `src/commerce/events.ts`
- Create: `src/commerce/events.test.ts`

**Interfaces:**
- Produces: `CommerceEventType`, `CommerceSeverity`, `CommerceEvent`, `parseCommerceEvent(input)`, and `createCommerceEvent(input)`.

- [ ] **Step 1: Write failing tests for event parsing**

Cover task events, approval events, metric updates, inventory risk, campaign performance, customer escalation, integration failure, critical alerts, and agent performance. Reject missing `brandId`, `agentId`, `eventType`, `occurredAt`, or `correlationId` when required by the event type.

- [ ] **Step 2: Run tests and verify failure**

Expected: FAIL because `events.ts` does not exist.

- [ ] **Step 3: Implement the typed event contract**

Model the fields from the design spec and preserve arbitrary structured `payload` without weakening the required envelope fields.

- [ ] **Step 4: Verify serialization round trips**

Create an event, JSON serialize/parse it, and assert semantic equality.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/events.ts src/commerce/events.test.ts
git commit -m "feat: add normalized commerce event contract"
```

### Task 3: Approval Policy Engine

**Files:**
- Create: `src/commerce/approvals.ts`
- Create: `src/commerce/approvals.test.ts`

**Interfaces:**
- Consumes: `CommerceEvent`.
- Produces: `CommerceAction`, `ApprovalDecision`, `requiresOwnerApproval(action, policy)`, and `buildApprovalRequest(action)`.

- [ ] **Step 1: Write failing policy tests**

Assert that research, analysis, drafting, scoring, QA, and internal routing do not require owner approval. Assert that public publishing, customer campaign sends, purchases, material price changes, paid spend commitments, destructive deletion, production deployment, unusual credits/refunds, and policy changes do require approval under the default policy.

- [ ] **Step 2: Run and verify failure**

Expected: FAIL because the approval engine does not exist.

- [ ] **Step 3: Implement explicit action classes**

Do not infer risk from free-text prompts. Route decisions through a finite action-class enum and policy table. Include brand, requesting agent, expected upside, downside/risk, estimated cost, rollback description, and idempotency key in approval requests where applicable.

- [ ] **Step 4: Run tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/approvals.ts src/commerce/approvals.test.ts
git commit -m "feat: add owner approval policy engine"
```

### Task 4: Slack Reporting Router

**Files:**
- Create: `src/commerce/slack-routing.ts`
- Create: `src/commerce/slack-routing.test.ts`
- Create: `examples/q-commerce-slack.example.json`

**Interfaces:**
- Consumes: `CommerceEvent`, `ApprovalRequest`.
- Produces: `SlackRoute`, `routeCommerceNotification(event)`, and `formatExecutiveBrief(input)`.

- [ ] **Step 1: Write failing channel-routing tests**

Assert that routine task lifecycle events route to agent activity, brand operations route to the correct brand lane, approval requests route to CEO approvals, and critical/executive summaries route to executive command. Do not embed real Slack channel IDs in tests or config examples.

- [ ] **Step 2: Verify tests fail**

Expected: FAIL because routing does not exist.

- [ ] **Step 3: Implement logical channel aliases**

Use environment-supplied IDs behind aliases such as `EXECUTIVE_COMMAND`, `CEO_APPROVALS`, `ASSET_AVE_OPS`, `DREAM_BLVD_OPS`, and `AGENT_ACTIVITY`.

- [ ] **Step 4: Add deterministic message formatting**

Executive briefs include KPI movement, causes/evidence, risks, opportunities, and approvals. Approval messages include the full structured decision context.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/slack-routing.ts src/commerce/slack-routing.test.ts examples/q-commerce-slack.example.json
git commit -m "feat: add Q Commerce Slack routing"
```

### Task 5: Store Adapter Contracts

**Files:**
- Create: `src/commerce/store-adapter.ts`
- Create: `src/commerce/store-adapter.test.ts`
- Create: `src/commerce/adapters/asset-ave.ts`
- Create: `src/commerce/adapters/dream-blvd.ts`

**Interfaces:**
- Produces: `StoreAdapter`, `StoreSnapshot`, `ProductSnapshot`, `OrderSnapshot`, `InventorySnapshot`, `CustomerSnapshot`.

- [ ] **Step 1: Write contract tests against fake adapters**

Require normalized methods for health, products, orders, inventory, customers, metrics, and supported write capabilities. Explicitly separate read methods from write methods.

- [ ] **Step 2: Run and verify failure**

Expected: FAIL because the adapter contract does not exist.

- [ ] **Step 3: Implement interface and capability flags**

A store adapter must declare which write actions it supports. Unsupported writes fail closed with a typed error.

- [ ] **Step 4: Add Asset Ave and Dream Blvd adapter shells**

Implement configuration validation and health/capability surfaces without committing credentials. Real API calls are added only when connector credentials and platform details are available.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/store-adapter.ts src/commerce/store-adapter.test.ts src/commerce/adapters
git commit -m "feat: add commerce store adapter contracts"
```

### Task 6: Workflow and Event Bridge

**Files:**
- Create: `src/commerce/workflow-bridge.ts`
- Create: `src/commerce/workflow-bridge.test.ts`
- Create: `docs/q-commerce/workflow-events.md`

**Interfaces:**
- Consumes: normalized `CommerceEvent`.
- Produces: `WorkflowPublisher`, `publishCommerceEvent(event)`, and transport adapters suitable for n8n webhooks and later NATS/A2A delivery.

- [ ] **Step 1: Write failing tests for retry-safe publishing**

Test idempotency, correlation IDs, retry classification, and that write actions never execute merely because an event was republished.

- [ ] **Step 2: Run and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement transport-neutral publisher**

The first implementation can emit to an injected webhook/transport client. Keep NATS/A2A as adapters rather than required runtime dependencies.

- [ ] **Step 4: Document event-to-workflow examples**

Document order-created, inventory-risk, campaign-ready, customer-escalation, approval-approved, and integration-failure flows.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/workflow-bridge.ts src/commerce/workflow-bridge.test.ts docs/q-commerce/workflow-events.md
git commit -m "feat: add commerce workflow event bridge"
```

### Task 7: Chief of Staff Executive Synthesis

**Files:**
- Create: `src/commerce/executive-brief.ts`
- Create: `src/commerce/executive-brief.test.ts`

**Interfaces:**
- Consumes: metrics, open approvals, critical events, task outcomes, and brand summaries.
- Produces: `ExecutiveBrief` and `buildExecutiveBrief(input)`.

- [ ] **Step 1: Write failing synthesis tests**

Given synthetic store metrics and events, assert that the output distinguishes facts from inferred explanations, ranks critical risks above routine wins, deduplicates repeated alerts, and lists only material owner decisions.

- [ ] **Step 2: Run and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement deterministic brief assembly**

Do deterministic aggregation first. If an LLM later improves narrative quality, it receives the structured brief and cannot alter underlying numbers or approval state.

- [ ] **Step 4: Add brand comparison output**

Include Asset Ave and Dream Blvd performance side-by-side when both have current data.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/executive-brief.ts src/commerce/executive-brief.test.ts
git commit -m "feat: add Q Chief of Staff executive briefs"
```

### Task 8: Agent Performance Telemetry

**Files:**
- Create: `src/commerce/agent-performance.ts`
- Create: `src/commerce/agent-performance.test.ts`

**Interfaces:**
- Consumes: task runs, QA outcomes, approval outcomes, latency, cost signals, attributed business metrics.
- Produces: `AgentPerformanceSnapshot` and `calculateAgentPerformance(input)`.

- [ ] **Step 1: Write failing metric tests**

Cover completion rate, failure rate, QA rejection rate, approval rejection rate, median latency, cost where available, and revenue influence explicitly labeled as attribution/correlation quality.

- [ ] **Step 2: Verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement metrics without false precision**

Return `null` or confidence metadata when revenue attribution cannot be supported.

- [ ] **Step 4: Run tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/agent-performance.ts src/commerce/agent-performance.test.ts
git commit -m "feat: add agent performance telemetry"
```

### Task 9: Control-Plane Health and Kill Switches

**Files:**
- Create: `src/commerce/control-health.ts`
- Create: `src/commerce/control-health.test.ts`

**Interfaces:**
- Produces: `CommerceSystemHealth`, `KillSwitchScope`, `evaluateSystemHealth(input)`, `isActionEnabled(action, switches)`.

- [ ] **Step 1: Write failing safety tests**

Test global, brand, integration, campaign, and agent-level disable states. Critical integration failure should never silently fall back to an unapproved alternate write path.

- [ ] **Step 2: Verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement fail-closed kill switches**

Reads may remain available where safe, while disabled write scopes return a typed blocked result.

- [ ] **Step 4: Run tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/commerce/control-health.ts src/commerce/control-health.test.ts
git commit -m "feat: add Q Commerce kill switches and health"
```

### Task 10: Visual Headquarters API Handoff

**Files:**
- Create: `docs/q-commerce/command-center-api.md`
- Create: `docs/q-commerce/data-model.md`

**Interfaces:**
- Produces the stable read models the separate Next.js/Supabase Q Commerce Command application will consume.

- [ ] **Step 1: Define read models**

Document schemas for brands, agents, current agent status, tasks, events, approvals, metrics, reports, integrations, campaigns, products, inventory snapshots, and customer escalations.

- [ ] **Step 2: Define command models**

Document approve, reject, pause agent, resume agent, pause brand automation, and emergency stop commands with expected audit events.

- [ ] **Step 3: Define realtime update behavior**

Document event ordering expectations, stale-data indicators, heartbeats, pagination, and reconnection behavior.

- [ ] **Step 4: Review against design spec**

Confirm every visual headquarters screen has the data needed without reaching directly into Hermes memory or store credentials.

- [ ] **Step 5: Commit**

```bash
git add docs/q-commerce/command-center-api.md docs/q-commerce/data-model.md
git commit -m "docs: define Q Commerce Command UI contracts"
```

### Task 11: End-to-End Supervised Commerce Scenario

**Files:**
- Create: `src/commerce/q-commerce.e2e.test.ts`
- Create: `docs/q-commerce/runbook.md`

**Interfaces:**
- Consumes all contracts from Tasks 1-10.
- Produces an executable supervised scenario and operator runbook.

- [ ] **Step 1: Write an end-to-end test using fakes**

Scenario: inventory risk is detected for Asset Ave → event emitted → Inventory Manager task created → recommendation reaches Asset Ave GM → material reorder action creates owner approval → approval is granted → workflow publisher emits the approved action once → executive brief records the outcome.

- [ ] **Step 2: Run and verify failure before missing pieces are wired**

Expected: FAIL until all preceding interfaces are integrated.

- [ ] **Step 3: Wire the minimum orchestration glue**

Do not introduce real purchasing. The end-to-end test uses fake external adapters and proves approval/idempotency/reporting behavior.

- [ ] **Step 4: Add operator runbook**

Include startup checks, agent health, approval review, paused scopes, failure recovery, credential rotation guidance, and emergency stop procedure.

- [ ] **Step 5: Run full verification**

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: all commands succeed.

- [ ] **Step 6: Commit**

```bash
git add src/commerce/q-commerce.e2e.test.ts docs/q-commerce/runbook.md
git commit -m "test: verify supervised Q Commerce workflow"
```

## Completion Gate

Before merging:

- all tests, typechecks, and builds pass;
- no credentials or private identifiers are committed;
- default external side-effect policy remains approval-gated;
- both brands are represented in contract/e2e tests;
- Slack routes are configured through aliases/environment, not hard-coded IDs;
- control-plane documentation clearly separates implemented capabilities from connector shells;
- visual HQ contracts are stable enough to begin the separate Next.js/Supabase application.