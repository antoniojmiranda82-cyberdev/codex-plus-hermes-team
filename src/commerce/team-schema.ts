import { z } from "zod";
import { BridgeConfigSchema, type BridgeConfig } from "../types.js";

export const REQUIRED_COMMERCE_PROFILES = [
  "qcom-chief-of-staff",
  "qcom-asset-ave-gm",
  "qcom-dream-blvd-gm"
] as const;

export const CommerceAgentRoleSchema = z.enum([
  "executive_orchestrator",
  "brand_general_manager",
  "growth",
  "marketing",
  "copywriting",
  "social_media",
  "video_social",
  "discovery_social",
  "email_marketing",
  "sms_marketing",
  "product_intelligence",
  "pricing",
  "inventory",
  "supplier_operations",
  "conversion",
  "customer_service",
  "seo",
  "competitive_intelligence",
  "finance",
  "analytics",
  "automation",
  "technology",
  "compliance",
  "quality_assurance",
  "agent_ops"
]);

export type CommerceAgentRole = z.infer<typeof CommerceAgentRoleSchema>;

export type CommerceTeamConfig = BridgeConfig;

export type CommerceTeamValidation =
  | { success: true; data: CommerceTeamConfig }
  | { success: false; errors: string[] };

export function validateCommerceTeamConfig(input: unknown): CommerceTeamValidation {
  const parsed = BridgeConfigSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
    };
  }

  const config = parsed.data;
  const errors: string[] = [];
  const profiles = config.agents.map((agent) => agent.profile);
  const duplicates = profiles.filter((profile, index) => profiles.indexOf(profile) !== index);

  for (const profile of [...new Set(duplicates)]) {
    errors.push(`duplicate agent profile: ${profile}`);
  }

  for (const requiredProfile of REQUIRED_COMMERCE_PROFILES) {
    if (!profiles.includes(requiredProfile)) {
      errors.push(`missing required commerce agent: ${requiredProfile}`);
    }
  }

  if (config.safety.defaultSideEffectPolicy !== "external_side_effects_need_approval") {
    errors.push(
      "Q Commerce requires safety.defaultSideEffectPolicy=external_side_effects_need_approval"
    );
  }

  const chiefOfStaff = config.agents.filter((agent) => agent.role === "executive_orchestrator");
  if (chiefOfStaff.length !== 1) {
    errors.push(`expected exactly one executive_orchestrator, found ${chiefOfStaff.length}`);
  }

  const brandGms = config.agents.filter((agent) => agent.role === "brand_general_manager");
  if (brandGms.length < 2) {
    errors.push(`expected at least two brand_general_manager agents, found ${brandGms.length}`);
  }

  for (const agent of config.agents) {
    if (agent.role && !CommerceAgentRoleSchema.safeParse(agent.role).success) {
      errors.push(`unsupported commerce role for ${agent.profile}: ${agent.role}`);
    }
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, data: config };
}
