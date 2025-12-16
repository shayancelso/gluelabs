/**
 * Whitespace Visualizer — Demo Data
 * This file can be swapped for API calls or CSV parsing later
 */

// Available modules in the platform
const MODULES = [
    { id: 'payments', name: 'Payments' },
    { id: 'mass_payments', name: 'Mass Payments' },
    { id: 'supplier_mgmt', name: 'Supplier Management' },
    { id: 'tax_compliance', name: 'Tax Compliance' },
    { id: 'invoice_mgmt', name: 'Invoice Management' },
    { id: 'purchase_orders', name: 'Purchase Orders' },
    { id: 'procurement', name: 'Procurement' },
    { id: 'expense_mgmt', name: 'Expense Management' },
    { id: 'bill_pay', name: 'Bill Pay' },
    { id: 'analytics', name: 'Analytics' }
];

const DEMO_ACCOUNTS = [
    {
        id: 'acme',
        name: 'Acme Corp',
        industry: 'Technology',
        arr: 125000,
        employees: 450,
        region: 'North America',
        segment: 'Mid-Market',
        healthScore: 78,
        products: [
            { id: 'core', name: 'Core Platform', status: 'adopted', value: 45000, adoptedDate: '2023-01' },
            { id: 'analytics', name: 'Analytics Suite', status: 'adopted', value: 30000, adoptedDate: '2023-06' },
            { id: 'api', name: 'Enterprise API', status: 'opportunity', value: 120000, likelihood: 'high' },
            { id: 'security', name: 'Security Add-on', status: 'opportunity', value: 85000, likelihood: 'medium' },
            { id: 'mobile', name: 'Mobile SDK', status: 'not_applicable', value: 0, reason: 'No mobile app' }
        ],
        regions: [
            { name: 'North America', status: 'adopted', value: 75000 },
            { name: 'Europe', status: 'opportunity', value: 95000, likelihood: 'high' },
            { name: 'Asia Pacific', status: 'opportunity', value: 60000, likelihood: 'medium' },
            { name: 'Latin America', status: 'not_applicable', value: 0, reason: 'No presence' }
        ],
        segments: [
            { name: 'Engineering', status: 'adopted', value: 50000, users: 120 },
            { name: 'Sales', status: 'adopted', value: 25000, users: 45 },
            { name: 'Marketing', status: 'opportunity', value: 40000, likelihood: 'high' },
            { name: 'Customer Success', status: 'opportunity', value: 35000, likelihood: 'medium' },
            { name: 'Finance', status: 'not_applicable', value: 0, reason: 'Different tooling' }
        ],
        modules: {
            payments: false,
            mass_payments: false,
            supplier_mgmt: true,
            tax_compliance: true,
            invoice_mgmt: false,
            purchase_orders: false,
            procurement: false,
            expense_mgmt: false,
            bill_pay: false,
            analytics: true
        }
    },
    {
        id: 'techstart',
        name: 'TechStart Inc',
        industry: 'SaaS',
        arr: 89000,
        employees: 280,
        region: 'North America',
        segment: 'Mid-Market',
        healthScore: 85,
        products: [
            { id: 'core', name: 'Core Platform', status: 'adopted', value: 35000, adoptedDate: '2022-09' },
            { id: 'analytics', name: 'Analytics Suite', status: 'opportunity', value: 45000, likelihood: 'high' },
            { id: 'api', name: 'Enterprise API', status: 'adopted', value: 54000, adoptedDate: '2023-03' },
            { id: 'security', name: 'Security Add-on', status: 'opportunity', value: 65000, likelihood: 'high' },
            { id: 'mobile', name: 'Mobile SDK', status: 'opportunity', value: 38000, likelihood: 'low' }
        ],
        regions: [
            { name: 'North America', status: 'adopted', value: 89000 },
            { name: 'Europe', status: 'opportunity', value: 72000, likelihood: 'medium' },
            { name: 'Asia Pacific', status: 'not_applicable', value: 0, reason: 'Future expansion' },
            { name: 'Latin America', status: 'not_applicable', value: 0, reason: 'No plans' }
        ],
        segments: [
            { name: 'Engineering', status: 'adopted', value: 60000, users: 95 },
            { name: 'Sales', status: 'opportunity', value: 35000, likelihood: 'high' },
            { name: 'Marketing', status: 'opportunity', value: 28000, likelihood: 'medium' },
            { name: 'Customer Success', status: 'adopted', value: 29000, users: 32 },
            { name: 'Finance', status: 'not_applicable', value: 0, reason: 'Not a fit' }
        ],
        modules: {
            payments: true,
            mass_payments: false,
            supplier_mgmt: false,
            tax_compliance: true,
            invoice_mgmt: true,
            purchase_orders: false,
            procurement: false,
            expense_mgmt: false,
            bill_pay: true,
            analytics: false
        }
    },
    {
        id: 'globalco',
        name: 'GlobalCo',
        industry: 'Enterprise',
        arr: 245000,
        employees: 2100,
        region: 'Global',
        segment: 'Enterprise',
        healthScore: 62,
        products: [
            { id: 'core', name: 'Core Platform', status: 'adopted', value: 95000, adoptedDate: '2021-11' },
            { id: 'analytics', name: 'Analytics Suite', status: 'adopted', value: 75000, adoptedDate: '2022-02' },
            { id: 'api', name: 'Enterprise API', status: 'adopted', value: 75000, adoptedDate: '2022-08' },
            { id: 'security', name: 'Security Add-on', status: 'opportunity', value: 150000, likelihood: 'high' },
            { id: 'mobile', name: 'Mobile SDK', status: 'opportunity', value: 95000, likelihood: 'medium' }
        ],
        regions: [
            { name: 'North America', status: 'adopted', value: 120000 },
            { name: 'Europe', status: 'adopted', value: 85000 },
            { name: 'Asia Pacific', status: 'opportunity', value: 140000, likelihood: 'high' },
            { name: 'Latin America', status: 'opportunity', value: 65000, likelihood: 'low' }
        ],
        segments: [
            { name: 'Engineering', status: 'adopted', value: 100000, users: 450 },
            { name: 'Sales', status: 'adopted', value: 75000, users: 280 },
            { name: 'Marketing', status: 'adopted', value: 45000, users: 120 },
            { name: 'Customer Success', status: 'opportunity', value: 55000, likelihood: 'high' },
            { name: 'Finance', status: 'opportunity', value: 40000, likelihood: 'medium' }
        ],
        modules: {
            payments: true,
            mass_payments: true,
            supplier_mgmt: true,
            tax_compliance: true,
            invoice_mgmt: true,
            purchase_orders: false,
            procurement: true,
            expense_mgmt: false,
            bill_pay: true,
            analytics: true
        }
    },
    {
        id: 'fastgrow',
        name: 'FastGrow LLC',
        industry: 'Fintech',
        arr: 67000,
        employees: 150,
        region: 'North America',
        segment: 'SMB',
        healthScore: 91,
        products: [
            { id: 'core', name: 'Core Platform', status: 'adopted', value: 28000, adoptedDate: '2023-04' },
            { id: 'analytics', name: 'Analytics Suite', status: 'adopted', value: 22000, adoptedDate: '2023-07' },
            { id: 'api', name: 'Enterprise API', status: 'opportunity', value: 45000, likelihood: 'medium' },
            { id: 'security', name: 'Security Add-on', status: 'adopted', value: 17000, adoptedDate: '2023-09' },
            { id: 'mobile', name: 'Mobile SDK', status: 'opportunity', value: 32000, likelihood: 'high' }
        ],
        regions: [
            { name: 'North America', status: 'adopted', value: 67000 },
            { name: 'Europe', status: 'opportunity', value: 45000, likelihood: 'high' },
            { name: 'Asia Pacific', status: 'not_applicable', value: 0, reason: 'No expansion plans' },
            { name: 'Latin America', status: 'not_applicable', value: 0, reason: 'No expansion plans' }
        ],
        segments: [
            { name: 'Engineering', status: 'adopted', value: 40000, users: 65 },
            { name: 'Sales', status: 'adopted', value: 27000, users: 40 },
            { name: 'Marketing', status: 'opportunity', value: 22000, likelihood: 'high' },
            { name: 'Customer Success', status: 'not_applicable', value: 0, reason: 'Too small' },
            { name: 'Finance', status: 'not_applicable', value: 0, reason: 'Not a fit' }
        ],
        modules: {
            payments: false,
            mass_payments: false,
            supplier_mgmt: true,
            tax_compliance: false,
            invoice_mgmt: false,
            purchase_orders: false,
            procurement: true,
            expense_mgmt: true,
            bill_pay: false,
            analytics: false
        }
    },
    {
        id: 'innovate',
        name: 'Innovate Systems',
        industry: 'Healthcare',
        arr: 178000,
        employees: 890,
        region: 'North America',
        segment: 'Mid-Market',
        healthScore: 74,
        products: [
            { id: 'core', name: 'Core Platform', status: 'adopted', value: 68000, adoptedDate: '2022-05' },
            { id: 'analytics', name: 'Analytics Suite', status: 'adopted', value: 55000, adoptedDate: '2022-11' },
            { id: 'api', name: 'Enterprise API', status: 'adopted', value: 55000, adoptedDate: '2023-02' },
            { id: 'security', name: 'Security Add-on', status: 'opportunity', value: 95000, likelihood: 'high' },
            { id: 'mobile', name: 'Mobile SDK', status: 'not_applicable', value: 0, reason: 'Compliance issues' }
        ],
        regions: [
            { name: 'North America', status: 'adopted', value: 178000 },
            { name: 'Europe', status: 'opportunity', value: 120000, likelihood: 'medium' },
            { name: 'Asia Pacific', status: 'not_applicable', value: 0, reason: 'Regulatory barriers' },
            { name: 'Latin America', status: 'opportunity', value: 55000, likelihood: 'low' }
        ],
        segments: [
            { name: 'Engineering', status: 'adopted', value: 75000, users: 200 },
            { name: 'Sales', status: 'adopted', value: 48000, users: 85 },
            { name: 'Marketing', status: 'adopted', value: 35000, users: 45 },
            { name: 'Customer Success', status: 'opportunity', value: 42000, likelihood: 'high' },
            { name: 'Finance', status: 'opportunity', value: 28000, likelihood: 'medium' }
        ],
        modules: {
            payments: true,
            mass_payments: false,
            supplier_mgmt: true,
            tax_compliance: true,
            invoice_mgmt: true,
            purchase_orders: false,
            procurement: false,
            expense_mgmt: true,
            bill_pay: true,
            analytics: true
        }
    }
];

// Helper functions for data calculations
function calculateTotalWhitespace(account, viewType = 'products') {
    const items = account[viewType] || account.products;
    return items
        .filter(item => item.status === 'opportunity')
        .reduce((sum, item) => sum + item.value, 0);
}

function calculateCoverageScore(account, viewType = 'products') {
    const items = account[viewType] || account.products;
    const applicable = items.filter(item => item.status !== 'not_applicable');
    const adopted = items.filter(item => item.status === 'adopted');
    return applicable.length > 0 ? Math.round((adopted.length / applicable.length) * 100) : 0;
}

function calculatePriorityRank(accounts, accountId) {
    const sorted = [...accounts].sort((a, b) => {
        return calculateTotalWhitespace(b) - calculateTotalWhitespace(a);
    });
    return sorted.findIndex(a => a.id === accountId) + 1;
}

function formatCurrency(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value;
}

function getLikelihoodColor(likelihood) {
    switch (likelihood) {
        case 'high': return 'var(--color-success)';
        case 'medium': return 'var(--color-warning)';
        case 'low': return 'var(--color-text-muted)';
        default: return 'var(--color-primary)';
    }
}

function calculateModuleAdoption(account) {
    if (!account.modules) return { adopted: 0, total: MODULES.length };
    const adopted = Object.values(account.modules).filter(v => v === true).length;
    return { adopted, total: MODULES.length, percentage: Math.round((adopted / MODULES.length) * 100) };
}

function getModuleGaps(account) {
    if (!account.modules) return MODULES.map(m => m.id);
    return MODULES.filter(m => !account.modules[m.id]).map(m => m.id);
}
