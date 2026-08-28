import type { CommerceActionClass } from "../approvals.js";
import {
  BaseStoreAdapter,
  type CustomerSnapshot,
  type InventorySnapshot,
  type OrderSnapshot,
  type ProductSnapshot,
  type StoreHealth,
  type StoreMetrics,
  type StoreWriteRequest,
  type StoreWriteResult
} from "../store-adapter.js";

export type AssetAveAdapterConfig = {
  storeDomain?: string;
  apiToken?: string;
};

export class AssetAveAdapter extends BaseStoreAdapter {
  readonly brandId = "asset-ave";
  readonly platform = "shopify";
  readonly supportedWriteActions: ReadonlySet<CommerceActionClass> = new Set();

  constructor(private readonly config: AssetAveAdapterConfig = {}) {
    super();
  }

  async health(): Promise<StoreHealth> {
    const configured = Boolean(this.config.storeDomain && this.config.apiToken);
    return {
      ok: configured,
      checkedAt: new Date().toISOString(),
      message: configured ? "adapter configured" : "Shopify credentials not configured"
    };
  }

  async products(): Promise<ProductSnapshot[]> { return []; }
  async orders(): Promise<OrderSnapshot[]> { return []; }
  async inventory(): Promise<InventorySnapshot[]> { return []; }
  async customers(): Promise<CustomerSnapshot[]> { return []; }
  async metrics(): Promise<StoreMetrics> {
    return { capturedAt: new Date().toISOString() };
  }

  protected async executeWrite(_request: StoreWriteRequest): Promise<StoreWriteResult> {
    throw new Error("Asset Ave write connector is intentionally disabled until approved Shopify write scopes are configured");
  }
}
