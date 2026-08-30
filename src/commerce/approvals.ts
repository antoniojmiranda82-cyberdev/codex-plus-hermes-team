import { randomUUID } from "node:crypto";
import { z } from "zod";

export const CommerceActionClassSchema = z.enum([
  "research",
  "analysis",
  "draft_content",
  "score_opportunity",
  "qa_review",
  "internal_task",
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
]);

export type CommerceActionClass = z.infer<typeof CommerceActionClassSchema>;

export const CommerceActionSchema = z.object({
  id: z.string().min(1).default(() => randomUUID()),
  brandId: z.string().min(1),
  requestingAgentId: z.string().min(1),
  actionClass: CommerceActionClassSchema,
  summary: z.string().min(1),
  expectedUpside: z.string().min(1),
  downsideRisk: z.string().min(1),
  estimatedCost: z.number().nonnegative().nullable().default(null),
  rollback: z.string().min(1),
  idempotencyKey: z.string().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export type CommerceAction = z.infer<typeof CommerceActionSchema>;

const APPROVAL_REQUIRED = new Set<CommerceActionClass>([
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
]);

const IDEMPOTENCY_REQUIRED = new Set<CommerceActionClass>([
  "customer_email_send",
  "customer_sms_send",
  "purchase",
  "paid_ad_spend",
  "delete_data",
  "production_deploy",
  "refund_or_credit"
]);

export type ApprovalPolicy = {
  standingAllowedActions?: CommerceActionClass[];
  maxEstimatedCostWithoutApproval?: number;
};

export type ApprovalRequest = {
  id: string;
  createdAt: string;
  action: CommerceAction;
  status: "pending" | "approved" | "rejected";
};

export function requiresOwnerApproval(
  actionInput: CommerceAction,
  policy: ApprovalPolicy = {}
): boolean {
  const action = CommerceActionSchema.parse(actionInput);
  if (policy.standingAllowedActions?.includes(action.actionClass)) {
    if (
      action.estimatedCost !== null &&
      policy.maxEstimatedCostWithoutApproval !== undefined &&
      action.estimatedCost > policy.maxEstimatedCostWithoutApproval
    ) {
      return true;
    }
    return false;
  }
  return APPROVAL_REQUIRED.has(action.actionClass);
}

export function buildApprovalRequest(actionInput: CommerceAction): ApprovalRequest {
  const action = CommerceActionSchema.parse(actionInput);
  if (!requiresOwnerApproval(action)) {
    throw new Error(`action class ${action.actionClass} does not require owner approval`);
  }
  if (IDEMPOTENCY_REQUIRED.has(action.actionClass) && !action.idempotencyKey) {
    throw new Error(`idempotencyKey is required for ${action.actionClass}`);
  }
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    action,
    status: "pending"
  };
}
