export type ProviderHealth = {
  executor: "mock" | "openai-compatible-gateway";
  gatewayConfigured: boolean;
  slackConfigured: boolean;
  ollama: {
    enabled: boolean;
    baseUrl: string;
    chatModel: string;
    embedModel: string;
  };
  routes: {
    ollama: boolean;
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

function enabledByDefault(value: string | undefined): boolean {
  if (value === undefined || value === "") return true;
  return value !== "0" && value.toLowerCase() !== "false";
}

export function getProviderHealth(env: EnvLike = process.env): ProviderHealth {
  const gatewayConfigured = Boolean(
    env.AGENT_GATEWAY_BASE_URL && env.AGENT_GATEWAY_API_KEY && env.AGENT_GATEWAY_MODEL
  );
  const ollamaEnabled = enabledByDefault(env.OLLAMA_ENABLED);

  return {
    executor: gatewayConfigured ? "openai-compatible-gateway" : "mock",
    gatewayConfigured,
    slackConfigured: Boolean(env.SLACK_BOT_TOKEN && env.SLACK_REPORT_CHANNEL_ID),
    ollama: {
      enabled: ollamaEnabled,
      baseUrl: env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
      chatModel: env.OLLAMA_CHAT_MODEL || "llama3.2:1b",
      embedModel: env.OLLAMA_EMBED_MODEL || "mxbai-embed-large:latest"
    },
    routes: {
      ollama: ollamaEnabled,
      codex: true,
      claude: true,
      cursor: true,
      hermes: true,
      perplexity: enabled(env.PERPLEXITY_MCP_ENABLED),
      grok: enabled(env.GROK_ROUTE_ENABLED)
    }
  };
}
