import { describe, expect, it } from "vitest";
import { ShopifyGraphqlReadSource } from "../src/commerce/adapters/shopify-graphql-read-source.js";
import { WooCommerceRestReadSource } from "../src/commerce/adapters/woocommerce-rest-read-source.js";

describe("commerce live read sources", () => {
  it("uses Shopify GraphQL Admin API with token auth", async () => {
    let seenUrl = "";
    let seenHeaders: HeadersInit | undefined;
    const source = new ShopifyGraphqlReadSource({
      storeDomain: "example.myshopify.com",
      accessToken: "shopify-token",
      fetchImpl: async (input, init) => {
        seenUrl = String(input);
        seenHeaders = init?.headers;
        return new Response(JSON.stringify({ data: { shop: { id: "gid://shopify/Shop/1" } } }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }
    });

    const health = await source.health();
    expect(health.ok).toBe(true);
    expect(seenUrl).toContain("/admin/api/2026-07/graphql.json");
    expect((seenHeaders as Record<string, string>)["x-shopify-access-token"]).toBe("shopify-token");
  });

  it("uses WooCommerce v3 REST with basic auth", async () => {
    let seenUrl = "";
    let seenHeaders: HeadersInit | undefined;
    const source = new WooCommerceRestReadSource({
      siteUrl: "https://dream.example",
      consumerKey: "ck_test",
      consumerSecret: "cs_test",
      fetchImpl: async (input, init) => {
        seenUrl = String(input);
        seenHeaders = init?.headers;
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }
    });

    const products = await source.products();
    expect(products).toEqual([]);
    expect(seenUrl).toBe("https://dream.example/wp-json/wc/v3/products?per_page=50&status=publish");
    expect((seenHeaders as Record<string, string>).authorization).toMatch(/^Basic /);
  });
});
