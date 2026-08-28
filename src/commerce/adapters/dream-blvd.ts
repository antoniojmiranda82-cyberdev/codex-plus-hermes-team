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

export type DreamBlvdAdapterConfig = {
  siteUrl?: string;
  apiToken?: string;
};

export class DreamBlvdAdapter extends BaseStoreAdapter {
  readonly brandId = "dream-blvd";
  readonly platform = "wordpress-woocommerce";
  readonly supportedWriteActions: ReadonlySet<CommerceActionClass> = new Set();

  constructor(private readonly config: DreamBlvdAdapterConfig = {}) {
    super();
  }

  async health(): Promise<StoreHealth> {
    const configured = Boolean(this.config.siteUrl && this.config.apiToken);
    return {
      ok: configured,
      checkedAt: new Date().toISOString(),
      message: configured ? "adapter configured" : "WordPress/WooCommerce credentials not configured"
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
    throw new Error("Dream Blvd write connector is intentionally disabled until approved WooCommerce write scopes are configured");
  }
}
