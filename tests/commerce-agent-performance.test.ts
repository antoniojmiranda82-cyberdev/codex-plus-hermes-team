import { describe, expect, it } from "vitest";
import { calculateAgentPerformance } from "../src/commerce/agent-performance.js";

describe("calculateAgentPerformance", () => {
  it("calculates operational quality metrics", () => {
    const snapshot = calculateAgentPerformance([
      {
        completed: true,
        failed: false,
        qaRejected: false,
        approvalRejected: false,
        latencyMs: 100,
        cost: 0.1,
        attributedRevenue: 25,
        attributionConfidence: 0.8
      },
      {
        completed: false,
        failed: true,
        qaRejected: true,
        approvalRejected: false,
        latencyMs: 300,
        cost: 0.2
      }
    ]);

    expect(snapshot.totalRuns).toBe(2);
    expect(snapshot.completionRate).toBe(0.5);
    expect(snapshot.failureRate).toBe(0.5);
    expect(snapshot.qaRejectionRate).toBe(0.5);
    expect(snapshot.medianLatencyMs).toBe(200);
    expect(snapshot.totalCost).toBeCloseTo(0.3);
    expect(snapshot.attributedRevenue).toBe(25);
    expect(snapshot.attributionConfidence).toBe(0.8);
  });

  it("returns null attribution instead of inventing precision", () => {
    const snapshot = calculateAgentPerformance([
      { completed: true, failed: false, qaRejected: false, approvalRejected: false }
    ]);
    expect(snapshot.attributedRevenue).toBeNull();
    expect(snapshot.attributionConfidence).toBeNull();
  });
});
