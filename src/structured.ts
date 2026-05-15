import type { AskAgentResult, SideEffectPolicy, TeamAgent } from "./types.js";
import { describeSideEffectPolicy } from "./policy.js";

type RoleDiscovery = {
  profile: string;
  displayName: string;
  configuredRole: string | null;
  configuredCapabilities: string[];
  role: string | null;
  capabilities: string[];
  useWhen: string[];
  avoidWhen: string[];
  preferredOutput: string | null;
  confidence: number;
  rawText: string;
  parsed: unknown | null;
};

export function buildRoleDiscoveryPrompt(profile: string): string {
  return [
    `You are Hermes profile \`${profile}\`. Codex is building a team map.`,
    "Describe how Codex should use you as a specialist.",
    "Return only JSON with this shape:",
    JSON.stringify(
      {
        role: "short specialist role",
        capabilities: ["capability"],
        useWhen: ["when Codex should ask you"],
        avoidWhen: ["when Codex should not ask you"],
        preferredOutput: "format you prefer",
        confidence: 0.8
      },
      null,
      2
    )
  ].join("\n");
}

export function normalizeRoleDiscovery(agent: TeamAgent, result: AskAgentResult): RoleDiscovery {
  const parsed = parseJsonObject(result.text);
  const object = isRecord(parsed) ? parsed : {};

  return {
    profile: agent.profile,
    displayName: agent.displayName ?? agent.profile,
    configuredRole: agent.role ?? null,
    configuredCapabilities: agent.capabilities,
    role: stringOrNull(object.role) ?? agent.role ?? null,
    capabilities: stringArray(object.capabilities, agent.capabilities),
    useWhen: stringArray(object.useWhen),
    avoidWhen: stringArray(object.avoidWhen),
    preferredOutput: stringOrNull(object.preferredOutput),
    confidence: numberOrDefault(object.confidence, parsed ? 0.75 : 0.45),
    rawText: result.text,
    parsed
  };
}

export function buildPanelPrompt(task: string, policy: SideEffectPolicy): string {
  return [
    "Codex is consulting you as one specialist in a Hermes team panel.",
    `Side-effect policy: ${policy}`,
    describeSideEffectPolicy(policy),
    "",
    "Respond with concise Markdown using these exact headings:",
    "## Recommendation",
    "## Evidence",
    "## Risks",
    "## Disagreement Or Caveats",
    "## Next Actions",
    "",
    "Task:",
    task
  ].join("\n");
}

export function synthesizePanel(task: string, responses: AskAgentResult[]) {
  const buckets = responses.map((response) => ({
    profile: response.profile,
    recommendation: extractSection(response.text, "Recommendation"),
    evidence: extractSection(response.text, "Evidence"),
    risks: extractSection(response.text, "Risks"),
    disagreement: extractSection(response.text, "Disagreement Or Caveats"),
    nextActions: extractSection(response.text, "Next Actions")
  }));

  return {
    task,
    agreement: firstUsefulLines(buckets.flatMap((item) => item.recommendation), 8),
    disagreement: firstUsefulLines(buckets.flatMap((item) => item.disagreement), 8),
    risks: firstUsefulLines(buckets.flatMap((item) => item.risks), 10),
    evidence: firstUsefulLines(buckets.flatMap((item) => item.evidence), 10),
    nextActions: firstUsefulLines(buckets.flatMap((item) => item.nextActions), 10),
    evidenceGaps: inferEvidenceGaps(responses),
    byProfile: buckets
  };
}

export function collectKanbanResult(taskId: string, rawTask: unknown, rawRuns: unknown) {
  const task = isRecord(rawTask) ? rawTask : {};
  const runs = Array.isArray(rawRuns) ? rawRuns : isRecord(rawRuns) && Array.isArray(rawRuns.runs) ? rawRuns.runs : [];
  const status = stringOrNull(task.status) ?? stringOrNull(task.state) ?? "unknown";
  const result =
    stringOrNull(task.result) ??
    stringOrNull(task.summary) ??
    stringOrNull(task.output) ??
    latestStringField(runs, ["result", "summary", "output"]);
  const summary =
    stringOrNull(task.summary) ??
    stringOrNull(task.result_summary) ??
    latestStringField(runs, ["summary", "result_summary"]);

  return {
    taskId,
    status,
    done: ["done", "completed", "archived"].includes(status.toLowerCase()),
    assignee: stringOrNull(task.assignee),
    title: stringOrNull(task.title),
    result: result ?? null,
    summary: summary ?? result ?? null,
    nextAction: result ? "Synthesize this result into the Codex answer." : "Task has no final result yet; poll again or inspect the raw task.",
    rawTask,
    runs
  };
}

function parseJsonObject(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function extractSection(text: string, heading: string): string[] {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "imu");
  const match = pattern.exec(text);
  if (!match || match.index === undefined) return [];

  const afterHeading = text.slice(match.index + match[0].length);
  const nextHeading = afterHeading.search(/^##\s+/mu);
  const section = nextHeading >= 0 ? afterHeading.slice(0, nextHeading) : afterHeading;
  return normalizeLines(section);
}

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean)
    .filter((line) => !/^none\.?$/iu.test(line));
}

function firstUsefulLines(lines: string[], limit: number): string[] {
  return [...new Set(lines)].slice(0, limit);
}

function inferEvidenceGaps(responses: AskAgentResult[]): string[] {
  const gaps = responses.flatMap((response) =>
    normalizeLines(response.text).filter((line) => /\b(no evidence|unknown|needs? source|not verified|missing|unclear)\b/iu.test(line))
  );
  return firstUsefulLines(gaps, 8);
}

function latestStringField(items: unknown[], fields: string[]): string | null {
  for (const item of [...items].reverse()) {
    if (!isRecord(item)) continue;
    for (const field of fields) {
      const value = stringOrNull(item[field]);
      if (value) return value;
    }
  }
  return null;
}

function stringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberOrDefault(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
