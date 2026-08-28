import { describe, expect, it } from "vitest";
import { planProductIntake } from "../src/product-intake.js";

describe("product intake planner", () => {
  it("turns strong Asset Ave candidates into draft tasks", () => {
    const result = planProductIntake({
      business: "asset-ave",
      candidate: {
        title: "Portable recovery tool",
        category: "fitness",
        score: {
          grossMarginPercent: 46,
          shippingDays: 5,
          inventory: 400,
          mediaQuality: 90,
          categoryFit: 92,
          duplicateRisk: 5,
          supplierReliability: 90
        }
      }
    });
    expect(result.decision).toBe("draft");
    expect(result.task?.agentProfile).toBe("asset-dream:asset-commerce");
    expect(result.task?.approvalRequirement).toBe("none");
  });

  it("sends borderline candidates to review without creating a store task", () => {
    const result = planProductIntake({
      business: "dream-blvd",
      candidate: {
        title: "Borderline item",
        category: "home",
        score: {
          grossMarginPercent: 30,
          shippingDays: 8,
          inventory: 70,
          mediaQuality: 68,
          categoryFit: 66,
          duplicateRisk: 10,
          supplierReliability: 70
        }
      }
    });
    expect(["review", "reject"]).toContain(result.decision);
    if (result.decision === "review") expect(result.task).toBeUndefined();
  });

  it("rejects restricted categories before scoring", () => {
    const result = planProductIntake({
      business: "asset-ave",
      candidate: {
        title: "Restricted item",
        category: "firearms",
        score: {
          grossMarginPercent: 90,
          shippingDays: 1,
          inventory: 999,
          mediaQuality: 100,
          categoryFit: 100,
          duplicateRisk: 0,
          supplierReliability: 100
        }
      }
    });
    expect(result.decision).toBe("reject");
  });
});
