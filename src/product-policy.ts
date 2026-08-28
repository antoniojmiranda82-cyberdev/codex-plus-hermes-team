import type { BusinessId } from "./operator.js";

export type ProductAction =
  | "research"
  | "score"
  | "create_draft"
  | "update_draft"
  | "publish"
  | "change_live_price"
  | "archive"
  | "delete";

export type ProductPolicyInput = {
  action: ProductAction;
  business: BusinessId;
  category?: string;
};

export type ProductPolicyDecision = {
  allowed: boolean;
  requiresApproval: boolean;
  reason?: string;
};

const RESTRICTED_CATEGORY_TERMS = [
  "firearm",
  "firearms",
  "ammunition",
  "explosive",
  "explosives",
  "tobacco",
  "nicotine",
  "vape",
  "alcohol",
  "cannabis",
  "marijuana",
  "thc",
  "prescription drug",
  "controlled substance",
  "counterfeit",
  "illicitly acquired merchandise"
];

const APPROVAL_ACTIONS = new Set<ProductAction>([
  "publish",
  "change_live_price",
  "archive",
  "delete"
]);

export function evaluateProductAction(input: ProductPolicyInput): ProductPolicyDecision {
  const category = input.category?.trim().toLowerCase();
  if (category && RESTRICTED_CATEGORY_TERMS.some((term) => category.includes(term))) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: `Restricted product category: ${input.category}`
    };
  }

  return {
    allowed: true,
    requiresApproval: APPROVAL_ACTIONS.has(input.action)
  };
}
