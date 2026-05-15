# Architecture

`Codex + Hermes Team` is an MCP server. It exposes a small tool surface to Codex, Claude Code, Cursor, and other MCP clients.

```text
MCP client
  -> Codex + Hermes Team
    -> Hermes CLI / profile runtime
      -> Hermes profiles
      -> optional Hermes Kanban board
      -> profile-local memory, tools, skills, and project context
```

The bridge has three layers:

1. MCP tools: stable interface used by coding assistants.
2. Hermes provider: command runner, profile discovery, one-shot questions, Kanban calls.
3. Team registry and routing: profile metadata, roles, capabilities, confidence, and panel selection.
4. Structured synthesis: role discovery maps, panel buckets, and Kanban result collection.

## Tool Modes

Fast mode:

```text
hermes_team_ask_agent
hermes_team_ask_panel
hermes_team_discover_roles
```

Fast mode uses Hermes one-shot calls. It is best for specialist advice, research direction, plan critique, review, and decision support.

Durable mode:

```text
hermes_team_create_task
hermes_team_get_task
hermes_team_collect_result
```

Durable mode uses Hermes Kanban. It is best for work that needs state, retries, handoff, comments, or completion reports.

## Safety Policy

Every specialist call carries a side-effect policy. The default is `advice_only`.

```text
advice_only
read_only
local_files_allowed
external_side_effects_need_approval
external_side_effects_allowed
```

The bridge passes the policy into the Hermes prompt and prepends it to durable Kanban task bodies. Dangerous external actions should require explicit approval unless the caller deliberately chooses `external_side_effects_allowed`.

## Non-Goals

- It is not a Codex model provider.
- It is not a replacement for Hermes.
- It does not copy profile memory into Codex.
- It does not make final decisions for the coding assistant.

Codex remains the operator and final integrator. Hermes profiles provide specialist context and durable work.
