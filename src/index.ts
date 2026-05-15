#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getConfigPath, loadConfig } from "./config.js";
import { resolveSideEffectPolicy, withSideEffectPolicy } from "./policy.js";
import { HermesCliProvider } from "./providers/hermes-cli.js";
import { mergeAgents } from "./registry.js";
import { routeAgents } from "./router.js";
import {
  buildPanelPrompt,
  buildRoleDiscoveryPrompt,
  collectKanbanResult,
  normalizeRoleDiscovery,
  synthesizePanel
} from "./structured.js";
import { SideEffectPolicySchema, type BridgeConfig, type TeamAgent } from "./types.js";

const cliCommand = process.argv[2];

if (cliCommand && cliCommand !== "serve") {
  process.exit(await runCli(cliCommand));
}

const server = new McpServer({
  name: "codex-plus-hermes-team",
  version: "0.1.0"
});

server.tool("hermes_team_health", {}, async () => {
  const { provider, config } = runtime();
  const health = await provider.health();
  return jsonContent({
    ...health,
    config: {
      discoveryEnabled: config.discovery.enabled,
      kanbanEnabled: config.kanban.enabled,
      profilePrefix: config.discovery.profilePrefix ?? null,
      defaultSideEffectPolicy: config.safety.defaultSideEffectPolicy
    }
  });
});

server.tool("hermes_team_list_agents", {}, async () => {
  const { provider, config } = runtime();
  const agents = await listAgents(config, provider);
  return jsonContent({
    agents: agents.map(publicAgent)
  });
});

server.tool(
  "hermes_team_route",
  {
    task: z.string().min(1),
    maxAgents: z.number().int().positive().max(12).optional()
  },
  async ({ task, maxAgents }) => {
    const { provider, config } = runtime();
    const agents = await listAgents(config, provider);
    const decision = routeAgents(agents, task, {
      maxAgents: maxAgents ?? config.routing.maxPanelAgents,
      defaultProfiles: config.routing.defaultProfiles
    });

    return jsonContent({
      selected: decision.selected.map(publicAgent),
      confidence: decision.confidence,
      why: decision.why,
      routeMode: decision.routeMode,
      scores: decision.scores
    });
  }
);

server.tool(
  "hermes_team_ask_agent",
  {
    profile: z.string().min(1),
    prompt: z.string().min(1),
    sideEffectPolicy: SideEffectPolicySchema.optional(),
    timeoutMs: z.number().int().positive().optional()
  },
  async ({ profile, prompt, sideEffectPolicy, timeoutMs }) => {
    const { provider } = runtime();
    const result = await provider.askAgent({ profile, prompt, sideEffectPolicy, timeoutMs });
    return jsonContent(result);
  }
);

server.tool(
  "hermes_team_discover_roles",
  {
    profiles: z.array(z.string().min(1)).optional(),
    maxAgents: z.number().int().positive().max(12).optional(),
    timeoutMs: z.number().int().positive().optional()
  },
  async ({ profiles, maxAgents, timeoutMs }) => {
    const { provider, config } = runtime();
    const agents = await listAgents(config, provider);
    const agentsByProfile = new Map(agents.map((agent) => [agent.profile, agent]));
    const selectedAgents = (profiles && profiles.length > 0
      ? profiles.map((profile) => agentsByProfile.get(profile) ?? minimalAgent(profile))
      : agents
    ).slice(0, maxAgents ?? 12);

    const roles = await Promise.all(
      selectedAgents.map(async (agent) => {
        try {
          const result = await provider.askAgent({
            profile: agent.profile,
            prompt: buildRoleDiscoveryPrompt(agent.profile),
            sideEffectPolicy: "advice_only",
            timeoutMs
          });
          return normalizeRoleDiscovery(agent, result);
        } catch (error) {
          return {
            profile: agent.profile,
            displayName: agent.displayName ?? agent.profile,
            configuredRole: agent.role ?? null,
            configuredCapabilities: agent.capabilities,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    return jsonContent({
      profiles: selectedAgents.map((agent) => agent.profile),
      roles
    });
  }
);

server.tool(
  "hermes_team_ask_panel",
  {
    task: z.string().min(1),
    profiles: z.array(z.string().min(1)).optional(),
    maxAgents: z.number().int().positive().max(12).optional(),
    sideEffectPolicy: SideEffectPolicySchema.optional(),
    timeoutMs: z.number().int().positive().optional()
  },
  async ({ task, profiles, maxAgents, sideEffectPolicy, timeoutMs }) => {
    const { provider, config } = runtime();
    const agents = await listAgents(config, provider);
    const policy = resolveSideEffectPolicy(sideEffectPolicy, config.safety.defaultSideEffectPolicy);
    const routeDecision = routeAgents(agents, task, {
      maxAgents: maxAgents ?? config.routing.maxPanelAgents,
      defaultProfiles: config.routing.defaultProfiles
    });
    const selectedProfiles =
      profiles && profiles.length > 0
        ? profiles
        : routeDecision.selected.map((agent) => agent.profile);

    const max = Math.min(maxAgents ?? config.routing.maxPanelAgents, config.routing.maxPanelAgents);
    const limitedProfiles = selectedProfiles.slice(0, max);
    const responses = await Promise.all(
      limitedProfiles.map((profile) =>
        provider.askAgent({
          profile,
          prompt: buildPanelPrompt(task, policy),
          sideEffectPolicy: policy,
          timeoutMs
        })
      )
    );

    return jsonContent({
      task,
      sideEffectPolicy: policy,
      profiles: limitedProfiles,
      route:
        profiles && profiles.length > 0
          ? null
          : {
              confidence: routeDecision.confidence,
              why: routeDecision.why,
              routeMode: routeDecision.routeMode,
              scores: routeDecision.scores
            },
      synthesis: synthesizePanel(task, responses),
      responses
    });
  }
);

server.tool(
  "hermes_team_inspect_agent",
  {
    profile: z.string().min(1),
    timeoutMs: z.number().int().positive().optional()
  },
  async ({ profile, timeoutMs }) => {
    const { provider } = runtime();
    const result = await provider.askAgent({
      profile,
      timeoutMs,
      sideEffectPolicy: "advice_only",
      prompt:
        "Describe your specialist role, what kinds of tasks Codex should ask you, what you should not be asked, and your preferred output format. Keep it under 180 words. Do not use tools or perform side effects."
    });
    return jsonContent(result);
  }
);

server.tool(
  "hermes_team_create_task",
  {
    title: z.string().min(1),
    body: z.string().min(1),
    assignee: z.string().min(1).optional(),
    parent: z.string().min(1).optional(),
    priority: z.string().min(1).optional(),
    workspace: z.string().min(1).optional(),
    sideEffectPolicy: SideEffectPolicySchema.optional(),
    idempotencyKey: z.string().min(1).optional()
  },
  async (input) => {
    const { provider, config } = runtime();
    const { sideEffectPolicy, ...taskInput } = input;
    const policy = resolveSideEffectPolicy(sideEffectPolicy, config.safety.defaultSideEffectPolicy);
    const task = await provider.createKanbanTask({
      ...taskInput,
      body: withSideEffectPolicy(taskInput.body, policy)
    });
    return jsonContent({
      sideEffectPolicy: policy,
      task
    });
  }
);

server.tool(
  "hermes_team_get_task",
  {
    taskId: z.string().min(1)
  },
  async ({ taskId }) => {
    const { provider } = runtime();
    const task = await provider.getKanbanTask(taskId);
    return jsonContent(task);
  }
);

server.tool(
  "hermes_team_collect_result",
  {
    taskId: z.string().min(1)
  },
  async ({ taskId }) => {
    const { provider } = runtime();
    const task = await provider.getKanbanTask(taskId);
    let runs: unknown = [];
    let runsError: string | null = null;

    try {
      runs = await provider.getKanbanRuns(taskId);
    } catch (error) {
      runsError = error instanceof Error ? error.message : String(error);
    }

    return jsonContent({
      ...collectKanbanResult(taskId, task, runs),
      runsError
    });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

async function runCli(command: string): Promise<number> {
  switch (command) {
    case "--help":
    case "-h":
    case "help":
      printHelp();
      return 0;
    case "init-config":
      return initConfig(process.argv[3]);
    case "doctor":
      await doctor();
      return 0;
    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp();
      return 1;
  }
}

function printHelp() {
  console.log(`Codex + Hermes Team

Usage:
  codex-plus-hermes-team              Run MCP server over stdio
  codex-plus-hermes-team serve        Run MCP server over stdio
  codex-plus-hermes-team init-config  Create a starter team config
  codex-plus-hermes-team doctor       Check config, Hermes CLI, and profiles

Environment:
  CODEX_PLUS_HERMES_TEAM_CONFIG       Path to team.yaml
  HERMES_COMMAND                      Override Hermes command
  HERMES_PROFILE_PREFIX               Filter discovered profiles
`);
}

function initConfig(targetPath?: string): number {
  const destination = targetPath ?? getConfigPath();
  if (existsSync(destination)) {
    console.error(`Config already exists: ${destination}`);
    return 1;
  }

  const source = join(dirname(fileURLToPath(import.meta.url)), "..", "examples", "team.yaml");
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, readFileSync(source, "utf8"), { mode: 0o600 });
  console.log(`Created config: ${destination}`);
  return 0;
}

async function doctor() {
  const configPath = getConfigPath();
  const config = loadConfig(configPath);
  const provider = new HermesCliProvider(config);
  const health = await provider.health().catch((error: unknown) => ({
    ok: false,
    command: config.hermes.command,
    version: null,
    error: error instanceof Error ? error.message : String(error)
  }));
  const discovered = await provider.discoverAgents().catch(() => []);
  const agents = mergeAgents(config.agents, discovered);

  console.log(
    JSON.stringify(
      {
        ok: Boolean(health.ok) && agents.length > 0,
        configPath,
        node: process.version,
        hermes: health,
        configuredAgents: config.agents.length,
        discoveredAgents: discovered.length,
        activeAgents: agents.map((agent) => agent.profile),
        safety: {
          defaultSideEffectPolicy: config.safety.defaultSideEffectPolicy
        },
        kanban: {
          enabled: config.kanban.enabled,
          board: config.kanban.board ?? null,
          dispatcherProfile: config.kanban.dispatcherProfile ?? null
        }
      },
      null,
      2
    )
  );
}

function runtime() {
  const config = loadConfig();
  const provider = new HermesCliProvider(config);
  return { config, provider };
}

async function listAgents(config: BridgeConfig, provider: HermesCliProvider): Promise<TeamAgent[]> {
  const discovered = await provider.discoverAgents();
  return mergeAgents(config.agents, discovered);
}

function publicAgent(agent: TeamAgent) {
  return {
    profile: agent.profile,
    displayName: agent.displayName ?? agent.profile,
    role: agent.role ?? null,
    description: agent.description ?? null,
    capabilities: agent.capabilities,
    cwd: agent.cwd ?? null,
    toolsets: agent.toolsets ?? [],
    metadata: agent.metadata ?? {}
  };
}

function minimalAgent(profile: string): TeamAgent {
  return {
    profile,
    displayName: profile,
    capabilities: [],
    disabled: false
  };
}

function jsonContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}
