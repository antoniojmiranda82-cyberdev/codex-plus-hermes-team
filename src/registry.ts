import type { BridgeConfig, TeamAgent } from "./types.js";

export function mergeAgents(configured: TeamAgent[], discovered: TeamAgent[]): TeamAgent[] {
  const byProfile = new Map<string, TeamAgent>();

  for (const agent of discovered) {
    if (!agent.disabled) byProfile.set(agent.profile, agent);
  }

  for (const agent of configured) {
    if (agent.disabled) {
      byProfile.delete(agent.profile);
    } else {
      const existing = byProfile.get(agent.profile);
      byProfile.set(agent.profile, {
        ...existing,
        ...agent,
        capabilities: agent.capabilities.length > 0 ? agent.capabilities : existing?.capabilities ?? []
      });
    }
  }

  return [...byProfile.values()].sort((a, b) => a.profile.localeCompare(b.profile));
}

export function getConfiguredAgent(config: BridgeConfig, profile: string): TeamAgent | undefined {
  return config.agents.find((agent) => agent.profile === profile && !agent.disabled);
}
