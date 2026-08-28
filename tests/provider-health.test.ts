import { describe, expect, it } from "vitest";
import { getProviderHealth } from "../src/provider-health.js";

describe("provider health", () => {
  it("reports local Ollama defaults when no cloud gateway is configured", () => {
    expect(getProviderHealth({})).toEqual({
      executor: "mock",
      gatewayConfigured: false,
      slackConfigured: false,
      ollama: {
        enabled: true,
        baseUrl: "http://127.0.0.1:11434",
        chatModel: "llama3.2:1b",
        embedModel: "mxbai-embed-large:latest"
      },
      routes: {
        ollama: true,
        codex: true,
        claude: true,
        cursor: true,
        hermes: true,
        perplexity: false,
        grok: false
      }
    });
  });

  it("detects gateway, Slack, optional routes and Ollama overrides", () => {
    expect(
      getProviderHealth({
        AGENT_GATEWAY_BASE_URL: "http://127.0.0.1:3456/v1",
        AGENT_GATEWAY_API_KEY: "test",
        AGENT_GATEWAY_MODEL: "router/default",
        SLACK_BOT_TOKEN: "xoxb-test",
        SLACK_REPORT_CHANNEL_ID: "C123",
        PERPLEXITY_MCP_ENABLED: "true",
        GROK_ROUTE_ENABLED: "true",
        OLLAMA_BASE_URL: "http://127.0.0.1:22434",
        OLLAMA_CHAT_MODEL: "local-chat",
        OLLAMA_EMBED_MODEL: "local-embed"
      })
    ).toMatchObject({
      executor: "openai-compatible-gateway",
      gatewayConfigured: true,
      slackConfigured: true,
      ollama: {
        enabled: true,
        baseUrl: "http://127.0.0.1:22434",
        chatModel: "local-chat",
        embedModel: "local-embed"
      },
      routes: { ollama: true, perplexity: true, grok: true }
    });
  });

  it("allows local Ollama routing to be explicitly disabled", () => {
    const health = getProviderHealth({ OLLAMA_ENABLED: "false" });
    expect(health.ollama.enabled).toBe(false);
    expect(health.routes.ollama).toBe(false);
  });
});
