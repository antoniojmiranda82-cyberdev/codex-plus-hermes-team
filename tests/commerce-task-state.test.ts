import { describe, expect, it } from "vitest";
import { checkpointTask, createDurableTaskState, renderAiHandoff } from "../src/commerce/task-state.js";

describe("durable task state", () => {
  it("creates a portable task checkpoint", () => {
    const task = createDurableTaskState({
      taskId: "task-1",
      correlationId: "corr-1",
      brandId: "asset-ave",
      assignedAgentId: "qcom-product-scout",
      status: "working",
      objective: "Find high-margin product opportunities",
      inputSummary: "Review current assortment and trend signals",
      outputSummary: "",
      currentBlocker: null,
      nextAction: "Score candidates",
      artifacts: [],
      evidence: [],
      modelHistory: []
    });

    const handedOff = checkpointTask(task, {
      status: "waiting",
      outputSummary: "Three candidate categories identified",
      currentBlocker: "Model context exhausted",
      nextAction: "Continue scoring candidates"
    });

    expect(handedOff.taskId).toBe(task.taskId);
    expect(handedOff.status).toBe("waiting");
    expect(renderAiHandoff(handedOff)).toContain("Continue scoring candidates");
    expect(renderAiHandoff(handedOff)).toContain("Model context exhausted");
  });
});
