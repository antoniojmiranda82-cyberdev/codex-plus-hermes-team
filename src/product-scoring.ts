export type ProductScoreInput = {
  grossMarginPercent: number;
  shippingDays: number;
  inventory: number;
  mediaQuality: number;
  categoryFit: number;
  duplicateRisk: number;
  supplierReliability: number;
};

export type ProductScore = {
  total: number;
  recommendation: "draft" | "review" | "reject";
  reasons: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function scoreProductCandidate(input: ProductScoreInput): ProductScore {
  const reasons: string[] = [];
  const marginScore = clamp((input.grossMarginPercent / 50) * 100);
  const shippingScore = clamp(100 - Math.max(0, input.shippingDays - 3) * 7);
  const inventoryScore = clamp((input.inventory / 100) * 100);
  const mediaScore = clamp(input.mediaQuality);
  const categoryScore = clamp(input.categoryFit);
  const reliabilityScore = clamp(input.supplierReliability);
  const duplicatePenalty = clamp(input.duplicateRisk);

  const total = Math.round(
    marginScore * 0.24 +
      shippingScore * 0.18 +
      inventoryScore * 0.08 +
      mediaScore * 0.14 +
      categoryScore * 0.2 +
      reliabilityScore * 0.16 -
      duplicatePenalty * 0.2
  );

  if (input.grossMarginPercent < 20) reasons.push("margin below 20%");
  if (input.shippingDays > 14) reasons.push("shipping slower than 14 days");
  if (input.duplicateRisk >= 70) reasons.push("high duplicate risk");
  if (input.supplierReliability < 50) reasons.push("weak supplier reliability");

  if (reasons.length > 0) return { total: clamp(total), recommendation: "reject", reasons };
  if (total >= 75) return { total: clamp(total), recommendation: "draft", reasons };
  if (total >= 60) return { total: clamp(total), recommendation: "review", reasons: ["candidate needs human or senior-agent review"] };
  return { total: clamp(total), recommendation: "reject", reasons: ["score below minimum threshold"] };
}
