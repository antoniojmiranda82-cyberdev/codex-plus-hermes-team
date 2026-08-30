import { describe, expect, it } from "vitest";
import { buildApprovalRequest, CommerceActionSchema } from "../src/commerce/approvals.js";
import { createCommerceEvent } from "../src/commerce/events.js";
import {
  formatApprovalRequest,
  resolveSlackChannelId,
  routeCommerceNotification,
  SlackChannelAlias
} from "../src/commerce/slack-routing.js";

describe("Q Commerce Slack routing", () => {
  it("routes task lifecycle to agent activity", () => {
    const event = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-product-scout",
      agentRole: "product_intelligence",
      eventType: "commerce.task.started",
      severity: "info",
      summary: "Product research started",
      payload: {},
      requiresApproval: false,
      correlationId: "corr-activity"
    });
    expect(routeCommerceNotification(event).alias).toBe(SlackChannelAlias.activity);
  });

  it("routes brand operations to the correct store lane", () => {
    const event = createCommerceEvent({
      brandId: "dream-blvd",
      agentId: "qcom-inventory-manager",
      agentRole: "inventory",
      eventType: "commerce.inventory.risk",
      severity: "report",
      summary: "Stock risk",
      payload: {},
      requiresApproval: false,
      correlationId: "corr-brand"
    });
    expect(routeCommerceNotification(event).alias).toBe(SlackChannelAlias.dreamBlvd);
  });

  it("routes approvals to CEO approvals", () => {
    const event = createCommerceEvent({
      brandId: "asset-ave",
      agentId: "qcom-pricing-margin",
      agentRole: "pricing",
      eventType: "commerce.approval.requested",
      severity: "approval",
      summary: "Price change",
      payload: {},
      requiresApproval: true,
      approvalId: "approval-1",
      correlationId: "corr-approval"
    });
    expect(routeCommerceNotification(event).alias).toBe(SlackChannelAlias.approvals);
  });

  it("routes critical events to executive command", () => {
    const event = createCommerceEvent({
      brandId: "dream-blvd",
      agentId: "qcom-tech-director",
      agentRole: "technology",
      eventType: "commerce.integration.failure",
      severity: "critical",
      summary: "Store API unavailable",
      payload: {},
      requiresApproval: false,
      correlationId: "corr-critical"
    });
    expect(routeCommerceNotification(event).alias).toBe(SlackChannelAlias.executive);
  });

  it("resolves channel IDs only from environment aliases", () => {
    expect(
      resolveSlackChannelId(SlackChannelAlias.executive, {
        QCOM_SLACK_EXECUTIVE_COMMAND: "C123"
      })
    ).toBe("C123");
  });

  it("formats complete owner approval context", () => {
    const action = CommerceActionSchema.parse({
      brandId: "asset-ave",
      requestingAgentId: "qcom-growth-director",
      actionClass: "paid_ad_spend",
      summary: "Run a paid creative test",
      expectedUpside: "Validate a new acquisition angle",
      downsideRisk: "Test may not convert",
      estimatedCost: 25,
      rollback: "Pause campaign",
      idempotencyKey: "ad-test-1"
    });
    const text = formatApprovalRequest(buildApprovalRequest(action));
    expect(text).toContain("Expected upside");
    expect(text).toContain("Rollback");
    expect(text).toContain("Approval ID");
  });
});
