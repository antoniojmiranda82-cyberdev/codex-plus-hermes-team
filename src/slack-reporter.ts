import type { SlackReporter, SlackReport } from "./operator.js";

export type SlackWebApiConfig = {
  botToken: string;
  channelId: string;
};

type FetchLike = typeof fetch;

function businessLabel(business: SlackReport["business"]): string {
  return business === "asset-ave" ? "Asset Ave" : "Dream Blvd";
}

export function createSlackWebApiReporter(
  config: SlackWebApiConfig,
  fetchFn: FetchLike = fetch
): SlackReporter {
  if (!config.botToken.trim()) throw new Error("Slack bot token is required");
  if (!config.channelId.trim()) throw new Error("Slack channel ID is required");

  return {
    async report(message) {
      const response = await fetchFn("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.botToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          channel: config.channelId,
          text: `[${businessLabel(message.business)}] ${message.text}`
        })
      });

      if (!response.ok) {
        throw new Error(`Slack HTTP error: ${response.status}`);
      }

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!payload.ok) {
        throw new Error(`Slack API error: ${payload.error ?? "unknown_error"}`);
      }
    }
  };
}
