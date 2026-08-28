export type ProjectId = "asset-dream";

export type ProjectAgent = {
  projectId: ProjectId;
  profile: string;
  displayName: string;
  role: string;
};

export const assetDreamRoster: ProjectAgent[] = [
  { projectId: "asset-dream", profile: "asset-dream:architect", displayName: "Asset Dream Architect", role: "Architecture" },
  { projectId: "asset-dream", profile: "asset-dream:asset-commerce", displayName: "Asset Ave Commerce", role: "Asset Ave Commerce" },
  { projectId: "asset-dream", profile: "asset-dream:dream-commerce", displayName: "Dream Blvd Commerce", role: "Dream Blvd Commerce" },
  { projectId: "asset-dream", profile: "asset-dream:growth", displayName: "Asset Dream Growth", role: "Growth + Campaigns" },
  { projectId: "asset-dream", profile: "asset-dream:analytics", displayName: "Asset Dream Analytics", role: "Analytics + Funnels" },
  { projectId: "asset-dream", profile: "asset-dream:ops", displayName: "Asset Dream Operations", role: "Operations + Reporting" },
  { projectId: "asset-dream", profile: "asset-dream:qa", displayName: "Asset Dream QA", role: "QA + Safety" }
];
