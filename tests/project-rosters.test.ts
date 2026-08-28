import { describe, expect, it } from "vitest";
import { assetDreamRoster, assertAssetDreamProfile, isAssetDreamProfile } from "../src/project-rosters.js";

describe("Asset Dream project roster isolation", () => {
  it("uses project-scoped profile ids for every worker", () => {
    expect(assetDreamRoster).toHaveLength(7);
    expect(assetDreamRoster.every((agent) => agent.projectId === "asset-dream")).toBe(true);
    expect(assetDreamRoster.every((agent) => agent.profile.startsWith("asset-dream:"))).toBe(true);
    expect(new Set(assetDreamRoster.map((agent) => agent.profile)).size).toBe(assetDreamRoster.length);
  });

  it("accepts only registered Asset Dream profiles", () => {
    expect(isAssetDreamProfile("asset-dream:growth")).toBe(true);
    expect(isAssetDreamProfile("team-growth")).toBe(false);
    expect(isAssetDreamProfile("qcore:growth")).toBe(false);
    expect(() => assertAssetDreamProfile("team-growth")).toThrow(/Asset Dream agent profile/);
    expect(assertAssetDreamProfile("asset-dream:qa")).toBe("asset-dream:qa");
  });
});
