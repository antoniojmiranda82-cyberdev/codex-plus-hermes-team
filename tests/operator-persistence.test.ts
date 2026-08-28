import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { AgentRoster, JsonFileTaskStore, OperatorService, MockAgentExecutor } from "../src/operator.js";

const cleanup: string[] = [];

afterEach(() => {
  for (const path of cleanup.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe("JsonFileTaskStore", () => {
  test("reloads saved tasks from disk", () => {
    const dir = mkdtempSync(join(tmpdir(), "asset-dream-store-"));
    cleanup.push(dir);
    const file = join(dir, "tasks.json");

    const first = new JsonFileTaskStore(file);
    const service = new OperatorService(first, new MockAgentExecutor());
    const created = service.createTask({
      business: "asset-ave",
      title: "Audit catalog",
      prompt: "Check listing quality",
      agentProfile: "team-asset-commerce"
    });

    const second = new JsonFileTaskStore(file);
    expect(second.get(created.id)).toMatchObject({
      id: created.id,
      business: "asset-ave",
      title: "Audit catalog",
      status: "queued"
    });
  });
});

describe("AgentRoster", () => {
  test("summarizes live agent workload by profile", async () => {
    const store = new JsonFileTaskStore();
    const service = new OperatorService(store, new MockAgentExecutor());

    const asset = service.createTask({
      business: "asset-ave",
      title: "Asset task",
      prompt: "Run",
      agentProfile: "team-growth"
    });
    service.createTask({
      business: "dream-blvd",
      title: "Dream task",
      prompt: "Run",
      agentProfile: "team-growth"
    });
    await service.runTask(asset.id);

    const roster = new AgentRoster([
      { profile: "team-growth", displayName: "Growth", role: "growth", capabilities: ["seo"] },
      { profile: "team-qa", displayName: "QA", role: "qa", capabilities: ["testing"] }
    ]);

    const status = roster.status(store.list());
    expect(status).toEqual([
      expect.objectContaining({
        profile: "team-growth",
        totalTasks: 2,
        completedTasks: 1,
        queuedTasks: 1,
        state: "busy"
      }),
      expect.objectContaining({
        profile: "team-qa",
        totalTasks: 0,
        state: "idle"
      })
    ]);
  });
});
