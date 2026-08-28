#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { InMemoryTaskStore, MockAgentExecutor, OperatorService } from "./operator.js";
import { registerOperatorTools } from "./operator-tools.js";
import { OpenAICompatibleExecutor } from "./providers/openai-compatible.js";

function buildExecutor() {
  const baseUrl = process.env.AGENT_GATEWAY_BASE_URL;
  const apiKey = process.env.AGENT_GATEWAY_API_KEY;
  const model = process.env.AGENT_GATEWAY_MODEL;

  if (baseUrl && apiKey && model) {
    return new OpenAICompatibleExecutor({ baseUrl, apiKey, model });
  }

  return new MockAgentExecutor();
}

const server = new McpServer({
  name: "asset-dream-operator",
  version: "0.1.0"
});

const operator = new OperatorService(new InMemoryTaskStore(), buildExecutor());
registerOperatorTools(server, operator);

server.tool("operator_health", {}, async () => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify(
        {
          ok: true,
          businesses: ["asset-ave", "dream-blvd"],
          executor:
            process.env.AGENT_GATEWAY_BASE_URL &&
            process.env.AGENT_GATEWAY_API_KEY &&
            process.env.AGENT_GATEWAY_MODEL
              ? "openai-compatible-gateway"
              : "mock",
          persistence: "memory",
          externalSideEffects: "approval-gated"
        },
        null,
        2
      )
    }
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
