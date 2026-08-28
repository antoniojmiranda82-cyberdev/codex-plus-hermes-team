import type { ApprovalRequest } from "./approvals.js";
import type { CommerceEvent } from "./events.js";

export const SlackChannelAlias = {
  executive: "EXECUTIVE_COMMAND",
  approvals: "CEO_APPROVALS",
  assetAve: "ASSET_AVE_OPS",
  dreamBlvd: "DREAM_BLVD_OPS",
  activity: "AGENT_ACTIVITY"
} as const;

export type SlackChannelAliasValue = (typeof SlackChannelAlias)[keyof typeof SlackChannelAlias];

export type SlackRoute = {
  alias: SlackChannelAliasValue;
  reason: string;
};

export function routeCommerceNotification(event: CommerceEvent): SlackRoute {
  if (event.severity === "critical" || event.eventType === "commerce.alert.critical") {
    return { alias: SlackChannelAlias.executive, reason: "critical owner escalation" };
  }

  if (event.requiresApproval || event.severity === "approval" || event.eventType === "commerce.approval.requested") {
    return { alias: SlackChannelAlias.approvals, reason: "owner approval required" };
  }

  if (event.brandId === "asset-ave" && !event.eventType.startsWith("commerce.task.")) {
    return { alias: SlackChannelAlias.assetAve, reason: "Asset Ave operational event" };
  }

  if (event.brandId === "dream-blvd" && !event.eventType.startsWith("commerce.task.")) {
    return { alias: SlackChannelAlias.dreamBlvd, reason: "Dream Blvd operational event" };
  }

  return { alias: SlackChannelAlias.activity, reason: "routine agent activity" };
}

export function resolveSlackChannelId(
  alias: SlackChannelAliasValue,
  env: NodeJS.ProcessEnv = process.env
): string {
  const id = env[`QCOM_SLACK_${alias}`];
  if (!id) throw new Error(`Missing Slack channel id for alias ${alias}`);
  return id;
}

export function formatApprovalRequest(request: ApprovalRequest): string {
  const { action } = request;
  const cost = action.estimatedCost === null ? "not provided" : `$${action.estimatedCost.toFixed(2)}`;
  return [
    "**CEO APPROVAL REQUIRED**",
    `Brand: ${action.brandId}`,
    `Agent: ${action.requestingAgentId}`,
    `Action: ${action.actionClass}`,
    `Summary: ${action.summary}`,
    `Expected upside: ${action.expectedUpside}`,
    `Risk: ${action.downsideRisk}`,
    `Estimated cost: ${cost}`,
    `Rollback: ${action.rollback}`,
    `Approval ID: ${request.id}`
  ].join("\n");
}

export type ExecutiveBriefInput = {
  generatedAt: string;
  revenue?: number;
  profit?: number;
  orders?: number;
  risks: string[];
  opportunities: string[];
  approvalsPending: number;
};

export function formatExecutiveBrief(input: ExecutiveBriefInput): string {
  const money = (value: number | undefined) => (value === undefined ? "n/a" : `$${value.toFixed(2)}`);
  return [
    "**Q COMMERCE EXECUTIVE BRIEF**",
    `Generated: ${input.generatedAt}`,
    `Revenue: ${money(input.revenue)}`,
    `Profit: ${money(input.profit)}`,
    `Orders: ${input.orders ?? "n/a"}`,
    `Approvals pending: ${input.approvalsPending}`,
    "",
    `Top risks: ${input.risks.length ? input.risks.join(" | ") : "none"}`,
    `Top opportunities: ${input.opportunities.length ? input.opportunities.join(" | ") : "none"}`
  ].join("\n");
}
