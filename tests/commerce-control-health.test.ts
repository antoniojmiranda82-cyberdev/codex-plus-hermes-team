import { describe, expect, it } from "vitest";
import { evaluateSystemHealth, isActionEnabled } from "../src/commerce/control-health.js";

describe("Q Commerce control health", () => {
  const action = {
    actionClass: "public_publish" as const,
    brandId: "asset-ave",
    integrationId: "shopify",
    campaignId: "campaign-1",
    agentId: "qcom-marketing-strategist"
  };

  it("fails closed for global and scoped kill switches", () => {
    expect(isActionEnabled(action, [{ kind: "system", enabled: true }])).toBe(false);
    expect(isActionEnabled(action, [{ kind: "brand", id: "asset-ave", enabled: true }])).toBe(false);
    expect(isActionEnabled(action, [{ kind: "integration", id: "shopify", enabled: true }])).toBe(false);
    expect(isActionEnabled(action, [{ kind: "campaign", id: "campaign-1", enabled: true }])).toBe(false);
    expect(
      isActionEnabled(action, [{ kind: "agent", id: "qcom-marketing-strategist", enabled: true }])
    ).toBe(false);
  });

  it("does not block unrelated scopes", () => {
    expect(isActionEnabled(action, [{ kind: "brand", id: "dream-blvd", enabled: true }])).toBe(true);
  });

  it("marks required integration failures critical", () => {
    const health = evaluateSystemHealth([
      { id: "shopify", ok: false, required: true, message: "API unavailable" },
      { id: "pinterest", ok: false, required: false, message: "rate limited" }
    ]);
    expect(health.ok).toBe(false);
    expect(health.criticalFailures[0]).toContain("shopify");
    expect(health.degraded[0]).toContain("pinterest");
  });
});
