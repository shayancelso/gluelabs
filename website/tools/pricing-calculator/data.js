/**
 * SaaS Pricing Calculator - Sample Data and Templates
 * Default pricing models and configuration data
 */

window.PricingData = {
    
    /**
     * Sample pricing models for different business types
     */
    sampleModels: {
        
        // B2B SaaS Account Management (like Glue)
        'b2b-account-management': {
            name: 'B2B Account Management Platform',
            description: 'Revenue intelligence and customer success tools',
            targetMarket: 'Mid-market B2B SaaS',
            tiers: [
                {
                    name: 'Starter',
                    price: 297,
                    billingCycle: 'monthly',
                    targetPercentage: 40,
                    conversionRate: 6,
                    features: [
                        'Whitespace Analysis (unlimited)',
                        'Account Health Dashboard (100 accounts)',
                        'Standard data import (CSV)',
                        'Basic reporting and exports',
                        'Email support'
                    ]
                },
                {
                    name: 'Professional', 
                    price: 797,
                    billingCycle: 'monthly',
                    targetPercentage: 45,
                    conversionRate: 3,
                    features: [
                        'Everything in Starter',
                        'Churn Predictor with ML insights',
                        'QBR Builder (automated reports)',
                        'Advanced analytics and filtering',
                        'Up to 500 accounts',
                        'Slack/Teams integrations',
                        'Priority support'
                    ]
                },
                {
                    name: 'Enterprise',
                    price: 1497,
                    billingCycle: 'monthly', 
                    targetPercentage: 15,
                    conversionRate: 1,
                    features: [
                        'Everything in Professional',
                        'Full Tool Suite (8 tools)',
                        'Stakeholder Mapping & Renewal Tracker',
                        'Unlimited accounts',
                        'Custom integrations & APIs',
                        'White-label options',
                        'Dedicated success manager'
                    ]
                }
            ],
            benchmarks: {
                marketSize: 'Mid-market B2B SaaS ($1M-$50M ARR)',
                competitorPricing: {
                    'Gainsight': { min: 4000, max: 8000, note: 'Monthly, enterprise focus' },
                    'ChurnZero': { min: 2000, max: 4000, note: 'Monthly, mid-market' },
                    'HubSpot Service': { min: 700, max: 2000, note: 'Monthly, broad market' }
                }
            }
        },

        // Analytics Platform
        'analytics-platform': {
            name: 'Business Intelligence Platform',
            description: 'Data analytics and visualization tools',
            targetMarket: 'SMB to Enterprise',
            tiers: [
                {
                    name: 'Starter',
                    price: 49,
                    billingCycle: 'monthly',
                    targetPercentage: 50,
                    conversionRate: 12,
                    features: [
                        'Up to 3 dashboards',
                        '10 data sources',
                        'Standard visualizations',
                        'Email reports',
                        'Community support'
                    ]
                },
                {
                    name: 'Professional',
                    price: 149, 
                    billingCycle: 'monthly',
                    targetPercentage: 35,
                    conversionRate: 6,
                    features: [
                        'Unlimited dashboards',
                        '50 data sources',
                        'Advanced visualizations',
                        'Automated alerts',
                        'API access',
                        'Priority support'
                    ]
                },
                {
                    name: 'Enterprise',
                    price: 449,
                    billingCycle: 'monthly',
                    targetPercentage: 15,
                    conversionRate: 2,
                    features: [
                        'Everything in Professional',
                        'Unlimited data sources',
                        'White-label options',
                        'Advanced security',
                        'Custom integrations',
                        'Dedicated account manager'
                    ]
                }
            ]
        },

        // Productivity Tool
        'productivity-tool': {
            name: 'Team Productivity Suite',
            description: 'Project management and collaboration platform',
            targetMarket: 'SMB teams and enterprises',
            tiers: [
                {
                    name: 'Basic',
                    price: 8,
                    billingCycle: 'monthly',
                    targetPercentage: 60,
                    conversionRate: 25,
                    features: [
                        'Up to 15 team members',
                        'Unlimited projects',
                        'Basic task management',
                        'File sharing (5GB)',
                        'Mobile apps'
                    ]
                },
                {
                    name: 'Standard',
                    price: 16,
                    billingCycle: 'monthly',
                    targetPercentage: 30,
                    conversionRate: 15,
                    features: [
                        'Up to 50 team members',
                        'Advanced project features',
                        'Custom fields',
                        'File sharing (100GB)',
                        'Time tracking',
                        'Priority support'
                    ]
                },
                {
                    name: 'Premium',
                    price: 32,
                    billingCycle: 'monthly',
                    targetPercentage: 10,
                    conversionRate: 5,
                    features: [
                        'Unlimited team members',
                        'Advanced reporting',
                        'Custom workflows', 
                        'Unlimited storage',
                        'Advanced integrations',
                        'Admin controls',
                        'Dedicated support'
                    ]
                }
            ]
        },

        // Usage-Based SaaS
        'usage-based-api': {
            name: 'API-First Platform',
            description: 'Usage-based API and infrastructure service',
            targetMarket: 'Developers and tech companies',
            tiers: [
                {
                    name: 'Developer',
                    price: 25,
                    billingCycle: 'monthly',
                    targetPercentage: 70,
                    conversionRate: 15,
                    features: [
                        '100K API calls/month',
                        'Basic rate limiting',
                        'Community support',
                        'Standard SLA (99.5%)',
                        'Basic analytics'
                    ]
                },
                {
                    name: 'Startup',
                    price: 125,
                    billingCycle: 'monthly', 
                    targetPercentage: 20,
                    conversionRate: 8,
                    features: [
                        '1M API calls/month',
                        'Advanced rate limiting',
                        'Email support',
                        'Enhanced SLA (99.9%)',
                        'Advanced analytics',
                        'Webhooks'
                    ]
                },
                {
                    name: 'Scale',
                    price: 500,
                    billingCycle: 'monthly',
                    targetPercentage: 10,
                    conversionRate: 3,
                    features: [
                        '10M+ API calls/month',
                        'Custom rate limiting',
                        'Priority support',
                        'Premium SLA (99.99%)',
                        'Custom analytics',
                        'Dedicated infrastructure',
                        'Account manager'
                    ]
                }
            ]
        }
    },

    /**
     * Industry benchmarks and market data
     */
    industryBenchmarks: {
        'B2B SaaS': {
            avgChurnRate: 5.2, // Monthly %
            avgCAC: 458, // USD
            avgGrowthRate: 15, // Monthly %
            avgGrossMargin: 78, // %
            typicalLTVCACRatio: 3.5
        },
        'Analytics': {
            avgChurnRate: 6.1,
            avgCAC: 324,
            avgGrowthRate: 18,
            avgGrossMargin: 82,
            typicalLTVCACRatio: 4.2
        },
        'Productivity': {
            avgChurnRate: 8.3,
            avgCAC: 145,
            avgGrowthRate: 22,
            avgGrossMargin: 85,
            typicalLTVCACRatio: 5.1
        },
        'Developer Tools': {
            avgChurnRate: 4.8,
            avgCAC: 287,
            avgGrowthRate: 25,
            avgGrossMargin: 88,
            typicalLTVCACRatio: 6.2
        }
    },

    /**
     * Common ARR targets and timelines
     */
    arrTargets: [
        { value: 1000, label: '$1K ARR', timeframe: 'Validation stage' },
        { value: 10000, label: '$10K ARR', timeframe: 'Early traction' },
        { value: 100000, label: '$100K ARR', timeframe: 'Product-market fit' },
        { value: 1000000, label: '$1M ARR', timeframe: 'Scale stage' },
        { value: 10000000, label: '$10M ARR', timeframe: 'Growth stage' },
        { value: 100000000, label: '$100M ARR', timeframe: 'Mature business' }
    ],

    /**
     * Pricing psychology insights and best practices
     */
    pricingInsights: {
        tierOptimization: {
            optimalTierCount: '3-4 tiers',
            reasoning: 'Too few tiers limit revenue capture, too many create decision paralysis',
            distribution: {
                '3 tiers': 'Good-Better-Best (most common)',
                '4 tiers': 'Free-Starter-Pro-Enterprise (freemium model)'
            }
        },
        
        priceAnchoring: {
            highAnchor: 'Start with premium tier to establish value perception',
            decoyEffect: 'Middle tier should provide clear value vs alternatives',
            freeTrials: 'Can reduce perceived risk but may lower perceived value'
        },

        billingOptimization: {
            annualDiscount: '15-25% typical discount for annual billing',
            cashFlowBenefit: 'Annual billing improves cash flow and reduces churn',
            monthlyOption: 'Keep monthly option for easier customer acquisition'
        },

        conversionRates: {
            freeToPaid: '2-5% typical for B2B SaaS freemium',
            trialToPaid: '15-20% typical for B2B SaaS trials',
            leadToPaid: '1-3% typical for B2B SaaS direct sales'
        }
    },

    /**
     * Competitive analysis templates
     */
    competitiveTemplates: {
        'undercut-strategy': {
            name: 'Value-Based Undercut',
            description: 'Price 30-50% below market leaders while maintaining features',
            riskLevel: 'Medium',
            suitableFor: 'Market entry, differentiated product'
        },
        'premium-strategy': {
            name: 'Premium Positioning',
            description: 'Price 20-40% above market with superior features/service',
            riskLevel: 'High',
            suitableFor: 'Established brand, unique value proposition'
        },
        'market-matching': {
            name: 'Competitive Parity',
            description: 'Match market pricing, compete on features and service',
            riskLevel: 'Low',
            suitableFor: 'Feature parity, brand building phase'
        }
    },

    /**
     * Revenue model variations
     */
    revenueModels: {
        subscription: {
            name: 'Recurring Subscription',
            characteristics: ['Predictable revenue', 'High LTV', 'Scalable'],
            bestFor: 'Software platforms, ongoing service delivery'
        },
        usage: {
            name: 'Usage-Based',
            characteristics: ['Revenue grows with customer success', 'Transparent pricing'],
            bestFor: 'APIs, infrastructure, variable usage patterns'
        },
        hybrid: {
            name: 'Hybrid (Base + Usage)',
            characteristics: ['Predictable base + growth upside', 'Complex pricing'],
            bestFor: 'Platforms with both fixed and variable costs'
        },
        freemium: {
            name: 'Freemium',
            characteristics: ['Viral growth potential', 'Long sales cycles', 'High volume needed'],
            bestFor: 'Network effect products, consumer-adjacent'
        }
    },

    /**
     * Utility functions for accessing data
     */
    utils: {
        
        getModelByType(modelType) {
            return this.sampleModels[modelType] || null;
        },

        getBenchmarkByIndustry(industry) {
            return this.industryBenchmarks[industry] || this.industryBenchmarks['B2B SaaS'];
        },

        getARRTarget(value) {
            return this.arrTargets.find(target => target.value === value);
        },

        calculateMarketPosition(yourPrice, competitorPrices) {
            const sortedPrices = [...competitorPrices, yourPrice].sort((a, b) => a - b);
            const position = sortedPrices.indexOf(yourPrice);
            const total = sortedPrices.length;
            
            if (position === 0) return 'Market leader (lowest price)';
            if (position === total - 1) return 'Premium positioning (highest price)';
            return `Mid-market (${position + 1} of ${total})`;
        },

        suggestPricingStrategy(targetMarket, competitivePosition) {
            const strategies = {
                'new-market': 'Consider penetration pricing to gain market share',
                'established': 'Focus on value-based pricing and differentiation',
                'crowded': 'Either go premium with clear differentiation or undercut significantly',
                'enterprise': 'Custom pricing and value-based models work best',
                'smb': 'Simple, transparent pricing with clear tiers'
            };

            return strategies[targetMarket] || strategies['established'];
        }
    }
};

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.PricingData;
}