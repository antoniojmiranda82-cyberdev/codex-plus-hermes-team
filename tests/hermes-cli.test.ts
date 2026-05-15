import { describe, expect, it } from "vitest";
import { parseProfileList } from "../src/providers/hermes-cli.js";

describe("parseProfileList", () => {
  it("parses Hermes profile table output", () => {
    const output = `
 Profile          Model                        Gateway      Alias
 ───────────────    ───────────────────────────    ───────────    ────────────
  default         gpt-5.5                      stopped      —
 ◆team-core       gpt-5.5                      running      team
  team-reviewer   claude-sonnet-4.6            stopped      —
`;

    expect(parseProfileList(output)).toEqual([
      { profile: "default", model: "gpt-5.5", gateway: "stopped" },
      { profile: "team-core", model: "gpt-5.5", gateway: "running" },
      { profile: "team-reviewer", model: "claude-sonnet-4.6", gateway: "stopped" }
    ]);
  });
});
