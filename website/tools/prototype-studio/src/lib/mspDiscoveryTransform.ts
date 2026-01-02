// MSP Discovery Transform types and utilities

export interface Person {
  id: string;
  name: string;
  role?: string;
  title?: string;
  email?: string;
  side?: 'seller' | 'buyer';
}

export interface MSPStage {
  id?: string;
  name: string;
  duration?: number;
  durationDays?: number;
  owner?: string;
  owners?: string[];
  order?: number;
  tasks?: string[];
}

export interface MSPDiscoveryConfig {
  signDate?: string;
  stages?: MSPStage[];
  people?: Person[];
  salesCycleWeeks?: number;
  buyerName?: string;
}

export function extractMSPConfigFromDiscovery(_responses: Record<string, unknown>): MSPDiscoveryConfig {
  // Return empty config - in the standalone version, user configures manually
  return {};
}
