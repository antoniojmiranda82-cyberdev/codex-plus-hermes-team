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

export interface DreamBlvdReadSource {
  health(): Promise<StoreHealth>;
  products(): Promise<ProductSnapshot[]>;
  orders(): Promise<OrderSnapshot[]>;
  inventory(): Promise<InventorySnapshot[]>;
  customers(): Promise<CustomerSnapshot[]>;
  metrics(): Promise<StoreMetrics>;
}

export type DreamBlvdAdapterConfig = {
  siteUrl?: string;
  apiToken?: string;
  readSource?: DreamBlvdReadSource;
};

export class DreamBlvdAdapter extends BaseStoreAdapter {
  readonly brandId = "dream-blvd";
  readonly platform = "wordpress-woocommerce";
  readonly supportedWriteActions: ReadonlySet<CommerceActionClass> = new Set();

  constructor(private readonly config: DreamBlvdAdapterConfig = {}) {
    super();
  }

  async health(): Promise<StoreHealth> {
    if (this.config.readSource) {
      return this.config.readSource.health();
    }

    return {
      ok: false,
      checkedAt: new Date().toISOString(),
      message: this.config.siteUrl
        ? "WordPress/WooCommerce read source not configured"
        : "WordPress/WooCommerce site URL and read source not configured"
    };
  }

  async products(): Promise<ProductSnapshot[]> {
    return this.config.readSource?.products() ?? [];
  }

  async orders(): Promise<OrderSnapshot[]> {
    return this.config.readSource?.orders() ?? [];
  }

  async inventory(): Promise<InventorySnapshot[]> {
    return this.config.readSource?.inventory() ?? [];
  }

  async customers(): Promise<CustomerSnapshot[]> {
    return this.config.readSource?.customers() ?? [];
  }

  async metrics(): Promise<StoreMetrics> {
    return this.config.readSource?.metrics() ?? { capturedAt: new Date().toISOString() };
  }

  protected async executeWrite(_request: StoreWriteRequest): Promise<StoreWriteResult> {
    throw new Error("Dream Blvd write connector is intentionally disabled until approved WooCommerce write scopes are configured");
  }
}
