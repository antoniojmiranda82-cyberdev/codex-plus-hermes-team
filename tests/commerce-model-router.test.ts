import { describe, expect, it } from "vitest";
import { defaultModelRoutingPolicy, OmniRouterClient } from "../src/commerce/model-router.js";

describe("OmniRouterClient", () => {
  it("sends smart-router requests with bearer auth and routing preferences", async () => {
    let request: RequestInit | undefined;
    let url = "";
    const client = new OmniRouterClient(
      "https://router.example",
      "secret",
      async (input, init) => {
        url = String(input);
        request = init;
        return new Response(
          JSON.stringify({ provider: "openai", model: "gpt-test", content: "done" }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
    );

    const result = await client.route(
      [{ role: "user", content: "Draft three product hooks" }],
      { maxLatency: "FAST", maxCost: "CHEAP" }
    );

    expect(url).toBe("https://router.example/v1/smartRouter");
    expect((request?.headers as Record<string, string>).authorization).toBe("Bearer secret");
    const body = JSON.parse(String(request?.body));
    expect(body.max_latency).toBe("FAST");
    expect(body.max_cost).toBe("CHEAP");
    expect(result.provider).toBe("openai");
    expect(result.content).toBe("done");
  });

  it("uses cheaper/faster defaults for routine copy", () => {
    expect(defaultModelRoutingPolicy("social_caption").preference).toMatchObject({
      maxLatency: "FAST",
      maxCost: "CHEAP"
    });
  });

  it("uses stronger routing preferences for executive analysis", () => {
    expect(defaultModelRoutingPolicy("executive_analysis").preference).toMatchObject({
      maxLatency: "PERFORMANCE",
      maxCost: "PREMIUM"
    });
  });
});
