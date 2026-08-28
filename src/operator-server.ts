#!/usr/bin/env node

import { homedir } from "node:os";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AgentRoster, JsonFileTaskStore, MockAgentExecutor, OperatorService } from "./operator.js";
import { createObsidianMemoryAdapterFromEnv } from "./obsidian-memory.js";
import { registerOperatorTools } from "./operator-tools.js";
import { getProviderHealth } from "./provider-health.js";
import { assetDreamRoster } from "./project-rosters.js";
import { OpenAICompatibleExecutor } from "./providers/openai-compatible.js";

function buildExecutor() {
  const baseUrl = process.env.AGENT_GATEWAY_BASE_URL;
  const apiKey = process.env.AGENT_GATEWAY_API_KEY;
  const model = process.env.AGENT_GATEWAY_MODEL;

  if (baseUrl && apiKey && model) return new OpenAICompatibleExecutor({ baseUrl, apiKey, model });
  return new MockAgentExecutor();
}

function jsonContent(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const server = new McpServer({ name: "asset-dream-operator", version: "0.1.0" });
const storePath =
  process.env.OPERATOR_TASK_STORE ??
  join(homedir(), ".codex-plus-hermes-team", "operator", "asset-dream", "tasks.json");
const store = new JsonFileTaskStore(storePath);
const operator = new OperatorService(store, buildExecutor());
const roster = new AgentRoster(assetDreamRoster);
const memory = createObsidianMemoryAdapterFromEnv();
registerOperatorTools(server, operator, memory);

server.tool("operator_agent_status", {}, async () =>
  jsonContent({ projectId: "asset-dream", agents: roster.status(store.list()) })
);

server.tool("operator_health", {}, async () => {
  const providers = getProviderHealth();
  return jsonContent({
    ok: true,
    projectId: "asset-dream",
    businesses: ["asset-ave", "dream-blvd"],
    executor: providers.executor,
    persistence: "json-file",
    taskStore: storePath,
    agents: assetDreamRoster.length,
    externalSideEffects: "approval-gated",
    memoryBridgeConfigured: Boolean(memory),
    providers
  });
});

const transport = new StdioServerTransport();
await server.connect(transport);
