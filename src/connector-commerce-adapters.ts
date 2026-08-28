import type { BusinessId } from "./operator.js";
import {
  assertApprovalForExternalWrite,
  assertCommerceContext,
  type CommerceActionContext,
  type CommerceAdapter,
  type ProductCandidate,
  type ProductDraftInput
} from "./commerce-adapters.js";

export type CommerceConnectorBridge = {
  listProducts(): Promise<ProductCandidate[]>;
  getProduct(externalId: string): Promise<ProductCandidate | undefined>;
  createDraft(input: ProductDraftInput): Promise<{ externalId: string }>;
  publish(externalId: string): Promise<void>;
  updateLivePrice(externalId: string, price: number): Promise<void>;
};

export class ConnectorCommerceAdapter implements CommerceAdapter {
  constructor(
    readonly business: BusinessId,
    readonly platform: "shopify" | "woocommerce",
    private readonly connector: CommerceConnectorBridge
  ) {}

  listProducts(): Promise<ProductCandidate[]> {
    return this.connector.listProducts();
  }

  getProduct(externalId: string): Promise<ProductCandidate | undefined> {
    return this.connector.getProduct(externalId);
  }

  createDraft(input: ProductDraftInput, context: CommerceActionContext): Promise<{ externalId: string }> {
    assertCommerceContext(context, this.business);
    if (context.action !== "create_draft" && context.action !== "update_draft") {
      throw new Error("Draft adapter call requires a draft action context");
    }
    return this.connector.createDraft(input);
  }

  async publish(externalId: string, context: CommerceActionContext): Promise<void> {
    assertCommerceContext(context, this.business);
    if (context.action !== "publish") throw new Error("Publish adapter call requires publish action context");
    assertApprovalForExternalWrite(context);
    await this.connector.publish(externalId);
  }

  async updateLivePrice(externalId: string, price: number, context: CommerceActionContext): Promise<void> {
    assertCommerceContext(context, this.business);
    if (context.action !== "change_live_price") {
      throw new Error("Price adapter call requires change_live_price action context");
    }
    assertApprovalForExternalWrite(context);
    await this.connector.updateLivePrice(externalId, price);
  }
}
