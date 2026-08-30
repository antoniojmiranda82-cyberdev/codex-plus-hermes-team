import { z } from "zod";

export const ModelRoutePreferenceSchema = z.object({
  maxLatency: z.enum(["LIGHTNING", "FAST", "BALANCED", "PERFORMANCE"]).default("BALANCED"),
  maxCost: z.enum(["CHEAP", "BALANCED", "PREMIUM", "PERFORMANCE"]).default("BALANCED"),
  modelList: z.array(z.string()).default([])
});

export type ModelRoutePreference = z.infer<typeof ModelRoutePreferenceSchema>;

export type RoutedMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RoutedModelResponse = {
  raw: unknown;
  provider?: string;
  model?: string;
  content?: string;
};

export class OmniRouterClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {
    if (!baseUrl.startsWith("https://") && !baseUrl.startsWith("http://localhost")) {
      throw new Error("OmniRouter baseUrl must use https or localhost");
    }
    if (!apiKey) throw new Error("OmniRouter apiKey is required");
  }

  async route(
    messages: RoutedMessage[],
    preferenceInput: Partial<ModelRoutePreference> = {}
  ): Promise<RoutedModelResponse> {
    const preference = ModelRoutePreferenceSchema.parse(preferenceInput);
    const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, "")}/v1/smartRouter`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        messages,
        max_latency: preference.maxLatency,
        max_cost: preference.maxCost,
        model_list: preference.modelList
      })
    });

    if (!response.ok) {
      throw new Error(`OmniRouter request failed with status ${response.status}`);
    }

    const raw = await response.json();
    if (typeof raw !== "object" || raw === null) return { raw };
    const obj = raw as Record<string, unknown>;
    return {
      raw,
      ...(typeof obj.provider === "string" ? { provider: obj.provider } : {}),
      ...(typeof obj.model === "string" ? { model: obj.model } : {}),
      ...(typeof obj.content === "string" ? { content: obj.content } : {})
    };
  }
}

export type ModelRoutingPolicy = {
  taskClass: string;
  preference: ModelRoutePreference;
};

export function defaultModelRoutingPolicy(taskClass: string): ModelRoutingPolicy {
  switch (taskClass) {
    case "social_caption":
    case "product_description":
    case "email_variant":
      return {
        taskClass,
        preference: { maxLatency: "FAST", maxCost: "CHEAP", modelList: [] }
      };
    case "executive_analysis":
    case "financial_analysis":
    case "compliance_review":
      return {
        taskClass,
        preference: { maxLatency: "PERFORMANCE", maxCost: "PREMIUM", modelList: [] }
      };
    default:
      return {
        taskClass,
        preference: { maxLatency: "BALANCED", maxCost: "BALANCED", modelList: [] }
      };
  }
}
