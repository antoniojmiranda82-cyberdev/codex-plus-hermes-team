import { describe, expect, it } from "vitest";
import { evaluateProductAction } from "../src/product-policy.js";

describe("product autonomy policy", () => {
  it("allows research and draft creation without owner approval", () => {
    expect(evaluateProductAction({ action: "research", business: "asset-ave" })).toEqual({ allowed: true, requiresApproval: false });
    expect(evaluateProductAction({ action: "create_draft", business: "dream-blvd" })).toEqual({ allowed: true, requiresApproval: false });
  });

  it("requires approval before publishing, changing live price, or deleting", () => {
    expect(evaluateProductAction({ action: "publish", business: "asset-ave" }).requiresApproval).toBe(true);
    expect(evaluateProductAction({ action: "change_live_price", business: "asset-ave" }).requiresApproval).toBe(true);
    expect(evaluateProductAction({ action: "delete", business: "dream-blvd" }).requiresApproval).toBe(true);
  });

  it("blocks restricted categories from autonomous product intake", () => {
    const result = evaluateProductAction({ action: "create_draft", business: "asset-ave", category: "firearms" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/restricted/i);
  });
});
