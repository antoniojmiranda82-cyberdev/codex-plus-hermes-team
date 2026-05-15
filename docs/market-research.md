# Market Research

Checked on 2026-05-15.

## Signals

- MCP is a real and crowded integration layer. The official TypeScript SDK is active, and large curated lists already track many MCP servers.
- Hermes Agent already supports MCP as an inbound tool layer: Hermes can load external tools from stdio and HTTP MCP servers.
- Hermes Kanban creates a stronger opportunity than a simple bridge: it gives named profiles durable tasks, comments, retries, audit history, and human-in-the-loop collaboration.
- A related project exists: `myc0576/codex-hermes-bridge`. It focuses on Codex delegating bounded Hermes runs through the Hermes Runs API.

## Positioning

`Codex + Hermes Team` should not compete as "another Codex to Hermes bridge." The sharper category is:

> A team layer that lets Codex discover, route to, consult, and delegate to a user's Hermes specialist profiles.

The difference is profile awareness:

- list the user's Hermes team;
- route by role and capability;
- ask one specialist or a panel;
- create durable Kanban tasks;
- preserve Codex as the final integrator.

## Product Risk

- The audience is narrow: advanced Codex/Hermes users, not mainstream GitHub users.
- MCP security concerns mean side-effect policy and install transparency matter.
- Install friction can kill adoption, so `init-config`, `doctor`, examples, and a demo are core product features, not extras.

## Verdict

Interesting if shipped as a polished workflow product. Boring if shipped as only a thin transport wrapper.

The strongest launch story is:

> Bring your existing Hermes team into Codex, with specialist routing, panels, durable tasks, and safe defaults.

## Sources

- https://github.com/modelcontextprotocol/typescript-sdk
- https://github.com/appcypher/awesome-mcp-servers
- https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/mcp.md
- https://hermes-agent.ru/docs/user-guide_features_kanban.html
- https://github.com/myc0576/codex-hermes-bridge
