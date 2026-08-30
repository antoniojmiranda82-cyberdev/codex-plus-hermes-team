# Q Commerce Command Design

## Purpose

Q Commerce Command is the owner-facing control plane for running Asset Ave and Dream Blvd through a coordinated AI workforce. The system separates executive oversight, brand management, specialist work, approvals, automation, analytics, and external actions so the owner receives decisions and results instead of raw agent chatter.

## Success Criteria

- Asset Ave and Dream Blvd each have a General Manager accountable for store-level performance.
- Shared specialist agents cover growth, marketing, social, lifecycle messaging, product research, pricing, inventory, suppliers, sales conversion, customer experience, SEO, competitive intelligence, finance, analytics, automation, technology, compliance, QA, and agent performance.
- The Q Chief of Staff is the single owner-facing coordinator.
- Routine analysis and drafting can run without owner interruption.
- External or high-impact side effects require explicit approval by default.
- Every agent action can be attributed to an agent, brand, task, event, and outcome.
- Slack acts as the initial operating cockpit while a dedicated visual headquarters is built.
- The architecture can expand to additional stores without duplicating the control plane.

## Architecture

```text
Antonio / Owner
      |
Q Chief of Staff
      |
+----------------------+----------------------+
|                                             |
Asset Ave GM                              Dream Blvd GM
|                                             |
+---------------- specialist departments ----------------+
                       |
              Shared Directors / Agents
                       |
        Hermes Team routing + durable tasks
                       |
       n8n / NATS / A2A workflow and events
                       |
 Store APIs / Mautic / PostHog / data services
                       |
              Slack + Q Command UI
```

The existing `codex-plus-hermes-team` project remains the specialist registry and routing layer. It should not become a storefront or monolithic business application. Store connectors, analytics, event transport, workflow automation, and the visual command center integrate around it through stable contracts.

## Agent Topology

### Executive Layer

- Q Chief of Staff
- Asset Ave General Manager
- Dream Blvd General Manager
- Growth Director
- AI CFO
- Technology Director

### Revenue and Growth

- Marketing Strategist
- Conversion Copywriter
- Social Director
- Short-Form Producer
- Pinterest & Discovery Agent
- Email Lifecycle Manager
- SMS Lifecycle Manager
- Sales & Conversion Manager
- SEO Director
- Competitive Intelligence Agent

### Merchandising and Operations

- Product Scout
- Pricing & Margin Agent
- Inventory Manager
- Supplier Manager
- Customer Experience Lead

### Platform and Governance

- Commerce Data Analyst
- Automation Engineer
- Risk & Compliance Agent
- QA & Brand Guardian
- Agent Performance Manager

## Reporting Chain

Specialist agents report to the relevant director or brand GM. Brand GMs and shared directors report to the Q Chief of Staff. The Chief of Staff synthesizes information and reports to the owner.

The owner should not receive routine task-by-task updates. The default executive report contains:

- revenue and profit movement;
- orders and conversion changes;
- inventory and supplier risks;
- campaign performance;
- customer-service risk;
- significant opportunities;
- failed automations or integrations;
- approvals awaiting owner action.

## Approval Model

Default policy: `external_side_effects_need_approval`.

Allowed without owner approval:

- read/search/research;
- analysis and forecasting;
- product and competitor scoring;
- drafting copy, campaigns, offers, reports, and workflows;
- internal task creation and routing;
- QA and compliance review;
- recommendations.

Require approval by default:

- publishing public content;
- sending customer email or SMS campaigns;
- changing prices;
- placing purchases or orders;
- committing paid advertising spend;
- deleting data or content;
- production deployments that materially change a store;
- issuing unusual refunds or credits;
- changing standing business policy;
- other material external side effects.

Standing policies may later grant bounded autonomy, for example an approved daily ad-test budget or a pre-approved promotion range.

## Slack Operating Cockpit

Initial private channels:

- `#executive-command`: owner-level briefs, major opportunities, cross-brand performance, critical escalations.
- `#ceo-approvals`: structured approval requests only.
- `#asset-ave-ops`: Asset Ave operational activity and brand-GM reporting.
- `#dream-blvd-ops`: Dream Blvd operational activity and brand-GM reporting.
- `#agent-activity`: worker task lifecycle, handoffs, retries, failures, and QA events.

Notification levels:

- INFO: dashboard/event log only.
- REPORT: daily or weekly summary.
- APPROVAL: Slack approval queue plus command-center badge.
- CRITICAL: immediate owner escalation through configured channels.

## Event Contract

The control plane should normalize operational activity into events. Initial event names:

```text
commerce.task.created
commerce.task.started
commerce.task.completed
commerce.task.failed
commerce.task.handoff
commerce.approval.requested
commerce.approval.approved
commerce.approval.rejected
commerce.metric.updated
commerce.inventory.risk
commerce.supplier.risk
commerce.campaign.ready
commerce.campaign.performance
commerce.customer.escalation
commerce.integration.failure
commerce.alert.critical
commerce.agent.performance
```

Each event should contain:

```text
id
occurred_at
brand_id
agent_id
agent_role
task_id
event_type
severity
summary
payload
requires_approval
approval_id
correlation_id
```

## Data Model for Visual Headquarters

The future Q Commerce Command UI should use these primary entities:

- `brands`
- `agents`
- `agent_capabilities`
- `tasks`
- `task_runs`
- `events`
- `approvals`
- `metrics`
- `reports`
- `integrations`
- `campaigns`
- `products`
- `inventory_snapshots`
- `customer_escalations`

Each agent record should expose display name, role, manager, brand scope, status, current task, capabilities, last heartbeat, recent outcomes, approval rejection rate, failure rate, and measurable business impact where attribution is available.

## Visual Headquarters

The dedicated UI is a separate application from the Hermes MCP bridge. It should be built with Next.js and Supabase, with motion used for state transitions rather than decorative overload.

Primary screens:

1. Executive Home: revenue, profit, orders, active agents, alerts, approvals, top opportunities.
2. Companies: Asset Ave and Dream Blvd performance views.
3. Agent Floor: visual workforce with active, idle, blocked, failed, and waiting-for-approval states.
4. Org Chart: clickable reporting hierarchy.
5. Task Board: backlog, assigned, working, waiting, review, approval, complete, failed.
6. Approvals: action, requesting agent, brand, expected upside, risk, cost, rollback, approve/reject.
7. Marketing and Social: campaign calendar and channel performance.
8. Products and Inventory: opportunities, stock risk, pricing, supplier health.
9. Customers: escalations, sentiment, refunds, retention.
10. Finance: revenue, COGS, fees, ad spend, gross profit, net contribution, cash outlook.
11. Analytics: funnel and causal summaries.
12. System Health: integrations, queues, workflow failures, agent health.

## Integrations

Preferred reusable components from the existing repository portfolio:

- `codex-plus-hermes-team`: agent registry, routing, panels, task collection.
- `hermes-agent`: specialist profiles and memory.
- `pydantic-ai`: typed agent/service contracts where appropriate.
- `a2a-python`: agent-to-agent interoperability.
- `nats-server`: event transport when durable real-time messaging is needed.
- `n8n`: operational workflows and connectors.
- `posthog`: funnel/product analytics.
- `mautic`: lifecycle email/marketing automation where it fits the stores.
- `marketingskills`: reusable marketing playbooks.
- `plane`: task-board patterns or project management integration.
- `engineer-skills` and `superpowers`: implementation, testing, review, and delivery workflows.

Store-specific connectors should be isolated behind interfaces so Asset Ave and Dream Blvd can use different commerce systems without changing agent logic.

## Monetization Loop

```text
Discover -> Score -> Source -> Create -> QA -> Approve -> Launch
        -> Promote -> Sell -> Retain -> Measure -> Optimize -> Repeat
```

Every loop should produce measurable outcomes and feed those outcomes into product, pricing, campaign, retention, and agent-performance decisions.

## Rollout

### Phase 1: Control Plane

- agent registry;
- reporting hierarchy;
- side-effect policy;
- Slack cockpit;
- durable task and approval contracts.

### Phase 2: Store Data

- Asset Ave adapter;
- Dream Blvd adapter;
- normalized product/order/customer/inventory metrics;
- analytics ingestion.

### Phase 3: Revenue Automation

- product discovery;
- inventory monitoring;
- marketing campaigns;
- lifecycle email/SMS;
- social production;
- conversion optimization;
- customer-service triage.

### Phase 4: Q Commerce Command UI

- Supabase operational store;
- command-center APIs;
- executive dashboard;
- agent floor/org chart;
- approvals and task board;
- health and reporting views.

### Phase 5: Bounded Autonomy

Grant standing permissions only after enough successful supervised runs exist to define reliable limits. Autonomy should expand by action class, brand, budget, and risk level, never by giving all agents unrestricted credentials.

## Security and Reliability

- Do not commit API keys, tokens, customer data, Hermes memories, private paths, or Slack credentials.
- Give each integration the least privilege needed.
- Keep audit events for external side effects.
- Require idempotency keys for retriable commerce actions.
- Separate read credentials from write credentials when possible.
- Rate-limit outbound customer communications.
- Provide kill switches at agent, integration, campaign, brand, and whole-system levels.
- Preserve a human-readable rollback or recovery path for every approval-class action.

## Non-Goals for the First Slice

- Unrestricted autonomous spending.
- Fully autonomous public publishing.
- Replacing the storefront applications.
- Running every agent continuously.
- Treating attributed revenue as exact when the data only supports correlation.

The first objective is a trustworthy operating spine. More autonomy is earned through verified performance.