import { describe, expect, it } from "vitest";
import { buildCommerceTask } from "../src/commerce-workflows.js";

describe("commerce workflow tasks", () => {
  it("creates draft-product work without external approval", () => {
    const task = buildCommerceTask({ business: "asset-ave", action: "create_draft", title: "Draft winning pet product", prompt: "Create a draft product." });
    expect(task.agentProfile).toBe("asset-dream:asset-commerce");
    expect(task.approvalRequirement).toBe("none");
  });

  it("routes Dream Blvd work to the separate Dream commerce agent", () => {
    const task = buildCommerceTask({ business: "dream-blvd", action: "research", title: "Research products", prompt: "Research candidates." });
    expect(task.agentProfile).toBe("asset-dream:dream-commerce");
  });

  it("marks publish and live price changes as approval-gated", () => {
    expect(buildCommerceTask({ business: "asset-ave", action: "publish", title: "Publish", prompt: "Publish product." }).approvalRequirement).toBe("external_side_effect");
    expect(buildCommerceTask({ business: "dream-blvd", action: "change_live_price", title: "Price", prompt: "Change price." }).approvalRequirement).toBe("external_side_effect");
  });
});
