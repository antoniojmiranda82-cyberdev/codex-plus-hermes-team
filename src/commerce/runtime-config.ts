import { z } from "zod";

const OptionalUrl = z.string().url().optional();
const OptionalSecret = z.string().min(1).optional();

export const QCommerceRuntimeConfigSchema = z.object({
  shopify: z.object({
    storeDomain: z.string().min(1).optional(),
    accessToken: OptionalSecret,
    apiVersion: z.string().regex(/^\d{4}-\d{2}$/).default("2026-07")
  }),
  wooCommerce: z.object({
    siteUrl: OptionalUrl,
    consumerKey: OptionalSecret,
    consumerSecret: OptionalSecret
  }),
  omniRouter: z.object({
    baseUrl: OptionalUrl,
    apiKey: OptionalSecret
  }),
  n8n: z.object({
    webhookUrl: OptionalUrl
  }),
  slack: z.object({
    executiveCommand: OptionalSecret,
    ceoApprovals: OptionalSecret,
    assetAveOps: OptionalSecret,
    dreamBlvdOps: OptionalSecret,
    agentActivity: OptionalSecret
  })
});

export type QCommerceRuntimeConfig = z.infer<typeof QCommerceRuntimeConfigSchema>;

export type IntegrationReadiness = {
  id: "shopify" | "woocommerce" | "omnirouter" | "n8n" | "slack";
  configured: boolean;
  missing: string[];
};

export function loadQCommerceRuntimeConfig(env: NodeJS.ProcessEnv = process.env): QCommerceRuntimeConfig {
  return QCommerceRuntimeConfigSchema.parse({
    shopify: {
      storeDomain: env.QCOM_SHOPIFY_STORE_DOMAIN,
      accessToken: env.QCOM_SHOPIFY_ACCESS_TOKEN,
      apiVersion: env.QCOM_SHOPIFY_API_VERSION ?? "2026-07"
    },
    wooCommerce: {
      siteUrl: env.QCOM_WOO_SITE_URL,
      consumerKey: env.QCOM_WOO_CONSUMER_KEY,
      consumerSecret: env.QCOM_WOO_CONSUMER_SECRET
    },
    omniRouter: {
      baseUrl: env.QCOM_OMNIROUTER_BASE_URL,
      apiKey: env.QCOM_OMNIROUTER_API_KEY
    },
    n8n: {
      webhookUrl: env.QCOM_N8N_WEBHOOK_URL
    },
    slack: {
      executiveCommand: env.QCOM_SLACK_EXECUTIVE_COMMAND,
      ceoApprovals: env.QCOM_SLACK_CEO_APPROVALS,
      assetAveOps: env.QCOM_SLACK_ASSET_AVE_OPS,
      dreamBlvdOps: env.QCOM_SLACK_DREAM_BLVD_OPS,
      agentActivity: env.QCOM_SLACK_AGENT_ACTIVITY
    }
  });
}

export function integrationReadiness(config: QCommerceRuntimeConfig): IntegrationReadiness[] {
  const check = (
    id: IntegrationReadiness["id"],
    fields: Array<[string, unknown]>
  ): IntegrationReadiness => {
    const missing = fields.filter(([, value]) => !value).map(([name]) => name);
    return { id, configured: missing.length === 0, missing };
  };

  return [
    check("shopify", [
      ["QCOM_SHOPIFY_STORE_DOMAIN", config.shopify.storeDomain],
      ["QCOM_SHOPIFY_ACCESS_TOKEN", config.shopify.accessToken]
    ]),
    check("woocommerce", [
      ["QCOM_WOO_SITE_URL", config.wooCommerce.siteUrl],
      ["QCOM_WOO_CONSUMER_KEY", config.wooCommerce.consumerKey],
      ["QCOM_WOO_CONSUMER_SECRET", config.wooCommerce.consumerSecret]
    ]),
    check("omnirouter", [
      ["QCOM_OMNIROUTER_BASE_URL", config.omniRouter.baseUrl],
      ["QCOM_OMNIROUTER_API_KEY", config.omniRouter.apiKey]
    ]),
    check("n8n", [["QCOM_N8N_WEBHOOK_URL", config.n8n.webhookUrl]]),
    check("slack", [
      ["QCOM_SLACK_EXECUTIVE_COMMAND", config.slack.executiveCommand],
      ["QCOM_SLACK_CEO_APPROVALS", config.slack.ceoApprovals],
      ["QCOM_SLACK_ASSET_AVE_OPS", config.slack.assetAveOps],
      ["QCOM_SLACK_DREAM_BLVD_OPS", config.slack.dreamBlvdOps],
      ["QCOM_SLACK_AGENT_ACTIVITY", config.slack.agentActivity]
    ])
  ];
}
