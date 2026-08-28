import { describe, expect, it } from "vitest";
import { resolveSlackRoute } from "../src/slack-routing.js";

describe("project Slack routing", () => {
  const channels = {
    commandCenter: "C_COMMAND",
    activity: "C_ACTIVITY",
    salesCommerce: "C_COMMERCE",
    marketingSeo: "C_MARKETING"
  };

  it("routes approval requests to command center", () => {
    expect(resolveSlackRoute("approval_required", channels)).toBe(channels.commandCenter);
  });

  it("routes routine execution events to private activity", () => {
    expect(resolveSlackRoute("agent_activity", channels)).toBe(channels.activity);
  });

  it("routes commerce summaries to sales-commerce", () => {
    expect(resolveSlackRoute("commerce_summary", channels)).toBe(channels.salesCommerce);
  });

  it("routes growth summaries to marketing-seo", () => {
    expect(resolveSlackRoute("growth_summary", channels)).toBe(channels.marketingSeo);
  });
});
