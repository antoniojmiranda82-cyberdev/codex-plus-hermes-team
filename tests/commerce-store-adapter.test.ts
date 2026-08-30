import { describe, expect, it } from "vitest";
import { AssetAveAdapter } from "../src/commerce/adapters/asset-ave.js";
import { DreamBlvdAdapter } from "../src/commerce/adapters/dream-blvd.js";
import { UnsupportedStoreWriteError } from "../src/commerce/store-adapter.js";

describe("store adapter contracts", () => {
  it("keeps Asset Ave writes disabled until configured", async () => {
    const adapter = new AssetAveAdapter();
    expect(adapter.platform).toBe("shopify");
    expect((await adapter.health()).ok).toBe(false);
    await expect(
      adapter.write({ actionClass: "price_change", idempotencyKey: "price-1", payload: {} })
    ).rejects.toBeInstanceOf(UnsupportedStoreWriteError);
  });

  it("keeps Dream Blvd writes disabled until configured", async () => {
    const adapter = new DreamBlvdAdapter();
    expect(adapter.platform).toBe("wordpress-woocommerce");
    expect((await adapter.health()).ok).toBe(false);
    await expect(
      adapter.write({ actionClass: "public_publish", idempotencyKey: "publish-1", payload: {} })
    ).rejects.toBeInstanceOf(UnsupportedStoreWriteError);
  });

  it("returns a normalized snapshot shape", async () => {
    const snapshot = await new AssetAveAdapter().snapshot();
    expect(snapshot.brandId).toBe("asset-ave");
    expect(snapshot.products).toEqual([]);
    expect(snapshot.orders).toEqual([]);
    expect(snapshot.inventory).toEqual([]);
    expect(snapshot.customers).toEqual([]);
    expect(snapshot.metrics.capturedAt).toContain("T");
  });
});
