# Direct Obsidian Vault MCP Checkpoint — 2026-08-28

## Decision

Asset/Dream no longer depends on CouchDB or `obsidian_handler` for primary Obsidian access.

Primary memory path:

```text
Asset/Dream operator
  -> Vault as MCP (Obsidian plugin)
    -> Obsidian vault
```

Nexus and Vault Operator may remain installed as companion agent layers inside Obsidian. Claude Desktop can be added later as another MCP client, but it is not required for the Asset/Dream operator to use the vault.

## Verified Local Facts From User Session

- Vault as MCP server is enabled in Obsidian.
- Local server port: `27123`.
- Windows showed port `27123` in `Listen` state.
- The vault-generated `.mcp.json` uses HTTP plus Bearer authentication.
- The MCP endpoint is `http://localhost:27123/mcp`.
- Codex CLI is installed and reports version `0.147.0`.
- Nexus is installed and can use Codex inside Obsidian.
- Ollama remains the local-first model layer.

## Security

Do not commit the Bearer token from `.mcp.json`.

The token was visible in a screenshot during setup, so rotate/regenerate it before production use. Keep Vault as MCP in read-only mode while validating the connection. Enable writes only when proposal-note creation is intentionally tested.

## Operator Environment

Keep these values local and never commit the token:

```env
ASSET_DREAM_OBSIDIAN_MCP_URL=http://localhost:27123/mcp
ASSET_DREAM_OBSIDIAN_MCP_TOKEN=YOUR_ROTATED_LOCAL_TOKEN
ASSET_DREAM_MEMORY_ROOT=Projects/asset-dream
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_CHAT_MODEL=llama3.2:1b
OLLAMA_EMBED_MODEL=mxbai-embed-large:latest
```

Legacy `ASSET_DREAM_MEMORY_BRIDGE_URL` and `ASSET_DREAM_MEMORY_BRIDGE_API_KEY` remain accepted temporarily for backwards compatibility, but new setups should use the direct Obsidian MCP names above.

## Vault Tool Mapping

The Asset/Dream adapter now maps to Vault as MCP tools:

- health -> `list_notes`
- search -> `search_notes` scoped with `folder=Projects/asset-dream`
- read -> `read_note`
- proposal creation -> `create_note` under `Projects/asset-dream/Proposals`

The operator still rejects non-`asset-dream:*` agent identities and parent-path escapes.

## Tomorrow's Machine-Side Test

After rotating the Vault as MCP token and keeping Obsidian open:

1. Start the Asset/Dream operator with the local environment above.
2. Call `asset_dream_memory_health` with an `asset-dream:*` agent.
3. Search and read a harmless note under `Projects/asset-dream`.
4. Only after read tests pass, turn Vault as MCP read-only mode off temporarily and test `asset_dream_memory_propose`.
5. Confirm the generated note lands only under `Projects/asset-dream/Proposals`.

No CouchDB installation is required for this path.
