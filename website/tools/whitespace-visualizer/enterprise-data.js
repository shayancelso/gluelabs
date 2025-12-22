/**
 * Enterprise-Grade Whitespace Analysis Dataset
 * Comprehensive data structure for sophisticated B2B SaaS demo
 */

// Product/Service Portfolio
const PRODUCTS = [
    { id: 'core-platform', name: 'Core Platform', category: 'Foundation', basePrice: 15000, complexity: 'medium' },
    { id: 'analytics-pro', name: 'Analytics Pro', category: 'Analytics', basePrice: 8000, complexity: 'low' },
    { id: 'ml-insights', name: 'ML Insights', category: 'AI/ML', basePrice: 25000, complexity: 'high' },
    { id: 'api-premium', name: 'API Premium', category: 'Integration', basePrice: 12000, complexity: 'medium' },
    { id: 'mobile-suite', name: 'Mobile Suite', category: 'Mobile', basePrice: 18000, complexity: 'medium' },
    { id: 'security-plus', name: 'Security Plus', category: 'Security', basePrice: 22000, complexity: 'high' },
    { id: 'workflow-automation', name: 'Workflow Automation', category: 'Productivity', basePrice: 16000, complexity: 'medium' },
    { id: 'reporting-enterprise', name: 'Enterprise Reporting', category: 'Analytics', basePrice: 14000, complexity: 'medium' },
    { id: 'data-warehouse', name: 'Data Warehouse', category: 'Infrastructure', basePrice: 35000, complexity: 'high' },
    { id: 'collaboration-tools', name: 'Collaboration Tools', category: 'Productivity', basePrice: 9000, complexity: 'low' },
    { id: 'compliance-suite', name: 'Compliance Suite', category: 'Security', basePrice: 28000, complexity: 'high' },
    { id: 'customer-portal', name: 'Customer Portal', category: 'Customer Experience', basePrice: 20000, complexity: 'medium' },
    { id: 'integration-hub', name: 'Integration Hub', category: 'Integration', basePrice: 24000, complexity: 'high' },
    { id: 'real-time-monitoring', name: 'Real-time Monitoring', category: 'Operations', basePrice: 19000, complexity: 'medium' },
    { id: 'advanced-permissions', name: 'Advanced Permissions', category: 'Security', basePrice: 11000, complexity: 'low' }
];

// Buying Centers/Departments
const BUYING_CENTERS = [
    { id: 'it-infrastructure', name: 'IT Infrastructure', influence: 'high', budget: 'high', decision_speed: 'slow' },
    { id: 'sales-ops', name: 'Sales Operations', influence: 'high', budget: 'medium', decision_speed: 'fast' },
    { id: 'marketing-ops', name: 'Marketing Operations', influence: 'medium', budget: 'medium', decision_speed: 'medium' },
    { id: 'finance', name: 'Finance', influence: 'high', budget: 'high', decision_speed: 'slow' },
    { id: 'hr-ops', name: 'HR Operations', influence: 'medium', budget: 'low', decision_speed: 'medium' },
    { id: 'customer-success', name: 'Customer Success', influence: 'medium', budget: 'medium', decision_speed: 'fast' },
    { id: 'product-management', name: 'Product Management', influence: 'high', budget: 'high', decision_speed: 'medium' },
    { id: 'engineering', name: 'Engineering', influence: 'high', budget: 'medium', decision_speed: 'slow' },
    { id: 'legal-compliance', name: 'Legal & Compliance', influence: 'medium', budget: 'low', decision_speed: 'slow' },
    { id: 'executive-team', name: 'Executive Team', influence: 'very_high', budget: 'very_high', decision_speed: 'fast' },
    { id: 'procurement', name: 'Procurement', influence: 'medium', budget: 'high', decision_speed: 'slow' }
];

// Comprehensive Account Database
const ENTERPRISE_ACCOUNTS = {
    'global-tech-corp': {
        name: 'Global Tech Corp',
        industry: 'Technology',
        size: 'Enterprise',
        employees: 15000,
        revenue: '$2.5B',
        region: 'North America',
        tier: 'Strategic',
        health_score: 85,
        renewal_date: '2025-08-15',
        current_arr: 485000,
        expansion_potential: 1200000,
        last_activity: '2024-12-20',
        
        // Stakeholder Network
        stakeholders: {
            'john-smith': { name: 'John Smith', role: 'CTO', department: 'engineering', influence: 'very_high', engagement: 'high' },
            'sarah-johnson': { name: 'Sarah Johnson', role: 'VP Sales Operations', department: 'sales-ops', influence: 'high', engagement: 'medium' },
            'mike-chen': { name: 'Mike Chen', role: 'Director IT', department: 'it-infrastructure', influence: 'medium', engagement: 'low' },
            'lisa-rodriguez': { name: 'Lisa Rodriguez', role: 'CFO', department: 'finance', influence: 'very_high', engagement: 'medium' }
        },
        
        // Current Product Adoption
        adopted_products: ['core-platform', 'analytics-pro', 'api-premium', 'security-plus'],
        
        // Whitespace Opportunities Matrix
        whitespace_matrix: {
            'ml-insights': {
                'engineering': { status: 'opportunity', value: 45000, probability: 0.75, timeline: '90 days', champion: 'john-smith' },
                'product-management': { status: 'opportunity', value: 35000, probability: 0.65, timeline: '120 days', champion: null },
                'executive-team': { status: 'opportunity', value: 25000, probability: 0.85, timeline: '60 days', champion: 'john-smith' }
            },
            'data-warehouse': {
                'it-infrastructure': { status: 'opportunity', value: 85000, probability: 0.60, timeline: '180 days', champion: 'mike-chen' },
                'finance': { status: 'opportunity', value: 40000, probability: 0.70, timeline: '120 days', champion: 'lisa-rodriguez' }
            },
            'workflow-automation': {
                'sales-ops': { status: 'opportunity', value: 32000, probability: 0.80, timeline: '90 days', champion: 'sarah-johnson' },
                'hr-ops': { status: 'opportunity', value: 18000, probability: 0.45, timeline: '150 days', champion: null },
                'marketing-ops': { status: 'opportunity', value: 28000, probability: 0.55, timeline: '120 days', champion: null }
            },
            'mobile-suite': {
                'sales-ops': { status: 'opportunity', value: 42000, probability: 0.70, timeline: '90 days', champion: 'sarah-johnson' },
                'customer-success': { status: 'opportunity', value: 25000, probability: 0.60, timeline: '120 days', champion: null }
            },
            'reporting-enterprise': {
                'finance': { status: 'adopted', value: 35000, adoption_date: '2024-06-15' },
                'sales-ops': { status: 'opportunity', value: 28000, probability: 0.75, timeline: '75 days', champion: 'sarah-johnson' }
            },
            'collaboration-tools': {
                'hr-ops': { status: 'opportunity', value: 15000, probability: 0.85, timeline: '45 days', champion: null },
                'marketing-ops': { status: 'opportunity', value: 18000, probability: 0.70, timeline: '60 days', champion: null }
            },
            'compliance-suite': {
                'legal-compliance': { status: 'opportunity', value: 65000, probability: 0.90, timeline: '90 days', champion: null },
                'finance': { status: 'opportunity', value: 35000, probability: 0.75, timeline: '105 days', champion: 'lisa-rodriguez' }
            }
        },
        
        // Competitive Intelligence
        competitors: {
            'salesforce': ['sales-ops', 'customer-success'],
            'microsoft': ['it-infrastructure', 'hr-ops'],
            'oracle': ['finance', 'it-infrastructure']
        },
        
        // Recent Activities
        recent_activities: [
            { date: '2024-12-20', type: 'meeting', description: 'Strategic review with CTO', stakeholder: 'john-smith', outcome: 'positive' },
            { date: '2024-12-18', type: 'demo', description: 'ML Insights demo to Product team', stakeholder: null, outcome: 'very_positive' },
            { date: '2024-12-15', type: 'email', description: 'ROI analysis sent to Finance', stakeholder: 'lisa-rodriguez', outcome: 'neutral' }
        ]
    },
    
    'innovate-startup': {
        name: 'Innovate Startup',
        industry: 'FinTech',
        size: 'Mid-Market',
        employees: 850,
        revenue: '$125M',
        region: 'North America',
        tier: 'Growth',
        health_score: 92,
        renewal_date: '2025-03-20',
        current_arr: 145000,
        expansion_potential: 380000,
        last_activity: '2024-12-19',
        
        stakeholders: {
            'alex-kumar': { name: 'Alex Kumar', role: 'VP Engineering', department: 'engineering', influence: 'high', engagement: 'high' },
            'emma-davis': { name: 'Emma Davis', role: 'Head of Sales', department: 'sales-ops', influence: 'high', engagement: 'high' },
            'david-park': { name: 'David Park', role: 'CEO', department: 'executive-team', influence: 'very_high', engagement: 'medium' }
        },
        
        adopted_products: ['core-platform', 'analytics-pro', 'mobile-suite'],
        
        whitespace_matrix: {
            'ml-insights': {
                'engineering': { status: 'opportunity', value: 35000, probability: 0.85, timeline: '60 days', champion: 'alex-kumar' },
                'sales-ops': { status: 'opportunity', value: 28000, probability: 0.75, timeline: '75 days', champion: 'emma-davis' }
            },
            'security-plus': {
                'it-infrastructure': { status: 'opportunity', value: 48000, probability: 0.70, timeline: '90 days', champion: null },
                'legal-compliance': { status: 'opportunity', value: 32000, probability: 0.60, timeline: '120 days', champion: null }
            },
            'workflow-automation': {
                'sales-ops': { status: 'opportunity', value: 25000, probability: 0.90, timeline: '45 days', champion: 'emma-davis' },
                'marketing-ops': { status: 'opportunity', value: 18000, probability: 0.65, timeline: '90 days', champion: null }
            }
        },
        
        competitors: {
            'hubspot': ['sales-ops', 'marketing-ops'],
            'zendesk': ['customer-success']
        },
        
        recent_activities: [
            { date: '2024-12-19', type: 'call', description: 'Expansion discussion with VP Engineering', stakeholder: 'alex-kumar', outcome: 'very_positive' },
            { date: '2024-12-17', type: 'demo', description: 'Security Plus demo', stakeholder: null, outcome: 'positive' }
        ]
    },
    
    'enterprise-bank': {
        name: 'Enterprise Bank',
        industry: 'Financial Services',
        size: 'Enterprise',
        employees: 25000,
        revenue: '$8.2B',
        region: 'Europe',
        tier: 'Strategic',
        health_score: 78,
        renewal_date: '2025-11-30',
        current_arr: 750000,
        expansion_potential: 2100000,
        last_activity: '2024-12-21',
        
        stakeholders: {
            'pierre-dubois': { name: 'Pierre Dubois', role: 'Chief Digital Officer', department: 'executive-team', influence: 'very_high', engagement: 'low' },
            'maria-gonzalez': { name: 'Maria Gonzalez', role: 'Head of Compliance', department: 'legal-compliance', influence: 'high', engagement: 'high' },
            'james-wilson': { name: 'James Wilson', role: 'IT Director', department: 'it-infrastructure', influence: 'medium', engagement: 'medium' }
        },
        
        adopted_products: ['core-platform', 'security-plus', 'compliance-suite', 'reporting-enterprise'],
        
        whitespace_matrix: {
            'data-warehouse': {
                'it-infrastructure': { status: 'opportunity', value: 125000, probability: 0.85, timeline: '180 days', champion: 'james-wilson' },
                'finance': { status: 'opportunity', value: 85000, probability: 0.70, timeline: '150 days', champion: null }
            },
            'ml-insights': {
                'finance': { status: 'opportunity', value: 95000, probability: 0.65, timeline: '210 days', champion: null },
                'executive-team': { status: 'opportunity', value: 75000, probability: 0.80, timeline: '120 days', champion: 'pierre-dubois' }
            },
            'api-premium': {
                'engineering': { status: 'opportunity', value: 45000, probability: 0.75, timeline: '90 days', champion: null },
                'it-infrastructure': { status: 'opportunity', value: 35000, probability: 0.80, timeline: '75 days', champion: 'james-wilson' }
            }
        },
        
        competitors: {
            'ibm': ['it-infrastructure', 'engineering'],
            'sap': ['finance', 'hr-ops'],
            'accenture': ['legal-compliance']
        },
        
        recent_activities: [
            { date: '2024-12-21', type: 'meeting', description: 'Compliance review meeting', stakeholder: 'maria-gonzalez', outcome: 'positive' },
            { date: '2024-12-19', type: 'proposal', description: 'Data warehouse proposal submitted', stakeholder: 'james-wilson', outcome: 'neutral' }
        ]
    }
};

// AI-Powered Scoring Algorithms
const SCORING_ALGORITHMS = {
    opportunity_score: function(opportunity) {
        const probabilityWeight = 0.4;
        const valueWeight = 0.3;
        const timelineWeight = 0.2;
        const championWeight = 0.1;
        
        const normalizedValue = Math.min(opportunity.value / 100000, 1);
        const normalizedTimeline = Math.max(1 - (opportunity.timeline_days || 90) / 365, 0);
        const championBonus = opportunity.champion ? 1 : 0.7;
        
        return Math.round(
            (opportunity.probability * probabilityWeight +
             normalizedValue * valueWeight +
             normalizedTimeline * timelineWeight +
             championBonus * championWeight) * 100
        );
    },
    
    account_health: function(account) {
        const engagementScore = Object.values(account.stakeholders)
            .reduce((sum, s) => sum + (s.engagement === 'high' ? 3 : s.engagement === 'medium' ? 2 : 1), 0) / 
            Object.keys(account.stakeholders).length;
        
        const adoptionScore = account.adopted_products.length / PRODUCTS.length;
        const activityScore = account.recent_activities.length > 0 ? 
            Math.min(account.recent_activities.length / 5, 1) : 0;
        
        return Math.round((engagementScore * 0.4 + adoptionScore * 0.3 + activityScore * 0.3) * 100);
    }
};

// Market Intelligence Data
const MARKET_DATA = {
    industry_benchmarks: {
        'Technology': { adoption_rate: 0.75, avg_deal_size: 45000, sales_cycle: 90 },
        'FinTech': { adoption_rate: 0.68, avg_deal_size: 38000, sales_cycle: 75 },
        'Financial Services': { adoption_rate: 0.82, avg_deal_size: 125000, sales_cycle: 180 },
        'Healthcare': { adoption_rate: 0.71, avg_deal_size: 85000, sales_cycle: 120 }
    },
    
    competitive_landscape: {
        'salesforce': { market_share: 0.23, avg_deal_size: 65000, win_rate: 0.32 },
        'hubspot': { market_share: 0.15, avg_deal_size: 28000, win_rate: 0.45 },
        'microsoft': { market_share: 0.18, avg_deal_size: 95000, win_rate: 0.38 }
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRODUCTS,
        BUYING_CENTERS,
        ENTERPRISE_ACCOUNTS,
        SCORING_ALGORITHMS,
        MARKET_DATA
    };
}