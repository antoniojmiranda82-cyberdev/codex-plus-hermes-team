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

export type AgentExecutionInput = Pick<
  TaskRecord,
  "id" | "business" | "title" | "prompt" | "agentProfile" | "attempts"
>;

export type AgentExecutionResult = {
  summary: string;
};

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

    return {
      summary: `${input.agentProfile} completed ${input.title}`
    };
  }
}

export interface TaskStore {
  save(task: TaskRecord): TaskRecord;
  get(id: string): TaskRecord | undefined;
  list(business?: BusinessId): TaskRecord[];
}

export class InMemoryTaskStore implements TaskStore {
  private readonly tasks = new Map<string, TaskRecord>();

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

export class OperatorService {
  constructor(
    private readonly store: TaskStore,
    private readonly executor: AgentExecutor
  ) {}

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
      task = this.store.save({
        ...task,
        status: "blocked",
        updatedAt: new Date().toISOString()
      });
      throw new Error(`Task ${id} requires approval before execution`);
    }

    task = this.store.save({
      ...task,
      status: "running",
      attempts: task.attempts + 1,
      updatedAt: new Date().toISOString()
    });

    try {
      const result = await this.executor.execute(task);
      return this.store.save({
        ...task,
        status: "completed",
        resultSummary: result.summary,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.store.save({
        ...task,
        status: "failed",
        lastError: message,
        updatedAt: new Date().toISOString()
      });
      throw error;
    }
  }

  async retryTask(id: string): Promise<TaskRecord> {
    const task = this.getTask(id);
    if (task.status !== "failed") {
      throw new Error(`Only failed tasks can be retried: ${id}`);
    }

    this.store.save({
      ...task,
      status: "queued",
      updatedAt: new Date().toISOString()
    });

    return this.runTask(id);
  }
}

export type SlackReport = {
  business: BusinessId;
  text: string;
};

export interface SlackReporter {
  report(message: SlackReport): Promise<void>;
}

export type DryRunSlackReporter = SlackReporter & {
  messages: SlackReport[];
};

export function createDryRunSlackReporter(): DryRunSlackReporter {
  const messages: SlackReport[] = [];
  return {
    messages,
    async report(message: SlackReport) {
      messages.push({ ...message });
    }
  };
}
