// Transform Discovery Questionnaire responses to Renewal Tracker configuration
import { Json } from "@/integrations/supabase/types";

/**
 * Configuration for the Renewal Tracker tool.
 * Controls how renewals are tracked, risk is assessed, and workflows operate.
 */
export interface RenewalTrackerConfig {
  // Section A: Renewal Data Sources
  crmSource?: string;
  integrationMethod?: string;
  availableFields?: string[];
  
  // Section B: Renewal Timeline & Triggers
  renewalPipelineDays?: number;
  renewalMilestones?: string[];
  autoEnterPipeline?: string;
  outreachDays?: number;
  
  // Section C: Risk Factors
  riskFactors?: string[];
  riskThreshold?: number;
  healthScoreInfluence?: string;
  
  // Section D: Outcomes & Metrics
  outcomeTypes?: string[];
  kpiMetrics?: string[];
  trackExpansionSeparately?: string;
  
  // Section E: Team Workflow
  renewalOwnerRole?: string;
  renewalActions?: string[];
  managerViews?: string[];
}

export interface QuestionTemplate {
  id: string;
  question: string;
  template_mapping?: Json;
}

// Default Renewal Tracker configuration
export const RENEWAL_DEFAULTS: RenewalTrackerConfig = {
  crmSource: 'Other',
  integrationMethod: 'CSV upload',
  availableFields: ['Contract end date', 'ARR/MRR', 'Account owner'],
  renewalPipelineDays: 90,
  renewalMilestones: ['90-day check-in', '60-day QBR/value review', '30-day renewal call', 'Contract signed'],
  autoEnterPipeline: 'Yes, auto-enter based on contract end date',
  outreachDays: 30,
  riskFactors: ['Low NPS/CSAT score', 'Declining product usage', 'No executive sponsor'],
  riskThreshold: 60,
  healthScoreInfluence: 'Health score is one of several inputs',
  outcomeTypes: ['Renewed (same value)', 'Expanded (upsell)', 'Churned (full)'],
  kpiMetrics: ['Gross Revenue Retention (GRR)', 'Net Revenue Retention (NRR)', 'Logo retention rate'],
  trackExpansionSeparately: 'Track both - expansion and total renewal value',
  renewalOwnerRole: 'Customer Success Manager',
  renewalActions: ['Create renewal task', 'Notify account owner', 'Schedule QBR meeting'],
  managerViews: ['Renewals by owner', 'At-risk renewals by ARR', 'Monthly/quarterly forecast'],
};

// Get the Renewal Tracker Tool catalog ID
export const RENEWAL_TOOL_CATALOG_ID = 'd9e0f1a2-3456-7890-bcde-f01234567890';

/**
 * Transform discovery questionnaire responses into Renewal Tracker configuration.
 * 
 * @param discoveryResponses - The responses object, keyed by question ID
 * @param questionTemplates - Optional array of question templates to map IDs to fields
 * @param companyInfo - Optional company info for context
 * @returns RenewalTrackerConfig ready to pass to RenewalTrackerPrototype
 */
export function transformDiscoveryToRenewal(
  discoveryResponses: Record<string, any>,
  questionTemplates?: QuestionTemplate[] | null,
  companyInfo?: { industry?: string; employeeCount?: string; companyName?: string }
): RenewalTrackerConfig {
  const config: RenewalTrackerConfig = { ...RENEWAL_DEFAULTS };
  
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
  
  // --- Section A: Renewal Data Sources ---
  const crmSource = findByMapping('crm_source');
  if (crmSource) config.crmSource = crmSource;
  
  const integrationMethod = findByMapping('integration_method');
  if (integrationMethod) config.integrationMethod = integrationMethod;
  
  const availableFields = findByMapping('available_fields');
  if (availableFields) {
    config.availableFields = Array.isArray(availableFields) ? availableFields : [availableFields];
  }
  
  // --- Section B: Renewal Timeline & Triggers ---
  const renewalPipelineDays = findByMapping('renewal_pipeline_days');
  if (renewalPipelineDays) {
    config.renewalPipelineDays = typeof renewalPipelineDays === 'number' 
      ? renewalPipelineDays 
      : parseInt(renewalPipelineDays) || 90;
  }
  
  const renewalMilestones = findByMapping('renewal_milestones');
  if (renewalMilestones) {
    config.renewalMilestones = Array.isArray(renewalMilestones) ? renewalMilestones : [renewalMilestones];
  }
  
  const autoEnterPipeline = findByMapping('auto_enter_pipeline');
  if (autoEnterPipeline) config.autoEnterPipeline = autoEnterPipeline;
  
  const outreachDays = findByMapping('outreach_days');
  if (outreachDays) {
    config.outreachDays = typeof outreachDays === 'number' 
      ? outreachDays 
      : parseInt(outreachDays) || 30;
  }
  
  // --- Section C: Risk Factors ---
  const riskFactors = findByMapping('risk_factors');
  if (riskFactors) {
    config.riskFactors = Array.isArray(riskFactors) ? riskFactors : [riskFactors];
  }
  
  const riskThreshold = findByMapping('risk_threshold');
  if (riskThreshold) {
    config.riskThreshold = typeof riskThreshold === 'number' 
      ? riskThreshold 
      : parseInt(riskThreshold) || 60;
  }
  
  const healthScoreInfluence = findByMapping('health_score_influence');
  if (healthScoreInfluence) config.healthScoreInfluence = healthScoreInfluence;
  
  // --- Section D: Outcomes & Metrics ---
  const outcomeTypes = findByMapping('outcome_types');
  if (outcomeTypes) {
    config.outcomeTypes = Array.isArray(outcomeTypes) ? outcomeTypes : [outcomeTypes];
  }
  
  const kpiMetrics = findByMapping('kpi_metrics');
  if (kpiMetrics) {
    config.kpiMetrics = Array.isArray(kpiMetrics) ? kpiMetrics : [kpiMetrics];
  }
  
  const trackExpansionSeparately = findByMapping('track_expansion_separately');
  if (trackExpansionSeparately) config.trackExpansionSeparately = trackExpansionSeparately;
  
  // --- Section E: Team Workflow ---
  const renewalOwnerRole = findByMapping('renewal_owner_role');
  if (renewalOwnerRole) config.renewalOwnerRole = renewalOwnerRole;
  
  const renewalActions = findByMapping('renewal_actions');
  if (renewalActions) {
    config.renewalActions = Array.isArray(renewalActions) ? renewalActions : [renewalActions];
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
 * Get renewal stage based on days to renewal
 */
export function getRenewalStage(daysToRenewal: number, config?: RenewalTrackerConfig): string {
  const pipelineDays = config?.renewalPipelineDays || 90;
  
  if (daysToRenewal < 0) return 'overdue';
  if (daysToRenewal <= 30) return 'critical';
  if (daysToRenewal <= 60) return 'active';
  if (daysToRenewal <= pipelineDays) return 'upcoming';
  return 'future';
}

/**
 * Calculate risk score based on risk factors present
 */
export function calculateRiskScore(
  presentFactors: string[],
  config?: RenewalTrackerConfig
): number {
  const allFactors = config?.riskFactors || RENEWAL_DEFAULTS.riskFactors || [];
  if (allFactors.length === 0) return 0;
  
  // Each factor contributes equally to risk score
  const factorWeight = 100 / allFactors.length;
  const matchingFactors = presentFactors.filter(f => allFactors.includes(f));
  
  return Math.round(matchingFactors.length * factorWeight);
}

/**
 * Check if an account should be flagged as at-risk
 */
export function shouldFlagAsRisk(
  riskScore: number,
  config?: RenewalTrackerConfig
): boolean {
  const threshold = config?.riskThreshold || RENEWAL_DEFAULTS.riskThreshold || 60;
  return riskScore >= threshold;
}

/**
 * Check if a manager view should be shown
 */
export function shouldShowManagerView(
  viewKey: string,
  config?: RenewalTrackerConfig
): boolean {
  return config?.managerViews?.includes(viewKey) ?? false;
}

/**
 * Check if a KPI should be shown
 */
export function shouldShowKPI(
  kpiKey: string,
  config?: RenewalTrackerConfig
): boolean {
  return config?.kpiMetrics?.includes(kpiKey) ?? false;
}

/**
 * Get the renewal milestones in order
 */
export function getRenewalMilestones(config?: RenewalTrackerConfig): string[] {
  return config?.renewalMilestones || RENEWAL_DEFAULTS.renewalMilestones || [];
}

/**
 * Get outcome badge color
 */
export function getOutcomeColor(outcome: string): { bg: string; text: string; border: string } {
  switch (outcome?.toLowerCase()) {
    case 'renewed':
    case 'renewed (same value)':
      return { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' };
    case 'expanded':
    case 'expanded (upsell)':
      return { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' };
    case 'downgraded':
    case 'downgraded (contraction)':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' };
    case 'churned':
    case 'churned (full)':
      return { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' };
    case 'partial churn':
      return { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' };
    case 'delayed':
    case 'delayed/extended':
      return { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' };
    case 'early renewal':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' };
    default:
      return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
  }
}
