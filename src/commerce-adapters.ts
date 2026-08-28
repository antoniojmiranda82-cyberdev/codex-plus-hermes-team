import type { BusinessId } from "./operator.js";
import type { ProductAction, ProductPolicyDecision } from "./product-policy.js";

export type ProductCandidate = {
  externalId?: string;
  title: string;
  category?: string;
  vendor?: string;
  price?: number;
  currency?: string;
  inventory?: number;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
};

export type ProductDraftInput = {
  title: string;
  description?: string;
  category?: string;
  vendor?: string;
  price?: number;
  currency?: string;
  images?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type CommerceActionContext = {
  projectId: "asset-dream";
  business: BusinessId;
  agentProfile: string;
  action: ProductAction;
  policy: ProductPolicyDecision;
  approved?: boolean;
};

export interface CommerceAdapter {
  readonly business: BusinessId;
  readonly platform: "shopify" | "woocommerce";
  listProducts(): Promise<ProductCandidate[]>;
  getProduct(externalId: string): Promise<ProductCandidate | undefined>;
  createDraft(input: ProductDraftInput, context: CommerceActionContext): Promise<{ externalId: string }>;
  publish(externalId: string, context: CommerceActionContext): Promise<void>;
  updateLivePrice(externalId: string, price: number, context: CommerceActionContext): Promise<void>;
}

export function assertCommerceContext(context: CommerceActionContext, expectedBusiness: BusinessId) {
  if (context.projectId !== "asset-dream") throw new Error("Commerce action belongs to another project");
  if (context.business !== expectedBusiness) throw new Error("Commerce adapter/business mismatch");
  if (!context.agentProfile.startsWith("asset-dream:")) throw new Error("Unscoped agent profile rejected");
  if (!context.policy.allowed) throw new Error(context.policy.reason ?? "Product action blocked by policy");
}

export function assertApprovalForExternalWrite(context: CommerceActionContext) {
  if (context.policy.requiresApproval && !context.approved) {
    throw new Error("Owner approval required before external commerce write");
  }
}
