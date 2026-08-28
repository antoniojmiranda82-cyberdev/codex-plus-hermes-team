import { describe, expect, it } from "vitest";
import {
  InMemoryTaskStore,
  MockAgentExecutor,
  OperatorService,
  createDryRunSlackReporter
} from "../src/operator.js";

describe("OperatorService", () => {
  it("creates a queued task for one of the supported businesses", () => {
    const service = new OperatorService(new InMemoryTaskStore(), new MockAgentExecutor());
    const task = service.createTask({
      business: "asset-ave",
      title: "Audit featured products",
      prompt: "Check listing integrity",
      agentProfile: "team-asset-commerce"
    });

    expect(task.business).toBe("asset-ave");
    expect(task.status).toBe("queued");
    expect(task.attempts).toBe(0);
  });

  it("rejects an external-side-effect task until explicit approval exists", async () => {
    const service = new OperatorService(new InMemoryTaskStore(), new MockAgentExecutor());
    const task = service.createTask({
      business: "dream-blvd",
      title: "Publish campaign",
      prompt: "Publish the campaign",
      agentProfile: "team-growth",
      approvalRequirement: "external_side_effect"
    });

    await expect(service.runTask(task.id)).rejects.toThrow(/approval/i);
    expect(service.getTask(task.id).status).toBe("blocked");
  });

  it("runs approved tasks through queued, running, and completed states", async () => {
    const service = new OperatorService(new InMemoryTaskStore(), new MockAgentExecutor());
    const task = service.createTask({
      business: "asset-ave",
      title: "Catalog QA",
      prompt: "Review the catalog",
      agentProfile: "team-qa"
    });

    const result = await service.runTask(task.id);

    expect(result.status).toBe("completed");
    expect(result.attempts).toBe(1);
    expect(result.resultSummary).toContain("team-qa");
  });

  it("can retry a failed task without silently losing the prior error", async () => {
    const executor = new MockAgentExecutor({ failFirstAttempt: true });
    const service = new OperatorService(new InMemoryTaskStore(), executor);
    const task = service.createTask({
      business: "dream-blvd",
      title: "Page QA",
      prompt: "Check product page",
      agentProfile: "team-dream-commerce"
    });

    await expect(service.runTask(task.id)).rejects.toThrow(/mock failure/i);
    expect(service.getTask(task.id).status).toBe("failed");
    expect(service.getTask(task.id).lastError).toMatch(/mock failure/i);

    const retried = await service.retryTask(task.id);
    expect(retried.status).toBe("completed");
    expect(retried.attempts).toBe(2);
    expect(retried.lastError).toMatch(/mock failure/i);
  });
});

describe("dry-run Slack reporter", () => {
  it("records reports without making a network call", async () => {
    const reporter = createDryRunSlackReporter();
    await reporter.report({ business: "asset-ave", text: "3 tasks completed" });

    expect(reporter.messages).toEqual([
      { business: "asset-ave", text: "3 tasks completed" }
    ]);
  });
});
