# Ollama + Obsidian Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Asset Ave + Dream Blvd operator local-first with Ollama and project-scoped Obsidian memory through the existing `obsidian_handler` MCP service.

**Architecture:** Keep `obsidian_handler` as a separate local service. Make its Ollama configuration environment-driven, add safe health and proposal-note behavior, then add a narrow HTTP/MCP memory adapter in `codex-plus-hermes-team` that asserts `projectId === "asset-dream"` and `asset-dream:*` agent IDs.

**Tech Stack:** Python 3.10+, Node.js 20+, TypeScript, MCP SDK, Ollama HTTP API, CouchDB/Self-Hosted LiveSync, Vitest, Python unittest, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-28-ollama-obsidian-memory-integration-design.md`

## Global Constraints

- Default chat model: `llama3.2:1b`.
- Default embedding model: `mxbai-embed-large:latest`.
- Ollama remains bound to localhost/private networking; no public unauthenticated exposure.
- Asset/Dream calls must use `projectId === "asset-dream"` and agent IDs beginning with `asset-dream:`.
- Existing Obsidian notes are never overwritten by autonomous flows.
- Generated memory is proposal/test content by default.
- No CouchDB passwords, LiveSync passphrases, tokens, API keys, or private machine paths may be committed.

---

### Task 1: Harden `obsidian_handler` configuration and secret handling

**Files:**
- Modify: `obsidian_handler/python_src/config.py`
- Modify: `obsidian_handler/python_src/llm_client.py`
- Create: `obsidian_handler/python_src/health.py`
- Create: `obsidian_handler/tests/test_config_and_health.py`
- Create: `obsidian_handler/.env.example`
- Modify: `obsidian_handler/requirements.txt`
- Delete from Git tracking: `obsidian_handler/.env`
- Create: `obsidian_handler/.github/workflows/test.yml`

**Interfaces:**
- Produces: `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBED_MODEL`, `OLLAMA_GENERATE_URL`, `OLLAMA_EMBED_URL`, `OLLAMA_TAGS_URL`.
- Produces: `check_ollama_health() -> dict` with `ok`, `chat_model`, `embed_model`, `missing_models`, `error`.

- [ ] Write tests proving environment overrides and default model values.
- [ ] Write tests proving health reports missing models without raising.
- [ ] Run CI and verify RED because the new configuration/health API does not exist yet.
- [ ] Implement environment-driven configuration and Ollama health check.
- [ ] Update `llm_client.py` to use `OLLAMA_CHAT_MODEL` and configured URL.
- [ ] Add `python-dotenv` to `requirements.txt`.
- [ ] Add safe `.env.example`, keep `.env` ignored, remove tracked `.env` from the branch.
- [ ] Run CI and verify GREEN.

### Task 2: Add safe project-scoped Obsidian proposal flow

**Files:**
- Modify: `obsidian_handler/python_src/main.py`
- Create: `obsidian_handler/python_src/scope.py`
- Create: `obsidian_handler/tests/test_scope.py`

**Interfaces:**
- Produces: `asset_dream_path(relative: str) -> str` rooted under `Projects/asset-dream`.
- Produces: `proposal_path(source_path: str) -> str` that creates a new proposal note path and never returns the source path.

- [ ] Write tests for path scoping and non-overwrite proposal paths.
- [ ] Verify RED in CI.
- [ ] Implement the scope helpers and update the orchestrator to use proposal paths.
- [ ] Verify GREEN in CI.

### Task 3: Add operator-side Obsidian memory adapter

**Files:**
- Create: `codex-plus-hermes-team/src/obsidian-memory.ts`
- Create: `codex-plus-hermes-team/tests/obsidian-memory.test.ts`
- Modify: `codex-plus-hermes-team/src/operator-tools.ts`
- Modify: `codex-plus-hermes-team/src/operator-server.ts`

**Interfaces:**
- Produces: `ObsidianMemoryAdapter` with `health`, `search`, `read`, `propose` operations.
- Every operation consumes `{ projectId: "asset-dream", agentId: string }` and rejects non-`asset-dream:*` identities.
- Remote endpoint is supplied by `ASSET_DREAM_MEMORY_BRIDGE_URL`; no credentials embedded in code.

- [ ] Write failing Vitest coverage for project and agent isolation, URL construction, and safe proposal operations.
- [ ] Run repository CI and verify RED.
- [ ] Implement adapter and expose MCP operator tools.
- [ ] Run tests, typecheck, build, and verify GREEN.

### Task 4: Add local-first Ollama provider health/routing metadata

**Files:**
- Modify: `codex-plus-hermes-team/src/provider-health.ts`
- Create or modify: `codex-plus-hermes-team/tests/provider-health.test.ts`
- Modify: `codex-plus-hermes-team/ops/team.asset-dream.example.yaml`

**Interfaces:**
- `ollama` provider metadata uses `http://127.0.0.1:11434` by default for local execution.
- Chat model default `llama3.2:1b`; embeddings default `mxbai-embed-large:latest`.
- Cloud providers remain available as fallback metadata.

- [ ] Write failing tests for Ollama defaults and configured/unconfigured health semantics.
- [ ] Verify RED.
- [ ] Implement minimal provider metadata changes.
- [ ] Verify GREEN with full operator suite.

### Task 5: Recovery checkpoint and PR verification

**Files:**
- Create: `codex-plus-hermes-team/checkpoints/2026-08-28-ollama-obsidian-memory.md`
- Update: `obsidian_handler/README.md`
- Update: `codex-plus-hermes-team/README.md` only where needed for local setup.

**Interfaces:**
- Checkpoint records branches, environment variable names, local commands, safety boundaries, and remaining machine-side verification.

- [ ] Document exact Windows setup commands without secrets.
- [ ] Confirm no `.env` or secret values are present in diffs.
- [ ] Run final CI/status checks on both repositories.
- [ ] Open PRs for both repositories with cross-links and explicit local verification steps.
