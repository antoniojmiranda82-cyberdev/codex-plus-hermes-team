import { describe, expect, it, vi } from "vitest";
import { createSlackWebApiReporter } from "../src/slack-reporter.js";

describe("Slack web API reporter", () => {
  it("posts a business report to the configured channel", async () => {
    const fetchFn = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true, ts: "123.456" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const reporter = createSlackWebApiReporter(
      {
        botToken: "xoxb-test",
        channelId: "C123"
      },
      fetchFn
    );

    await reporter.report({ business: "asset-ave", text: "Inventory audit complete" });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe("https://slack.com/api/chat.postMessage");
    expect(init?.headers).toMatchObject({
      authorization: "Bearer xoxb-test",
      "content-type": "application/json"
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      channel: "C123",
      text: "[Asset Ave] Inventory audit complete"
    });
  });

  it("surfaces Slack API errors", async () => {
    const fetchFn = vi.fn(async () =>
      new Response(JSON.stringify({ ok: false, error: "channel_not_found" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const reporter = createSlackWebApiReporter(
      { botToken: "xoxb-test", channelId: "C404" },
      fetchFn
    );

    await expect(
      reporter.report({ business: "dream-blvd", text: "Daily brief" })
    ).rejects.toThrow("Slack API error: channel_not_found");
  });
});
