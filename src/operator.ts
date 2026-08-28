import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type BusinessId = "asset-ave" | "dream-blvd";
export type TaskStatus = "queued" | "running" | "blocked" | "failed" | "completed";
export type ApprovalRequirement = "none" | "external_side_effect";

export type TaskRecord = {
  id: string;
  business: BusinessId;
  title: string;
  prompt: string;
  agentProfile: string;
  status: TaskStatus;
  attempts: number;
  approvalRequirement: ApprovalRequirement;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  resultSummary?: string;
  lastError?: string;
};

export type CreateTaskInput = {
  business: BusinessId;
  title: string;
  prompt: string;
  agentProfile: string;
  approvalRequirement?: ApprovalRequirement;
  approved?: boolean;
};

export type AgentExecutionInput = Pick<TaskRecord, "id" | "business" | "title" | "prompt" | "agentProfile" | "attempts">;
export type AgentExecutionResult = { summary: string };

export interface AgentExecutor {
  execute(input: AgentExecutionInput): Promise<AgentExecutionResult>;
}

export class MockAgentExecutor implements AgentExecutor {
  private failed = false;
  constructor(private readonly options: { failFirstAttempt?: boolean } = {}) {}

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    if (this.options.failFirstAttempt && !this.failed) {
      this.failed = true;
      throw new Error("Mock failure on first attempt");
    }
    return { summary: `${input.agentProfile} completed ${input.title}` };
  }
}

export interface TaskStore {
  save(task: TaskRecord): TaskRecord;
  get(id: string): TaskRecord | undefined;
  list(business?: BusinessId): TaskRecord[];
}

export class InMemoryTaskStore implements TaskStore {
  protected readonly tasks = new Map<string, TaskRecord>();

  save(task: TaskRecord): TaskRecord {
    const copy = { ...task };
    this.tasks.set(copy.id, copy);
    return { ...copy };
  }

  get(id: string): TaskRecord | undefined {
    const task = this.tasks.get(id);
    return task ? { ...task } : undefined;
  }

  list(business?: BusinessId): TaskRecord[] {
    return [...this.tasks.values()]
      .filter((task) => !business || task.business === business)
      .map((task) => ({ ...task }));
  }
}

export class JsonFileTaskStore extends InMemoryTaskStore {
  constructor(private readonly filePath?: string) {
    super();
    if (filePath && existsSync(filePath)) {
      const parsed = JSON.parse(readFileSync(filePath, "utf8")) as TaskRecord[];
      for (const task of parsed) this.tasks.set(task.id, { ...task });
    }
  }

  override save(task: TaskRecord): TaskRecord {
    const saved = super.save(task);
    this.flush();
    return saved;
  }

  private flush() {
    if (!this.filePath) return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.list(), null, 2), "utf8");
  }
}

export class OperatorService {
  constructor(private readonly store: TaskStore, private readonly executor: AgentExecutor) {}

  createTask(input: CreateTaskInput): TaskRecord {
    const now = new Date().toISOString();
    const task: TaskRecord = {
      id: crypto.randomUUID(),
      business: input.business,
      title: input.title,
      prompt: input.prompt,
      agentProfile: input.agentProfile,
      status: "queued",
      attempts: 0,
      approvalRequirement: input.approvalRequirement ?? "none",
      approved: input.approved ?? input.approvalRequirement !== "external_side_effect",
      createdAt: now,
      updatedAt: now
    };
    return this.store.save(task);
  }

  getTask(id: string): TaskRecord {
    const task = this.store.get(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    return task;
  }

  listTasks(business?: BusinessId): TaskRecord[] {
    return this.store.list(business);
  }

  approveTask(id: string): TaskRecord {
    const task = this.getTask(id);
    return this.store.save({
      ...task,
      approved: true,
      status: task.status === "blocked" ? "queued" : task.status,
      updatedAt: new Date().toISOString()
    });
  }

  async runTask(id: string): Promise<TaskRecord> {
    let task = this.getTask(id);
    if (task.approvalRequirement === "external_side_effect" && !task.approved) {
      task = this.store.save({ ...task, status: "blocked", updatedAt: new Date().toISOString() });
      throw new Error(`Task ${id} requires approval before execution`);
    }

    task = this.store.save({ ...task, status: "running", attempts: task.attempts + 1, updatedAt: new Date().toISOString() });
    try {
      const result = await this.executor.execute(task);
      return this.store.save({ ...task, status: "completed", resultSummary: result.summary, updatedAt: new Date().toISOString() });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.store.save({ ...task, status: "failed", lastError: message, updatedAt: new Date().toISOString() });
      throw error;
    }
  }

  async retryTask(id: string): Promise<TaskRecord> {
    const task = this.getTask(id);
    if (task.status !== "failed") throw new Error(`Only failed tasks can be retried: ${id}`);
    this.store.save({ ...task, status: "queued", updatedAt: new Date().toISOString() });
    return this.runTask(id);
  }
}

export type AgentRosterEntry = {
  profile: string;
  displayName?: string;
  role?: string;
  capabilities?: string[];
};

export type AgentStatus = AgentRosterEntry & {
  state: "idle" | "busy" | "blocked" | "error";
  totalTasks: number;
  queuedTasks: number;
  runningTasks: number;
  blockedTasks: number;
  failedTasks: number;
  completedTasks: number;
};

export class AgentRoster {
  constructor(private readonly agents: AgentRosterEntry[]) {}

  status(tasks: TaskRecord[]): AgentStatus[] {
    return this.agents.map((agent) => {
      const assigned = tasks.filter((task) => task.agentProfile === agent.profile);
      const count = (status: TaskStatus) => assigned.filter((task) => task.status === status).length;
      const queuedTasks = count("queued");
      const runningTasks = count("running");
      const blockedTasks = count("blocked");
      const failedTasks = count("failed");
      const completedTasks = count("completed");
      const state: AgentStatus["state"] = failedTasks > 0 ? "error" : blockedTasks > 0 ? "blocked" : queuedTasks + runningTasks > 0 ? "busy" : "idle";
      return {
        ...agent,
        capabilities: agent.capabilities ?? [],
        state,
        totalTasks: assigned.length,
        queuedTasks,
        runningTasks,
        blockedTasks,
        failedTasks,
        completedTasks
      };
    });
  }
}

export type SlackReport = { business: BusinessId; text: string };
export interface SlackReporter { report(message: SlackReport): Promise<void> }
export type DryRunSlackReporter = SlackReporter & { messages: SlackReport[] };

export function createDryRunSlackReporter(): DryRunSlackReporter {
  const messages: SlackReport[] = [];
  return {
    messages,
    async report(message: SlackReport) {
      messages.push({ ...message });
    }
  };
}
