# Multi-model routing plan

This operator uses one task system and multiple specialist execution/review lanes. The goal is to increase throughput and resilience without creating separate task silos.

## Control plane

- `codex-plus-hermes-team`: orchestration, task state, approvals, checkpoints, and MCP surface.
- `new-api`: OpenAI-compatible upstream gateway for authorized models/providers.
- `claude-code-router`: optional local routing/failover/observability layer for coding agents and compatible clients.

## Agent lanes

### Codex
Use for integration, implementation, tests, CI fixes, repository changes, and final cross-lane verification.
Relevant repositories: `codex`, `project_openai_codex`.

### Claude Code
Use for architecture review, interface design, security/privacy review, failure-mode analysis, and secondary code review.
Relevant repositories: `claude-code`, `claude-code-router`, `claude-mem`, `free-claude-code`.

### Cursor
Use for dashboard/UI implementation, API client work, responsive UX, integration plumbing, and focused refactors.
Cursor consumes the repository rules under `.cursor/rules/` and shares the same operator task contracts.

### Hermes
Use as the persistent specialist workforce for Asset Ave and Dream Blvd: commerce, growth, analytics, operations, QA, and architecture specialists.
Hermes remains behind the existing team bridge and uses the shared operator task model.

### Perplexity
Use for research-heavy tasks, current web research, competitor discovery, market/SEO research, evidence gathering, and research QA.
Candidate repositories: `perplexity-ai`, `perplexity-super-skills`, `omniplex`, `llm-answer-engine`, `opensearch-ai`, `turboseek`.

Only authorized/free search paths are allowed. Do not use account-generation, query-limit bypass, credential harvesting, or other access-evasion functionality. Prefer official/authorized access, anonymous free modes where legitimately supported, or user-provided authorized credentials.

### Grok
Use as an alternate reasoning/review lane when an authorized Grok/xAI-compatible provider or CLI is available through the gateway/router. Do not assume a dedicated local Grok repository exists merely from naming. `claude-code-router` documents Grok CLI support and can serve as the compatible routing/control surface.

## Routing rules

1. Research/current facts -> Perplexity research lane first, then specialist synthesis.
2. Architecture/security/failure modes -> Claude review lane.
3. UI/dashboard/API client -> Cursor lane.
4. Business execution/planning -> Hermes specialist lane.
5. Integration/tests/repository commits -> Codex lane.
6. High-impact decisions -> obtain at least two independent model/agent reviews before approval.
7. Provider outage/rate limit -> fail over through the configured gateway/router rather than rewriting agents.
8. External side effects remain approval-gated regardless of model/provider.

## Shared-state rule

Every lane must read and write through the same operator task identifiers and checkpoint files. No agent may maintain a separate hidden source of truth for business task status.

## Cost policy

- Prefer mock/local/free-authorized modes for development and tests.
- Prefer lower-cost/free-tier authorized providers for routine classification, drafting, research triage, and summaries.
- Escalate to stronger models for architecture, hard debugging, consequential business decisions, or failed lower-cost attempts.
- Never treat a repository named `free-*` as proof that upstream usage is actually free or authorized.

## Safety and publishing policy

The following always require explicit approval before external execution: publishing site changes, campaign sends, SMS/email blasts, refunds, price changes, ad spend, destructive catalog operations, credentials/secrets changes, and Dream Blvd publication.
