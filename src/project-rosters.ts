export type ProjectId = "asset-dream";

export type ProjectAgent = {
  projectId: ProjectId;
  profile: string;
  displayName: string;
  role: string;
  capabilities: string[];
};

export const assetDreamRoster: ProjectAgent[] = [
  { projectId: "asset-dream", profile: "asset-dream:architect", displayName: "Asset Dream Architect", role: "Architecture", capabilities: ["architecture", "orchestration", "reliability"] },
  { projectId: "asset-dream", profile: "asset-dream:asset-commerce", displayName: "Asset Ave Commerce", role: "Asset Ave Commerce", capabilities: ["shopify", "catalog", "merchandising", "ecommerce_ops"] },
  { projectId: "asset-dream", profile: "asset-dream:dream-commerce", displayName: "Dream Blvd Commerce", role: "Dream Blvd Commerce", capabilities: ["woocommerce", "catalog", "page_qa", "ecommerce_ops"] },
  { projectId: "asset-dream", profile: "asset-dream:growth", displayName: "Asset Dream Growth", role: "Growth + Campaigns", capabilities: ["seo", "social", "email", "sms", "campaigns"] },
  { projectId: "asset-dream", profile: "asset-dream:analytics", displayName: "Asset Dream Analytics", role: "Analytics + Funnels", capabilities: ["analytics", "posthog", "funnels", "conversion"] },
  { projectId: "asset-dream", profile: "asset-dream:ops", displayName: "Asset Dream Operations", role: "Operations + Reporting", capabilities: ["operations", "workflow", "reporting", "triage"] },
  { projectId: "asset-dream", profile: "asset-dream:qa", displayName: "Asset Dream QA", role: "QA + Safety", capabilities: ["qa", "validation", "safety", "testing"] }
];

const assetDreamProfiles = new Set(assetDreamRoster.map((agent) => agent.profile));

export function isAssetDreamProfile(profile: string): boolean {
  return assetDreamProfiles.has(profile);
}

export function assertAssetDreamProfile(profile: string): string {
  if (!isAssetDreamProfile(profile)) {
    throw new Error(`Unknown Asset Dream agent profile: ${profile}`);
  }
  return profile;
}
