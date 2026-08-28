export type ProviderHealth = {
  executor: "mock" | "openai-compatible-gateway";
  gatewayConfigured: boolean;
  slackConfigured: boolean;
  routes: {
    codex: boolean;
    claude: boolean;
    cursor: boolean;
    hermes: boolean;
    perplexity: boolean;
    grok: boolean;
  };
};

type EnvLike = Record<string, string | undefined>;

function enabled(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

export function getProviderHealth(env: EnvLike = process.env): ProviderHealth {
  const gatewayConfigured = Boolean(
    env.AGENT_GATEWAY_BASE_URL && env.AGENT_GATEWAY_API_KEY && env.AGENT_GATEWAY_MODEL
  );

  return {
    executor: gatewayConfigured ? "openai-compatible-gateway" : "mock",
    gatewayConfigured,
    slackConfigured: Boolean(env.SLACK_BOT_TOKEN && env.SLACK_REPORT_CHANNEL_ID),
    routes: {
      codex: true,
      claude: true,
      cursor: true,
      hermes: true,
      perplexity: enabled(env.PERPLEXITY_MCP_ENABLED),
      grok: enabled(env.GROK_ROUTE_ENABLED)
    }
  };
}
