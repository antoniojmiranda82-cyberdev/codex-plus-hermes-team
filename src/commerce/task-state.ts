import { z } from "zod";

export const DurableTaskStatusSchema = z.enum([
  "backlog",
  "assigned",
  "working",
  "waiting",
  "review",
  "approval",
  "completed",
  "failed"
]);

export const DurableTaskStateSchema = z.object({
  taskId: z.string().min(1),
  correlationId: z.string().min(1),
  brandId: z.string().min(1),
  assignedAgentId: z.string().min(1),
  status: DurableTaskStatusSchema,
  objective: z.string().min(1),
  inputSummary: z.string().min(1),
  outputSummary: z.string().default(""),
  currentBlocker: z.string().nullable().default(null),
  nextAction: z.string().min(1),
  artifacts: z.array(z.string()).default([]),
  evidence: z.array(z.string()).default([]),
  modelHistory: z.array(z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    startedAt: z.string().datetime(),
    finishedAt: z.string().datetime().optional(),
    outcome: z.enum(["completed", "handoff", "failed", "context_exhausted"]).optional()
  })).default([]),
  updatedAt: z.string().datetime()
});

export type DurableTaskState = z.infer<typeof DurableTaskStateSchema>;

export function createDurableTaskState(
  input: Omit<DurableTaskState, "updatedAt">
): DurableTaskState {
  return DurableTaskStateSchema.parse({ ...input, updatedAt: new Date().toISOString() });
}

export function checkpointTask(
  state: DurableTaskState,
  patch: Partial<Omit<DurableTaskState, "taskId" | "correlationId" | "updatedAt">>
): DurableTaskState {
  return DurableTaskStateSchema.parse({
    ...state,
    ...patch,
    updatedAt: new Date().toISOString()
  });
}

export function renderAiHandoff(state: DurableTaskState): string {
  return [
    `# AI Handoff: ${state.taskId}`,
    "",
    `Brand: ${state.brandId}`,
    `Agent: ${state.assignedAgentId}`,
    `Status: ${state.status}`,
    `Correlation: ${state.correlationId}`,
    "",
    "## Objective",
    state.objective,
    "",
    "## Input Summary",
    state.inputSummary,
    "",
    "## Output Summary",
    state.outputSummary || "No completed output yet.",
    "",
    "## Current Blocker",
    state.currentBlocker ?? "None",
    "",
    "## Next Action",
    state.nextAction,
    "",
    "## Artifacts",
    ...(state.artifacts.length ? state.artifacts.map((value) => `- ${value}`) : ["- None"]),
    "",
    "## Evidence",
    ...(state.evidence.length ? state.evidence.map((value) => `- ${value}`) : ["- None"]),
    "",
    `Updated: ${state.updatedAt}`
  ].join("\n");
}
