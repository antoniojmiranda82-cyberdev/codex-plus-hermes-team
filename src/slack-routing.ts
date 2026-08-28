export type SlackEventType =
  | "approval_required"
  | "agent_activity"
  | "commerce_summary"
  | "growth_summary";

export type SlackChannelMap = {
  commandCenter: string;
  activity: string;
  salesCommerce: string;
  marketingSeo: string;
};

export function resolveSlackRoute(event: SlackEventType, channels: SlackChannelMap): string {
  switch (event) {
    case "approval_required":
      return channels.commandCenter;
    case "agent_activity":
      return channels.activity;
    case "commerce_summary":
      return channels.salesCommerce;
    case "growth_summary":
      return channels.marketingSeo;
  }
}
