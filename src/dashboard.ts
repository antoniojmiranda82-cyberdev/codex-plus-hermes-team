import type { BusinessId, OperatorService, TaskStatus } from "./operator.js";

export type DashboardAgent = {
  profile: string;
  displayName: string;
  role?: string;
};

export type DashboardAgentStatus = DashboardAgent & {
  status: "idle" | "busy" | "blocked" | "error";
  queued: number;
  running: number;
  blocked: number;
  failed: number;
  completed: number;
};

export type BusinessMetrics = Record<TaskStatus, number> & { total: number };

export type DashboardSnapshot = {
  generatedAt: string;
  totalTasks: number;
  businesses: Record<BusinessId, BusinessMetrics>;
  agents: DashboardAgentStatus[];
};

const businessIds: BusinessId[] = ["asset-ave", "dream-blvd"];
const statuses: TaskStatus[] = ["queued", "running", "blocked", "failed", "completed"];

function emptyMetrics(): BusinessMetrics {
  return { total: 0, queued: 0, running: 0, blocked: 0, failed: 0, completed: 0 };
}

export function buildDashboardSnapshot(
  operator: OperatorService,
  roster: DashboardAgent[]
): DashboardSnapshot {
  const tasks = operator.listTasks();
  const businesses: Record<BusinessId, BusinessMetrics> = {
    "asset-ave": emptyMetrics(),
    "dream-blvd": emptyMetrics()
  };

  for (const business of businessIds) {
    const metrics = businesses[business];
    const businessTasks = tasks.filter((task) => task.business === business);
    metrics.total = businessTasks.length;
    for (const status of statuses) {
      metrics[status] = businessTasks.filter((task) => task.status === status).length;
    }
  }

  const agents = roster.map((agent) => {
    const agentTasks = tasks.filter((task) => task.agentProfile === agent.profile);
    const counts = {
      queued: agentTasks.filter((task) => task.status === "queued").length,
      running: agentTasks.filter((task) => task.status === "running").length,
      blocked: agentTasks.filter((task) => task.status === "blocked").length,
      failed: agentTasks.filter((task) => task.status === "failed").length,
      completed: agentTasks.filter((task) => task.status === "completed").length
    };

    const status: DashboardAgentStatus["status"] =
      counts.failed > 0 ? "error" : counts.blocked > 0 ? "blocked" : counts.running > 0 || counts.queued > 0 ? "busy" : "idle";

    return { ...agent, ...counts, status };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalTasks: tasks.length,
    businesses,
    agents
  };
}
