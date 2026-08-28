import type { AgentExecutionInput, AgentExecutionResult, AgentExecutor } from "../operator.js";

export type OpenAICompatibleConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature?: number;
};

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export class OpenAICompatibleExecutor implements AgentExecutor {
  constructor(
    private readonly config: OpenAICompatibleConfig,
    private readonly fetchImpl: FetchLike = fetch
  ) {}

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const endpoint = `${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const response = await this.fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: this.config.temperature ?? 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a specialist business operations agent. Stay within the assigned business and task. Do not claim external actions were completed unless the caller explicitly performed them. Return a concise factual task summary."
          },
          {
            role: "user",
            content: [
              `Business: ${input.business}`,
              `Agent profile: ${input.agentProfile}`,
              `Task: ${input.title}`,
              `Attempt: ${input.attempts}`,
              "",
              input.prompt
            ].join("\n")
          }
        ]
      })
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `OpenAI-compatible gateway failed with HTTP ${response.status}${body ? `: ${body.slice(0, 300)}` : ""}`
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const summary = payload.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error("OpenAI-compatible gateway returned no assistant content");
    }

    return { summary };
  }
}
