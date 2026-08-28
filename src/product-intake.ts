import type { BusinessId, CreateTaskInput } from "./operator.js";
import { buildCommerceTask } from "./commerce-workflows.js";
import { evaluateProductAction } from "./product-policy.js";
import { scoreProductCandidate, type ProductScoreInput } from "./product-scoring.js";

export type ProductIntakeCandidate = {
  title: string;
  category?: string;
  score: ProductScoreInput;
};

export type ProductIntakePlan = {
  decision: "draft" | "review" | "reject";
  score?: number;
  reasons: string[];
  task?: CreateTaskInput;
};

export function planProductIntake(input: {
  business: BusinessId;
  candidate: ProductIntakeCandidate;
}): ProductIntakePlan {
  const policy = evaluateProductAction({
    action: "create_draft",
    business: input.business,
    ...(input.candidate.category ? { category: input.candidate.category } : {})
  });

  if (!policy.allowed) {
    return { decision: "reject", reasons: [policy.reason ?? "blocked by product policy"] };
  }

  const score = scoreProductCandidate(input.candidate.score);
  if (score.recommendation === "reject") {
    return { decision: "reject", score: score.total, reasons: score.reasons };
  }

  if (score.recommendation === "review") {
    return { decision: "review", score: score.total, reasons: score.reasons };
  }

  const task = buildCommerceTask({
    business: input.business,
    action: "create_draft",
    title: `Draft product: ${input.candidate.title}`,
    prompt: `Create a draft product for ${input.candidate.title}. Preserve platform source-of-truth rules and do not publish live.`,
    ...(input.candidate.category ? { category: input.candidate.category } : {})
  });

  return { decision: "draft", score: score.total, reasons: score.reasons, task };
}
