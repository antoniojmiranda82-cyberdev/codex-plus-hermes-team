# Asset + Dream Agent Swarm Final Checkpoint

## Build status

The Asset Ave + Dream Blvd workforce is implemented as a separate project namespace: `asset-dream`.

### Operator and workforce
- Persistent operator tasks with queue, run, retry, block, complete, and approval states.
- Separate `asset-dream:*` agent identities and task-store path.
- Runtime rejects non-project agent profiles from Asset Ave/Dream Blvd work.
- Browser command center with business filters, workforce status, task creation, approvals, run/retry controls, and integration health.
- MCP operator tools for task lifecycle and agent status.

### Model/delegation lanes
- Codex integration/verification lane.
- Claude architecture/review lane.
- Cursor dashboard/integration lane.
- Hermes specialist execution lane.
- Perplexity research route supported through authorized/free routing.
- Grok-compatible route supported through the gateway/router layer.
- OpenAI-compatible gateway adapter with explicit error surfacing.

### Slack
- Connected Slack workspace verified.
- Live message delivery verified to the private agent activity channel.
- Project event routing implemented for approvals, activity, commerce summaries, and growth summaries.
- Real Slack channel IDs and tokens are not committed to the repository.

### Commerce
- Asset Ave Shopify connection verified with live catalog reads.
- Dream Blvd WordPress/WooCommerce admin connection verified on the connected Hostinger site.
- Shopify remains Asset Ave's product/inventory/price/order source of truth.
- WooCommerce remains Dream Blvd's product/stock/price/order source of truth.
- Platform-neutral commerce adapter contract implemented.
- Host-connector commerce bridge implemented so credentials stay outside the repository.

### Product autonomy
- Research and scoring can run autonomously.
- Strong candidates can progress to draft-product work automatically.
- Draft product creation and draft edits are permitted without owner approval.
- Product scoring includes margin, shipping, supplier quality, duplication, media, and category checks.
- Restricted categories are blocked from autonomous intake.
- Publishing, live price changes, archiving, deletion, paid spend, and customer-facing sends remain owner-approval gated.
- Approved external commerce writes are supported by the connector adapter after the operator records approval.

### Recovery
- All work is on `build/asset-dream-agent-swarm` and PR #2.
- No secrets, store credentials, private local paths, or persistent runtime data should be committed.
- Default runtime can fall back to mock execution if a model gateway is not configured.

## Final verification gate

Before merge, require the repository quality workflow on the current PR head to pass tests, typecheck, build, JSON validation, local Markdown-link validation, and leak/private-path scanning.

## Post-merge configuration only

These are deployment/configuration values, not unfinished application code:
- model gateway URL/key/model when a live external model route is desired;
- Slack bot token and project channel IDs for runtime-originated Slack reports;
- host connector bindings for Shopify and WooCommerce when running outside ChatGPT's connected-tool host;
- deployment target/domain if the dashboard is to be publicly hosted rather than local/private.

External writes remain approval-gated by design until the owner explicitly changes the policy.
