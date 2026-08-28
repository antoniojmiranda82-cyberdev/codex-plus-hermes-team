import { describe, expect, it } from "vitest";
import { OpenAICompatibleExecutor } from "../src/providers/openai-compatible.js";

const task = {
  id: "task-1",
  business: "asset-ave" as const,
  title: "Catalog QA",
  prompt: "Review five featured products",
  agentProfile: "team-asset-commerce",
  attempts: 1
};

describe("OpenAICompatibleExecutor", () => {
  it("sends provider-neutral chat requests and returns the assistant summary", async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const executor = new OpenAICompatibleExecutor(
      {
        baseUrl: "http://localhost:3000/v1",
        apiKey: "test-key",
        model: "free-or-routed-model"
      },
      async (url, init) => {
        requests.push({ url: String(url), init });
        return new Response(
          JSON.stringify({ choices: [{ message: { content: "Catalog looks healthy" } }] }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
    );

    const result = await executor.execute(task);

    expect(result.summary).toBe("Catalog looks healthy");
    expect(requests[0]?.url).toBe("http://localhost:3000/v1/chat/completions");
    expect(requests[0]?.init.method).toBe("POST");
    expect(String((requests[0]?.init.headers as Record<string, string>).authorization)).toContain("test-key");
  });

  it("surfaces gateway failures instead of silently falling back", async () => {
    const executor = new OpenAICompatibleExecutor(
      { baseUrl: "http://localhost:3000/v1", apiKey: "x", model: "model" },
      async () => new Response("rate limited", { status: 429 })
    );

    await expect(executor.execute(task)).rejects.toThrow(/429/);
  });
});
