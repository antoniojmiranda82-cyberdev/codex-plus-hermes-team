import type { CommerceActionClass } from "./approvals.js";

export type StoreHealth = {
  ok: boolean;
  checkedAt: string;
  message?: string;
};

export type ProductSnapshot = {
  id: string;
  sku?: string;
  title: string;
  price: number;
  cost?: number;
  active: boolean;
};

export type OrderSnapshot = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  customerId?: string;
};

export type InventorySnapshot = {
  productId: string;
  sku?: string;
  quantityAvailable: number;
  updatedAt: string;
};

export type CustomerSnapshot = {
  id: string;
  email?: string;
  phone?: string;
  ordersCount?: number;
  totalSpent?: number;
};

export type StoreMetrics = {
  revenue?: number;
  profit?: number;
  orders?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  refundRate?: number;
  capturedAt: string;
};

export type StoreSnapshot = {
  brandId: string;
  health: StoreHealth;
  products: ProductSnapshot[];
  orders: OrderSnapshot[];
  inventory: InventorySnapshot[];
  customers: CustomerSnapshot[];
  metrics: StoreMetrics;
};

export type StoreWriteRequest = {
  actionClass: CommerceActionClass;
  idempotencyKey: string;
  payload: Record<string, unknown>;
};

export type StoreWriteResult = {
  ok: boolean;
  externalId?: string;
  message?: string;
};

export class UnsupportedStoreWriteError extends Error {
  constructor(public readonly actionClass: CommerceActionClass) {
    super(`store adapter does not support write action: ${actionClass}`);
  }
}

export interface StoreAdapter {
  readonly brandId: string;
  readonly platform: string;
  readonly supportedWriteActions: ReadonlySet<CommerceActionClass>;
  health(): Promise<StoreHealth>;
  products(): Promise<ProductSnapshot[]>;
  orders(): Promise<OrderSnapshot[]>;
  inventory(): Promise<InventorySnapshot[]>;
  customers(): Promise<CustomerSnapshot[]>;
  metrics(): Promise<StoreMetrics>;
  write(request: StoreWriteRequest): Promise<StoreWriteResult>;
}

export abstract class BaseStoreAdapter implements StoreAdapter {
  abstract readonly brandId: string;
  abstract readonly platform: string;
  abstract readonly supportedWriteActions: ReadonlySet<CommerceActionClass>;

  abstract health(): Promise<StoreHealth>;
  abstract products(): Promise<ProductSnapshot[]>;
  abstract orders(): Promise<OrderSnapshot[]>;
  abstract inventory(): Promise<InventorySnapshot[]>;
  abstract customers(): Promise<CustomerSnapshot[]>;
  abstract metrics(): Promise<StoreMetrics>;

  async write(request: StoreWriteRequest): Promise<StoreWriteResult> {
    if (!this.supportedWriteActions.has(request.actionClass)) {
      throw new UnsupportedStoreWriteError(request.actionClass);
    }
    return this.executeWrite(request);
  }

  protected abstract executeWrite(request: StoreWriteRequest): Promise<StoreWriteResult>;

  async snapshot(): Promise<StoreSnapshot> {
    const [health, products, orders, inventory, customers, metrics] = await Promise.all([
      this.health(),
      this.products(),
      this.orders(),
      this.inventory(),
      this.customers(),
      this.metrics()
    ]);
    return { brandId: this.brandId, health, products, orders, inventory, customers, metrics };
  }
}
