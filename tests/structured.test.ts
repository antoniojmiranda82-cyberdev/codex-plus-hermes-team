import { describe, expect, it } from "vitest";
import { collectKanbanResult, normalizeRoleDiscovery, synthesizePanel } from "../src/structured.js";
import type { AskAgentResult, TeamAgent } from "../src/types.js";

describe("structured helpers", () => {
  it("normalizes role discovery JSON from a profile", () => {
    const agent: TeamAgent = {
      profile: "legal",
      role: "legal",
      capabilities: ["contracts"],
      disabled: false
    };
    const result: AskAgentResult = {
      profile: "legal",
      text: JSON.stringify({
        role: "legal reviewer",
        capabilities: ["contracts", "policy risk"],
        useWhen: ["public launch"],
        avoidWhen: ["visual design"],
        preferredOutput: "risks first",
        confidence: 0.9
      })
    };

    expect(normalizeRoleDiscovery(agent, result)).toMatchObject({
      profile: "legal",
      role: "legal reviewer",
      capabilities: ["contracts", "policy risk"],
      useWhen: ["public launch"],
      confidence: 0.9
    });
  });

  it("builds panel synthesis buckets from specialist headings", () => {
    const responses: AskAgentResult[] = [
      {
        profile: "researcher",
        text: [
          "## Recommendation",
          "- Ship a narrow MVP.",
          "## Evidence",
          "- Users ask for MCP integrations.",
          "## Risks",
          "- Install friction.",
          "## Disagreement Or Caveats",
          "- Need a demo.",
          "## Next Actions",
          "- Record a smoke test."
        ].join("\n")
      }
    ];

    expect(synthesizePanel("launch", responses)).toMatchObject({
      agreement: ["Ship a narrow MVP."],
      evidence: ["Users ask for MCP integrations."],
      risks: ["Install friction."],
      disagreement: ["Need a demo."],
      nextActions: ["Record a smoke test."]
    });
  });

  it("collects a clean Kanban result from raw task data", () => {
    const collected = collectKanbanResult(
      "t_123",
      {
        title: "Review launch",
        status: "done",
        assignee: "legal",
        result: "No blocking legal issue."
      },
      []
    );

    expect(collected).toMatchObject({
      taskId: "t_123",
      done: true,
      assignee: "legal",
      result: "No blocking legal issue."
    });
  });
});
