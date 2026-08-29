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
    return this.caller.callTool("list_notes", { path: this.root });
  }

  async search(context: AssetDreamMemoryContext, query: string): Promise<unknown> {
    assertContext(context);
    return this.caller.callTool("search_notes", {
      folder: this.root,
      text: query
    });
  }

  async read(context: AssetDreamMemoryContext, relativePath: string): Promise<unknown> {
    assertContext(context);
    return this.caller.callTool("read_note", { path: scopedPath(this.root, relativePath) });
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
    const client = new Client({ name: "asset-dream-memory-client", version: "0.2.0" });
    const headers: Record<string, string> = {};
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

    const transport = new StreamableHTTPClientTransport(normalizeMcpUrl(this.baseUrl), {
      requestInit: { headers }
    });

    try {
      await client.connect(transport as Parameters<Client["connect"]>[0]);
      return await client.callTool({ name, arguments: args });
    } finally {
      await client.close();
    }
  }
}

export function createObsidianMemoryAdapterFromEnv(env: EnvLike = process.env): ObsidianMemoryAdapter | undefined {
  const url = env.ASSET_DREAM_OBSIDIAN_MCP_URL || env.ASSET_DREAM_MEMORY_BRIDGE_URL;
  if (!url) return undefined;
  const token = env.ASSET_DREAM_OBSIDIAN_MCP_TOKEN || env.ASSET_DREAM_MEMORY_BRIDGE_API_KEY;
  return new ObsidianMemoryAdapter(
    new McpHttpToolCaller(url, token),
    env.ASSET_DREAM_MEMORY_ROOT || DEFAULT_ROOT
  );
}

export function normalizeMcpUrl(value: string): URL {
  const url = new URL(value);
  if (url.pathname === "/" || url.pathname === "") {
    url.pathname = "/mcp";
  }
  return url;
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
