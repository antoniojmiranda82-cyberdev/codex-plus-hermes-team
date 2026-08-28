# Ollama + Obsidian Memory Integration Design

## Goal

Integrate the existing local `obsidian_handler` service with the Asset Ave + Dream Blvd operator so the `asset-dream:*` agent workforce can use local Ollama models for low-cost inference and Obsidian-backed project memory without exposing credentials or mixing identities with Q-Core or other projects.

## Current State

- `obsidian_handler` already provides a Node.js/TypeScript MCP server, a Python orchestrator, CouchDB/Self-Hosted LiveSync integration, and local Ollama calls.
- The handler currently hardcodes `qwen2.5:14b` and `http://localhost:11434/api/generate`.
- The local machine currently has these Ollama models installed:
  - `llama3.2:1b`
  - `mxbai-embed-large:latest`
- `codex-plus-hermes-team` already contains the isolated `asset-dream:*` operator, dashboard, provider routing, approvals, and project roster.

## Architecture

Keep `obsidian_handler` as a separate local MCP service rather than merging it into the operator repository.

```text
Asset/Dream Dashboard
        |
        v
Asset/Dream Operator
        |
        +--> Local Ollama provider
        |       |- llama3.2:1b
        |       `- mxbai-embed-large:latest
        |
        +--> Obsidian Memory Adapter
                |
                v
        obsidian_handler MCP
                |
                v
      CouchDB / LiveSync / Obsidian
```

The local machine remains the private memory and inference boundary. Vercel remains a lightweight dashboard surface and must not receive CouchDB credentials, LiveSync passphrases, or local Ollama secrets.

## Ollama Provider Requirements

1. Remove hardcoded model names from `obsidian_handler/python_src/config.py`.
2. Read model names and API URL from environment variables with safe defaults:
   - `OLLAMA_CHAT_MODEL=llama3.2:1b`
   - `OLLAMA_EMBED_MODEL=mxbai-embed-large:latest`
   - `OLLAMA_GENERATE_URL=http://127.0.0.1:11434/api/generate`
   - `OLLAMA_EMBED_URL=http://127.0.0.1:11434/api/embed`
3. Keep `llama3.2:1b` as the default local worker/chat model.
4. Keep `mxbai-embed-large:latest` as the default embedding model.
5. Add health checks that confirm Ollama is reachable and required models are present before memory workflows run.
6. Failure to reach Ollama must fail cleanly and must not corrupt or overwrite notes.

## Obsidian Memory Requirements

1. Keep CouchDB/Self-Hosted LiveSync as the existing vault transport.
2. Preserve the current safety behavior of leaving original notes intact.
3. New AI-generated material must be written to proposal/test notes until explicitly promoted by a human or approved workflow.
4. Add project-scoped paths/namespaces for the Asset Ave + Dream Blvd system.
5. The Asset/Dream operator may search/read only the project memory scope assigned to it.
6. No Q-Core, QST engineering, cybersecurity, or unrelated project agent identity may be reused for Asset/Dream memory operations.
7. Add a harmless end-to-end test note flow before enabling autonomous memory writes.

## Operator Integration Requirements

1. Add a focused memory adapter to `codex-plus-hermes-team` rather than embedding Obsidian/CouchDB logic directly in the operator core.
2. The adapter must expose clear operations for:
   - health
   - search
   - read
   - propose/write test note
3. All calls must assert `projectId === "asset-dream"`.
4. Agent IDs must remain in the `asset-dream:*` namespace.
5. Ollama is the primary local provider for suitable low-cost tasks.
6. Existing cloud providers remain fallback routes and are not removed.
7. Approval gates already used for customer-facing, destructive, paid, or live commerce actions remain unchanged.

## Security Requirements

1. Never commit CouchDB usernames, passwords, LiveSync encryption passphrases, tokens, API keys, or private machine paths.
2. Remove the tracked `.env` from `obsidian_handler` and replace it with a safe `.env.example`.
3. Ensure `.env` is covered by `.gitignore`.
4. Treat any values previously committed in `.env` as potentially exposed and rotate them before production use.
5. The Vercel dashboard must never directly connect to CouchDB or Ollama on localhost.
6. Any future remote bridge must use an authenticated private tunnel or a local operator relay, not a publicly exposed unauthenticated Ollama port.

## Health and Test Sequence

The integration is considered ready only when these checks pass in order:

1. Ollama process reachable at the configured local endpoint.
2. `llama3.2:1b` is present.
3. `mxbai-embed-large:latest` is present.
4. `obsidian_handler` MCP server starts successfully using stdio.
5. Python orchestrator imports and launches successfully.
6. Obsidian/CouchDB read test returns a known harmless test note.
7. Proposal/test write creates a new note without modifying the original.
8. Operator memory adapter can retrieve that test note under the `asset-dream` project scope.
9. Failure-path tests confirm unavailable Ollama or unavailable MCP returns a clear error without destructive writes.

## Deployment Boundary

- Local hardware: Ollama, `obsidian_handler`, CouchDB/LiveSync, local operator relay where required.
- Vercel: dashboard only.
- GitHub: code, tests, docs, examples, no live secrets.
- Slack: reporting and approvals only when explicitly enabled for this project.

## Non-Goals

- No Bedrock dependency.
- No public exposure of the Ollama port.
- No merging of Asset/Dream agent identities with other projects.
- No automatic overwrite of existing Obsidian notes.
- No removal of cloud-model fallback support.

## Success Criteria

A successful implementation lets an `asset-dream:*` worker retrieve project-scoped memory from Obsidian, use Ollama locally for appropriate inference, write only safe proposal/test memory by default, and continue operating when cloud-model spend is disabled, all without committing secrets or exposing the local runtime publicly.
