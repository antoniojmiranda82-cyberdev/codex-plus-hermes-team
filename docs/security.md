# Security And Privacy

The bridge is designed to run locally by default.

## Defaults

- It calls the local `hermes` command.
- It communicates with MCP clients over stdio.
- It does not expose an HTTP server.
- It does not upload logs, prompts, or profile metadata by itself.

Your Hermes profiles may still use remote model providers, external tools, or gateway integrations depending on your own Hermes configuration. Treat prompts and profile outputs as sensitive and configure providers accordingly.

## What Not To Commit

Do not publish:

- real Hermes profile directories;
- private `team.yaml` files;
- `.env` files;
- API keys;
- personal memories, logs, sessions, or Kanban databases;
- absolute paths that reveal private projects.

Use `*.local.yaml` for personal config. These files are ignored by default.

## Side Effects

`hermes_team_ask_agent`, `hermes_team_ask_panel`, and Kanban task creation carry a side-effect policy. The default is `advice_only`.

Policies:

- `advice_only`: do not use tools or mutate state.
- `read_only`: read/search only.
- `local_files_allowed`: local file changes only when explicitly requested.
- `external_side_effects_need_approval`: prepare external actions, then ask for approval.
- `external_side_effects_allowed`: external actions only when explicitly requested.

This is a guardrail, not a sandbox.

For sensitive teams, create profile-specific rules that block posting, purchases, destructive commands, or external messages without explicit human approval.

## Remote Hermes

This initial version targets local Hermes CLI usage. If you add a remote provider later, require:

- explicit base URL;
- strong auth;
- redacted logs;
- workspace policy;
- clear side-effect boundaries.
