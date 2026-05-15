# Product Strategy

`Codex + Hermes Team` should not feel like a raw bridge. The product promise is:

> Codex gets a specialist team that already knows the user's context.

The durable advantage is not "more agents". It is better delegation discipline inside the user's normal coding workspace.

## Quality Model

Interaction quality depends on four things:

1. Profile quality: each Hermes profile has a clear role, memory, tools, and boundaries.
2. Routing quality: Codex asks the right profile, not the whole team every time.
3. Context packaging: the bridge sends enough task context without dumping irrelevant noise.
4. Synthesis quality: Codex treats agent answers as specialist input, verifies when needed, and returns one coherent answer.

The bridge should optimize for the full loop:

```text
route -> ask -> compare -> verify -> synthesize -> optionally remember
```

## Interaction Modes

### Explicit

User says:

```text
Ask Hermes.
Ask the legal agent.
Run this through my team.
Create a durable Hermes task.
```

This is safest and easiest to understand.

### Suggested

Codex detects that a specialist would help and asks briefly:

```text
This touches legal risk. I can ask your Hermes legal profile first.
```

Good for sensitive, expensive, or high-side-effect work.

### Automatic

Codex calls Hermes automatically when routing confidence is high and the task is safe:

- research/source requests;
- plan review;
- product positioning;
- design critique;
- finance/ROI sanity checks;
- code-review risk checks.

Automatic mode must stay conservative. Tiny edits and obvious local work should stay native.

### Durable

Codex creates a Hermes Kanban task when the work needs time, retries, workspace state, or a final report.

Examples:

- "research this ecosystem";
- "audit the repo";
- "prepare launch plan";
- "review legal/policy risk";
- "monitor this issue and report back".

## Memory

The bridge should not copy all Hermes memory into Codex. That would be noisy and risky.

Better model:

- Hermes profiles keep their own memory.
- Codex asks profiles through tools.
- Bridge keeps a small local cache of team metadata and recent task summaries.
- Optional `memory_search` can query Hermes/team memory when a user asks for past context.
- Optional `memory_write` should require explicit policy and should write only durable decisions, not raw chat.

Recommended memory tools for v2:

```text
hermes_team_memory_search
hermes_team_decision_write
hermes_team_recent_results
```

## Differentiators

### 1. Team Discovery

The bridge can inspect Hermes profiles and build a team map:

```text
profile -> role -> capabilities -> safe use cases -> forbidden actions
```

This lets a user install the tool and ask Codex:

```text
What can my Hermes team help with?
```

### 2. Routing Explainability

Every route decision should be explainable:

```json
{
  "selected": ["legal", "researcher"],
  "why": ["matched policy/legal terms", "needs sources"],
  "confidence": 0.82
}
```

### 3. Panel Mode With Disagreement

The bridge should not merely concatenate answers. It should help Codex find:

- agreement;
- disagreement;
- missing evidence;
- risk;
- next action.

### 4. Review Gates

Useful gates:

- `research_gate`: ask researcher before claims based on external facts.
- `review_gate`: ask reviewer before finalizing a risky patch or plan.
- `legal_gate`: ask legal profile before public promises, contracts, policies.
- `money_gate`: ask finance profile before pricing, spend, ROI claims.

### 5. Side-Effect Policy

Profiles may have tools that can post, message, buy, delete, deploy, or edit files.

The bridge should carry a per-call side-effect policy:

```text
advice_only
read_only
local_files_allowed
external_side_effects_need_approval
external_side_effects_allowed
```

Default should be `advice_only`.

### 6. Context Packs

Before asking a profile, Codex should send a clean context pack:

```text
task
user goal
repo/files involved
constraints
what Codex already knows
expected output
forbidden actions
```

This is more reliable than forwarding the entire conversation.

### 7. Team Playbooks

Ship ready workflows:

- `product_decision`: product + research + finance + reviewer.
- `code_plan`: architect + reviewer.
- `launch_offer`: marketer + business + finance + legal.
- `visual_landing`: designer + marketer + reviewer.
- `incident`: engineer + reviewer + coordinator.

### 8. Dogfood Config Without Leaks

The repo should include generic examples only. Personal configs stay in `*.local.yaml`.

## Recommended V1.5 Features

1. Cached team map from `hermes_team_discover_roles`
2. Dedicated `hermes_team_explain_route` wrapper if clients need a route-only UX
3. Streaming panel responses
4. Workspace allow/deny policy
5. `hermes_team_recent_results`
6. Team playbook tools for common panels
7. Codex skill with explicit/suggested/automatic modes
8. richer multilingual routing beyond the built-in Russian/English aliases

## Product Rule

The bridge should make Codex smarter, not slower.

Use Hermes when specialist context changes the answer. Stay native when Codex can safely handle the work directly.
