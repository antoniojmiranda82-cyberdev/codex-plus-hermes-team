# Asset/Dream Direct Obsidian MCP

The Asset/Dream operator uses the Obsidian `Vault as MCP` plugin directly for project memory.

## Runtime path

```text
Asset/Dream operator -> Vault as MCP -> Obsidian vault
```

The previous CouchDB/LiveSync handler is not required for this path.

## Local environment

```env
ASSET_DREAM_OBSIDIAN_MCP_URL=http://localhost:27123/mcp
ASSET_DREAM_OBSIDIAN_MCP_TOKEN=YOUR_LOCAL_BEARER_TOKEN
ASSET_DREAM_MEMORY_ROOT=Projects/asset-dream
```

Never commit the Bearer token. Keep Vault as MCP in read-only mode during initial validation.

Legacy environment names remain accepted temporarily:

- `ASSET_DREAM_MEMORY_BRIDGE_URL`
- `ASSET_DREAM_MEMORY_BRIDGE_API_KEY`

## Memory boundary

Only `asset-dream:*` agents may use this adapter. All reads and searches are scoped under `Projects/asset-dream`. Generated proposals are written only under `Projects/asset-dream/Proposals`.

## Tool mapping

- health: `list_notes`
- search: `search_notes`
- read: `read_note`
- proposal creation: `create_note`

The direct MCP endpoint uses Streamable HTTP with Bearer authentication.
