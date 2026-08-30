import { describe, expect, it } from "vitest";
import { CommerceActionSchema, buildApprovalRequest } from "../src/commerce/approvals.js";
import { createCommerceEvent } from "../src/commerce/events.js";
import { buildExecutiveBrief } from "../src/commerce/executive-brief.js";
import { CommerceWorkflowPublisher, type WorkflowTransport } from "../src/commerce/workflow-bridge.js";

describe("supervised Q Commerce workflow", () => {
  it("moves an inventory risk through recommendation, approval, one-time execution event, and executive reporting", async () => {
    const inventoryRisk = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-inventory-manager",
      agentRole: "inventory",
      taskId: "task-replenish-1",
      eventType: "commerce.inventory.risk",
      severity: "report",
      summary: "SKU-ALPHA projected to stock out in four days",
      payload: { sku: "SKU-ALPHA", daysRemaining: 4 },
      requiresApproval: false,
      correlationId: "corr-replenish-1"
    });

    const purchaseAction = CommerceActionSchema.parse({
      brandId: "asset-ave",
      requestingAgentId: "qcom-asset-ave-gm",
      actionClass: "purchase",
      summary: "Reorder SKU-ALPHA from approved supplier",
      expectedUpside: "Avoid stockout on a selling SKU",
      downsideRisk: "Demand could slow after reorder",
      estimatedCost: 240,
      rollback: "Cancel supplier order before fulfillment if vendor permits",
      idempotencyKey: "reorder-SKU-ALPHA-2026-08-28"
    });
    const approval = buildApprovalRequest(purchaseAction);
    approval.status = "approved";

    const approvedEvent = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-chief-of-staff",
      agentRole: "executive_orchestrator",
      taskId: "task-replenish-1",
      eventType: "commerce.approval.approved",
      severity: "report",
      summary: "Owner approved SKU-ALPHA reorder",
      payload: { approvalId: approval.id, idempotencyKey: purchaseAction.idempotencyKey },
      requiresApproval: false,
      correlationId: "corr-replenish-1"
    });

    const published: string[] = [];
    const transport: WorkflowTransport = {
      async publish(event) {
        published.push(event.id);
        return { transportId: `workflow-${event.id}` };
      }
    };
    const publisher = new CommerceWorkflowPublisher(transport);
    await publisher.publishCommerceEvent(approvedEvent);
    await publisher.publishCommerceEvent(approvedEvent);

    const brief = buildExecutiveBrief({
      brands: [
        {
          brandId: "asset-ave",
          metrics: { revenue: 0, profit: 0, orders: 0, capturedAt: "2026-08-28T12:00:00.000Z" }
        },
        {
          brandId: "dream-blvd",
          metrics: { revenue: 0, profit: 0, orders: 0, capturedAt: "2026-08-28T12:00:00.000Z" }
        }
      ],
      events: [inventoryRisk, approvedEvent],
      approvals: [approval],
      opportunities: ["Protect availability of SKU-ALPHA"]
    });

    expect(published).toHaveLength(1);
    expect(brief.materialRisks).toContain("SKU-ALPHA projected to stock out in four days");
    expect(brief.approvals).toHaveLength(0);
    expect(brief.opportunities).toContain("Protect availability of SKU-ALPHA");
  });
});
