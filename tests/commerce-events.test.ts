import { describe, expect, it } from "vitest";
import { createCommerceEvent, parseCommerceEvent } from "../src/commerce/events.js";

describe("commerce events", () => {
  it("creates a valid normalized event envelope", () => {
    const event = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-inventory-manager",
      agentRole: "inventory",
      taskId: "task-123",
      eventType: "commerce.inventory.risk",
      severity: "report",
      summary: "SKU-1 may stock out within four days",
      payload: { sku: "SKU-1", daysRemaining: 4 },
      requiresApproval: false,
      correlationId: "corr-123"
    });

    expect(event.id.length).toBeGreaterThan(0);
    expect(event.occurredAt).toContain("T");
    expect(event.brandId).toBe("asset-ave");
  });

  it("round-trips through JSON", () => {
    const event = createCommerceEvent({
      brandId: "dream-blvd",
      agentId: "qcom-marketing-strategist",
      agentRole: "marketing",
      eventType: "commerce.campaign.performance",
      severity: "report",
      summary: "Campaign improved conversion",
      payload: { conversionLift: 0.12 },
      requiresApproval: false,
      correlationId: "corr-456"
    });

    expect(parseCommerceEvent(JSON.parse(JSON.stringify(event)))).toEqual(event);
  });

  it("requires an approval id when approval is required", () => {
    expect(() =>
      createCommerceEvent({
        brandId: "asset-ave",
        agentId: "qcom-pricing-margin",
        agentRole: "pricing",
        eventType: "commerce.approval.requested",
        severity: "approval",
        summary: "Price change requires approval",
        payload: { sku: "SKU-2" },
        requiresApproval: true,
        correlationId: "corr-789"
      })
    ).toThrow(/approvalId/);
  });
});
