import { describe, expect, it } from "vitest";
import { routeAgents } from "../src/router.js";
import type { TeamAgent } from "../src/types.js";

const agents: TeamAgent[] = [
  {
    profile: "architect",
    role: "architecture",
    capabilities: ["architecture", "planning", "tradeoffs"],
    disabled: false
  },
  {
    profile: "researcher",
    role: "research",
    capabilities: ["research", "sources", "documentation"],
    disabled: false
  },
  {
    profile: "reviewer",
    role: "review",
    capabilities: ["code review", "risk analysis", "tests"],
    disabled: false
  },
  {
    profile: "legal",
    role: "legal",
    capabilities: ["legal review", "contracts", "compliance"],
    disabled: false
  }
];

describe("routeAgents", () => {
  it("selects matching specialist profiles", () => {
    const decision = routeAgents(agents, "Need documentation sources and research", { maxAgents: 2 });

    expect(decision.selected.map((agent) => agent.profile)).toEqual(["researcher"]);
    expect(decision.confidence).toBeGreaterThan(0);
    expect(decision.why[0]).toContain("researcher");
    expect(decision.routeMode).toBe("matched");
    expect(decision.scores[0]?.profile).toBe("researcher");
    expect(decision.scores[0]?.selected).toBe(true);
  });

  it("falls back to default profiles when no keyword matches", () => {
    const decision = routeAgents(agents, "Something vague", {
      maxAgents: 2,
      defaultProfiles: ["architect", "reviewer"]
    });

    expect(decision.selected.map((agent) => agent.profile)).toEqual(["architect", "reviewer"]);
    expect(decision.routeMode).toBe("default_profiles");
    expect(decision.confidence).toBe(0.25);
  });

  it("routes Russian task wording through multilingual aliases", () => {
    const decision = routeAgents(agents, "Нужна юридическая проверка договора и комплаенс-рисков", {
      maxAgents: 2
    });

    expect(decision.selected.map((agent) => agent.profile)[0]).toBe("legal");
    expect(decision.scores[0]?.matched).toContain("legal");
    expect(decision.scores[0]?.matched).toContain("contracts");
  });
});
