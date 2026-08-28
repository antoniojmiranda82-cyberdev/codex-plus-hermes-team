# Checkpoint: Dashboard + API

Date: 2026-08-28
Branch: `build/asset-dream-agent-swarm`

## Completed

- Persistent operator task storage from previous slice.
- Dashboard snapshot model with per-business task metrics.
- Agent workload/status projection for Asset Ave and Dream Blvd specialists.
- Local browser dashboard served on `127.0.0.1:4177` by default.
- JSON API endpoint: `GET /api/snapshot`.
- Task creation endpoint: `POST /api/tasks`.
- Approval/run/retry endpoints under `POST /api/tasks/:id/:action`.
- Business filter, workforce cards, task queue, approvals and retry controls in the UI.
- Dashboard refresh every 5 seconds.
- Gateway executor remains optional and provider-neutral.

## Run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run dev:dashboard
```

Then open:

```text
http://127.0.0.1:4177
```

## Environment

- `OPERATOR_TASK_STORE` optional JSON store path.
- `OPERATOR_DASHBOARD_PORT` optional port, default `4177`.
- `AGENT_GATEWAY_BASE_URL`, `AGENT_GATEWAY_API_KEY`, `AGENT_GATEWAY_MODEL` enable the OpenAI-compatible gateway executor.
- Without gateway variables, the operator uses the mock executor.

## Safety

- External side effects remain approval-gated.
- No secrets are committed.
- Dashboard binds to loopback by default.

## Next

1. Verify CI is green for dashboard/API slice.
2. Add Slack reporter implementation behind explicit configuration and dry-run default.
3. Reconcile live Slack agent display names without changing internal stable profiles.
4. Add event/audit log feed to dashboard.
5. Add provider/routing health status for new-api / Claude Code Router / Hermes / research lanes.
6. Add production deployment path after local operator is verified.
