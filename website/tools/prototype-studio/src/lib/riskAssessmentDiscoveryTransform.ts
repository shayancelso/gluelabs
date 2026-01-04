/**
 * Transform discovery questionnaire responses into Risk Assessment configuration.
 * Maps category importance answers to indicator weight adjustments.
 */

// Competitive Risk Assessment Tool catalog ID
export const RISK_ASSESSMENT_TOOL_CATALOG_ID = '99cd7975-7b3f-4774-8ec6-5984d5895f45';

// Importance level to weight multiplier mapping (for legacy text-based responses)
const IMPORTANCE_MULTIPLIERS: Record<string, number> = {
  'Critical - Primary indicator': 2.0,
  'High - Major factor': 1.5,
  'Medium - Moderate influence': 1.0,
  'Low - Minor factor': 0.5,
};

// Convert 1-10 slider value to weight multiplier
function sliderToMultiplier(value: number): number {
  // 1-3 = Low (0.5), 4-5 = Medium (1.0), 6-8 = High (1.5), 9-10 = Critical (2.0)
  if (value >= 9) return 2.0;
  if (value >= 6) return 1.5;
  if (value >= 4) return 1.0;
  return 0.5;
}

export interface RiskAssessmentDiscoveryConfig {
  clientType: 'b2b_enterprise' | 'b2b_smb' | 'b2c';
  categoryWeights: {
    Relationship: number;
    Adoption: number;
    Financial: number;
    Technical: number;
    Operational: number;
    Social: number;
    Engagement: number;
  };
  indicatorSettings: {
    champion_strength?: { enabled: boolean; weight: number };
    communication_frequency?: { enabled: boolean; weight: number };
    executive_sentiment?: { enabled: boolean; weight: number };
  };
  riskThreshold: number;
  autoActionItems: 'always' | 'critical' | 'never';
  primaryUseCase: string;
}

// Map field names to category keys
const FIELD_TO_CATEGORY: Record<string, keyof RiskAssessmentDiscoveryConfig['categoryWeights']> = {
  relationship_importance: 'Relationship',
  adoption_importance: 'Adoption',
  financial_importance: 'Financial',
  technical_importance: 'Technical',
  social_importance: 'Social',
};

interface QuestionTemplate {
  id: string;
  question: string;
  template_mapping: Record<string, any> | null;
}

/**
 * Transform discovery questionnaire responses into Risk Assessment configuration.
 */
export function transformDiscoveryToRiskAssessment(
  discoveryResponses: Record<string, any>,
  questionTemplates?: QuestionTemplate[]
): RiskAssessmentDiscoveryConfig {
  // Default configuration
  const config: RiskAssessmentDiscoveryConfig = {
    clientType: 'b2b_enterprise',
    categoryWeights: {
      Relationship: 1.0,
      Adoption: 1.0,
      Financial: 1.0,
      Technical: 1.0,
      Operational: 1.0,
      Social: 1.0,
      Engagement: 1.0,
    },
    indicatorSettings: {},
    riskThreshold: 60,
    autoActionItems: 'always',
    primaryUseCase: 'Portfolio health monitoring',
  };

  if (!discoveryResponses || !questionTemplates) {
    return config;
  }

  // Build a map from question ID to template mapping
  const templateMap = new Map<string, QuestionTemplate['template_mapping']>();
  questionTemplates.forEach((qt) => {
    if (qt.template_mapping) {
      templateMap.set(qt.id, qt.template_mapping);
    }
  });

  // Process each response
  for (const [questionId, response] of Object.entries(discoveryResponses)) {
    const mapping = templateMap.get(questionId);
    if (!mapping) continue;

    const { field, indicator } = mapping;

    // Handle client type
    if (field === 'client_type' && typeof response === 'string') {
      const lowerResponse = response.toLowerCase();
      if (lowerResponse.includes('enterprise')) {
        config.clientType = 'b2b_enterprise';
      } else if (lowerResponse.includes('smb') || lowerResponse.includes('mid market') || lowerResponse.includes('midmarket')) {
        config.clientType = 'b2b_smb';
      } else if (lowerResponse.includes('b2c') || lowerResponse.includes('consumer')) {
        config.clientType = 'b2c';
      }
      // If "Other" with no specific type keyword, default remains b2b_enterprise
    }

    // Handle category importance weights using field mapping
    if (field && FIELD_TO_CATEGORY[field]) {
      let multiplier = 1.0;
      
      // Handle both slider (number) and legacy select (string) responses
      if (typeof response === 'number') {
        multiplier = sliderToMultiplier(response);
      } else if (typeof response === 'string') {
        multiplier = IMPORTANCE_MULTIPLIERS[response] || 1.0;
      }
      
      const categoryKey = FIELD_TO_CATEGORY[field];
      config.categoryWeights[categoryKey] = multiplier;
      
      // Technical also affects Operational
      if (field === 'technical_importance') {
        config.categoryWeights.Operational = multiplier;
      }
      // Social also affects Engagement
      if (field === 'social_importance') {
        config.categoryWeights.Engagement = multiplier;
      }
    }

    // Handle indicator-specific settings
    if (indicator && typeof response === 'string') {
      const isEnabled = !response.includes('Not') && !response.includes('No -');
      const trackingQuality = response.includes('Actively') || response.includes('Automated') || response.includes('Regular')
        ? 1.2
        : response.includes('Partially') || response.includes('Manual') || response.includes('Ad-hoc')
        ? 1.0
        : 0.8;

      config.indicatorSettings[indicator as keyof typeof config.indicatorSettings] = {
        enabled: isEnabled,
        weight: trackingQuality,
      };
    }

    // Handle risk threshold (slider value)
    if (field === 'risk_threshold' && typeof response === 'number') {
      config.riskThreshold = response;
    }

    // Handle auto action items
    if (field === 'auto_action_items' && typeof response === 'string') {
      if (response.includes('Always')) {
        config.autoActionItems = 'always';
      } else if (response.includes('Only for critical')) {
        config.autoActionItems = 'critical';
      } else {
        config.autoActionItems = 'never';
      }
    }

    // Handle primary use case
    if (field === 'primary_use_case' && typeof response === 'string') {
      config.primaryUseCase = response;
    }
  }

  return config;
}

/**
 * Apply discovery configuration to adjust indicator weights.
 * Returns the weight adjustment factor for a given category.
 */
export function getCategoryWeightAdjustment(
  config: RiskAssessmentDiscoveryConfig,
  category: string
): number {
  return config.categoryWeights[category as keyof typeof config.categoryWeights] || 1.0;
}

/**
 * Check if an indicator should be shown based on discovery config.
 */
export function isIndicatorEnabled(
  config: RiskAssessmentDiscoveryConfig,
  indicatorId: string
): boolean {
  const setting = config.indicatorSettings[indicatorId as keyof typeof config.indicatorSettings];
  return setting?.enabled !== false;
}

/**
 * Get indicator-specific weight adjustment.
 */
export function getIndicatorWeightAdjustment(
  config: RiskAssessmentDiscoveryConfig,
  indicatorId: string
): number {
  const setting = config.indicatorSettings[indicatorId as keyof typeof config.indicatorSettings];
  return setting?.weight || 1.0;
}
