import type { RouteDecision, TeamAgent } from "./types.js";

const TOKEN_SPLIT = /[^a-zа-яё0-9+#._-]+/iu;

const STEM_ALIASES: Array<{ pattern: RegExp; aliases: string[] }> = [
  {
    pattern: /^(юрид|правов|закон|договор|контракт|комплаен|политик|рис)/iu,
    aliases: ["legal", "contracts", "compliance", "policies", "risk", "review", "formal"]
  },
  {
    pattern: /^(рын|маркет|позиционир|рост|спрос|конкур|продукт|оффер|запуск)/iu,
    aliases: ["market", "marketing", "intelligence", "positioning", "growth", "product", "offer", "business"]
  },
  {
    pattern: /^(исслед|ресер|источник|документац|сигнал|комьюнити|github)/iu,
    aliases: ["research", "sources", "documentation", "signals", "community", "github"]
  },
  {
    pattern: /^(архитект|систем|план|декомпоз|компромисс|решени)/iu,
    aliases: ["architecture", "planning", "tradeoffs", "system", "design"]
  },
  {
    pattern: /^(код|разраб|инженер|баг|отлад|скрипт|вериф|тест|надежн)/iu,
    aliases: ["code", "engineering", "debugging", "scripts", "verification", "tests", "reliability"]
  },
  {
    pattern: /^(дизайн|визуал|лендинг|облож|арт|интерфейс|ui|ux)/iu,
    aliases: ["design", "visual", "landing", "art", "interface", "ui", "ux"]
  },
  {
    pattern: /^(финанс|деньг|roi|подпис|стоим|эконом)/iu,
    aliases: ["finance", "money", "roi", "subscriptions", "economist"]
  },
  {
    pattern: /^(психолог|эмоц|стабил|ментор|ясност|решен)/iu,
    aliases: ["psychology", "emotional", "stabilization", "mentoring", "clarity"]
  },
  {
    pattern: /^(координ|приоритет|синтез|границ|менедж)/iu,
    aliases: ["coordination", "prioritization", "synthesis", "boundary", "management"]
  }
];

export function routeAgents(
  agents: TeamAgent[],
  task: string,
  options: {
    maxAgents?: number;
    defaultProfiles?: string[];
  } = {}
): RouteDecision {
  const maxAgents = options.maxAgents ?? 3;
  const taskTokens = tokenize(task);

  const scored = agents
    .filter((agent) => !agent.disabled)
    .map((agent) => scoreAgent(agent, taskTokens))
    .sort((a, b) => b.score - a.score || a.profile.localeCompare(b.profile));

  let selectedProfiles = scored.filter((item) => item.score > 0).slice(0, maxAgents).map((item) => item.profile);
  let routeMode: RouteDecision["routeMode"] = "matched";

  if (selectedProfiles.length === 0 && options.defaultProfiles?.length) {
    selectedProfiles = options.defaultProfiles.slice(0, maxAgents);
    routeMode = "default_profiles";
  }

  if (selectedProfiles.length === 0) {
    selectedProfiles = agents
      .filter((agent) => !agent.disabled)
      .slice(0, maxAgents)
      .map((agent) => agent.profile);
    routeMode = "first_available";
  }

  const agentsByProfile = new Map(agents.map((agent) => [agent.profile, agent]));
  const selectedSet = new Set(selectedProfiles);
  const scores = scored.map((item) => ({
    profile: item.profile,
    score: item.score,
    matched: item.matched,
    confidence: scoreConfidence(item.score),
    why: item.why,
    selected: selectedSet.has(item.profile)
  }));
  const selectedScores = scores.filter((item) => item.selected);

  return {
    selected: selectedProfiles
      .map((profile) => agentsByProfile.get(profile))
      .filter((agent): agent is TeamAgent => agent !== undefined),
    confidence: routeConfidence(routeMode, selectedScores),
    why: routeWhy(routeMode, selectedProfiles, selectedScores),
    routeMode,
    scores
  };
}

function scoreAgent(agent: TeamAgent, taskTokens: Set<string>) {
  const fields = [
    agent.profile,
    agent.displayName,
    agent.role,
    agent.description,
    ...agent.capabilities
  ].filter(Boolean) as string[];

  const agentTokens = new Set(fields.flatMap((field) => [...tokenize(field)]));
  const matched: string[] = [];
  let score = 0;

  for (const token of taskTokens) {
    if (agentTokens.has(token)) {
      matched.push(token);
      score += 2;
    }
  }

  for (const capability of agent.capabilities) {
    const normalized = capability.toLowerCase();
    if (taskTokens.has(normalized)) {
      matched.push(normalized);
      score += 3;
    }
  }

  const uniqueMatched = [...new Set(matched)];

  return {
    profile: agent.profile,
    score,
    matched: uniqueMatched,
    why:
      uniqueMatched.length > 0
        ? [`Matched task terms/capabilities: ${uniqueMatched.slice(0, 8).join(", ")}`]
        : []
  };
}

function scoreConfidence(score: number): number {
  if (score <= 0) return 0;
  return round2(Math.min(0.95, score / (score + 8)));
}

function routeConfidence(routeMode: RouteDecision["routeMode"], selectedScores: Array<{ confidence: number }>): number {
  if (routeMode === "default_profiles") return 0.25;
  if (routeMode === "first_available") return 0.1;
  if (selectedScores.length === 0) return 0;
  return round2(
    selectedScores.reduce((sum, item) => sum + item.confidence, 0) / selectedScores.length
  );
}

function routeWhy(
  routeMode: RouteDecision["routeMode"],
  selectedProfiles: string[],
  selectedScores: Array<{ profile: string; why: string[] }>
): string[] {
  if (routeMode === "default_profiles") {
    return [`No strong capability match; used configured default profiles: ${selectedProfiles.join(", ")}`];
  }

  if (routeMode === "first_available") {
    return [`No strong capability match or defaults; used first active profiles: ${selectedProfiles.join(", ")}`];
  }

  return selectedScores.flatMap((item) =>
    item.why.length > 0 ? item.why.map((why) => `${item.profile}: ${why}`) : []
  );
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function tokenize(input: string): Set<string> {
  const baseTokens = input
    .toLowerCase()
    .split(TOKEN_SPLIT)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3);

  const expanded = new Set<string>();
  for (const token of baseTokens) {
    expanded.add(token);
    for (const aliasGroup of STEM_ALIASES) {
      if (aliasGroup.pattern.test(token)) {
        for (const alias of aliasGroup.aliases) {
          expanded.add(alias);
        }
      }
    }
  }

  return expanded;
}
