#!/usr/bin/env node

import { homedir } from "node:os";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AgentRoster, JsonFileTaskStore, MockAgentExecutor, OperatorService } from "./operator.js";
import { registerOperatorTools } from "./operator-tools.js";
import { OpenAICompatibleExecutor } from "./providers/openai-compatible.js";

const DEFAULT_AGENTS = [
  { profile: "team-architect", displayName: "Architect", role: "architecture", capabilities: ["architecture", "orchestration", "reliability"] },
  { profile: "team-asset-commerce", displayName: "Asset Commerce", role: "asset_ave_commerce", capabilities: ["shopify", "catalog", "merchandising", "ecommerce_ops"] },
  { profile: "team-dream-commerce", displayName: "Dream Commerce", role: "dream_blvd_commerce", capabilities: ["woocommerce", "catalog", "page_qa", "ecommerce_ops"] },
  { profile: "team-growth", displayName: "Growth", role: "growth", capabilities: ["seo", "social", "email", "sms", "campaigns"] },
  { profile: "team-analytics", displayName: "Analytics", role: "analytics", capabilities: ["analytics", "posthog", "funnels", "conversion"] },
  { profile: "team-ops", displayName: "Operations", role: "operations", capabilities: ["operations", "workflow", "reporting", "triage"] },
  { profile: "team-qa", displayName: "QA Watchdog", role: "qa", capabilities: ["qa", "validation", "safety", "testing"] }
];

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
const storePath = process.env.OPERATOR_TASK_STORE ?? join(homedir(), ".codex-plus-hermes-team", "operator", "tasks.json");
const store = new JsonFileTaskStore(storePath);
const operator = new OperatorService(store, buildExecutor());
const roster = new AgentRoster(DEFAULT_AGENTS);
registerOperatorTools(server, operator);

server.tool("operator_agent_status", {}, async () => jsonContent({ agents: roster.status(store.list()) }));

server.tool("operator_health", {}, async () =>
  jsonContent({
    ok: true,
    businesses: ["asset-ave", "dream-blvd"],
    executor:
      process.env.AGENT_GATEWAY_BASE_URL && process.env.AGENT_GATEWAY_API_KEY && process.env.AGENT_GATEWAY_MODEL
        ? "openai-compatible-gateway"
        : "mock",
    persistence: "json-file",
    taskStore: storePath,
    agents: DEFAULT_AGENTS.length,
    externalSideEffects: "approval-gated"
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
