import { describe, expect, it } from "vitest";
import { getProviderHealth } from "../src/provider-health.js";

describe("provider health", () => {
  it("reports mock mode when no gateway is configured", () => {
    expect(getProviderHealth({})).toEqual({
      executor: "mock",
      gatewayConfigured: false,
      slackConfigured: false,
      routes: {
        codex: true,
        claude: true,
        cursor: true,
        hermes: true,
        perplexity: false,
        grok: false
      }
    });
  });

  it("detects gateway, Slack and optional research/model routes", () => {
    expect(
      getProviderHealth({
        AGENT_GATEWAY_BASE_URL: "http://127.0.0.1:3456/v1",
        AGENT_GATEWAY_API_KEY: "test",
        AGENT_GATEWAY_MODEL: "router/default",
        SLACK_BOT_TOKEN: "xoxb-test",
        SLACK_REPORT_CHANNEL_ID: "C123",
        PERPLEXITY_MCP_ENABLED: "true",
        GROK_ROUTE_ENABLED: "true"
      })
    ).toMatchObject({
      executor: "openai-compatible-gateway",
      gatewayConfigured: true,
      slackConfigured: true,
      routes: { perplexity: true, grok: true }
    });
  });
});
