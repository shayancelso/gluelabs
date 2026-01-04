// Transform Discovery Questionnaire responses to NPS Account Hub configuration
import { Json } from "@/integrations/supabase/types";

/**
 * Configuration for the NPS-Driven Account Management Hub.
 * This is NOT for survey collection - it controls how ingested NPS data
 * drives account prioritization, risk identification, and follow-up actions.
 */
export interface NPSHubConfig {
  // Section A: NPS Data Source
  npsSourceTool?: string;  // Delighted, Wootric, Zendesk, etc.
  integrationMethod?: string;  // Native, API, CSV, Manual
  availableFields?: string[];  // Score, Response date, Feedback, etc.
  
  // Section B: How NPS Should Be Used by Account Managers
  npsPriorityInfluence?: string;  // Primary signal, Supporting, Informational
  riskFlagTrigger?: string;  // Any detractor, Consecutive, Drop of X, Manual
  riskDropThreshold?: number;  // For "Drop of X points" trigger
  npsRenewalImpact?: string;  // Yes directly, Yes as input, No
  
  // Score Thresholds
  atRiskThreshold?: number;  // Max score for at-risk (e.g., 6 = 0-6)
  neutralMinThreshold?: number;  // Min score for neutral (e.g., 7)
  neutralMaxThreshold?: number;  // Max score for neutral (e.g., 8)
  healthyMinThreshold?: number;  // Min score for healthy (e.g., 9)
  
  // Section C: Follow-up & Actions
  detractorAction?: string;  // Create task, Notify owner, Escalate, All
  followupOwner?: string;  // Account owner, Support, Manager, Auto-assigned
  followupSla?: string;  // Same day, 2 business days, 5 business days, No SLA
  followupSlaDays?: number;  // Computed from followupSla
  trackRecovery?: boolean;  // Track detractor recovery over time
  
  // Section D: Account Context
  visibleAccountAttributes?: string[];  // Account owner, ARR, Renewal date, etc.
  requiredAccountAttributes?: string[];
  
  // Section E: Views & Dashboards
  repViews?: string[];  // At-risk, Recent detractors, Declining NPS, etc.
  managerViews?: string[];  // NPS by owner, At-risk by team, etc.
}

// Legacy alias for backwards compatibility
export type NPSDiscoveryConfig = NPSHubConfig;

export interface QuestionTemplate {
  id: string;
  question: string;
  template_mapping?: Json;
}

// Default NPS Hub configuration
export const NPS_DEFAULTS: NPSHubConfig = {
  npsSourceTool: 'Other',
  integrationMethod: 'Manual entry (fallback)',
  availableFields: ['Score (0-10)', 'Response date', 'Account identifier'],
  npsPriorityInfluence: 'Primary signal',
  riskFlagTrigger: 'Any detractor score',
  npsRenewalImpact: 'Yes, as one input',
  atRiskThreshold: 6,
  neutralMinThreshold: 7,
  neutralMaxThreshold: 8,
  healthyMinThreshold: 9,
  detractorAction: 'All of the above',
  followupOwner: 'Account owner',
  followupSla: '2 business days',
  followupSlaDays: 2,
  trackRecovery: true,
  visibleAccountAttributes: ['Account owner', 'ARR / contract value', 'Renewal date'],
  requiredAccountAttributes: [],
  repViews: ['My at-risk accounts', 'Recent detractors', 'Upcoming renewals with low NPS'],
  managerViews: ['NPS by owner', 'At-risk accounts by team'],
};

// Map SLA options to days
const SLA_DAYS_MAP: Record<string, number> = {
  'Same day': 1,
  '2 business days': 2,
  '5 business days': 5,
  'No SLA': 0,
};

// Get the NPS Tool catalog ID
export const NPS_TOOL_CATALOG_ID = 'b5c6d7e8-f9a0-1234-bcde-567890abcdef';

/**
 * Transform discovery questionnaire responses into NPS Hub configuration.
 * 
 * @param discoveryResponses - The responses object, keyed by question ID
 * @param questionTemplates - Optional array of question templates to map IDs to fields
 * @param companyInfo - Optional company info for context
 * @returns NPSHubConfig ready to pass to NPSAccountHub
 */
export function transformDiscoveryToNPS(
  discoveryResponses: Record<string, any>,
  questionTemplates?: QuestionTemplate[] | null,
  companyInfo?: { industry?: string; employeeCount?: string; companyName?: string }
): NPSHubConfig {
  const config: NPSHubConfig = { ...NPS_DEFAULTS };
  
  // Build a mapping from question ID to template mapping field
  const idToMapping = new Map<string, any>();
  
  if (questionTemplates && questionTemplates.length > 0) {
    questionTemplates.forEach(template => {
      if (template.template_mapping) {
        idToMapping.set(template.id, template.template_mapping);
      }
    });
  }
  
  // Helper to find response by template mapping field
  function findByMapping(field: string): any {
    for (const [id, mapping] of idToMapping.entries()) {
      const m = mapping as { field?: string };
      if (m?.field === field && discoveryResponses[id] !== undefined) {
        return discoveryResponses[id];
      }
    }
    return undefined;
  }
  
  // --- Section A: NPS Data Source ---
  const npsSourceTool = findByMapping('nps_source_tool');
  if (npsSourceTool) config.npsSourceTool = npsSourceTool;
  
  const integrationMethod = findByMapping('integration_method');
  if (integrationMethod) config.integrationMethod = integrationMethod;
  
  const availableFields = findByMapping('available_fields');
  if (availableFields) {
    config.availableFields = Array.isArray(availableFields) ? availableFields : [availableFields];
  }
  
  // --- Section B: How NPS Should Be Used ---
  const npsPriorityInfluence = findByMapping('nps_priority_influence');
  if (npsPriorityInfluence) config.npsPriorityInfluence = npsPriorityInfluence;
  
  const riskFlagTrigger = findByMapping('risk_flag_trigger');
  if (riskFlagTrigger) config.riskFlagTrigger = riskFlagTrigger;
  
  const npsRenewalImpact = findByMapping('nps_renewal_impact');
  if (npsRenewalImpact) config.npsRenewalImpact = npsRenewalImpact;
  
  // --- Score Thresholds ---
  const atRiskThreshold = findByMapping('at_risk_threshold');
  if (atRiskThreshold) {
    // Parse from options like "0-6 (Standard detractor)" -> extract max value
    const match = atRiskThreshold.match(/0-(\d+)/);
    if (match) {
      config.atRiskThreshold = parseInt(match[1]);
    }
  }
  
  const neutralThresholdRange = findByMapping('neutral_threshold_range');
  if (neutralThresholdRange) {
    // Parse from options like "7-8 (Standard passive)" -> extract min and max
    const match = neutralThresholdRange.match(/(\d+)-(\d+)/);
    if (match) {
      config.neutralMinThreshold = parseInt(match[1]);
      config.neutralMaxThreshold = parseInt(match[2]);
    }
  }
  
  const healthyMinThreshold = findByMapping('healthy_min_threshold');
  if (healthyMinThreshold) {
    // Parse from options like "9+ (Standard promoter)" -> extract min value
    const match = healthyMinThreshold.match(/(\d+)\+/);
    if (match) {
      config.healthyMinThreshold = parseInt(match[1]);
    } else if (healthyMinThreshold === '10 only (Strictest)') {
      config.healthyMinThreshold = 10;
    }
  }
  
  // --- Section C: Follow-up & Actions ---
  const detractorAction = findByMapping('detractor_action');
  if (detractorAction) config.detractorAction = detractorAction;
  
  const followupOwner = findByMapping('followup_owner');
  if (followupOwner) config.followupOwner = followupOwner;
  
  const followupSla = findByMapping('followup_sla');
  if (followupSla) {
    config.followupSla = followupSla;
    config.followupSlaDays = SLA_DAYS_MAP[followupSla] ?? 2;
  }
  
  const trackRecovery = findByMapping('track_recovery');
  if (trackRecovery !== undefined) {
    config.trackRecovery = trackRecovery === 'Yes';
  }
  
  // --- Section D: Account Context ---
  const visibleAccountAttributes = findByMapping('visible_account_attributes');
  if (visibleAccountAttributes) {
    config.visibleAccountAttributes = Array.isArray(visibleAccountAttributes) 
      ? visibleAccountAttributes 
      : [visibleAccountAttributes];
  }
  
  const requiredAccountAttributes = findByMapping('required_account_attributes');
  if (requiredAccountAttributes) {
    config.requiredAccountAttributes = Array.isArray(requiredAccountAttributes) 
      ? requiredAccountAttributes 
      : [requiredAccountAttributes];
  }
  
  // --- Section E: Views & Dashboards ---
  const repViews = findByMapping('rep_views');
  if (repViews) {
    config.repViews = Array.isArray(repViews) ? repViews : [repViews];
  }
  
  const managerViews = findByMapping('manager_views');
  if (managerViews) {
    config.managerViews = Array.isArray(managerViews) ? managerViews : [managerViews];
  }
  
  return config;
}

/**
 * Parse responses JSON that may have complex key formats
 */
export function parseResponses(responses: Json | null): Record<string, any> {
  if (!responses) return {};
  if (typeof responses === 'object' && !Array.isArray(responses)) {
    return responses as Record<string, any>;
  }
  return {};
}

/**
 * Check if a view/tab should be shown based on configuration
 */
export function shouldShowView(
  viewKey: string,
  config: NPSHubConfig
): boolean {
  // Check if explicitly in rep views
  if (config.repViews?.includes(viewKey)) {
    return true;
  }
  
  // Always show certain essential views
  const essentialViews = ['My at-risk accounts', 'Recent detractors'];
  if (essentialViews.includes(viewKey)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a manager view should be shown
 */
export function shouldShowManagerView(
  viewKey: string,
  config: NPSHubConfig
): boolean {
  return config.managerViews?.includes(viewKey) ?? false;
}

/**
 * Check if an account attribute should be visible
 */
export function shouldShowAttribute(
  attributeKey: string,
  config: NPSHubConfig
): boolean {
  const attributeMap: Record<string, string> = {
    'account_owner': 'Account owner',
    'arr': 'ARR / contract value',
    'renewal_date': 'Renewal date',
    'segment': 'Segment',
    'product': 'Product(s)',
    'lifecycle_stage': 'Lifecycle stage',
  };
  
  const displayName = attributeMap[attributeKey];
  if (!displayName) return true; // Show by default if not in map
  
  return config.visibleAccountAttributes?.includes(displayName) ?? false;
}

/**
 * Check if an attribute is required
 */
export function isAttributeRequired(
  attributeKey: string,
  config: NPSHubConfig
): boolean {
  const attributeMap: Record<string, string> = {
    'account_owner': 'Account owner',
    'arr': 'ARR / contract value',
    'renewal_date': 'Renewal date',
    'segment': 'Segment',
    'product': 'Product(s)',
    'lifecycle_stage': 'Lifecycle stage',
  };
  
  const displayName = attributeMap[attributeKey];
  if (!displayName) return false;
  
  return config.requiredAccountAttributes?.includes(displayName) ?? false;
}

/**
 * Get follow-up SLA in days
 */
export function getFollowupSlaDays(config: NPSHubConfig): number {
  return config.followupSlaDays ?? SLA_DAYS_MAP[config.followupSla || '2 business days'] ?? 2;
}

/**
 * Determine if an account should be flagged as at-risk based on config
 */
export function shouldFlagAsRisk(
  score: number,
  previousScore?: number,
  config?: NPSHubConfig
): boolean {
  if (!config) return score <= 6; // Default: any detractor
  
  switch (config.riskFlagTrigger) {
    case 'Any detractor score':
      return score <= 6;
    case 'Consecutive low scores':
      // Would need history - for now, flag detractors
      return score <= 6;
    case 'Drop of X points':
      if (previousScore !== undefined) {
        const threshold = config.riskDropThreshold ?? 3;
        return (previousScore - score) >= threshold;
      }
      return score <= 6;
    case 'Manual review only':
      return false;
    default:
      return score <= 6;
  }
}
