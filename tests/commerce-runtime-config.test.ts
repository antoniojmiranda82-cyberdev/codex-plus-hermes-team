import { describe, expect, it } from "vitest";
import { integrationReadiness, loadQCommerceRuntimeConfig } from "../src/commerce/runtime-config.js";

describe("Q Commerce runtime config", () => {
  it("loads integrations from environment without inventing secrets", () => {
    const config = loadQCommerceRuntimeConfig({
      QCOM_SHOPIFY_STORE_DOMAIN: "example.myshopify.com",
      QCOM_SHOPIFY_ACCESS_TOKEN: "token",
      QCOM_WOO_SITE_URL: "https://dream.example",
      QCOM_WOO_CONSUMER_KEY: "ck_test",
      QCOM_WOO_CONSUMER_SECRET: "cs_test",
      QCOM_OMNIROUTER_BASE_URL: "https://router.example",
      QCOM_OMNIROUTER_API_KEY: "router-key",
      QCOM_N8N_WEBHOOK_URL: "https://n8n.example/webhook/q-commerce",
      QCOM_SLACK_EXECUTIVE_COMMAND: "C1",
      QCOM_SLACK_CEO_APPROVALS: "C2",
      QCOM_SLACK_ASSET_AVE_OPS: "C3",
      QCOM_SLACK_DREAM_BLVD_OPS: "C4",
      QCOM_SLACK_AGENT_ACTIVITY: "C5"
    });

    expect(integrationReadiness(config).every((item) => item.configured)).toBe(true);
  });

  it("reports exactly what is missing", () => {
    const readiness = integrationReadiness(loadQCommerceRuntimeConfig({}));
    const shopify = readiness.find((item) => item.id === "shopify");
    expect(shopify?.configured).toBe(false);
    expect(shopify?.missing).toContain("QCOM_SHOPIFY_ACCESS_TOKEN");
  });
});
