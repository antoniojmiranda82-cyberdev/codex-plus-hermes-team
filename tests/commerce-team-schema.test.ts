import { describe, expect, it } from "vitest";
import { validateCommerceTeamConfig } from "../src/commerce/team-schema.js";

function validConfig() {
  return {
    safety: { defaultSideEffectPolicy: "external_side_effects_need_approval" },
    agents: [
      { profile: "qcom-chief-of-staff", role: "executive_orchestrator" },
      { profile: "qcom-asset-ave-gm", role: "brand_general_manager" },
      { profile: "qcom-dream-blvd-gm", role: "brand_general_manager" }
    ]
  };
}

describe("validateCommerceTeamConfig", () => {
  it("accepts the required supervised commerce leadership", () => {
    const result = validateCommerceTeamConfig(validConfig());
    expect(result.success).toBe(true);
  });

  it("rejects duplicate profiles", () => {
    const config = validConfig();
    config.agents.push({ profile: "qcom-asset-ave-gm", role: "brand_general_manager" });
    const result = validateCommerceTeamConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.join(" ")).toContain("duplicate agent profile");
  });

  it("rejects a missing brand GM", () => {
    const config = validConfig();
    config.agents = config.agents.filter((agent) => agent.profile !== "qcom-dream-blvd-gm");
    const result = validateCommerceTeamConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.join(" ")).toContain("qcom-dream-blvd-gm");
  });

  it("rejects an unsafe default side-effect policy", () => {
    const config = validConfig();
    config.safety.defaultSideEffectPolicy = "advice_only";
    const result = validateCommerceTeamConfig(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join(" ")).toContain("external_side_effects_need_approval");
    }
  });
});
