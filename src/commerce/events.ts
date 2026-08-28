import { randomUUID } from "node:crypto";
import { z } from "zod";

export const CommerceEventTypeSchema = z.enum([
  "commerce.task.created",
  "commerce.task.started",
  "commerce.task.completed",
  "commerce.task.failed",
  "commerce.task.handoff",
  "commerce.approval.requested",
  "commerce.approval.approved",
  "commerce.approval.rejected",
  "commerce.metric.updated",
  "commerce.inventory.risk",
  "commerce.supplier.risk",
  "commerce.campaign.ready",
  "commerce.campaign.performance",
  "commerce.customer.escalation",
  "commerce.integration.failure",
  "commerce.alert.critical",
  "commerce.agent.performance"
]);

export const CommerceSeveritySchema = z.enum(["info", "report", "approval", "critical"]);

export const CommerceEventSchema = z.object({
  id: z.string().min(1),
  occurredAt: z.string().datetime(),
  brandId: z.string().min(1),
  agentId: z.string().min(1),
  agentRole: z.string().min(1),
  taskId: z.string().min(1).optional(),
  eventType: CommerceEventTypeSchema,
  severity: CommerceSeveritySchema,
  summary: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
  requiresApproval: z.boolean().default(false),
  approvalId: z.string().min(1).optional(),
  correlationId: z.string().min(1)
}).superRefine((event, ctx) => {
  if (event.requiresApproval && !event.approvalId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["approvalId"],
      message: "approvalId is required when requiresApproval is true"
    });
  }
});

export type CommerceEventType = z.infer<typeof CommerceEventTypeSchema>;
export type CommerceSeverity = z.infer<typeof CommerceSeveritySchema>;
export type CommerceEvent = z.infer<typeof CommerceEventSchema>;

export type CreateCommerceEventInput = Omit<CommerceEvent, "id" | "occurredAt"> & {
  id?: string;
  occurredAt?: string;
};

export function parseCommerceEvent(input: unknown): CommerceEvent {
  return CommerceEventSchema.parse(input);
}

export function createCommerceEvent(input: CreateCommerceEventInput): CommerceEvent {
  return CommerceEventSchema.parse({
    ...input,
    id: input.id ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString()
  });
}
