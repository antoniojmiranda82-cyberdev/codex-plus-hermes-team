# Q Commerce Workflow Events

Q Commerce uses normalized events so store adapters, agents, Slack reporting, n8n workflows, and the future command-center UI do not depend on each other's internal implementation.

## Event Envelope

Every event carries an event ID, timestamp, brand, agent, event type, severity, summary, structured payload, approval metadata when applicable, and a correlation ID linking the full business workflow.

## Core Flows

### Inventory Risk

`commerce.inventory.risk` is emitted when the Inventory Manager detects stockout or overstock risk. The brand GM receives the recommendation. If the proposed remedy is a purchase, the action is converted into an owner approval request before any store or supplier write occurs.

### Campaign Ready

`commerce.campaign.ready` means strategy, copy, creative instructions, audience, offer, and QA review are complete. It does not mean the campaign may publish. Public publishing, customer email/SMS sends, and paid spend still pass through the approval engine unless a bounded standing policy covers that exact action class.

### Customer Escalation

`commerce.customer.escalation` carries the customer-risk summary, sentiment, order/customer reference IDs, and recommended resolution. Customer-facing replies or unusual credits/refunds use the applicable approval and messaging policies.

### Approval Approved

`commerce.approval.approved` is the event that releases an already prepared external action to the execution workflow. The downstream executor must verify action class, kill-switch state, approval state, and idempotency key before performing a retriable write.

### Integration Failure

`commerce.integration.failure` describes an unhealthy dependency. Required integration failures are surfaced as critical system-health failures. Q Commerce must not silently substitute an unapproved alternate write path.

## n8n Bridge

`WebhookWorkflowTransport` can post normalized events to an approved HTTPS n8n webhook. Production webhook URLs and credentials belong in environment/secret configuration, never in git.

Recommended n8n pattern:

```text
Q Commerce Event
  -> Validate envelope
  -> Check correlation/idempotency
  -> Read approval + kill-switch state when action is external
  -> Route by event type
  -> Execute connector or create specialist task
  -> Emit result event
  -> Update Slack / dashboard read model
```

## NATS and A2A

NATS and A2A are optional transports behind the same event/task contracts. They should not change approval semantics. Transport replacement is allowed; business safety rules are not transport-specific.

## Retry Rules

- Exact event replays are deduplicated by event ID plus correlation ID at the workflow-publisher layer.
- Failed transport attempts may retry because the event is not recorded as published until transport succeeds.
- External writes use their own action-level idempotency keys in addition to event-level deduplication.
- A retry never upgrades permissions or bypasses an approval requirement.
