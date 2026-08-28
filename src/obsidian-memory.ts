import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type AssetDreamMemoryContext = {
  projectId: "asset-dream";
  agentId: string;
};

export interface MemoryToolCaller {
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}

type EnvLike = Record<string, string | undefined>;

const DEFAULT_ROOT = "Projects/asset-dream";

export class ObsidianMemoryAdapter {
  constructor(
    private readonly caller: MemoryToolCaller,
    private readonly root = DEFAULT_ROOT
  ) {}

  async health(context: AssetDreamMemoryContext): Promise<unknown> {
    assertContext(context);
    return this.caller.callTool("list_files_in_vault", { prefix: this.root });
  }

  async search(context: AssetDreamMemoryContext, query: string): Promise<unknown> {
    assertContext(context);
    const result = await this.caller.callTool("search", { query });
    return filterSearchResult(result, this.root);
  }

  async read(context: AssetDreamMemoryContext, relativePath: string): Promise<unknown> {
    assertContext(context);
    return this.caller.callTool("get_file_contents", { path: scopedPath(this.root, relativePath) });
  }

  async propose(context: AssetDreamMemoryContext, relativePath: string, content: string): Promise<unknown> {
    assertContext(context);
    const safeRelative = normalizeRelative(relativePath);
    const name = safeRelative.split("/").at(-1)!;
    const proposalName = name.startsWith("propuesta-") ? name : `propuesta-${name}`;
    const path = `${this.root}/Proposals/${proposalName}`;
    return this.caller.callTool("create_note", { path, content });
  }
}

export class McpHttpToolCaller implements MemoryToolCaller {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey?: string
  ) {}

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const client = new Client({ name: "asset-dream-memory-client", version: "0.1.0" });
    const headers: Record<string, string> = {};
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

    const transport = new StreamableHTTPClientTransport(new URL(this.baseUrl), {
      requestInit: { headers }
    });

    try {
      await client.connect(transport);
      return await client.callTool({ name, arguments: args });
    } finally {
      await client.close();
    }
  }
}

export function createObsidianMemoryAdapterFromEnv(env: EnvLike = process.env): ObsidianMemoryAdapter | undefined {
  const url = env.ASSET_DREAM_MEMORY_BRIDGE_URL;
  if (!url) return undefined;
  return new ObsidianMemoryAdapter(
    new McpHttpToolCaller(url, env.ASSET_DREAM_MEMORY_BRIDGE_API_KEY),
    env.ASSET_DREAM_MEMORY_ROOT || DEFAULT_ROOT
  );
}

function assertContext(context: AssetDreamMemoryContext): void {
  if (context.projectId !== "asset-dream" || !context.agentId.startsWith("asset-dream:")) {
    throw new Error("Memory access is restricted to asset-dream project agents");
  }
}

function normalizeRelative(value: string): string {
  const normalized = value.replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  const parts = normalized.split("/");
  if (!normalized || parts.some((part) => part === ".." || part === "." || !part)) {
    throw new Error("Memory path must stay inside the Asset Dream scope");
  }
  return normalized;
}

function scopedPath(root: string, relativePath: string): string {
  return `${root.replace(/\/+$/g, "")}/${normalizeRelative(relativePath)}`;
}

function filterSearchResult(result: unknown, root: string): unknown {
  if (!result || typeof result !== "object") return result;
  const record = result as { content?: Array<{ type?: string; text?: string; [key: string]: unknown }> };
  if (!Array.isArray(record.content)) return result;

  const filteredContent = record.content.map((item) => {
    if (item.type !== "text" || typeof item.text !== "string") return item;
    const lines = item.text.split("\n");
    const kept: string[] = [];
    let keepFollowingDetail = false;

    for (const line of lines) {
      const header = line.match(/^\[(?:filename|content)\]\s+(.+)$/);
      if (header) {
        keepFollowingDetail = header[1].startsWith(`${root}/`) || header[1] === root;
        if (keepFollowingDetail) kept.push(line);
        continue;
      }
      if (keepFollowingDetail && /^\s+/.test(line)) kept.push(line);
    }

    return { ...item, text: kept.join("\n") };
  });

  return { ...(result as Record<string, unknown>), content: filteredContent };
}
