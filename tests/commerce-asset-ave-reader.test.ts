import { describe, expect, it } from "vitest";
import {
  AssetAveAdapter,
  type AssetAveReadSource
} from "../src/commerce/adapters/asset-ave.js";

const source: AssetAveReadSource = {
  async health() {
    return { ok: true, checkedAt: "2026-08-28T12:00:00.000Z", message: "connected" };
  },
  async products() {
    return [{ id: "p1", sku: "SKU-1", title: "Sample", price: 29.99, active: true }];
  },
  async orders() {
    return [{ id: "o1", createdAt: "2026-08-28T12:00:00.000Z", total: 29.99, status: "paid" }];
  },
  async inventory() {
    return [{ productId: "p1", sku: "SKU-1", quantityAvailable: 12, updatedAt: "2026-08-28T12:00:00.000Z" }];
  },
  async customers() {
    return [{ id: "c1", ordersCount: 1, totalSpent: 29.99 }];
  },
  async metrics() {
    return {
      revenue: 29.99,
      orders: 1,
      conversionRate: 0.02,
      averageOrderValue: 29.99,
      capturedAt: "2026-08-28T12:00:00.000Z"
    };
  }
};

describe("Asset Ave read source", () => {
  it("uses an injected live read source while leaving writes disabled", async () => {
    const adapter = new AssetAveAdapter({ storeDomain: "shopassetave.com", readSource: source });
    const snapshot = await adapter.snapshot();

    expect(snapshot.health.ok).toBe(true);
    expect(snapshot.products).toHaveLength(1);
    expect(snapshot.inventory[0]?.quantityAvailable).toBe(12);
    expect(snapshot.metrics.revenue).toBe(29.99);
    expect(adapter.supportedWriteActions.size).toBe(0);
  });

  it("fails closed when no read source is configured", async () => {
    const adapter = new AssetAveAdapter({ storeDomain: "shopassetave.com" });
    expect((await adapter.health()).ok).toBe(false);
    expect(await adapter.products()).toEqual([]);
  });
});
