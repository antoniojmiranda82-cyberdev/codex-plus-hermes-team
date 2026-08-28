import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { BusinessId, OperatorService } from "./operator.js";

const BusinessSchema = z.enum(["asset-ave", "dream-blvd"]);

export function registerOperatorTools(server: McpServer, operator: OperatorService) {
  server.tool(
    "operator_create_task",
    {
      business: BusinessSchema,
      title: z.string().min(1),
      prompt: z.string().min(1),
      agentProfile: z.string().min(1),
      requiresExternalApproval: z.boolean().optional()
    },
    async ({ business, title, prompt, agentProfile, requiresExternalApproval }) =>
      jsonContent(
        operator.createTask({
          business,
          title,
          prompt,
          agentProfile,
          approvalRequirement: requiresExternalApproval ? "external_side_effect" : "none"
        })
      )
  );

  server.tool(
    "operator_list_tasks",
    { business: BusinessSchema.optional() },
    async ({ business }) => jsonContent(operator.listTasks(business as BusinessId | undefined))
  );

  server.tool(
    "operator_get_task",
    { taskId: z.string().min(1) },
    async ({ taskId }) => jsonContent(operator.getTask(taskId))
  );

  server.tool(
    "operator_approve_task",
    { taskId: z.string().min(1) },
    async ({ taskId }) => jsonContent(operator.approveTask(taskId))
  );

  server.tool(
    "operator_run_task",
    { taskId: z.string().min(1) },
    async ({ taskId }) => jsonContent(await operator.runTask(taskId))
  );

  server.tool(
    "operator_retry_task",
    { taskId: z.string().min(1) },
    async ({ taskId }) => jsonContent(await operator.retryTask(taskId))
  );
}

function jsonContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}
