import { describe, expect, it } from "vitest";
import {
  DreamBlvdAdapter,
  type DreamBlvdReadSource
} from "../src/commerce/adapters/dream-blvd.js";

const source: DreamBlvdReadSource = {
  async health() {
    return { ok: true, checkedAt: "2026-08-28T12:00:00.000Z", message: "connected" };
  },
  async products() {
    return [{ id: "p1", sku: "DB-1", title: "Dream Product", price: 39.99, active: true }];
  },
  async orders() {
    return [{ id: "o1", createdAt: "2026-08-28T12:00:00.000Z", total: 39.99, status: "processing" }];
  },
  async inventory() {
    return [{ productId: "p1", sku: "DB-1", quantityAvailable: 8, updatedAt: "2026-08-28T12:00:00.000Z" }];
  },
  async customers() {
    return [{ id: "c1", ordersCount: 2, totalSpent: 79.98 }];
  },
  async metrics() {
    return {
      revenue: 79.98,
      orders: 2,
      averageOrderValue: 39.99,
      capturedAt: "2026-08-28T12:00:00.000Z"
    };
  }
};

describe("Dream Blvd read source", () => {
  it("uses an injected live read source while leaving writes disabled", async () => {
    const adapter = new DreamBlvdAdapter({ siteUrl: "https://dream.example", readSource: source });
    const snapshot = await adapter.snapshot();

    expect(snapshot.health.ok).toBe(true);
    expect(snapshot.products[0]?.title).toBe("Dream Product");
    expect(snapshot.metrics.orders).toBe(2);
    expect(adapter.supportedWriteActions.size).toBe(0);
  });

  it("fails closed when no read source is configured", async () => {
    const adapter = new DreamBlvdAdapter({ siteUrl: "https://dream.example" });
    expect((await adapter.health()).ok).toBe(false);
    expect(await adapter.orders()).toEqual([]);
  });
});
