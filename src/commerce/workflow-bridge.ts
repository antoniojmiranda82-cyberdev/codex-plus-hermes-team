import type { CommerceEvent } from "./events.js";

export type WorkflowPublishResult = {
  accepted: boolean;
  duplicate: boolean;
  transportId?: string;
};

export interface WorkflowTransport {
  publish(event: CommerceEvent): Promise<{ transportId?: string }>;
}

export class CommerceWorkflowPublisher {
  private readonly published = new Set<string>();

  constructor(private readonly transport: WorkflowTransport) {}

  async publishCommerceEvent(event: CommerceEvent): Promise<WorkflowPublishResult> {
    const dedupeKey = `${event.correlationId}:${event.id}`;
    if (this.published.has(dedupeKey)) {
      return { accepted: true, duplicate: true };
    }

    const result = await this.transport.publish(event);
    this.published.add(dedupeKey);
    return {
      accepted: true,
      duplicate: false,
      ...(result.transportId ? { transportId: result.transportId } : {})
    };
  }
}

export class WebhookWorkflowTransport implements WorkflowTransport {
  constructor(
    private readonly url: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {
    if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
      throw new Error("workflow webhook must use https or localhost");
    }
  }

  async publish(event: CommerceEvent): Promise<{ transportId?: string }> {
    const response = await this.fetchImpl(this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-qcommerce-correlation-id": event.correlationId,
        "x-qcommerce-event-id": event.id
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`workflow transport failed with status ${response.status}`);
    }

    const transportId = response.headers.get("x-workflow-id");
    return transportId ? { transportId } : {};
  }
}
