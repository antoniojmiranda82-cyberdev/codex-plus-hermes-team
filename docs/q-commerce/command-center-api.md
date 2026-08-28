# Q Commerce Command API Contract

The visual headquarters consumes normalized control-plane read models. It must not read Hermes memory, store credentials, or provider secrets directly.

## Read Models

### Executive Snapshot

Returns generated timestamp, Asset Ave and Dream Blvd metrics, active/blocked worker counts, pending approvals, critical alerts, opportunities, and write-pause state.

### Agents

Each agent exposes:

```text
id
name
role
manager
brand scope
status
current task
capabilities
last heartbeat
performance snapshot
```

Statuses are `active`, `working`, `waiting`, `blocked`, or `offline` in the dashboard projection. Durable task status is tracked separately.

### Tasks

Each task exposes its durable checkpoint record: task ID, correlation ID, brand, worker, status, objective, input/output summaries, blocker, next action, artifacts, evidence, model history, and update time.

### Events

Events use the normalized `CommerceEvent` envelope and support pagination by time/event ID. Consumers must be able to identify stale data and repeated events.

### Approvals

Pending approval records expose the requested action class, brand, worker, summary, expected upside, downside/risk, estimated cost, rollback, idempotency key where applicable, created time, and decision state.

### System Health

Returns required-integration failures, degraded optional integrations, write-pause state, active kill switches, and last successful heartbeat for major services.

## Owner Commands

The UI may issue these commands to the control plane. The UI itself does not perform the external business action.

```text
approve approval
reject approval
pause agent
resume agent
pause brand automation
resume brand automation
pause integration writes
resume integration writes
emergency stop all writes
resume all writes
```

Every command produces an audit event with the owner command, target scope, timestamp, correlation ID, and resulting state.

## Realtime Behavior

A production UI should subscribe to realtime event/read-model updates using Supabase Realtime, NATS-derived gateway updates, Server-Sent Events, or another transport chosen by the command-center application. Transport choice must preserve event ordering metadata and stale-state indicators.

## Recovery Behavior

If the realtime stream disconnects:

1. Mark the affected panels stale.
2. Reconnect without issuing write commands.
3. Fetch a fresh dashboard snapshot.
4. Resume incremental events from the last acknowledged cursor when supported.
5. Never infer that a pending approval was approved because the connection dropped.

## Security Boundary

The command center receives display-safe operational data. Provider keys, Slack tokens, Shopify/WooCommerce secrets, customer payment details, Hermes memory, and unrestricted execution credentials stay server-side.
