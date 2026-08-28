import { describe, expect, it } from "vitest";
import { ConnectorCommerceAdapter } from "../src/connector-commerce-adapters.js";
import { evaluateProductAction } from "../src/product-policy.js";

describe("connector commerce adapter", () => {
  it("creates a draft through the host connector bridge", async () => {
    const calls: string[] = [];
    const adapter = new ConnectorCommerceAdapter("asset-ave", "shopify", {
      async listProducts() { return []; },
      async getProduct() { return undefined; },
      async createDraft(input) { calls.push(input.title); return { externalId: "draft-1" }; },
      async publish() {},
      async updateLivePrice() {}
    });

    const result = await adapter.createDraft(
      { title: "Candidate Product" },
      {
        projectId: "asset-dream",
        business: "asset-ave",
        agentProfile: "asset-dream:asset-commerce",
        action: "create_draft",
        policy: evaluateProductAction({ action: "create_draft", business: "asset-ave" })
      }
    );

    expect(result.externalId).toBe("draft-1");
    expect(calls).toEqual(["Candidate Product"]);
  });

  it("blocks publish until owner approval is present", async () => {
    const adapter = new ConnectorCommerceAdapter("dream-blvd", "woocommerce", {
      async listProducts() { return []; },
      async getProduct() { return undefined; },
      async createDraft() { return { externalId: "draft-1" }; },
      async publish() {},
      async updateLivePrice() {}
    });

    const context = {
      projectId: "asset-dream" as const,
      business: "dream-blvd" as const,
      agentProfile: "asset-dream:dream-commerce",
      action: "publish" as const,
      policy: evaluateProductAction({ action: "publish", business: "dream-blvd" })
    };

    await expect(adapter.publish("draft-1", context)).rejects.toThrow(/approval/i);
    await expect(adapter.publish("draft-1", { ...context, approved: true })).resolves.toBeUndefined();
  });
});
