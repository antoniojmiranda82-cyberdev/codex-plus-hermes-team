import { describe, expect, it } from "vitest";
import { createCommerceEvent } from "../src/commerce/events.js";
import { CommerceWorkflowPublisher, type WorkflowTransport } from "../src/commerce/workflow-bridge.js";

describe("CommerceWorkflowPublisher", () => {
  it("publishes an event once and treats exact replay as duplicate", async () => {
    const sent: string[] = [];
    const transport: WorkflowTransport = {
      async publish(event) {
        sent.push(event.id);
        return { transportId: `transport-${event.id}` };
      }
    };
    const publisher = new CommerceWorkflowPublisher(transport);
    const event = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-inventory-manager",
      agentRole: "inventory",
      eventType: "commerce.inventory.risk",
      severity: "report",
      summary: "Low stock",
      payload: { sku: "SKU-1" },
      requiresApproval: false,
      correlationId: "corr-workflow"
    });

    const first = await publisher.publishCommerceEvent(event);
    const second = await publisher.publishCommerceEvent(event);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    expect(sent).toEqual([event.id]);
  });

  it("does not mark failed transport attempts as published", async () => {
    let attempts = 0;
    const transport: WorkflowTransport = {
      async publish() {
        attempts += 1;
        if (attempts === 1) throw new Error("temporary failure");
        return {};
      }
    };
    const publisher = new CommerceWorkflowPublisher(transport);
    const event = createCommerceEvent({
      brandId: "dream-blvd",
      agentId: "qcom-automation-engineer",
      agentRole: "automation",
      eventType: "commerce.integration.failure",
      severity: "report",
      summary: "Retry test",
      payload: {},
      requiresApproval: false,
      correlationId: "corr-retry"
    });

    await expect(publisher.publishCommerceEvent(event)).rejects.toThrow("temporary failure");
    await expect(publisher.publishCommerceEvent(event)).resolves.toMatchObject({ duplicate: false });
    expect(attempts).toBe(2);
  });
});
