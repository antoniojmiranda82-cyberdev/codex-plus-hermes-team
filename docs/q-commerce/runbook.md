# Q Commerce Operator Runbook

## Start-of-Day Checks

1. Confirm the Q Chief of Staff, both brand GMs, Technology Director, Risk & Compliance Agent, and Automation Engineer are healthy.
2. Check required integrations for Asset Ave and Dream Blvd.
3. Confirm there is no system or brand kill switch unexpectedly enabled.
4. Review critical alerts before routine reports.
5. Review the CEO approval queue.
6. Confirm store-data freshness before trusting revenue, profit, inventory, or order metrics.

## Approval Review

Before approving an external action, verify:

- requesting worker and brand;
- explicit action class;
- expected upside;
- downside/risk;
- estimated cost if any;
- rollback path;
- idempotency key for retriable writes;
- relevant campaign/store/integration kill switches are not active.

Approval authorizes the described action, not a broader category of actions.

## Emergency Stop

A system-level kill switch must stop external write-class actions while leaving safe read-only monitoring available where possible.

Use emergency stop for situations such as:

- unexplained spend acceleration;
- repeated customer messages;
- wrong prices being written;
- duplicated supplier orders;
- storefront deployment incident;
- suspected credential compromise;
- automation loop producing unintended side effects.

After stopping writes:

1. Preserve event/task evidence.
2. Identify the correlation ID of the first bad action.
3. Disable the narrowest failing integration/agent/campaign in addition to the global stop when known.
4. Validate rollback/recovery.
5. Resume read-only monitoring first.
6. Resume external writes only after the cause is understood and the affected workflow has been tested.

## Model / Context Handoff

If a worker model reaches a context/token limit or needs a different capability:

1. Checkpoint the durable task state.
2. Record `context_exhausted` or `handoff` in model history.
3. Preserve objective, input/output summary, current blocker, next action, evidence, and artifacts.
4. Route the next invocation through OmniRouter or assign another configured worker/model.
5. The new model reads durable task state instead of reconstructing the job from chat history.
6. Keep the same task ID and correlation ID through the handoff.

## Store Connector Failure

If Shopify or WordPress/WooCommerce reads fail, mark affected metrics stale. Do not display prior values as current without a stale indicator.

If writes fail, do not silently try another credential, account, or platform. Emit an integration-failure event and keep the external action unresolved until the approved write path is healthy or the owner changes the plan.

## Slack Reporting

- `executive-command`: owner briefs, critical issues, major cross-brand opportunities.
- `ceo-approvals`: structured external-action approvals.
- `asset-ave-ops`: Asset Ave GM operations.
- `dream-blvd-ops`: Dream Blvd GM operations.
- `agent-activity`: routine task lifecycle and worker events.

Owner channels should stay low-noise. Routine worker events do not belong in the executive lane.

## Credential Rotation

Credentials belong in the deployment secret manager/environment. After rotation:

1. Update the secret reference.
2. Run connector health in read-only mode.
3. Confirm least-privilege scopes.
4. Test one non-destructive read.
5. Re-enable approved writes only after health is confirmed.
6. Never commit the replacement secret to git or a handoff ZIP.

## Release Gate

Before promoting a control-plane release:

```text
npm test
npm run typecheck
npm run build
git diff --check
```

Also verify no private identifiers/secrets are committed, store writes remain approval-gated, both brands are covered, and the emergency stop still blocks write actions.

## Current Integration State

The initial Asset Ave and Dream Blvd adapters are safe shells. They expose platform identity and health/configuration state but intentionally keep write capabilities empty until approved live credentials/scopes are supplied through secure deployment configuration.
