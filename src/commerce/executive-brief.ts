import type { ApprovalRequest } from "./approvals.js";
import type { CommerceEvent } from "./events.js";
import type { StoreMetrics } from "./store-adapter.js";

export type BrandExecutiveSnapshot = {
  brandId: string;
  metrics: StoreMetrics;
};

export type ExecutiveBrief = {
  generatedAt: string;
  brands: BrandExecutiveSnapshot[];
  totalRevenue: number | null;
  totalProfit: number | null;
  totalOrders: number | null;
  criticalRisks: string[];
  materialRisks: string[];
  opportunities: string[];
  approvals: Array<{
    id: string;
    brandId: string;
    actionClass: string;
    summary: string;
    estimatedCost: number | null;
  }>;
  facts: string[];
  inferredExplanations: string[];
};

export type ExecutiveBriefInput = {
  brands: BrandExecutiveSnapshot[];
  events: CommerceEvent[];
  approvals: ApprovalRequest[];
  inferredExplanations?: string[];
  opportunities?: string[];
  generatedAt?: string;
};

function sumKnown(values: Array<number | undefined>): number | null {
  const known = values.filter((value): value is number => value !== undefined);
  return known.length ? known.reduce((sum, value) => sum + value, 0) : null;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function buildExecutiveBrief(input: ExecutiveBriefInput): ExecutiveBrief {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const critical = input.events.filter((event) => event.severity === "critical");
  const material = input.events.filter(
    (event) => event.severity === "report" && event.eventType !== "commerce.campaign.performance"
  );

  const facts = input.brands.map((brand) => {
    const { revenue, profit, orders } = brand.metrics;
    return [
      brand.brandId,
      revenue === undefined ? "revenue n/a" : `revenue ${revenue}`,
      profit === undefined ? "profit n/a" : `profit ${profit}`,
      orders === undefined ? "orders n/a" : `orders ${orders}`
    ].join(": ");
  });

  return {
    generatedAt,
    brands: input.brands,
    totalRevenue: sumKnown(input.brands.map((brand) => brand.metrics.revenue)),
    totalProfit: sumKnown(input.brands.map((brand) => brand.metrics.profit)),
    totalOrders: sumKnown(input.brands.map((brand) => brand.metrics.orders)),
    criticalRisks: unique(critical.map((event) => event.summary)),
    materialRisks: unique(material.map((event) => event.summary)),
    opportunities: unique(input.opportunities ?? []),
    approvals: input.approvals
      .filter((approval) => approval.status === "pending")
      .map((approval) => ({
        id: approval.id,
        brandId: approval.action.brandId,
        actionClass: approval.action.actionClass,
        summary: approval.action.summary,
        estimatedCost: approval.action.estimatedCost
      })),
    facts,
    inferredExplanations: unique(input.inferredExplanations ?? [])
  };
}
