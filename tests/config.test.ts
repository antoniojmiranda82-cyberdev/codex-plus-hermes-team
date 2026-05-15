import { describe, expect, it } from "vitest";
import { BridgeConfigSchema } from "../src/types.js";

describe("BridgeConfigSchema", () => {
  it("defaults to advice-only side-effect policy", () => {
    expect(BridgeConfigSchema.parse({}).safety.defaultSideEffectPolicy).toBe("advice_only");
  });
});
