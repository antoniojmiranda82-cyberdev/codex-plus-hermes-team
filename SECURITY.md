# Security Policy

## Supported versions

This repository is pre-1.0. Use the latest `main` branch unless a tagged release states otherwise.

## Reporting a vulnerability

Please do not open public issues for secrets, token leaks, profile-memory exposure, command-injection findings, or other sensitive security reports.

Send a private report to the maintainer:

- GitHub private vulnerability reporting, if enabled for the repository: https://github.com/AlekseiUL/codex-plus-hermes-team/security/advisories/new
- If private vulnerability reporting is unavailable, send only a short non-sensitive contact request through the maintainer's public channels first. Do not paste secrets or exploit details into public comments or public chats.

Include:

- affected version or commit;
- operating system;
- Node.js version;
- Hermes Agent version if relevant;
- minimal reproduction steps;
- impact and whether secrets, memories, logs, profile directories, or external side effects are involved.

Do not include real API keys, bot tokens, private memories, customer data, or full local profile dumps.

## Security model

`codex-plus-hermes-team` is designed as a local-first MCP bridge:

- MCP communication is over stdio;
- the bridge calls the local `hermes` command;
- it does not run an HTTP server;
- it does not upload profile memory, task databases, logs, prompts, or profile metadata by itself;
- personal configs should live outside the repository or in ignored `*.local.yaml` files.

## Side-effect boundaries

The bridge carries side-effect policies into specialist prompts and durable task bodies:

- `advice_only`;
- `read_only`;
- `local_files_allowed`;
- `external_side_effects_need_approval`;
- `external_side_effects_allowed`.

These policies are guardrails, not a sandbox. Configure Hermes profiles separately to block destructive commands, posting, purchases, deployments, deletes, and external messages unless the user explicitly approves them.

## What not to commit

Do not commit:

- `.env` files;
- API keys, bearer tokens, bot tokens, SSH keys, cookies, or credentials;
- real Hermes profile directories;
- profile memories, session exports, logs, or task databases;
- private `team.yaml` files;
- absolute local paths that reveal private workspaces;
- generated caches such as `node_modules`, `dist`, coverage output, or package tarballs.
