import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import YAML from "yaml";
import { BridgeConfigSchema, type BridgeConfig } from "./types.js";

const DEFAULT_CONFIG_PATH = join(homedir(), ".codex-plus-hermes-team", "team.yaml");

export function getConfigPath(explicitPath?: string): string {
  return (
    explicitPath ??
    process.env.CODEX_PLUS_HERMES_TEAM_CONFIG ??
    process.env.HERMES_TEAM_BRIDGE_CONFIG ??
    process.env.CODEX_HERMES_TEAM_CONFIG ??
    DEFAULT_CONFIG_PATH
  );
}

export function loadConfig(explicitPath?: string): BridgeConfig {
  const configPath = getConfigPath(explicitPath);
  const rawConfig = existsSync(configPath) ? parseConfigFile(configPath) : {};
  const parsed = BridgeConfigSchema.parse(rawConfig);

  return {
    ...parsed,
    hermes: {
      ...parsed.hermes,
      command: process.env.HERMES_COMMAND ?? parsed.hermes.command,
      defaultCwd: process.env.HERMES_DEFAULT_CWD ?? parsed.hermes.defaultCwd
    },
    discovery: {
      ...parsed.discovery,
      profilePrefix: process.env.HERMES_PROFILE_PREFIX ?? parsed.discovery.profilePrefix
    }
  };
}

function parseConfigFile(path: string): unknown {
  const raw = readFileSync(path, "utf8");
  if (path.endsWith(".json")) {
    return JSON.parse(raw);
  }
  return YAML.parse(raw);
}
