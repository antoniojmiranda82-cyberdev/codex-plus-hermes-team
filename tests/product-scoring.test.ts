import { describe, expect, it } from "vitest";
import { scoreProductCandidate } from "../src/product-scoring.js";

describe("product candidate scoring", () => {
  it("approves strong candidates", () => {
    const score = scoreProductCandidate({
      grossMarginPercent: 45,
      shippingDays: 5,
      inventory: 250,
      mediaQuality: 90,
      categoryFit: 90,
      duplicateRisk: 5,
      supplierReliability: 90
    });
    expect(score.total).toBeGreaterThanOrEqual(75);
    expect(score.recommendation).toBe("draft");
  });

  it("rejects slow shipping and weak margins", () => {
    const score = scoreProductCandidate({
      grossMarginPercent: 12,
      shippingDays: 24,
      inventory: 10,
      mediaQuality: 40,
      categoryFit: 50,
      duplicateRisk: 10,
      supplierReliability: 50
    });
    expect(score.recommendation).toBe("reject");
  });

  it("rejects candidates with high duplicate risk", () => {
    const score = scoreProductCandidate({
      grossMarginPercent: 55,
      shippingDays: 4,
      inventory: 500,
      mediaQuality: 95,
      categoryFit: 95,
      duplicateRisk: 90,
      supplierReliability: 95
    });
    expect(score.recommendation).toBe("reject");
  });
});
