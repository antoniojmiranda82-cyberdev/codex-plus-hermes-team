import { describe, expect, it } from "vitest";
import {
  ObsidianMemoryAdapter,
  normalizeMcpUrl,
  type MemoryToolCaller
} from "../src/obsidian-memory.js";

class RecordingCaller implements MemoryToolCaller {
  calls: Array<{ name: string; args: Record<string, unknown> }> = [];

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    this.calls.push({ name, args });
    return { content: [{ type: "text", text: "ok" }] };
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

  it("uses Vault as MCP list_notes for health checks", async () => {
    const caller = new RecordingCaller();
    const adapter = new ObsidianMemoryAdapter(caller);

    await adapter.health(context);

    expect(caller.calls).toEqual([
      { name: "list_notes", args: { path: "Projects/asset-dream" } }
    ]);
  });

  it("scopes searches at the MCP server to the Asset Dream folder", async () => {
    const caller = new RecordingCaller();
    const adapter = new ObsidianMemoryAdapter(caller);

    await adapter.search(context, "launch plan");

    expect(caller.calls).toEqual([
      {
        name: "search_notes",
        args: { folder: "Projects/asset-dream", text: "launch plan" }
      }
    ]);
  });

  it("scopes reads under the Asset Dream memory root", async () => {
    const caller = new RecordingCaller();
    const adapter = new ObsidianMemoryAdapter(caller);

    await adapter.read(context, "Research/winners.md");

    expect(caller.calls).toEqual([
      {
        name: "read_note",
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
});

describe("normalizeMcpUrl", () => {
  it("adds the Vault as MCP endpoint when given only the local server origin", () => {
    expect(normalizeMcpUrl("http://localhost:27123/").toString()).toBe(
      "http://localhost:27123/mcp"
    );
  });

  it("preserves an explicit MCP endpoint", () => {
    expect(normalizeMcpUrl("http://localhost:27123/mcp").toString()).toBe(
      "http://localhost:27123/mcp"
    );
  });
});
