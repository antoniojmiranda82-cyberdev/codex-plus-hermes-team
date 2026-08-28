import { describe, expect, it } from "vitest";
import { ObsidianMemoryAdapter, type MemoryToolCaller } from "../src/obsidian-memory.js";

class RecordingCaller implements MemoryToolCaller {
  calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  constructor(private readonly responses: Record<string, unknown> = {}) {}

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    return this.responses[name] ?? { content: [{ type: "text", text: "ok" }] };
  }
}

const context = { projectId: "asset-dream" as const, agentId: "asset-dream:analytics" };

describe("ObsidianMemoryAdapter", () => {
  it("rejects identities outside the Asset Dream project", async () => {
    const adapter = new ObsidianMemoryAdapter(new RecordingCaller());

    await expect(
      adapter.read({ projectId: "q-core" as never, agentId: "q-core:ops" }, "notes/test.md")
    ).rejects.toThrow(/asset-dream/i);

    await expect(
      adapter.read({ projectId: "asset-dream", agentId: "q-core:ops" }, "notes/test.md")
    ).rejects.toThrow(/asset-dream/i);
  });

  it("scopes reads under the Asset Dream memory root", async () => {
    const caller = new RecordingCaller();
    const adapter = new ObsidianMemoryAdapter(caller);

    await adapter.read(context, "Research/winners.md");

    expect(caller.calls).toEqual([
      {
        name: "get_file_contents",
        args: { path: "Projects/asset-dream/Research/winners.md" }
      }
    ]);
  });

  it("rejects parent path escapes", async () => {
    const adapter = new ObsidianMemoryAdapter(new RecordingCaller());
    await expect(adapter.read(context, "../Q-Core/private.md")).rejects.toThrow(/scope/i);
  });

  it("writes proposals to a dedicated proposal path without overwriting source memory", async () => {
    const caller = new RecordingCaller();
    const adapter = new ObsidianMemoryAdapter(caller);

    await adapter.propose(context, "idea.md", "candidate memory");

    expect(caller.calls).toEqual([
      {
        name: "create_note",
        args: {
          path: "Projects/asset-dream/Proposals/propuesta-idea.md",
          content: "candidate memory"
        }
      }
    ]);
  });

  it("filters search output so unrelated project paths are not returned", async () => {
    const caller = new RecordingCaller({
      search: {
        content: [
          {
            type: "text",
            text: [
              "[content] Projects/asset-dream/Research/product.md",
              "       2 match(es) — snippet: winning item",
              "[content] Projects/Q-Core/private.md",
              "       1 match(es) — snippet: unrelated",
              "[filename] Projects/asset-dream/Plans/launch.md",
              "       launch.md"
            ].join("\n")
          }
        ]
      }
    });
    const adapter = new ObsidianMemoryAdapter(caller);

    const result = await adapter.search(context, "launch");
    const text = JSON.stringify(result);

    expect(text).toContain("Projects/asset-dream/Research/product.md");
    expect(text).toContain("Projects/asset-dream/Plans/launch.md");
    expect(text).not.toContain("Q-Core");
    expect(text).not.toContain("unrelated");
  });
});
