# Ollama + Obsidian Memory Checkpoint — 2026-08-28

## Goal

Make the isolated Asset Ave + Dream Blvd workforce local-first with Ollama and project-scoped Obsidian memory, without Bedrock and without exposing local credentials.

## Repositories and Branches

- Operator: `antoniojmiranda82-cyberdev/codex-plus-hermes-team`
  - branch: `build/ollama-obsidian-memory`
  - PR: `#3 Add Ollama-first Obsidian memory integration`
- Memory bridge: `antoniojmiranda82-cyberdev/obsidian_handler`
  - branch: `build/ollama-obsidian-memory`
  - PR: `#1 Build Ollama + Obsidian local memory bridge`

## Local Model Defaults

- Chat/worker: `llama3.2:1b`
- Embeddings: `mxbai-embed-large:latest`
- Ollama base URL: `http://127.0.0.1:11434`

## Memory Boundary

- Project ID: `asset-dream`
- Agent namespace: `asset-dream:*`
- Obsidian root: `Projects/asset-dream`
- Safe generated-note folder: `Projects/asset-dream/Proposals`
- Existing notes are not overwritten by autonomous memory flows.

## Implemented in `obsidian_handler`

- Environment-driven Ollama model and endpoint configuration.
- Ollama health/model-presence check before the Python compiler runs.
- Project-scoped path helpers that reject `..` escapes.
- Proposal-note generation using `propuesta-*` names.
- Python dependency declaration for `python-dotenv`.
- Python + Node GitHub Actions verification.
- `.env` removed from current tracking and safe `.env.example` added.
- Authenticated Streamable HTTP MCP documented for localhost operator access.
- Vendor type declarations added so existing Node source passes strict typecheck.

## Implemented in `codex-plus-hermes-team`

- `src/obsidian-memory.ts` project-scoped memory adapter.
- Authenticated Streamable HTTP MCP client for the local handler.
- Memory operations: health, search, read, propose.
- Search output filtering prevents unrelated vault paths from being returned.
- Operator tools:
  - `asset_dream_memory_health`
  - `asset_dream_memory_search`
  - `asset_dream_memory_read`
  - `asset_dream_memory_propose`
- Ollama provider metadata enabled by default with cloud routes preserved as fallback.
- Operator health includes memory-bridge configuration and provider metadata.
- Example workforce config uses `asset-dream:*` identities and local model/memory settings.

## Local Bridge Environment

Keep these values in the local `obsidian_handler/.env`. Never commit live values.

```env
hostname=http://127.0.0.1:5984
dbname=obsidian_vault
username=YOUR_LOCAL_COUCHDB_USER
password=YOUR_LOCAL_COUCHDB_PASSWORD
passphrase=YOUR_LIVESYNC_PASSPHRASE
MCP_API_KEY=USE_A_STRONG_LOCAL_TOKEN
MCP_TRANSPORT=http
MCP_PORT=3100
OLLAMA_CHAT_MODEL=llama3.2:1b
OLLAMA_EMBED_MODEL=mxbai-embed-large:latest
OLLAMA_GENERATE_URL=http://127.0.0.1:11434/api/generate
OLLAMA_EMBED_URL=http://127.0.0.1:11434/api/embed
OLLAMA_TAGS_URL=http://127.0.0.1:11434/api/tags
ASSET_DREAM_ROOT=Projects/asset-dream
OBSIDIAN_INBOX_DIR=01 - Inbox
OBSIDIAN_SCHEMA_FILE=SCHEMA.md
```

## Local Operator Environment

Use the same MCP API key value locally in the operator environment. Do not commit it.

```env
ASSET_DREAM_MEMORY_BRIDGE_URL=http://127.0.0.1:3100
ASSET_DREAM_MEMORY_BRIDGE_API_KEY=THE_SAME_VALUE_AS_MCP_API_KEY
ASSET_DREAM_MEMORY_ROOT=Projects/asset-dream
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_CHAT_MODEL=llama3.2:1b
OLLAMA_EMBED_MODEL=mxbai-embed-large:latest
```

## Windows Activation

In the local `obsidian_handler` folder:

```powershell
git fetch
git switch build/ollama-obsidian-memory
npm install
npm run build
python -m pip install -r requirements.txt
npm start
```

In another PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:3100/health
Invoke-RestMethod http://127.0.0.1:11434/api/tags
```

The default Obsidian layout is:

```text
Projects/
└── asset-dream/
    ├── SCHEMA.md
    ├── 01 - Inbox/
    └── Proposals/
```

## Verification Evidence Before This Checkpoint

- `obsidian_handler` GitHub Actions run `33216556069`: success for Python and Node jobs on commit `3dc25c44a019379ec64f16d15af33bd25b6155b5`.
- `codex-plus-hermes-team` repository-quality run `33216610860`: success for tests, typecheck, build, JSON checks, Markdown-link checks, and private/generated leak scan on commit `057961ae9a53897f4edab3b7b22f7f2a4e3dc7e2`.

A final operator CI run must be checked again after this checkpoint commit before declaring the branch ready.

## Security Follow-up

The handler previously tracked a `.env` file. It is removed from the current branch, but deletion does not erase old Git history. Treat any credentials that were ever stored there as exposed and rotate them before production use. Rewriting repository history is intentionally not performed without explicit approval because it is destructive to clones/forks.

## Remaining Machine-Side Verification

The code cannot reach the user's localhost from GitHub Actions. After pulling the branch locally, verify:

1. Ollama `/api/tags` lists both required models.
2. MCP `/health` succeeds locally.
3. Obsidian contains a harmless test note under `Projects/asset-dream`.
4. `asset_dream_memory_read` can retrieve that test note.
5. `asset_dream_memory_propose` creates a new note under `Projects/asset-dream/Proposals` without changing the source note.
