import type { CreateTaskInput, BusinessId } from "./operator.js";
import { evaluateProductAction, type ProductAction } from "./product-policy.js";

export type CommerceWorkflowInput = {
  business: BusinessId;
  action: ProductAction;
  title: string;
  prompt: string;
  category?: string;
};

export function buildCommerceTask(input: CommerceWorkflowInput): CreateTaskInput {
  const decision = evaluateProductAction({
    action: input.action,
    business: input.business,
    ...(input.category ? { category: input.category } : {})
  });

  if (!decision.allowed) throw new Error(decision.reason ?? "Product workflow blocked by policy");

  return {
    business: input.business,
    title: input.title,
    prompt: input.prompt,
    agentProfile: input.business === "asset-ave" ? "asset-dream:asset-commerce" : "asset-dream:dream-commerce",
    approvalRequirement: decision.requiresApproval ? "external_side_effect" : "none"
  };
}
