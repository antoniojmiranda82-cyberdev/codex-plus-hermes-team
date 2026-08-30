import type { CommerceActionClass } from "./approvals.js";

export type KillSwitchScope =
  | { kind: "system" }
  | { kind: "brand"; id: string }
  | { kind: "integration"; id: string }
  | { kind: "campaign"; id: string }
  | { kind: "agent"; id: string };

export type KillSwitch = KillSwitchScope & {
  enabled: boolean;
  reason?: string;
};

export type ActionContext = {
  actionClass: CommerceActionClass;
  brandId: string;
  integrationId?: string;
  campaignId?: string;
  agentId: string;
};

export type IntegrationHealth = {
  id: string;
  ok: boolean;
  required: boolean;
  message?: string;
};

export type CommerceSystemHealth = {
  ok: boolean;
  criticalFailures: string[];
  degraded: string[];
};

function disabled(switches: KillSwitch[], predicate: (item: KillSwitch) => boolean): boolean {
  return switches.some((item) => item.enabled && predicate(item));
}

export function isActionEnabled(context: ActionContext, switches: KillSwitch[]): boolean {
  if (disabled(switches, (item) => item.kind === "system")) return false;
  if (disabled(switches, (item) => item.kind === "brand" && item.id === context.brandId)) return false;
  if (
    context.integrationId &&
    disabled(switches, (item) => item.kind === "integration" && item.id === context.integrationId)
  ) return false;
  if (
    context.campaignId &&
    disabled(switches, (item) => item.kind === "campaign" && item.id === context.campaignId)
  ) return false;
  if (disabled(switches, (item) => item.kind === "agent" && item.id === context.agentId)) return false;
  return true;
}

export function evaluateSystemHealth(integrations: IntegrationHealth[]): CommerceSystemHealth {
  const criticalFailures = integrations
    .filter((integration) => integration.required && !integration.ok)
    .map((integration) => `${integration.id}: ${integration.message ?? "unhealthy"}`);
  const degraded = integrations
    .filter((integration) => !integration.required && !integration.ok)
    .map((integration) => `${integration.id}: ${integration.message ?? "unhealthy"}`);

  return {
    ok: criticalFailures.length === 0,
    criticalFailures,
    degraded
  };
}
