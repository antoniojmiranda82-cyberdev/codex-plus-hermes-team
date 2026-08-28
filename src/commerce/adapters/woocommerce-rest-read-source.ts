import type {
  CustomerSnapshot,
  InventorySnapshot,
  OrderSnapshot,
  ProductSnapshot,
  StoreHealth,
  StoreMetrics
} from "../store-adapter.js";
import type { DreamBlvdReadSource } from "./dream-blvd.js";

type WooCommerceRestConfig = {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
  fetchImpl?: typeof fetch;
};

type WooProduct = {
  id: number;
  name: string;
  status: string;
  price: string;
  sku?: string;
  stock_quantity?: number | null;
};

type WooOrder = {
  id: number;
  date_created_gmt?: string | null;
  date_created?: string | null;
  total: string;
  status: string;
  customer_id?: number;
};

type WooCustomer = {
  id: number;
  email?: string;
  billing?: { phone?: string };
  orders_count?: number;
  total_spent?: string;
};

export class WooCommerceRestReadSource implements DreamBlvdReadSource {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly config: WooCommerceRestConfig) {
    if (!config.siteUrl || !config.consumerKey || !config.consumerSecret) {
      throw new Error("WooCommerce siteUrl, consumerKey, and consumerSecret are required");
    }
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.baseUrl = config.siteUrl.replace(/\/$/, "");
  }

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString("base64")}`;
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}/wp-json/wc/v3${path}`, {
      method: "GET",
      headers: {
        authorization: this.authHeader(),
        accept: "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`WooCommerce REST request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
  }

  async health(): Promise<StoreHealth> {
    try {
      await this.get<WooProduct[]>("/products?per_page=1");
      return {
        ok: true,
        checkedAt: new Date().toISOString(),
        message: "WooCommerce REST healthy"
      };
    } catch (error) {
      return {
        ok: false,
        checkedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "WooCommerce health check failed"
      };
    }
  }

  async products(): Promise<ProductSnapshot[]> {
    const products = await this.get<WooProduct[]>("/products?per_page=50&status=publish");
    return products.map((product) => ({
      id: String(product.id),
      ...(product.sku ? { sku: product.sku } : {}),
      title: product.name,
      price: Number(product.price || 0),
      active: product.status === "publish"
    }));
  }

  async orders(): Promise<OrderSnapshot[]> {
    const orders = await this.get<WooOrder[]>("/orders?per_page=50&orderby=date&order=desc");
    return orders.map((order) => ({
      id: String(order.id),
      createdAt: order.date_created_gmt ?? order.date_created ?? new Date(0).toISOString(),
      total: Number(order.total || 0),
      status: order.status,
      ...(order.customer_id ? { customerId: String(order.customer_id) } : {})
    }));
  }

  async inventory(): Promise<InventorySnapshot[]> {
    const products = await this.get<WooProduct[]>("/products?per_page=50");
    const capturedAt = new Date().toISOString();
    return products.map((product) => ({
      productId: String(product.id),
      ...(product.sku ? { sku: product.sku } : {}),
      quantityAvailable: product.stock_quantity ?? 0,
      updatedAt: capturedAt
    }));
  }

  async customers(): Promise<CustomerSnapshot[]> {
    const customers = await this.get<WooCustomer[]>("/customers?per_page=50");
    return customers.map((customer) => ({
      id: String(customer.id),
      ...(customer.email ? { email: customer.email } : {}),
      ...(customer.billing?.phone ? { phone: customer.billing.phone } : {}),
      ...(customer.orders_count !== undefined ? { ordersCount: customer.orders_count } : {}),
      ...(customer.total_spent !== undefined ? { totalSpent: Number(customer.total_spent || 0) } : {})
    }));
  }

  async metrics(): Promise<StoreMetrics> {
    const orders = await this.orders();
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    return {
      revenue,
      orders: orders.length,
      averageOrderValue: orders.length ? revenue / orders.length : 0,
      capturedAt: new Date().toISOString()
    };
  }
}
