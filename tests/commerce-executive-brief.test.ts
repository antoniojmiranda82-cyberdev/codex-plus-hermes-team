import { describe, expect, it } from "vitest";
import { CommerceActionSchema, buildApprovalRequest } from "../src/commerce/approvals.js";
import { createCommerceEvent } from "../src/commerce/events.js";
import { buildExecutiveBrief } from "../src/commerce/executive-brief.js";

describe("buildExecutiveBrief", () => {
  it("aggregates both brands while keeping facts and inference separate", () => {
    const critical = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-tech-director",
      agentRole: "technology",
      eventType: "commerce.alert.critical",
      severity: "critical",
      summary: "Checkout integration failing",
      payload: {},
      requiresApproval: false,
      correlationId: "corr-brief-critical"
    });
    const duplicate = { ...critical, id: "event-duplicate" };
    const approval = buildApprovalRequest(
      CommerceActionSchema.parse({
        brandId: "dream-blvd",
        requestingAgentId: "qcom-growth-director",
        actionClass: "paid_ad_spend",
        summary: "Scale winning creative",
        expectedUpside: "More profitable traffic",
        downsideRisk: "ROAS may fall",
        estimatedCost: 100,
        rollback: "Pause campaign",
        idempotencyKey: "brief-ad-1"
      })
    );

    const brief = buildExecutiveBrief({
      generatedAt: "2026-08-28T12:00:00.000Z",
      brands: [
        {
          brandId: "asset-ave",
          metrics: { revenue: 1000, profit: 300, orders: 20, capturedAt: "2026-08-28T11:59:00.000Z" }
        },
        {
          brandId: "dream-blvd",
          metrics: { revenue: 500, profit: 150, orders: 10, capturedAt: "2026-08-28T11:59:00.000Z" }
        }
      ],
      events: [critical, duplicate],
      approvals: [approval],
      opportunities: ["Bundle top sellers", "Bundle top sellers"],
      inferredExplanations: ["Paid traffic may be contributing to growth"]
    });

    expect(brief.totalRevenue).toBe(1500);
    expect(brief.totalProfit).toBe(450);
    expect(brief.totalOrders).toBe(30);
    expect(brief.criticalRisks).toEqual(["Checkout integration failing"]);
    expect(brief.opportunities).toEqual(["Bundle top sellers"]);
    expect(brief.approvals).toHaveLength(1);
    expect(brief.facts.join(" ")).not.toContain("may be contributing");
    expect(brief.inferredExplanations).toEqual(["Paid traffic may be contributing to growth"]);
  });
});
