import type { ApprovalRequest } from "./approvals.js";
import type { AgentPerformanceSnapshot } from "./agent-performance.js";
import type { CommerceEvent } from "./events.js";
import type { DurableTaskState } from "./task-state.js";
import type { CommerceSystemHealth } from "./control-health.js";

export type DashboardAgent = {
  id: string;
  name: string;
  role: string;
  manager?: string;
  brand: string;
  status: "active" | "working" | "waiting" | "blocked" | "offline";
  currentTask?: string;
  performance?: AgentPerformanceSnapshot;
};

export type DashboardBrand = {
  id: string;
  name: string;
  platform: string;
  gmAgentId: string;
  revenue: number | null;
  profit: number | null;
  orders: number | null;
  dataFreshness: string | null;
};

export type QCommerceDashboardSnapshot = {
  generatedAt: string;
  brands: DashboardBrand[];
  agents: DashboardAgent[];
  tasks: DurableTaskState[];
  approvals: ApprovalRequest[];
  events: CommerceEvent[];
  systemHealth: CommerceSystemHealth;
  writesPaused: boolean;
};

export function buildDashboardSnapshot(input: Omit<QCommerceDashboardSnapshot, "generatedAt"> & { generatedAt?: string }): QCommerceDashboardSnapshot {
  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    brands: input.brands,
    agents: input.agents,
    tasks: input.tasks,
    approvals: input.approvals,
    events: input.events,
    systemHealth: input.systemHealth,
    writesPaused: input.writesPaused
  };
}
