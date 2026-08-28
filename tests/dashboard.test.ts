import { describe, expect, it } from "vitest";
import { InMemoryTaskStore, MockAgentExecutor, OperatorService } from "../src/operator.js";
import { buildDashboardSnapshot } from "../src/dashboard.js";

const roster = [
  { profile: "team-asset-commerce", displayName: "Asset Commerce", role: "commerce" },
  { profile: "team-growth", displayName: "Growth", role: "growth" }
];

describe("dashboard snapshot", () => {
  it("groups task metrics by business and reports agent workload", async () => {
    const store = new InMemoryTaskStore();
    const operator = new OperatorService(store, new MockAgentExecutor());

    const asset = operator.createTask({
      business: "asset-ave",
      title: "Audit catalog",
      prompt: "Review products",
      agentProfile: "team-asset-commerce"
    });
    operator.createTask({
      business: "dream-blvd",
      title: "Draft campaign",
      prompt: "Create campaign",
      agentProfile: "team-growth",
      approvalRequirement: "external_side_effect"
    });

    await operator.runTask(asset.id);

    const snapshot = buildDashboardSnapshot(operator, roster);

    expect(snapshot.businesses["asset-ave"].completed).toBe(1);
    expect(snapshot.businesses["dream-blvd"].queued).toBe(1);
    expect(snapshot.totalTasks).toBe(2);
    expect(snapshot.agents.find((agent) => agent.profile === "team-growth")?.queued).toBe(1);
  });
});
