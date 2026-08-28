import type {
  CustomerSnapshot,
  InventorySnapshot,
  OrderSnapshot,
  ProductSnapshot,
  StoreHealth,
  StoreMetrics
} from "../store-adapter.js";
import type { AssetAveReadSource } from "./asset-ave.js";

type ShopifyGraphqlConfig = {
  storeDomain: string;
  accessToken: string;
  apiVersion?: string;
  fetchImpl?: typeof fetch;
};

type GraphqlEnvelope<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export class ShopifyGraphqlReadSource implements AssetAveReadSource {
  private readonly apiVersion: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: ShopifyGraphqlConfig) {
    this.apiVersion = config.apiVersion ?? "2026-07";
    this.fetchImpl = config.fetchImpl ?? fetch;
    if (!config.storeDomain || !config.accessToken) {
      throw new Error("Shopify storeDomain and accessToken are required");
    }
  }

  private endpoint(): string {
    const host = this.config.storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}/admin/api/${this.apiVersion}/graphql.json`;
  }

  private async query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await this.fetchImpl(this.endpoint(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shopify-access-token": this.config.accessToken
      },
      body: JSON.stringify({ query, variables })
    });
    if (!response.ok) {
      throw new Error(`Shopify GraphQL request failed with status ${response.status}`);
    }
    const envelope = (await response.json()) as GraphqlEnvelope<T>;
    if (envelope.errors?.length) {
      throw new Error(`Shopify GraphQL error: ${envelope.errors.map((error) => error.message ?? "unknown error").join("; ")}`);
    }
    if (!envelope.data) throw new Error("Shopify GraphQL response did not contain data");
    return envelope.data;
  }

  async health(): Promise<StoreHealth> {
    try {
      await this.query<{ shop: { id: string } }>(`query QCommerceHealth { shop { id } }`);
      return { ok: true, checkedAt: new Date().toISOString(), message: "Shopify GraphQL healthy" };
    } catch (error) {
      return {
        ok: false,
        checkedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Shopify GraphQL health check failed"
      };
    }
  }

  async products(): Promise<ProductSnapshot[]> {
    const data = await this.query<{
      products: { nodes: Array<{
        id: string;
        title: string;
        status: string;
        variants: { nodes: Array<{ sku?: string | null; price: string; inventoryQuantity?: number | null }> };
      }> };
    }>(`query QCommerceProducts($first: Int!) {
      products(first: $first) {
        nodes { id title status variants(first: 100) { nodes { sku price inventoryQuantity } } }
      }
    }`, { first: 50 });

    return data.products.nodes.map((product) => {
      const firstVariant = product.variants.nodes[0];
      return {
        id: product.id,
        ...(firstVariant?.sku ? { sku: firstVariant.sku } : {}),
        title: product.title,
        price: Number(firstVariant?.price ?? 0),
        active: product.status.toUpperCase() === "ACTIVE"
      };
    });
  }

  async orders(): Promise<OrderSnapshot[]> {
    const data = await this.query<{
      orders: { nodes: Array<{
        id: string;
        createdAt: string;
        displayFinancialStatus?: string | null;
        displayFulfillmentStatus?: string | null;
        currentTotalPriceSet: { shopMoney: { amount: string } };
        customer?: { id: string } | null;
      }> };
    }>(`query QCommerceOrders($first: Int!) {
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        nodes {
          id createdAt displayFinancialStatus displayFulfillmentStatus
          currentTotalPriceSet { shopMoney { amount } }
          customer { id }
        }
      }
    }`, { first: 50 });

    return data.orders.nodes.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      total: Number(order.currentTotalPriceSet.shopMoney.amount),
      status: [order.displayFinancialStatus, order.displayFulfillmentStatus].filter(Boolean).join("/") || "unknown",
      ...(order.customer?.id ? { customerId: order.customer.id } : {})
    }));
  }

  async inventory(): Promise<InventorySnapshot[]> {
    const data = await this.query<{
      products: { nodes: Array<{
        id: string;
        variants: { nodes: Array<{ id: string; sku?: string | null; inventoryQuantity?: number | null }> };
      }> };
    }>(`query QCommerceInventory($first: Int!) {
      products(first: $first) {
        nodes { id variants(first: 100) { nodes { id sku inventoryQuantity } } }
      }
    }`, { first: 50 });
    const capturedAt = new Date().toISOString();
    return data.products.nodes.flatMap((product) =>
      product.variants.nodes.map((variant) => ({
        productId: variant.id || product.id,
        ...(variant.sku ? { sku: variant.sku } : {}),
        quantityAvailable: variant.inventoryQuantity ?? 0,
        updatedAt: capturedAt
      }))
    );
  }

  async customers(): Promise<CustomerSnapshot[]> {
    const data = await this.query<{
      customers: { nodes: Array<{
        id: string;
        email?: string | null;
        phone?: string | null;
        numberOfOrders?: string | number | null;
        amountSpent?: { amount: string } | null;
      }> };
    }>(`query QCommerceCustomers($first: Int!) {
      customers(first: $first) {
        nodes { id email phone numberOfOrders amountSpent { amount } }
      }
    }`, { first: 50 });

    return data.customers.nodes.map((customer) => ({
      id: customer.id,
      ...(customer.email ? { email: customer.email } : {}),
      ...(customer.phone ? { phone: customer.phone } : {}),
      ...(customer.numberOfOrders !== null && customer.numberOfOrders !== undefined
        ? { ordersCount: Number(customer.numberOfOrders) }
        : {}),
      ...(customer.amountSpent?.amount ? { totalSpent: Number(customer.amountSpent.amount) } : {})
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
