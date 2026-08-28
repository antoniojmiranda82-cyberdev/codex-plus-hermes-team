export type AgentTaskRun = {
  completed: boolean;
  failed: boolean;
  qaRejected: boolean;
  approvalRejected: boolean;
  latencyMs?: number;
  cost?: number;
  attributedRevenue?: number;
  attributionConfidence?: number;
};

export type AgentPerformanceSnapshot = {
  totalRuns: number;
  completionRate: number;
  failureRate: number;
  qaRejectionRate: number;
  approvalRejectionRate: number;
  medianLatencyMs: number | null;
  totalCost: number | null;
  attributedRevenue: number | null;
  attributionConfidence: number | null;
};

function rate(count: number, total: number): number {
  return total === 0 ? 0 : count / total;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid] ?? null
    : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

export function calculateAgentPerformance(runs: AgentTaskRun[]): AgentPerformanceSnapshot {
  const total = runs.length;
  const costValues = runs.map((run) => run.cost).filter((value): value is number => value !== undefined);
  const revenueRuns = runs.filter(
    (run): run is AgentTaskRun & { attributedRevenue: number; attributionConfidence: number } =>
      run.attributedRevenue !== undefined && run.attributionConfidence !== undefined
  );

  return {
    totalRuns: total,
    completionRate: rate(runs.filter((run) => run.completed).length, total),
    failureRate: rate(runs.filter((run) => run.failed).length, total),
    qaRejectionRate: rate(runs.filter((run) => run.qaRejected).length, total),
    approvalRejectionRate: rate(runs.filter((run) => run.approvalRejected).length, total),
    medianLatencyMs: median(
      runs.map((run) => run.latencyMs).filter((value): value is number => value !== undefined)
    ),
    totalCost: costValues.length ? costValues.reduce((sum, value) => sum + value, 0) : null,
    attributedRevenue: revenueRuns.length
      ? revenueRuns.reduce((sum, run) => sum + run.attributedRevenue, 0)
      : null,
    attributionConfidence: revenueRuns.length
      ? revenueRuns.reduce((sum, run) => sum + run.attributionConfidence, 0) / revenueRuns.length
      : null
  };
}
