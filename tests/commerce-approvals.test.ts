import { describe, expect, it } from "vitest";
import {
  CommerceActionSchema,
  buildApprovalRequest,
  requiresOwnerApproval
} from "../src/commerce/approvals.js";

function action(actionClass: Parameters<typeof CommerceActionSchema.parse>[0] extends never ? never : string) {
  return CommerceActionSchema.parse({
    brandId: "asset-ave",
    requestingAgentId: "qcom-growth-director",
    actionClass,
    summary: "Test action",
    expectedUpside: "Potential measurable upside",
    downsideRisk: "Limited test risk",
    estimatedCost: 20,
    rollback: "Revert the action",
    idempotencyKey: "idem-1"
  });
}

describe("owner approval policy", () => {
  it.each(["research", "analysis", "draft_content", "score_opportunity", "qa_review", "internal_task"])(
    "does not require approval for %s",
    (actionClass) => {
      expect(requiresOwnerApproval(action(actionClass))).toBe(false);
    }
  );

  it.each([
    "public_publish",
    "customer_email_send",
    "customer_sms_send",
    "purchase",
    "price_change",
    "paid_ad_spend",
    "delete_data",
    "production_deploy",
    "refund_or_credit",
    "business_policy_change"
  ])("requires approval for %s", (actionClass) => {
    expect(requiresOwnerApproval(action(actionClass))).toBe(true);
  });

  it("allows bounded standing policy below a cost ceiling", () => {
    expect(
      requiresOwnerApproval(action("paid_ad_spend"), {
        standingAllowedActions: ["paid_ad_spend"],
        maxEstimatedCostWithoutApproval: 25
      })
    ).toBe(false);
  });

  it("re-applies owner approval when a standing-policy cost ceiling is exceeded", () => {
    const expensive = { ...action("paid_ad_spend"), estimatedCost: 50 };
    expect(
      requiresOwnerApproval(expensive, {
        standingAllowedActions: ["paid_ad_spend"],
        maxEstimatedCostWithoutApproval: 25
      })
    ).toBe(true);
  });

  it("requires idempotency for retriable external writes", () => {
    const purchase = { ...action("purchase"), idempotencyKey: undefined };
    expect(() => buildApprovalRequest(purchase)).toThrow(/idempotencyKey/);
  });
});
