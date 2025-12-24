/**
 * SaaS Pricing Calculator - Business Logic Engine
 * Core calculations for revenue projections, pricing analysis, and growth modeling
 */

class PricingEngine {
    constructor() {
        this.models = [];
        this.currentModel = null;
        this.projectionCache = new Map();
    }

    /**
     * Create a new pricing model
     */
    createModel(config = {}) {
        const model = {
            id: this.generateId(),
            name: config.name || 'New Pricing Model',
            tiers: config.tiers || [],
            implementationFee: config.implementationFee || 0,
            targetMarket: config.targetMarket || 'SMB',
            created: new Date(),
            ...config
        };

        this.models.push(model);
        this.currentModel = model;
        return model;
    }

    /**
     * Add a pricing tier to the current model
     */
    addTier(tierConfig) {
        if (!this.currentModel) {
            this.createModel();
        }

        const tier = {
            id: this.generateId(),
            name: tierConfig.name || 'New Tier',
            price: tierConfig.price || 0,
            billingCycle: tierConfig.billingCycle || 'monthly',
            features: tierConfig.features || [],
            targetPercentage: tierConfig.targetPercentage || 25, // % of customers expected in this tier
            conversionRate: tierConfig.conversionRate || 2, // % of leads that convert to this tier
            ...tierConfig
        };

        this.currentModel.tiers.push(tier);
        this.clearProjectionCache();
        return tier;
    }

    /**
     * Update a pricing tier
     */
    updateTier(tierId, updates) {
        if (!this.currentModel) return null;

        const tierIndex = this.currentModel.tiers.findIndex(t => t.id === tierId);
        if (tierIndex === -1) return null;

        Object.assign(this.currentModel.tiers[tierIndex], updates);
        this.clearProjectionCache();
        return this.currentModel.tiers[tierIndex];
    }

    /**
     * Remove a pricing tier
     */
    removeTier(tierId) {
        if (!this.currentModel) return false;

        const initialLength = this.currentModel.tiers.length;
        this.currentModel.tiers = this.currentModel.tiers.filter(t => t.id !== tierId);
        
        if (this.currentModel.tiers.length < initialLength) {
            this.clearProjectionCache();
            return true;
        }
        return false;
    }

    /**
     * Calculate revenue projections for reaching a target ARR
     */
    calculateProjection(targetARR, constraints = {}) {
        const cacheKey = `${targetARR}-${JSON.stringify(constraints)}`;
        
        if (this.projectionCache.has(cacheKey)) {
            return this.projectionCache.get(cacheKey);
        }

        const {
            monthlyChurnRate = 0.05, // 5% monthly churn
            customerAcquisitionCost = 500,
            monthlyGrowthRate = 0.20, // 20% monthly growth
            maxTimeMonths = 120 // 10 years max
        } = constraints;

        if (!this.currentModel || this.currentModel.tiers.length === 0) {
            return this.createErrorProjection('No pricing model defined');
        }

        // Calculate weighted average revenue per customer
        const avgRevenuePerCustomer = this.calculateAverageRevenuePerCustomer();
        
        if (avgRevenuePerCustomer <= 0) {
            return this.createErrorProjection('Invalid pricing configuration');
        }

        // Calculate required customers for target ARR
        const requiredCustomers = Math.ceil(targetARR / avgRevenuePerCustomer);

        // Monthly churn rate (decimal)
        const churnDecimal = monthlyChurnRate / 100;
        
        // Net growth rate (growth - churn)
        const netGrowthRate = (monthlyGrowthRate / 100) - churnDecimal;
        
        if (netGrowthRate <= 0) {
            return this.createErrorProjection('Growth rate must exceed churn rate');
        }

        // Calculate months to reach target (compound growth formula)
        // Starting with 1 customer, growing at net growth rate
        // Formula: months = ln(target/start) / ln(1 + rate)
        const monthsToTarget = Math.log(requiredCustomers) / Math.log(1 + netGrowthRate);
        
        if (!isFinite(monthsToTarget) || monthsToTarget < 0) {
            return this.createErrorProjection('Invalid growth calculation');
        }
        
        if (monthsToTarget > maxTimeMonths) {
            return this.createErrorProjection(`Target unreachable within ${maxTimeMonths} months`);
        }

        // Calculate monthly metrics
        const monthlyNewCustomers = Math.max(1, Math.ceil(requiredCustomers * netGrowthRate / Math.max(1, monthsToTarget)));
        
        // Calculate Customer Lifetime Value (LTV)
        // LTV = Average Revenue Per Customer / Monthly Churn Rate
        const customerLTV = churnDecimal > 0 ? avgRevenuePerCustomer / (churnDecimal * 12) : avgRevenuePerCustomer * 24; // Default to 2 year LTV if no churn
        
        // LTV/CAC ratio
        const ltvCacRatio = customerLTV / customerAcquisitionCost;
        
        // Calculate gross margin (simplified: assumes 80% margin on software)
        const grossMargin = 0.8;

        // Generate monthly growth timeline
        const timeline = this.generateGrowthTimeline(
            1, // starting customers
            requiredCustomers,
            netGrowthRate,
            Math.ceil(monthsToTarget)
        );

        const projection = {
            success: true,
            targetARR,
            timeToTarget: {
                months: Math.ceil(monthsToTarget),
                years: Math.round(monthsToTarget / 12 * 10) / 10
            },
            requiredCustomers,
            monthlyNewCustomers,
            avgRevenuePerCustomer,
            customerLTV,
            ltvCacRatio,
            grossMargin,
            timeline,
            keyMetrics: {
                monthlyChurnRate,
                customerAcquisitionCost,
                monthlyGrowthRate,
                netGrowthRate: netGrowthRate * 100
            },
            tierBreakdown: this.calculateTierBreakdown(requiredCustomers)
        };

        this.projectionCache.set(cacheKey, projection);
        return projection;
    }

    /**
     * Calculate weighted average revenue per customer across tiers
     */
    calculateAverageRevenuePerCustomer() {
        if (!this.currentModel || this.currentModel.tiers.length === 0) {
            return 0;
        }

        // Normalize target percentages to ensure they sum to 100%
        const totalPercentage = this.currentModel.tiers.reduce((sum, tier) => 
            sum + (tier.targetPercentage || 0), 0);
        
        if (totalPercentage === 0) {
            return 0;
        }

        const weightedRevenue = this.currentModel.tiers.reduce((sum, tier) => {
            const normalizedPercentage = (tier.targetPercentage || 0) / totalPercentage;
            const annualPrice = tier.billingCycle === 'monthly' 
                ? tier.price * 12 
                : tier.price;
            return sum + (annualPrice * normalizedPercentage);
        }, 0);

        return weightedRevenue;
    }

    /**
     * Calculate how customers would be distributed across tiers
     */
    calculateTierBreakdown(totalCustomers) {
        if (!this.currentModel) return [];

        const totalPercentage = this.currentModel.tiers.reduce((sum, tier) => 
            sum + (tier.targetPercentage || 0), 0);

        return this.currentModel.tiers.map(tier => {
            const normalizedPercentage = (tier.targetPercentage || 0) / totalPercentage;
            const customersInTier = Math.ceil(totalCustomers * normalizedPercentage);
            const annualPrice = tier.billingCycle === 'monthly' 
                ? tier.price * 12 
                : tier.price;
            const tierARR = customersInTier * annualPrice;

            return {
                name: tier.name,
                customers: customersInTier,
                percentage: normalizedPercentage * 100,
                price: tier.price,
                billingCycle: tier.billingCycle,
                annualPrice,
                tierARR
            };
        });
    }

    /**
     * Generate monthly growth timeline
     */
    generateGrowthTimeline(startCustomers, targetCustomers, netGrowthRate, maxMonths) {
        const timeline = [];
        let currentCustomers = startCustomers;

        for (let month = 0; month <= maxMonths && currentCustomers < targetCustomers; month++) {
            const revenue = currentCustomers * this.calculateAverageRevenuePerCustomer();
            
            timeline.push({
                month,
                customers: Math.round(currentCustomers),
                revenue: Math.round(revenue),
                arr: Math.round(revenue) // For monthly view, ARR = current month * 12
            });

            currentCustomers *= (1 + netGrowthRate);
        }

        return timeline;
    }

    /**
     * Compare multiple pricing models
     */
    compareModels(modelIds, targetARR, constraints) {
        const comparison = {
            targetARR,
            models: [],
            winner: null,
            criteria: ['timeToTarget', 'ltvCacRatio', 'grossMargin']
        };

        modelIds.forEach(modelId => {
            const model = this.models.find(m => m.id === modelId);
            if (!model) return;

            // Temporarily set as current model for calculation
            const originalModel = this.currentModel;
            this.currentModel = model;
            
            const projection = this.calculateProjection(targetARR, constraints);
            
            comparison.models.push({
                id: model.id,
                name: model.name,
                projection,
                score: this.calculateModelScore(projection)
            });

            // Restore original model
            this.currentModel = originalModel;
        });

        // Determine winner based on score
        if (comparison.models.length > 0) {
            comparison.winner = comparison.models.reduce((best, current) => 
                current.score > best.score ? current : best
            );
        }

        return comparison;
    }

    /**
     * Calculate a composite score for model comparison
     */
    calculateModelScore(projection) {
        if (!projection.success) return 0;

        // Scoring factors (higher is better)
        const timeScore = Math.max(0, 100 - projection.timeToTarget.months); // Faster is better
        const ltvScore = Math.min(100, projection.ltvCacRatio * 10); // Higher LTV/CAC is better
        const marginScore = projection.grossMargin * 100; // Higher margin is better

        // Weighted average score
        return (timeScore * 0.4 + ltvScore * 0.4 + marginScore * 0.2);
    }

    /**
     * Load pricing model template
     */
    loadTemplate(templateName) {
        const templates = {
            freemium: {
                name: 'Freemium Model',
                tiers: [
                    { name: 'Free', price: 0, billingCycle: 'monthly', targetPercentage: 70, conversionRate: 100 },
                    { name: 'Starter', price: 29, billingCycle: 'monthly', targetPercentage: 20, conversionRate: 5 },
                    { name: 'Professional', price: 99, billingCycle: 'monthly', targetPercentage: 8, conversionRate: 2 },
                    { name: 'Enterprise', price: 299, billingCycle: 'monthly', targetPercentage: 2, conversionRate: 0.5 }
                ]
            },
            'good-better-best': {
                name: 'Good-Better-Best',
                tiers: [
                    { name: 'Good', price: 49, billingCycle: 'monthly', targetPercentage: 40, conversionRate: 8 },
                    { name: 'Better', price: 149, billingCycle: 'monthly', targetPercentage: 45, conversionRate: 5 },
                    { name: 'Best', price: 299, billingCycle: 'monthly', targetPercentage: 15, conversionRate: 2 }
                ]
            },
            'usage-based': {
                name: 'Usage-Based Pricing',
                tiers: [
                    { name: 'Starter', price: 25, billingCycle: 'monthly', targetPercentage: 50, conversionRate: 10 },
                    { name: 'Growth', price: 125, billingCycle: 'monthly', targetPercentage: 35, conversionRate: 5 },
                    { name: 'Scale', price: 500, billingCycle: 'monthly', targetPercentage: 15, conversionRate: 2 }
                ]
            },
            'seat-based': {
                name: 'Per-User Pricing',
                tiers: [
                    { name: 'Team (5 users)', price: 99, billingCycle: 'monthly', targetPercentage: 60, conversionRate: 8 },
                    { name: 'Business (25 users)', price: 399, billingCycle: 'monthly', targetPercentage: 30, conversionRate: 4 },
                    { name: 'Enterprise (Unlimited)', price: 999, billingCycle: 'monthly', targetPercentage: 10, conversionRate: 1 }
                ]
            },
            'value-based': {
                name: 'Value-Based Pricing',
                tiers: [
                    { name: 'Essential', price: 199, billingCycle: 'monthly', targetPercentage: 45, conversionRate: 6 },
                    { name: 'Professional', price: 599, billingCycle: 'monthly', targetPercentage: 35, conversionRate: 3 },
                    { name: 'Enterprise', price: 1599, billingCycle: 'monthly', targetPercentage: 20, conversionRate: 1 }
                ]
            }
        };

        const template = templates[templateName];
        if (!template) return null;

        const model = this.createModel(template);
        
        // Add tiers with proper IDs
        model.tiers = template.tiers.map(tier => ({
            ...tier,
            id: this.generateId(),
            features: this.getDefaultFeatures(tier.name)
        }));

        return model;
    }

    /**
     * Get default features for tier names
     */
    getDefaultFeatures(tierName) {
        const featureSets = {
            'Free': ['Basic features', 'Community support', 'Limited usage'],
            'Starter': ['Core features', 'Email support', 'Basic integrations'],
            'Essential': ['Core features', 'Email support', 'Standard integrations'],
            'Good': ['Essential features', 'Email support', 'Basic reporting'],
            'Team (5 users)': ['Team collaboration', 'User management', 'Email support'],
            'Professional': ['Advanced features', 'Priority support', 'Advanced integrations', 'Custom reporting'],
            'Better': ['Advanced features', 'Priority support', 'Advanced reporting'],
            'Growth': ['Scalable usage', 'API access', 'Priority support'],
            'Business (25 users)': ['Advanced team features', 'Admin controls', 'Priority support'],
            'Enterprise': ['All features', 'Dedicated support', 'Custom integrations', 'SLA'],
            'Best': ['Premium features', 'Dedicated support', 'Custom integrations'],
            'Scale': ['Enterprise features', 'Dedicated support', 'Custom solutions'],
            'Enterprise (Unlimited)': ['Unlimited usage', 'Enterprise security', 'Dedicated CSM']
        };

        return featureSets[tierName] || ['Standard features', 'Support included'];
    }

    /**
     * Export model data
     */
    exportModelData(format = 'json') {
        if (!this.currentModel) return null;

        const exportData = {
            model: this.currentModel,
            exportDate: new Date(),
            version: '1.0'
        };

        switch (format) {
            case 'csv':
                return this.exportToCSV(exportData);
            case 'json':
            default:
                return JSON.stringify(exportData, null, 2);
        }
    }

    /**
     * Export to CSV format
     */
    exportToCSV(data) {
        const { model } = data;
        let csv = 'Tier Name,Price,Billing Cycle,Target Percentage,Conversion Rate,Features\n';
        
        model.tiers.forEach(tier => {
            const features = tier.features.join('; ');
            csv += `"${tier.name}",${tier.price},"${tier.billingCycle}",${tier.targetPercentage},${tier.conversionRate},"${features}"\n`;
        });

        return csv;
    }

    /**
     * Utility functions
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    clearProjectionCache() {
        this.projectionCache.clear();
    }

    createErrorProjection(message) {
        return {
            success: false,
            error: message,
            targetARR: 0,
            timeToTarget: { months: 0, years: 0 },
            requiredCustomers: 0,
            monthlyNewCustomers: 0,
            avgRevenuePerCustomer: 0,
            customerLTV: 0,
            ltvCacRatio: 0,
            grossMargin: 0,
            timeline: [],
            tierBreakdown: []
        };
    }

    /**
     * Get current model summary
     */
    getModelSummary() {
        if (!this.currentModel) return null;

        return {
            id: this.currentModel.id,
            name: this.currentModel.name,
            tierCount: this.currentModel.tiers.length,
            avgRevenuePerCustomer: this.calculateAverageRevenuePerCustomer(),
            priceRange: this.getPriceRange(),
            lastModified: this.currentModel.lastModified || this.currentModel.created
        };
    }

    getPriceRange() {
        if (!this.currentModel || this.currentModel.tiers.length === 0) {
            return { min: 0, max: 0 };
        }

        const prices = this.currentModel.tiers.map(tier => tier.price).filter(price => price > 0);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }
}

// Make PricingEngine available globally
if (typeof window !== 'undefined') {
    window.PricingEngine = PricingEngine;
}