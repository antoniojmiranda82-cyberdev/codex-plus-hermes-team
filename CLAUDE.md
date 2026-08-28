# Claude Code Assignment — Asset Ave + Dream Blvd Agent Swarm

Work from `ops/ASSET_DREAM_DELEGATION.md`.

Your primary lane is architecture and review. Do not redesign the product from scratch.

## Immediate tasks
1. Inspect the current MCP server architecture and identify the smallest changes needed to support the Asset Ave + Dream Blvd operator skeleton.
2. Propose concrete TypeScript interfaces for:
   - BusinessId (`asset-ave` | `dream-blvd`)
   - AgentDescriptor
   - TaskRecord / TaskStatus
   - AgentRunResult
   - ApprovalRequirement
   - EventRecord / audit trail
   - SlackReporter interface with dry-run support
3. Verify agent/provider abstraction remains provider-neutral.
4. Identify failure modes for retries, duplicate execution, stale task state, malformed specialist output, provider outage, and unauthorized external side effects.
5. Review Cursor implementation changes against these contracts.
6. Add or improve tests where architecture/safety contracts are not protected.

## Constraints
- Keep external side effects approval-aware and auditable.
- Do not commit secrets, API keys, Slack tokens, real profile memory, sessions, or absolute private paths.
- Preserve current MCP compatibility for Codex, Claude Code, Cursor, and Hermes.
- Prefer incremental changes over a rewrite.
- Every completed batch must update a checkpoint under `checkpoints/` with tests run and remaining work.

## Done when
The core contracts are explicit, testable, provider-neutral, and safe for Cursor/Hermes lanes to build against.
